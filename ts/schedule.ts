namespace Timer {

  // Colors for tasks in intervals.
  const intervalColors = [
    '#e7cba9',
    '#aad9cd',
    '#e8d595',
    '#8da47e',
    '#e9bbb5',
  ];

  var countdownTimer = null;

  // An instance of a schedule.
  export class Schedule {
    intervals: Array<Interval>;
    currentIntervalIndex: number;
    accumulatedSeconds: number;
    totalDuration: number;
    display: Timer.DisplayController;
    audio: Timer.AudioController;
    color_index: number;

    constructor(display: Timer.DisplayController,
        audio: Timer.AudioController) {
      this.display = display;
      this.audio = audio;
      this.intervals = [];
      this.currentIntervalIndex = 0;
      this.accumulatedSeconds = 0;
      this.totalDuration = 0;
      this.color_index = 0;
    }

    addInterval(interval: Interval): void {
      interval.setCallbacks(
          this.onIntroEnd.bind(this),
          this.onTimerUpdate.bind(this),
          this.onIntervalEnd.bind(this));
      interval.setColor(intervalColors[this.color_index]);
      this.color_index = (this.color_index + 1) % intervalColors.length;
      this.totalDuration +=  interval.getTotalDuration();
      this.intervals.push(interval);
    }

    isFinished(): boolean {
      return this.currentIntervalIndex >= this.intervals.length;
    }

    isRunning(): boolean {
      return countdownTimer != null;
    }

    getCurrentInterval(): Interval {
      return this.isFinished() ?
          null : this.intervals[this.currentIntervalIndex];
    }

    onTimerUpdate(time: number): void {
      this.display.setTime(time);
      this.setTotalTime();
      this.accumulatedSeconds++;
    }

    onIntroEnd(): void {
      this.audio.playIntroEnd();
      this.setDisplayTask(this.getCurrentInterval());
      this.display.flashOverlay();
    }

    onIntervalEnd(): void {
      this.currentIntervalIndex += 1;
      this.audio.playIntervalEnd();
      this.display.flashOverlay();
      if (!this.isFinished()) {
        this.setDisplayTask(this.getCurrentInterval());
        this.updateUpcoming();
        this.intervals[this.currentIntervalIndex].start();
      } else {
        this.setDisplayFinished();
      }
      countdownTimer = null;
    }

    setTotalTime(): void {
      this.display.setTotalTime(this.accumulatedSeconds, this.totalDuration);
    }


    setDisplayTask(interval: Interval): void {
      const suffix = interval.isIntroActive() ? " (Warmup)" : "";
      this.display.setTask(
        interval.task + suffix,
        interval.color);
      if (interval.feature) {
        this.display.renderFeature(interval.feature);
      } else {
        this.display.clearFeature();
      }
    }

    setDisplayFinished(): void {
      this.display.setTask('DONE!', '');
      this.display.setStatus(Status.Stop);
      this.display.setStart();
    }

    updateUpcoming(): void {
      if (this.isFinished()) {
        this.display.setUpcoming([]);
        return;
      }
      const upcomingTasks = [];
      const maxSize = Math.min(
          this.currentIntervalIndex + 3, this.intervals.length);
      for (var i = this.currentIntervalIndex + 1; i < maxSize; i++) {
        upcomingTasks.push(this.intervals[i]);
      }
      this.display.setUpcoming(upcomingTasks);
    }

    start(): void {
      const interval = this.getCurrentInterval();
      if (!interval) {
        return;
      }
      this.display.setPause();
      this.display.setStatus(Status.Play);
      interval.start();
    }

    prepare(): void {
      this.display.setTime(this.getCurrentInterval().getCurrentTimeRemaining());
      this.setDisplayTask(this.getCurrentInterval());
      this.setTotalTime();
      this.updateUpcoming();
    }

    pause(): void {
      const interval = this.getCurrentInterval();
      if (!interval) {
        return;
      }
      this.display.setStart();
      this.display.setStatus(Status.Pause);
      interval.pause();
    }
  }

  // An interval in a schedule.
  export class Interval {
    duration: number;
    introDuration: number;
    task: string;
    color: string;
    timer: IntervalTimer;
    feature: Timer.Feature;

    constructor(duration: number,
        introDuration: number,
        task: string,
        feature?: Timer.Feature) {
      this.duration = duration;
      this.introDuration = introDuration;
      this.task = task;
      this.feature = feature;
      this.timer = new IntervalTimer(
        duration, introDuration);
    }

    setColor(color: string) {
      this.color = color;
    }

    setCallbacks(introFinishedCallback: Function,
        updateCallback: Function,
        finishedCallback: Function) {
      this.timer.setCallbacks(
          introFinishedCallback,
          updateCallback,
          finishedCallback);
    }

    isIntroActive(): boolean {
      return !this.timer.isIntroFinished;
    }

    getTotalDuration(): number {
      return this.duration + this.introDuration;
    }

    getCurrentTimeRemaining(): number {
      if (this.isIntroActive()) {
        return this.timer.introTimeRemaining;
      }
      return this.timer.timeRemaining;
    }

    start(): void {
      this.timer.countdown();
    }

    pause(): void {
      this.timer.pause();
    }
  }

  // Controls timing and the countdown timer.
  class IntervalTimer {
    timeRemaining: number;
    introTimeRemaining: number;
    isIntroFinished: boolean;
    introFinishedCallback: Function;
    updateCallback: Function;
    finishedCallback: Function;

    constructor(time: number,
        introductionTime: number) {
      this.timeRemaining = time;
      this.introTimeRemaining = introductionTime;
      this.isIntroFinished = introductionTime == 0 ? true : false;
    }

    setCallbacks(introFinishedCallback: Function,
        updateCallback: Function,
        finishedCallback: Function) {
      this.introFinishedCallback = introFinishedCallback;
      this.updateCallback = updateCallback;
      this.finishedCallback = finishedCallback;
    }

    countdown(): void {
      if (this.timeRemaining == 0) {
        this.finishedCallback();
        return;
      }
      if (this.introTimeRemaining > 0) {
      this.introTimeRemaining -= 1;
        this.updateCallback(this.introTimeRemaining);
        countdownTimer = setTimeout(
          () => this.countdown(),
          1000);
        return;
      } else if (!this.isIntroFinished) {
      this.isIntroFinished = true;
        this.introFinishedCallback();
      }

      if (this.timeRemaining > 0) {
        this.timeRemaining -= 1;
        this.updateCallback(this.timeRemaining);
        countdownTimer = setTimeout(
          () => this.countdown(),
          1000);
      } else {
        this.finishedCallback();
      }
    }

    pause(): void {
      clearTimeout(countdownTimer);
      countdownTimer = null;
    }
  }
}
