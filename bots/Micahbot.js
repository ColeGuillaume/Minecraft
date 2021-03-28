// Create your bot
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({ host: 'localhost', port: '61488', username: "Player" });

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
    NestedStateMachine, 
    BehaviorMineBlock} = require("mineflayer-statemachine");
    
// wait for our bot to login.
bot.once("spawn", () =>
{
    // This targets object is used to pass data between different states. It can be left empty.
    const targets = {};

    // Create our states
    const printServerStates = new BehaviorPrintServerStats(bot);
    const findChest = new BehaviorFindBlock(bot, targets);
    const goToChest = new BehaviorMoveTo(bot, targets);

    const breakChest = new BehaviorMineBlock(bot, targets);

  


    const idle = new BehaviorIdle();

    // Create our transitions
    findChest.blocks.push(147);
    findChest.maxDistance = 100000000000000000000;


    const transitions = [

        new StateTransition({ // 0
            parent: printServerStates,
            child: findChest,
            shouldTransition: () => {
                return true;
            }
        }),

        new StateTransition({ // 1
            parent: findChest,
            child: goToChest,
            shouldTransition: () => {
                console.log(targets);
                return true;
            }
        }),

        new StateTransition({ // 2
            parent: goToChest,
            child: breakChest,
            shouldTransition: () => {
                console.log(goToChest.distanceToTarget());
                return goToChest.distanceToTarget() <= 2
            }
        }),

        new StateTransition({
            parent: breakChest,
            child: idle,
            shouldTransition: () => breakChest.isFinished
        }),

        new StateTransition({
            parent: idle,
            child: breakChest,
            shouldTransition: () => false
        })
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