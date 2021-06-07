'use strict';

const { BroadcastEmote:B,RoomAudience } = require('ranvier');
const ArgParser = require('../../lib/ArgParser');
// // Load wink-nlp package  & helpers.
// const winkNLP = require( 'wink-nlp' );
// // Load "its" helper to extract item properties.
// const its = require( 'wink-nlp/src/its.js' );
// // Load "as" reducer helper to reduce a collection.
// const as = require( 'wink-nlp/src/as.js' );
// // Load english language model — light version.
// const model = require( 'wink-eng-lite-model' );
// // Instantiate winkNLP.
// const nlp = winkNLP( model );

module.exports = {
  usage: 'emote <message>',
  aliases: [':'],
  command: (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'Yes, but what do you want to emote?');
    }

    let msgToParse = `${player.name} ${args}`;
    // const doc = nlp.readDoc(msgToParse);
    // const tokens = doc.tokens();
    // let meh = tokens.out( its.pos);

    const FIND_TARGETS_REGEXP = /~((?:\d+\.)?[^\s.,!?"']+)/gi;
    const REPLACE_TARGETS_REGEXP = /~(?:\d+\.)?[^\s.,!?"']+/;

    let roomAudience = new RoomAudience();
    roomAudience.configure({'state':state, 'sender':player, 'message':msgToParse});

    B.sayAt(player, msgToParse);
    B.sayAt(roomAudience, '\n\r' + msgToParse);

  }
};

function findTarget(player, thingName) {
  const findableThings = new Set([...player.room.players]);
  return ArgParser.parseDot(thingName, findableThings);
}
