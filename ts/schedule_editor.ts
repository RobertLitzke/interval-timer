// <reference path="audio_controller.ts" />
// <reference path="display_controller.ts" />
// <reference path="feature.ts" />
// <reference path="schedule.ts" />

namespace Timer {
  const scheduleRegEx = /([0-9:]+),?([A-z0-9#, ]+)*/;

  export class ScheduleEditor {
    // A regex for parsing each line of the schedule.
    el: HTMLElement;
    prettyEl: HTMLElement;
    textEl: HTMLInputElement;
    updateButtonEl: HTMLElement;

    constructor(el: HTMLElement,
        prettyEl: HTMLElement,
        textEl: HTMLInputElement,
        updateButtonEl: HTMLElement,
        updateAction: () => any) {
      this.el = el;
      this.prettyEl = el;
      this.textEl = textEl;
      this.updateButtonEl = updateButtonEl;
      this.updateButtonEl.onclick = updateAction;
    }

    // Given an input in the form "seconds", "minutes:seconds" or
    // "hours:minutes:seconds", output total seconds as a number.
    getTotalSeconds(input: string): number {
      const split = input.split(":");
      var seconds = 0;
      for (var i = split.length - 1; i >= 0; i--) {
        seconds += Number(split[i]) * Math.pow(60, split.length - i - 1);
      }
      return seconds;
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
        const seconds = this.getTotalSeconds(parsed[1]);
        const introTime =
            Number.parseFloat(
              (<HTMLInputElement>document.querySelector("#warmup")).value)
            || 0;

        const additionalInfo =
        parsed[2] ? parsed[2].split(",").map((el) => el.trim()) : [];
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
