<script lang="ts">
  import dayjs from 'dayjs';
  import { TaskManager } from "../classes";
  import type { TimeTrackerSettings} from "../main";

  export let taskManager: TaskManager;
  export let settings: TimeTrackerSettings;

  const tasks = taskManager.tasks;
  const activeTask = taskManager.activeTask;

  let tasksWithTimes: Record<'name' | 'time', string>[] = [];
  window.setInterval(() => {
    tasksWithTimes = $tasks.map((task) => ({
        name: task.name, 
        time: dayjs
          .duration(TaskManager.sumTaskIntervals(task))
          .format(settings.taskListFormat)
      }));
  }, 500);
</script>

<div class="number">
  {#if tasksWithTimes.length === 0}
    <p>No timers are running at the moment</p>
  {/if}
  <ul>
    {#each tasksWithTimes as task}
      <li>
        <span>{task.name}</span>
        <span>{task.time}</span>
        {#if $activeTask?.name === task.name}
          <button on:click={() => taskManager.stopActiveTask()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
            </svg>
          </button>
        {:else}
          <button on:click={() => taskManager.startTask(task.name)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
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
    list-style-type: none;
    margin-bottom: var(--size-4-4);
    border: var(--border-width) solid var(--background-modifier-border);
    padding: var(--size-4-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
