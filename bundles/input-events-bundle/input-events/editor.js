'use strict';
const { BroadcastSystem: B, Logger, EventUtil } = require('ranvier');
const Helper = require('../../lib/CommonFunctions');
const validCommands = ['.f', '.dl', '.il', '.s', '.rl', '.h', '.q'];
module.exports = {
  event: state => (player, config) => {
    player.socket.once('data', (data) => {
      this.config = config;

      function formatText(player, text) {
        if (text === '') {
          return [];
        }
        let targetLength = player.getMeta('config.line_wrap');
        let textToBreak = text.replaceAll('  ', ' ');
        let accumulator = [];

        while (textToBreak.length > 0) {
          let paragraphIndex = textToBreak.indexOf('\n');
          let paragraph = textToBreak.substring(0, paragraphIndex != -1 ? paragraphIndex + 1 : textToBreak.length);
          textToBreak = textToBreak.replace(paragraph, '');
          if(paragraph == ' \n') {
            accumulator.push(' \n');
            continue;
          }
          while (paragraph.length > 0) {
            let line = '';
            while (line.length < targetLength && paragraph.length != 0) {
              let word = paragraph.match(/[\w+.,;?!:'"()]+/)[0];
              if (line.length + word.length > targetLength) {
                break;
              }
              else {
                line = line + word + ' ';
                paragraph = paragraph.replace(word, '');
                paragraph = paragraph.trimStart();
              }
            }
            accumulator.push(line);
          }

          accumulator[accumulator.length - 1] = accumulator[accumulator.length - 1] + '\n';
        }
        return accumulator;
      }

      function showBuffer(player, bufArray) {
        bufArray.forEach((line, index) => {
          B.sayAt(player, `[${(index + 1).toString().padStart(3,' ')}] ${line.replace(/\n/g, '')}`);
        })
      }

      function loop() {
        player.socket.emit('editor', player, config);
        B.prompt(player);
      }

      if (!config.currentBufferArray) {
        config.currentBufferArray = formatText(player, config.existingBuffer);
      }
      data = data.toString().trim();

      if (data === '') {
        config.currentBufferArray.push(' \n');
        config.existingBuffer = config.existingBuffer + ' \n';
        loop();
      }
      else if (data === '@') {
        config.callback(state, player, config.existingBuffer);
        B.sayAt(player, `You are now exiting the ${config.type} editor.`);
        
        player.prompt = player.tempPrompt;
        player.tempPrompt = undefined;

        state.CommandManager.get('look').execute(null, player);
        player.socket.emit('commands', player);
        return B.prompt(player);
      }
      else if (data.startsWith('.')) {
        let results = data.match(/(?<command>\.\w+)\s*(?<lineNum>\d+)?\s*(?<text>.+)?/i).groups;
        let command = results.command;
        let lineNum = results.lineNum;
        let text = results.text;

        if (!validCommands.includes(command)) {
          B.sayAt(player, `${command} is not a valid formatter command.  Please see .h for more help.`);
        }
        else if (command === '.s') {
          showBuffer(player, config.currentBufferArray);
        }
        else if (command === '.q') {
          B.sayAt(player, `Abandoning changes to ${config.type}, you are now exiting the ${config.type} buffer.`);
          state.CommandManager.get('look').execute(null, player);
          player.socket.emit('commands', player);
          return B.prompt(player);
        }
        else if (command === '.h') {
          Helper.printBufferHelp(config.type, player);
        }
        else {
          if (!lineNum) {
            B.sayAt(player, `The ${command} command requires a line number to work on.`);
          }
          else {
            lineNum = lineNum - 1;
            if (lineNum < 0 || lineNum > config.currentBufferArray.size) {
              B.sayAt(player, `Line number ${lineNum} does not exist.`);
            }
            else {
              let stringToModifyAfter = '';
              let stringToModifyBefore = '';
              let wholeString = '';
              let newStringArray = [];
              switch (command) {
                case '.f':
                  if (isNaN(parseInt(text))) {
                    B.sayAt(player, 'Format requires starting and ending line numbers.');
                  }
                  else {
                    let substring = '';
                    for (let i = lineNum; i < text; i++) {
                      substring = substring +
                        (config.currentBufferArray[i] == '' ? '\n' : config.currentBufferArray[i]);
                    }
                    let newParagraph = substring.replaceAll('\n', '')
                    config.currentBufferArray.splice(lineNum, text - lineNum, ...formatText(player, newParagraph + '\n'));
                    config.existingBuffer = config.existingBuffer.replace(substring, newParagraph + '\n');
                    B.sayAt(player, `Formatted lines ${lineNum + 1} through ${text}.`)
                  }
                  break;
                case '.il':
                  stringToModifyAfter = config.currentBufferArray[lineNum];
                  stringToModifyBefore = config.currentBufferArray[lineNum - 1];
                  let stringToModify = stringToModifyBefore + stringToModifyAfter

                  newStringArray = formatText(player, text + '\n');
                  config.currentBufferArray.splice(lineNum, 0, ...newStringArray);
                  config.existingBuffer = config.existingBuffer.replace(stringToModify, stringToModifyBefore + text + ' \n' + stringToModifyAfter);
                  break;
                case '.dl':
                  stringToModifyAfter = config.currentBufferArray[lineNum + 1];
                  stringToModifyBefore = config.currentBufferArray[lineNum - 1];
                  let stringToRemove = config.currentBufferArray.splice(lineNum, 1)[0];

                  wholeString = stringToModifyBefore + stringToRemove + stringToModifyAfter;
                  config.existingBuffer = config.existingBuffer.replace(wholeString, stringToModifyBefore + stringToModifyAfter);
                  break;
                case '.rl':
                  stringToModifyAfter = config.currentBufferArray[lineNum + 1];
                  stringToModifyBefore = config.currentBufferArray[lineNum - 1];
                  let hackFlag = config.currentBufferArray[lineNum].endsWith('\n');
                  text = text + ' ';
                  if(hackFlag) {
                    text = text + '\n';
                  }
                  newStringArray = formatText(player, stringToModifyBefore+text+stringToModifyAfter);
                  
                  if (!hackFlag) {
                    for(let i = 0; i < newStringArray.length-1;i++) {
                      newStringArray[i] = newStringArray[i].replace('\n', '');
                    }
                  }

                  let stringToReplace = config.currentBufferArray.splice(lineNum-1, 3, ...newStringArray)[1];
                  wholeString = stringToModifyBefore + stringToReplace + stringToModifyAfter;
                  config.existingBuffer = config.existingBuffer.replace(wholeString, stringToModifyBefore + text + stringToModifyAfter);
                  break;
                default:
              }
            }
          }
        }
        loop();
      }
      else {
        config.existingBuffer = config.existingBuffer + data.replaceAll('  ', ' ') + ' \n';
        config.currentBufferArray.push.apply(config.currentBufferArray, formatText(player, data + ' \n'));
        loop();
      }
    });
  }
}