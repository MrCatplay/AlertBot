async function ec(bot) {
    const radius = 2;

    // Получаем текущее местоположение бота
    const { x, y, z } = bot.entity.position;

    // Проходим по всем блокам в радиусе 2 блока
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
                // Вычисляем координаты блока
                const blockX = Math.floor(x) + dx;
                const blockY = Math.floor(y) + dy;
                const blockZ = Math.floor(z) + dz;

                // Получаем блок по координатам
                const block = bot.blockAt(new Vec3(blockX, blockY, blockZ));

                // Печатаем информацию о блоке (можете добавить свои действия с блоками)
                console.log(`Block at (${blockX}, ${blockY}, ${blockZ}): ${block.name}`);
            }
        }
    }
}

module.exports = { ec }