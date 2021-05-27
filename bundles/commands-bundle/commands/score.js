'use strict';

const sprintf = require('sprintf-js').sprintf;
const { BroadcastSystem: B } = require('ranvier');
const Combat = require('../../lib/Combat');

module.exports = {
  aliases: [ 'stats' ],
  command : (state) => (args, p) => {
    const say = message => B.sayAt(p, message);

    say('' + B.center(60, `${p.name}, level ${p.level} ${p.playerClass.config.name}`, '{g'));
    say('' + B.line(60, '-', '{g'));

    let stats = {
      strength: 0,
      agility: 0,
      intellect: 0,
      stamina: 0,
      armor: 0,
      health: 0,
      critical: 0,
    };

    for (const stat in stats) {
      stats[stat] = {
        current: p.getAttribute(stat) || 0,
        base: p.getBaseAttribute(stat) || 0,
        max: p.getMaxAttribute(stat) || 0,
      };
    }

    B.at(p, sprintf(' %-9s: %12s', 'Health', `${stats.health.current}/${stats.health.max}`));
    say('{G' + sprintf(
      '%36s',
      'Weapon '
    ));

    // class resource
    switch (p.playerClass.id) {
      case 'warrior':
        const energy = {
          current: p.getAttribute('energy'),
          max: p.getMaxAttribute('energy')
        };
        B.at(p, sprintf(' %-9s: %12s', 'Energy', `${energy.current}/${energy.max}`));
        break;
      case 'mage':
        const mana = {
          current: p.getAttribute('mana'),
          max: p.getMaxAttribute('mana')
        };
        B.at(p, sprintf(' %-9s: %12s', 'Mana', `${mana.current}/${mana.max}`));
        break;
      case 'paladin':
        const favor = {
          current: p.getAttribute('favor'),
          max: p.getMaxAttribute('favor')
        };
        B.at(p, sprintf(' %-9s: %12s', 'Favor', `${favor.current}/${favor.max}`));
        break;
      default:
        B.at(p, B.line(24, ' '));
        break;
    }
    say(sprintf('%35s', '.' + B.line(22)) + '.');

    B.at(p, sprintf('%37s', '|'));
    const weaponDamage = Combat.getWeaponDamage(p);
    const min = Combat.normalizeWeaponDamage(p, weaponDamage.min);
    const max = Combat.normalizeWeaponDamage(p, weaponDamage.max);
    say(sprintf(' %6s:%5s{x - %-5s{x |', 'Damage', min, max));
    B.at(p, sprintf('%37s', '|'));
    say(sprintf(' %6s: %12s{x |', 'Speed', B.center(12, Combat.getWeaponSpeed(p) + ' sec')));

    say(sprintf('%60s', "'" + B.line(22) + "'"));

    say('{G' + sprintf(
      '%-24s',
      ' Stats'
    ) + '{x');
    say('.' + B.line(22) + '.');


    const printStat = (stat, newline = true) => {
      const val = stats[stat];
      const statColor = (val.current > val.base ? '{g' : '{w');
      const str = sprintf(
        `| %-9s : ${statColor}%8s${statColor}{x |`,
        stat[0].toUpperCase() + stat.slice(1),
        val.current
      );

      if (newline) {
        say(str);
      } else {
        B.at(p, str);
      }
    };

    printStat('strength', false); // left
    say('{G' + sprintf('%36s', 'Gold ')); // right
    printStat('agility', false); // left
    say(sprintf('%36s', '.' + B.line(12) + '.')); // right
    printStat('intellect', false); // left
    say(sprintf('%22s| %10s{x |', '', p.getMeta('currencies.gold') || 0)); // right
    printStat('stamina', false); // left
    say(sprintf('%36s', "'" + B.line(12) + "'")); // right

    say(':' + B.line(22) + ':');
    printStat('armor');
    printStat('critical');
    say("'" + B.line(22) + "'");
  }
};
