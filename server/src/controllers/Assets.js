import _ from 'lodash';
// import sass from 'node-sass';
import cacheControl from 'koa-cache-control';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Template from '../models/Template';

export default
@controller('/api/v1/assets')
class AssetsCtrl {
  @get('/:_id/:type')
  async getTemplateCSS (ctx) {
    try {
      const { _id, type } = ctx.params;

      ctx.set('Content-Type', 'text/css; charset=utf-8');

      const template = await Template.findOne({ _id });
      if (!template) {
        ctx.body = '/* Template not found */';
        ctx.status = 404;
        return;
      }
      ctx.body = template.cssContent;
      return;

      const variables = template.variables;
      let scssCode = `$body-color: ${variables.bodyColor};` +
        `$enable-rounded: ${variables.enableRounded};` +
        `$enable-gradients: ${variables.enableGradients};` +
        `$font-size-base: ${variables.fontSizeBase / 16}rem;` +
        `$body-bg: ${variables.bodyBgColor};`;

      if (type === 'min') {
        scssCode += '@import "bootstrap/scss/functions";\n' +
          '@import "bootstrap/scss/variables";\n' +
          '@import "bootstrap/scss/mixins";\n' +
          '@import "bootstrap/scss/reboot";\n' +
          '@import "bootstrap/scss/type";\n' +
          '@import "bootstrap/scss/buttons";\n' +
          '@import "bootstrap/scss/nav";\n' +
          '@import "bootstrap/scss/navbar";\n' +
          '@import "bootstrap/scss/dropdown";\n' +
          '@import "bootstrap/scss/utilities";\n' +
          '@import "bootstrap/scss/grid";\n';
      } else {
        scssCode += '@import "bootstrap/scss/functions";\n' +
          '@import "bootstrap/scss/variables";\n' +
          '@import "bootstrap/scss/mixins";\n' +
          '@import "bootstrap/scss/images";\n' +
          '@import "bootstrap/scss/forms";\n';
      }

      ctx.noCache = false;
      ctx.cacheControl = {
        maxAge: 60
      };
      ctx.body = await compileSass(scssCode);
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}

function compileSass(data) {
  return new Promise((resolve, reject) => {
    sass.render({
      data,
      includePaths: [__dirname + '/../../resources']
    }, function(err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.css);
    });
  });
}
