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

  export class Feature implements Timer.Feature {
    config: Array<string>;

    constructor(config: Array<string>) {
      this.config = config;
    }
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

    renderScale(canvasEl : any, scale: Scale): void {
      const start = 35;
      const fretCount = 18;
      const stringWidth = 25;
      const fretLength = 30;
      const noteRadius = fretLength / 3;
      const ctx = canvasEl.getContext('2d');
      // Reset.
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.fillStyle = 'black';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5);
      this.renderFrets(ctx, start, stringWidth, fretLength, fretCount);
      var i =1;
      var fretNum = 1;
      ctx.arc(start + i * stringWidth,
        start + fretNum * fretLength,
        noteRadius,
        0,
        2 * Math.PI);
      for (const fret of scale.frets) {
        const fretNum = fret.index;
        for (var i = 0; i < 6; i++) {
          if (fret.strings[i]) {
            if (fret.patterns.length == 1) {
              ctx.beginPath();
              ctx.fillStyle = patternColors[fret.patterns[0] - 1];
              ctx.arc(start + i * stringWidth,
                start + fretNum * fretLength,
                noteRadius,
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
              ctx.arc(start + i * stringWidth,
                start + fretNum * fretLength,
                noteRadius,
                Math.PI / 2,
                Math.PI * 1.5);
              ctx.fill();
              ctx.stroke();
              ctx.beginPath();
              ctx.fillStyle = patternColors[pattern2 - 1];
              ctx.arc(start + i * stringWidth,
                start + fretNum * fretLength,
                noteRadius,
                Math.PI * 1.5,
                Math.PI / 2);
              ctx.fill();
              ctx.stroke();
            }
            if (fret.strings[i] == 2) {
              ctx.fillStyle = "black";
              this.drawStar(ctx,
                start + i * stringWidth,
                start + fretNum * fretLength,
                noteRadius / 2,
                5,
                2);
            }
          }
        }
      }
    }

    render(container: HTMLElement): void {
      this.renderScale(container, scales[this.config[0]])
    }
  }

  export class Fret {
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

  export class Scale {
    name : string;
    frets: Array<Fret>;

    constructor(name: string, frets: Array<Fret>) {
      this.name = name;
      this.frets = frets
    }
  }

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
