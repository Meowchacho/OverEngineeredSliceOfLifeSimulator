'use strict';

const { BroadcastSystem: B, Logger} = require('ranvier');
const Helper = require('../../lib/CommonFunctions');
const Editor = require('../../lib/Editor');

/* To implement a modal command (specifically via the example-input-events bundle)
 * have your command's function return a value. That value will put the player in that
 * command state. Subsequent input from the player will be passed directly to this command
 * with all input as `args` and the current state as the 4th argument after arg0. */
module.exports = {
  usage: 'description',
  aliases: ['desc'],
  command: state => (args, player) => {
    let data = {
      type: 'description',
      loggerName: 'Description_Command',
      callback: finalizeDescription,
      existingBuffer: player.description.longDescription || ''
    }
    Editor.enterEditor(player, data);
    return;
  }
};

const finalizeDescription = function (state, player, desc) {
  player.description._longDescription = desc;
  B.sayAt(player, `You've set your description.`);
  player.save();
  return;
};