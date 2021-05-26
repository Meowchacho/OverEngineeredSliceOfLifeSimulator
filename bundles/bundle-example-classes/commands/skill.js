'use strict';

const { Broadcast: B, SkillFlag } = require('ranvier');

module.exports = {
  aliases: [ "spell" ],
  command : state => (args, player) => {
    const say = (message, wrapWidth) => B.sayAt(player, message, wrapWidth);

    if (!args.length) {
      return say("What skill or spell do you want to look up? Use 'skills' to view all skills/spells.");
    }

    let skill = state.SkillManager.find(args, true);
    if (!skill) {
      skill = state.SpellManager.find(args, true);
    }

    if (!skill) {
      return say("No such skill.");
    }

    say('' + B.center(80, skill.name, 'white', '-') + '{x');
    if (skill.flags.includes(SkillFlag.PASSIVE)) {
      say('Passive{x');
    } else {
      say(`Usage{x: ${skill.id}`);
    }

    if (skill.resource && skill.resource.cost) {
      say(`Cost{x: ${skill.resource.cost}{x ${skill.resource.attribute}`);
    }

    if (skill.cooldownLength) {
      say(`Cooldown{x: ${skill.cooldownLength}{x seconds`);
    }
    say(skill.info(player), 80);
    say('' + B.line(80) + '{x');
  }
};
