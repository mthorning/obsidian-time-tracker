import { writable, get } from "svelte/store";

import type { Writable } from "svelte/store";

export type Task = {
  name: string;
  intervals: [number, number | null][];
}

const LOCAL_STORAGE_KEYS = {
  ACTIVE_TASK: 'obsidian-time-tracker-activeTask',
  TASKS: 'obsidian-time-tracker-tasks'
} as const;

export class TaskManager {
  activeTask: Writable<Task | null>;
  tasks: Writable<Task[]>;

  constructor() {
  const activeTaskFromStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_TASK);
  const tasksFromStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS);

  this.activeTask = writable<Task | null>(activeTaskFromStorage ? JSON.parse(activeTaskFromStorage) : null);
  this.tasks = writable<Task[]>(tasksFromStorage ? JSON.parse(tasksFromStorage) : []);

  this.activeTask.subscribe(task => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_TASK, JSON.stringify(task));
  });
  this.tasks.subscribe(tasks => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  });
  }

  static sumTaskIntervals(task: Task | null): number {
    if(!task) return 0;
    return task.intervals.reduce((acc, [start, end]) => {
      return acc + ((end ?? Date.now()) - start);
    }, 0)
  }

  startTask(name: string) {
    const now = Date.now();

    let task: Task | undefined;
    this.tasks.update((tasks) => {
      let newTasks: Task[] = tasks;

      task = tasks.find(t => t.name === name);
      if(task === get(this.activeTask)) return tasks;

      if(!task) {
        task = {name,  intervals: []};
        newTasks = [task, ...tasks];
      }

      if(this.activeTask) {
        this.recordActiveTaskEndTime(now);
      }

      task.intervals.push([now, null]);
      this.activeTask.set(task);

      return newTasks;
    });
  }

  recordActiveTaskEndTime(now: number = Date.now()) {
    this.activeTask.update(activeTask => {
      if(!activeTask) return activeTask;

      activeTask.intervals.forEach(interval => {
        if(!interval[1]) interval[1] = now;
      });
      return activeTask;
    });
  }

  stopActiveTask(): string | undefined {
    let name = get(this.activeTask)?.name;

    this.activeTask.update(activeTask => {
      if(!activeTask) return null;
      this.recordActiveTaskEndTime();
      name = activeTask.name;
      return null;
    });

    return name;
  }

  getActiveTask(): Task | null {
    return get(this.activeTask);
  }

  hasActiveTask() {
    return !!get(this.activeTask);
  }

  resetTaskTimes(name: string) {
    this.tasks.update(tasks => 
        tasks.map(task => task.name === name ? {...task, intervals: []} : task)
    )
  }

  deleteTask(name: string) {
    this.tasks.update(tasks => tasks.filter(task => task.name !== name));
  }
}
