
// Импортируем библиотеку anarflayer
const anarflayer = require("anarflayer");
const { player } = require('./player.js')
const { loadOrCreateBlacklist } = require('./blacklist.js')
const path = require('path')
const fs = require('fs')

const blacklistFilePath = path.join(__dirname, 'json', 'blacklist.json');

global.cooldown = 10 * 60 * 1000;
global.playerEvents = {};
global.blacklist = loadOrCreateBlacklist();
global.spawn = false
global.join = false

// Функция для чтения blacklist из файла
function readBlacklist() {
  if (!fs.existsSync(blacklistFilePath)) {
    return [];
  }
  const data = fs.readFileSync(blacklistFilePath, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка при чтении blacklist.json:', error);
    return [];
  }
}

// Функция для записи blacklist в файл
function writeBlacklist(blacklist) {
  fs.writeFileSync(blacklistFilePath, JSON.stringify(blacklist, null, 2), 'utf-8');
}

// Создание клиента для подключения к серверу Minecraft
const bot = anarflayer.createBot({
  host: "fra.holyworld.me", // Адрес сервера
  username: process.argv[3], // Имя пользователя
  port: 25565, // Порт
  version: '1.19.2', // Версия
  hideErrors: false
});

bot.on('spawn', () => {
  if (spawn) return
  spawn = true

  bot.joinAnarchy('lite', process.argv[5])
})

// Обработчик события сообщений
bot.on('messagestr', (message) => {
  console.log(message);

  try {
    const parts = message.split(' '); // Разделяем строку по пробелам
    const arrowIndex = parts.findIndex(element => element === '->');

    if (arrowIndex !== -1) {
      const textBeforeArrow = parts.slice(0, arrowIndex).join(' ').replace('[', '');
      if (textBeforeArrow === process.argv[4]) {
        const blacklistCommandIndex = parts.findIndex(element => element.startsWith(blacklistFilePath));
        if (blacklistCommandIndex !== -1) {
          // Получаем текст после "/blacklist"
          const blacklistCommandArgs = parts.slice(blacklistCommandIndex + 1).join(' ').trim();

          const blacklist = readBlacklist();

          // Проверяем, является ли аргументом команда для добавления или удаления
          if (blacklistCommandArgs.startsWith('add ')) {
            const itemToAdd = blacklistCommandArgs.replace('add ', '').trim();
            if (!blacklist.includes(itemToAdd)) {
              blacklist.push(itemToAdd);
              writeBlacklist(blacklist);
              console.log(`Добавлено в черный список: ${itemToAdd}`);
            } else {
              console.log(`${itemToAdd} уже в черном списке.`);
            }
          } else if (blacklistCommandArgs.startsWith('remove ')) {
            const itemToRemove = blacklistCommandArgs.replace('remove ', '').trim();
            const index = blacklist.indexOf(itemToRemove);
            if (index !== -1) {
              blacklist.splice(index, 1);
              writeBlacklist(blacklist);
              console.log(`Удалено из черного списка: ${itemToRemove}`);
            } else {
              console.log(`${itemToRemove} не найден в черном списке.`);
            }
          } else {
            console.log('Неизвестная команда. Используйте "add <item>" или "remove <item>".');
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});

bot.on('entityMoved', (entity) => {
  if (entity.type === 'player' && entity !== bot.entity) {
    if (join)
    player(bot, entity); // Вызов функции player, если все условия выполнены
  }
});
