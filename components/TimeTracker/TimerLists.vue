<template>
  <TimeTrackerTimerList
    v-for="list in timerLists"
    :key="list.id"
    :timer-list="list"
  />
  <!-- <StoragePrinter /> -->
</template>

<script lang="ts">
import { inject } from "#imports";
import {
  TIMETRACKER_CTX_SYMBOL,
  useTimetracker,
} from "~~/composables/timetracker";
</script>

<script lang="ts" setup>
/** inject and use timetracker context */
const timetrackerCtx = inject(TIMETRACKER_CTX_SYMBOL) as ReturnType<
  typeof useTimetracker
>;
const { getTimerListsRef } = timetrackerCtx;

const timerLists = getTimerListsRef();
</script>

<style scoped></style>
