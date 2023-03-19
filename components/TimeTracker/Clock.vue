<!-- eslint-disable vue/attributes-order vue/multi-word-component-names -->
<template>
  <div class="clock">
    <div class="slot h" v-if="dial.h[0]">
      <span class="digit" v-for="(digit, i) in dial.h[1]" :key="i">
        {{ digit }}
      </span>
    </div>
    <div class="sep m" v-if="dial.h[0]" />
    <div class="slot m" v-if="dial.m[0] || dial.h[0]">
      <span class="digit" v-for="(digit, i) in dial.m[1]" :key="i">
        {{ digit }}
      </span>
    </div>
    <div class="sep s" v-if="dial.m[0] || dial.h[0]" />
    <div class="slot s">
      <span class="digit" v-for="(digit, i) in dial.s[1]" :key="i">
        {{ digit }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "#imports";
import type { TimeTracker } from "~~/composables/timetracker.d";
</script>

<script lang="ts" setup>
const props = defineProps<{ time: TimeTracker.Time }>();

const dial = computed(() => {
  const { time } = props;
  const s = time % 60;
  const m = Math.floor((time / 60) % 60);
  const h = Math.floor(time / 60 / 60);
  return {
    h: [h, [...h.toString().split("")]],
    m: [m, [...leadingZeros(m).split("")]],
    s: [s, [...leadingZeros(s).split("")]],
  };
});

const leadingZeros = (num: number, digits = 2, char: number | string = 0) => {
  const numDigits = num.toString().split("").length;
  const zeros = digits - numDigits;
  return [...(zeros > 0 ? Array(zeros).fill(char) : []), num].join("");
};
</script>

<style lang="scss" scoped>
.clock {
  display: flex;
  gap: 1px;
  align-items: baseline;
  margin-bottom: -0.2em;

  font-weight: bold;
  font-size: 1.1em;

  .slot {
    display: flex;
    align-items: center;
    gap: 2px;

    .digit {
      display: inline-flex;
      width: 0.8em;
      height: 1.2em;
      justify-content: center;
      align-items: center;
      background-color: var(--clock-bg, var(--background-neutral));
      border-radius: 2px;
    }
  }

  .sep::after {
    content: ":";
    display: inline-block;
    margin-bottom: 0.1em;
  }

  .sep.s,
  .slot.s {
    font-size: 0.8em;
  }
}
</style>
