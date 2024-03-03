import { ItemView, WorkspaceLeaf } from "obsidian";
import  dayjs from 'dayjs';

import type TimeTracker from '../main';

export class TaskListView extends ItemView {
  icon = "timer";
  static identifier = "task-list-view"

  timeTracker: TimeTracker;
  ul: HTMLUListElement

  constructor(leaf: WorkspaceLeaf, timeTracker: TimeTracker) {
    super(leaf);
    this.timeTracker = timeTracker;
  }

  getViewType() {
    return TaskListView.identifier;
  }

  getDisplayText() {
    return "Task times";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Task times" });
    this.ul = container.createEl("ul", { attr: { style: "padding: 0; margin: 0" } });
  }

  updateData() {
    this.ul.empty();
    this.timeTracker.stateManager.forEachTask((task) => {
      this.ul
        .createEl("li", { text: task.name, cls: "task-list-task-li" })
        .createEl("span", { text: dayjs.duration(
          this.timeTracker.stateManager.sumTaskIntervals(task)
        ).format(this.timeTracker.settings.taskListFormat)});
    });
  }

  async onClose() {
    // Nothing to clean up.
  }
} 
