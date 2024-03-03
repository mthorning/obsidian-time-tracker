import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf} from 'obsidian';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { StateManager, StartTaskModal, TaskListView } from './classes';

dayjs.extend(duration)

interface TimeTrackerSettings { 
  updateInterval: number;
  showInStatusBar: boolean;
  statusBarFormat: string;
  taskListFormat: string;
  showSidebarOnTimerStart: boolean;
}

const DEFAULT_SETTINGS: TimeTrackerSettings = {
  updateInterval: 1,
  showInStatusBar: true,
  statusBarFormat: 'HH:mm:ss',
  taskListFormat: 'HH:mm:ss',
  showSidebarOnTimerStart: true,
}

export default class TimeTracker extends Plugin {
	settings: TimeTrackerSettings;
  stateManager: StateManager;
  statusBar: HTMLElement | null;

	async onload() {
		await this.loadSettings();
    this.stateManager = new StateManager();

    const onTaskStart = (name: string) => {
      this.stateManager.startTask(name)
      this.updateData();
      this.activateTaskListView();
      new Notice(`Timer started for ${name}`);
    }

    const onTimerStop = () => {
      this.stateManager.stopActiveTask();
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
        const activeTaskName = this.stateManager.stopActiveTask()
        if(activeTaskName) {
          new Notice(`Timer stopped for ${activeTaskName}`);
        }
        this.updateData();
      },
		});

    this.statusBar = this.settings.showInStatusBar ?
      this.addStatusBarItem() : null;

    this.registerView(
      TaskListView.identifier,
      (leaf) => new TaskListView(leaf, this),
    );

    this.registerInterval(window.setInterval(() => {
      this.updateData();
    }, this.settings.updateInterval * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

  updateData() {
    const activeTask = this.stateManager.getActiveTaskDuration();
    if(activeTask) {
      const duration = dayjs.duration( 
        activeTask.duration
      );

      if(this.statusBar) {
        this.statusBar.setText(`${activeTask.name}: ${duration.format(this.settings.statusBarFormat)}`);
      }
    } else {
      if(this.statusBar) this.statusBar.setText('No active task');
    }

    this.app.workspace.getLeavesOfType(TaskListView.identifier).forEach((leaf) => {
      if (leaf.view instanceof TaskListView) {
        leaf.view.updateData();
      }
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
