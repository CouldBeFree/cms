import Grid from 'gridfs-stream';
import sizeOf from 'image-size';
import mongoose from 'mongoose';
import url from 'url';
import http from 'http';

import { logger } from '../lib/logger';
import Attribute from './models/Attribute';
import Category from './models/Category';
import Company from './models/Company';
import Infolist from './models/Infolist';
import Product from './models/Product';
import ProductAttribute from './models/ProductAttribute';
import User from './models/User';
import MediaFile from './models/MediaFile';
import EntityHasMediaFile from './models/EntityHasMediaFile';
import AttributeNoSql from '../models/Attribute';
import AttributesGroup from '../models/AttributesGroup';
import Account from '../models/Account';
import DataOwner from '../models/DataOwner';
import CategoryNoSql from '../models/Category';
import DataItem from '../models/DataItem';
import Folder from '../models/Folder';
import File from '../models/File';
import FolderRepo from '../repositories/FolderRepo';

export default {
  'migrate.fromold': migrateFromOld
};

const TEST_COMPANY = 338;

export
async function migrateFromOld (service, { name, options }) {
  logger.debug(`Start migration from old system`);

  await Account.deleteMany({ username: { $ne: 'admin' }, oldId: { $exists: true } });
  await Folder.deleteMany({ oldId: { $exists: true } });
  await File.deleteMany({ 'metadata.oldId': { $exists: true } });
  await DataItem.deleteMany({ oldId: { $exists: true } });
  await DataOwner.deleteMany({ oldId: { $exists: true } });
  await CategoryNoSql.deleteMany({ oldId: { $exists: true } });
  await AttributeNoSql.deleteMany({ oldId: { $exists: true } });
  await AttributesGroup.deleteMany({ oldId: { $exists: true } });

  const adminUser = await Account.findOne({ username: 'admin' });

  const users = await User.findAll({
    where: {}
  });
  for (const user of users) {
    const account = new Account({
      activated: true,
      owner: adminUser.owner,
      oldId: user.id,
      canSudo: user.user_type === 'admin',
      email: user.email,
      username: user.user_name,
      firstName: user.first_name,
      lastName: user.last_name,
      password: '-',
      salt: '-'
    });
    await account.save();
  }

  const companies = await Company.findAll({
    where: { id: TEST_COMPANY }
  });
  for (const company of companies) {
    await migrateCompany(company);
  }
  await Account.deleteMany({ owner: adminUser.owner, username: { $ne: 'admin' }, oldId: { $exists: true } });
}

async function migrateCompany(company) {
  let owner = await DataOwner.findOne({ oldId: company.id });
  if (!owner) {
    owner = new DataOwner();
    owner.oldId = company.id;
    owner.companyName = company.name;
  }
  await owner.save();
  await Account.updateMany({ oldId: company.user }, { $set: { owner: { _id: owner._id } } });

  const root = await FolderRepo.getRoot(owner._id);
  const folder = new Folder({
    owner,
    title: 'Products images',
    oldId: company.id
  });
  folder.parentId = root._id;
  await folder.save();

  const categories = await Category.findAll({
    where: { company: owner.oldId }
  });

  for (const category of categories) {
    await migrateCategory(category, owner, folder);
  }
  return owner;
}

async function migrateCategory(category, dataOwner, folder) {
  const parents = [];
  let curCategory = category;
  while (curCategory.father) {
    curCategory = await Category.findByPk(curCategory.father);

    if (curCategory.id === curCategory.father) {
      curCategory.father = null;
    }
    parents.push(curCategory.id);
  }
  parents.push(category.id);

  const attributes = await Attribute.findAll({
    where: { category: parents }
  });
  if (!attributes.length) {
    return;
  }

  const group = new AttributesGroup();
  group.oldId = category.id;
  group.owner = dataOwner;
  group.title = category.title || category.name;
  await group.save();

  group.attributes = [];
  for (const attr of attributes) {
    group.attributes.push(await migrateAttribute(attr, group, dataOwner));
  }
  await group.save();

  const infolists = await Infolist.findAll({
    where: { category: category.id }
  });
  for (const list of infolists) {
    await migrateInfolist(list, group, dataOwner, folder);
  }

  return group;
}

async function migrateInfolist(infolist, group, dataOwner, folder) {
  const category = new CategoryNoSql();
  category.oldId = infolist.id;
  category.owner = dataOwner;
  category.title = infolist.name || infolist.title;
  category.attributeGroups = [group];
  category.importSettings = { enabled:false, columns: [] }

  await category.save();

  const count = await Product.count({
    where: { infolist: infolist.id }
  });
  let limit = 100;   // number of records per page
  let offset = 0;
  let page = 1;
  let pages = Math.ceil(count / limit);

  for (var i = 0; i < pages; i++) {
    offset = limit * i;

    const products = await Product.findAll({
      where: { infolist: infolist.id },
      limit: limit,
      offset: offset
    });

    for (const product of products) {
      await migrateProduct(product, category, dataOwner, folder);
    }
  }

  return category;
}

async function migrateProduct(product, category, dataOwner, folder) {
  const item = new DataItem();
  item.oldId = product.id;
  item.sku = product.id;
  item.owner = dataOwner;
  item.title = product.name || 'No title';
  item.category = category;

  await item.save();

  const files = await EntityHasMediaFile.findAll({
    where: { entity: product.id, entity_type: 'product' },
    include: [{
      model: MediaFile
    }]
  });
  const images = await Promise.all(files.map(image => {
    return downloadFile(dataOwner._id, image.MediaFile, folder);
  }));
  item.images = images;

  const attrs = await ProductAttribute.findAll({
    where: { product: product.id }
  });
  for (const attr of attrs) {
    const attribute = await AttributeNoSql.findOne({ oldId: attr.attribute });
    if (!attribute) {
      throw new Error(`Attribute not found ${attr.attribute}`);
    }
    item.attributes.push({
      _id: attribute._id,
      isIgnored: false,
      value: attr.value,
      numValue: +attr.value || null
    });
  }

  await item.save();
  return item;
}

async function migrateAttribute(attribute, group, dataOwner) {
  const attr = new AttributeNoSql();
  attr.oldId = attribute.id;
  attr.owner = dataOwner;
  attr.title = attribute.name || 'No title';
  attr.label = attribute.title;
  attr.suffix = attribute.suffix;

  if (attribute.type === 'boolean') {
    attr.dataType = 'switch';
  } else if (attribute.type === 'number') {
    attr.dataType = 'number';
  } else if (attribute.type === 'list') {
    attr.dataType = 'multi-select';
  } else if (attribute.type === 'char') {
    switch (attribute.format) {
      case '':
        attr.dataType = 'short-text';
        break;
      case 'link':
        attr.dataType = 'link';
        break;
      case 'rich text':
        attr.dataType = 'richtext';
        break;
      case 'youtube':
        attr.dataType = 'video';
        break;
    }
  }
  attr.attributeGroup = group;

  await attr.save();
  return attr;
}


const ROOT_COLLECTION = 'cms';
async function downloadFile(ownerId, file, folder) {
  let gfs = new Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection(ROOT_COLLECTION);

  let writestream = gfs.createWriteStream({
    root: ROOT_COLLECTION,
    filename: `${file.name}`,
    metadata: {
      oldId: file.id,
      folderId: folder._id,
      owner: { _id: ownerId },
      mimetype: file.mime,
      width: null,
      height: null,
      imageType: null
    }
  });


  let imgUrl = `http://file.biznestream.biz/${file.id}/${encodeURIComponent(file.name)}`;
  console.info(imgUrl);
  let options = url.parse(imgUrl);
  let chunks = [];

  return new Promise((success) => {
    http.get(options, (response) => {
      response.on('data', (chunk) => {
        chunks.push(chunk);
        writestream.write(chunk);
      }).on('end', () => {
        writestream.end();
      });
    });

    writestream.on('close', async() => {
      const buffer = Buffer.concat(chunks);
      let size;

      try {
        size = sizeOf(buffer);
        gfs.files.update({_id: writestream.id}, {
          $set: {
            'contentType': `image/${size.type}`,
            'metadata.width': size.width,
            'metadata.height': size.height,
            'metadata.imageType': size.type,
          }
        }, async(err, data) => {
          console.info(err);
          let savedFile = await gfs.files.findOne({_id: writestream.id});
          savedFile.width = savedFile.metadata.width;
          savedFile.height = savedFile.metadata.height;
          // console.log('savedFile', savedFile);
          success(savedFile);
        });
      } catch (e) {
        success(await gfs.files.findOne({_id: writestream.id}));
      }
    });
  });
}

