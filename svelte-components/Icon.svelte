<script lang="ts">
  export let icon: "square" | "play" | "bin" | "copy";
</script>

<div class={$$restProps.class || ''}>
  {#if icon === "square"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="stop-icon lucide lucide-square"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  {:else if icon === "play"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="start-icon lucide lucide-play"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  {:else if icon === "bin"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-trash-2"
      ><path d="M3 6h18" /><path
        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
      /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line
        x1="10"
        x2="10"
        y1="11"
        y2="17"
      /><line x1="14" x2="14" y1="11" y2="17" /></svg
    >
  {:else if icon === 'copy'}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-copy">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v4"/>
      <path d="M21 14H11"/>
      <path d="m15 10-4 4 4 4"/>
    </svg>
  {/if}
</div>
