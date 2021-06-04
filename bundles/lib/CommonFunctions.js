'use strict';

/**
 * General functions used on the ranvier-input-events bundle
 */

const { Config, BroadcastSystem: B } = require('ranvier');
const { Logger } = require('winston');
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

exports.pronounify = function (gender, tense, type) { return this.pronouns[gender][tense][type] || 'error!' };
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
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

exports.getCurrentDateString = function () {
  let date_ob = new Date();

  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = (monthNames[date_ob.getMonth()]);
  let year = date_ob.getFullYear();
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);

  return `${date} ${month} ${hours}:${minutes}`
}
exports.tokenizer = function (msg, nTokens) {
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

exports.formatBigText = function (message, width = 80) {
  let lStr = this.stripNewlines(message);
  lStr = wrap(lStr, width, { 'trim': false });
  lStr = lStr.replace(/\n\s+/g, '\n');
  return lStr;
}

exports.stripNewlines = function (message) {
  return message.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
}

exports.fixNewlines = function (message) {
  // Fix \n not in a \r\n pair to prevent bad rendering on windows
  message = message.replace(/\r\n/g, '<NEWLINE>').split('\n');
  message = message.join('\r\n').replace(/<NEWLINE>/g, '\r\n');
  // fix sty's incredibly stupid default of always appending ^[[0m
  return message.replace(/\x1B\[0m$/, '');
}

exports.line = function (width, fillChar = "-", color = null) {
  let openColor = '';
  let closeColor = '';
  if (color) {
    openColor = `${color}`;
    closeColor = `{x`;
  }
  return openColor + (new Array(width + 1)).join(fillChar) + closeColor;
}

exports.printInitialBufferHelp = function (type, player) {
  B.sayAt(player, `You are now editing your ${type}.`);
  B.sayAt(player, '+' + this.line(78, '-') + '+');
  B.sayAt(player, '| {WEditor help:{x                                                                 |', '', '', 90);
  B.sayAt(player, '| The following can be typed on an empty line:                                 |', '', '', 90);
  B.sayAt(player, '|                                                                              |', '', '', 90);
  B.sayAt(player, '|    {W.h{x : help                                                                 |', '', '', 90);
  B.sayAt(player, '|    {W.f{x : format the buffer                                                    |', '', '', 90);
  B.sayAt(player, '|    {W.c{x : clears the buffer                                                    |', '', '', 90);
  B.sayAt(player, '|    {W.s{x : show the buffer         {W.dl{x <line number>        : delete a line     |', '', '', 90);
  B.sayAt(player, '|    {W.q{X : abort and exit          {W.il{x <line number> <text> : insert a line     |', '', '', 90);
  B.sayAt(player, '|     {W@{x : save and exit           {W.rl{x <line number> <text> : replace a line    |', '', '', 90);
  B.sayAt(player, '+' + this.line(78, '-') + '+');
}

exports.printNoteList = function (board, player) {
  let notes = board.getAllNotes(player);

  B.sayAt(player, '+' + this.line(78, '-') + '+');
  B.sayAt(player, '| Number | Date/Time    | Author        | Subject                              |');
  B.sayAt(player, '+' + this.line(78, '-') + '+');

  notes.forEach(note => {
    B.sayAt(player, `| ${this.stringTrimmer
      (note.number.toString(), 6).padEnd(6)} | ${note.dateWritten} | ${this.stringTrimmer(note.from, 13).padEnd(13)} | ${this.stringTrimmer(note.subject, 36).padEnd(36)} |`);
  });
  B.sayAt(player, '+' + this.line(78, '-') + '+');
}
exports.printBufferHelp = function (type, player) {
  B.sayAt(player, '+' + this.line(78, '-') + '+');
  B.sayAt(player, '| ~ Editor help ~                                                              |', '', '', 90);
  B.sayAt(player, '+' + this.line(78, '-') + '+');
  B.sayAt(player, `You are currently in the ${type} editor.`, '', '', 90);
  B.sayAt(player, '', '', '', 90);
  B.sayAt(player, 'Aside from commands starting with a period, or the \'@\' command, any text that', '', '', 90);
  B.sayAt(player, 'you send will be added to the buffer.', '', '', 90);
  B.sayAt(player, '', '', '', 90);
  B.sayAt(player, 'The following commands are available:', '', '', 90);
  B.sayAt(player, '   .c  : clears the entire buffer', '', '', 90);
  B.sayAt(player, '   .dl : deletes the specified line (for example, "{G.dl 3{x" deletes line number 3)', '', '', 90);
  B.sayAt(player, '   .f  : neatly formats the buffer\'s contents', '', '', 90);
  B.sayAt(player, '   .h  : shows this help message', '', '', 90);
  B.sayAt(player, '   .il : inserts a line (for example, "{G.il 1 This is the new first line.{x")', '', '', 90);
  B.sayAt(player, '   .q  : quits the editor without saving your changes', '', '', 90);
  B.sayAt(player, '   .rl : replaces a line (for example, "{G.rl 1 This replaces line 1.{x")', '', '', 90);
  B.sayAt(player, '   .s  : shows the current contents of the buffer', '', '', 90);
  B.sayAt(player, '    @  : saves your changes and quits the editor', '', '', 90);
  B.sayAt(player, '', '', '', 90);
  B.sayAt(player, 'If you are confused, type .q to abort without changing anything.', '', '', 90);
}
exports.stringTrimmer = function (string, length) {
  if (!string) { string = 'No Subject' };
  var trimmedString = string.length > length ? string.substring(0, length - 3) + "..." : string;
  return trimmedString;
}

exports.editorLambda = function (args, player, arg0, extraArgs) {
  let commandState = null;
  let accumulator = [];
  let subCommand = null;
  let typeOfBuffer = 'generic';

  if (extraArgs) {
    commandState = extraArgs.state || null;
    accumulator = extraArgs.accumulator || [];
    subCommand = extraArgs.subCmd || args;
    typeOfBuffer = extraArgs.typeOfBuffer || 'generic';
  }


  if (!commandState) {
    Logger.verbose("This is probably an error from editorLambda.  It has no state.")
  }

  switch (commandState) {
    case 'starting': {
      this.printInitialBufferHelp(typeOfBuffer, player);

      if (accumulator && accumulator.length > 0) {
        accumulator.forEach((element, index) => { B.sayAt(player, `{w[{W${(index + 1).toString().padStart(3)}{w]{x ${element}`) });
      }

      B.at(player, `{W>{x `);
      return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };

    }
    case 'writing': {
      if (args.toLowerCase() === '@') {
        B.sayAt(player, `Exiting the ${typeOfBuffer} buffer.`);
        return { 'state': 'finishing', 'accumulator': accumulator };
      }
      else if (args.toLowerCase() === '.h') {
        this.printBufferHelp(typeOfBuffer, player);
        B.at(player, '{W>{x ');
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
      else if (args.toLowerCase() === '.c') {
        accumulator = [];

        B.sayAt(player, `Cleared the ${typeOfBuffer} buffer.`);
        B.at(player, '{W>{x ');
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
      else if (args.toLowerCase() === '.s') {
        accumulator.forEach((element, index) => { B.sayAt(player, `{w[{W${(index + 1).toString().padStart(3)}{w]{x ${element}`) });

        B.at(player, '{W>{x ');
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
      else if (args.toLowerCase() === '.q') {
        B.sayAt(player, "Aborting your changes and exiting the buffer.");
        accumulator = [];
      }
      else if (args.toLowerCase() === '.f') {
        let newBuffer = [], element = null;

        while (typeof (element = accumulator.shift()) !== 'undefined') {
          let wrappedString = this.formatBigText(element, 80).replace(/  /g, ' ');

          if (wrappedString !== '' && wrappedString.length < 65 && accumulator.length > 0 && accumulator[0] !== '') {
            wrappedString = wrappedString + ' ' + accumulator.shift();
            wrappedString = this.formatBigText(wrappedString, 80);
            wrappedString = wrappedString.replace(/  /g, ' ');
          }

          let subBuffer = wrappedString.split('\n');
          newBuffer.push(subBuffer[0]);

          if (subBuffer.length > 1) {
            let finalString = subBuffer.slice(1).join(' ');
            let finalAddendum = accumulator.shift();

            if (finalAddendum && finalAddendum !== '') {
              accumulator.unshift(finalString + ' ' + finalAddendum);
              continue;
            }
            if (finalAddendum) {
              accumulator.unshift(finalAddendum);
            }
            accumulator.unshift(finalString);
          }
        }

        accumulator = newBuffer;
        B.sayAt(player, 'Formatted the current buffer.');
        accumulator.forEach((element, index) => { B.sayAt(player, `{w[{W${(index + 1).toString().padStart(3)}{w]{x ${element}`) });

        B.at(player, '{W>{x ');
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
      else if (args.toLowerCase().startsWith('.il')) {
        if (args.split(' ').length <= 1) {
          B.sayAt(player, 'Please provide a line number.')
          B.at(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
        }
        let [cmd, lineNum, text] = this.tokenizer(args, 2);

        if (lineNum.match(/[^[\d]+/) || isNaN(parseInt(lineNum)) || parseInt(lineNum) <= 0 || parseInt(lineNum) > accumulator.length) {
          B.sayAt(player, 'First argument needs to be a valid line number.');
          B.at(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
        }

        accumulator.splice(lineNum - 1, 0, text);

        B.sayAt(player, `New text inserted at line number ${lineNum}.`)
        B.at(player, '{W>{x ');
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
      else if (args.toLowerCase().startsWith('.dl')) {
        if (args.split(' ').length <= 1) {
          B.sayAt(player, 'Please provide a line number.')
          B.at(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
        }
        let [cmd, lineNum, text] = this.tokenizer(args, 2);

        if (lineNum.match(/[^[\d]+/) || isNaN(parseInt(lineNum)) || parseInt(lineNum) <= 0 || parseInt(lineNum) > accumulator.length) {
          B.sayAt(player, 'First argument needs to be a valid line number.');
          B.at(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
        }
        if (text) {
          B.sayAt(player, 'No extra arguments allowed. Syntax: ".dl line-number"');
          return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
        }
        accumulator.splice(lineNum - 1, 1);

        B.sayAt(player, `Line number ${lineNum} deleted.`)
        B.at(player, '{W>{x ');
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
      else if (args.toLowerCase().startsWith('.rl')) {
        if (args.split(' ').length <= 1) {
          B.sayAt(player, 'Please provide a line number.')
          B.at(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
        }
        let [cmd, lineNum, text] = this.tokenizer(args, 2);

        if (lineNum.match(/[^[\d]+/) || isNaN(parseInt(lineNum)) || parseInt(lineNum) <= 0 || parseInt(lineNum) > accumulator.length) {
          B.sayAt(player, 'First argument needs to be a valid line number.');
          B.at(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
        }

        accumulator.splice(lineNum - 1, 1, text);

        B.sayAt(player, `Replaced line number ${lineNum}.`)
        B.sayAt(player, '{W>{x ');
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
      else {
        B.at(player, '{W>{x ');

        if (args.length == 0) { args = ''; }
        accumulator.push(args);
        return { 'state': 'writing', 'accumulator': accumulator, 'subCmd': subCommand, 'typeOfBuffer': typeOfBuffer };
      }
    }
  }
}