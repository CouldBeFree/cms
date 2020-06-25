const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/gm;
const FTPURL_REGEXP = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;
const LINK_URL_REGEXP = /(http[s]?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}[.]{0,1}/gi;
const HTML_MARKUP_REGEXP = /<\s*[a-z]+[^>]*>/gi;
const LINKED_IN_REGEXP = /(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)?[^\s]*/gi;
const SPECIAL_CHARS_REGEXP = /^[\w_\-+~,/\\:'"().&*|[\]?# ]+$/i;
const GREETINGS_REGEXP = /\b(dr|mr|mister|mrs|ms|miss|sir|hello|hi)\b/i;
const PHONE_REGEXP = /(\+?\(?\+?[0-9]{1,3}\)?[-. ]+([0-9]{2,4})[-. ]?([0-9]{3,5}))|\+?[0-9]{7,}/gi;

export function lengthValidation(length, message = `Must be less than ${length} characters.`) {
  return v => !v || !!(v.length <= length) || message;
}

export function minLengthValidation(length, message = `Must be more than ${length} characters.`) {
  return v => !v || !!(v.length >= length) || message;
}

export function urlValidation(message = 'Please enter valid URL.') {
  return v => !v || !!v.toString().match(URL_REGEXP) || message;
}

export function ftpUrlValidation(message = 'Please enter valid URL.') {
  return v => !v || !!v.toString().match(FTPURL_REGEXP) || message;
}

export function emptyValidation(message = 'This field is required.') {
  return v => !!v || message;
}

export function preventStuffingValidation(message = 'This isn\'t a valid description.') {
  return v => !v || (v.replace(/(.{4,}?)(?:\1{5,})/g, (text, subtext) => /^(\s*(<(\/?[^>]+)>|&nbsp;|[^\s]{0,3})\s*|(.)\4+)$/.test(subtext) ? text : '') === v) || message;
}

export function preventUrlsValidation(message = 'Links are not allowed in this field.') {
  return v => !v || !v.match(LINK_URL_REGEXP) || message;
}

export function preventHtmlValidation(message = 'Please don\'t use HTML markup') {
  return v => !v || !v.match(HTML_MARKUP_REGEXP) || message;
}

export function preventLinkedinValidation(message = 'Before you continue, make sure your profile does not include your LinkedIn contact information.') {
  return v => !v || !v.match(LINKED_IN_REGEXP) || message;
}

export function preventCapitalsValidation(message = 'Too many capital letters.') {
  return v => !v || !(v.replace(/[A-Z]/g, '').length < v.length / 2) || message;
}

export function preventSpecialCharsValidation(message = 'Your title cannot include special characters like >, ;, !, @, $, %, ^, =, {, }.') {
  return v => !v || !!v.match(SPECIAL_CHARS_REGEXP) || message;
}

export function preventGreetingsValidation(message = 'Your title should describe the work you do.') {
  return v => !v || !v.match(GREETINGS_REGEXP) || message;
}

export function preventPhoneValidation(message = 'Please remove any phone number from this field.') {
  return v => !v || !v.match(PHONE_REGEXP) || message;
}

export function allowDigitsOnlyValidation(message = 'This field must contains digits.') {
  return v => !v || !!v.match(/^\d+$/) || message;
}
