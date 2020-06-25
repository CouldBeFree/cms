import _ from 'lodash';
import url from 'url';
import { logger } from '../lib/logger'
import { env } from '../lib/env'
import ImportJob from '../models/ImportJob';
import Product from '../models/DataItem';
import Category, { STATUS_NEW, STATUS_ERROR, STATUS_INPROCESS, STATUS_DONE } from '../models/Category';
import { saveFileFromStream, unzipFileInDb } from "../lib/files";
import { getFileStream } from "../helpers/files";
import { parseCSVStream, parseCSVStreamItem } from "../helpers/csv";
import AttributesGroup from "../models/AttributesGroup";
import Attribute from "../models/Attribute";
import PromiseFtp from 'promise-ftp';

export default {
  'import.start': importProducts
};

// Migrate domain tokens from mysql database to mongodb
export
async function importProducts(service, {name, options}) {
  const socketService = service.socketService;
  const importJob = await ImportJob.findById(options._id);
  let category;

  if (!importJob) {
    return; // no jobs for import
  }
  logger.debug('Found job ' + importJob._id);
  try {
    category = await Category.findOne({ _id: importJob.category._id });
    if (!category) {
      throw new Error(`Category ${importJob.category._id} not found`);
    }
    const { importSettings } = category;
    if (!importSettings.enabled) {
      throw new Error('Import not enabled for this category');
    }
    if (importSettings.importUrl && !importJob.files.length) {
      setStatus(`Downloading ${importSettings.importUrl}...`, STATUS_INPROCESS, 1);
      const file = await downloadLastFtpFile(importSettings.importUrl);
      setStatus(`Downloaded`, STATUS_INPROCESS, 5);

      importJob.files = [file];
    }

    await runImportFromFile(category, importJob, setStatus);
  } catch (err) {
    await setStatus(err.message, STATUS_ERROR, 0);
    logger.error('Error while import', err);
  }

  async function setStatus (text, state, perc = 0) {
    console.info(text);
    socketService.sendToAccount('5d05ef625a31cd8d6c71b621', 'import.status', { importJobId: importJob._id, categoryId: category._id, state, text, perc });
    await ImportJob.update({ _id: importJob._id }, { $set: { currentStatus: { state, text, perc } } });
    await Category.update({ _id: category._id }, { $set: { 'importSettings.currentStatus': { state, text, perc } } });
  }
}


async function runImportFromFile(category, importJob, setStatus) {
  await setStatus('Start import...', STATUS_INPROCESS, 5);

  let file = importJob.files[0];
  if (file.filename.match(/.zip$/i)) {
    await setStatus(`Unzipping ${file.filename}...`, STATUS_INPROCESS, 6);
    const files = await unzipFileInDb(file);

    importJob.files = [file, ...files];
    await importJob.save();

    await setStatus(`Unzipped successfully ${file.filename}.`, STATUS_INPROCESS, 7);

    file = _.find(files, file => {
      return file.filename.match(/.csv$/i);
    })
  }
  if (!file || !file.filename.match(/.csv$/i)) {
    return await setStatus(`CSV file not found.`, STATUS_ERROR, 100);
  }

  await setStatus(`Parsing ${file.filename}...`, STATUS_INPROCESS, 8);
  const stream = await getFileStream(file._id);
  if (!stream) {
    return await setStatus(`CSV file not found on database.`, STATUS_ERROR, 100);
  }

  const groupsIds = _.map(category.attributeGroups, '_id');
  const attributes = await Attribute.find({
    'attributeGroup._id': { $in: groupsIds },
    removed: { $exists: false }
  }).lean();

  importJob.createdCount = 0;
  importJob.updatedCount = 0;

  await parseCSVStreamItem(stream, async (item) => {
    const product = await productFromItem(item, category, attributes);

    console.info(product);
    if (product) {
      try {
        product.owner = importJob.owner;
        await product.save();
      } catch (err) {
        console.info(err)
        return await setStatus(err.message, STATUS_ERROR, 100);
      }
    }
  });

  await setStatus(`Completed. Created: ${importJob.createdCount}. Updated: ${importJob.updatedCount}`, STATUS_DONE, 100);

  async function productFromItem (item, category, attributes) {
    const { importSettings } = category;
    const { columns } = importSettings;
    let columnSku = columns.findIndex(item => item && item._id === 'sku');
    const sku = item[columnSku];

    if (!sku) {
      return null;
    }

    let product = await Product.findOne({ sku, 'category._id': category._id, removed: { $exists: false } });

    if (!product) {
      product = new Product({
        sku,
        category: category.toObject(),
        attributes: []
      });
      importJob.createdCount++;
    } else {
      importJob.updatedCount++;
    }

    let images = [];
    for (let index in columns) {
      if (!columns.hasOwnProperty(index)) {
        return;
      }
      let value = item[parseInt(index)];
      if (value === '') {
        continue;
      }

      const columnName = columns[index] && columns[index]._id;
      switch (columnName) {
        case 'title':
          product.title = value;
          break;
        case 'sku':
          product.sku = value;
          break;
        case 'mainImage': {
          const image = await getProductImage(value);
          if (image) {
            images = [image, ...images];
          }
          break;
        }
        case 'images': {
          const image = await getProductImage(value);
          if (image) {
            images.push(image);
          }
          break;
        }
        default:
          const attribute = _.find(attributes, attribute => attribute._id.equals(columnName));
          if (!attribute) {
            continue;
          }
          let attr = _.find(product.attributes, attrib => attribute._id.equals(attrib._id));
          switch (attribute.dataType) {
            case 'image':
            case 'gallery':
              let images = Array.isArray(attr && attr.value) ? attr.value : [];
              const image = await getProductImage(value);
              if (image) {
                images.push(image);
              }
              value = images;
              break;
          }
          if (!attr) {
            attr = {
              _id: attribute._id,
              value,
              isIgnored: false
            };
            product.attributes.push(attr);
          }
          attr.value = value;
          const numValue = parseFloat(value);
          if (!isNaN) {
            attr.numValue = numValue;
          }
      }

      // console.info(`${index} => ${columns[index]}: ${value}`)
    }
    product.images = images;
    return product;
  }

  function getProductImage (imageValue) {
    const file = _.find(importJob.files, { filename: imageValue });
    return file;
  }
}


async function downloadLastFtpFile(ftpUrl) {
  const urlDetails = url.parse(ftpUrl);

  if (urlDetails.protocol === 'ftp:') {
    const [user, password] = urlDetails.auth.split(':');

    const ftp = new PromiseFtp();
    const serverMessage = await ftp.connect({
      ...urlDetails,
      user,
      password
    });
    const list = await ftp.list();
    const zipFile = _.orderBy(list, 'date').find(file => file.name.match(/\.zip$/i));
    if (!zipFile) {
      throw new Error('Zip file not found')
    }
    const stream = await ftp.get(zipFile.name);
    return saveFileFromStream(stream, zipFile.name);
  }
}
