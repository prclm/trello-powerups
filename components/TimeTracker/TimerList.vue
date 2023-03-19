<template>
  <div class="timer-list">
    <div class="timer-list-timers">
      <TimeTrackerTimer
        v-for="timer in timerList.timers"
        :key="timer.id"
        :timer="timer"
        :timer-list-id="timerList.id"
      />
    </div>
    <TimeTrackerNewTimerInput :timer-list-id="timerList.id" />
  </div>
</template>

<script lang="ts">
import type { TimeTracker } from "~~/composables/timetracker.d";
</script>

<script lang="ts" setup>
defineProps<{
  timerList: TimeTracker.TimerList;
}>();
</script>

<style lang="scss" scoped>
.timer-list {
  margin-bottom: 24px;

  &-timers {
    margin-bottom: 6px;
  }
}
</style>
