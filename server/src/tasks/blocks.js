import html2png from 'html2png';
import { logger } from '../lib/logger';
import Block from '../models/Block';
import BlockService from '../services/BlockService';

export default {
  'block.render': renderBlock
};

export
async function renderBlock (service, { name, options }) {
  const block = await Block.findById(options._id);
  if (!block) {
    return;
  }
  logger.debug(`Generate preview for block "${block.title}"(${block._id})`);

  return new Promise((resolve, reject) => {
    try {
      const screenshot = html2png({ width: 640, height: 480, browser: 'chrome' });
      screenshot.render(BlockService.getCode(block), async (err, data) => {
        if (err) {
          throw new Error(err);
        }
        block.imagePreview = data;
        await block.save();

        screenshot.close();
        resolve();
      });
    } catch (err) {
      logger.error('Error while render', err);
      reject(err);
    }
  });
}
