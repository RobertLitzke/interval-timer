// <reference path="audio_controller.ts" />
// <reference path="display_controller.ts" />
// <reference path="feature.ts" />
// <reference path="guitar.ts" />
// <reference path="schedule.ts" />
// <reference path="schedule_editor.ts" />

// The HTML countdown timer. If this is not null, the timer is running.
namespace Timer {
  export class Main {
    // The current set of intervals being followed.
    currentSchedule: any;
    displayController: Timer.DisplayController;
    audioController: Timer.AudioController;
    scheduleEditor: Timer.ScheduleEditor;
    controlButtonEl: HTMLElement;

    constructor() {
      this.currentSchedule = null;
      this.displayController = new Timer.DisplayController(
          document.querySelector("#timer"),
          document.querySelector("#total-timer"),
          document.querySelector("#task-wrapper"),
          document.querySelector("#task"),
          document.querySelector('#diagram'),
          document.querySelector('#status'),
          document.querySelector('#upcoming'));
      this.audioController = new Timer.AudioController(
          document.querySelector('#intro-end-sound'),
          document.querySelector('#interval-end-sound'));
      this.scheduleEditor = new Timer.ScheduleEditor(
          document.querySelector("#schedule-editor"),
          document.querySelector("#schedule-pretty-editor"),
          document.querySelector("#schedule-text-editor"),
          document.querySelector("#set-schedule-control"));
      this.addControlHandlers();
      this.currentSchedule = this.scheduleEditor.getSchedule(
          this.displayController, this.audioController);
      this.currentSchedule.prepare();
    }

    addControlHandlers(): void {
      this.controlButtonEl = document.querySelector("#start-control");
      this.controlButtonEl.onclick = () => this.toggleCountdown();
      (<HTMLElement>document.querySelector("#reset-control")).onclick =
          () => this.reset();
    }

    toggleCountdown(): void {
      if (!this.currentSchedule || this.currentSchedule.isFinished()) {
        this.reset();
      }

      if (this.currentSchedule.isRunning()) {
        this.currentSchedule.pause();
        this.controlButtonEl.innerText = 'START';
        this.controlButtonEl.classList.remove('is-warning');
        this.controlButtonEl.classList.add('is-success');
      } else {
        this.currentSchedule.start();
        this.controlButtonEl.innerText = 'PAUSE';
        this.controlButtonEl.classList.remove('is-success');
        this.controlButtonEl.classList.add('is-warning');
      }
    }

    reset(): void {
      if (this.currentSchedule) {
        this.currentSchedule.pause();
      }
      this.currentSchedule = this.scheduleEditor.getSchedule(
          this.displayController, this.audioController);
      this.currentSchedule.prepare();
      this.controlButtonEl.innerText = 'START';
      this.controlButtonEl.classList.remove('is-warning');
      this.controlButtonEl.classList.add('is-success');
    }
  }
}

function init() {
  new Timer.Main();
}
