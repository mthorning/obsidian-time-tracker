import { writable, get } from "svelte/store";

export type Task = {
  name: string;
  intervals: [number, number | null][];
}

export class TaskManager {
  activeTask = writable<Task | null>(null);
  tasks = writable<Task[]>([]);

  startTask(name: string) {
    const now = Date.now();

    let task: Task | undefined;
    this.tasks.update((tasks) => {
      task = tasks.find(t => t.name === name);
      if(task === get(this.activeTask)) return tasks;

      if(!task) {
        task = {name,  intervals: []};
        tasks.push(task);
      }

      if(this.activeTask) {
        this.recordActiveTaskEndTime(now);
      }

      task.intervals.push([now, null]);
      this.activeTask.set(task);

      return tasks;
    });
  }

  recordActiveTaskEndTime(now: number = Date.now()) {
    this.activeTask.update(activeTask => {
      if(!activeTask) return activeTask;

      activeTask.intervals[activeTask.intervals.length - 1][1] = now;
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

  static sumTaskIntervals(task: Task | null): number {
    if(!task) return 0;
    return task.intervals.reduce((acc, [start, end]) => {
      return acc + ((end ?? Date.now()) - start);
    }, 0)
  }

  hasActiveTask() {
    return !!get(this.activeTask);
  }
}
