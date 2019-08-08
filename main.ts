// <reference path="audio_controller.ts" />
// <reference path="display_controller.ts" />
// <reference path="feature.ts" />
// <reference path="guitar.ts" />
// <reference path="schedule.ts" />

// The HTML countdown timer. If this is not null, the timer is running.
var countdownTimer = null;
// The current set of intervals being followed.
var currentSchedule = null;

var controlButtonEl;

// A regex for parsing each line of the schedule.
const scheduleRegEx = /(\d+):(\d+)\,?([A-z0-9#, ]+)*/;

function getSchedule(): Timer.Schedule {
  const scheduleText =
      (<HTMLInputElement>document.querySelector("#schedule")).value.trim();
  const lines = scheduleText.split("\n").map((el) => el.trim());
  const schedule = new Timer.Schedule(
    new Timer.DisplayController(
      document.querySelector("#timer"),
      document.querySelector("#total-timer"),
      document.querySelector("#task-wrapper"),
      document.querySelector("#task"),
      document.querySelector('#diagram'),
      document.querySelector('#status'),
      document.querySelector('#upcoming')),
    new Timer.AudioController(
      document.querySelector('#intro-end-sound'),
      document.querySelector('#interval-end-sound')));
  for (const line of lines) {
    const parsed = line.match(scheduleRegEx);
    if (!parsed) {
      console.log("Invalid format");
      continue;
    }
    const seconds = Number(parsed[1]) * 60 + Number(parsed[2]);
    const introTime =
        Number.parseFloat(
          (<HTMLInputElement>document.querySelector("#warmup")).value)
        || 0;

    const additionalInfo =
    parsed[3] ? parsed[3].split(",").map((el) => el.trim()) : [];
    const name = additionalInfo.length > 0 ? additionalInfo[0] : "";
    const feature = additionalInfo.length <= 1 ? null :
        new Guitar.Feature(additionalInfo.slice(1));
    const interval = new Timer.Interval(seconds,
        introTime,
        name,
        feature);
    schedule.addInterval(interval);
  }
  return schedule;
}

function toggle(): void {
  if (!currentSchedule || currentSchedule.isFinished()) {
    reset();
  }

  if (countdownTimer) {
    currentSchedule.pause();
    controlButtonEl.innerText = 'START';
    controlButtonEl.classList.remove('is-warning');
    controlButtonEl.classList.add('is-success');
  } else {
    currentSchedule.start();
    controlButtonEl.innerText = 'PAUSE';
    controlButtonEl.classList.remove('is-success');
    controlButtonEl.classList.add('is-warning');
  }
}

function reset(): void {
  if (currentSchedule) {
    currentSchedule.pause();
  }
  currentSchedule = this.getSchedule();
  currentSchedule.prepare();
  controlButtonEl.innerText = 'START';
  controlButtonEl.classList.remove('is-warning');
  controlButtonEl.classList.add('is-success');
}

function init() {
  controlButtonEl = document.querySelector("#start-control");
  controlButtonEl.onclick = () => toggle();
  (<HTMLElement>document.querySelector("#reset-control")).onclick =
      () => reset();
}
