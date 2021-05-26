'use strict';

const sprintf = require('sprintf-js').sprintf;
const { BroadcastSystem:B } = require('ranvier');

/**
 * View command queue
 */
module.exports = {
  aliases: [ 'pending' ],
  usage: 'queue',
  command : (state) => (args, player) => {
    B.sayAt(player, '{YCommand Queue:{x');
    if (!player.commandQueue.hasPending) {
      return B.sayAt(player, ' -) None.');
    }

    const commands = player.commandQueue.queue;
    const indexToken =  '%' + ((commands.length + 1) + '').length + 's';
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const index = sprintf(indexToken, i + 1);
      const ttr = sprintf('%.1f', player.commandQueue.getTimeTilRun(i));
      let buf = ` ${index}) {W${command.label}{x`;
      buf += ` {y({x{W${ttr}s{x{y){x`;
      B.sayAt(player, buf);
    }

    B.sayAt(player, '{YUse the "flush" command to flush the queue{x');
  }
};
