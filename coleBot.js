// Create your bot
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({ host: 'localhost', port: '55130', username: "Player" });

// Load your dependency plugins.
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

// Import required behaviors.
const {
    globalSettings,
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    EntityFilters,
    BehaviorIdle,
    BehaviorFindBlock,
    BehaviorMoveTo,
    BehaviorPrintServerStats,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine } = require("mineflayer-statemachine");
    
// wait for our bot to login.
bot.once("spawn", () =>
{
    // This targets object is used to pass data between different states. It can be left empty.
    const targets = {};
    const water = {};

    // Create our states
    const printServerStates = new BehaviorPrintServerStats(bot)
    const findWater = new BehaviorFindBlock(bot, targets)
    const goToWater = new BehaviorMoveTo(bot, targets)
    const idle = new BehaviorIdle()

    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const LookAtPlayer = new BehaviorLookAtEntity(bot, targets);
    //const placeBlock = new BehaviorPlaceBlock(bot, targets);

    findWater.blocks.push('17');

    // Create our transitions
    const transitions = [


        new StateTransition({ // 0
            parent: printServerStates,
            child: findWater,
            shouldTransition: () => true
        }),

        new StateTransition({ // 1
            parent: findWater,
            child: goToWater,
            shouldTransition: () => true
        }),

        new StateTransition({ // 2
            parent: goToWater,
            child: idle,
            shouldTransition: () => goToWater.isFinished()
        }),

        new StateTransition({ // 3
            parent: idle,
            child: getClosestPlayer,
            shouldTransition: () => bot.chat("Stalking")
          }),

        new StateTransition({
            parent: getClosestPlayer,
            child: followPlayer,
            shouldTransition: () => true,
        }),

        // If the distance to the player is less than two blocks, switch from the followPlayer
        // state to the lookAtPlayer state.
        new StateTransition({
            parent: followPlayer,
            child: LookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        // If the distance to the player is more than two blocks, switch from the lookAtPlayer
        // state to the followPlayer state.
        new StateTransition({
            parent: LookAtPlayer,
            child: followPlayer,
            shouldTransition: () => LookAtPlayer.distanceToTarget() >= 2,
        }),
    ];

    // Now we just wrap our transition list in a nested state machine layer. We want the bot
    // to start on the getClosestPlayer state, so we'll specify that here.
    const rootLayer = new NestedStateMachine(transitions, printServerStates);

    bot.on('chat', (username, message) => {
        if (message === 'Start') { transitions[3].trigger() }
      })
    
    // We can start our state machine simply by creating a new instance.
    const stateMachine = new BotStateMachine(bot, rootLayer)
    const webserver = new StateMachineWebserver(bot, stateMachine)
    webserver.startServer()
});