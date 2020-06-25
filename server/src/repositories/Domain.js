import { env } from '../lib/env';
import Domain from '../models/Domain';
import Template from '../models/Template';
import MysqlDomain from "../models/mysql/Domain";
import MysqlSkin from "../models/mysql/Skin";
import { PageRepository } from './Page';
import { getEntityImages, downloadFile } from './Page';

export class DomainRepository {
  static async getDomainByHostname (hostname) {
    if (env.DOMAIN_POSTFIX) {
      hostname = hostname.replace(env.DOMAIN_POSTFIX, '');
    }

    const mysqlDomain = await MysqlDomain.findOne({ where: { url: hostname } });
    if (!mysqlDomain) {
      return;
    }

    let domain = await Domain.findOne({ oldId: mysqlDomain.id });
    if (!domain) {
      domain = new Domain();
      domain.name = hostname;
    }
    domain.oldId = mysqlDomain.id;
    domain.htmlHeadCode = mysqlDomain.html_head_code;

    domain.template = await DomainRepository.getTemplate(mysqlDomain.skin || '_default');
    domain.template = domain.template.toObject();

    const files = await getEntityImages(domain.oldId, 'domain');

    domain.logo = files.find(file => file.attachment_type === 'logo');
    if (domain.logo) {
      await downloadFile(domain.logo.MediaFile);
      domain.logo = domain.logo.MediaFile.dataValues;
    }

    if (mysqlDomain.index_page) {
      const indexPage = await PageRepository.getPageById(null, mysqlDomain.index_page);
      domain.indexPage = indexPage.toObject();
    }

    if (mysqlDomain.error_page) {
      const errorPage = await PageRepository.getPageById(null, mysqlDomain.error_page);
      domain.errorPage = errorPage.toObject();
    }

    await domain.save();
    return domain;
  }

  static async getTemplate (title) {
    const mysqlSkin = await MysqlSkin.findOne({ where: { title } });

    let template = await Template.findOne({ oldId: mysqlSkin.id });
    if (!template) {
      template = new Template();
      template.title = mysqlSkin.title;
    }
    template.cssContent = mysqlSkin.style;
    template.oldId = mysqlSkin.id;
    await template.save();
    return template;
  }
}
