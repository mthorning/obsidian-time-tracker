<script lang="ts">
  import ListTasks from "./ListTasks.svelte";
  import EditTasks from "./EditTask.svelte";
  import { TaskManager } from "../classes";

  import type { TaskWithDuration } from "./EditTask.svelte";

  export let taskManager: TaskManager;
  export let startTask: () => void;

  let taskToEdit: { task: TaskWithDuration; isActive: boolean } | null = null;
</script>

<div>
  {#if taskToEdit}
    <EditTasks
      {taskManager}
      {taskToEdit}
      on:closeEdit={() => (taskToEdit = null)}
    />
  {:else}
    <ListTasks
      {taskManager}
      {startTask}
      on:editTask={({ detail }) => (taskToEdit = detail)}
    />
  {/if}
</div>
