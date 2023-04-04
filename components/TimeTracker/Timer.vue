<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="timer"
    :class="{
      'timer--recording': isCurrentUserTimer,
      'timer--editing': isEditMode,
      'timer--unsaved': hasUnsavedChanges && !isEditMode,
    }"
  >
    <div class="timer-container-view">
      <!-- recording state identifier -->
      <svgImage
        v-if="isCurrentUserTimer"
        class="icon-recording-state"
        :data="iconRecordAnimated"
      />

      <!-- timer title -->
      <PButton class="timer-title" @click="() => (isEditMode = true)">
        {{ timerTitleRef }}
      </PButton>

      <!-- timer actions -->
      <div class="timer-actions">
        <!-- action: celete timer -->
        <PButton
          :icon-before="iconDelete"
          round
          hide-title
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
    <div v-if="isEditMode" class="timer-container-edit">
      <TimerEdit v-model:is-edit-mode="isEditMode" v-model:timer="handleTimer">
        <template #toolbar>
          <PButton
            :icon-before="iconDelete"
            class="toolbar-button"
            @click="handleActionDelete"
          >
            {{ strDeleteTimer }}
          </PButton>
        </template>
      </TimerEdit>
    </div>
    <div
      v-if="hasUnsavedChanges && !isEditMode"
      class="timer-container-unsaved"
    >
      {{ strUnsavedChanges }}
      <a href="#" @click.prevent="() => (isEditMode = true)">
        {{ strViewUnsavedChanges }}
      </a>
      •
      <a href="#" @click.prevent="removeUnsavedChanges">
        {{ strDiscardUnsavedChanges }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import TimerEdit, { getDraftStorageName } from "./TimerEdit.vue";
import { inject, ref, computed, onUpdated } from "#imports";
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
  setTimer,
  startTimer,
  deleteTimer,
  ifCurrentUserTimer,
  stopCurrentUserTimer,
} = timetrackerCtx;

const props = defineProps<{
  timer: TimeTracker.Timer;
  timerListId: TimeTracker.TimerList["id"];
}>();

const [
  strStartRecording,
  strStopRecording,
  strDeleteTimer,
  strUnsavedChanges,
  strViewUnsavedChanges,
  strDiscardUnsavedChanges,
] = localizeKeys([
  "Start recording",
  "Stop recording",
  "Delete timer",
  "You have unsaved edits on this field.",
  "View edits",
  "Discard",
]);

// toggle edit mode ref
const isEditMode = ref(false);

// timerTitleRef is used to show changes to the timer title instantly (dont wait for reload)
const timerTitleRef = ref(props.timer.title);
onUpdated(() => {
  // the timeout is a workaround to prevent the timer title from being reset to the old value
  // when the timer is updated and reloaded in the background
  setTimeout(() => {
    timerTitleRef.value = props.timer.title;
  }, 300);
});
// save changes to timer immediately
const handleTimer = computed({
  get: () => props.timer,
  set: (timer: TimeTracker.Timer) => {
    timerTitleRef.value = timer.title;
    setTimer(props.timerListId, timer);
  },
});

// check if there are unsaved changes in local storage
const draftStorageName = getDraftStorageName(props.timer.id);
const checkUnsavedChanges = () => {
  return window.localStorage.getItem(draftStorageName) !== null;
};
const hasUnsavedChanges = ref(checkUnsavedChanges());
onUpdated(() => {
  hasUnsavedChanges.value = checkUnsavedChanges();
});

// remove unsaved changes from local storage
const removeUnsavedChanges = () => {
  window.localStorage.removeItem(draftStorageName);
  hasUnsavedChanges.value = false;
};

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
  margin: 0px 0;
  border-radius: var(--border-radius);
  max-width: 100%;

  &:focus-within,
  &:hover {
    background-color: var(--background-neutral);
  }

  &-container-view {
    display: flex;
    align-items: center;
    @at-root .timer--editing & {
      display: none;
    }
  }

  &-container-unsaved {
    padding: 0 6px;
    color: var(--color-text-subtle);
  }

  .icon-recording-state {
    padding-left: 6px;
    transform: translateX(-3px);
  }

  &-title {
    display: block;
    flex-grow: 1;
    align-self: stretch;
    max-width: 100%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: unset;
    cursor: pointer;
    padding: 6px;
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
      padding-left: 0; // workaround to compensate for the padding of the hidden icon
      margin-left: 0; // workaround to compensate for the padding of the hidden icon
      .icon-recording-action {
        display: none;
      }
    }
  }

  .toolbar-button {
    &:not(:hover) {
      background-color: unset;
      text-decoration: underline;
    }
  }

  &--unsaved {
    background: repeating-linear-gradient(
      45deg,
      var(--background-warning-bold-hovered-a),
      var(--background-warning-bold-hovered-a) 10px,
      var(--background-warning-bold-pressed-a) 10px,
      var(--background-warning-bold-pressed-a) 20px
    ) !important;
    padding: 2px;
    .timer-container-view {
      border-radius: inherit;
      background-color: var(--background-warning-bold-pressed-a);
      &:hover {
        background-color: var(--background-warning-bold-hovered2-a);
      }
    }
  }
}
</style>
