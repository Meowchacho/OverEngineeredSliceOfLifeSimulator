'use strict';

const { BroadcastSystem: B } = require('ranvier');
const Helper = require('../../lib/CommonFunctions');

/* To implement a modal command (specifically via the example-input-events bundle)
 * have your command's function return a value. That value will put the player in that
 * command state. Subsequent input from the player will be passed directly to this command
 * with all input as `args` and the current state as the 4th argument after arg0. */
module.exports = {
  usage: 'description',
  aliases: ['desc'],
  command: state => (args, player, arg0, extraArgs) => {
    let commandState = null;
    let accumulator = [];
    if (extraArgs) {
      commandState = extraArgs.state || null;
      accumulator = extraArgs.accumulator || [];
    }

    if (!commandState) {
      B.sayAt(player, 'You are now in the description buffer. Enter .h on an empty for help, or @ to exit.');

      if (Array.isArray(player.description._longDescription)) {
        args = player.description._longDescription;
      }
      else {
        let currDescription = Helper.formatBigText(player.description._longDescription, 80);
        args = currDescription.split('\n');
      }
      args.forEach((element, index) => { B.sayAt(player, `{w[{W${index.toString().padStart(3)}{w]{x ${element}`) });
      if (args.length > 0) { accumulator = accumulator.concat(args); }

      B.sayAt(player, '\r\n{W>{x');
      return { 'state': 'writing', 'accumulator': accumulator };
    }

    switch (commandState) {
      case 'writing': {
        if (args.toLowerCase() === '@') {
          B.sayAt(player, "Exiting the description buffer.");
          player.description._longDescription = accumulator;
          player.save();
        }
        else if (args.toLowerCase() === '.c') {
          accumulator = [];

          B.sayAt(player, "Cleared the description buffer.");
          B.sayAt(player, '{W>{x');
          return { 'state': 'writing', 'accumulator': accumulator };
        }
        else if (args.toLowerCase() === '.s') {
          accumulator.forEach((element, index) => { B.sayAt(player, `{w[{W${index.toString().padStart(3)}{w]{x ${element}`) });

          B.sayAt(player, '{W>{x');
          return { 'state': 'writing', 'accumulator': accumulator };
        }
        else if (args.toLowerCase() === '.f') {
          let newBuffer = [], element = null;

          while (typeof (element = accumulator.shift()) !== 'undefined') {
            let wrappedString = Helper.formatBigText(element, 80).replace(/  /g, ' ');

            if (wrappedString !== '' && wrappedString.length < 65 && accumulator.length > 0 && accumulator[0] !== '') {
              wrappedString = wrappedString + ' ' + accumulator.shift();
              wrappedString = Helper.formatBigText(wrappedString, 80);
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
          B.sayAt(player, 'Formatted current buffer.');
          accumulator.forEach((element, index) => { B.sayAt(player, `{w[{W${index.toString().padStart(3)}{w]{x ${element}`) });

          B.sayAt(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator };
        }
        else if (args.toLowerCase().startsWith('.li')) {
          let [cmd, lineNum, text] = Helper.tokenizer(args, 2);
          accumulator.splice(lineNum, 0, text);

          B.sayAt(player, '{W>{x ');
          return { 'state': 'writing', 'accumulator': accumulator };
        }
        else {
          B.sayAt(player, '{W>{x ');

          if (args.length == 0) { args = ''; }
          accumulator.push(args);
          return { 'state': 'writing', 'accumulator': accumulator };
        }
      }
    }
  }
};

