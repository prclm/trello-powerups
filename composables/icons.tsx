import iconTimerNew from "@iconify-icons/tabler/clock-plus";
import iconTimerPlay from "@iconify-icons/tabler/clock-play";
import iconTimerRecord from "@iconify-icons/tabler/clock-record";
import iconPlay from "@iconify-icons/tabler/player-play-filled";
import iconRecord from "@iconify-icons/tabler/player-record-filled";
import iconStop from "@iconify-icons/tabler/player-stop-filled";
import iconDelete from "@iconify-icons/tabler/trash";
import iconCancel from "@iconify-icons/tabler/x";
import { svgData, svgImage, svgStyle } from "~~/utils/svg";
export { Icon } from "@iconify/vue";
export type { IconifyIcon as IconData } from "@iconify/types";

export {
  iconPlay,
  iconRecord,
  iconStop,
  iconTimerNew,
  iconTimerPlay,
  iconTimerRecord,
  iconDelete,
  iconCancel,
};

export const cssFx = {
  blink: {
    className: "fx-blink",
    css: `
        .fx-blink {
          transition: all linear;
          animation: blink-animation 1s infinite;
          -webkit-animation: blink-animation 1s infinite;
        }
        @keyframes blink-animation {
            0% {
              opacity: 1;
            }
            90% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
        }
        @-webkit-keyframes blink-animation {
          0% {
            opacity: 1;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }`,
  },
};

const iconRecordAnimated = svgStyle(iconRecord.body, {
  className: cssFx.blink.className,
  css: cssFx.blink.css,
  color: "red",
});

export { svgData, svgImage, iconRecordAnimated };
