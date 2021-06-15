'use strict';

/**
 * General functions used on the ranvier-input-events bundle
 */

const { Config, BroadcastSystem: B } = require('ranvier');
const { Logger } = require('winston');
const wrap = require('wrap-ansi');
const Tables = require('./Tables');
const Tablette = require('./Tablette');
const TextCell = require('./TextCell').TextCell;
const TextCells = require('./TextCell').ALIGN;

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

exports.getLongDateString = function (date_ob) {
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = (monthNames[date_ob.getMonth()]);
  let year = date_ob.getFullYear();
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let gmtOffset = (date_ob.getTimezoneOffset() / 60) + ':00';
  return `${date} ${month} ${year} ${hours}:${minutes} GMT-${gmtOffset}`;
}

exports.getShortDateString = function (date_ob) {
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = (monthNames[date_ob.getMonth()]);
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);

  return `${date} ${month} ${hours}:${minutes}`;
}

exports.getCurrentDateString = function () {
  let date_ob = new Date();

  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = (monthNames[date_ob.getMonth()]);
  let year = date_ob.getFullYear();
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);

  return `${date} ${month} ${year} ${hours}:${minutes}`;
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

exports.rawLength = function (string) {
  return string.replace(/{\w/ig, '').length;
}

exports.printInitialBufferHelp = function (type, player) {
  let lineLengthOverall = player.getMeta('config.line_length') || 80; //player.something

  B.sayAt(player, `You are now editing your ${type}.`);
  B.sayAt(player, this.line(lineLengthOverall, '-'));

  var tt = new Tablette();
  tt.readTable(Tables.bufferHelpHeader, lineLengthOverall);

  let cells = tt.getRange('7:1-9:2');
  cells.forEach((element) => {
    if (element.y == 1) {
      element.size = Math.round((lineLengthOverall) * 0.3);
      element.align = element.ALIGNS.DOTLEFT;
    }
    else {
      element.size = Math.round((lineLengthOverall) * 0.7);
      element.align = element.ALIGNS.DOTRIGHT;
    }
  });
  tt.getAndSetMaxes(cells.filter(element => element.y == 1));
  tt.getAndSetMaxes(cells.filter(element => element.y == 2));
  tt.getPrintableArray().forEach((line) => {
    B.sayAt(player, line);
  });
  B.sayAt(player, this.line(lineLengthOverall, '-'));
}

exports.printNoteList = function (board, player) {
  let lineLengthOverall = player.getMeta('config.line_length') || 80; //player.something

  let notes = board.getAllNotes(player);

  var tt = new Tablette();
  tt.addCell(1, 1, new TextCell(this.line(lineLengthOverall, '-'), lineLengthOverall));
  tt.addCell(2, 1, new TextCell('{WNumber{x', lineLengthOverall));
  tt.addCell(2, 2, new TextCell('{WDate/Time{x', lineLengthOverall));
  tt.addCell(2, 3, new TextCell('{WAuthor{x', lineLengthOverall));
  tt.addCell(2, 4, new TextCell('{WSubject{x', lineLengthOverall));
  tt.addCell(3, 1, new TextCell(this.line(lineLengthOverall, '-'), lineLengthOverall));

  let noteCounter = 4;
  notes.forEach((note) => {
    tt.addCell(noteCounter, 1, new TextCell(note.number.toString(), lineLengthOverall));
    tt.addCell(noteCounter, 2, new TextCell(this.getShortDateString(note.dateWritten), lineLengthOverall));
    tt.addCell(noteCounter, 3, new TextCell(note.from, lineLengthOverall));
    tt.addCell(noteCounter, 4, new TextCell(note.subject, lineLengthOverall));
    noteCounter++;
  }, this);

  let cells = tt.getRange(`2:1-2:4`);
  cells.forEach((element) => {
    if (element.y == 1) {
      element.size = Math.round((lineLengthOverall) * 0.1);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
    else if (element.y == 2) {
      element.size = Math.round((lineLengthOverall) * 0.18);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
    else if (element.y == 3) {
      element.size = Math.round((lineLengthOverall) * 0.15);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
    else if (element.y == 4) {
      element.size = Math.round((lineLengthOverall) * 0.57);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
  });


  cells = tt.getRange(`4:1-${noteCounter}:4`);
  cells.forEach((element) => {
    if (element.y == 1) {
      element.size = Math.round((lineLengthOverall) * 0.1);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
    else if (element.y == 2) {
      element.size = Math.round((lineLengthOverall) * 0.18);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
    else if (element.y == 3) {
      element.size = Math.round((lineLengthOverall) * 0.15);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
    else if (element.y == 4) {
      element.size = Math.round((lineLengthOverall) * 0.57);
      element.align = element.ALIGNS.LEFT;
      element._text = this.stringTrimmer(element._text, element.size);
    }
  });

  tt.getPrintableArray().forEach((line) => {
    B.sayAt(player, line);
  });
}
exports.printBufferHelp = function (type, player) {
  let lineLengthOverall = player.getMeta('config.line_length') || 80;

  B.sayAt(player, '+' + this.line(lineLengthOverall - 2, '-') + '+');
  let hackLine = '~Editor help~';
  let pad = ' ';
  hackLine = pad.repeat(Math.round((lineLengthOverall - (4 + hackLine.length)) / 2)) + hackLine;
  hackLine = hackLine + pad.repeat(lineLengthOverall - (4 + hackLine.length));
  B.sayAt(player, '| ' + hackLine + ' |');
  B.sayAt(player, '+' + this.line(lineLengthOverall - 2, '-') + '+');
  B.sayAt(player, `You are currently in the ${type} editor.`, '', '', lineLengthOverall);
  B.sayAt(player, this.line(lineLengthOverall, ' '));

  var tt = new Tablette();
  tt.readTable(Tables.bufferHelpCommand, lineLengthOverall);

  let cells = tt.getRange('5:1-13:1');
  cells.forEach((element) => {
    element.align = element.ALIGNS.DOTLEFT;
  });
  tt.getAndSetMaxes(cells);

  tt.getPrintableArray().forEach((line) => {
    B.sayAt(player, line);
  });

}
exports.stringTrimmer = function (string, length) {
  if (!string) { string = '' };

  let result = string;

  if (this.rawLength(result) > length) {
    while (this.rawLength(result) > (length - 3)) {
      if (result.slice(-2).match(/\{\w/)) {
        result = result.slice(0, -2);
      }
      else {
        result = result.slice(0, -1);
      }
    }

    return result + '...';
  }
  else {
    return result
  }
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