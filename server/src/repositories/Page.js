import { Op } from 'sequelize';
import fs from 'fs';
import url from 'url';
import slugify from 'slugify';
import http from 'http';
import Domain from '../models/Domain';
import Page from '../models/Page';
import Block from '../models/Block';
import MysqlDomain from "../models/mysql/Domain";
import MysqlPage from "../models/mysql/Page";
import MysqlWidget from "../models/mysql/Widget";
import MysqlSection from "../models/mysql/Section";
import MysqlEntityHasMediaFile from "../models/mysql/EntityHasMediaFile";
import MysqlMediaFile from "../models/mysql/MediaFile";
import MysqlSectionParameter from "../models/mysql/SectionParameter";
import MysqlMenu from "../models/mysql/Menu";

export class PageRepository {
  static async getErrorPage (domainId, url) {
    let domain = await Domain.findById(domainId);
    if (!domain) {
      throw new Error('Domain not found')
    }
    if (domain.errorPage) {
      return await Page.findById(domain.errorPage._id);
    }
    return null;
  }

  static async getPageByUrl (domainId, url) {
    let domain = await Domain.findById(domainId);
    if (!domain) {
      throw new Error('Domain not found')
    }

    if (url === '') {
      if (domain.indexPage) {
        return await Page.findById(domain.indexPage._id);
      }
      return null;
    }

    url = urldecode(url);
    const mysqlPage = await MysqlPage.findOne({
      where: {
        [Op.or]: [
          { title: { [Op.like]: url } },
          { permalink: { [Op.like]: url } }
        ],
        domain: domain.oldId
      }
    });

    if (!mysqlPage) {
      return;
    }

    return await PageRepository.getPageById(null, mysqlPage.id);

    function urldecode (str) {
      return decodeURIComponent((str + '').replace(/\+/g, '%20'));
    }
  }

  static async getPageById (pageId, oldId) {
    const mysqlPage = await MysqlPage.findByPk(oldId, {
      include: [{
        model: MysqlWidget
      }, {
        model: MysqlSection,
        include: [{
          model: MysqlSectionParameter
        }]
      }]
    });
    if (!mysqlPage) {
      return;
    }

    let page = await Page.findOne({ oldId: mysqlPage.id });
    if (!page) {
      page = new Page({ oldId: mysqlPage.id });
    }
    page.name = mysqlPage.name;
    page.title = mysqlPage.title;
    page.slug = mysqlPage.permalink;
    page.metaTitle = mysqlPage.meta_title;
    page.metaDescription = mysqlPage.descr;
    page.pageLayout = mysqlPage.template;
    page.hideH1 = mysqlPage.hide_h1;
    page.noindex = mysqlPage.noindex;
    page.headScript = mysqlPage.head_script;

    let blocks = [];
    for (let widget of mysqlPage.Widgets) {
      const block = await PageRepository.getBlock(widget.template, widget.id);
      let files = await getEntityImages(widget.id, 'widget');
      if (files.length) {
        files = files.map(async (file) => {
          const plainFile = file.dataValues;
          const plainMediaFile = plainFile.MediaFile.dataValues;
          await downloadFile(plainMediaFile);
          delete plainFile.MediaFile;
          return { ...plainFile, ...plainMediaFile };
        });
        files = await Promise.all(files);
      }
      const parameters = {
        widgetId: widget.id,
        name: widget.name,
        title: widget.title,
        link: widget.image_link,
        text: widget.text,
        buttonCaption: widget.button_caption,
        files
      };

      blocks.push({
        ...block.toObject(),
        parameters,
        placement: widget.PageWidget.placement,
        sequence: widget.PageWidget.sequence,
        blockId: `widget-${widget.id}`
      });
    }

    for (let section of mysqlPage.Sections) {

      const block = await PageRepository.getBlock(section.template, section.id);
      let files = await getEntityImages(section.id, 'section');
      if (files.length) {
        files = files.map(async (file) => {
          const plainFile = file.dataValues;
          const plainMediaFile = plainFile.MediaFile.dataValues;
          await downloadFile(plainMediaFile);
          delete plainFile.MediaFile;
          return { ...plainFile, ...plainMediaFile };
        });
        files = await Promise.all(files);
      }
      const parameters = {
        sectionId: section.id,
        name: section.name,
        title: section.title,
        description: section.descr,
        link: await PageRepository.getLink(section.image_link),
        text: section.text,
        html: section.html,
        buttonCaption: section.button_caption,
        files
      };
      for (let param of section.SectionParameters) {
        parameters[param.name] = param.value;
      }
      blocks.push({
        ...block.toObject(),
        parameters,
        placement: 'page',
        sequence: section.sequence,
        blockId: `section-${section.id}`
      });
    }
    page.blocks = blocks;

    // const widgets = await PageRepository.getWidgets(mysqlPage.id);

    await page.save();
    return page;
  }

  static async getBlock (template, oldId) {
    template = template || 'default';
    let block = await Block.findOne({ title: template });
    if (!block) {
      block = new Block({ title: template });
    }
    block.oldId = oldId;
    await block.save();

    return block;
  }

  static async getMenu (domainId, type) {
    let domain = await Domain.findById(domainId);
    if (!domain) {
      throw new Error('Domain not found')
    }

    let items = await MysqlMenu.findAll({
      raw: true,
      where: { domain: domain.oldId, menu_group: type },
      order: [ ['sequence','ASC' ]]
    });

    items = await Promise.all(items.map(async(item) => {
      item.link = item.link && await PageRepository.getLink(item.link);
      return item;
    }));

    return list_to_tree(items);

    function list_to_tree(list) {
      var map = {}, node, roots = [], i;
      for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i; // initialize the map
        list[i].children = []; // initialize the children
      }
      for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parent) {
          // if you have dangling branches check that map[node.parentId] exists
          list[map[node.parent]].children.push(node);
        } else {
          roots.push(node);
        }
      }
      return roots;
    }
  }

  static async getLink(link) {
    if (!link) {
      return null;
    }
    const [type, id] = link.split('|');
    switch (type) {
      case 'page':
        const page = await MysqlPage.findByPk(id);
        if (!page) {
          return 'javascript:;';
        }

        return '/' + (page.permalink || (slugify(page.title, { replacement: '_', lower: true })));
      case 'url':
        return id;
      default:
        throw new Error(`Unknown link type ${link}`)
    }
  }
}

export async function getEntityImages (id, type) {
  return await MysqlEntityHasMediaFile.findAll({
    where: { entity: id, entity_type: type },
    include: [MysqlMediaFile]
  });
}


export async function downloadFile (file) {
  let writestream = fs.createWriteStream(`uploads/${file.id}`);

  let imgUrl = `http://file.biznestream.biz/${file.id}/${encodeURIComponent(file.name)}`;
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

    writestream.on('close', async () => {
      const buffer = Buffer.concat(chunks);
      let size;

      try {
        //size = sizeOf(buffer);
        /*gfs.files.update({_id: writestream.id}, {
          $set: {
            'metadata.width': size.width,
            'metadata.height': size.height,
            'metadata.imageType': size.type,
          }
        }, async(err, data) => {
          let savedFile = await gfs.files.findOne({_id: writestream.id});
          savedFile.width = savedFile.metadata.width;
          savedFile.height = savedFile.metadata.height;
          // console.log('savedFile', savedFile);
          success(savedFile);
        });*/
      } catch (e) {
      }
      success();
    });
  });
}
