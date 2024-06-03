import {Feature} from "./feature";
import {Interval} from "./schedule";

export enum Status {
  Play = "Play",
  Pause = "Pause",
  Stop = "Stop",
};

export class DisplayController {
  timerEl: HTMLElement;
  totalTimerEl: HTMLElement;
  taskWrapperEl: HTMLElement;
  taskDisplayEl: HTMLElement;
  diagramEl: HTMLElement;
  statusEl: HTMLElement;
  upcomingEl: HTMLElement;
  controlButtonEl: HTMLElement;

  constructor(timerEl: HTMLElement,
      totalTimerEl: HTMLElement,
      taskWrapperEl: HTMLElement,
      taskDisplayEl: HTMLElement,
      diagramEl: HTMLCanvasElement,
      statusEl: HTMLElement,
      upcomingEl: HTMLElement,
      controlButtonEl: HTMLElement) {
    this.timerEl = timerEl;
    this.totalTimerEl = totalTimerEl;
    this.taskWrapperEl = taskWrapperEl;
    this.taskDisplayEl = taskDisplayEl;
    this.diagramEl = diagramEl;
    this.statusEl = statusEl;
    this.upcomingEl = upcomingEl;
    this.controlButtonEl = controlButtonEl;
  }

  setTask(taskName: string, color: string): void {
    this.taskDisplayEl.innerText = taskName;
    this.taskWrapperEl.style['background-color'] = color;
  }

  setTime(seconds: number): void {
    this.timerEl.innerText = this.formattedTime(seconds);
  }

  setStatus(status: Status): void {
    switch (status) {
      case Status.Play:
        this.statusEl.innerHTML = "<img src='images/play.svg'>";
        return;
      case Status.Pause:
        this.statusEl.innerHTML = "<img src='images/pause.svg'>";
        return;
      case Status.Stop:
        this.statusEl.innerHTML = "<img src='images/stop.svg'>";
        return;
      default:
        console.log("Unknown status");
    }
  }

  flashOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("visible");
    setTimeout(() => {
      overlay.classList.remove("visible");
      overlay.classList.add("hidden");
    }, 500);
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

  renderFeature(feature: Feature): void {
    console.log('rendering feature');
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

  setStart(): void {
    this.controlButtonEl.innerText = 'START';
    this.controlButtonEl.classList.remove('is-warning');
    this.controlButtonEl.classList.add('is-success');
  }

  setPause(): void {
    this.controlButtonEl.innerText = 'PAUSE';
    this.controlButtonEl.classList.remove('is-success');
    this.controlButtonEl.classList.add('is-warning');
  }
}
