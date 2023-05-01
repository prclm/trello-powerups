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
// TODO: move capabilities as getThing() into separate files to keep this file clean
PowerUp?.initialize(
  {
    "card-badges": async (t) => {
      const cardBadges = [];

      const trelloCtx = useTrello(POWERUP_NAME, t);
      const { getTimerLists } = useTimetracker(trelloCtx);
      const context = trelloCtx.getContext();

      let isCurrentUserTimer = false;
      let isRecording = false;

      // TODO: move to useTimetracker
      const getTotalTime = async () => {
        const timerLists = await getTimerLists();
        return timerLists.reduce((acc, timerList) => {
          const timerListTotal = timerList.timers.reduce((acc, timer) => {
            const timerTotal = timer.tracks.reduce((acc, track) => {
              let trackTotal;
              if (track.endTime) {
                trackTotal = track.endTime - track.startTime;
              } else {
                isRecording = true;
                if (track.memberId === context.member) {
                  isCurrentUserTimer = true;
                }
                const now = new Date().getTime();
                trackTotal = now - track.startTime;
              }
              return acc + trackTotal;
            }, 0);
            return acc + timerTotal;
          }, 0);
          return acc + timerListTotal;
        }, 0);
      };

      // TODO: move timeString function from Clock to utils and use it here
      const getTimeString = (timestamp: number) => {
        const hours = Math.floor(timestamp / 1000 / 60 / 60);
        const minutes = Math.floor((timestamp / 1000 / 60 / 60 - hours) * 60);
        const seconds = Math.floor(
          ((timestamp / 1000 / 60 / 60 - hours) * 60 - minutes) * 60
        );

        return `${hours ? hours + "h " : ""}${minutes ? minutes + "m " : ""}${
          seconds && !minutes && !hours ? seconds + "s" : ""
        }`;
      };

      /**
       * load static badge if timer is not recording
       * load dynamic badge if timer is recording
       *
       * // TODO: load icons from assets
       * // FIXME: allways show static badge to "no-member" users, cause trello does not update badges on change for them
       */
      const getTotalBadgeStatic = (totalTime: number) =>
        ({
          text: getTimeString(totalTime),
          icon: "https://tabler-icons.io/static/tabler-icons/icons-png/clock-play.png",
        } as Trello.PowerUp.CardBadge);

      const getTotalBadgeDynamic = () =>
        ({
          dynamic: async () => {
            return {
              text: getTimeString(await getTotalTime()),
              icon: `https://tabler-icons.io/static/tabler-icons/icons-png/clock-${
                isCurrentUserTimer ? "record" : "pause"
              }.png`,
              color: isCurrentUserTimer ? "red" : "blue",
              refresh: 10,
            };
          },
        } as Trello.PowerUp.CardBadge);

      const totalTime = await getTotalTime();
      if (totalTime > 0) {
        const totalBadge = isRecording
          ? getTotalBadgeDynamic()
          : getTotalBadgeStatic(totalTime);
        cardBadges.push(totalBadge);
      }

      return cardBadges;
    },
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
