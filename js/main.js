var Timer;
(function (Timer) {
    // Colors for tasks in intervals.
    const intervalColors = [
        '#e7cba9',
        '#aad9cd',
        '#e8d595',
        '#8da47e',
        '#e9bbb5',
    ];
    // An instance of a schedule.
    class Schedule {
        constructor(display, audio) {
            this.display = display;
            this.audio = audio;
            this.intervals = [];
            this.currentIntervalIndex = 0;
            this.accumulatedSeconds = 0;
            this.totalDuration = 0;
            this.color_index = 0;
        }
        addInterval(interval) {
            interval.setCallbacks(this.onIntroEnd.bind(this), this.onTimerUpdate.bind(this), this.onIntervalEnd.bind(this));
            interval.setColor(intervalColors[this.color_index]);
            this.color_index = (this.color_index + 1) % intervalColors.length;
            this.totalDuration += interval.getTotalDuration();
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
            this.display.setTotalTime(this.accumulatedSeconds, this.totalDuration);
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
            this.display.setTime(this.getCurrentInterval().duration);
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
    Timer.Schedule = Schedule;
    // An interval in a schedule.
    class Interval {
        constructor(duration, introDuration, task, feature) {
            this.duration = duration;
            this.introDuration = introDuration;
            this.task = task;
            this.feature = feature;
            this.timer = new IntervalTimer(duration, introDuration);
        }
        setColor(color) {
            this.color = color;
        }
        setCallbacks(introFinishedCallback, updateCallback, finishedCallback) {
            this.timer.setCallbacks(introFinishedCallback, updateCallback, finishedCallback);
        }
        getTotalDuration() {
            return this.duration + this.introDuration;
        }
        start() {
            this.timer.countdown();
        }
        pause() {
            this.timer.pause();
        }
    }
    Timer.Interval = Interval;
    // Controls timing and the countdown timer.
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
})(Timer || (Timer = {}));
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
        setTotalTime(seconds, totalDuration) {
            this.totalTimerEl.innerText =
                this.formattedTime(seconds) + " / " + this.formattedTime(totalDuration);
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
            while (this.diagramEl.firstChild) {
                this.diagramEl.removeChild(this.diagramEl.firstChild);
            }
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
// <reference path="schedule.ts" />
// The HTML countdown timer. If this is not null, the timer is running.
var countdownTimer = null;
// The current set of intervals being followed.
var currentSchedule = null;
var controlButtonEl;
// A regex for parsing each line of the schedule.
const scheduleRegEx = /(\d+):(\d+)\,?([A-z0-9, ]+)*/;
function getSchedule() {
    const scheduleText = document.querySelector("#schedule").value.trim();
    const lines = scheduleText.split("\n").map((el) => el.trim());
    const schedule = new Timer.Schedule(new Timer.DisplayController(document.querySelector("#timer"), document.querySelector("#total-timer"), document.querySelector("#task-wrapper"), document.querySelector("#task"), document.querySelector('#diagram'), document.querySelector('#status'), document.querySelector('#upcoming')), new Timer.AudioController(document.querySelector('#intro-end-sound'), document.querySelector('#interval-end-sound')));
    for (const line of lines) {
        const parsed = line.match(scheduleRegEx);
        if (!parsed) {
            console.log("Invalid format");
            continue;
        }
        const seconds = Number(parsed[1]) * 60 + Number(parsed[2]);
        const introTime = Number.parseFloat(document.querySelector("#warmup").value)
            || 0;
        const additionalInfo = parsed[3] ? parsed[3].split(",").map((el) => el.trim()) : [];
        const name = additionalInfo.length > 0 ? additionalInfo[0] : "";
        const feature = additionalInfo.length <= 1 ? null :
            new Guitar.Feature(additionalInfo.slice(1));
        const interval = new Timer.Interval(seconds, introTime, name, feature);
        schedule.addInterval(interval);
    }
    return schedule;
}
function toggle() {
    if (!currentSchedule || currentSchedule.isFinished()) {
        reset();
    }
    if (countdownTimer) {
        currentSchedule.pause();
        controlButtonEl.innerText = 'START';
        controlButtonEl.classList.remove('is-warning');
        controlButtonEl.classList.add('is-success');
    }
    else {
        currentSchedule.start();
        controlButtonEl.innerText = 'PAUSE';
        controlButtonEl.classList.remove('is-success');
        controlButtonEl.classList.add('is-warning');
    }
}
function reset() {
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
    document.querySelector("#reset-control").onclick =
        () => reset();
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
    const START_PX = 35;
    const STRING_WIDTH_PX = 25;
    const FRET_LENGTH_PX = 30;
    const NOTE_RADIUS_PX = FRET_LENGTH_PX / 3;
    class Feature {
        constructor(config) {
            this.config = config;
        }
        clearAllChildren(element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
        // Creates a header and appends it to the given element, returning the
        // header element.
        addHeader(element, text) {
            const headerEl = document.createElement('p');
            headerEl.classList.add('subtitle');
            headerEl.innerText = text;
            element.appendChild(headerEl);
            return headerEl;
        }
        // Creates a standard canvas and appends it to the given element, returning
        // the canvas.
        addCanvas(element) {
            const canvasEl = document.createElement('canvas');
            canvasEl.id = 'canvas';
            canvasEl.width = 300;
            canvasEl.height = 600;
            element.appendChild(canvasEl);
            return canvasEl;
        }
        // Renders an empty fretboard with the given parameters.
        renderFrets(ctx, start, stringWidth, fretLength, fretCount) {
            const textHeight = 12;
            // Verticals
            for (var i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.lineWidth = stringWidths[i];
                ctx.moveTo(start + i * stringWidth, start);
                ctx.lineTo(start + i * stringWidth, start + (fretCount * fretLength));
                ctx.stroke();
            }
            // Horizontals
            // Start with lineWidth 2 for the nut.
            ctx.lineWidth = 2;
            ctx.font = textHeight + 'px';
            for (var i = 0; i <= fretCount; i++) {
                ctx.beginPath();
                ctx.moveTo(start, start + i * fretLength);
                ctx.lineTo(start + (5 * stringWidth), start + i * fretLength);
                ctx.fillText(i, 10, start + i * fretLength + (textHeight / 4));
                ctx.stroke();
                ctx.lineWidth = 1;
            }
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
        displayScale(diagramEl, scale) {
            this.clearAllChildren(diagramEl);
            this.addHeader(diagramEl, scale.name + " Scale");
            const canvasEl = this.addCanvas(diagramEl);
            diagramEl.appendChild(canvasEl);
            this.drawScale(canvasEl, scale);
        }
        drawScale(canvasEl, scale) {
            const fretCount = 18;
            const ctx = canvasEl.getContext('2d');
            // Reset.
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            ctx.fillStyle = 'black';
            ctx.resetTransform();
            ctx.translate(0.5, 0.5);
            this.renderFrets(ctx, START_PX, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
            var i = 1;
            var fretNum = 1;
            for (const fret of scale.frets) {
                const fretNum = fret.index;
                for (var i = 0; i < 6; i++) {
                    if (fret.strings[i]) {
                        if (fret.patterns.length == 1) {
                            ctx.beginPath();
                            ctx.fillStyle = patternColors[fret.patterns[0] - 1];
                            ctx.arc(START_PX + i * STRING_WIDTH_PX, START_PX + fretNum * FRET_LENGTH_PX, NOTE_RADIUS_PX, 0, 2 * Math.PI);
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
                            ctx.arc(START_PX + i * STRING_WIDTH_PX, START_PX + fretNum * FRET_LENGTH_PX, NOTE_RADIUS_PX, Math.PI / 2, Math.PI * 1.5);
                            ctx.fill();
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.fillStyle = patternColors[pattern2 - 1];
                            ctx.arc(START_PX + i * STRING_WIDTH_PX, START_PX + fretNum * FRET_LENGTH_PX, NOTE_RADIUS_PX, Math.PI * 1.5, Math.PI / 2);
                            ctx.fill();
                            ctx.stroke();
                        }
                        if (fret.strings[i] == 2) {
                            ctx.fillStyle = "black";
                            this.drawStar(ctx, START_PX + i * STRING_WIDTH_PX, START_PX + fretNum * FRET_LENGTH_PX, NOTE_RADIUS_PX / 2, 5, 2);
                        }
                    }
                }
            }
        }
        displayChord(diagramEl, chord) {
            this.clearAllChildren(diagramEl);
            this.addHeader(diagramEl, chord.name + " Chord");
            const canvasEl = this.addCanvas(diagramEl);
            diagramEl.appendChild(canvasEl);
            this.drawChord(canvasEl, chord);
        }
        drawChord(canvasEl, chord) {
            const fretCount = 6;
            const ctx = canvasEl.getContext('2d');
            // Reset.
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            ctx.fillStyle = 'black';
            ctx.resetTransform();
            ctx.translate(0.5, 0.5);
            this.renderFrets(ctx, START_PX, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
            var i = 1;
            var fretNum = 1;
            for (var i = 0; i < chord.strings.length; i++) {
                const fret = chord.strings[i];
                const yPos = fret == 0 ? -.5 : fret;
                ctx.beginPath();
                if (fret >= 0) {
                    ctx.arc(START_PX + i * STRING_WIDTH_PX, START_PX + yPos * FRET_LENGTH_PX, NOTE_RADIUS_PX, 0, 2 * Math.PI);
                    if (fret > 0) {
                        ctx.fill();
                    }
                    ctx.stroke();
                }
                else {
                    //Downward to the left.
                    ctx.moveTo(START_PX + i * STRING_WIDTH_PX - .5 * NOTE_RADIUS_PX, START_PX - 2 * NOTE_RADIUS_PX);
                    ctx.lineTo(START_PX + i * STRING_WIDTH_PX + .5 * NOTE_RADIUS_PX, START_PX - 1 * NOTE_RADIUS_PX);
                    // Downward to the right.
                    ctx.moveTo(START_PX + i * STRING_WIDTH_PX + .5 * NOTE_RADIUS_PX, START_PX - 2 * NOTE_RADIUS_PX);
                    ctx.lineTo(START_PX + i * STRING_WIDTH_PX - .5 * NOTE_RADIUS_PX, START_PX - 1 * NOTE_RADIUS_PX);
                    ctx.stroke();
                }
            }
        }
        render(container) {
            if (scales[this.config[0]]) {
                this.displayScale(container, scales[this.config[0]]);
            }
            else if (chords[this.config[0]]) {
                this.displayChord(container, chords[this.config[0]]);
            }
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
    class Scale {
        constructor(name, frets) {
            this.name = name;
            this.frets = frets;
        }
    }
    class Chord {
        constructor(name, strings, fingers) {
            this.name = name;
            this.strings = strings;
            this.fingers = fingers;
        }
    }
    const chords = {
        "A_MAJOR": new Chord("A", [-1, 0, 2, 2, 2, 0], [-1, 0, 2, 1, 3, 0]),
        "C_MAJOR": new Chord("C", [-1, 3, 2, 0, 1, 0], [-1, 3, 2, 0, 1, 0]),
        "D_MAJOR": new Chord("D", [-1, -1, 0, 1, 2, 1], [-1, -1, 2, 1, 2, 3]),
        "E_MAJOR": new Chord("E", [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),
    };
    // Scales, all in the key of A.
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
})(Guitar || (Guitar = {}));
