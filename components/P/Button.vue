<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <button
    :disabled="disabled"
    :data-hide-title="hideTitle"
    :data-round="round"
    :data-pill="pill"
    :data-icon-before="!!iconBefore"
    :data-icon-after="!!iconAfter"
  >
    <span class="icon-before">
      <slot name="icon-before">
        <Icon v-if="iconBefore" :icon="iconBefore" width="16" height="16" />
      </slot>
    </span>
    <span class="button-title">
      <slot>Button Text</slot>
    </span>
    <span class="icon-after">
      <slot name="icon-after">
        <Icon v-if="iconAfter" :icon="iconAfter" width="16" height="16" />
      </slot>
    </span>
  </button>
</template>
<script lang="ts">
import { Icon, IconData } from "~~/composables/icons";
</script>

<script lang="ts" setup>
defineProps<{
  iconBefore?: IconData;
  iconAfter?: IconData;
  disabled?: boolean;
  hideTitle?: boolean;
  round?: boolean;
  pill?: boolean;
}>();
</script>

<style lang="scss" scoped>
button {
  display: inline-flex;
  align-items: center;

  .icon-before,
  .icon-after {
    display: inline-flex;
    align-items: center;
    padding: 2px;
    &:empty {
      display: none;
    }
  }

  // move icons aside it title is visible
  &[data-hide-title="true"] {
    padding-left: 8px;
    padding-right: 8px;
  }
  &:not([data-hide-title="true"]) .icon-before {
    margin-left: -6px;
    margin-right: 6px;
  }
  &:not([data-hide-title="true"]) .icon-after {
    margin-left: 6px;
    margin-right: -6px;
  }

  &[data-hide-title="true"][data-round="true"][data-icon-after="true"]:not(
      [data-icon-before="true"]
    ),
  &[data-hide-title="true"][data-round="true"][data-icon-before="true"]:not(
      [data-icon-after="true"]
    ) {
    position: relative;
    aspect-ratio: 1 / 1;
    width: 28px;
  }

  &[data-hide-title="true"][data-round="true"][data-icon-before="true"]:not(
      [data-icon-after="true"]
    ) {
    position: relative;
    aspect-ratio: 1 / 1;
    width: 28px;
    .icon-before {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &[data-hide-title="true"][data-round="true"][data-icon-after="true"]:not(
      [data-icon-before="true"]
    ) {
    position: relative;
    aspect-ratio: 1 / 1;
    width: 28px;
    .icon-before {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &[data-hide-title="true"] > .button-title {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0px;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }

  &[data-round="true"] {
    border-radius: 9999px;
  }
  &[data-pill="true"] {
    border-radius: 50%;
  }
}
</style>
