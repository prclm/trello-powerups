<template>
  <div class="input-elements">
    <form @submit="submitForm">
      <input v-model="inputModel" :placeholder="inputPlaceholder" required />
      <PButton
        type="submit"
        :icon-before="iconPlay"
        :disabled="!inputModel.length"
        hide-title
      >
        {{ submitBtnTitle }}
      </PButton>
    </form>
  </div>
</template>

<script lang="ts">
import { inject, ref } from "#imports";
import { useTrello, TRELLO_CTX_SYMBOL } from "~~/composables/trello";
import {
  useTimetracker,
  TIMETRACKER_CTX_SYMBOL,
} from "~~/composables/timetracker";
import { iconPlay } from "~~/composables/icons";
import { randomInt } from "~~/utils/math";
</script>

<script lang="ts" setup>
/** inject and use trello context */
const { localizeKey, localizeKeys } = inject(TRELLO_CTX_SYMBOL) as ReturnType<
  typeof useTrello
>;
/** inject and use timetracker context */
const { addTimer } = inject(TIMETRACKER_CTX_SYMBOL) as ReturnType<
  typeof useTimetracker
>;

const props = defineProps<{
  timerListId: string;
}>();

const inputModel = ref("");
const submitBtnTitle = localizeKey("Start recording");

/** a list of placeholders to randomly choose from */
const placeholderList = localizeKeys([
  "Start something new today!",
  "What`s up next?",
  "Be fantastic!",
  "It's time for …",
  "I'm going to start right now!",
  "This will be great!",
  "let's go …",
]);
const getRandomPlaceholder = () => {
  const index = randomInt(0, placeholderList.length - 1);
  return placeholderList[index];
};
const inputPlaceholder = ref(getRandomPlaceholder());

const submitForm = (e: Event) => {
  e.preventDefault();
  if (inputModel.value !== "") {
    addTimer(props.timerListId, inputModel.value);
    inputPlaceholder.value = getRandomPlaceholder();
    inputModel.value = "";
  }
};
</script>

<style lang="scss" scoped>
.input-elements,
form {
  display: flex;
  align-items: stretch;
  * {
    margin: 0;
  }
}
form {
  flex-grow: 1;
  input {
    flex-grow: 1;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &:focus-within {
    input {
      --ds-border-input: ; //unset color var
      &:valid {
        --ds-border-input: var(--background-brand-bold);
      }
    }
    button {
      &:not(:disabled) {
        background-color: var(--background-brand-bold);
        color: white;
        &:focus {
          background-color: var(--background-brand-bold-hovered);
        }
      }
    }
  }
}
</style>
