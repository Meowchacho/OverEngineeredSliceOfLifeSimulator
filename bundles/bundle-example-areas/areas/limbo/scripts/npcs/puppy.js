'use strict';

const { BroadcastSystem } = require('ranvier');

module.exports = {
  listeners: {
    playerEnter: state => function (player) {
      if (this.following) {
        return;
      }

      BroadcastSystem.sayAt(player, 'The puppy lets out a happy bark and runs to your side.');
      this.follow(player);
    }
  }
};
