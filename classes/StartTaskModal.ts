import { App, Modal, Setting } from "obsidian";

import type  TimeTracker  from "../main";

export class StartTaskModal extends Modal {
  result: string = '';
  onSubmit: (result: string) => void;
  onStopTimer: () => void;
  timeTracker: TimeTracker;

  constructor(timeTracker: TimeTracker, app: App, onSubmit: (result: string) => void, onStopTimer: () => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.onStopTimer = onStopTimer;
    this.timeTracker = timeTracker;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: "Start task" });

    const nameInput = new Setting(contentEl)
      .setName("Name:");

    nameInput.settingEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if(this.result) {
          this.onSubmit(this.result);
        }
        this.close();
      }
    });

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
          this.close();
          this.onSubmit(this.result);
        })
    );

    nameInput.addText((text) => 
      text.onChange((value) => {
        buttons.setDisabled(!value);
        this.result = value
      }));
    
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
