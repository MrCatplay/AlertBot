const fs = require('fs');
const path = require('path')
const readline = require('readline');
const { exec } = require('child_process');
const configPath = './json/config.json';

console.log(`\x1b[38;2;128;0;128m
▓█████▄ ▓█████  ▄▄▄        ▄████  ▒█████      ██▓     ▒█████  ▒██   ██▒
▒██▀ ██▌▓█   ▀ ▒████▄     ██▒ ▀█▒▒██▒  ██▒   ▓██▒    ▒██▒  ██▒▒▒ █ █ ▒░
░██   █▌▒███   ▒██  ▀█▄  ▒██░▄▄▄░▒██░  ██▒   ▒██░    ▒██░  ██▒░░  █   ░
░▓█▄   ▌▒▓█  ▄ ░██▄▄▄▄██ ░▓█  ██▓▒██   ██░   ▒██░    ▒██   ██░ ░ █ █ ▒ 
░▒████▓ ░▒████▒ ▓█   ▓██▒░▒▓███▀▒░ ████▓▒░   ░██████▒░ ████▓▒░▒██▒ ▒██▒
 ▒▒▓  ▒ ░░ ▒░ ░ ▒▒   ▓▒█░ ░▒   ▒ ░ ▒░▒░▒░    ░ ▒░▓  ░░ ▒░▒░▒░ ▒▒ ░ ░▓ ░
 ░ ▒  ▒  ░ ░  ░  ▒   ▒▒ ░  ░   ░   ░ ▒ ▒░    ░ ░ ▒  ░  ░ ▒ ▒░ ░░   ░▒ ░
 ░ ░  ░    ░     ░   ▒   ░ ░   ░ ░ ░ ░ ▒       ░ ░   ░ ░ ░ ▒   ░    ░  
   ░       ░  ░      ░  ░      ░     ░ ░         ░  ░    ░ ░   ░    ░  
 ░                                                                     
\x1b[0m
`)

function loadingAnimation() {
  const frames = ['|', '/', '-', '\\'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\rЗагрузка... ${frames[i++ % frames.length]}`);
    process.stdout.write('\r'); 
  }, 100);

  return interval;
}

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        // Рекурсивно удаляем папку
        deleteFolderRecursive(currentPath);
      } else {
        // Удаляем файл
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

async function checkFilesInModule(fileSizes) {
  let allFilesExist = true; // Переменная для отслеживания наличия всех файлов
  let node_modules = false

  for (const folder in fileSizes) {
    for (const file in fileSizes[folder]) {
      const expectedSize = fileSizes[folder][file];
      const filePath = path.join(__dirname, folder, file); // Полный путь к файлу

      if (!fs.existsSync(filePath)) {

      } else {
        const actualSize = fs.statSync(filePath).size; // Получаем размер файла
        if (actualSize !== expectedSize) {
          console.log(`\x1b[1m\x1b[41mФайл ${filePath} повреждён ${actualSize}\x1b[0m`); // 
          if (filePath.includes('node_modules')) {
            const dirPath = path.join(__dirname, 'node_modules');
            deleteFolderRecursive(dirPath);
            node_modules = true
            allFilesExist = false
          } else {
            allFilesExist = false
          }
        }
      }
    }
  }

  if (allFilesExist) {
    console.log('\x1b[1m\x1b[42mВсе файлы в порядке\x1b[0m');
    main()
  } else {
    if (node_modules) {
      const loading = loadingAnimation();
      exec('npm i', (error, stdout, stderr) => {
        clearInterval(loading);

        // Логика для вывода статуса установки
        const installedPackages = stdout.split('\n').filter(line => line.includes('added')).map(line => line.trim());
        installedPackages.forEach(pkg => {
          console.log(`\x1b[1m\x1b[42mЗагрузка ${pkg} - завершена\x1b[0m`);
        });

        const fileSizes = JSON.parse(fs.readFileSync('./json/file_sizes.json', 'utf8'));
        checkFilesInModule(fileSizes)
      });
    } else {
      process.exit();
    }
  }

  return allFilesExist; // Возвращаем результат проверки
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

// Основная функция
async function main() {
  let config;

  if (fs.existsSync(configPath)) {
    const rawData = fs.readFileSync(configPath);
    config = JSON.parse(rawData);
  } else {
    config = {};
  }

  const options_name = ['discord-webhook', 'введите ник бота', 'введите ник основного аккаунта', 'введите нужную анархию'];
  const options = ['discordwebhook', 'username', 'mainusername', 'anarchy'];

  for (let i = 0; i < options.length; i++) {
    const key = options[i];
    const name = options_name[i]

    if (!config[key]) {
      config[key] = await askQuestion(`Введите ${name}: `);
    } else {
      // Изменяем вывод для discordtoken
      if (key === 'discordwebhook') {
        const shortenedToken = config[key].substring(0, 10) + '...' + config[key].substring(config[key].length - 10);
        const change = await askQuestion(`Текущие значение ${name}: ${shortenedToken}. Хотите изменить? (да): `);
        if (change.toLowerCase() === 'да') {
          config[key] = await askQuestion(`Введите новое значение для ${name}: `);
        }
      } else {
        const change = await askQuestion(`Текущие значение ${name}: ${config[key]}. Хотите изменить? (да): `);
        if (change.toLowerCase() === 'да') {
          config[key] = await askQuestion(`Введите новое значение для ${name}: `);
        }
      }
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  const command = `node function/main.js ${config.discordwebhook} ${config.username} ${config.mainusername} ${config.anarchy}`;
  // console.log(command)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка выполнения: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Ошибка: ${stderr}`);
      return;
    }
  });
}

if (fs.existsSync('node_modules')) {
  const fileSizesPath = './json/file_sizes.json';

  if (fs.existsSync(fileSizesPath)) {
    const fileSizes = JSON.parse(fs.readFileSync(fileSizesPath, 'utf8'));

    if (!checkFilesInModule(fileSizes)) {
      const loading = loadingAnimation();
      exec('npm i', (error, stdout, stderr) => {
        clearInterval(loading);

        // Логика для вывода статуса установки
        const installedPackages = stdout.split('\n').filter(line => line.includes('added')).map(line => line.trim());
        installedPackages.forEach(pkg => {
          console.log(`\x1b[1m\x1b[42mЗагрузка ${pkg} - завершена\x1b[0m`);
        });

        main();
      });
    } else {
      // main();
    }
  } else {
    console.error("Файл file_sizes.json не найден.");
  }
} else {
  const loading = loadingAnimation();
  exec('npm i', (error, stdout, stderr) => {
    clearInterval(loading);

    // Логика для вывода статуса установки
    const installedPackages = stdout.split('\n').filter(line => line.includes('added')).map(line => line.trim());
    installedPackages.forEach(pkg => {
      console.log(`\x1b[1m\x1b[42mЗагрузка ${pkg} - завершена\x1b[0m`);
    });

    main();
  });
}
