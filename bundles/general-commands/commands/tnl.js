'use strict';

const { BroadcastSystem:B } = require('ranvier');
const LevelUtil = require('../../bundle-example-lib/lib/LevelUtil');

module.exports = {
  aliases: [ 'level', 'experience' ],
  usage: 'tnl',
  command: state => (args, player) => {
    const totalTnl = LevelUtil.expToLevel(player.level + 1);
    const currentPerc = player.experience ? Math.floor((player.experience / totalTnl) * 100) : 0;

    B.sayAt(player, `Level: ${player.level}`);
    B.sayAt(player, B.progress(80, currentPerc, "{b"));
    B.sayAt(player, `${player.experience}/${totalTnl} (${currentPerc}%, ${totalTnl - player.experience} til next level)`);
  }
};
