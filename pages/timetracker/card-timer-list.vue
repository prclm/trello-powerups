<template>
  <div ref="wrapper">Card Timer Liste</div>
</template>

<script lang="ts">
import { TPU_TIMETRACKER } from "./index.vue";
</script>

<script setup lang="ts">
const trelloInstance = useTrello(TPU_TIMETRACKER);
const { handleIframeResizeRef } = trelloInstance;
const wrapper = handleIframeResizeRef();
</script>
