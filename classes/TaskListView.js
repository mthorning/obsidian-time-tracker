import { __awaiter } from "tslib";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { TaskListView as Component } from '../svelte-components';
export class TaskListView extends ItemView {
    constructor(leaf, taskManager, settings, startTask) {
        super(leaf);
        this.icon = "timer";
        this.taskManager = taskManager;
        this.settings = settings;
        this.startTask = startTask;
    }
    getViewType() {
        return TaskListView.identifier;
    }
    getDisplayText() {
        return "Task times";
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.component = new Component({
                target: this.contentEl,
                props: {
                    taskManager: this.taskManager,
                    startTask: this.startTask,
                }
            });
        });
    }
    onClose() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.component) === null || _a === void 0 ? void 0 : _a.$destroy();
        });
    }
}
TaskListView.identifier = "task-list-view";
//# sourceMappingURL=TaskListView.js.map