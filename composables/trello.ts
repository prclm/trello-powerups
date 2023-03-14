import { ref as vueRef } from "vue";
import { Trello } from "~~/types/trello";

export const T_IFRAME_INIT_HEIGHT = 1;

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
  const T = PowerUp?.iframe();
  const getTrelloContext = () => T?.getContext();
  const getContext = () => getTrelloContext() || LOCAL_CONTEXT;
  const isTrelloIframe = () => !!getTrelloContext();

  const handleIframeResizeRef = () => {
    const ref = vueRef<HTMLElement | undefined>();
    if (!isTrelloIframe()) return ref;

    const resizeIframe = () => {
      if (ref.value) {
        T?.sizeTo(ref.value);
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
    return ref;
  };

  const get = async (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string,
    defaultValue: unknown
  ) => {
    if (isTrelloIframe()) {
      return await T?.get(scope, visibility, key, defaultValue);
    }
    return getLocalStorage(scope, visibility, key, defaultValue);
  };

  const getAll = async () => {
    if (isTrelloIframe()) {
      return { ...(await T?.getAll()) };
    }
    return { ...getAllLocalStorage() };
  };

  const getAllFiltered = async ({
    scope,
    visibility,
    filterCallback,
  }: {
    scope?: Trello.PowerUp.Scope;
    visibility?: Trello.PowerUp.Visibility;
    filterCallback?(key: string): boolean;
  } = {}) => {
    const data = { ...(await getAll()) }; // !destructuring to not delete references through filter
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

  const set = async (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string,
    value: unknown
  ) => {
    if (isTrelloIframe()) {
      // TODO: implement Error handling https://developer.atlassian.com/cloud/trello/power-ups/client-library/getting-and-setting-data/#errors
      await T?.set(scope, visibility, key, value);
    }
    return setLocalStorage(scope, visibility, key, value);
  };

  const remove = async (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string
  ) => {
    if (isTrelloIframe()) {
      return await T?.remove(scope, visibility, key);
    }
    return removeLocalStorage(scope, visibility, key);
  };

  const localStorageKeyPrefix = `tpu-${powerUpName}`;
  const localStorageKeySeparator = "-+-";

  const stringifyLocalStorageKey = (
    scope: string,
    visibility: string,
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

  const getLocalStorage = (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string,
    defaultValue: unknown
  ) => {
    if (isClient) {
      const storedValue = window.localStorage.getItem(
        stringifyLocalStorageKey(scope, visibility, key)
      );
      if (storedValue !== null) return JSON.parse(storedValue);
      return defaultValue;
    }
    throw new Error(
      "Can not access LocalStorage, this is not a Brower Enviroment."
    );
  };

  const getAllLocalStorage = () => {
    if (isClient) {
      const allKeys = Object.keys({ ...window.localStorage }).filter((key) =>
        key.startsWith(localStorageKeyPrefix)
      );
      const allValues = allKeys.map((key) => ({
        key,
        value: localStorage.getItem(key),
      }));
      const pluginData = allValues.reduce((dataObj: any, item) => {
        const { scope, visibility, key } = parseLocalStorageKey(item.key);
        if (!item.value) return dataObj;
        if (dataObj[scope] === undefined) dataObj[scope] = {};
        if (dataObj[scope][visibility] === undefined)
          dataObj[scope][visibility] = {};
        dataObj[scope][visibility][key] = JSON.parse(item.value);
        return dataObj;
      }, {});
      return pluginData;
    }
    throw new Error(
      "Can not access LocalStorage, this is not a Brower Enviroment."
    );
  };

  const setLocalStorage = (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string,
    value: unknown
  ) => {
    if (isClient) {
      window.localStorage.setItem(
        stringifyLocalStorageKey(scope, visibility, key),
        JSON.stringify(value)
      );
      return;
    }
    throw new Error(
      "Can not access LocalStorage, this is not a Brower Enviroment."
    );
  };

  const removeLocalStorage = (
    scope: Trello.PowerUp.Scope,
    visibility: Trello.PowerUp.Visibility,
    key: string
  ) => {
    if (isClient) {
      window.localStorage.removeItem(
        stringifyLocalStorageKey(scope, visibility, key)
      );
      return;
    }
    throw new Error(
      "Can not access LocalStorage, this is not a Brower Enviroment."
    );
  };

  return {
    PowerUp,
    T,
    isTrelloIframe,
    getContext,
    handleIframeResizeRef,
    get,
    getAll,
    getAllFiltered,
    set,
    remove,
  };
};
