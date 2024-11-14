const { ec } = require('./ec_locater.js')
const { open_enderChest } = require("./open_enderChest.js")
const { inventory_search, ec_search } = require("./inventory_search.js")

let swap = false

async function SwordInEC(bot, ec_block) {
    const inventory = bot.currentWindow.slots;
    const sword = await inventory_search(bot, inventory);

    if (sword.sword == null || sword.emptySlotIndex == null || sword.updatesword == null) {
        console.log('Отсутствуют необходимые данные для перемещения меча');
        return;
    }

    try {
        await bot.moveSlotItem(sword.sword, sword.emptySlotIndex);
        await bot.moveSlotItem(sword.updatesword, sword.sword);
    } catch (err) {
        console.error('Ошибка при перемещении предметов:', err);
    }

    await bot.closeWindow(bot.currentWindow);

    await new Promise(resolve => setTimeout(resolve, 5000));

    swap = true
    await ec_block.then(async function (ecblock) {
        await open_enderChest(bot, ecblock);
    });
}

async function SwordFromEC(bot) {
    const inventory = bot.currentWindow.slots;
    const sword = await ec_search(bot, inventory);

    if (sword.sword == null || sword.emptySlotIndex == null || sword.updatesword == null) {
        console.log('Отсутствуют необходимые данные для перемещения меча');
        return;
    }

    try {
        // console.log(sword)
        await bot.moveSlotItem(sword.updatesword, sword.emptySlotIndex);
        await bot.moveSlotItem(sword.sword, sword.updatesword);
    } catch (err) {
        console.error('Ошибка при перемещении предметов:', err);
    }

    swap = false
    await bot.closeWindow(bot.currentWindow);
}

async function save(bot) {
    const ec_block = ec(bot);

    bot.on('windowOpen', async () => {
        if (!swap) {
            SwordInEC(bot, ec_block)
        } else {
            SwordFromEC(bot)
        }
    });

    await ec_block.then(async function (ecblock) {
        await open_enderChest(bot, ecblock);
    });
}

module.exports = { save }
