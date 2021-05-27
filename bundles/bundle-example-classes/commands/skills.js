'use strict';

const sprintf = require('sprintf-js').sprintf;
const { BroadcastSystem: B, Logger } = require('ranvier');

module.exports = {
  aliases: ['abilities', 'spells'],
  command: state => (args, player) => {
    const say = message => B.sayAt(player, message);
    say("" + B.center(80, 'Abilities', '{g'));
    say("" + B.line(80, '=', '{g'));

    for (const [ level, abilities ] of Object.entries(player.playerClass.abilityTable)) {
      abilities.skills = abilities.skills || [];
      abilities.spells = abilities.spells || [];

      if (!abilities.skills.length && !abilities.spells.length) {
        continue;
      }

      say(`\r\nLevel ${level}{x`);
      say(B.line(50));

      let i = 0;
      if (abilities.skills.length) {
        say('\r\nSkills{x');
      }

      for (let skillId of abilities.skills) {
        let skill = state.SkillManager.get(skillId);

        if (!skill) {
          Logger.error(`Invalid skill in ability table: ${player.playerClass.name}:${level}:${skillId}`);
          continue;
        }

        let name = sprintf("%-20s", skill.name);
        if (player.level >= level) {
          name = `{g${name}{x`;
        }
        B.at(player, name);

        if (++i % 3 === 0) {
          say();
        }
      }

      if (abilities.spells.length) {
        say('\r\nSpells{x');
      }

      for (let spellId of abilities.spells) {
        let spell = state.SpellManager.get(spellId);

        if (!spell) {
          Logger.error(`Invalid spell in ability table: ${player.playerClass.name}:${level}:${spellId}`);
          continue;
        }

        let name = sprintf("%-20s", spell.name);
        if (player.level >= level) {
          name = `{g${name}{x`;
        }
        B.at(player, name);

        if (++i % 3 === 0) {
          say();
        }
      }

      // end with a line break
      say();
    }
  }
};
