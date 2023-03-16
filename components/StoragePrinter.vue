<template>
  <pre>{{ storageWithSize }}</pre>
</template>

<script lang="ts" setup>
import { computed, inject } from "#imports";
import { useTrello, TRELLO_CTX_SYMBOL } from "~~/composables/trello";

/** inject and use trello context */
const trelloCtx = inject(TRELLO_CTX_SYMBOL) as ReturnType<typeof useTrello>;
const { getStoredDataRef } = trelloCtx;

const storage = getStoredDataRef();
const storageWithSize = computed(() => {
  if (typeof storage.value !== "object") return "stroage not yet loaded...";

  const storageWithSizeObject: any = {};
  Object.entries(storage.value).forEach((scopeItem) => {
    const [scopeKey, scopeValue] = scopeItem as [string, object];

    const scopeValueWithSize: any = {};
    Object.entries(scopeValue).forEach((visibilityItem) => {
      const [visibilityKey, visibilityValue] = visibilityItem as [
        string,
        object
      ];
      const entrySize =
        visibilityKey.length + JSON.stringify(visibilityValue).length;

      scopeValueWithSize[`${visibilityKey} (${entrySize}/4096)`] =
        visibilityValue;
    });
    storageWithSizeObject[scopeKey] = scopeValueWithSize;
  });
  return storageWithSizeObject;
});
</script>

<style scoped></style>
