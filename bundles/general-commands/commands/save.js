'use strict';

const { BroadcastSystem:B } = require('ranvier');

module.exports = {
  usage: 'save',
  command: state => (args, player) => {
    player.save(() => {
      B.sayAt(player, "Saved.");
    });
  }
};
