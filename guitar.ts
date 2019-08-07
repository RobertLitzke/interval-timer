// <reference path="feature.ts" />

namespace Guitar {
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

    displayScale(diagramEl: HTMLElement, scale: Scale): void {
      this.clearAllChildren(diagramEl);
      this.addHeader(diagramEl, scale.name + " Scale");
      const canvasEl = this.addCanvas(diagramEl);
      diagramEl.appendChild(canvasEl);
      this.drawScale(canvasEl, scale);
    }

    drawScale(canvasEl: HTMLCanvasElement, scale: Scale): void {
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

      for (const fret of scale.frets) {
        const fretNum = fret.index;
        for (var i = 0; i < 6; i++) {
          if (fret.strings[i]) {
            if (fret.patterns.length == 1) {
              ctx.beginPath();
              ctx.fillStyle = patternColors[fret.patterns[0] - 1];
              ctx.arc(START_PX + i * STRING_WIDTH_PX,
                START_PX + fretNum * FRET_LENGTH_PX,
                NOTE_RADIUS_PX,
                0,
                2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else {
              ctx.beginPath();
              var pattern1 = fret.patterns[0];
              var pattern2 = fret.patterns[1];
              if (fret.patterns[0] % 2 == 0) {
                pattern1 = fret.patterns[1];
                pattern2 = fret.patterns[0];
              }
              ctx.fillStyle = patternColors[pattern1 - 1];
              ctx.arc(START_PX + i * STRING_WIDTH_PX,
                START_PX + fretNum * FRET_LENGTH_PX,
                NOTE_RADIUS_PX,
                Math.PI / 2,
                Math.PI * 1.5);
              ctx.fill();
              ctx.stroke();
              ctx.beginPath();
              ctx.fillStyle = patternColors[pattern2 - 1];
              ctx.arc(START_PX + i * STRING_WIDTH_PX,
                START_PX + fretNum * FRET_LENGTH_PX,
                NOTE_RADIUS_PX,
                Math.PI * 1.5,
                Math.PI / 2);
              ctx.fill();
              ctx.stroke();
            }
            if (fret.strings[i] == 2) {
              ctx.fillStyle = "black";
              this.drawStar(ctx,
                START_PX + i * STRING_WIDTH_PX,
                START_PX + fretNum * FRET_LENGTH_PX,
                NOTE_RADIUS_PX / 2,
                5,
                2);
            }
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

    render(container: HTMLElement): void {
      if (scales[this.config[0]]) {
        this.displayScale(container, scales[this.config[0]]);
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
    frets: Array<Fret>;

    constructor(name: string, frets: Array<Fret>) {
      this.name = name;
      this.frets = frets
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

  // Scales, all in the key of A.
  const scales = {
    "MINOR_PENTATONIC": new Scale("Minor Pentatonic", [
      new Fret(5, [2, 1, 1, 1, 1, 2], [1]),
      // 6
      new Fret(7, [0, 1, 2, 1, 0, 0], [1, 2]),
      new Fret(8, [1, 0, 0, 0, 1, 1], [1, 2]),
      new Fret(9, [0, 0, 0, 1, 0, 0], [2, 3]),
      new Fret(10,[1, 1, 1, 0, 2, 1], [2, 3]),
      // 11
      new Fret(12,[1, 2, 1, 1, 0, 1], [3, 4]),
      new Fret(13,[0, 0, 0, 0, 1, 0], [3 ,4]),
      new Fret(14,[0, 0, 1, 2, 0, 0], [4, 5]),
      new Fret(15,[1, 1, 0, 0, 1, 1], [4, 5]),
      new Fret(17,[2, 1, 1, 1, 1, 2], [5]),
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
      new Fret(10,[1, 1, 1, 0, 2, 1], [2, 3]),
      new Fret(11,[1, 0, 0, 0, 0, 1], [2, 3]),
      new Fret(12,[1, 2, 1, 1, 0, 1], [3, 4]),
      new Fret(13,[0, 0, 1, 0, 1, 0], [3 ,4]),
      new Fret(14,[0, 0, 1, 2, 0, 0], [4, 5]),
      new Fret(15,[1, 1, 0, 0, 1, 1], [4, 5]),
      new Fret(16,[0, 0, 0, 0, 1, 0], [4, 5]),
      new Fret(17,[2, 1, 1, 1, 1, 2], [5]),
      new Fret(18,[0, 1, 0, 0, 0, 0], [5]),
    ])
  };
}
