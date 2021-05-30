'use strict';

const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
const sprintf = require('sprintf-js').sprintf;
const {
  BroadcastSystem: B,
  Room,
  Item,
  ItemType,
  Logger,
  Player
} = require('ranvier');
const ArgParser = require('../../lib/ArgParser');
const ItemUtil = require('../../lib/ItemUtil');
const Helper = require('../../lib/CommonFunctions')

module.exports = {
  usage: "look [thing]",
  command: state => (args, player) => {
    if (!player.room || !(player.room instanceof Room)) {
      Logger.error(player.name + ' is in limbo.');
      return B.sayAt(player, 'You are in a deep, dark void.');
    }

    if (args) {
      return lookEntity(state, player, args);
    }

    lookRoom(state, player);
  }
};

function getCompass(player) {
  const room = player.room;

  const exitMap = new Map();
  exitMap.set('east', 'E');
  exitMap.set('west', 'W');
  exitMap.set('south', 'S');
  exitMap.set('north', 'N');
  exitMap.set('up', 'U');
  exitMap.set('down', 'D');
  exitMap.set('southwest', 'SW');
  exitMap.set('southeast', 'SE');
  exitMap.set('northwest', 'NW');
  exitMap.set('northeast', 'NE');

  const directionsAvailable = room.exits.map(exit => exitMap.get(exit.direction));

  const exits = Array.from(exitMap.values()).map(exit => {
    if (directionsAvailable.includes(exit)) {
      return exit;
    }
    //If we are either SE or NE, pre-pad
    if (exit.length === 2 && exit.includes('E')) {
      return ' -';
    }

    //If we are either SW or NW, post-pad
    if (exit.length === 2 && exit.includes('W')) {
      return '- ';
    }
    return '-';
  });

  let [E, W, S, N, U, D, SW, SE, NW, NE] = exits;
  U = U === 'U' ? '{YU{W' : U;
  D = D === 'D' ? '{YD{W' : D;

  const line1 = `${NW}     ${N}     ${NE}`;
  const line2 = `{Y${W}{W <-${U}-(@)-${D}-> {Y${E}`;
  const line3 = `${SW}     ${S}     ${SE}\r\n`;

  return [line1, line2, line3];
}

function lookRoom(state, player) {
  const room = player.room;

  if (player.room.coordinates) {
    B.sayAt(player, '{Y' + sprintf('%-65s', room.title));
    B.sayAt(player, B.line(60));
  } else {
    const [line1, line2, line3] = getCompass(player);

    // map is 15 characters wide, room is formatted to 80 character width
    B.sayAt(player, '{Y' + sprintf('%-65s', room.title) + line1);
    B.sayAt(player, B.line(60) + B.line(5, ' ') + line2);
    B.sayAt(player, B.line(65, ' ') + '{Y' + line3);
  }

  if (!player.getMeta('config.brief')) {
    B.sayAt(player, room.description, '', '', 80);
  }

  if (player.getMeta('config.minimap')) {
    B.sayAt(player, '');
    state.CommandManager.get('map').execute(4, player);
  }

  B.sayAt(player, '');

  // show all players
  room.players.forEach(otherPlayer => {
    if (otherPlayer === player) {
      return;
    }
    let combatantsDisplay = '';
    if (otherPlayer.isInCombat()) {
      combatantsDisplay = getCombatantsDisplay(otherPlayer);
    }
    B.sayAt(player, '[Player] ' + otherPlayer.name + combatantsDisplay);
  });

  // show all the items in the room
  room.items.forEach(item => {
    if (item.hasBehavior('resource')) {
      B.sayAt(player, `[${ItemUtil.qualityColorize(item, 'Resource')}] {m${item.roomDesc}`);
    } else {
      B.sayAt(player, `[${ItemUtil.qualityColorize(item, 'Item')}] {m${item.roomDesc}`);
    }
  });

  // show all npcs
  room.npcs.forEach(npc => {
    // show quest state as [!], [%], [?] for available, in progress, ready to complete respectively
    let hasNewQuest, hasActiveQuest, hasReadyQuest;
    if (npc.quests) {
      hasNewQuest = npc.quests.find(questRef => state.QuestFactory.canStart(player, questRef));
      hasReadyQuest = npc.quests.find(questRef => {
        return player.questTracker.isActive(questRef) &&
          player.questTracker.get(questRef).getProgress().percent >= 100;
      });
      hasActiveQuest = npc.quests.find(questRef => {
        return player.questTracker.isActive(questRef) &&
          player.questTracker.get(questRef).getProgress().percent < 100;
      });

      let questString = '';
      if (hasNewQuest || hasActiveQuest || hasReadyQuest) {
        questString += hasNewQuest ? '[{Y!{x]' : '';
        questString += hasActiveQuest ? '[{Y%{x]' : '';
        questString += hasReadyQuest ? '[{Y?{x]' : '';
        B.at(player, questString + ' ');
      }
    }

    let combatantsDisplay = '';
    if (npc.isInCombat()) {
      combatantsDisplay = getCombatantsDisplay(npc);
    }

    // color NPC label by difficulty
    let npcLabel = 'NPC';
    switch (true) {
      case (player.level - npc.level > 4):
        npcLabel = '{cNPC{x';
        break;
      case (npc.level - player.level > 9):
        npcLabel = '{RNPC{x';
        break;
      case (npc.level - player.level > 5):
        npcLabel = '{rNPC{x';
        break;
      case (npc.level - player.level > 3):
        npcLabel = '{yNPC{x';
        break;
      default:
        npcLabel = '{gNPC{x';
        break;
    }
    B.sayAt(player, `[${npcLabel}] ` + npc.name + combatantsDisplay);
  });

  B.at(player, '[{YExits{x: ');

  const exits = room.getExits();
  const foundExits = [];

  // prioritize explicit over inferred exits with the same name
  for (const exit of exits) {
    if (foundExits.find(fe => fe.direction === exit.direction)) {
      continue;
    }

    foundExits.push(exit);
  }

  B.at(player, foundExits.map(exit => {
    const exitRoom = state.RoomManager.getRoom(exit.roomId);
    const door = room.getDoor(exitRoom) || (exitRoom && exitRoom.getDoor(room));
    if (door && (door.locked || door.closed)) {
      return '(' + exit.direction + ')';
    }

    return exit.direction;
  }).join(' '));

  if (!foundExits.length) {
    B.at(player, 'none');
  }
  B.sayAt(player, ']');
}

function lookEntity(state, player, args) {
  const room = player.room;

  args = args.split(' ');
  let search = null;

  if (args.length > 1) {
    search = (args[0] === 'in' || args[0] === 'at') ? args[1] : args[0];
  } else {
    search = args[0];
  }

  let entity = (search === 'me' || search === 'self' || search === 'myself') ? player : null;
  entity = entity || ArgParser.parseDot(search, room.items);
  entity = entity || ArgParser.parseDot(search, room.players);
  entity = entity || ArgParser.parseDot(search, room.npcs);
  entity = entity || ArgParser.parseDot(search, player.inventory);

  if (!entity) {
    return B.sayAt(player, "You don't see anything like that here.");
  }


  B.sayAtExcept(player.room, [player, entity], `${player.name} looks at ${entity.name}.`);
  if (entity.name != player.name) {
    B.sayAt(player, `You look at ${entity.name}.`)
    B.sayAt(entity, `${player.name} looks at you.`);
  }
  else {
    B.sayAt(player, `You look at yourself.`);
  }

  if (entity instanceof Player) {
    let gender = entity.description.gender;
    let subject = Helper.capitalize(Helper.pronounify(gender, 'third', 'possessive'))
    B.sayAt(player, `You see ${entity.name}, a type of ${gender}.`);
    B.sayAt(player, `${entity.description.longDescription.join('\n')}`);
    B.sayAt(player, `${subject} hair is ${entity.description.describeHair()}.`);
    B.sayAt(player, `${subject} eyes are ${entity.description.describeEyes()}.`);
    B.sayAt(player, `${subject} skin is ${entity.description.describeSkin()}.`);
    B.sayAt(player, `${subject} body is ${entity.description.describeBody()}.`);
  }
  else {
    B.sayAt(player, entity.description, '', '', 80);
  }

  if (entity.timeUntilDecay) {
    B.sayAt(player, `You estimate that ${entity.name} will rot away in ${humanize(entity.timeUntilDecay)}.`);
  }

  const usable = typeof entity.getBehavior === "function" ? entity.getBehavior('usable') : null;

  if (usable) {
    if (usable.spell) {
      const useSpell = state.SpellManager.get(usable.spell);
      if (useSpell) {
        useSpell.options = usable.options;
        B.sayAt(player, useSpell.info(player));
      }
    }

    if (usable.effect && usable.config.description) {
      B.sayAt(player, usable.config.description);
    }

    if (usable.charges) {
      B.sayAt(player, `There are ${usable.charges} charges remaining.`);
    }
  }

  if (entity instanceof Item) {
    switch (entity.type) {
      case ItemType.WEAPON:
      case ItemType.ARMOR:
        return B.sayAt(player, ItemUtil.renderItem(state, entity, player));
      case ItemType.CONTAINER: {
        if (entity.closed) {
          B.sayAt(player, `It is closed.`);
        }
        else if (!entity.inventory || !entity.inventory.size) {
          B.sayAt(player, `${entity.name} is empty.`);
        }
        else {
          B.at(player, 'Contents');
          if (isFinite(entity.inventory.getMax())) {
            B.at(player, ` (${entity.inventory.size}/${entity.inventory.getMax()})`);
          }
          B.sayAt(player, ':');

          for (const [, item] of entity.inventory) {
            B.sayAt(player, '  ' + ItemUtil.display(item));
          }
          break;
        }
      }
    }
  }
}


function getCombatantsDisplay(entity) {
  const combatantsList = [...entity.combatants.values()].map(combatant => combatant.name);
  return `, {rfighting ${combatantsList.join(", ")}{x`;
}
