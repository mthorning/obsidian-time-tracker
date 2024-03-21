import { App, Modal, Setting, type KeymapEventHandler } from "obsidian";

import type  TimeTracker  from "../main";

type Result = { name: string, description?: string }
export class StartTaskModal extends Modal {
  result: Result = { name: "" };
  onSubmit: (result: Result) => void;
  onStopTimer: () => void;
  timeTracker: TimeTracker;
  keymapEventHandler: KeymapEventHandler | null = null;

  constructor(timeTracker: TimeTracker, app: App, onSubmit: (result: Result) => void, onStopTimer: () => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.onStopTimer = onStopTimer;
    this.timeTracker = timeTracker;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: "Start task" });

    const nameInput = new Setting(contentEl)
      .setName("Task name:");

    new Setting(contentEl)
      .setName("Interval description:")
      .addText((text) => 
      text.onChange((value) => {
        this.result.description = value
      }));

    this.keymapEventHandler = this.scope.register([], 'Enter', () => {
      if(this.result) {
        this.onSubmit(this.result);
        this.close()
      }
    })

    const buttons = new Setting(contentEl);
    if(this.timeTracker.taskManager.hasActiveTask()) {
      buttons.addExtraButton((btn) => 
        btn
          .onClick(this.onStopTimer) 
          .extraSettingsEl.setText("Stop active timer")
      );
    }

    buttons.addButton((btn) => 
      btn
        .setButtonText("Start timer")
        .setCta()
        .setDisabled(true)
        .onClick(() => {
          this.onSubmit(this.result);
          this.close();
        })
    );

    nameInput.addText((text) => 
      text.onChange((value) => {
        buttons.setDisabled(!value);
        this.result.name = value
      }));
    
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    if(this.keymapEventHandler) this.scope.unregister(this.keymapEventHandler)
  }
}
