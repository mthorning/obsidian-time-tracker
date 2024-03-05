<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import dayjs from "dayjs";
  import { TaskManager } from "../classes";
  import type { TaskWithDuration } from "./EditTask.svelte";
  import Icon from "./Icon.svelte";

  const dispatch = createEventDispatcher<{ editTask: TaskWithDuration }>();

  export let taskManager: TaskManager;

  const store = taskManager.store;

  let tasksWithTimes: TaskWithDuration[];
  $: tasksWithTimes = $store.tasks.map((task) => ({
    ...task,
    duration: dayjs.duration(TaskManager.sumTaskIntervals(task)),
  }));

  let timerIntervalId: number | null = null;
  function startClock() {
    if (timerIntervalId) {
      window.clearInterval(timerIntervalId);
    }

    const update = () => {
      const task = tasksWithTimes[$store.activeTask];
      task.duration = dayjs.duration(TaskManager.sumTaskIntervals(task));

      tasksWithTimes = [...tasksWithTimes];
    };

    timerIntervalId = window.setInterval(update, 500);
  }

  $: {
    if ($store.activeTask !== -1) {
      startClock();
    } else if (timerIntervalId) {
      window.clearInterval(timerIntervalId);
    }
  }
</script>

<div>
  {#if tasksWithTimes.length === 0}
    <p>No timers are running at the moment</p>
  {/if}
  <ul>
    {#each tasksWithTimes as task}
      <li>
        <div class="main-li">
          <span class="name">{task.name}</span>
          <span>{taskManager.formatDuration(task.duration)}</span>
          {#if $store.tasks[$store.activeTask]?.name === task.name}
            <button on:click={() => taskManager.stopActiveTask()} class="stop-button">
              <Icon icon="square"/>
            </button>
          {:else}
            <button on:click={() => taskManager.startTask(task.name)} class="start-button">
              <Icon icon="play"/>
            </button>
          {/if}
        </div>
        {#if $store.tasks[$store.activeTask]?.name !== task.name}
          <div class="footer-buttons">
            <button on:click={() => dispatch("editTask", task)}>Edit</button>
            <button on:click={() => taskManager.resetTaskTimes(task.name)}
              >Reset</button
            >
            <button on:click={() => taskManager.deleteTask(task.name)}
              >Delete</button
            >
          </div>
        {/if}
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
  .name {
    flex-grow: 1;
    word-break: break-word;
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
