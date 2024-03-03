interface Task {
  name: string;
  intervals: [number, number | null][];
}

export class StateManager {
  activeTask: Task | null = null;
  tasks = new Map<string, Task>();

  startTask(name: string) {
    const now = Date.now();
    let task = this.tasks.get(name);

    if(!task) {
      task = {name,  intervals: []};
      this.tasks.set(name, task);
    }

    if(task === this.activeTask) return;
    task.intervals.push([now, null]);
    if(this.activeTask) {
      this.recordActiveTaskEndTime();
    }

    this.activeTask = task
  }

  recordActiveTaskEndTime(now: number = Date.now()) {
    if(!this.activeTask) return;
    this.activeTask.intervals[this.activeTask.intervals.length - 1][1] = now;
  }

  stopActiveTask(): string | undefined {
    if(!this.activeTask) return;
    this.recordActiveTaskEndTime();
    const { name } = this.activeTask;
    this.activeTask = null;
    return name;
  }

  getActiveTaskDuration(): { name: string, duration: number } | null {
    if(!this.activeTask) return null;
    return {
      name: this.activeTask.name,
      duration: this.sumTaskIntervals(this.activeTask)
    }
  }

  sumTaskIntervals(task: Task): number {
    return task.intervals.reduce((acc, [start, end]) => {
      return acc + ((end ?? Date.now()) - start);
    }, 0)
  }

  serialize(): string {
    const data = Array.from(this.tasks.values());
    return JSON.stringify(data, null, 2);
  }

  forEachTask(fn: (task: Task) => void) {
    this.tasks.forEach(fn);
  }

  hasActiveTask() {
    return !!this.activeTask;
  }

}
