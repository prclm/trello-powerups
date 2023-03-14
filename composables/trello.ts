export const T_IFRAME_INIT_HEIGHT = 1;

export const useTrello = () => {
  const isClient = process.client && window !== undefined;
  const PowerUp = isClient ? window.TrelloPowerUp : undefined;
  const isTrelloEnv = isClient && PowerUp !== undefined;

  const handleIframeResize = (ref: globalThis.Ref<HTMLElement | undefined>) => {
    if (!isTrelloEnv) return;

    const resizeIframe = () => {
      if (ref.value) {
        PowerUp?.iframe().sizeTo(ref.value);
      }
    };

    const resizeIframeObserver = isClient
      ? new ResizeObserver(resizeIframe)
      : null;

    onMounted(() => {
      if (ref.value) {
        resizeIframe();
        if (!resizeIframeObserver) return;
        resizeIframeObserver.observe(ref.value);
      }
    });

    onUnmounted(() => {
      if (!resizeIframeObserver) return;
      resizeIframeObserver.disconnect();
    });
  };

  return {
    PowerUp,
    isTrelloEnv,
    handleIframeResize,
  };
};
