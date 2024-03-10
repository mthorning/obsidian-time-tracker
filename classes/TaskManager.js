import { __awaiter } from "tslib";
import { writable, get } from "svelte/store";
import dayjs from "dayjs";
export class TaskManager {
    constructor(timeTracker) {
        this.store = writable({
            activeTask: -1,
            tasks: [],
        });
        this.timeTracker = timeTracker;
        this.loadDataAndWatchForChanges();
    }
    loadDataAndWatchForChanges() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.timeTracker.loadData();
            this.store.set({
                activeTask: (_a = data === null || data === void 0 ? void 0 : data.activeTask) !== null && _a !== void 0 ? _a : -1,
                tasks: (_b = data === null || data === void 0 ? void 0 : data.tasks) !== null && _b !== void 0 ? _b : [],
            });
            this.store.subscribe(({ tasks, activeTask }) => {
                this.timeTracker.saveData(Object.assign(Object.assign({}, this.timeTracker.settings), { tasks, activeTask }));
            });
        });
    }
    static sumTaskIntervals(task) {
        if (!task)
            return 0;
        return task.intervals.reduce((acc, [start, end]) => {
            return acc + ((end !== null && end !== void 0 ? end : Date.now()) - start);
        }, 0);
    }
    formatDuration(duration) {
        let days = duration.asDays();
        let plusOrMinus = '+';
        if (days < 0)
            plusOrMinus = '-';
        days = Math.floor(Math.abs(days));
        if (days >= 1) {
            return `(${plusOrMinus}${days} day${days === 1 ? "" : "s"}) ${duration
                .subtract(days, "d")
                .format(this.timeTracker.settings.taskListFormat)}`;
        }
        return duration.format(this.timeTracker.settings.taskListFormat);
    }
    startTask(name) {
        const now = Date.now();
        this.store.update((storeData) => {
            const { tasks: prevTasks, activeTask } = storeData;
            let tasks = [...prevTasks];
            let taskIdx = tasks.findIndex(t => t.name === name);
            if (activeTask !== -1) {
                if (taskIdx === activeTask)
                    return storeData;
                tasks = this.recordActiveTaskEndTime({ tasks, activeTask }, now).tasks;
            }
            if (taskIdx === -1) {
                const newTask = { name, intervals: [] };
                tasks = [newTask, ...tasks];
                taskIdx = 0;
            }
            tasks[taskIdx].intervals.push([now, null]);
            return Object.assign(Object.assign({}, storeData), { tasks, activeTask: taskIdx });
        });
    }
    recordActiveTaskEndTime(storeData, now = Date.now()) {
        const { tasks, activeTask } = storeData;
        if (activeTask === -1)
            return storeData;
        const newTasks = [...tasks];
        tasks[activeTask].intervals = tasks[activeTask].intervals.map(interval => {
            if (!interval[1])
                interval[1] = now;
            return interval;
        });
        return Object.assign(Object.assign({}, storeData), { tasks: newTasks });
    }
    stopActiveTask() {
        let name;
        this.store.update(storeData => {
            const { activeTask } = storeData;
            if (activeTask === -1)
                return storeData;
            const { tasks } = this.recordActiveTaskEndTime(storeData);
            name = tasks[activeTask].name;
            return Object.assign(Object.assign({}, storeData), { activeTask: -1 });
        });
        return name;
    }
    getActiveTask() {
        const { tasks, activeTask } = get(this.store);
        return activeTask === -1 ? null : tasks[activeTask];
    }
    hasActiveTask() {
        return !!this.getActiveTask();
    }
    resetTaskTimes(name) {
        this.store.update(storeData => (Object.assign(Object.assign({}, storeData), { tasks: storeData.tasks.map(task => task.name === name ? Object.assign(Object.assign({}, task), { intervals: [] }) : task) })));
    }
    deleteTask(name) {
        this.store.update(storeData => (Object.assign(Object.assign({}, storeData), { tasks: storeData.tasks.filter(task => task.name !== name) })));
    }
    updateTask(oldName, newTask) {
        this.store.update(storeData => {
            const { tasks } = storeData;
            const newTasks = [...tasks];
            const idx = tasks.findIndex(task => task.name === oldName);
            newTasks[idx] = Object.assign(Object.assign({}, tasks[idx]), newTask);
            return Object.assign(Object.assign({}, storeData), { tasks: newTasks });
        });
    }
}
//# sourceMappingURL=TaskManager.js.map