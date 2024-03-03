import { WorkspaceLeaf, Plugin } from 'obsidian';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TaskManager, StartTaskModal, TaskListView } from './classes';

import type { Task } from './classes';

dayjs.extend(duration)
dayjs.extend(relativeTime)

export interface TimeTrackerSettings { 
  statusBarUpdateInterval: number;
  showInStatusBar: boolean;
  taskListFormat: string;
  showSidebarOnTimerStart: boolean;
}

const DEFAULT_SETTINGS: TimeTrackerSettings = {
  statusBarUpdateInterval: 15,
  showInStatusBar: true,
  taskListFormat: 'HH:mm:ss',
  showSidebarOnTimerStart: true,
}

export default class TimeTracker extends Plugin {
	settings: TimeTrackerSettings = DEFAULT_SETTINGS;
  taskManager: TaskManager = new TaskManager();
  statusBar?: HTMLElement;

	async onload() {
		await this.loadSettings();

    const onTaskStart = (name: string) => {
      this.taskManager.startTask(name)
      this.activateTaskListView();
    }

    const onTimerStop = () => {
      this.taskManager.stopActiveTask();
    }

		const startTaskModal = new StartTaskModal(
      this,
      this.app, 
      onTaskStart, 
      onTimerStop,
    );

		this.addRibbonIcon('timer', 'Start task timer', () => startTaskModal.open());
		this.addCommand({
			id: 'start-task-timer',
			name: 'Start task timer',
			callback: () => startTaskModal.open(),
		});

		this.addCommand({
			id: 'stop-active-task-timer',
			name: 'Stop active task timer',
			callback: () => {
        const activeTaskName = this.taskManager.stopActiveTask()
      },
		});


    this.registerView(
      TaskListView.identifier,
      (leaf) => new TaskListView(leaf, this.taskManager, this.settings),
    );

    if(this.settings.showInStatusBar) this.startStatusBar();
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

  startStatusBar() {
    const statusBar = this.addStatusBarItem();

    let interval: number | null = null;
    this.taskManager.activeTask.subscribe(activeTask => {

      if(!activeTask) {
        statusBar.empty();
        return;
      }

      const update = () => {
        statusBar.empty();

        const duration = dayjs.duration(TaskManager.sumTaskIntervals(
          activeTask
        ));
        statusBar.setText(`Working on ${activeTask.name} for ${duration.humanize()}`);
      }
      update();

      if(interval) clearInterval(interval);
      interval = this.registerInterval(window.setInterval(
        update,
        this.settings.statusBarUpdateInterval * 1000
      ));

    });

  }

  async activateTaskListView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(TaskListView.identifier);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getRightLeaf(false);
      if(!leaf) return;
      await leaf.setViewState({ type: TaskListView.identifier, active: true });
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    if(this.settings.showSidebarOnTimerStart) workspace.revealLeaf(leaf);
  }
}
