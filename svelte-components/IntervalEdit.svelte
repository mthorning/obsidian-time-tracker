<script lang="ts">
  import Icon from "./Icon.svelte";

  export let interval: { start: string, end: string | null, description: string};
  export let duration: string;
  export let deleteInterval: () => void = () => undefined
</script>

<div>
  <label>
    Description:
    <input type="text" bind:value={interval.description} />
  </label>
  <label>
    Start:
    <input type="datetime-local" step="1" bind:value={interval.start} />
  </label>
  {#if interval.end === null}
    <div class="still-running">
      <p>End:</p>
      <p>Still running...</p>
    </div>
  {:else}
    <label>
      End:
      <input type="datetime-local" step="1" bind:value={interval.end} />
    </label>
  {/if}
  <div class="footer">
    <p class="p">Duration: {duration}</p>
    {#if interval.end !== null}
      <button type="button" on:click={() => deleteInterval()}>
        <Icon icon="bin" />
      </button>
    {/if}
  </div>
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
  .p {
    margin: 0;
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
