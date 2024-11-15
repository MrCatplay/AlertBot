const { ec } = require('./ec_locater.js')
const { open_enderChest } = require("./open_enderChest.js")
const { inventory_search, ec_search } = require("./inventory_search.js")
const { loadOrCreateBlacklist } = require('../blacklist.js')

let isExecuting = false;
let player
let swap = false
let player_kd = false
global.yaw = null
global.pitch = null

async function SwordInEC(bot, ec_block) {
    // Проверяем, запущена ли функция
    if (isExecuting) {
        console.log('Функция уже выполняется, повторный запуск отменен.');
        return; // Если функция уже выполняется, выходим
    }

    isExecuting = true; // Устанавливаем флаг, что функция выполняется

    const inventory = bot.currentWindow.slots;
    const sword = await inventory_search(bot, inventory);

    console.log('sword:', sword.sword);
    console.log('emptySlotIndex:', sword.emptySlotIndex);
    console.log('updatesword:', sword.updatesword);

    if (sword.sword === null || sword.emptySlotIndex === null || sword.updatesword === null) {
        console.log('Отсутствуют необходимые данные для перемещения меча');
        isExecuting = false; // Сбрасываем флаг перед выходом
        return;
    }

    try {
        if (bot.currentWindow) {
            await bot.moveSlotItem(sword.sword, sword.emptySlotIndex);
            await bot.moveSlotItem(sword.updatesword, sword.sword);
            await bot.closeWindow(bot.currentWindow);
        }
    } catch (err) {
        console.error('Ошибка при перемещении предметов:', err);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    swap = true;

    console.log(player)
    if (!player || player._idleTimeout == -1) {
        player = setInterval(() => checkNearbyPlayers(bot), 5000);
    }
    
    isExecuting = false; // Сбрасываем флаг после завершения функции
}


async function SwordFromEC(bot) {
    const ec_block = ec(bot);
    await ec_block.then(async function (ecblock) {
        await open_enderChest(bot, ecblock);
    });

    const inventory = bot.currentWindow.slots;
    const sword = await ec_search(bot, inventory);

    if (sword.sword == null || sword.emptySlotIndex == null || sword.updatesword == null) {
        console.log('Отсутствуют необходимые данные для перемещения меча');
        return;
    }

    try {
        // console.log(sword)
        if (bot.currentWindow) {
            await bot.moveSlotItem(sword.updatesword, sword.emptySlotIndex);
            await bot.moveSlotItem(sword.sword, sword.updatesword);
            swap = false
        }
    } catch (err) {
        console.error('Ошибка при перемещении предметов:', err);
    }

    swap = false
    player_kd = false
    if (bot.currentWindow) {
        await bot.closeWindow(bot.currentWindow);
    }

}

function checkNearbyPlayers(bot) {
    const blacklist = loadOrCreateBlacklist();

    const nearbyPlayers = Object.values(bot.entities)
        .filter(entity => entity.type === 'player' && entity !== bot.entity);

    const playersInBlacklist = nearbyPlayers.filter(player => blacklist.includes(player.username));

    if (playersInBlacklist.length > 0) {
        console.log('test2')
        clearInterval(player)
        SwordFromEC(bot); // Действие, если есть игроки в черном списке
    } else if (nearbyPlayers.length > 0) {
        console.log("Есть игроки, но они не в черном списке.");
    } else {
        console.log('test1')
        clearInterval(player)
        SwordFromEC(bot);
    }
}

async function save(bot) {
    if (player_kd) return
    player_kd = true

    console.log('test')
    const ec_block = ec(bot);

    bot.on('windowOpen', async () => {
        if (!swap) {
            SwordInEC(bot, ec_block)
        }

        if (yaw != null || pitch != null) {
            bot.entity.yaw = yaw
            bot.entity.pitch = pitch
        }
    });

    await ec_block.then(async function (ecblock) {
        await open_enderChest(bot, ecblock);
    });
}

module.exports = { save }
