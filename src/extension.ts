import * as vscode from "vscode";
import {
  ISecondSalaryOptions,
  SalaryType,
  WorkDays,
  getCurrentTimeSecondSalary,
  getSecondSalary,
} from "./utils";

let myStatusBarItem: vscode.StatusBarItem;
let interval: NodeJS.Timeout;

const SECOND_SALARY_COMMAND_ID = "itaober.secondSalary";
const SECOND_SALARY_SETTING_ID = "secondSalary";

export function activate({ subscriptions }: vscode.ExtensionContext) {
  // Create a new status bar item
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  myStatusBarItem.command = SECOND_SALARY_COMMAND_ID;
  subscriptions.push(myStatusBarItem);

  const registerOpenSettingsCommands = vscode.commands.registerCommand(
    SECOND_SALARY_COMMAND_ID,
    () => {
      // Open the settings panel
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        SECOND_SALARY_SETTING_ID
      );
    }
  );

  subscriptions.push(registerOpenSettingsCommands);

  updateStatusBarItem();

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(SECOND_SALARY_SETTING_ID)) {
      updateStatusBarItem();
    }
  });
}

function updateStatusBarItem(): void {
  const config = vscode.workspace.getConfiguration(SECOND_SALARY_SETTING_ID);
  const options: ISecondSalaryOptions = {
    salary: config.get<number>("1_salary", 0),
    salaryType: config.get<SalaryType>("2_salaryType", "Monthly"),
    salarySymbol: config.get<string>("3_salarySymbol", "💰"),
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

  const secondSalary = getSecondSalary(options);

  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    myStatusBarItem.text = getCurrentTimeSecondSalary(options, secondSalary);
    myStatusBarItem.show();
  }, 1000);
}
