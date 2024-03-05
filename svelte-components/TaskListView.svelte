<script lang="ts">
  import ListTasks from "./ListTasks.svelte";
  import EditTasks from "./EditTask.svelte";
  import { TaskManager } from "../classes";

  import type { TaskWithDuration } from "./EditTask.svelte";
  import type { TimeTrackerSettings} from "../main";

  export let taskManager: TaskManager;
  let taskToEdit:  TaskWithDuration | null = null;
</script>

<div>
  {#if taskToEdit}
    <EditTasks {taskManager} task={taskToEdit} on:closeEdit={() => taskToEdit = null}/>
  {:else}
    <ListTasks {taskManager} on:editTask={({ detail }) => taskToEdit = detail} />
  {/if}
</div>
