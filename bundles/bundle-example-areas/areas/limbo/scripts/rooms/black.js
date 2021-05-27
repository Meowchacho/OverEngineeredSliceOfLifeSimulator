'use strict';

const { BroadcastSystem} = require('ranvier');

module.exports = {
  listeners: {
    playerEnter: state => function (player) {
      BroadcastSystem.sayAt(player);
      BroadcastSystem.sayAt(player, `{CHint: You can pick up items from the room listed in '{wlook{x' with '{wget{x' followed by a reasonable keyword for the item e.g., '{wget cheese{x'. Some items, like the chest, may contain items; you can check by looking at the item.{x`, 80);
    }
  }
};
