<template>
  <form
    ref="formRef"
    class="timer-edit"
    @keydown.escape.prevent="handleCancel"
    @keydown.enter.prevent="handleSubmit"
    @focusout="handleFocusOut"
  >
    <textarea v-model="editableTitle" required />
    <footer>
      <PButton
        type="button"
        class="mod-primary"
        :disabled="editableTitle.length === 0"
        @click="handleSubmit"
      >
        {{ strSave }}
      </PButton>
      <PButton
        type="button"
        class="btn-cancel"
        :icon-before="iconCancel"
        hide-title
        @click="handleCancel"
      >
        {{ strCancel }}
      </PButton>
      <div class="toolbar">
        <slot name="toolbar" />
      </div>
    </footer>
  </form>
</template>

<script lang="ts">
import { inject, onMounted, onUnmounted, ref } from "#imports";
import { TRELLO_CTX_SYMBOL, useTrello } from "~~/composables/trello";
import type { TimeTracker } from "~~/composables/timetracker.d";
import { iconCancel } from "~~/composables/icons";
import { removeLineBreaks } from "~~/utils/text";
export const getDraftStorageName = (timerId: string) =>
  `draft_timer-${timerId}_title`;
</script>

<script lang="ts" setup>
/** inject and use trello context */
const trelloCtx = inject(TRELLO_CTX_SYMBOL) as ReturnType<typeof useTrello>;
const { localizeKeys } = trelloCtx;

const props = defineProps<{
  timer: TimeTracker.Timer;
  isEditMode: Boolean;
}>();

const emit = defineEmits<{
  (e: "update:is-edit-mode", value: Boolean): void;
  (e: "update:timer", value: TimeTracker.Timer): void;
}>();

const [strSave, strCancel] = localizeKeys(["save", "cancel"]);

// get draft storage name format
const draftStorageName = getDraftStorageName(props.timer.id);
// load draft from localstorage if available
const unsavedTitle = window.localStorage.getItem(draftStorageName);
const editableTitle = ref(
  unsavedTitle === null ? props.timer.title : unsavedTitle
);
const submitted = ref(false);

const formRef = ref<HTMLFormElement | null>(null);

// handle focus on mount and unmount
const prevFocusRef = ref<HTMLElement | null>(null);
onMounted(() => {
  // focus textarea on mount
  const activeEl = document.activeElement as HTMLElement;
  prevFocusRef.value = activeEl;
  formRef.value?.querySelector("textarea")?.focus();
});
onUnmounted(() => {
  // restore focus on unmount
  prevFocusRef.value?.focus();
});

const handleCancel = () => {
  editableTitle.value = props.timer.title;
  window.localStorage.removeItem(draftStorageName);
  emit("update:is-edit-mode", false);
};

const handleSubmit = () => {
  if (editableTitle.value.length === 0) {
    // TODO: add validation message
    return;
  }
  window.localStorage.removeItem(draftStorageName);
  emit("update:timer", {
    ...props.timer,
    title: removeLineBreaks(editableTitle.value),
  });
  emit("update:is-edit-mode", false);
  submitted.value = true;
};

const handleFocusOut = (focusevent: FocusEvent) => {
  // skip if the form is submitted
  if (submitted.value) return;

  // if the focus is lost (outside this window or iframe), handle unsaved changes
  if (focusevent.relatedTarget === null) {
    handleUnsaved();
    return;
  }

  // delay the handleUnsaved call until the mouseup or keyup event, to check if the focus is still on the form
  // TODO: fix the touch experience on iOS
  document.addEventListener("mouseup", handleDelay);
  document.addEventListener("keyup", handleDelay);
  function handleDelay() {
    if (!formRef.value?.contains(focusevent.relatedTarget as Node)) {
      handleUnsaved();
    }
    document.removeEventListener("mouseup", handleDelay);
    document.removeEventListener("keyup", handleDelay);
  }
};

const handleUnsaved = () => {
  if (editableTitle.value && props.timer.title !== editableTitle.value) {
    window.localStorage.setItem(draftStorageName, editableTitle.value);
  } else {
    window.localStorage.removeItem(draftStorageName);
  }
  emit("update:is-edit-mode", false);
};
</script>

<style lang="scss" scoped>
.timer-edit {
  display: flex;
  flex-direction: column;

  textarea {
    margin: 0;
    background-color: var(--background-neutral);
  }

  footer {
    display: flex;
    margin-top: 8px;
    align-items: center;

    .btn-cancel {
      &:not(:hover) {
        background-color: unset !important;
        text-decoration: underline;
      }
    }

    .toolbar {
      margin-left: auto;
    }
  }

  &-cancel {
    background-color: unset;
  }
}
</style>
