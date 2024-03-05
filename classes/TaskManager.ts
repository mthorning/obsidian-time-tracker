import { writable, get } from "svelte/store";
import dayjs from "dayjs";

import type { Writable } from "svelte/store";
import type TimeTracker  from "../main";

export type Task = {
  name: string;
  intervals: [number, number | null][];
}

type Store = {
  activeTask: number;
  tasks: Task[];
}
export class TaskManager {
  store: Writable<Store> = writable({
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
      activeTask: data.activeTask ?? -1,
      tasks: data.tasks ?? [],
    });

    this.store.subscribe(({ tasks, activeTask }) => {
      this.timeTracker.saveData({...this.timeTracker.settings, tasks, activeTask });
    });
  }

  static sumTaskIntervals(task: Task | null): number {
    if(!task) return 0;
    return task.intervals.reduce((acc, [start, end]) => {
      return acc + ((end ?? Date.now()) - start);
    }, 0)
  }

  formatDuration(duration: ReturnType<typeof dayjs.duration>): string {
    const days = Math.floor(duration.asDays());
    if (days < 1) return duration.format(this.timeTracker.settings.taskListFormat);
    return `(+${days} day${days === 1 ? "" : "s"}) ${duration
      .subtract(days, "d")
      .format(this.timeTracker.settings.taskListFormat)}`;
  }

  startTask(name: string) {
    const now = Date.now();

    this.store.update((storeData) => {
      const { tasks: prevTasks, activeTask: prevActiveTask } = storeData;
      const activeTask = prevActiveTask;
      let tasks = [...prevTasks];
      let taskIdx = tasks.findIndex(t => t.name === name);

      if(taskIdx === -1) {
        const newTask = {name,  intervals: []};
        tasks = [newTask, ...tasks];
        taskIdx = 0;
      }

      if(taskIdx === activeTask) return storeData;

      if(activeTask !== -1) {
        this.recordActiveTaskEndTime(now);
      }

      tasks[taskIdx].intervals.push([now, null]);

      return { ...storeData, tasks, activeTask: taskIdx };
    });
  }

  recordActiveTaskEndTime(now: number = Date.now()) {
    this.store.update((storeData) => {
      const { tasks, activeTask } = storeData;
      const newTasks = [...tasks];
      if(activeTask === -1) return storeData;

      tasks[activeTask].intervals.forEach(interval => {
        if(!interval[1]) interval[1] = now;
      });
      return { ...storeData, tasks: newTasks};
    });
  }

  stopActiveTask(): string | undefined {
    let name: string | undefined;

    this.store.update(storeData => {
      const { tasks, activeTask } = storeData;
      if(activeTask === -1) return storeData;
      this.recordActiveTaskEndTime();
      name = tasks[activeTask].name;
      return {...storeData, activeTask: -1};
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
    this.store.update(storeData => ({
      ...storeData,
      tasks: storeData.tasks.map(task => task.name === name ? {...task, intervals: []} : task)
    }))
  }

  deleteTask(name: string) {
    this.store.update(storeData => ({
      ...storeData,
      tasks: storeData.tasks.filter(task => task.name !== name)
    }));
  }

  updateTask(oldName: string, newTask: Partial<Task>) {
    this.store.update(storeData => {
      const { tasks } = storeData;
      const newTasks = [...tasks];

      // probably want to check if the name is already in use
      const idx = tasks.findIndex(task => task.name === oldName);
      newTasks[idx] = {...tasks[idx], ...newTask};
      return { ...storeData, tasks: newTasks };
    });
  }
}
