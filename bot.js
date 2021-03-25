// Create your bot
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({ host: 'roller.cse.taylor.edu', username: "FinalBot" });

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
    BehaviorMineBlock,
    BehaviorEquipItem,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine } = require("mineflayer-statemachine");
    
// wait for our bot to login.
bot.once("spawn", () =>
{
    const targets = {};

    const printServerStates = new BehaviorPrintServerStats(bot);
    const findChest = new BehaviorFindBlock(bot, targets);
    const goToChest = new BehaviorMoveTo(bot, targets);
    const breakChest = new BehaviorMineBlock(bot, targets);
    const idle = new BehaviorIdle();

    const equipSwimCap = new BehaviorEquipItem(bot,targets);
    const findDirt = new BehaviorFindBlock(bot, targets);
    const goToDirt = new BehaviorMoveTo(bot, targets);
    const mineDirt = new BehaviorMineBlock(bot,targets);

    // Useful Variables
    findChest.blocks.push(147);
    findChest.maxDistance = 100000000000000000000;

    findDirt.blocks.push(9);
    findDirt.maxDistance = 10000000000;

    targets.item = 670;

    
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
            child: equipSwimCap,
            shouldTransition: () => breakChest.isFinished
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
            shouldTransition: () => {
                console.log(goToDirt.distanceToTarget());
                return goToDirt.distanceToTarget() <= 2
            }
        }),

        new StateTransition({ // 1
            parent: mineDirt,
            child: idle,
            shouldTransition: () => mineDirt.isFinished,
        }),

       
    ];

    const rootLayer = new NestedStateMachine(transitions, printServerStates);
    const stateMachine = new BotStateMachine(bot, rootLayer)
    const webserver = new StateMachineWebserver(bot, stateMachine)
    webserver.startServer()
});