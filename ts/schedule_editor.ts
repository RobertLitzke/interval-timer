// <reference path="audio_controller.ts" />
// <reference path="display_controller.ts" />
// <reference path="feature.ts" />
// <reference path="schedule.ts" />

namespace Timer {
  const scheduleRegEx = /(\d+):(\d+)\,?([A-z0-9#, ]+)*/;

  export class ScheduleEditor {
    // A regex for parsing each line of the schedule.
    el: HTMLElement;
    prettyEl: HTMLElement;
    textEl: HTMLInputElement;
    updateButtonEl: HTMLElement;

    constructor(el: HTMLElement,
        prettyEl: HTMLElement,
        textEl: HTMLInputElement,
        updateButtonEl: HTMLElement) {
      this.el = el;
      this.prettyEl = el;
      this.textEl = textEl;
      this.updateButtonEl = updateButtonEl;
    }

    getSchedule(displayController: Timer.DisplayController,
        audioController: Timer.AudioController): Timer.Schedule {
      const scheduleText = this.textEl.value.trim();
      const lines = scheduleText.split("\n").map((el) => el.trim());
      const schedule = new Timer.Schedule(displayController, audioController);
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
  }
}
