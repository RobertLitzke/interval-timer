var Timer;
(function (Timer) {
    class AudioController {
        constructor(introEndSoundEl, intervalEndSoundEl) {
            this.introEndSoundEl = introEndSoundEl;
            this.intervalEndSoundEl = intervalEndSoundEl;
        }
        playSound(audioElement) {
            audioElement.play();
        }
        playIntroEnd() {
            this.playSound(this.introEndSoundEl);
        }
        playIntervalEnd() {
            this.playSound(this.intervalEndSoundEl);
        }
    }
    Timer.AudioController = AudioController;
})(Timer || (Timer = {}));
var Timer;
(function (Timer) {
    class DisplayController {
        constructor(timerEl, totalTimerEl, taskWrapperEl, taskDisplayEl, diagramEl, statusEl, upcomingEl) {
            this.timerEl = timerEl;
            this.totalTimerEl = totalTimerEl;
            this.taskWrapperEl = taskWrapperEl;
            this.taskDisplayEl = taskDisplayEl;
            this.diagramEl = diagramEl;
            this.statusEl = statusEl;
            this.upcomingEl = upcomingEl;
        }
        setTask(taskName, color) {
            this.taskDisplayEl.innerText = taskName;
            this.taskWrapperEl.style['background-color'] = color;
        }
        setTime(seconds) {
            this.timerEl.innerText = this.formattedTime(seconds);
        }
        setTotalTime(seconds) {
            this.totalTimerEl.innerText = this.formattedTime(seconds);
        }
        setUpcoming(upcomingTasks) {
            while (this.upcomingEl.firstChild) {
                this.upcomingEl.removeChild(this.upcomingEl.firstChild);
            }
            for (const task of upcomingTasks) {
                const taskEl = document.createElement("li");
                taskEl.innerText = task;
                this.upcomingEl.appendChild(taskEl);
            }
        }
        renderFeature(feature) {
            feature.render(this.diagramEl);
        }
        clearFeature() {
            const canvas = this.diagramEl;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        formattedTime(totalSeconds) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = (totalSeconds % 60) + "";
            return minutes + ":" + seconds.padStart(2, '0');
        }
    }
    Timer.DisplayController = DisplayController;
})(Timer || (Timer = {}));
// <reference path="audio_controller.ts" />
// <reference path="display_controller.ts" />
// <reference path="feature.ts" />
// <reference path="guitar.ts" />
var countdownTimer = null;
var currentSchedule = null;
var buttonEl;
var scheduleEl;
const scheduleRegEx = /(\d+):(\d+)\s?([\w\s]+)?\;?([A-z0-9,]*)/;
//const scheduleRegEx = /(\d+):(\d+)\s?([\w\s]+)?/;
const colors = [
    '#BF616A',
    '#D08770',
    '#EBCB8B',
    '#A3BE8C',
    '#B48EAD',
];
var color_index = 0;
class IntervalTimer {
    constructor(time, introductionTime) {
        this.timeRemaining = time;
        this.introTimeRemaining = introductionTime;
        this.isIntroFinished = introductionTime == 0 ? true : false;
    }
    setCallbacks(introFinishedCallback, updateCallback, finishedCallback) {
        this.introFinishedCallback = introFinishedCallback;
        this.updateCallback = updateCallback;
        this.finishedCallback = finishedCallback;
    }
    countdown() {
        if (this.timeRemaining == 0) {
            this.finishedCallback();
            return;
        }
        if (this.introTimeRemaining > 0) {
            this.updateCallback(this.introTimeRemaining);
            this.introTimeRemaining -= 1;
            countdownTimer = setTimeout(() => this.countdown(), 1000);
            return;
        }
        else if (!this.isIntroFinished) {
            this.introFinishedCallback();
            this.isIntroFinished = true;
        }
        if (this.timeRemaining > 0) {
            this.updateCallback(this.timeRemaining);
            this.timeRemaining -= 1;
            countdownTimer = setTimeout(() => this.countdown(), 1000);
        }
        else {
            this.finishedCallback();
        }
    }
    pause() {
        clearTimeout(countdownTimer);
        countdownTimer = null;
    }
}
class Interval {
    constructor(time, introTime, task, feature) {
        this.time = time;
        this.task = task;
        this.feature = feature;
        this.timer = new IntervalTimer(time, introTime);
        this.color = colors[color_index];
        color_index = (color_index + 1) % colors.length;
    }
    setCallbacks(introFinishedCallback, updateCallback, finishedCallback) {
        this.timer.setCallbacks(introFinishedCallback, updateCallback, finishedCallback);
    }
    start() {
        this.timer.countdown();
    }
    pause() {
        this.timer.pause();
    }
}
class Schedule {
    constructor(display, audio) {
        this.display = display;
        this.audio = audio;
        this.intervals = [];
        this.currentIntervalIndex = 0;
        this.accumulatedSeconds = 0;
    }
    addPeriod(interval) {
        interval.setCallbacks(this.onIntroEnd.bind(this), this.onTimerUpdate.bind(this), this.onIntervalEnd.bind(this));
        this.intervals.push(interval);
    }
    isFinished() {
        return this.currentIntervalIndex >= this.intervals.length;
    }
    getCurrentInterval() {
        return this.isFinished() ?
            null : this.intervals[this.currentIntervalIndex];
    }
    onTimerUpdate(time) {
        this.display.setTime(time);
        this.display.setTotalTime(this.accumulatedSeconds);
        this.accumulatedSeconds++;
    }
    onIntroEnd() {
        this.audio.playIntroEnd();
    }
    onIntervalEnd() {
        this.currentIntervalIndex += 1;
        this.audio.playIntervalEnd();
        if (!this.isFinished()) {
            this.setDisplayTask(this.getCurrentInterval());
            this.updateUpcoming();
            this.intervals[this.currentIntervalIndex].start();
        }
        else {
            this.setDisplayFinished();
        }
        countdownTimer = null;
    }
    setDisplayTask(interval) {
        this.display.setTask(interval.task, interval.color);
        if (interval.feature) {
            this.display.renderFeature(interval.feature);
        }
        else {
            this.display.clearFeature();
        }
    }
    setDisplayFinished() {
        this.display.setTask('DONE!', '');
    }
    updateUpcoming() {
        if (this.isFinished()) {
            this.display.setUpcoming(["-"]);
            return;
        }
        const upcomingTasks = [];
        const maxSize = Math.min(this.currentIntervalIndex + 2, this.intervals.length);
        for (var i = this.currentIntervalIndex; i < maxSize; i++) {
            upcomingTasks.push(this.intervals[i].task);
        }
        this.display.setUpcoming(upcomingTasks);
    }
    start() {
        const interval = this.getCurrentInterval();
        if (!interval) {
            return;
        }
        interval.start();
    }
    prepare() {
        this.display.setTime(this.getCurrentInterval().time);
        this.setDisplayTask(this.getCurrentInterval());
        this.updateUpcoming();
    }
    pause() {
        const interval = this.getCurrentInterval();
        if (!interval) {
            return;
        }
        interval.pause();
    }
}
function getSchedule() {
    color_index = 0;
    const scheduleText = scheduleEl.value.trim();
    const lines = scheduleText.split("\n").map((el) => el.trim());
    const schedule = new Schedule(new Timer.DisplayController(document.querySelector("#timer"), document.querySelector("#total-timer"), document.querySelector("#task-wrapper"), document.querySelector("#task"), document.querySelector('#diagram'), document.querySelector('#status'), document.querySelector('#upcoming')), new Timer.AudioController(document.querySelector('#intro-end-sound'), document.querySelector('#interval-end-sound')));
    for (const line of lines) {
        const parsed = line.match(scheduleRegEx);
        if (!parsed) {
            console.log("Invalid format");
            continue;
        }
        const seconds = Number(parsed[1] * 60) + Number(parsed[2]);
        const introTime = Number.parseFloat(document.querySelector("#warmup").value)
            || 0;
        const feature = !parsed[4] ? null :
            new Guitar.Feature(parsed[4].split(",").map((el) => el.trim()));
        const interval = new Interval(seconds, introTime, parsed[3] ? parsed[3] : "", feature);
        schedule.addPeriod(interval);
    }
    return schedule;
}
function toggle() {
    if (!currentSchedule || currentSchedule.isFinished()) {
        reset();
    }
    if (countdownTimer) {
        currentSchedule.pause();
        buttonEl.innerText = 'START';
        buttonEl.classList.remove('is-warning');
        buttonEl.classList.add('is-success');
    }
    else {
        currentSchedule.start();
        buttonEl.innerText = 'PAUSE';
        buttonEl.classList.remove('is-success');
        buttonEl.classList.add('is-warning');
    }
}
function reset() {
    if (currentSchedule) {
        currentSchedule.pause();
    }
    currentSchedule = this.getSchedule();
    currentSchedule.prepare();
    buttonEl.innerText = 'START';
    buttonEl.classList.remove('is-warning');
    buttonEl.classList.add('is-success');
}
function init() {
    buttonEl = document.querySelector("#start-control");
    buttonEl.onclick = () => toggle();
    document.querySelector("#reset-control").onclick =
        () => reset();
    scheduleEl = document.querySelector("#schedule");
}
// <reference path="feature.ts" />
var Guitar;
(function (Guitar) {
    const stringWidths = [
        3, 3, 2, 2, 1, 1
    ];
    const patternColors = [
        "#00b159",
        "#d11141",
        "#00aedb",
        "#ffc425",
        "#f37735",
    ];
    class Feature {
        constructor(config) {
            this.config = config;
        }
        renderFrets(ctx, stringWidth, fretLength, fretCount) {
            const textHeight = 12;
            const start = 35;
            //ctx.strokeRect(start, start, width, height);
            // Verticals
            for (var i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.lineWidth = stringWidths[i];
                ctx.moveTo(start + i * stringWidth, start);
                ctx.lineTo(start + i * stringWidth, start + (fretCount * fretLength));
                ctx.stroke();
            }
            // Horizontals
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.font = textHeight + 'px';
            for (var i = 0; i <= fretCount; i++) {
                ctx.moveTo(start, start + i * fretLength);
                ctx.lineTo(start + (5 * stringWidth), start + i * fretLength);
                ctx.fillText(i, 10, start + i * fretLength + (textHeight / 4));
            }
            ctx.stroke();
        }
        drawStar(ctx, x, y, r, n, inset) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(x, y);
            ctx.moveTo(0, 0 + r);
            for (var i = 0; i < n; i++) {
                ctx.rotate(Math.PI / n);
                ctx.lineTo(0, 0 + (r * inset));
                ctx.rotate(Math.PI / n);
                ctx.lineTo(0, 0 + r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        renderScale(canvasEl, scale) {
            const start = 35;
            const fretboardWidth = 150;
            const fretboardHeight = 450;
            const fretCount = 18;
            const stringWidth = 30;
            const fretLength = 25;
            const noteRadius = fretLength / 3;
            const ctx = canvasEl.getContext('2d');
            // Reset.
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            ctx.fillStyle = 'black';
            ctx.resetTransform();
            ctx.translate(0.5, 0.5);
            this.renderFrets(ctx, stringWidth, fretLength, fretCount);
            var i = 1;
            var fretNum = 1;
            ctx.arc(start + i * stringWidth, start + fretNum * fretLength, noteRadius, 0, 2 * Math.PI);
            for (const fret of scale.frets) {
                const fretNum = fret.index;
                for (var i = 0; i < 6; i++) {
                    if (fret.strings[i]) {
                        if (fret.patterns.length == 1) {
                            ctx.beginPath();
                            ctx.fillStyle = patternColors[fret.patterns[0] - 1];
                            ctx.arc(start + i * stringWidth, start + fretNum * fretLength, noteRadius, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.stroke();
                        }
                        else {
                            ctx.beginPath();
                            var pattern1 = fret.patterns[0];
                            var pattern2 = fret.patterns[1];
                            if (fret.patterns[0] % 2 == 0) {
                                pattern1 = fret.patterns[1];
                                pattern2 = fret.patterns[0];
                            }
                            ctx.fillStyle = patternColors[pattern1 - 1];
                            ctx.arc(start + i * stringWidth, start + fretNum * fretLength, noteRadius, Math.PI / 2, Math.PI * 1.5);
                            ctx.fill();
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.fillStyle = patternColors[pattern2 - 1];
                            ctx.arc(start + i * stringWidth, start + fretNum * fretLength, noteRadius, Math.PI * 1.5, Math.PI / 2);
                            ctx.fill();
                            ctx.stroke();
                        }
                        if (fret.strings[i] == 2) {
                            ctx.fillStyle = "black";
                            this.drawStar(ctx, start + i * stringWidth, start + fretNum * fretLength, noteRadius / 2, 5, 2);
                        }
                        //ctx.fill();
                    }
                }
            }
        }
        render(container) {
            this.renderScale(container, scales[this.config[0]]);
        }
    }
    Guitar.Feature = Feature;
    class Fret {
        constructor(index, strings, patterns) {
            this.index = index;
            if (strings.length != 6) {
                throw new Error("Incorrect string count: " + index);
            }
            this.strings = strings;
            this.patterns = patterns;
        }
    }
    Guitar.Fret = Fret;
    class Scale {
        constructor(name, frets) {
            this.name = name;
            this.frets = frets;
        }
    }
    Guitar.Scale = Scale;
    const scales = {
        "MINOR_PENTATONIC": new Scale("Minor Pentatonic", [
            new Fret(5, [2, 1, 1, 1, 1, 2], [1]),
            // 6
            new Fret(7, [0, 1, 2, 1, 0, 0], [1, 2]),
            new Fret(8, [1, 0, 0, 0, 1, 1], [1, 2]),
            new Fret(9, [0, 0, 0, 1, 0, 0], [2, 3]),
            new Fret(10, [1, 1, 1, 0, 2, 1], [2, 3]),
            // 11
            new Fret(12, [1, 2, 1, 1, 0, 1], [3, 4]),
            new Fret(13, [0, 0, 0, 0, 1, 0], [3, 4]),
            new Fret(14, [0, 0, 1, 2, 0, 0], [4, 5]),
            new Fret(15, [1, 1, 0, 0, 1, 1], [4, 5]),
            new Fret(17, [2, 1, 1, 1, 1, 2], [5]),
        ]),
        "NATURAL_MINOR": new Scale("Natural Minor", [
            new Fret(2, [0, 1, 1, 2, 0, 0], [5]),
            new Fret(3, [1, 1, 1, 0, 1, 1], [5]),
            new Fret(4, [0, 0, 0, 1, 0, 0], [5]),
            new Fret(5, [2, 1, 1, 1, 1, 2], [5, 1]),
            new Fret(6, [0, 0, 0, 0, 1, 0], [5, 1]),
            new Fret(7, [1, 1, 2, 1, 0, 1], [1, 2]),
            new Fret(8, [1, 1, 0, 0, 1, 1], [1, 2]),
            new Fret(9, [0, 0, 1, 1, 0, 0], [2, 3]),
            new Fret(10, [1, 1, 1, 1, 2, 1], [2, 3]),
            // 11
            new Fret(12, [1, 2, 1, 1, 1, 1], [3, 4]),
            new Fret(13, [1, 0, 0, 0, 1, 1], [3, 4]),
            new Fret(14, [0, 1, 1, 2, 0, 0], [4]),
            new Fret(15, [1, 1, 1, 0, 1, 1], [4]),
        ]),
        "BLUES": new Scale("Blues", [
            new Fret(5, [2, 1, 1, 1, 1, 2], [1]),
            new Fret(6, [0, 1, 0, 0, 0, 0], [1]),
            new Fret(7, [0, 1, 2, 1, 0, 0], [1, 2]),
            new Fret(8, [1, 0, 0, 1, 1, 1], [1, 2]),
            new Fret(9, [0, 0, 0, 1, 0, 0], [2, 3]),
            new Fret(10, [1, 1, 1, 0, 2, 1], [2, 3]),
            new Fret(11, [1, 0, 0, 0, 0, 1], [2, 3]),
            new Fret(12, [1, 2, 1, 1, 0, 1], [3, 4]),
            new Fret(13, [0, 0, 1, 0, 1, 0], [3, 4]),
            new Fret(14, [0, 0, 1, 2, 0, 0], [4, 5]),
            new Fret(15, [1, 1, 0, 0, 1, 1], [4, 5]),
            new Fret(16, [0, 0, 0, 0, 1, 0], [4, 5]),
            new Fret(17, [2, 1, 1, 1, 1, 2], [5]),
            new Fret(18, [0, 1, 0, 0, 0, 0], [5]),
        ])
    };
    class Scales {
    }
    // A natural minor.
    Scales.natural_minor = [
        new Fret(2, [0, 1, 1, 2, 0, 0], [5]),
        new Fret(3, [1, 1, 1, 0, 1, 1], [5]),
        new Fret(4, [0, 0, 0, 1, 0, 0], [5]),
        new Fret(5, [2, 1, 1, 1, 1, 2], [5, 1]),
        new Fret(6, [0, 0, 0, 0, 1, 0], [5, 1]),
        new Fret(7, [1, 1, 2, 1, 0, 1], [1, 2]),
        new Fret(8, [1, 1, 0, 0, 1, 1], [1, 2]),
        new Fret(9, [0, 0, 1, 1, 0, 0], [2, 3]),
        new Fret(10, [1, 1, 1, 1, 2, 1], [2, 3]),
        // 11
        new Fret(12, [1, 2, 1, 1, 1, 1], [3, 4]),
        new Fret(13, [1, 0, 0, 0, 1, 1], [3, 4]),
        new Fret(14, [0, 1, 1, 2, 0, 0], [4]),
        new Fret(15, [1, 1, 1, 0, 1, 1], [4]),
    ];
    // A pentatonic minor.
    Scales.minor_pentatonic = [
        new Fret(5, [2, 1, 1, 1, 1, 2], [1]),
        // 6
        new Fret(7, [0, 1, 2, 1, 0, 0], [1, 2]),
        new Fret(8, [1, 0, 0, 0, 1, 1], [1, 2]),
        new Fret(9, [0, 0, 0, 1, 0, 0], [2, 3]),
        new Fret(10, [1, 1, 1, 0, 2, 1], [2, 3]),
        // 11
        new Fret(12, [1, 2, 1, 1, 0, 1], [3, 4]),
        new Fret(13, [0, 0, 0, 0, 1, 0], [3, 4]),
        new Fret(14, [0, 0, 1, 2, 0, 0], [4, 5]),
        new Fret(15, [1, 1, 0, 0, 1, 1], [4, 5]),
        new Fret(17, [2, 1, 1, 1, 1, 2], [5]),
    ];
    Scales.blues = [
        new Fret(5, [2, 1, 1, 1, 1, 2], [1]),
        new Fret(6, [0, 1, 0, 0, 0, 0], [1]),
        new Fret(7, [0, 1, 2, 1, 0, 0], [1, 2]),
        new Fret(8, [1, 0, 0, 1, 1, 1], [1, 2]),
        new Fret(9, [0, 0, 0, 1, 0, 0], [2, 3]),
        new Fret(10, [1, 1, 1, 0, 2, 1], [2, 3]),
        new Fret(11, [1, 0, 0, 0, 0, 1], [2, 3]),
        new Fret(12, [1, 2, 1, 1, 0, 1], [3, 4]),
        new Fret(13, [0, 0, 1, 0, 1, 0], [3, 4]),
        new Fret(14, [0, 0, 1, 2, 0, 0], [4, 5]),
        new Fret(15, [1, 1, 0, 0, 1, 1], [4, 5]),
        new Fret(16, [0, 0, 0, 0, 1, 0], [4, 5]),
        new Fret(17, [2, 1, 1, 1, 1, 2], [5]),
        new Fret(18, [0, 1, 0, 0, 0, 0], [5]),
    ];
    Guitar.Scales = Scales;
})(Guitar || (Guitar = {}));
