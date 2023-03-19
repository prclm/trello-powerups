<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="header">
      <h1>developer view for local testing</h1>
      <p>links to PowerUp iframes:</p>
      <ul>
        <li>
          <NuxtLink to="./initialize/">Initialize Iframe</NuxtLink>
        </li>
        <li>
          <NuxtLink to="./card-back-section/">Card Back Section</NuxtLink>
        </li>
      </ul>
    </div>

    <div>
      <button @click="() => addTimerList()">newList</button>
      <TimeTrackerTimerLists />
    </div>

    <StoragePrinter />
  </div>
</template>

<script lang="ts">
import { provide } from "#imports";
import { useTrello, TRELLO_CTX_SYMBOL } from "~~/composables/trello";
import {
  POWERUP_NAME,
  useTimetracker,
  TIMETRACKER_CTX_SYMBOL,
} from "~~/composables/timetracker";
</script>

<script setup lang="ts">
/** create and provide trello iframe context */
const trelloCtx = useTrello(POWERUP_NAME);
provide(TRELLO_CTX_SYMBOL, trelloCtx);

/** create and provide timetracker context */
const timetrackerCtx = useTimetracker(trelloCtx, true);
const { addTimerList } = timetrackerCtx;
provide(TIMETRACKER_CTX_SYMBOL, timetrackerCtx);
</script>

<style lang="scss">
:root {
  overflow: initial;
}
.header {
  margin-bottom: 2em;
  padding: 1em;
  background: black;
  &,
  a {
    color: white;
  }
}
</style>
