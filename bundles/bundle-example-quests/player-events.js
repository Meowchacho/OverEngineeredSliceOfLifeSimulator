'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  listeners: {
    questStart: state => function (quest) {
      B.sayAt(this, `\r\n{YQuest Started: ${quest.config.title}!{x`);
      if (quest.config.description) {
        B.sayAt(this, B.line(80));
        B.sayAt(this, `{Y${quest.config.description}{x`, 80);
      }

      if (quest.config.rewards.length) {
        B.sayAt(this);
        B.sayAt(this, '{Y' + B.center(80, 'Rewards') + '{x');
        B.sayAt(this, '{Y' + B.center(80, '-------') + '{x');

        for (const reward of quest.config.rewards) {
          const rewardClass = state.QuestRewardManager.get(reward.type);
          B.sayAt(this, '  ' + rewardClass.display(state, quest, reward.config, this));
        }
      }

      B.sayAt(this, B.line(80));
    },

    questProgress: state => function (quest, progress) {
      B.sayAt(this, `\r\n{Y${progress.display}{x`);
    },

    questTurnInReady: state => function (quest) {
      B.sayAt(this, `{Y${quest.config.title} ready to turn in!{x`);
    },

    questComplete: state => function (quest) {
      B.sayAt(this, `{YQuest Complete: ${quest.config.title}!{x`);

      if (quest.config.completionMessage) {
        B.sayAt(this, B.line(80));
        B.sayAt(this, quest.config.completionMessage);
      }
    },

    /**
     * Player received a quest reward
     * @param {object} reward Reward config _not_ an instance of QuestReward
     */
    questReward: state => function (reward) {
      // do stuff when the player receives a quest reward. Generally the Reward instance
      // will emit an event that will be handled elsewhere and display its own message
      // e.g., 'currency' or 'experience'. But if you want to handle that all in one
      // place instead, or you'd like to show some supplemental message you can do that here
    },
  }
};
