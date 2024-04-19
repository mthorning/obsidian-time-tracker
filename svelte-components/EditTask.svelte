<script context="module" lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  import dayjs, { type Dayjs } from "dayjs";
  import { Clock, TaskManager, type Task } from "../classes";
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
  let originalIntervals = task.intervals.map((interval) => ({
    description: interval.description ?? '',
    start: dayjs(interval.start).millisecond(0),
    end: interval.end === null ? null : dayjs(interval.end).millisecond(0),
  }));
  let originalActiveInterval: { start: Dayjs, end: null, description: string } | null = null;

  if (originalIntervals[originalIntervals.length - 1]?.end === null) {
    originalActiveInterval = originalIntervals.pop() as { start: Dayjs, end: null, description: string};
  }

  const originalTotalDurationForFinishedIntervals = originalIntervals.reduce(
    (acc, cur) => acc.add(cur.end!.diff(cur.start)),
    dayjs.duration(0),
  );

  const updateOriginalTotal = () =>
    originalTotalDurationForFinishedIntervals.add(
      originalActiveInterval
        ? dayjs.duration(dayjs().diff(dayjs(originalActiveInterval.start)))
        : dayjs.duration(0),
    );

  let originalTotalDuration = updateOriginalTotal();

  let newActiveInterval: { start: string, end: null, description: string } | null = originalActiveInterval
    ? { 
      start: dayjs(originalActiveInterval.start).format("YYYY-MM-DDTHH:mm:ss"),
      end: null,
      description: originalActiveInterval.description
    }
    : null;

  $: newActiveIntervalDuration = updateNewActiveIntervalDuration();

  const updateNewActiveIntervalDuration = () =>
    newActiveInterval
      ? dayjs.duration(dayjs().diff(newActiveInterval.start))
      : dayjs.duration(0);

  let newIntervals = originalIntervals.map(
    (interval) => ({
      description: interval.description,
      start: interval.start.format("YYYY-MM-DDTHH:mm:ss"),
      end: interval.end!.format("YYYY-MM-DDTHH:mm:ss")
    })
  );

  $: newIntervalDurations = newIntervals.map((interval) =>
    dayjs.duration(dayjs(interval.end).diff(dayjs(interval.start))),
  );

  $: newTotalDurationForFinishedIntervals = newIntervalDurations.reduce(
    (acc, cur) => acc.add(cur),
    dayjs.duration(0),
  );

  const updateNewTotal = () =>
    newTotalDurationForFinishedIntervals.add(
      newActiveInterval
        ? dayjs.duration(dayjs().diff(dayjs(newActiveInterval.start)))
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
          (interval) => ({
            ...interval,
            start: dayjs(interval.start).valueOf(),
            end: dayjs(interval.end).valueOf(), 
        }))),
        ...(newActiveInterval
          ? [{ 
              ...newActiveInterval,
              start: dayjs(newActiveInterval.start).valueOf(),
              end: null 
            }]
          : []),
      ],
    });
    dispatch("closeEdit");
  }

  function addInterval() {
    newIntervals = [
      ...newIntervals,
      {
        description: "",
        start: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        end: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      },
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

<div class="container">
  <div class="buttons">
    <button on:click={() => dispatch("closeEdit")}>Back</button>
    <button on:click={addInterval}>Add</button>
  </div>
  <form on:submit|preventDefault={onSubmit}>
    <div class="scroll-box">
      <label class="spacing border" for="name"
        >Name:
        <input name="name" type="text" bind:value={task.name} />
      </label>
      {#each newIntervals as interval, i}
        <div class="border spacing">
          <IntervalEdit
            duration={taskManager.formatDuration(newIntervalDurations[i])}
            bind:interval
            deleteInterval={deleteInterval(i)}
          />
      </div>
      {/each}
      {#if newActiveInterval}
        <div class="spacing">
          <IntervalEdit
            duration={taskManager.formatDuration(newActiveIntervalDuration)}
            bind:interval={newActiveInterval}
          />
        </div>
      {/if}
    </div>
    <div class="bottom-controls">
      {#if showDurationDiff}
        <p>
          Previous total duration: {taskManager.formatDuration(originalTotalDuration)}
        </p>
        <p>
          New total duration: {taskManager.formatDuration(newTotalDuration)}
        </p>
      {:else}
        <p>
          Total duration: {taskManager.formatDuration(newTotalDuration)}
        </p>
      {/if}
      <button type="submit" class="submit">Save</button>
    </div>
  </form>
</div>

<style>
  .container {
    margin-right: -16px;
  }
  form {
    padding: var(--size-4-8) var(--size-4-2) var(--size-4-1);
    margin: auto;
  }
  label {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: var(--size-4-2);
  }
  .scroll-box {
    padding-right: 16px;
    max-height: calc(100vh - 260px);
    overflow-y: auto;
  }
  .bottom-controls {
    border-top: var(--border-width) solid var(--background-modifier-border);
  }
  input {
    margin-left: var(--size-4-1);
  }
  .buttons {
    padding-bottom: var(--size-4-4);
    margin-right: 16px;
    border-bottom: var(--border-width) solid var(--background-modifier-border);
    display: flex;
    gap: var(--size-4-2);
  }
  button {
    border-radius: var(--button-radius);
  }
  button.submit {
    float: right;
  }
  .spacing {
    padding-bottom: var(--size-4-8);
    margin-bottom: var(--size-4-8);
  }
  .border {
    border-bottom: var(--border-width) solid var(--background-modifier-border);
  }
</style>
