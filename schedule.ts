namespace Timer {

  // Colors for tasks in intervals.
  const intervalColors = [
    '#e7cba9',
    '#aad9cd',
    '#e8d595',
    '#8da47e',
    '#e9bbb5',
  ];

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

    getCurrentInterval(): Interval {
      return this.isFinished() ?
          null : this.intervals[this.currentIntervalIndex];
    }

    onTimerUpdate(time: number): void {
      this.display.setTime(time);
      this.display.setTotalTime(this.accumulatedSeconds, this.totalDuration);
      this.accumulatedSeconds++;
    }

    onIntroEnd(): void {
      this.audio.playIntroEnd();
    }

    onIntervalEnd(): void {
      this.currentIntervalIndex += 1;
      this.audio.playIntervalEnd();
      if (!this.isFinished()) {
        this.setDisplayTask(this.getCurrentInterval());
        this.updateUpcoming();
        this.intervals[this.currentIntervalIndex].start();
      } else {
        this.setDisplayFinished();
      }
      countdownTimer = null;
    }

    setDisplayTask(interval: Interval): void {
      this.display.setTask(interval.task, interval.color);
      if (interval.feature) {
        this.display.renderFeature(interval.feature);
      } else {
        this.display.clearFeature();
      }
    }

    setDisplayFinished(): void {
      this.display.setTask('DONE!', '');
    }

    updateUpcoming(): void {
      if (this.isFinished()) {
        this.display.setUpcoming(["-"]);
        return;
      }
      const upcomingTasks = [];
      const maxSize = Math.min(
          this.currentIntervalIndex + 2, this.intervals.length);
      for (var i = this.currentIntervalIndex; i < maxSize; i++) {
        upcomingTasks.push(this.intervals[i].task);
      }
      this.display.setUpcoming(upcomingTasks);
    }

    start(): void {
      const interval = this.getCurrentInterval();
      if (!interval) {
        return;
      }
      interval.start();
    }

    prepare(): void {
      this.display.setTime(this.getCurrentInterval().duration);
      this.setDisplayTask(this.getCurrentInterval());
      this.updateUpcoming();
    }

    pause(): void {
      const interval = this.getCurrentInterval();
      if (!interval) {
        return;
      }
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

    getTotalDuration(): number {
      return this.duration + this.introDuration;
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
        this.updateCallback(this.introTimeRemaining);
        this.introTimeRemaining -= 1;
        countdownTimer = setTimeout(
          () => this.countdown(),
          1000);
        return;
      } else if (!this.isIntroFinished) {
        this.introFinishedCallback();
        this.isIntroFinished = true;
      }

      if (this.timeRemaining > 0) {
        this.updateCallback(this.timeRemaining);
        this.timeRemaining -= 1;
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
