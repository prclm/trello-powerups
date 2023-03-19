<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    This page will initialize the TimeTracker PowerUp.<br />
    Nothing else will happen here.
  </div>
</template>

<script lang="ts">
import {
  PowerUp,
  useTrello,
  T_IFRAME_INIT_HEIGHT,
} from "~~/composables/trello";
import {
  POWERUP_NAME,
  iframeOptions,
  useTimetracker,
} from "~~/composables/timetracker";
import { svgData, iconTimerNew, iconTimerPlay } from "~~/composables/icons";
import type { Trello } from "~~/composables/trello.d";
</script>

<script setup lang="ts">
PowerUp?.initialize(
  {
    "card-buttons": async (t) => {
      const trelloCtx = useTrello(POWERUP_NAME, t);
      const { localizeKey } = trelloCtx;
      const { getTimerLists } = useTimetracker(trelloCtx);
      const timerLists = await getTimerLists();
      const newTimerListButton = {
        text: localizeKey("Time recording"),
        icon: svgData(iconTimerNew.body),
        callback: (t: Trello.PowerUp.IFrame) => {
          const trelloCtx = useTrello(POWERUP_NAME, t);
          const { addTimerList } = useTimetracker(trelloCtx);
          addTimerList();
        },
      } as Trello.PowerUp.CardButton;

      return [
        timerLists.length < 3 && newTimerListButton,
      ] as Trello.PowerUp.CardButton[];
    },
    "card-back-section": async (t) => {
      const trelloCtx = useTrello(POWERUP_NAME, t);
      const { localizeKey } = trelloCtx;
      const { getTimerLists } = useTimetracker(trelloCtx);
      const timerLists = await getTimerLists();
      if (timerLists.length === 0) return {} as Trello.PowerUp.CardBackSection;
      return {
        title: localizeKey("Time recording"),
        icon: svgData(iconTimerPlay.body),
        content: {
          type: "iframe",
          url: t.signUrl(
            PowerUp?.util.relativeUrl("../card-back-section/") as string
          ),
          height: T_IFRAME_INIT_HEIGHT,
        },
      } as Trello.PowerUp.CardBackSection;
    },
  },
  iframeOptions
);
// eslint-disable-next-line no-console
console.log("TimeTracker PowerUp initialized.");
</script>
