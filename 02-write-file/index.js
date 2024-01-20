const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filePath = path.join(__dirname, 'output.txt');
const farewellMessage = 'Good bye!';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const fileStream = fs.createWriteStream(filePath, {
  flags: 'a',
  encoding: 'utf8',
});

const processInput = () => {
  rl.question('Enter text: ', (input) => {
    if (input.trim() === 'exit') {
      console.log(farewellMessage);
      rl.close();
    } else {
      fileStream.write(`${input}\n`, 'utf8', () => {
        processInput();
      });
    }
  });
};

console.log('Wellcome! For exit to enter Ctrl + C or "exit"');
processInput();

rl.on('close', () => {
  fileStream.end();
  process.exit(0);
});

// Event Ctrl+C
rl.on('SIGINT', () => {
  console.log(farewellMessage);
  rl.close();
});
