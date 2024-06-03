import * as vscode from "vscode";
import {
  IPayPerSecondOptions,
  SalaryType,
  WorkDays,
  getCurrentTimeIncome,
  getSecondsSalary,
  verifyStartAndEndTime,
} from "./utils";

let myStatusBarItem: vscode.StatusBarItem;
let interval: NodeJS.Timeout;

const COMMAND_ID = "itaober.payPerSecond";
const SETTING_ID = "payPerSecond";

export function activate({ subscriptions }: vscode.ExtensionContext) {
  // Create a new status bar item
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  myStatusBarItem.command = COMMAND_ID;
  subscriptions.push(myStatusBarItem);

  const registerOpenSettingsCommands = vscode.commands.registerCommand(
    COMMAND_ID,
    () => {
      // Open the settings panel
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        SETTING_ID
      );
    }
  );

  subscriptions.push(registerOpenSettingsCommands);

  updateStatusBarItem();

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(SETTING_ID)) {
      updateStatusBarItem();
    }
  });
}

function getOptionsBySettings(): IPayPerSecondOptions {
  const config = vscode.workspace.getConfiguration(SETTING_ID);
  const options: IPayPerSecondOptions = {
    salary: config.get<number>("1_salary", 0),
    salaryType: config.get<SalaryType>("2_salaryType", "Monthly"),
    symbol: config.get<string>("3_symbol", "💰"),
    workDays: config.get<WorkDays[]>("4_workDays", [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]),
    startTime: config.get<string>("5_startTime", "09:00"),
    endTime: config.get<string>("6_endTime", "18:00"),
  };

  return options;
}

function updateStatusBarItem(): void {
  const options = getOptionsBySettings();

  const isValidTime = verifyStartAndEndTime(options.startTime, options.endTime);
  if (!isValidTime) {
    options.salary = 0;
  }

  const secondSalary = getSecondsSalary(options);

  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    myStatusBarItem.text = getCurrentTimeIncome(options, secondSalary);
    myStatusBarItem.show();
  }, 1000);
}
