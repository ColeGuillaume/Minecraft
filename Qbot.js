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

    // Find Water and Go to it
    const findWater = new BehaviorFindBlock(bot, targets);
    const goToWater = new BehaviorMoveTo(bot, targets);

    // Find Dive Zone (water) and jump!
    const findDiveZone = new BehaviorFindBlock(bot, targets);
    const goToDiveZone = new BehaviorMoveTo(bot, targets);

    // Drown yourself
    const idle = new BehaviorIdle();

    // Give IDs for water and dive zone
    findWater.blocks.push(26);
    findWater.maxDistance = 100000000000000000000;

    findDiveZone.blocks.push(26);
    findDiveZone.maxDistance = 100000000000000000000;

    // Create our transitions
    const transitions = [

        new StateTransition({ // 1
            parent: printServerStates,
            child: findWater,
            shouldTransition: () => {
                console.log("left server stats - going to find water");
                return true;
            }
        }),

        new StateTransition({ // 2
            parent: findWater,
            child: goToWater,
            shouldTransition: () => {
                console.log("left find water - going to goToWater");
                return true;
            }
        }),

        new StateTransition({ // 3
            parent: goToWater,
            child: findDiveZone,
            shouldTransition: () => {
                console.log("leaving goToWater going to PlaceDirt");
                return goToWater.distanceToTarget() <= 1.1
            }
        }),

        new StateTransition({ // 5
            parent: findDiveZone,
            child: goToDiveZone,
            shouldTransition: () => {
                console.log("leaving findDiveZone going to goToDiveZone");
                return true;
            }
        }),

        new StateTransition({ // 6
            parent: goToDiveZone,
            child: idle,
            shouldTransition: () => {
                tossNext();
                console.log("leaving goToDiveZone going to idle | drowning");
                return goToDiveZone.distanceToTarget() <= .5
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


function tossNext () {
    if (bot.inventory.items().length === 0) return
    const item = bot.inventory.items()[0]
    bot.tossStack(item, tossNext)
}
