<script context="module" lang="ts">
  import dayjs from "dayjs";
  import { createEventDispatcher } from "svelte";
  import Icon from "./Icon.svelte";

  import { TaskManager, type Task } from "../classes";

  export type TaskWithDuration = Task & {
    duration: ReturnType<typeof dayjs.duration>;
  };
</script>

<script lang="ts">
  export let task: TaskWithDuration;
  export let taskManager: TaskManager;

  const originalName = task.name;

  const dispatch = createEventDispatcher();

  let intervalsWithStringVals = task.intervals.map((interval) =>
    interval.map((val) => dayjs(val).format("YYYY-MM-DDTHH:mm:ss")),
  );

  $: intervalDurations = intervalsWithStringVals.map((interval) =>
    dayjs.duration(dayjs(interval[1]).diff(dayjs(interval[0]))),
  );

  $: newDuration = intervalDurations.reduce(
    (acc, cur) => acc.add(cur),
    dayjs.duration(0),
  );

  function onSubmit() {
    taskManager.updateTask(originalName, {
      name: task.name,
      intervals: intervalsWithStringVals.map(
        (interval) =>
          interval.map((val) => dayjs(val).valueOf()) as [number, number],
      ),
    });
    dispatch("closeEdit");
  }

  function addInterval() {
    intervalsWithStringVals = [
      ...intervalsWithStringVals,
      [dayjs().format("YYYY-MM-DDTHH:mm:ss"), dayjs().format("YYYY-MM-DDTHH:mm:ss")],
    ];
  }
  function deleteInterval(i: number) {
    return () => {
      intervalsWithStringVals = [
        ...intervalsWithStringVals.slice(0, i),
        ...intervalsWithStringVals.slice(i + 1),
      ];
    };
  }
</script>

<div>
  <button on:click={() => dispatch("xcloseEdit")}>Back</button>
  <form on:submit|preventDefault>
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
      <div class="footer">
        <p>Duration: {taskManager.formatDuration(intervalDurations[i])}</p>
        <button type="button" on:click={deleteInterval(i)}>
          <Icon icon="bin" />
        </button>
      </div>
      <hr />
    {/each}
    <div class="add-button">
      <button on:click={addInterval}>Add</button>
    </div>
    <p>Previous duration: {taskManager.formatDuration(task.duration)}</p>
    <p>New duration: {taskManager.formatDuration(newDuration)}</p>
    <div class="buttons">
      <button type="button" on:click={() => dispatch("closeEdit")}
        >Cancel</button
      >
      <button type="button" class="submit" on:click={onSubmit}>Save</button>
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
    align-items: baseline;
    flex-wrap: wrap;
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
  .footer {
    padding: var(--size-4-1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  .footer button {
    margin-left: auto;
  }
  .add-button {
    display: flex;
    justify-content: center;
    margin-bottom: var(--size-4-8);
  }
  button.submit {
    float: right;
  }
</style>
