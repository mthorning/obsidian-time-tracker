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

  const store = taskManager.store;

  let tasksWithTimes: TaskWithDuration[];
  $: tasksWithTimes = $store.tasks.map((task) => ({
    ...task,
    duration: dayjs.duration(TaskManager.sumTaskIntervals(task)),
  }));

  const clock = new Clock(() => {
    const task = tasksWithTimes[$store.activeTask];
    task.duration = dayjs.duration(TaskManager.sumTaskIntervals(task));

    tasksWithTimes = [...tasksWithTimes];
  });

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
            <button
              on:click={() => taskManager.stopActiveTask()}
              class="stop-button"
            >
              <Icon icon="square" />
            </button>
          {:else}
            <button
              on:click={() => taskManager.startTask(task.name)}
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
