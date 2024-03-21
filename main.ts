import { WorkspaceLeaf, Plugin } from 'obsidian';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TaskManager, StartTaskModal, TaskListView } from './classes';

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
  taskManager: TaskManager = new TaskManager(this);
  statusBar?: HTMLElement;

	async onload() {
		await this.loadSettings();

    const onTaskStart = (value: { name: string, description?: string }) => {
      this.taskManager.startTask(value)
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
        this.taskManager.stopActiveTask()
      },
		});


    this.registerView(
      TaskListView.identifier,
      (leaf) => new TaskListView(
        leaf,
        this.taskManager,
        this.settings,
        startTaskModal.open.bind(startTaskModal),
      ),
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
    this.taskManager.store.subscribe(({activeTask: idx, tasks }) => {
      const activeTask = tasks[idx];

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
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if(!leaf) return;
      await leaf.setViewState({ type: TaskListView.identifier, active: true });
    }

    if(this.settings.showSidebarOnTimerStart) workspace.revealLeaf(leaf);
  }
}
