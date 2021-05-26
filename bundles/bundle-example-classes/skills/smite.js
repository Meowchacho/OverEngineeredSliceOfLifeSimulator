'use strict';

const { Broadcast, Damage } = require('ranvier');
const Combat = require('../../bundle-example-combat/lib/Combat');

const cooldown = 10;
const damagePercent = 350;
const favorAmount = 5;

module.exports = {
  name: 'Smite',
  requiresTarget: true,
  initiatesCombat: true,
  resource: {
    attribute: 'favor',
    cost: favorAmount
  },
  cooldown,

  run: state => function (args, player, target) {
    if (!player.equipment.has('wield')) {
      return Broadcast.sayAt(player, "You don't have a weapon equipped.");
    }

    const amount = Combat.calculateWeaponDamage(player) * (damagePercent / 100);

    const damage = new Damage('health', amount, player, this, {
      type: 'holy',
    });

    Broadcast.sayAt(player, `{YYour weapon radiates holy energy and you strike ${target.name}!{x`);
    Broadcast.sayAtExcept(player.room, `{Y${player.name}'s weapon radiates holy energy and they strike ${target.name}!{x`, [target, player]);
    Broadcast.sayAt(target, `{Y${player.name}'s weapon radiates holy energy and they strike you!{x`);

    damage.commit(target);
  },

  info: (player) => {
    return `Empower your weapon with holy energy and strike, dealing ${damagePercent}%{x weapon damage. Requires a weapon.`;
  }
};
