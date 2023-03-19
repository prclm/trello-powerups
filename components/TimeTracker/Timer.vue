<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="timer">
    <!-- recording state identifier -->
    <svgImage
      v-if="isCurrentUserTimer"
      class="icon-recording-state"
      :data="iconRecordAnimated"
    />

    <!-- timer title -->
    <div class="timer-title">
      {{ timer.title }}
    </div>

    <!-- timer actions -->
    <div class="timer-actions">
      <!-- action: celete timer -->
      <PButton
        :icon-before="iconDelete"
        round
        hide-title
        class="icon-actions-delete"
        @click="handleActionDelete"
      >
        {{ strDeleteTimer }}
      </PButton>
    </div>

    <!-- stop watch button -->
    <PButton
      :class="`timer-clock-button ${
        isCurrentUserTimer ? 'mod-danger' : 'mod-primary'
      }`"
      hide-title
      @click="handleTimerClockBtn"
    >
      <!-- start/stop icon state identifier -->
      <template #icon-before>
        <Icon
          :icon="isCurrentUserTimer ? iconStop : iconPlay"
          class="icon-recording-action"
        />
      </template>

      <!-- start/stop button title (sr-only) -->
      <span v-if="!isCurrentUserTimer">{{ strStartRecording }}</span>
      <span v-if="!!isCurrentUserTimer">{{ strStopRecording }}</span>

      <!-- // TODO: Add total time for screen readers.
        Clock in this button is now aria-hidden="true" -->

      <!-- animated digital clock -->
      <template #icon-after>
        <TimeTrackerClock
          :time="timerTotal > 0 ? timerTotal : 0"
          aria-hidden="true"
        />
      </template>
    </PButton>
  </div>
</template>

<script lang="ts">
import { inject, computed } from "#imports";
import { TRELLO_CTX_SYMBOL, useTrello } from "~~/composables/trello";
import {
  TIMETRACKER_CTX_SYMBOL,
  useTimetracker,
} from "~~/composables/timetracker";
import {
  Icon,
  iconPlay,
  iconRecordAnimated,
  iconStop,
  iconDelete,
  svgImage,
} from "~~/composables/icons";
import type { TimeTracker } from "~~/composables/timetracker.d";
</script>

<script lang="ts" setup>
/** inject and use trello context */
const trelloCtx = inject(TRELLO_CTX_SYMBOL) as ReturnType<typeof useTrello>;
const { localizeKeys } = trelloCtx;

/** inject and use timetracker context */
const timetrackerCtx = inject(TIMETRACKER_CTX_SYMBOL) as ReturnType<
  typeof useTimetracker
>;
const {
  globalTimeIntervalRef,
  startTimer,
  deleteTimer,
  ifCurrentUserTimer,
  stopCurrentUserTimer,
} = timetrackerCtx;

const props = defineProps<{
  timer: TimeTracker.Timer;
  timerListId: TimeTracker.TimerList["id"];
}>();

const [strStartRecording, strStopRecording, strDeleteTimer] = localizeKeys([
  "Start recording",
  "Stop recording",
  "Delete timer",
]);

/** check dynamicliy if this timer is the current member timer */
const isCurrentUserTimer = computed(() => {
  return ifCurrentUserTimer(props.timer);
});

/** calc the total recorded time */
const timerTotal = computed(() => totalRunnigTimes.value + totalEndTimes.value);

/** calc the total recorded time of all tracks with endTime */
const totalEndTimes = computed(() => {
  const totalMiliseconds = props.timer.tracks.reduce((total, track) => {
    if (track?.endTime) {
      const time = track.endTime - track.startTime;
      return total + time;
    }
    return total;
  }, 0);
  return Math.floor(totalMiliseconds / 1000);
});

/** calc the total recorded time of all tracks WITHOUT endTime */
const totalRunnigTimes = computed(() => {
  const totalMiliseconds = props.timer.tracks.reduce((total, track) => {
    if (track.endTime === undefined && globalTimeIntervalRef.value) {
      const time = globalTimeIntervalRef.value.getTime() - track.startTime;
      return total + time;
    }
    return total;
  }, 0);
  return Math.floor(totalMiliseconds / 1000);
});

/** handle interaction start/stop */
const handleTimerClockBtn = (e: Event) => {
  if (isCurrentUserTimer.value) {
    stopCurrentUserTimer();
  } else {
    startTimer(props.timerListId, props.timer.id);
  }
};

/** handle interaction delete */
const handleActionDelete = (e: Event) => {
  deleteTimer(e, props.timerListId, props.timer.id);
};
</script>

<style lang="scss" scoped>
.timer {
  display: flex;
  align-items: center;
  margin: 0px 0;
  padding-left: 6px;
  border-radius: var(--border-radius);
  max-width: 100%;

  button {
    margin: 0;
  }

  &:focus-within,
  &:hover {
    background-color: var(--background-neutral);
  }

  .icon-recording-state {
    transform: translateX(-3px);
  }

  &-title {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  &:focus-within &-actions,
  &-actions:focus,
  &:hover &-actions {
    display: flex !important;
  }

  &-actions {
    display: none;
    align-items: center;
    gap: 6px;
    margin: 0 6px;
    justify-content: space-around;

    button {
      &:focus {
        --ds-border-input: ; //unset color var
      }
    }
  }

  &-clock-button {
    height: 32px;

    &:not(:hover):not(:focus) {
      color: inherit;
      background-color: transparent;

      .icon-recording-action {
        display: none;
      }
    }
  }
}
</style>
