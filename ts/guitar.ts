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

  // Number of markers, starting from the nut.
  const fretboardMarkerDots = [
    0,0,0,1,0,1,0,1,0,1,0,0,2,0,0,1,0,1,0,1,0,1
  ];

  // Fret numbers to label, starting from the nut.
  const fretNumbers = [
    "","","","III","","V","","VII","","IX","","",
    "XII","","","XV","","XVII","","XIX","","XXI"
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
      canvasEl.width = 400;
      canvasEl.height = 600;
      element.appendChild(canvasEl);
      return canvasEl;
    }

    // Renders an empty fretboard with the given parameters.
    renderFrets(ctx: any,
        startLeft: number,
        startTop: number,
        stringWidth: number,
        fretLength: number,
        fretCount: number): void {
      const textHeight = 12;

      ctx.fillStyle = "#aaa";
      // Verticals
      for (var i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.lineWidth = stringWidths[i];
        ctx.moveTo(
          startLeft + i * stringWidth, startTop);
        ctx.lineTo(
          startLeft + i * stringWidth, startTop + (fretCount * fretLength));
        ctx.stroke();
      }
      // Horizontals
      // Start with lineWidth 2 for the nut.
      ctx.lineWidth = 2;
      ctx.font = textHeight + 'px';
      for (var i = 0; i <= fretCount; i++) {
        ctx.beginPath();
        ctx.moveTo(startLeft, startTop + i * fretLength);
        ctx.lineTo(startLeft + (5 * stringWidth), startTop + i * fretLength);
        if (fretNumbers[i]) {
          ctx.fillText(
              fretNumbers[i],
              startLeft - 30,
              startTop + (i - .5) * fretLength + (textHeight / 4));
        }

        ctx.stroke();
        ctx.lineWidth = 1;

        if (fretboardMarkerDots[i] == 1) {
          ctx.beginPath();
          ctx.arc(startLeft + 2.5 * STRING_WIDTH_PX,
              startTop + (i - .5) * FRET_LENGTH_PX,
              NOTE_RADIUS_PX / 2,
              0,
              2 * Math.PI);
          ctx.fill();
        } else if (fretboardMarkerDots[i] == 2) {
          ctx.beginPath();
          ctx.arc(startLeft + 1.5 * STRING_WIDTH_PX,
              startTop + (i - .5) * FRET_LENGTH_PX,
              NOTE_RADIUS_PX / 2,
              0,
              2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(startLeft + 3.5 * STRING_WIDTH_PX,
              startTop + (i - .5) * FRET_LENGTH_PX,
              NOTE_RADIUS_PX / 2,
              0,
              2 * Math.PI);
          ctx.fill();
        }




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
        ctx, START_PX, START_PX, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
      var i =1;
      var fretNum = 1;

      for (var i = 0; i < 6; i++) {
        for (var j = 0; j <= fretCount; j++) {
          var pos = tuning[i] - keyOffset + j;
          pos = pos >= 0 ? pos : 12 + pos;
          const yPos = j - .5;
          if (scale.degrees.indexOf(pos % 12) >= 0) {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(START_PX + i * STRING_WIDTH_PX,
              START_PX + yPos * FRET_LENGTH_PX,
              NOTE_RADIUS_PX,
              0,
              2 * Math.PI);
            if (yPos > 0) {
              ctx.fill();
            }
            ctx.stroke();
          }
          if (pos % 12 == 0) {
            ctx.fillStyle = yPos > 0 ? 'white' : 'black';
            this.drawStar(ctx,
              START_PX + i * STRING_WIDTH_PX,
              START_PX + yPos * FRET_LENGTH_PX,
              NOTE_RADIUS_PX / 2,
              5,
              2);
          }
        }
      }
    }

    // Displays the given chords.
    displayChords(diagramEl: any, chords: Array<Chord>): void {
      this.clearAllChildren(diagramEl);
      const chordNames = [];
      for (const chord of chords) {
        chordNames.push(chord.name + " Chord");
      }
      this.addHeader(diagramEl, chordNames.join(", "));
      const canvasEl = this.addCanvas(diagramEl);
      diagramEl.appendChild(canvasEl);
      for (const [i, chord] of chords.entries()) {
        this.drawChord(canvasEl, chord, i);
      }

    }

    drawChord(canvasEl: HTMLCanvasElement, chord: Chord, index: number): void {
      const fretCount = 6;
      const fontSize = 12;
      const ctx = canvasEl.getContext('2d');
      ctx.resetTransform();
      ctx.translate(0.5, 0.5);
      const leftIndex = index % 2;
      const leftPos =
          START_PX * (leftIndex + 1) + leftIndex * STRING_WIDTH_PX * 6;
      const topIndex = Math.floor(index / 2);
      const topPos =
          START_PX * (topIndex + 1) + topIndex * fretCount * FRET_LENGTH_PX;
      this.renderFrets(
        ctx, leftPos, topPos, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
      var i =1;

      var fretNum = 1;
      ctx.font = fontSize + 'px Sans-serif';
      for (var i = 0; i < chord.strings.length; i++) {
        ctx.fillStyle = 'black';
        const fret = chord.strings[i];
        const finger = chord.fingers[i];
        const yPos = fret - .5;
        ctx.beginPath();
        if (fret >= 0) {
          ctx.arc(leftPos + i * STRING_WIDTH_PX,
            topPos + yPos * FRET_LENGTH_PX,
            NOTE_RADIUS_PX,
            0,
            2 * Math.PI);
          if (fret > 0) {
            ctx.fill();
            if (finger > 0) {
              ctx.fillStyle = 'white';
              // Arbitrary positioning of 1/3 fontSize.
              ctx.fillText("" + finger,
                leftPos + i * STRING_WIDTH_PX - fontSize / 3,
                topPos + yPos * FRET_LENGTH_PX + fontSize / 3);
            }
          }
          ctx.stroke();
        } else {
          // A muted string.
          //Downward to the left.
          ctx.moveTo(leftPos + i * STRING_WIDTH_PX - .5 * NOTE_RADIUS_PX,
              topPos - 2 * NOTE_RADIUS_PX);
          ctx.lineTo(leftPos + i * STRING_WIDTH_PX + .5 * NOTE_RADIUS_PX,
              topPos - 1 * NOTE_RADIUS_PX);
          // Downward to the right.
          ctx.moveTo(leftPos + i * STRING_WIDTH_PX + .5 * NOTE_RADIUS_PX,
              topPos - 2 * NOTE_RADIUS_PX);
          ctx.lineTo(leftPos + i * STRING_WIDTH_PX - .5 * NOTE_RADIUS_PX,
              topPos - 1 * NOTE_RADIUS_PX);
          ctx.stroke();
        }
      }
    }

    // Simply displays the notes on the fretboard.
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
      ctx.fillStyle = 'black';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5);
      this.renderFrets(
        ctx, START_PX, START_PX, STRING_WIDTH_PX, FRET_LENGTH_PX, fretCount);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 8;
      ctx.fillStyle = 'black';
      ctx.font = fontSize + 'px Sans-serif';
      for (var i = 0; i < 6; i++) {
        for (var j = 0; j <= fretCount; j++) {
          var pos = (tuning[i] + j) % 12;
          ctx.strokeText(music_notes[pos][0],
            START_PX + i * STRING_WIDTH_PX - fontSize / 2,
            START_PX + j * FRET_LENGTH_PX - fontSize / 2);
          ctx.fillText(music_notes[pos][0],
            START_PX + i * STRING_WIDTH_PX - fontSize / 2,
            START_PX + j * FRET_LENGTH_PX - fontSize / 2);
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
      switch (this.config[0]) {
        case "Notes":
          this.displayNotes(container);
          break;
        case "Scale":
          const key = this.config.length > 2 ?
              this.getKeyIndex(this.config[2]) : 0;
          if (scale_names[this.config[1]]) {
            const scale = scales[scale_names[this.config[1]]];
            scale.name = this.config[1];
            this.displayScale(container, scale, key);
          } else if (scales[this.config[1]]) {
            this.displayScale(container, scales[this.config[1]], key);
          }
          break;
        case "Chord":
          const chords = [];
          for (var i = 1; i < this.config.length; i++) {
            if (this.config[i] == "Chord") {
              i++;
            }
            chords.push(chord_library[this.config[i]]);
          }
          this.displayChords(container, chords);
          break;
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

  const categories = [
    "Chord",
    "Scale",
    "Notes",
    "TAB",
  ]

  const chord_library = {
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

  const scale_names = {
    "Blues": "MINOR_BLUES",
    "Minor Blues": "MINOR_BLUES",
    "Major Blues": "MAJOR_BLUES",
    "Natural Minor": "NATURAL_MINOR",
    "Pure Minor": "NATURAL_MINOR",
    "Minor": "NATURAL_MINOR",
    "Major": "MAJOR",
    "Spanish Minor": "PHRYGIAN",
    "Dominant 7th": "MIXOLYDIAN",
    "Half-Diminished": "LOCRIAN",
    "Lydian Major": "LYDIAN",
    "Pentatonic Minor": "MINOR_PENTATONIC",
    "Pentatonic Major": "MAJOR_PENTATONIC",
    "Country & Western": "MAJOR_PENTATONIC",

    // Modes
    "Ionian Mode": "MAJOR",
    "Dorian Mode": "DORIAN",
    "Dorian Minor": "DORIAN",
    "Phrygian Mode": "PHRYGIAN",
    "Lydian Mode": "LYDIAN",
    "Mixolydian Mode": "MIXOLYDIAN",
    "Aeolian Mode": "NATURAL_MINOR",
    "Locrian Mode": "LOCRIAN",
  };

  const scales = {
    "DORIAN": new Scale("Dorian Minor", [0, 2, 3, 5, 7, 9, 10]),
    "PHRYGIAN": new Scale("Spanish Minor", [0, 1, 3, 5, 7, 8, 10]),
    "LYDIAN": new Scale("Lydian", [0, 2, 4, 6, 7, 9, 11]),
    "MIXOLYDIAN": new Scale("Mixolydian", [0, 2, 4, 5, 7, 9, 10]),
    "LOCRIAN": new Scale("Locrian", [0, 1, 3, 5, 6, 8, 10]),
    "MAJOR": new Scale("Major", [0, 2, 4, 5, 7, 9, 11]),
    "MAJOR_BLUES": new Scale("Blues (Minor Blues)", [0, 2, 3, 4, 7, 9]),
    "MAJOR_PENTATONIC": new Scale("Major Pentatonic", [0, 2, 4, 7, 9]),
    "MINOR_BLUES": new Scale("Blues (Minor Blues)", [0, 3, 5, 6, 7, 10]),
    "MINOR_PENTATONIC": new Scale("Minor Pentatonic", [0, 3, 5, 7, 10]),
    "NATURAL_MINOR": new Scale("Natural Minor", [0, 2, 3, 5, 7, 8, 10]),
  };
}
