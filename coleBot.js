// Create your bot
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({ host: 'roller.cse.taylor.edu', username: "quickBot" });

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
    NestedStateMachine, 
    BehaviorEquipItem,
    BehaviorMineBlock} = require("mineflayer-statemachine");
    
// wait for our bot to login.
bot.once("spawn", () =>
{
    // This targets object is used to pass data between different states. It can be left empty.
    const targets = {};
    const water = {};

    // targets.position = {}
    // targets.position.x = -136;
    // targets.position.y = 68;
    // targets.position.z = -76;

    const equipSwimCap = new BehaviorEquipItem(bot,targets);
    const findDirt = new BehaviorFindBlock(bot, targets);
    const goToDirt = new BehaviorMoveTo(bot, targets);
    const mineDirt = new BehaviorMineBlock(bot,targets);

    // Create our states
    const printServerStates = new BehaviorPrintServerStats(bot);
    const findWater = new BehaviorFindBlock(bot, targets);
    const goToWater = new BehaviorMoveTo(bot, targets);
    const idle = new BehaviorIdle();

    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const LookAtPlayer = new BehaviorLookAtEntity(bot, targets);
    //const placeBlock = new BehaviorPlaceBlock(bot, targets);

    findWater.blocks.push(26);
    findWater.maxDistance = 10000000000;
    findDirt.blocks.push(9);
    findDirt.maxDistance = 10000000000;
    targets.item = 631;
    //targets.item = 622;

    // Create our transitions
    const transitions = [


        new StateTransition({ // 0
            parent: printServerStates,
            child: equipSwimCap,
            shouldTransition: () => true,
        }),

        new StateTransition({ // 1
            parent: equipSwimCap,
            child: findDirt,
            shouldTransition: () => true,
        }),

        new StateTransition({ // 1
            parent: findDirt,
            child: goToDirt,
            shouldTransition: () => true,
        }),

        new StateTransition({ // 1
            parent: goToDirt,
            child: mineDirt,
            shouldTransition: () => true,
        }),

        new StateTransition({ // 1
            parent: mineDirt,
            child: idle,
            shouldTransition: () => mineDirt.isFinished,
        }),

        // new StateTransition({ // 1
        //     parent: findWater,
        //     child: goToWater,
        //     shouldTransition: () => true
        // }),

        // new StateTransition({ // 2
        //     parent: goToWater,
        //     child: idle,
        //     shouldTransition: () => goToWater.distanceToTarget() < 2,
        // }),

        // new StateTransition({ // 3
        //     parent: idle,
        //     child: goToWater,
        //     shouldTransition: () => true
        //   }),

        // new StateTransition({
        //     parent: getClosestPlayer,
        //     child: followPlayer,
        //     shouldTransition: () => true,
        // }),

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