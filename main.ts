// <reference path="guitar.ts" />

var countdownTimer = null;
var currentSchedule = null;

var button;
var timerElement;
var totalTimerElement;
var audioElement;
var scheduleElement;
var taskElement;
var diagramEl;

//const scheduleRegEx = /(\d+):(\d+)\s?([\w\s]+)?(\s?\|\s?(\w+))?/;
const scheduleRegEx = /(\d+):(\d+)\s?([\w\s]+)?/;

const patternColors = [
  "#00b159",
  "#d11141",
  "#00aedb",
  "#ffc425",
  "#f37735",
];

const colors = [
  '#BF616A',
  '#D08770',
  '#EBCB8B',
  '#A3BE8C',
  '#B48EAD',
];
var color_index = 0;

const stringWidths = [
  3, 3, 2, 2, 1, 1
]

class IntervalTimer {
  timeRemaining: number;
  introductionTimeRemaining: number;
  introductionCallback: Function;
  updateCallback: Function;
  finishedCallback: Function;

  constructor(time: number,
      introductionTime: number) {
    this.timeRemaining = time;
    this.introductionTimeRemaining = introductionTime;
  }

  setCallbacks(introductionCallback: Function,
      updateCallback: Function,
      finishedCallback: Function) {
    this.introductionCallback = introductionCallback;
    this.updateCallback = updateCallback;
    this.finishedCallback = finishedCallback;
  }

  countdown(): void {
    if (this.timeRemaining == 0) {
      this.finishedCallback();
      return;
    }
    if (this.introductionTimeRemaining > 0) {
      this.introductionTimeRemaining -= 1;
      countdownTimer = setTimeout(
        () => this.countdown(),
        1000);
      this.updateCallback(this.introductionTimeRemaining);
      return;
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

class Interval {
  time: number;
  task: string;
  color: string;
  timer: IntervalTimer;

  constructor(time: number,
      introTime: number,
      task: string,
      color?: string) {
    this.time = time;
    this.task = task;
    this.timer = new IntervalTimer(
      time, introTime);
    if (color) {
      this.color = color;
    } else {
      this.color = colors[color_index];
      color_index = (color_index + 1) % colors.length;
    }
  }

  setCallbacks(introductionCallback: Function,
      updateCallback: Function,
      finishedCallback: Function) {
    this.timer.setCallbacks(
        introductionCallback, updateCallback, finishedCallback);
  }

  start(): void {
    this.timer.countdown();
  }

  pause(): void {
    this.timer.pause();
  }
}

class Schedule {
  intervals: Array<Interval>;
  currentIntervalIndex: number;
  accumulatedSeconds: number;

  constructor(intervals: Array<Interval>) {
    this.intervals = intervals;
    for (const interval of this.intervals) {
      interval.setCallbacks(
          this.onIntroUpdate.bind(this),
          this.onTimerUpdate.bind(this),
          this.onIntervalEnd.bind(this));
    }
    this.currentIntervalIndex = 0;
    this.accumulatedSeconds = 0;
  }

  addPeriod(interval: Interval): void {
    interval.setCallbacks(
        this.onIntroUpdate.bind(this),
        this.onTimerUpdate.bind(this),
        this.onIntervalEnd.bind(this));
    this.intervals.push(interval);
  }

  isFinished(): boolean {
    return this.currentIntervalIndex >= this.intervals.length;
  }

  getCurrentInterval(): Interval {
    return this.isFinished() ? null : this.intervals[this.currentIntervalIndex];
  }

  countdownEnded(): void {
    playSound();
    setDisplayFinished();
    countdownTimer = null;
  }

  formattedTime(amount: number): string {
    const minutes = Math.floor(amount / 60);
    const seconds = (amount % 60) + "";
    return minutes + ":" + seconds.padStart(2, '0');
  }

  onIntroUpdate(time: number): void {
    timerElement.innerText = this.formattedTime(time);
    this.accumulatedSeconds++;
    // Set intro style
  }

  onTimerUpdate(time: number): void {
    timerElement.innerText = this.formattedTime(time);
    this.accumulatedSeconds++;
    // Set regular style.
  }

  onIntervalEnd(): void {
    this.currentIntervalIndex += 1;
    if (!this.isFinished()) {
      this.countdownEnded();
      setDisplayTask(this.getCurrentInterval());
      this.intervals[this.currentIntervalIndex].start();
    } else {
      this.countdownEnded();
    }
  }

  start(): void {
    const interval = this.getCurrentInterval();
    if (!interval) {
      return;
    }
    interval.start();
  }

  prepare(): void {
    timerElement.innerText = this.formattedTime(this.getCurrentInterval().time);
    setDisplayTask(this.getCurrentInterval());
  }

  pause(): void {
    //clearTimeout(countdownTimer);
    const interval = this.getCurrentInterval();
    if (!interval) {
      return;
    }
    interval.pause();
  }
}

function getSchedule(): Schedule {
  color_index = 0;
  const scheduleText = scheduleElement.value.trim();
  const lines = scheduleText.split("\n").map((el) => el.trim());
  const schedule = new Schedule([]);
  for (const line of lines) {
    const parsed = line.match(scheduleRegEx);
    if (!parsed) {
      console.log("Invalid format");
      continue;
    }
    console.log(line);
    const seconds = Number(parsed[1] * 60) + Number(parsed[2]);
    const interval = new Interval(seconds, 5 /*intro*/, parsed[3] ? parsed[3] : "", parsed[5]);
    schedule.addPeriod(interval);
  }
  return schedule;
}

function toggle(): void {
  if (!currentSchedule || currentSchedule.isFinished()) {
    reset();
  }

  if (countdownTimer) {
    currentSchedule.pause();
    button.innerText = 'START';
    button.classList.remove('stop');
    button.classList.add('start');
    button.class
  } else {
    currentSchedule.start();
    button.innerText = 'PAUSE';
    button.classList.remove('start');
    button.classList.add('stop');
  }
}

function reset(): void {
  if (currentSchedule) {
    currentSchedule.pause();
  }
  currentSchedule = this.getSchedule();
  currentSchedule.prepare();
  button.innerText = 'START';
  button.classList.remove('stop');
  button.classList.add('start');
}

function setDisplayTask(interval: Interval): void {
  taskElement.innerText = interval.task;
  //taskElement.class = 'task';
  taskElement.style = 'background-color: ' + interval.color;
}

function setDisplayFinished(): void {
  taskElement.innerText = 'DONE';
  //taskElement.class = 'done';
  taskElement.style = '';
}

function playSound() {
  audioElement.play();
  setTimeout(() => {
    audioElement.pause();
    audioElement.fastSeek(0);
  }, 1000);
}

function init() {
  button = document.querySelector("#start-control");
  taskElement = document.querySelector("#task");
  timerElement = document.querySelector("#timer");
  totalTimerElement = document.querySelector("#total-timer");
  scheduleElement = document.querySelector("#schedule");
  audioElement = document.querySelector('#stop-sound');
  diagramEl  = document.querySelector('#diagram');
  const guitarFeature = new Guitar.Feature();
  guitarFeature.render(diagramEl);
}
