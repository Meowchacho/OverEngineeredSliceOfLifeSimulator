'use strict';

const { BroadcastSystem:B } = require('ranvier');

/**
 * Flush the command queue
 */
module.exports = {
  usage: 'flush',
  command : (state) => (args, player) => {
    player.commandQueue.flush();
    B.sayAt(player, '{YQueue flushed.{x');
  }
};
