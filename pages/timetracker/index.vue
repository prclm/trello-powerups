<template>
  <div>
    TimeTracker PowerUp wird initialisiert...<br />
    Hier gibt es nichts zu sehen.
    <ul>
      <li>
        <NuxtLink to="./card-timer-list/">Card Timer List</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { PowerUp } = useTrello();
if (PowerUp) {
  PowerUp.initialize({
    "card-back-section": (t) => {
      return {
        title: "TimeTracker",
        icon: "",
        content: {
          type: "iframe",
          url: t.signUrl("./card-timer-list/"),
          height: T_IFRAME_INIT_HEIGHT,
        },
      };
    },
  });
}
</script>
