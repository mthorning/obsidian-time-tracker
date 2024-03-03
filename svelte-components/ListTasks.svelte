<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import dayjs from 'dayjs';
  import { TaskManager } from "../classes";
  import type { TaskWithDuration } from "./EditTask.svelte";

  import type { TimeTrackerSettings} from "../main";

	const dispatch = createEventDispatcher<{ editTask: TaskWithDuration }>();

  export let taskManager: TaskManager;
  export let settings: TimeTrackerSettings;

  const tasks = taskManager.tasks;
  const activeTask = taskManager.activeTask;

  let tasksWithTimes: TaskWithDuration[] = [];

  let timerIntervalId: number | null = null;
  $: {
    if(timerIntervalId) {
      window.clearInterval(timerIntervalId);
    }
    const update = () => tasksWithTimes = $tasks.map((task) => ({
      ...task,
      duration: dayjs
        .duration(TaskManager.sumTaskIntervals(task))
    }));
    update();
    timerIntervalId = window.setInterval(update, 500)
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
          <span>{task.duration.format(settings.taskListFormat)}</span>
          {#if $activeTask?.name === task.name}
            <button on:click={() => taskManager.stopActiveTask()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stop-icon lucide lucide-square">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
              </svg>
            </button>
          {:else}
            <button on:click={() => taskManager.startTask(task.name)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="start-icon lucide lucide-play">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
          {/if}
        </div>
        {#if $activeTask?.name !== task.name}
          <div class="footer-buttons">
            <button on:click={() => taskManager.resetTaskTimes(task.name)}>Reset</button>
            <button on:click={() => dispatch('editTask', task )}>Edit</button>
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
    gap: var(--size-4-2);
    justify-content: space-between;
    align-items: center;
  }
  button {
    padding: var(--size-4-1);
  }
  .name {
    flex-grow: 1;
  }
  .stop-icon {
    stroke: var(--text-error);
  }
  .start-icon {
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
