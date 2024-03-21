<script lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  import dayjs from "dayjs";
  import { Clock, TaskManager } from "../classes";
  import Icon from "./Icon.svelte";


  import type { TaskWithDuration } from "./EditTask.svelte";

  const dispatch = createEventDispatcher<{
    editTask: { task: TaskWithDuration; isActive: boolean };
  }>();

  export let taskManager: TaskManager;
  export let startTask: () => void;

  const store = taskManager.store;

  let tasksWithTimes: TaskWithDuration[];
  $: tasksWithTimes = $store.tasks
    .map((task) => ({
      ...task,
      duration: dayjs.duration(TaskManager.sumTaskIntervals(task)),
    }));

  $: totalDuration = tasksWithTimes.reduce(
    (acc, curr) => acc.add(curr.duration),
    dayjs.duration(0),
  );

  const clock = new Clock(() => {
    const task = tasksWithTimes[$store.activeTask];
    const previousDuration = task.duration;
    task.duration = dayjs.duration(TaskManager.sumTaskIntervals(task));

    tasksWithTimes = [...tasksWithTimes];
    totalDuration = totalDuration.add(task.duration.subtract(previousDuration));
  });

  const copy = () => {
    //TODO: Add a toast message

    const totalsHeader = 'Task | Time\n--- | --- \n';

    const taskTotals = tasksWithTimes
      .map((task, i) => {
      return `${i === 0 ? totalsHeader : ''}${task.name} | ${taskManager.formatDuration(task.duration)}`
    })

    const intervalsHeader = 'Task | Start | End | Duration | Description\n--- | --- | --- | ---\n';
    const taskIntervals = tasksWithTimes
      .flatMap((task) => task.intervals
        .map((interval) => ({
          startTs: interval.start,
          endTs: interval.end ?? Date.now(),
          duration: task.duration,
          taskName: task.name,
          description: interval.description,
        }))
      )
      .sort((a, b) => a.startTs - b.startTs)
      .map(({ startTs, endTs, taskName, duration, description }, i) => {
          const fmt = 'HH:mm:ss';
          const start = dayjs(startTs).format(fmt);
          const end = dayjs(endTs).format(fmt);
          return `${i === 0 ? intervalsHeader : ''}${taskName} | ${start} | ${end} | ${duration.format(fmt)} | ${description}`;
      });

    navigator.clipboard.writeText([
      "# Tasks",
      ...taskTotals,
      `TOTAL | **${taskManager.formatDuration(totalDuration)}**`,
      '## Intervals',
      ...taskIntervals,
    ].join("\n"));
  };

  $: {
    if ($store.activeTask !== -1) {
      clock.start();
    } else {
      clock.stop();
    }
  }

  onDestroy(() => {
    clock.stop();
  });
</script>

<div>
  <div class="header">
    <p>{taskManager.formatDuration(totalDuration)}</p>
    <div>
      <button on:click={copy}>
        <Icon icon="copy" />
      </button>
    <button on:click={() => startTask()}>Start task</button>
</div>
  </div>
  {#if tasksWithTimes.length === 0}
    <p>No timers are running at the moment</p>
  {/if}
  <ul>
    {#each tasksWithTimes as task}
      <li>
        <div class="main-li">
          <div class="data">
            <h5 class="name">{task.name}</h5>
            <p class="name">{task.intervals[task.intervals.length - 1]?.description ?? `Interval ${task.intervals.length}`}</p>
          </div>
          <span>{taskManager.formatDuration(task.duration)}</span>
          {#if $store.tasks[$store.activeTask]?.name === task.name}
            <button
              on:click={() => taskManager.stopActiveTask()}
              class="stop-button"
            >
              <Icon icon="square" />
            </button>
          {:else}
            <button
              on:click={() => taskManager.startTask({ name: task.name })}
              class="start-button"
            >
              <Icon icon="play" />
            </button>
          {/if}
        </div>
        <div class="footer-buttons">
          <button
            on:click={() =>
              dispatch("editTask", {
                task,
                isActive: $store.tasks[$store.activeTask]?.name === task.name,
              })}>Edit</button
          >
          {#if $store.tasks[$store.activeTask]?.name !== task.name}
            <button on:click={() => taskManager.resetTaskTimes(task.name)}
              >Reset</button
            >
            <button on:click={() => taskManager.deleteTask(task.name)}
              >Delete</button
            >
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  ul {
    padding: 0;
    margin: 0;
  }
  li {
    position: relative;
    list-style-type: none;
    margin-bottom: var(--size-4-4);
    border: var(--border-width) solid var(--background-modifier-border);
    border-radius: var(--radius-m);
    padding: var(--size-4-4) var(--size-4-4) var(--size-4-8);
  }

  .main-li {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-4-2);
    justify-content: space-between;
    align-items: center;
  }
  button {
    padding: var(--size-4-1);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-4-2);
  }
  .header div {
    display: flex;
    align-items: center;
    gap: var(--size-4-1);
  }
  .data {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  .name {
    word-break: break-word;
    margin: 0;
  }
  .stop-button :global(svg) {
    stroke: var(--text-error);
  }
  .start-button :global(svg) {
    stroke: var(--text-success);
  }
  .footer-buttons {
    display: flex;
    gap: var(--size-4-2);
    position: absolute;
    bottom: 0;
    left: var(--size-4-4);
  }
  .footer-buttons button {
    border: unset;
    background-color: unset;
    box-shadow: unset;
    font-size: var(--font-smaller);
    cursor: var(--cursor-link);
    text-decoration: underline;
    padding: 0;
  }
</style>
