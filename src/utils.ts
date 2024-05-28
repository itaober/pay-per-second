import dayjs = require("dayjs");

const salaryTypeMap = {
  Monthly: "Monthly",
  Weekly: "Weekly",
  Daily: "Daily",
};

const workDaysMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export type SalaryType = keyof typeof salaryTypeMap;
export type WorkDays = keyof typeof workDaysMap;

export interface ISecondSalaryOptions {
  salary: number;
  salaryType: SalaryType;
  salarySymbol: string;
  workDays: WorkDays[];
  startTime: string;
  endTime: string;
}

const hoursToSeconds = (hours: number): number => hours * 60 * 60;

const getCurrentMonthWorkDays = (workDays: WorkDays[]): number => {
  let currentMonthWorkDays = 0;

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  const daysInMonth = dayjs(`${currentYear}-${currentMonth}`).daysInMonth();

  const workDayList = workDays.map((day) => workDaysMap[day]);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs(`${currentYear}-${currentMonth}-${day}`);
    const dayOfWeek = date.day();

    if (workDayList.includes(dayOfWeek)) {
      currentMonthWorkDays++;
    }
  }

  return currentMonthWorkDays;
};

export const getSecondSalary = (options: Required<ISecondSalaryOptions>) => {
  const { salary, salaryType, workDays, startTime, endTime } = options;

  const start = dayjs(`1999-03-24 ${startTime}`, "YYYY-MM-DD HH:mm");
  const end = dayjs(`1999-03-24 ${endTime}`, "YYYY-MM-DD HH:mm");

  const workHoursPerDay = end.diff(start, "hour", true);

  switch (salaryType) {
    case "Monthly": {
      const currentMonthWorkDays = getCurrentMonthWorkDays(workDays);
      const workHours = currentMonthWorkDays * workHoursPerDay;
      return salary / hoursToSeconds(workHours);
    }
    case "Weekly": {
      const workHours = workDays.length * workHoursPerDay;
      return salary / hoursToSeconds(workHours);
    }
    case "Daily": {
      return salary / hoursToSeconds(workHoursPerDay);
    }
    default: {
      const currentMonthWorkDays = getCurrentMonthWorkDays(workDays);
      const workHours = currentMonthWorkDays * workHoursPerDay;
      return salary / hoursToSeconds(workHours);
    }
  }
};

export const getCurrentTimeSecondSalary = (
  options: ISecondSalaryOptions,
  secondSalary: number
) => {
  const {
    salary,
    salaryType = "Monthly",
    salarySymbol = "💰",
    workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime = "9:00",
    endTime = "18:00",
  } = options;

  if (!salary) {
    return `${salarySymbol}0.0000`;
  }

  const now = dayjs();

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const workStartTime = now.hour(startHour).minute(startMinute).second(0);
  const workEndTime = now.hour(endHour).minute(endMinute).second(0);

  if (now.isBefore(workStartTime) || now.isSame(workStartTime)) {
    return `${salarySymbol}0.0000`;
  }
  if (now.isAfter(workEndTime) || now.isSame(workEndTime)) {
    const allDayWorkedSeconds = workEndTime.diff(workStartTime, "second");
    return `${salarySymbol}${(secondSalary * allDayWorkedSeconds).toFixed(4)}`;
  }

  const workedSeconds = now.diff(workStartTime, "second");

  return `${salarySymbol}${(secondSalary * workedSeconds).toFixed(4)}`;
};
