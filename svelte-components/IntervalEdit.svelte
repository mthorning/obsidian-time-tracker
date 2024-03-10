<script lang="ts">
  import dayjs from "dayjs";
  import Icon from "./Icon.svelte";

  export let interval: [string, string | null];
  export let duration: string;
  export let deleteInterval: () => void = () => undefined
</script>

<div>
  <label>
    Start:
    <input type="datetime-local" step="1" bind:value={interval[0]} />
  </label>
  {#if interval[1] === null}
    <div class="still-running">
      <p>End:</p>
      <p>Still running...</p>
    </div>
  {:else}
    <label>
      End:
      <input type="datetime-local" step="1" bind:value={interval[1]} />
    </label>
  {/if}
  <div class="footer">
    <p>Duration: {duration}</p>
    {#if interval[1] !== null}
      <button type="button" on:click={() => deleteInterval()}>
        <Icon icon="bin" />
      </button>
    {/if}
  </div>
  <hr />
</div>

<style>
  label,
  .still-running {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: var(--size-4-2);
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
</style>
