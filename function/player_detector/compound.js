const { promises: fs } = require('fs');
const { join } = require('path');
const { loadImage, createCanvas } = require('canvas');
const { startdiscordbot } = require('../discord_send/discordbot.js')
let function_start = false

const equipmentPositions = {
  0: { x: 18, y: 154 },
  1: { x: 60, y: 154 },
  2: { x: 228, y: 154 },
  3: { x: 186, y: 154 },
  4: { x: 144, y: 154 },
  5: { x: 102, y: 154 }
};

async function compound(playerDataList) {
  if (!playerDataList) return;
  function_start = true

  for (const playerData of playerDataList) {
    const mainImagePath = join(__dirname, 'assets', 'main.jpg');
    const mainImage = await loadImage(mainImagePath);

    const canvas = createCanvas(mainImage.width, mainImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(mainImage, 0, 0);

    for (const [index, equipmentItem] of playerData.equipment.entries()) {
      if (!equipmentItem) continue;

      // Получаем строковое значение из Promise
      const equipmentItemString = await equipmentItem;

      if (equipmentItemString == null) continue
      // console.log(equipmentItemString)
      const [number, equipmentFilename] = equipmentItemString.split(':'); // Теперь используем equipmentItemString
      const equipmentImagePath = join(__dirname, 'assets', 'png_files', equipmentFilename.replaceAll('_', '-').trim());

      try {
        const equipmentImage = await loadImage(equipmentImagePath);

        // Если `number` в equipmentPositions, используем его, иначе позиция по умолчанию
        const position = equipmentPositions[parseInt(number)] || { x: 50 * index, y: 100 };

        ctx.drawImage(equipmentImage, position.x, position.y);
      } catch (err) {
        console.error("Ошибка загрузки изображения:", err);
      }
    }

    let x = 5;
    let y = 10;
    let effectsPerRow = 8;

    for (let i = 0; i < playerData.effects.length; i++) {
      const effectItem = playerData.effects[i];
      if (effectItem) {
        const [_, effectFilename] = effectItem.split(':');
        const effectFilenameLowercase = effectFilename.toLowerCase();
        const effectImagePath = join(__dirname, 'assets', 'effects_images', effectFilenameLowercase.trim());
        const effectImage = await loadImage(effectImagePath);

        ctx.drawImage(effectImage, x, y, 30, 30);

        x += 30 + 5;

        if ((i + 1) % effectsPerRow === 0) {
          x = 5;
          y += 40;
        }
      }
    }

    const outputFilename = `./player/${playerDataList[0].username}_output.png`;
    const outputPath = join(__dirname, outputFilename);
    await fs.writeFile(outputPath, canvas.toBuffer());
    // console.log(`Image for ${playerData.username} saved as ${outputFilename}`);
    await startdiscordbot(process.argv[2], playerDataList[0])
  }
}

module.exports = { compound };

