<script context="module" lang="ts">
  import dayjs from "dayjs";
  import { createEventDispatcher } from 'svelte';

  import type { Task } from "../classes";
  import type { TimeTrackerSettings } from "../main";

  export type TaskWithDuration = Task & {
    duration: ReturnType<typeof dayjs.duration>;
  };
</script>

<script lang="ts">
  export let settings: TimeTrackerSettings;
  export let task: TaskWithDuration;

	const dispatch = createEventDispatcher();

  function formatDuration(duration: ReturnType<typeof dayjs.duration>) {
    const days = Math.floor(duration.asDays());
    if (days < 1) return duration.format(settings.taskListFormat);
    return `(+${days} day${days === 1 ? "" : "s"}) ${duration.subtract(days, "d").format(settings.taskListFormat)}`;
  }

  const intervalsWithStringVals = task.intervals.map((interval) =>
    interval.map((val) => dayjs(val).format("YYYY-MM-DDTHH:mm:ss")),
  );

  $: intervalDurations = intervalsWithStringVals.map((interval) =>
    dayjs.duration(dayjs(interval[1]).diff(dayjs(interval[0]))),
  );

  $: newDuration = intervalDurations.reduce(
    (acc, cur) => acc.add(cur),
    dayjs.duration(0),
  );
</script>

<div>
  <button on:click={() => dispatch('closeEdit')}>Back</button>
  <h1>Edit task</h1>
  <form>
    <label for="task-name"
      >Name:
      <input name="task-name" type="text" bind:value={task.name} />
    </label>
    <h2>Intervals</h2>
    {#each intervalsWithStringVals as _interval, i}
      <label for={`interval-start-${i}`}
        >Start:
        <input
          name={`interval-start-${i}`}
          type="datetime-local"
          step="1"
          bind:value={intervalsWithStringVals[i][0]}
          min={intervalsWithStringVals[i - 1]?.[1]}
          max={intervalsWithStringVals[i][1]}
        />
      </label>
      <label for={`interval-end-${i}`}
        >End:
        <input
          min={intervalsWithStringVals[i][0]}
          max={intervalsWithStringVals[i + 1]?.[0]}
          name={`interval-end-${i}`}
          type="datetime-local"
          step="1"
          bind:value={intervalsWithStringVals[i][1]}
        />
      </label>
      <p>Duration: {formatDuration(intervalDurations[i])}</p>
      <hr />
    {/each}
    <p>Previous duration: {formatDuration(task.duration)}</p>
    <p>New duration: {formatDuration(newDuration)}</p>
  </form>
</div>

<style>
  label {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--size-4-2);
  }
  input {
    margin-left: var(--size-4-1);
  }
</style>
