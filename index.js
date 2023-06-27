const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      switch (action) {
        case "Criar conta":
          createAccount();
          break;

        case "Consultar saldo":
          //to do
          break;

        case "Depositar":
          //to do
          break;

        case "Sacar":
          //to do
          break;

        case "Sair":
          //to do
          console.log(
            chalk.bgBlue.black("Obrigado pela preferência, volte sempre!")
          );
          process.exit();
          break;
        default:
          break;
      }
    })
    .catch((err) => console.log(err));
}

function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black("Esse nome já existe, escolha outro!"));
        buildAccount(); //pergunta o nome novamente, sem exibir as msgs do createAcount
        return;
      }

      fs.writeFile(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        function (err) {
          console.log(err);
        }
      );
      console.log(chalk.green("Parabéns, sua conta foi criada"));
      operation();
    })
    .catch((err) => console.log(err));
}
