// https://support.plytix.com/article/attribute-types/

/**
 * Short Text
 * This provides a short text input.
 *
 * Filter Type:
 *  Search by specific text
 *  https://support.plytix.com/wp-content/uploads/2017/03/product-filter-short-text.png
 * @type {string}
 */
export const PLAINTEXT_TYPE = 'plaintext';
export const PARAGRAPH_TYPE = 'paragraph';
export const MULTI_SELECT = 'multi-select';
export const RADIO_SELECT = 'drop-down';
export const SHORT_TEXT = 'short-text';

/**
 * Paragraph
 * This provides a larger space that you can input a block of text.
 * @type {string}
 */
export const RICHTEXT_TYPE = 'richtext';
export const IMAGE_TYPE = 'image';
export const VIDEO_TYPE = 'video';
export const LINK_TYPE = 'link';
export const NUMBER_TYPE = 'number';
export const DATETIME_TYPE = 'datetime';
export const SWITCH_TYPE = 'switch';
export const OPTION_TYPE = 'option';
export const LIST_TYPE = 'list';
export const SEPARATOR_TYPE = 'separator';
export const DECIMAL = 'decimal';
export const GALLERY = 'gallery';

export const ALL_TYPES = [
  PLAINTEXT_TYPE,
  RICHTEXT_TYPE,
  IMAGE_TYPE,
  VIDEO_TYPE,
  LINK_TYPE,
  NUMBER_TYPE,
  DATETIME_TYPE,
  SWITCH_TYPE,
  OPTION_TYPE,
  LIST_TYPE,
  SEPARATOR_TYPE,
  RADIO_SELECT,
  MULTI_SELECT,
  PARAGRAPH_TYPE,
  SHORT_TEXT,
  DECIMAL,
  GALLERY
];
export const ALL_ATTRIBUTE_TYPES = [
  { key: 'short-text', title: 'Short Text' },
  { key: 'paragraph', title: 'Paragraph' },
  { key: 'drop-down', title: 'Drop-down' },
  { key: 'multi-select', title: 'Multi-Select' },
  { key: DATETIME_TYPE, title: 'Date' },
  { key: NUMBER_TYPE, title: 'Number (Integer)' },
  { key: 'decimal', title: 'Number (Decimal)' },
  { key: LINK_TYPE, title: 'URL' },
  { key: SWITCH_TYPE, title: 'True/False (Boolean)' },
  { key: IMAGE_TYPE, title: 'Media (Single)' },
  { key: 'gallery', title: 'Media Gallery' },
  { key: RICHTEXT_TYPE, title: 'Rich Text' },
  { key: SEPARATOR_TYPE, title: 'Separator' },
  { key: VIDEO_TYPE, title: 'Video' }
];
export const WITH_VALUES_TYPES = [OPTION_TYPE];

export function isTypeWithValues (type) {
  return WITH_VALUES_TYPES.indexOf(type) !== -1;
}

export const SYSTEM_ATTRIBUTES = [
  { _id: 'title', label: 'Title', dataType: 'short-text' },
  { _id: 'sku', label: 'SKU', dataType: 'short-text' },
  { _id: 'mainImage', label: 'Main image', dataType: 'image' },
  { _id: 'images', label: 'Images', dataType: 'gallery', isMultiple: true }
];
