const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs");

console.log("start");

const operation = () => {
  inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "O que você deseja fazer?",
      choices: ["Criar conta", "Consultar saldo", "Depositar", "Sacar", "Sair"],
    },
  ]);
};
