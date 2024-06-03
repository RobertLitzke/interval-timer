import {Feature} from "../feature";
import {Chord, chord_library } from "./chords";
import {Fretboard, FretboardConfig, STANDARD_TUNING} from "./fretboard";
import {Scale, scale_names, scales} from "./scales";

// Converts array index to corresponding musical notes.
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

const FRETBOARD_CONFIG = new FretboardConfig(STANDARD_TUNING);
const DEFAULT_FRETBOARD = new Fretboard(FRETBOARD_CONFIG, /*leftPx=*/ 45, /*topPx=*/ 45, /*fretCount=*/18);

const START_PX = 45;
const NOTE_RADIUS_PX = 10;

/**
 * Indices below are expressed as semitones from the root.
 * So for example the perfect 5th is 7 semitones above the root.
 */
const RAINBOW_COLORS = {
  0: {
    name: 'Root',
    color: '#56ec52',
  },
  /*4: {
    name: 'Major 3rd',
    style: 'star',
    color: '#ff4c4c',
  },
  7: {
    name: 'Perfect 5th',
    style: 'star',
    color: '#67cbf7',
  },*/
  'default': {
    color: '#444',
  }
};

// These should be kept in sync, allowing for some padding.
const CANVAS_SUBTITLE_HEIGHT_PX = 30;
const CANVAS_SUBTITLE_FONT = "30px 'Segoe UI'";

export class GuitarFeature implements Feature {

  constructor(public config: Array<string>) {
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
    canvasEl.width = 600;
    canvasEl.height = 600;
    element.appendChild(canvasEl);
    return canvasEl;
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

  displayScale(diagramEl: HTMLElement,
    ctx: CanvasRenderingContext2D,
    scale: Scale,
    key: number,
    scaleNumber: number,
    chordTones: Array<string>): void {
    const keyName = music_notes[key][0];
    this.drawScale(ctx, scale, key, scaleNumber, chordTones);
  }

  drawScale(
      ctx: CanvasRenderingContext2D,
      scale: Scale,
      keyOffset: number,
      // If multiple scales are drawn.
      scaleNumber: number,
      chordTones: Array<string>): void {
    const fretCount = 18;
    ctx.fillStyle = 'black';
    ctx.resetTransform();
    ctx.translate(0.5, 0.5);
    const startX = START_PX + scaleNumber * (DEFAULT_FRETBOARD.config.fretLengthPx * 6 + 25);
    const startY = START_PX;
    if (chordTones.length > 0) {
      ctx.font = '12px Sans-serif';
      ctx.fillText(chordTones.join('/'),
        startX,
        startY - DEFAULT_FRETBOARD.config.fretLengthPx);
    }
    const fretboard = new Fretboard(FRETBOARD_CONFIG, startX, startY, fretCount);
    fretboard.render(ctx);
    const theme = RAINBOW_COLORS;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j <= fretCount; j++) {
        let pos = fretboard.config.tuning.tuning[i] - keyOffset + j;
        pos = pos >= 0 ? pos : 12 + pos;
        const fretStyle = theme[pos % 12] != undefined ? theme[pos % 12] : theme['default'];
        const noteName = music_notes[(fretboard.config.tuning.tuning[i] + j) % 12][0];
        if (scale.degrees.indexOf(pos % 12) >= 0) {
          const bgColor = chordTones.indexOf(noteName) >= 0 ? 'purple' : fretStyle.color;
          const fgColor = j > 0 ? 'white' : 'black';
          ctx.font = '12px Sans-serif';
          const drawStar = pos % 12 == 0;
          fretboard.renderFingering(ctx, j, i, noteName, NOTE_RADIUS_PX, 12, bgColor, fgColor, drawStar);
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
        START_PX * (leftIndex + 1) + leftIndex * DEFAULT_FRETBOARD.config.stringSpacingPx * 6;
    const topIndex = Math.floor(index / 2);
    const fullChordHeight = fretCount * DEFAULT_FRETBOARD.config.fretLengthPx + CANVAS_SUBTITLE_HEIGHT_PX;
    const topPos =
        START_PX * (topIndex + 1) + topIndex * fullChordHeight + CANVAS_SUBTITLE_HEIGHT_PX;
    ctx.font = CANVAS_SUBTITLE_FONT;
    ctx.fillStyle = 'black';
    ctx.fillText(chord.name, leftPos, topPos - CANVAS_SUBTITLE_HEIGHT_PX);
    const fretboard = new Fretboard(FRETBOARD_CONFIG, leftPos, topPos, fretCount);

    ctx.font = fontSize + 'px Sans-serif';
    fretboard.render(ctx);
    var i = 1;

    for (let i = 0; i < chord.strings.length; i++) {
      const fret = chord.strings[i];
      const finger = chord.fingers[i];
      fretboard.renderFingering(ctx, fret, i, `${finger}`, NOTE_RADIUS_PX, fontSize, 'black', fret > 0 ? 'white' : 'black');
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
    const ctx = canvasEl.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.resetTransform();
    ctx.translate(0.5, 0.5);
    DEFAULT_FRETBOARD.render(ctx);
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j <= DEFAULT_FRETBOARD.fretCount; j++) {
        var pos = (FRETBOARD_CONFIG.tuning.tuning[i] + j) % 12;
        DEFAULT_FRETBOARD.renderTextLabel(ctx, j, i, music_notes[pos][0], 14, 6, '14px Sans-serif');
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

  getChordTones(chordTones: string): Array<Array<string>> {
    const chords = chordTones.split('|');
    const out = [];
    for (const chord of chords) {
      const tones = chord.split('-').map(e => e.trim());
      out.push(tones);
    }
    return out;
  }

  render(container: HTMLElement): void {
    console.log(this.config);
    // Reset.
    this.clearAllChildren(container);
    const canvasEl = this.addCanvas(container);
    container.appendChild(canvasEl);
    const ctx = canvasEl.getContext('2d');
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    switch (this.config[0]) {
      case "Notes":
        this.displayNotes(container);
        break;
      case "Scale":
        const scale = scale_names[this.config[1]] ? scales[scale_names[this.config[1]]] : scales[this.config[1]];
        const key = this.config.length > 2 ?
            this.getKeyIndex(this.config[2]) : 0;
        const chordTones = this.config.length > 3 ?
            this.getChordTones(this.config[3]) : [];
        this.addHeader(container, scale.name + " Scale, Key of " + key);
        if (scale_names[this.config[1]]) {
          console.log(chordTones);
          if (chordTones.length > 0) {
            for (let i = 0; i < chordTones.length; i++) {
              scale.name = this.config[1];
              this.displayScale(container, ctx, scale, key, /* offset= */ i, chordTones[i]);
            }
          } else {
            scale.name = this.config[1];
            this.displayScale(container, ctx, scale, key, /* offset= */ 0, /* chordTones= */ []);
          }
          
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
