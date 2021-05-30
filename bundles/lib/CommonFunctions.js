'use strict';

/**
 * General functions used on the ranvier-input-events bundle
 */

const { Config } = require('ranvier');
const wrap = require('wrap-ansi');

/**
 * @param {string} name
 * @return {boolean}
 */
exports.validateName = function (name) {
  const maxLength = Config.get('maxAccountNameLength');
  const minLength = Config.get('minAccountNameLength');

  if (!name) {
    return 'Please enter a name.';
  }
  if (name.length > maxLength) {
    return 'Too long, try a shorter name.';
  }
  if (name.length < minLength) {
    return 'Too short, try a longer name.';
  }
  if (!/^[a-z]+$/i.test(name)) {
    return 'Your name may only contain A-Z without spaces or special characters.';
  }
  return false;
};

exports.pronounify = function(gender, tense, type) {return this.pronouns[gender][tense][type] || 'error!'};
exports.pronouns = {
  ['male']: {
    'first': { 'subject': 'i', 'object': 'me', 'posessive': 'my', 'possessive-pronoun': 'mine', 'reflexive': 'myself' },
    'second': { 'subject': 'you', 'object': 'you', 'possessive': 'your', 'posessive-pronoun': 'yours', 'reflexive': 'yourself' },
    'third': { 'subject': 'he', 'object': 'him', 'possessive': 'his', 'posessive-pronoun': 'his', 'reflexive': 'himself' },
  },
  ['female']: {
    'first': { 'subject': 'i', 'object': 'me', 'posessive': 'my', 'possessive-pronoun': 'mine', 'reflexive': 'myself' },
    'second': { 'subject': 'you', 'object': 'you', 'possessive': 'your', 'posessive-pronoun': 'yours', 'reflexive': 'yourself' },
    'third': { 'subject': 'she', 'object': 'her', 'possessive': 'her', 'posessive-pronoun': 'hers', 'reflexive': 'herself' },
  }
};
exports.capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

exports.tokenizer = function(msg, nTokens) {
  var token = /(\S+)\s*/g, tokens = [], match;

  while (nTokens && (match = token.exec(msg))) {
      tokens.push(match[1]);
      nTokens -= 1; // or nTokens--, whichever is your style
  }

  if (nTokens) {
      // exec() returned null, could not match enough tokens
      throw new Error('EOL when reading tokens');
  }
  
  tokens.push(msg.slice(token.lastIndex));
  return tokens;
}

exports.formatBigText = function(message, width = 80) {
  let lStr = this.stripNewlines(message);
  lStr = wrap(lStr, width,{'trim':false});
  lStr = lStr.replace(/\n\s+/g, '\n');
  return lStr;
}

exports.stripNewlines = function (message) {
  return message.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
}
exports.fixNewlines = function(message) {
  // Fix \n not in a \r\n pair to prevent bad rendering on windows
  message = message.replace(/\r\n/g, '<NEWLINE>').split('\n');
  message = message.join('\r\n').replace(/<NEWLINE>/g, '\r\n');
  // fix sty's incredibly stupid default of always appending ^[[0m
  return message.replace(/\x1B\[0m$/, '');
}
