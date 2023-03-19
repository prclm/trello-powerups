<template>
  <div ref="wrapper">
    Card Timer Liste
    <pre>{{ storage }}</pre>
  </div>
</template>

<script lang="ts">
import { TPU_TIMETRACKER } from "./index.vue";
import { PowerUp, useTrello } from "~~/composables/trello";
</script>

<script setup lang="ts">
const trelloInstance = useTrello(
  TPU_TIMETRACKER,
  PowerUp?.iframe({
    localization: {
      defaultLocale: "de",
      supportedLocales: ["de", "en"],
      resourceUrl: "/locale/_all-{locale}.json",
    },
  })
);

const {
  t,
  handleIframeResizeRef,
  initStoredDataRef,
  handleRerender: handleTrelloRerender,
} = trelloInstance;
const wrapper = handleIframeResizeRef();
const storage = initStoredDataRef();

t?.render(() => {
  handleTrelloRerender();
});
</script>
