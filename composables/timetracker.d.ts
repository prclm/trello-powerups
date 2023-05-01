export namespace TimeTracker {
  type Timestamp = number; // Datetime in miliseconds
  type Time = number; // miliseconds

  interface TimeTrackCompressed {
    id: string;
    memberId?: Trello.Member["id"];
    startTime?: Timestamp;
    endTime?: Timestamp;
    endTimePlaceholder?: "hold memory for endTime";
    note?: string;
  }
  interface TimeTrack extends TimeTrackCompressed {
    memberId: Trello.Member["id"];
    startTime: Timestamp;
  }

  interface Timer {
    id: string;
    tracks: TimeTrack[];
    title: string;
  }

  interface TimerList {
    id: string;
    timers: Timer[];
  }
}
