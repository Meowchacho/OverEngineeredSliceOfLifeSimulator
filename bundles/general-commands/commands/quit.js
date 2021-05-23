'use strict';

const { BroadcastSystem:B } = require('ranvier');

module.exports = {
  usage: 'quit',
  command: (state) => (args, player) => {
    if (player.isInCombat()) {
      return B.sayAt(player, "You're too busy fighting for your life!");
    }

    player.save(() => {
      B.sayAt(player, "Goodbye!");
      B.sayAtExcept(player.room, player, `${player.name} disappears.`);
      state.PlayerManager.removePlayer(player, true);
    });
  }
};
