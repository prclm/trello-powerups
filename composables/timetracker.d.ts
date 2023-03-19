export namespace TimeTracker {
  type Timestamp = number; // Datetime in miliseconds
  type Time = number; // miliseconds

  interface TimeTrack {
    id: string;
    startTime: Timestamp;
    endTime?: Timestamp;
    endTimePlaceholder?: "hold memory for endTime";
    note?: string;
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
