<template>
  <pre>PowerUpStorage{{ "&nbsp;" }}({{ storageSizeRef }}):<!--
  -->{{ storageWithSize }}</pre>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from "#imports";
import { useTrello, TRELLO_CTX_SYMBOL } from "~~/composables/trello";

/** inject and use trello context */
const trelloCtx = inject(TRELLO_CTX_SYMBOL) as ReturnType<typeof useTrello>;
const { getStoredDataRef } = trelloCtx;

const storage = getStoredDataRef();
const storageSizeRef = ref();
const storageWithSize = computed(() => {
  if (typeof storage.value !== "object") return "stroage not yet loaded...";
  let storageSize = 0;

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

      storageSize += entrySize;

      scopeValueWithSize[`${visibilityKey} (${entrySize}/4096)`] =
        visibilityValue;
    });
    storageWithSizeObject[scopeKey] = scopeValueWithSize;
  });

  storageSizeRef.value = storageSize;
  return storageWithSizeObject;
});
</script>

<style scoped></style>
