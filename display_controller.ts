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

    setUpcoming(upcomingTasks: Array<string>): void {
      while (this.upcomingEl.firstChild) {
        this.upcomingEl.removeChild(this.upcomingEl.firstChild)
      }
      for (const task of upcomingTasks) {
        const taskEl = document.createElement("li");
        taskEl.innerText = task;
        this.upcomingEl.appendChild(taskEl);
      }
    }

    renderFeature(feature: Timer.Feature): void {
      feature.render(this.diagramEl);
    }

    clearFeature(): void {
      const canvas = (<HTMLCanvasElement>this.diagramEl);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    formattedTime(totalSeconds: number): string {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = (totalSeconds % 60) + "";
      return minutes + ":" + seconds.padStart(2, '0');
    }
  }
}
