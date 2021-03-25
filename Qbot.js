// Create your bot
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({ host: 'localhost', port: '56008', username: "Player" });

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
    BehaviorPlaceBlock,
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

    // Create our states
    const printServerStates = new BehaviorPrintServerStats(bot);
    const findWater = new BehaviorFindBlock(bot, targets);
    const goToWater = new BehaviorMoveTo(bot, targets);

    const placeDirt = new BehaviorPlaceBlock(bot, targets);

    const findWater = new BehaviorFindBlock(bot, targets);
    const goToWater = new BehaviorMoveTo(bot, targets);


    const idle = new BehaviorIdle();

    // Create our transitions
    findWater.blocks.push(26);
    findWater.maxDistance = 100000000000000000000;

    findWater.blocks.push(26);
    findWater.maxDistance = 100000000000000000000;

    const transitions = [

        new StateTransition({ // 0
            parent: printServerStates,
            child: findWater,
            shouldTransition: () => {
                return true;
            }
        }),

        new StateTransition({ // 1
            parent: findWater,
            child: goToWater,
            shouldTransition: () => {
                console.log(targets);
                return true;
            }
        }),

        new StateTransition({ // 2
            parent: goToWater,
            child: idle,
            shouldTransition: () => {
                console.log(goToWater.distanceToTarget());
                return goToWater.distanceToTarget() <= 2
            }
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
