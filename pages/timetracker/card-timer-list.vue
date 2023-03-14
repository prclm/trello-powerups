<template>
  <div ref="wrapper">Card Timer Liste</div>
</template>

<script setup lang="ts">
const wrapper = ref<HTMLElement>();
const { handleIframeResize } = useTrello();
handleIframeResize(wrapper);
</script>
