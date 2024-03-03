<script lang="ts">
  import ListTasks from "./ListTasks.svelte";
  import EditTasks from "./EditTask.svelte";
  import { TaskManager } from "../classes";
  import type { TimeTrackerSettings} from "../main";

  export let taskManager: TaskManager;
  export let settings: TimeTrackerSettings;
  let mode: 'list' | 'edit' = 'list';
</script>

<div>
  {#if mode === 'list'}
    <ListTasks {taskManager} {settings} on:edit-mode={() => mode = 'edit'} />
  {:else}
    <EditTasks />
  {/if}
</div>
