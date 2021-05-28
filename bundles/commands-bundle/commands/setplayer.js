'use strict';

const { BroadcastSystem: B, PlayerDescription } = require('ranvier');

const Helper = require('../../lib/CommonFunctions');
/**
 * Set the color of various messages
 */
module.exports = {
    usage: 'setplayer',
    command: (state) => (args, player) => {
        let [target, thingToSet, value] = Helper.tokenizer(args,2)

        if (!target) {
            B.sayAt(player, `Set things on -who-?`);
            return;
        }

        if (!thingToSet) {
            B.sayAt(player, `Set -what- on ${target}?`);
            return;
        }

        if (!value) {
            B.sayAt(player, `Set ${thingToSet} on ${target} to -what-?`);
            return;
        }

        let playerTarget = state.PlayerManager.getPlayer(target);
        if (thingToSet.includes("."))
        {
            let [identifier,subIdentifier, subSubIdentifier] = thingToSet.split('.');
            if(playerTarget[identifier] instanceof PlayerDescription) {
                if(subSubIdentifier) {
                    playerTarget[identifier][subIdentifier] = {[subSubIdentifier]:value};
                }
                else {
                    playerTarget[identifier][subIdentifier] = {[subIdentifier]:value};
                }
            }

        }

        playerTarget.save( () => {
            B.sayAt(player, `You've set ${target}'s ${thingToSet} to ${value}`);
        });
    }
};