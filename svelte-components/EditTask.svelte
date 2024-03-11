<script context="module" lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  import dayjs from "dayjs";
  import { Clock, TaskManager, type Task, type FinishedInterval } from "../classes";
  import IntervalEdit from "./IntervalEdit.svelte";

  export type TaskWithDuration = Task & {
    duration: ReturnType<typeof dayjs.duration>;
  };
</script>

<script lang="ts">
  const dispatch = createEventDispatcher();

  export let taskManager: TaskManager;
  export let taskToEdit: { task: TaskWithDuration; isActive: boolean };

  const { task, isActive } = taskToEdit;

  const originalName = task.name;
  let originalIntervals = task.intervals.map((interval) =>
    interval.map((val) => (val === null ? null : dayjs(val).millisecond(0))),
  );
  let originalActiveInterval: [number, null] | null = null;

  if (originalIntervals[originalIntervals.length - 1]?.[1] === null) {
    originalActiveInterval = originalIntervals.pop() as [number, null];
  }

  const originalTotalDurationForFinishedIntervals = originalIntervals.reduce(
    (acc, cur) => acc.add(cur[1]!.diff(cur[0])),
    dayjs.duration(0),
  );

  const updateOriginalTotal = () =>
    originalTotalDurationForFinishedIntervals.add(
      originalActiveInterval
        ? dayjs.duration(dayjs().diff(dayjs(originalActiveInterval[0])))
        : dayjs.duration(0),
    );

  let originalTotalDuration = updateOriginalTotal();

  let newActiveInterval: [string, null] | null = originalActiveInterval
    ? [dayjs(originalActiveInterval[0]).format("YYYY-MM-DDTHH:mm:ss"), null]
    : null;

  $: newActiveIntervalDuration = updateNewActiveIntervalDuration();

  const updateNewActiveIntervalDuration = () =>
    newActiveInterval
      ? dayjs.duration(dayjs().diff(newActiveInterval[0]))
      : dayjs.duration(0);

  let newIntervals = originalIntervals.map(
    (interval) =>
      interval.map((val) => val!.format("YYYY-MM-DDTHH:mm:ss")) as [
        string,
        string,
      ],
  );

  $: newIntervalDurations = newIntervals.map((interval) =>
    dayjs.duration(dayjs(interval[1]).diff(dayjs(interval[0]))),
  );

  $: newTotalDurationForFinishedIntervals = newIntervalDurations.reduce(
    (acc, cur) => acc.add(cur),
    dayjs.duration(0),
  );

  const updateNewTotal = () =>
    newTotalDurationForFinishedIntervals.add(
      newActiveInterval
        ? dayjs.duration(dayjs().diff(dayjs(newActiveInterval[0])))
        : dayjs.duration(0),
    );

  $:  newTotalDuration = newTotalDurationForFinishedIntervals && updateNewTotal();

  $: showDurationDiff =
    newTotalDuration &&
    Math.round(originalTotalDuration.as("seconds")) !==
      Math.round(newTotalDuration.as("seconds"));

  const clock = new Clock(() => {
    originalTotalDuration = updateOriginalTotal();
    newTotalDuration = updateNewTotal();
    newActiveIntervalDuration = updateNewActiveIntervalDuration();
  });

  if (isActive) {
    clock.start();
  }

  function onSubmit() {
    taskManager.updateTask(originalName, {
      name: task.name,
      intervals: [
        ...(newIntervals.map(
          (interval) =>
            interval.map((val) => dayjs(val).valueOf()) as FinishedInterval,
        ) as FinishedInterval[]),
        ...(newActiveInterval
          ? [[dayjs(newActiveInterval[0]).valueOf(), null] as [number, null]]
          : []),
      ],
    });
    dispatch("closeEdit");
  }

  function addInterval() {
    newIntervals = [
      ...newIntervals,
      [
        dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      ],
    ];
  }

  function deleteInterval(i: number) {
    return () => {
      newIntervals = [
        ...newIntervals.slice(0, i),
        ...newIntervals.slice(i + 1),
      ];
    };
  }

  onDestroy(() => {
    clock.stop();
  });
</script>

<div>
  <button on:click={() => dispatch("closeEdit")}>Back</button>
  <form on:submit|preventDefault>
    <label for="name"
      >Name:
      <input name="name" type="text" bind:value={task.name} />
    </label>
    <hr />
    {#each newIntervals as interval, i}
      <IntervalEdit
        duration={taskManager.formatDuration(newIntervalDurations[i])}
        bind:interval
        deleteInterval={deleteInterval(i)}
      />
    {/each}
    <div class="add-button">
      <button on:click={addInterval}>Add</button>
    </div>
    <hr />
    {#if newActiveInterval}
      <IntervalEdit
        duration={taskManager.formatDuration(newActiveIntervalDuration)}
        bind:interval={newActiveInterval}
      />
    {/if}
    {#if showDurationDiff}
      <p>
        Previous duration: {taskManager.formatDuration(originalTotalDuration)}
      </p>
      <p>
        New duration: {taskManager.formatDuration(newTotalDuration)}
      </p>
    {:else}
      <p>
        Duration: {taskManager.formatDuration(newTotalDuration)}
      </p>
    {/if}
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
  .add-button {
    display: flex;
    justify-content: center;
    margin-bottom: var(--size-4-8);
  }
  button.submit {
    float: right;
  }
</style>
