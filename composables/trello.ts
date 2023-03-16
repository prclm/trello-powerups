import { onMounted, onUnmounted, ref } from "#imports";
import type { Trello } from "~~/composables/trello.d";

export const T_IFRAME_INIT_HEIGHT = 1;
export const TRELLO_CTX_SYMBOL = Symbol(
  "trello iframe context provider identifier"
);

/** get the TrelloPowerUp Object from window if in browser enviroment */
export const isClient = process.client && window !== undefined;
export const PowerUp = (isClient && window.TrelloPowerUp) || null;

/** LocalContext for Testing Purposes outside of Trello Context */
const LOCAL_CONTEXT = {
  board: "boardId",
  card: "cardId",
  member: "memberId",
  organization: "organizationId",
  enterprise: "enterpriseId",
  permissions: {
    board: "write",
    organization: "write",
    card: "write",
  },
  version: "powerUpVersion:1.0",
} as Trello.PowerUp.Context;

export const useTrello = (powerUpName: string) => {
  /** T as the trello api Object */
  const T = PowerUp?.iframe();

  /**
   * provide the trello context OR LOCAL_CONTEXT for testing
   * https://developer.atlassian.com/cloud/trello/power-ups/client-library/t-getcontext/#t-getcontext--
   */
  const getTrelloContext = () => T?.getContext();
  const getContext = () => getTrelloContext() || LOCAL_CONTEXT;

  /** helper function that proofs the trello context */
  const isTrelloIframe = () => !!getTrelloContext();

  /**
   * handleIframeResizeRef provides a ref for the iframe container
   * and observes the refElement size to call trello to resize the iframe
   */

  const handleIframeResizeRef = () => {
    const refEl = ref<HTMLElement | undefined>();
    if (!isTrelloIframe()) return refEl;

    const resizeIframe = () => {
      refEl.value && T?.sizeTo(refEl.value);
    };

    const resizeIframeObserver = isClient
      ? new ResizeObserver(resizeIframe)
      : null;

    onMounted(() => {
      if (refEl.value) {
        resizeIframe();
        resizeIframeObserver?.observe(refEl.value);
      }
    });

    onUnmounted(() => {
      resizeIframeObserver?.disconnect();
    });
    return refEl;
  };

  /**
   * DataHandling Adapters
   *
   * - uses LocalStorage as fallback outside of trello iframes
   * - trello data api: https://developer.atlassian.com/cloud/trello/power-ups/client-library/getting-and-setting-data/#getting-and-setting-data
   *
   * - get()
   * - getLocalStorage() (private)
   * - getAll()
   * - getAllLocalStorage() (private)
   * - set()
   * - setLocalStorage() (private)
   * - remove()
   * - removeLocalStorage() (private)
   * - stringifyLocalStorageKey() (private)
   * - parseLocalStorageKey() (private)
   */

  const localStorageKeyPrefix = `tpu-${powerUpName}`;
  const localStorageKeySeparator = "-+-";

  const get = async (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key?: string,
    defaultValue?: unknown
  ) => {
    if (isTrelloIframe()) {
      return await T?.get(scope, visibility, key, defaultValue);
    }
    if (key) {
      return getLocalStorage(scope, visibility, key, defaultValue);
    } else {
      return getAllLocalStorage(scope, visibility) || defaultValue;
    }
  };

  const getLocalStorage = (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string,
    defaultValue?: unknown
  ) => {
    if (isClient) {
      if (scope === LOCAL_CONTEXT.card) {
        // this mimics the get data by cardId option for localStorage
        scope = "card";
      }
      const storedValue = window.localStorage.getItem(
        stringifyLocalStorageKey(scope, visibility, key)
      );
      if (storedValue !== null) return JSON.parse(storedValue);
      return defaultValue;
    }
  };

  const getAll = async (
    scope?: Trello.PowerUp.Scope,
    visibility?: Trello.PowerUp.Visibility,
    filterCallback?: (key: string) => boolean
  ) => {
    if (isTrelloIframe()) {
      return filterStorageData(await T?.getAll(), {
        scope,
        visibility,
        filterCallback,
      });
    }
    return {
      ...getAllLocalStorage(scope, visibility, filterCallback),
    };
  };

  const getAllLocalStorage = (
    scope?: Trello.PowerUp.Scope,
    visibility?: Trello.PowerUp.Visibility,
    filterCallback?: (key: string) => boolean
  ) => {
    if (isClient) {
      const allKeys = Object.keys({ ...window.localStorage });
      const filteredKeys = allKeys.filter((key) =>
        key.startsWith(localStorageKeyPrefix)
      );
      if (Object.keys(filteredKeys).length === 0) return null;
      const allKeyValues = filteredKeys.map((key) => ({
        key,
        value: localStorage.getItem(key),
      }));
      const pluginData = allKeyValues.reduce((dataObj: any, item) => {
        const { scope, visibility, key } = parseLocalStorageKey(item.key);
        if (!item.value) return dataObj;
        if (dataObj[scope] === undefined) dataObj[scope] = {};
        if (dataObj[scope][visibility] === undefined)
          dataObj[scope][visibility] = {};
        dataObj[scope][visibility][key] = JSON.parse(item.value);
        return dataObj;
      }, {});
      return filterStorageData(pluginData, {
        scope,
        visibility,
        filterCallback,
      });
    }
  };

  const filterStorageData = (
    data: any,
    {
      scope,
      visibility,
      filterCallback,
    }: {
      scope?: Trello.PowerUp.Scope;
      visibility?: Trello.PowerUp.Visibility;
      filterCallback?(key: string): boolean;
    } = {}
  ) => {
    data = { ...data }; // !destructuring to not delete references through filter
    if (scope || visibility || filterCallback) {
      Object.keys(data).forEach((scopeKey) => {
        if (scope && scopeKey !== scope) {
          delete data[scopeKey];
        } else if (visibility || filterCallback) {
          Object.keys(data[scopeKey]).forEach((visibilityKey) => {
            if (visibility && visibilityKey !== visibility) {
              delete data[scopeKey][visibilityKey];
            } else if (filterCallback) {
              Object.keys(data[scopeKey][visibilityKey]).forEach((key) => {
                if (filterCallback && !filterCallback(key)) {
                  delete data[scopeKey][visibilityKey][key];
                }
              });
            }
          });
        }
      });
    }
    return data;
  };

  // TODO: also allow multiple entries with {key: value} pairs
  const set = async (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string,
    value: unknown
  ) => {
    if (isTrelloIframe()) {
      // TODO: implement Error handling https://developer.atlassian.com/cloud/trello/power-ups/client-library/getting-and-setting-data/#errors
      await T?.set(scope, visibility, key, value);
    } else {
      setLocalStorage(scope, visibility, key, value);
    }
    updateStoredData();
  };

  const setLocalStorage = (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string,
    value: unknown
  ) => {
    if (isClient) {
      if (scope === LOCAL_CONTEXT.card) {
        // this mimics the get data by cardId option for localStorage
        scope = "card";
      }
      window.localStorage.setItem(
        stringifyLocalStorageKey(scope, visibility, key),
        JSON.stringify(value)
      );
    }
  };

  // TODO: also allow multiple entries with {key: value} pairs
  const remove = async (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string
  ) => {
    if (isTrelloIframe()) {
      await T?.remove(scope, visibility, key);
    } else {
      removeLocalStorage(scope, visibility, key);
    }
    updateStoredData();
  };

  const removeLocalStorage = (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string
  ) => {
    if (scope === LOCAL_CONTEXT.card) {
      // this mimics the get data by cardId option for localStorage
      scope = "card";
    }
    if (isClient) {
      window.localStorage.removeItem(
        stringifyLocalStorageKey(scope, visibility, key)
      );
    }
  };

  const stringifyLocalStorageKey = (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string
  ) => {
    return [localStorageKeyPrefix, scope, visibility, key].join(
      localStorageKeySeparator
    );
  };

  const parseLocalStorageKey = (keyString: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localStorageKeyPrefix, scope, visibility, key] = keyString.split(
      localStorageKeySeparator
    );
    return { scope, visibility, key };
  };

  const storedDataRef = ref();

  const updateStoredData = async () => {
    storedDataRef.value = await getAll();
  };

  const getStoredDataRef = () => {
    onMounted(() => {
      updateStoredData();
    });
    return storedDataRef;
  };

  /**
   * handle rerender forced by trello
   */

  const handleRerender = () => {
    updateStoredData();
  };

  return {
    PowerUp,
    T,
    isTrelloIframe,
    getContext,
    handleIframeResizeRef,
    get,
    getAll,
    set,
    remove,
    getStoredDataRef,
    initStoredDataRef: getStoredDataRef, // deprecaded
    handleRerender,
  };
};
