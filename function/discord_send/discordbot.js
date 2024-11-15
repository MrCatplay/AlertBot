const { WebhookClient, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { save } = require('../Save_sword/save')
const fs = require('fs')

async function startdiscordbot(token, player, bot) {
    // console.log(player)
    if (!player.cord || !player.cord.x || !player.cord.y || !player.cord.z) {
        console.error("Ошибка: player.cord не содержит координаты.");
        return;
    }

    const webhookClient = new WebhookClient({ url: token });
    const attachment = new AttachmentBuilder(`./assets/player/${player.username}_output.png`);

    // Форматируем координаты
    const formattedCoords = `X: ${player.cord.x.toFixed(1)}, Y: ${player.cord.y.toFixed(1)}, Z: ${player.cord.z.toFixed(1)}`;

    try {

        const embed = new EmbedBuilder()
            .setColor(0x7FCD37) // Зелёный цвет, символизирующий успех
            .setTitle('Игрок!') // Уникальный заголовок с эмодзи
            .setThumbnail('https://i.imgur.com/eAwyUOL.jpeg')
            .addFields(
                { name: 'Ник', value: player.username, inline: true },
                { name: 'Координаты', value: formattedCoords, inline: true }
            )
            .setFooter({ text: 'Не забудь проверить базу!' }); // Подсказка внизу

        await webhookClient.send({
            username: 'Notifications_bot',
            avatarURL: 'https://i.imgur.com/fJgJlL0.jpeg',
            embeds: [embed],
            files: [attachment]
        });

        // console.log('Сообщение отправлено');
        console.log(player.username)
        fs.unlinkSync(`./assets/player/${player.username}_output.png`);
        // console.log('Картинка удалена');
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
    }
}


module.exports = { startdiscordbot }