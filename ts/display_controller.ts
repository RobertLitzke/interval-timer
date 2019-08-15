namespace Timer {

  export class DisplayController {
    timerEl: HTMLElement;
    totalTimerEl: HTMLElement;
    taskWrapperEl: HTMLElement;
    taskDisplayEl: HTMLElement;
    diagramEl: HTMLElement;
    statusEl: HTMLElement;
    upcomingEl: HTMLElement;

    constructor(timerEl: HTMLElement,
        totalTimerEl: HTMLElement,
        taskWrapperEl: HTMLElement,
        taskDisplayEl: HTMLElement,
        diagramEl: HTMLCanvasElement,
        statusEl: HTMLElement,
        upcomingEl: HTMLElement) {
      this.timerEl = timerEl;
      this.totalTimerEl = totalTimerEl;
      this.taskWrapperEl = taskWrapperEl;
      this.taskDisplayEl = taskDisplayEl;
      this.diagramEl = diagramEl;
      this.statusEl = statusEl;
      this.upcomingEl = upcomingEl;
    }

    setTask(taskName: string, color: string): void {
      this.taskDisplayEl.innerText = taskName;
      this.taskWrapperEl.style['background-color'] = color;
    }

    setTime(seconds: number): void {
      this.timerEl.innerText = this.formattedTime(seconds);
    }

    setTotalTime(seconds: number, totalDuration: number): void {
      this.totalTimerEl.innerText =
          this.formattedTime(seconds) + " / " + this.formattedTime(totalDuration);
    }

    setUpcoming(upcomingIntervals: Array<Interval>): void {
      this.clearAllChildren(this.upcomingEl);
      for (const interval of upcomingIntervals) {
        const intervalEl = document.createElement("li");
        const text =
            `${interval.task} [${this.formattedTime(interval.duration)}]`;
        intervalEl.innerText = text;
        this.upcomingEl.appendChild(intervalEl);
      }
    }

    renderFeature(feature: Timer.Feature): void {
      feature.render(this.diagramEl);
    }

    clearFeature(): void {
      this.clearAllChildren(this.diagramEl);
    }

    formattedTime(totalSeconds: number): string {
      const remainder = Math.floor(totalSeconds / 60);
      const seconds = (totalSeconds % 60) + "";
      if (remainder < 60) {
        return `${remainder}:${seconds.padStart(2, '0')}`;
      }
      const hours = Math.floor(remainder / 60);
      const minutes = (remainder % 60) + "";
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2,'0')}`;
    }

    clearAllChildren(element: HTMLElement): void {
      while (element.firstChild) {
        element.removeChild(element.firstChild)
      }
    }
  }
}
