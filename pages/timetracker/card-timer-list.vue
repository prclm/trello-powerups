<template>
  <div ref="wrapper">
    Card Timer Liste
    <pre>{{ storage }}</pre>
  </div>
</template>

<script lang="ts">
import { TPU_TIMETRACKER } from "./index.vue";
</script>

<script setup lang="ts">
const trelloInstance = useTrello(TPU_TIMETRACKER);

const {
  T,
  handleIframeResizeRef,
  initStoredDataRef,
  handleRerender: handleTrelloRerender,
} = trelloInstance;
const wrapper = handleIframeResizeRef();
const storage = initStoredDataRef();

T?.render(() => {
  handleTrelloRerender();
});
</script>
