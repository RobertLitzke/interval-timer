import {AudioController} from "./audio_controller";
import {DisplayController} from "./display_controller";
import {ScheduleEditor} from "./schedule_editor";

// The HTML countdown timer. If this is not null, the timer is running.

export class Main {
  // The current set of intervals being followed.
  currentSchedule: any;
  displayController: DisplayController;
  audioController: AudioController;
  scheduleEditor: ScheduleEditor;
  controlButtonEl: HTMLElement;

  constructor() {
    this.currentSchedule = null;
    this.displayController = new DisplayController(
        document.querySelector("#timer"),
        document.querySelector("#total-timer"),
        document.querySelector("#task-wrapper"),
        document.querySelector("#task"),
        document.querySelector('#diagram'),
        document.querySelector('#status'),
        document.querySelector('#upcoming'),
        document.querySelector("#start-control"));
    this.audioController = new AudioController(
        document.querySelector('#intro-end-sound'),
        document.querySelector('#interval-end-sound'));
    this.scheduleEditor = new ScheduleEditor(
        document.querySelector("#schedule-editor"),
        document.querySelector("#schedule-pretty-editor"),
        document.querySelector("#schedule-text-editor"),
        document.querySelector("#set-schedule-control"),
        () => this.reset());
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
    } else {
      this.currentSchedule.start();
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

export function init() {
  new Main();
}

module.exports = { "init": init };