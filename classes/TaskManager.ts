import { writable, get } from "svelte/store";
import dayjs from "dayjs";

import type { Writable } from "svelte/store";
import type TimeTracker from "../main";

interface BaseInterval {
  description?: string;
}
export interface ActiveInterval extends BaseInterval {
  start: number;
  end: null;
}
export interface FinishedInterval extends BaseInterval {
  start: number;
  end: number;
}

export type Interval = ActiveInterval | FinishedInterval;

export type Task = {
  name: string;
  intervals: Interval[];
  history: string[]; // Add history array to each task
};

type StoreData = {
  activeTask: number;
  tasks: Task[];
};
export class TaskManager {
  store: Writable<StoreData> = writable({
    activeTask: -1,
    tasks: [],
  });
  timeTracker: TimeTracker;

  constructor(timeTracker: TimeTracker) {
    this.timeTracker = timeTracker;
    this.loadDataAndWatchForChanges();
  }

  async loadDataAndWatchForChanges() {
    const data = await this.timeTracker.loadData();
    this.store.set({
      activeTask: data?.activeTask ?? -1,
      tasks: (data?.tasks ?? []).map((task: Task) => ({
        ...task,
        history: task.history || [],
      })),
    });

    this.store.subscribe((storeData) => {
      this.timeTracker.saveData({
        ...this.timeTracker.settings,
        ...storeData,
      });
    });
  }

  static sumTaskIntervals(task: {
    intervals: { start: number; end: number | null }[];
  }): number {
    if (!task) return 0;
    return task.intervals.reduce((acc, { start, end }) => {
      return acc + ((end ?? Date.now()) - start);
    }, 0);
  }

  formatDuration(duration: ReturnType<typeof dayjs.duration>): string {
    let days = duration.asDays();
    let plusOrMinus = "+";
    if (days < 0) plusOrMinus = "-";
    days = Math.floor(Math.abs(days));

    if (days >= 1) {
      return `(${plusOrMinus}${days} day${days === 1 ? "" : "s"}) ${duration
        .subtract(days, "d")
        .format(this.timeTracker.settings.taskListFormat)}`;
    }

    return duration.format(this.timeTracker.settings.taskListFormat);
  }

  startTask({
    name: utName,
    description: utDesc,
  }: {
    name: string;
    description?: string;
  }) {
    const name = utName.trim();
    const description = utDesc?.trim();

    const now = Date.now();

    this.store.update((storeData) => {
      const { tasks: prevTasks, activeTask } = storeData;
      let tasks = [...prevTasks];
      let taskIdx = tasks.findIndex((t) => t.name === name);

      if (activeTask !== -1) {
        if (taskIdx === activeTask) return storeData;
        tasks = this.recordActiveTaskEndTime({ tasks, activeTask }, now).tasks;
      }

      if (taskIdx === -1) {
        const newTask = {
          name,
          intervals: [],
          history: [],
        };
        tasks = [newTask, ...tasks];
        taskIdx = 0;
      }

      // Add description to history if provided
      if (description) {
        this.addToTaskHistory(tasks[taskIdx], description);
      }

      const intervals = tasks[taskIdx].intervals;
      intervals.push({
        start: now,
        end: null,
        ...(description
          ? { description }
          : intervals[intervals.length - 1]?.description
            ? { description: intervals[intervals.length - 1].description }
            : {}),
      });

      //move task to the top of the list:
      tasks.unshift(tasks.splice(taskIdx, 1)[0]);

      return { ...storeData, tasks, activeTask: 0 };
    });
  }

  private addToTaskHistory(task: Task, description: string) {
    if (!description) return;
    
    // Remove if already exists (to avoid duplicates)
    const index = task.history.indexOf(description);
    if (index > -1) {
      task.history.splice(index, 1);
    }
    
    // Add to front of array
    task.history.unshift(description);
    
    // Strictly limit to 5 items
    while (task.history.length > 5) {
      task.history.pop();
    }
  }

  recordActiveTaskEndTime(
    storeData: StoreData,
    now: number = Date.now()
  ): StoreData {
    const { tasks, activeTask } = storeData;
    if (activeTask === -1) return storeData;
    const newTasks = [...tasks];

    tasks[activeTask].intervals = tasks[activeTask].intervals.map(
      (interval) => {
        if (!interval.end) interval.end = now;
        return interval;
      }
    );
    return { ...storeData, tasks: newTasks };
  }

  stopActiveTask(): string | undefined {
    let name: string | undefined;

    this.store.update((storeData) => {
      const { activeTask } = storeData;
      if (activeTask === -1) return storeData;

      const { tasks } = this.recordActiveTaskEndTime(storeData);
      name = tasks[activeTask].name;

      return { ...storeData, activeTask: -1 };
    });

    return name;
  }

  getActiveTask(): Task | null {
    const { tasks, activeTask } = get(this.store);
    return activeTask === -1 ? null : tasks[activeTask];
  }

  hasActiveTask() {
    return !!this.getActiveTask();
  }

  resetTaskTimes(name: string) {
    this.store.update((storeData) => ({
      ...storeData,
      tasks: storeData.tasks.map((task) =>
        task.name === name
          ? { ...task, intervals: [] } // Keep the history array, only reset intervals
          : task
      ),
    }));
  }

  deleteTask(name: string) {
    this.store.update((storeData) => ({
      ...storeData,
      tasks: storeData.tasks.filter((task) => task.name !== name),
    }));
  }

  updateTask(oldName: string, newTask: Partial<Task>) {
    this.store.update((storeData) => {
      const { tasks } = storeData;
      const newTasks = [...tasks];

      const idx = tasks.findIndex((task) => task.name === oldName);
      newTasks[idx] = { ...tasks[idx], ...newTask };
      return { ...storeData, tasks: newTasks };
    });
  }

  changeCurrentTaskIntervalDescription(description: string) {
    this.store.update((storeData) => {
      const { tasks, activeTask } = storeData;
      if (activeTask === -1) return storeData;

      const newTasks = [...tasks];
      const activeTaskObj = newTasks[activeTask];
      const activeTaskIntervals = activeTaskObj.intervals;
      const activeInterval = activeTaskIntervals.find(
        (interval) => !interval.end
      );

      if (activeInterval) {
        activeInterval.description = description;
        // Add to history when changing description
        this.addToTaskHistory(activeTaskObj, description);
      }

      return { ...storeData, tasks: newTasks };
    });
  }
}
