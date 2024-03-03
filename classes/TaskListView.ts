import { ItemView, WorkspaceLeaf } from "obsidian";
import { TaskListView as Component } from '../svelte-components';

import type { TaskManager } from '../classes';
import type { TimeTrackerSettings } from '../main';

export class TaskListView extends ItemView {
  static identifier = "task-list-view"
  taskManager: TaskManager;
  settings: TimeTrackerSettings; 

  component?: Component;
  icon = "timer";

  constructor(leaf: WorkspaceLeaf, taskManager: TaskManager, settings: TimeTrackerSettings) {
    super(leaf);
    this.taskManager = taskManager;
    this.settings = settings;
  }

  getViewType() {
    return TaskListView.identifier;
  }

  getDisplayText() {
    return "Task times";
  }

  async onOpen() {
    this.component = new Component({
      target: this.contentEl,
      props: {
        taskManager: this.taskManager,
        settings: this.settings,
      }      
    });
  }

  async onClose() {
    this.component?.$destroy();
  }
} 
