<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    TimeTracker PowerUp wird initialisiert...
    <ul>
      <li>
        <NuxtLink to="./card-back-section/">Card Back Section</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { PowerUp, T_IFRAME_INIT_HEIGHT } from "@/composables/trello";
import { Trello } from "@/types/trello";
export const TPU_TIMETRACKER = "TimeTracker";
</script>

<script setup lang="ts">
PowerUp?.initialize({
  "card-back-section": (t) => {
    return {
      title: "TimeTracker",
      icon: "",
      content: {
        type: "iframe",
        url: t.signUrl("./card-back-section/"),
        height: T_IFRAME_INIT_HEIGHT,
      },
    } as Trello.PowerUp.CardBackSection;
  },
});
</script>
