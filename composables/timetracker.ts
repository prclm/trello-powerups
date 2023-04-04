import { onMounted, onUnmounted, ref } from "#imports";
import { useTrello } from "~~/composables/trello";
import type { Trello } from "~~/composables/trello.d";
import type { TimeTracker } from "~~/composables/timetracker.d";

export const POWERUP_NAME = "TimeTracker";
export const TIMETRACKER_CTX_SYMBOL = Symbol(
  "timetracker context provider identifier"
);

const TIMER_LIST_SCOPE: Trello.PowerUp.Scope = "card";
const TIMER_LIST_VISIBILITY: Trello.PowerUp.Visibility = "shared";
const TIMER_LIST_KEY_PREFIX = "timerlist-";

const CURRENT_USER_TIMER_SCOPE: Trello.PowerUp.Scope = "member";
const CURRENT_USER_TIMER_VISIBILITY: Trello.PowerUp.Visibility = "shared";
const CURRENT_USER_TIMER_KEY = "current-timer";

export const POWERUP_LOCALIZATION = {
  defaultLocale: "de",
  supportedLocales: ["de", "en"],
  resourceUrl: "/api/locale/timetracker/{locale}",
};

export const iframeOptions = {
  localization: POWERUP_LOCALIZATION,
} as Trello.PowerUp.IFrameOptions;

export const useTimetracker = (
  trelloInstance: ReturnType<typeof useTrello>,
  startTimerInterval = false
) => {
  const { getContext, set, get, getAll, remove, localizeKey, localizeKeys, t } =
    trelloInstance;

  /** returns current TimeStamp in miliseconds */
  const now = () => new Date().getTime();

  /** generate an id based on userid and current timestamp or given value */
  const newId = (overwrite: unknown = null) => {
    // the memberId tells who created the id
    const { member } = getContext();
    return [overwrite || now(), member].join("-");
  };

  /**
   * TimerLists
   *
   * - getTimerLists()
   * - reloadTimerLists()
   * - getTimerListsRef()
   *
   * - deleteTimerLists() (ToDo?)
   */

  const timerListsRef = ref<TimeTracker.TimerList[]>([]);

  const getTimerLists = async () => {
    const data = await getAll(
      TIMER_LIST_SCOPE,
      TIMER_LIST_VISIBILITY,
      (key: string) => key.startsWith(TIMER_LIST_KEY_PREFIX)
    );
    const lists =
      (data[TIMER_LIST_SCOPE] &&
        data[TIMER_LIST_SCOPE][TIMER_LIST_VISIBILITY]) ||
      [];
    return Object.values(lists) as TimeTracker.TimerList[];
  };

  const reloadTimerLists = async () => {
    const timerLists = await getTimerLists();
    timerListsRef.value = timerLists;
  };

  const getTimerListsRef = () => {
    reloadTimerLists();
    return timerListsRef;
  };

  /**
   * TimerList
   *
   * - addTimerList()
   * - setTimerList()
   *
   * - getTimerList()
   * - deleteTimerList() (ToDo?)
   */

  const addTimerList = async () => {
    const newTimerList = {
      id: newId(),
      timers: [],
    } as TimeTracker.TimerList;
    await setTimerList(newTimerList, TIMER_LIST_SCOPE);
    reloadTimerLists();
  };

  const setTimerList = async (
    timerList: TimeTracker.TimerList,
    scope?: Trello.PowerUp.Scope | Trello.PowerUp.Card["id"]
  ) => {
    if (scope === undefined) {
      const { card } = getContext();
      if (card === undefined)
        throw new Error("Can not set timerList, scope is not defined.");
      scope = card;
    }
    await set(
      scope,
      TIMER_LIST_VISIBILITY,
      `${TIMER_LIST_KEY_PREFIX}${timerList.id}`,
      timerList
    );
    reloadTimerLists();
  };

  const getTimerList = async (
    id: TimeTracker.TimerList["id"],
    scope?: Trello.PowerUp.Scope | Trello.PowerUp.Card["id"]
  ) => {
    if (scope === undefined) {
      const { card } = getContext();
      if (card === undefined)
        throw new Error("Can not get timerList, scope is not defined.");
      scope = card;
    }
    return (await get(
      scope,
      TIMER_LIST_VISIBILITY,
      `${TIMER_LIST_KEY_PREFIX}${id}`
    )) as TimeTracker.TimerList | undefined;
  };

  /**
   * Timer
   *
   * - addTimer()
   * - startTimer()
   * - setTimer()
   * - deleteTimer()
   * - deleteTimerConfirm()
   */

  const addTimer = async (timerListId: string, title: string) => {
    const createTime = now();
    const timerId = newId(createTime);
    const trackId = newId(createTime);
    const newTimer = {
      id: timerId,
      title,
      tracks: [
        {
          id: trackId,
          startTime: createTime,
          endTimePlaceholder: "hold memory for endTime", // this string is static by typescript type
        },
      ],
    } as TimeTracker.Timer;

    // stop current timer if one is running
    await stopCurrentUserTimer();

    await Promise.all([
      setTimer(timerListId, newTimer),
      // setTimerList(timerList, TIMER_LIST_SCOPE),
      setCurrentUserTimer(timerListId, timerId, trackId),
    ]);
  };

  const startTimer = async (
    timerListId: TimeTracker.TimerList["id"],
    timerId: TimeTracker.Timer["id"],
    scope?: Trello.PowerUp.Scope
  ) => {
    const timerList = await getTimerList(timerListId, scope);
    if (timerList === undefined) {
      throw new Error("Could not start timer. TimerList not found.");
    }

    const timer = timerList.timers.find((timer) => timer.id === timerId);
    if (timer === undefined) {
      throw new Error("Could not start timer. Timer not found.");
    }

    const createTime = now();
    const newTrack = {
      id: newId(createTime),
      startTime: createTime,
      endTimePlaceholder: "hold memory for endTime", // this string is static by typescript type
    } as TimeTracker.TimeTrack;
    timer.tracks.push(newTrack);

    // stop current timer if one is running
    await stopCurrentUserTimer();

    await Promise.all([
      setTimer(timerListId, timer),
      setCurrentUserTimer(timerListId, timer.id, newTrack.id),
    ]);
  };

  const setTimer = async (
    timerListId: TimeTracker.TimerList["id"],
    timer: TimeTracker.Timer
  ) => {
    const timerLists = (await getTimerLists()) as TimeTracker.TimerList[];
    const timerList = timerLists.find(
      (timerList) => timerList.id === timerListId
    );
    if (!timerList) throw new Error("Timerlist not found.");

    let found = false;
    const nextTimers = timerList.timers.map((entry) => {
      if (entry.id === timer.id) {
        found = true;
        return timer;
      }
      return entry;
    });

    if (found === false) {
      nextTimers.push(timer);
    }

    timerList.timers = nextTimers;

    await setTimerList(timerList, TIMER_LIST_SCOPE);
  };

  const deleteTimerConfirm = (
    event: Event,
    timerListId: TimeTracker.TimerList["id"],
    timerId: TimeTracker.Timer["id"],
    scope?: Trello.PowerUp.Scope
  ) => {
    const [title, message, confirmText, cancelText] = localizeKeys([
      ["Delete timer"],
      ["Please confirm that you want to delete this recording."],
      ["Of course, delete!"],
      ["Oh no, don't!"],
    ]);

    /**
     * // TODO: is it possible to get the keyboard focus inside the popup iframe?
     * // TODO: change the confirm method to own UI, t.popup() is not accessable for keyboard users and not available in local dev env
     */
    if (t) {
      t.popup({
        type: "confirm",
        title,
        message,
        confirmText,
        cancelText,
        confirmStyle: "danger",
        onConfirm: async (t) => {
          await deleteTimer(timerListId, timerId, scope);
          t.closePopup();
        },
        onCancel: async (t) => {
          await t.closePopup();
        },
        mouseEvent: event as MouseEvent,
      });
      return;
    }
    deleteTimer(timerListId, timerId, scope);
  };

  const deleteTimer = async (
    timerListId: TimeTracker.TimerList["id"],
    timerId: TimeTracker.Timer["id"],
    scope?: Trello.PowerUp.Scope
  ) => {
    const timerList = await getTimerList(timerListId, scope);
    if (timerList === undefined) {
      throw new Error("Could not delete timer. TimerList not found.");
    }

    // remove current timer if one is running
    const currentUserTimer = await getCurrentUserTimer();
    if (currentUserTimer && currentUserTimer.currentTimer.id === timerId) {
      await removeCurrentUserTimer();
    }

    let found = false;
    const nextTimers = timerList.timers.filter((entry) => {
      if (entry.id === timerId) {
        found = true;
        return false;
      }
      return true;
    });

    if (found === false) {
      throw new Error("Could not delete timer. Timer not found.");
    }

    timerList.timers = nextTimers;

    await setTimerList(timerList, scope);
  };

  /**
   * CurrentUserTimer
   *
   * - setCurrentUserTimer()
   * - getCurrentUserTimer()
   * - stopCurrentUserTimer()
   * - removeCurrentUserTimer()
   * - ifCurrentUserTimer()
   */

  const setCurrentUserTimer = async (
    timerListId: TimeTracker.TimerList["id"],
    timerId: TimeTracker.Timer["id"],
    trackId: TimeTracker.TimeTrack["id"],
    scope?: Trello.PowerUp.Scope
  ) => {
    const { card } = getContext();
    await set(
      CURRENT_USER_TIMER_SCOPE,
      CURRENT_USER_TIMER_VISIBILITY,
      CURRENT_USER_TIMER_KEY,
      {
        cardId: scope || card,
        timerListId,
        timerId,
        trackId,
      }
    );
  };

  const getCurrentUserTimer = async () => {
    // get meta data of current user timer
    const currentUserTimerMeta = await get(
      CURRENT_USER_TIMER_SCOPE,
      CURRENT_USER_TIMER_VISIBILITY,
      CURRENT_USER_TIMER_KEY
    );
    if (!currentUserTimerMeta) {
      return null; // no current user timer
    }

    const {
      cardId: currentCardId,
      timerListId: currentListId,
      timerId: currentTimerId,
      trackId: currentTrackId,
    } = currentUserTimerMeta;

    // try to fetch current user timer
    let currentTimerList;
    try {
      currentTimerList = (await get(
        currentCardId,
        TIMER_LIST_VISIBILITY,
        TIMER_LIST_KEY_PREFIX + currentListId
      )) as TimeTracker.TimerList;
    } catch (e) {
      return false; // handle false as error
    }

    const currentTimer = currentTimerList?.timers.find(
      (timer) => timer.id === currentTimerId
    );
    if (!currentTimer) return false; // handle false as error

    return { currentTimer, currentTimerList, currentCardId, currentTrackId };
  };

  const stopCurrentUserTimer = async () => {
    const currentUserTimer = await getCurrentUserTimer();

    // no current user timer
    if (currentUserTimer === null) return;

    // faild to get current user timer
    if (currentUserTimer === false) {
      await removeCurrentUserTimer();
      t?.alert({
        message: localizeKey(
          "Error: We could not stop your last timer. Maybe the timer or card has been deleted?"
        ),
        duration: 30,
      });
      return;
    }

    const { currentTimer, currentTimerList, currentCardId, currentTrackId } =
      currentUserTimer;

    // find the current tack, add endTime and remove endTimePlaceholder
    const nextTimerTracks = currentTimer.tracks.map((track) => {
      if (track.id === currentTrackId) {
        delete track.endTimePlaceholder;
        track.endTime = now();
      }
      return track;
    });

    // add modified tracks back to timer
    currentTimerList.timers = currentTimerList.timers.map((timer) => {
      if (timer.id === currentTimer.id) {
        timer.tracks = nextTimerTracks;
      }
      return timer;
    });

    // save the timerList and remove currentUserTimer
    await Promise.all([
      await setTimerList(currentTimerList, currentCardId),
      await removeCurrentUserTimer(),
    ]);
  };

  const removeCurrentUserTimer = async () => {
    await remove(
      CURRENT_USER_TIMER_SCOPE,
      CURRENT_USER_TIMER_VISIBILITY,
      CURRENT_USER_TIMER_KEY
    );
  };

  const ifCurrentUserTimer = (timer: TimeTracker.Timer) => {
    const { member } = getContext();
    return !!timer.tracks.find((track) => {
      if (track.endTime === undefined && track.id.endsWith(member)) {
        return true;
      }
      return false;
    });
  };

  /**
   * global timer interval
   * for multiple timers running in sync
   */

  const globalTimeIntervalRef = ref<Date>();
  const timerIntervalIdRef = ref();
  if (startTimerInterval) {
    onMounted(() => {
      timerIntervalIdRef.value = setInterval(timerIntervalCallback, 1000);
    });
    onUnmounted(() => {
      clearInterval(timerIntervalIdRef.value);
    });
  }

  const timerIntervalCallback = () => {
    const now = new Date();
    globalTimeIntervalRef.value = now;
  };

  /**
   * handle rerender forced by trello
   */

  const handleRerender = () => {
    reloadTimerLists();
  };

  return {
    getTimerListsRef,
    getTimerLists,
    addTimerList,
    addTimer,
    setTimer,
    startTimer,
    deleteTimer: deleteTimerConfirm,
    stopCurrentUserTimer,
    ifCurrentUserTimer,
    globalTimeIntervalRef,
    handleRerender,
  };
};
