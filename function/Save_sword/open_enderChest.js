async function open_enderChest(bot, ec_block) {
    if (ec_block == 'commands') {
        await bot.chat('/ec')
        return 'ec'
    } else {
        await bot.openChest(ec_block)
        return 'block'
    }
}

module.exports = { open_enderChest }