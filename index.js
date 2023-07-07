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
          "Transferir",
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
          getAccountBalance();
          break;

        case "Depositar":
          deposit();
          break;

        case "Sacar":
          withdraw();
          break;

        case "Transferir":
          transferAmountAccounts();
          break;

        case "Sair":
          console.log(
            chalk.bgBlue.black("Obrigado pela preferência, volte sempre!")
          );
          process.exit();
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

function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      //Verificar se a conta existe
      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          //add an amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })

    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black("Essa conta não existe..."));
    return false;
  } else {
    return true;
  }
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"));
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => console.log(err)
  );
  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta`)
  );
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
}

function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);
      console.log(chalk.bgBlue.black(`Saldo de: ${accountData.balance}`));
      operation();
    })
    .catch((err) => console.log(err));
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([{ name: "amount", message: "Quanto você deseja sacar?" }])
        .then((answer) => {
          const amount = answer["amount"];
          removeAmount(accountName, amount);
        })

        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"));
    return;
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponível"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => console.log(err)
  );
  console.log(chalk.bgGreen.black(`Foi realizado um saque de R$${amount}`));
  operation();
}

function transferAmountAccounts() {
  inquirer
    .prompt([
      {
        name: "accountSender",
        message: "Qual a sua conta?",
      },
    ])
    .then((answer) => {
      const accountSender = answer["accountSender"];

      if (!checkAccount(accountSender)) {
        return transferAmountAccounts();
      }

      inquirer
        .prompt([
          {
            name: "accountReceiver",
            message: "Para qual conta você deseja transferir?",
          },
        ])
        .then((answer) => {
          const accountReceiver = answer["accountReceiver"];
          if (!checkAccount(accountReceiver)) {
            return transferAmountAccounts();
          }
          inquirer
            .prompt([
              {
                name: "amount",
                message: "Qual o valor da transferência?",
              },
            ])
            .then((answer) => {
              const amount = answer["amount"];
              transfer(accountSender, accountReceiver, amount);
            });
        });
    });
}

function transfer(accountSender, accountReceiver, amount) {
  const accountSenderData = getAccount(accountSender);
  const accountReceiverData = getAccount(accountReceiver);
  const date = new Date();

  if (!amount) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"));
    return;
  }

  if (accountSenderData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponível"));
    return transferAmountAccounts();
  }

  accountSenderData.balance =
    parseFloat(accountSenderData.balance) - parseFloat(amount);

  accountReceiverData.balance =
    parseFloat(accountReceiverData.balance) + parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountSender}.json`,
    JSON.stringify(accountSenderData),
    (err) => console.log(err)
  );

  fs.writeFileSync(
    `accounts/${accountReceiver}.json`,
    JSON.stringify(accountReceiverData),
    (err) => console.log(err)
  );
  saveHistory(accountSender, accountReceiver, amount, date);

  console.log(
    chalk.bgGreen.black(
      `Foi realizado uma transfêrencia de ${accountSender} para ${accountReceiver}, no valor de R$${amount}`
    )
  );

  operation();
}

function formatTime(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${formattedMonth} - ${formattedDay} - ${year} at ${formattedHours}:${formattedMinutes}`;
}

function saveHistory(accountSender, accountReceiver, amount, date) {
  if (!fs.existsSync("history")) {
    fs.mkdirSync("history");
  }

  const historyFilePath = "history/transferHistory.json";

  const transferData = {
    "Sent by": accountSender,
    "Received by": accountReceiver,
    Value: amount,
    Date: formatTime(date),
  };

  let transferArray = [];

  if (fs.existsSync(historyFilePath)) {
    const existingData = fs.readFileSync(historyFilePath, "utf-8");
    if (existingData) {
      transferArray = JSON.parse(existingData);
    }
  }

  transferArray.push(transferData);

  const transferArrayJSON = JSON.stringify(transferArray);

  fs.writeFileSync(historyFilePath, transferArrayJSON);
}
