'use strict';

const { BroadcastSystem} = require('ranvier');

module.exports = {
  listeners: {
    command: state => function (player, commandName, args) {
      BroadcastSystem.sayAt(player, `You just executed room context command '${commandName}' with arguments ${args}`);
    }
  }
};
