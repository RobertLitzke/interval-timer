// <reference path="feature.ts" />

namespace Guitar {
  const stringWidths = [
    3, 3, 2, 2, 1, 1
  ];

  const music_notes = [
    ["A"],
    ["A#", "Bb"],
    ["B"],
    ["C"],
    ["C#"],
    ["D"],
    ["D#", "Eb"],
    ["E"],
    ["F"],
    ["F#", "Gb"],
    ["G"],
    ["G#", "Ab"],
  ];

  // Offsets from A, for EADGBE tuning. More tunings to be supported.
  const tuning = [7, 0, 5, 10, 2, 7];

  const START_PX = 35;
  const STRING_WIDTH_PX = 25;
  const FRET_LENGTH_PX = 30;
  const NOTE_RADIUS_PX = 8;

  export class Feature implements Timer.Feature {

    config: Array<string>;

    constructor(config: Array<string>) {
      this.config = config;
    }

    clearAllChildren(element: HTMLElement): void {
      while (element.firstChild) {
        element.removeChild(element.firstChild)
      }
    }

    // Creates a header and appends it to the given element, returning the
    // header element.
    addHeader(element: HTMLElement, text: string): HTMLElement {
      const headerEl = document.createElement('p');
      headerEl.classList.add('subtitle');
      headerEl.innerText = text;
      element.appendChild(headerEl);
      return headerEl;
    }

    // Creates a standard canvas and appends it to the given element, returning
    // the canvas.
    addCanvas(element: HTMLElement): HTMLCanvasElement {
      const canvasEl = document.createElement('canvas');
      canvasEl.id = 'canvas';
      canvasEl.width = 300;
      canvasEl.height = 600;
      element.appendChild(canvasEl);
      return canvasEl;
    }

    // Renders an empty fretboard with the given parameters.
    renderFrets(ctx: any,
        start: number,
        stringWidth: number,
        fretLength: number,
        fretCount: number): void {
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

    drawStar(ctx : any,
        x: number,
        y: number,
        r: number,
        n: number,
        inset: number): void {
      ctx.save();
      ctx.beginPath();
      ctx.translate(x, y);
      ctx.moveTo(0, 0 + r);
      for (var i = 0; i < n; i++) {
          ctx.rotate(Math.PI / n);
          ctx.lineTo(0, 0 + (r*inset));
          ctx.rotate(Math.PI / n);
          ctx.lineTo(0, 0 + r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    displayScale(diagramEl: HTMLElement, scale: Scale, key: number): void {
      this.clearAllChildren(diagramEl);
      const keyName = music_notes[key][0];
      this.addHeader(diagramEl, scale.name + " Scale, Key of " + keyName);
      const canvasEl = this.addCanvas(diagramEl);
      diagramEl.appendChild(canvasEl);
      this.drawScale(canvasEl, scale, key);
    }

    drawScale(
        canvasEl: HTMLCanvasElement,
        scale: Scale,
        keyOffset: number): void {
      const fretCount = 18;
      const ctx = canvasEl.getContext('2d');
      // Reset.
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.fillStyle = 'black';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5);
      this.renderFrets(
        ctx, START_PX, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
      var i =1;
      var fretNum = 1;

      for (var i = 0; i < 6; i++) {
        for (var j = 0; j <= fretCount; j++) {
          var pos = tuning[i] - keyOffset + j;
          pos = pos >= 0 ? pos : 12 + pos;
          if (scale.degrees.indexOf(pos % 12) >= 0) {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(START_PX + i * STRING_WIDTH_PX,
              START_PX + j * FRET_LENGTH_PX,
              NOTE_RADIUS_PX,
              0,
              2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
          if (pos % 12 == 0) {
            ctx.fillStyle = 'white';
            this.drawStar(ctx,
              START_PX + i * STRING_WIDTH_PX,
              START_PX + j * FRET_LENGTH_PX,
              NOTE_RADIUS_PX / 2,
              5,
              2);
          }
        }
      }
    }

    displayChord(diagramEl: any, chord: Chord): void {
      this.clearAllChildren(diagramEl);
      this.addHeader(diagramEl, chord.name + " Chord");
      const canvasEl = this.addCanvas(diagramEl);
      diagramEl.appendChild(canvasEl);
      this.drawChord(canvasEl, chord);
    }

    drawChord(canvasEl: HTMLCanvasElement, chord: Chord): void {
      const fretCount = 6;
      const ctx = canvasEl.getContext('2d');
      // Reset.
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.fillStyle = 'black';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5);
      this.renderFrets(
        ctx, START_PX, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
      var i =1;
      var fretNum = 1;
      for (var i = 0; i < chord.strings.length; i++) {
        const fret = chord.strings[i];
        const yPos = fret == 0 ? -.5 : fret;
        ctx.beginPath();
        if (fret >= 0) {
          ctx.arc(START_PX + i * STRING_WIDTH_PX,
            START_PX + yPos * FRET_LENGTH_PX,
            NOTE_RADIUS_PX,
            0,
            2 * Math.PI);
          if (fret > 0) {
            ctx.fill();
          }
          ctx.stroke();
        } else {
          //Downward to the left.
          ctx.moveTo(START_PX + i * STRING_WIDTH_PX - .5 * NOTE_RADIUS_PX,
              START_PX - 2 * NOTE_RADIUS_PX);
          ctx.lineTo(START_PX + i * STRING_WIDTH_PX + .5 * NOTE_RADIUS_PX,
              START_PX - 1 * NOTE_RADIUS_PX);
          // Downward to the right.
          ctx.moveTo(START_PX + i * STRING_WIDTH_PX + .5 * NOTE_RADIUS_PX,
              START_PX - 2 * NOTE_RADIUS_PX);
          ctx.lineTo(START_PX + i * STRING_WIDTH_PX - .5 * NOTE_RADIUS_PX,
              START_PX - 1 * NOTE_RADIUS_PX);
          ctx.stroke();
        }
      }
    }

    displayNotes(diagramEl: any): void {
      this.clearAllChildren(diagramEl);
      this.addHeader(diagramEl, "Notes on the fretboard");
      const canvasEl = this.addCanvas(diagramEl);
      diagramEl.appendChild(canvasEl);
      this.drawNotes(canvasEl);
    }

    drawNotes(canvasEl: HTMLCanvasElement): void {
      const fretCount = 18;
      const fontSize = 16;
      const ctx = canvasEl.getContext('2d');
      // Reset.
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.fillStyle = 'black';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5);
      this.renderFrets(
        ctx, START_PX, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 8;
      ctx.fillStyle = 'black';
      ctx.font = fontSize + 'px Sans-serif';
      for (var i = 0; i < 6; i++) {
        for (var j = 0; j <= fretCount; j++) {
          var pos = (tuning[i] + j) % 12;
          ctx.strokeText(music_notes[pos][0],
            START_PX + i * STRING_WIDTH_PX - fontSize / 2,
            START_PX + j * FRET_LENGTH_PX - fontSize / 2;
          ctx.fillText(music_notes[pos][0],
            START_PX + i * STRING_WIDTH_PX - fontSize / 2,
            START_PX + j * FRET_LENGTH_PX - fontSize / 2;
        }
      }
    }

    getKeyIndex(keyName: string): number {
      for (var i = 0; i < music_notes.length; i++) {
        if (music_notes[i].indexOf(keyName) >= 0) {
          return i;
        }
      }
      // Should be displayed to user.
      console.log("Unknown key: " + keyName);
      return 0;
    }

    render(container: HTMLElement): void {
      if (this.config[0] == "NOTES") {
        this.displayNotes(container);
      } else if (scales2[this.config[0]]) {
        const key = this.config.length > 1 ?
            this.getKeyIndex(this.config[1]) : 0;
        this.displayScale(container, scales2[this.config[0]], key);
      } else if (chords[this.config[0]]) {
        this.displayChord(container, chords[this.config[0]]);
      }
    }
  }

  class Fret {
    index: number;
    // EADGBE
    strings: Array<number>;
    patterns: Array<number>;

    constructor(index: number,
        strings: Array<number>,
        patterns: Array<number>) {
      this.index = index;
      if (strings.length != 6) {
        throw new Error("Incorrect string count: " + index);
      }
      this.strings = strings;
      this.patterns = patterns;
    }
  }

  class Scale {
    name: string;
    degrees: Array<number>;//Fret>;

    constructor(name: string, degrees: Array<number>) {//Fret>) {
      this.name = name;
      this.degrees = degrees
    }
  }

  class Chord {
    name: string;
    strings: Array<number>;
    fingers: Array<number>;

    constructor(name: string, strings: Array<number>, fingers: Array<number>) {
      this.name = name;
      this.strings = strings;
      this.fingers = fingers;
    }
  }

  const chords = {
    "A_MAJOR": new Chord("A",
      [-1, 0, 2, 2, 2, 0],
      [-1, 0, 2, 1, 3, 0]),
    "C_MAJOR": new Chord("C",
      [-1, 3, 2, 0, 1, 0],
      [-1, 3, 2, 0, 1, 0]),
    "D_MAJOR": new Chord("D",
      [-1, -1, 0, 1, 2, 1],
      [-1, -1, 2, 1, 2, 3]),
    "E_MAJOR": new Chord("E",
      [0, 2, 2, 1, 0, 0],
      [0, 2, 3, 1, 0, 0]),
  };

  const scales2 = {
    "DORIAN_MINOR": new Scale("Dorian Minor", [0, 2, 3, 5, 7, 9, 10]),
    "MAJOR": new Scale("Major", [0, 2, 4, 5, 7, 9, 11]),
    "MAJOR_BLUES": new Scale("Blues (Minor Blues)", [0, 2, 3, 4, 7, 9]),
    "MAJOR_PENTATONIC": new Scale("Major Pentatonic", [0, 2, 4, 7, 9]),
    "MINOR_BLUES": new Scale("Blues (Minor Blues)", [0, 3, 5, 6, 7, 10]),
    "MINOR_PENTATONIC": new Scale("Minor Pentatonic", [0, 3, 5, 7, 10]),
    "NATURAL_MINOR": new Scale("Natural Minor", [0, 2, 3, 5, 7, 8, 10]),
    "SPANISH_MINOR": new Scale("Spanish Minor", [0, 1, 3, 5, 7, 8, 10]),
  };
}
