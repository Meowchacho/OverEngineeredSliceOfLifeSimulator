'use strict';

const { BroadcastSystem: B, Logger} = require('ranvier');
const Helper = require('../../lib/CommonFunctions');

/* To implement a modal command (specifically via the example-input-events bundle)
 * have your command's function return a value. That value will put the player in that
 * command state. Subsequent input from the player will be passed directly to this command
 * with all input as `args` and the current state as the 4th argument after arg0. */
module.exports = {
  usage: 'description',
  aliases: ['desc'],
  command: state => (args, player, arg0, extraArgs) => {

    if (!extraArgs) {
      extraArgs = {'typeOfBuffer':'description','accumulator':player.description._longDescription || null, 'state':'starting'};
    }
    let result = Helper.editorLambda(args,player,arg0,extraArgs);
    if(result && result.state === 'finishing') {
      player.description._longDescription = extraArgs.accumulator;
      player.save();
      return;
    }
    return result;
  }
};

