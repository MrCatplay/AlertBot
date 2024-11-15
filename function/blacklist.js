const path = './json/blacklist.json';
const fs = require('fs');

function loadOrCreateBlacklist() {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify([]), 'utf8');
        console.log("Файл 'blacklist.json' был создан с пустым массивом.");
    }

    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    if (!Array.isArray(data)) {
        console.error("Ошибка: 'blacklist.json' должен содержать массив. Перезаписываем файл.");
        fs.writeFileSync(path, JSON.stringify([]), 'utf8');
        return [];
    }

    return data;
}

module.exports = { loadOrCreateBlacklist }