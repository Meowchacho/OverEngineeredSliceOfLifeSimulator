'use strict';

const { BroadcastSystem, Damage, Heal, SkillType } = require('ranvier');
const Combat = require('../../lib/Combat');

// config placed here just for easy copy/paste of this skill later on
const cooldown = 4;
const damagePercent = 150;
const favorAmount = 3;
const reductionPercent = 30;


module.exports = {
  name: 'Judge',
  type: SkillType.SKILL,
  requiresTarget: true,
  initiatesCombat: true,
  cooldown,

  run: state => function (args, player, target) {
    const effect = state.EffectFactory.create('skill.judge', {}, { reductionPercent });
    effect.skill = this;
    effect.attacker = player;

    const amount = Combat.calculateWeaponDamage(player) * (damagePercent / 100);
    const damage = new Damage('health', amount, player, this, {
      type: 'holy',
    });

    const favorRestore = new Heal('favor', favorAmount, player, this);

    BroadcastSystem.sayAt(player, `{YConcentrated holy energy slams into ${target.name}!{x`);
    BroadcastSystem.sayAtExcept(player.room, [target, player], `{Y${player.name} conjures concentrated holy energy and slams it into ${target.name}!{x`);
    BroadcastSystem.sayAt(target, `{Y${player.name} conjures concentrated holy energy and slams it into you!{x`);

    damage.commit(target);
    target.addEffect(effect);
    favorRestore.commit(player);
  },

  info: (player) => {
    return `Slam your target with holy power, dealing ${damagePercent}%{x weapon damage and reducing damage of the target's next attack by ${reductionPercent}%{x. Generates {Y${favorAmount}{x Favor.`;
  }
};
