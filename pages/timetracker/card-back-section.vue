<template>
  <div ref="container">
    <TimeTrackerTimerLists />
  </div>
</template>

<script lang="ts">
import { provide } from "#imports";
import { PowerUp, useTrello, TRELLO_CTX_SYMBOL } from "~~/composables/trello";
import {
  POWERUP_NAME,
  iframeOptions,
  useTimetracker,
  TIMETRACKER_CTX_SYMBOL,
} from "~~/composables/timetracker";
import type { Trello } from "~~/composables/trello.d";
</script>

<script setup lang="ts">
/** create and provide trello iframe context */
const trelloCtx = useTrello(
  POWERUP_NAME,
  PowerUp?.iframe(iframeOptions) as Trello.PowerUp.IFrame
);
const { t, handleIframeResizeRef } = trelloCtx;
provide(TRELLO_CTX_SYMBOL, trelloCtx);

/** create and provide timetracker context */
const timetrackerCtx = useTimetracker(trelloCtx, true);
const { handleRerender: handleTimerRerender } = timetrackerCtx;
provide(TIMETRACKER_CTX_SYMBOL, timetrackerCtx);

/** handle rerender forced by trello */
t?.render(() => {
  handleTimerRerender();
});

/** call trello when the iframe container size changed */
const container = handleIframeResizeRef();
</script>
