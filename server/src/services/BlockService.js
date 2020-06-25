// import { logger } from '../lib/logger';
// import { env } from '../lib/env';

export default class BlockService {
  static getCode (block) {
    let compiled = block.compiled || {};

    return `<style>${compiled.css || block.source.cssCode}</style>${compiled.html || block.source.htmlCode}`;
  }
}
