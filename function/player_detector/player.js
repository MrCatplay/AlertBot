const fs = require('fs');
const path = './node_modules/minecraft-data/minecraft-data/data/pc/1.19.2/effects.json'
const { compound } = require('./compound.js')
const { loadOrCreateBlacklist } = require('../blacklist.js')
const https = require('https')
const sharp = require('sharp')

let effectData = {};
const npc_list = ['lite', 'lite120', 'CIT-', 'classic']

try {
    effectData = JSON.parse(fs.readFileSync(path, 'utf8'))
        .reduce((acc, effect) => {
            acc[effect.id] = effect.displayName.replaceAll(' ', '_');
            return acc;
        }, {});
} catch (error) {
    console.error("Failed to load effects.json:", error);
}

function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Ошибка загрузки изображения: ${res.statusCode}`));
            }

            const data = [];
            res.on('data', (chunk) => {
                data.push(chunk);
            });

            res.on('end', () => {
                resolve(Buffer.concat(data));
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function head(index, base64Data) {
    const decodedData = Buffer.from(base64Data, 'base64').toString('utf8');
    const url = JSON.parse(decodedData).textures.SKIN.url;
    const cleanUrl = url.replace('http://textures.minecraft.net/texture/', '');

    const filePath = `./assets/png_files/${cleanUrl}.png`;

    if (!fs.existsSync('./assets/png_files')) {
        fs.mkdirSync('./assets/png_files');
    }

    if (!fs.existsSync(filePath)) {
        console.log(`Файл ${filePath} не найден. Загрузка...`);

        let skinImg;

        skinImg = await downloadImage(`https://mc-heads.net/head/${cleanUrl}`);

        const resizedImage = await sharp(skinImg)
            .resize(28, 28, { fit: 'inside' })
            .toFormat('png')
            .toBuffer();

        const finalImage = await sharp({
            create: {
                width: 32,
                height: 32,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
            .composite([{ input: resizedImage, left: 3, top: 2 }])
            .png()
            .toBuffer();

        await fs.writeFileSync(filePath, finalImage);
        return `${index}: ${cleanUrl + '.png'}`; // Возвращаем cleanUrl
    } else {
        return `${index}: ${cleanUrl + '.png'}`; // Возвращаем cleanUrl
    }
}

async function player(bot) {
    const playerDataList = [];
    const blacklist = loadOrCreateBlacklist()
    const nearbyPlayers = Object.values(bot.entities)
        .filter(entity => entity.type === 'player' && entity !== bot.entity);

    for (const player of nearbyPlayers) { // Use for loop to process each player sequentially
        if (npc_list.includes(player.username)) {
            continue
        }

        if (blacklist.includes(player.username)) {
            continue; // Skip blacklisted players
        }

        // Check if player is in cooldown
        if (playerEvents[player.username] && Date.now() - playerEvents[player.username] < 300000) { // 5 minutes in milliseconds
            // console.log(player.username)
            continue; // Move to the next player
        }

        // Add player to data list if cooldown has passed
        playerEvents[player.username] = Date.now(); // Update cooldown timer

        const equipment = player.equipment
            .map(async (item, index) => {
                if (item && item.name === 'player_head') {
                    const name = item.nbt.value.SkullOwner.value.Properties.value.textures.value.value[0].Value.value;
                    return head(index, name);
                } else if (item && item.name === 'potion') {
                    const potionValue = item.nbt.value.Potion.value;
                    const cleanPotionValue = potionValue.replace('minecraft:long_', '');
                    const potionName = `${item.name}_potion_${cleanPotionValue}`;
                    return `${index}: ${potionName + '.png'}`;
                } else if (item) {
                    return `${index}: ${item.name + '.png'}`;
                } else {
                    return null;
                }
            });

        const effects = Object.entries(player.effects).map(
            ([effectId, effect], index) =>
                `${index + 1}: ${effectData[effectId] + '.png' || 'Unknown Effect'}`
        );

        playerDataList.push({
            username: player.username,
            cord: player.position,
            equipment: equipment,
            effects: effects
        });

        // Wait for the previous compound to finish before processing the next player
        await compound(playerDataList, bot); // This is where the wait happens
    }

    return playerDataList;
}


module.exports = { player };
