<script context="module" lang="ts">
  import dayjs from "dayjs";
  import { createEventDispatcher } from "svelte";

  import { TaskManager, type Task } from "../classes";
  import type { TimeTrackerSettings } from "../main";

  export type TaskWithDuration = Task & {
    duration: ReturnType<typeof dayjs.duration>;
  };
</script>

<script lang="ts">
  export let task: TaskWithDuration;
  export let taskManager: TaskManager;

  const originalName = task.name;

  const dispatch = createEventDispatcher();

  const intervalsWithStringVals = task.intervals.map((interval) =>
    interval.map((val) => dayjs(val).format("YYYY-MM-DDTHH:mm:ss"))
  );

  $: intervalDurations = intervalsWithStringVals.map((interval) =>
    dayjs.duration(dayjs(interval[1]).diff(dayjs(interval[0])))
  );

  $: newDuration = intervalDurations.reduce(
    (acc, cur) => acc.add(cur),
    dayjs.duration(0)
  );

  function onSubmit() {
    taskManager.updateTask(originalName, {
      name: task.name,
      intervals: intervalsWithStringVals.map((interval) =>
        interval.map((val) => dayjs(val).valueOf()) as [number, number]
      ),
    });
    dispatch("closeEdit");
  }
</script>

<div>
  <button on:click={() => dispatch("closeEdit")}>Back</button>
  <form on:submit|preventDefault={onSubmit}>
    <label for="name"
      >Name:
      <input name="name" type="text" bind:value={task.name} />
    </label>
    <hr />
    {#each intervalsWithStringVals as _interval, i}
      <label for={`interval-start-${i}`}
        >Start:
        <input
          name={`interval-start-${i}`}
          type="datetime-local"
          step="1"
          bind:value={intervalsWithStringVals[i][0]}
        />
      </label>
      <label for={`interval-end-${i}`}
        >End:
        <input
          name={`interval-end-${i}`}
          type="datetime-local"
          step="1"
          bind:value={intervalsWithStringVals[i][1]}
        />
      </label>
      <p>Duration: {taskManager.formatDuration(intervalDurations[i])}</p>
      <hr />
    {/each}
    <p>Previous duration: {taskManager.formatDuration(task.duration)}</p>
    <p>New duration: {taskManager.formatDuration(newDuration)}</p>
    <div class="buttons">
      <button on:click={() => dispatch("closeEdit")}>Cancel</button>
      <button type="submit">Save</button>
    </div>
  </form>
</div>

<style>
  form {
    padding: var(--size-4-2) var(--size-4-1);
    margin: var(--size-4-12) auto;
  }
  label {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--size-4-2);
  }
  input {
    margin-left: var(--size-4-1);
  }
  .buttons {
    display: flex;
    gap: var(--size-4-2);
    justify-content: flex-end;
  }
  button {
    border-radius: var(--button-radius);
  }
  button[type="submit"] {
    float: right;
  }
</style>
