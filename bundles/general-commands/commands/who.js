'use strict';

const { BroadcastSystem: B } = require('ranvier');

module.exports = {
  usage: 'who',
  command: (state) => (args, player) => {
    B.sayAt(player, "{R                  Who's Online{x");
    B.sayAt(player, "{R==============================================={x");
    B.sayAt(player, '');

    state.PlayerManager.players.forEach((otherPlayer) => {
      B.sayAt(player, ` *  ${otherPlayer.name} ${getRoleString(otherPlayer.role)}`);
    });

    B.sayAt(player, state.PlayerManager.players.size + ' total');

    function getRoleString(role = 0) {
      return [
        '',
        '{w[Builder]{x',
        '{W[Admin]{x'
      ][role] || '';
    }
  }
};
