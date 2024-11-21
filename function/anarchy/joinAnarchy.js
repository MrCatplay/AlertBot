async function joinAnarchy(bot, mode, Anarchy) {
    let anarchymenu = false
    let clickWindow = false

    await new Promise(resolve => setTimeout(resolve, 500));
    clickWindow = true;
    bot.chat(`/${mode}`);

    bot.on('windowOpen', async (window) => {
        // console.log('tessdsad')
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!anarchymenu) {
            if (mode != 'lite') {
                if (clickWindow === true) {
                    clickWindow = false;
                    const chestWindow = bot.currentWindow;
                    if (!chestWindow && !chestWindow.slots) return
                    chestWindow.slots.slice(0, 53).forEach((itemStack, index) => {
                        if (itemStack && itemStack.name == 'player_head') {
                            if (Anarchy == itemStack.count) {
                                bot.clickWindow(index, 0, 0);
                                // bot.AutoLeave_start()
                                // console.log(index, itemStack.name, itemStack.count);
                            }
                        }
                    })
                }
            } else {
                if (clickWindow === true) {
                    clickWindow = false;

                    // Проверяем значение Anarchy
                    if (Anarchy >= 1 && Anarchy <= 13) {
                        // console.log('1')
                        bot.clickWindow(1, 0, 0)
                    } else if (Anarchy >= 14 && Anarchy <= 27) {
                        // console.log('2')
                        bot.clickWindow(2, 0, 0)
                    } else if (Anarchy >= 28 && Anarchy <= 37) {
                        // console.log('3')
                        bot.clickWindow(3, 0, 0)
                    } else if (Anarchy >= 38 && Anarchy <= 55) {
                        // console.log('4')
                        bot.clickWindow(4, 0, 0)
                    } else {
                        console.log("Ошибка: значение Anarchy некорректно");
                    }

                    anarchymenu = true
                }
            }
        } else {
            anarchymenu = false
            const chestWindow = bot.currentWindow;
            if (chestWindow && chestWindow.slots) {
                chestWindow.slots.slice(18, 53).forEach(async(itemStack, index) => {
                    // console.log(chestWindow)
                    if (itemStack && itemStack.name == 'player_head') {
                        // console.log(Anarchy)
                        if (Anarchy == itemStack.count) {
                            // console.log(itemStack)
                            // console.log(`${itemStack.count} - ${itemStack.name} - ${itemStack.slot}`)
                            bot.clickWindow(itemStack.slot, 0, 0);
                        }
                    }
                })
            } else {
                anarchymenu = false
                clickWindow = true
                bot.chat(`/${mode}`);
            }
        }
    });
};

module.exports = { joinAnarchy }