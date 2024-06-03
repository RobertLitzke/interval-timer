
export class Tuning {
    // Offsets from A. For example, standard EADGBE tuning would be:
    // [7, 0, 5, 10, 2, 7]
    constructor(public readonly tuning: Array<number>) {
    }
}

export const STANDARD_TUNING = new Tuning([7, 0, 5, 10, 2, 7]);

export class FretboardConfig {
    constructor(public readonly tuning: Tuning,
        // Marker dots to show, starting from the nut.
        public readonly markerDots = [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 2, 0, 0, 1, 0, 1, 0, 1, 0, 1],
        // Fret numbers to label, starting from the nut.
        public readonly sideNumbers = [
            "", "", "", "III", "", "V", "", "VII", "", "IX", "", "",
            "XII", "", "", "XV", "", "XVII", "", "XIX", "", "XXI"
        ],
        // Number of pixels to render each string.
        public readonly stringWidths = [
            3, 3, 2, 2, 1, 1
        ],
        // pixels between the start of each string.
        public readonly stringSpacingPx = 25,
        // Pixels between the start of each fret.
        public readonly fretLengthPx = 30,
        public readonly markerDotRadiusPx = 5) {
    }
}

export class Fretboard {
    constructor(public readonly config: FretboardConfig,
        public readonly leftPx = 45,
        public readonly topPx = 45,
        public readonly fretCount: number) { }

    // Renders an empty fretboard with the given parameters.
    render(ctx: any): void {
        const textHeight = 12;

        ctx.fillStyle = "#aaa";
        // Verticals
        for (var i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.lineWidth = this.config.stringWidths[i];
            ctx.moveTo(
                this.leftPx + i * this.config.stringSpacingPx, this.topPx);
            ctx.lineTo(
                this.leftPx + i * this.config.stringSpacingPx, this.topPx + (this.fretCount * this.config.fretLengthPx));
            ctx.stroke();
        }
        // Horizontals
        // Start with lineWidth 2 for the nut.
        ctx.lineWidth = 2;
        ctx.font = textHeight + 'px';
        for (var i = 0; i <= this.fretCount; i++) {
            ctx.beginPath();
            ctx.moveTo(this.leftPx, this.topPx + i * this.config.fretLengthPx);
            ctx.lineTo(this.leftPx + (5 * this.config.stringSpacingPx), this.topPx + i * this.config.fretLengthPx);
            if (this.config.sideNumbers[i]) {
                ctx.fillText(
                    this.config.sideNumbers[i],
                    this.leftPx - 30,
                    this.topPx + (i - .5) * this.config.fretLengthPx + (textHeight / 4));
            }

            ctx.stroke();
            ctx.lineWidth = 1;

            if (this.config.markerDots[i] == 1) {
                ctx.beginPath();
                ctx.arc(this.leftPx + 2.5 * this.config.stringSpacingPx,
                    this.topPx + (i - .5) * this.config.fretLengthPx,
                    this.config.markerDotRadiusPx,
                    0,
                    2 * Math.PI);
                ctx.fill();
            } else if (this.config.markerDots[i] == 2) {
                ctx.beginPath();
                ctx.arc(this.leftPx + 1.5 * this.config.stringSpacingPx,
                    this.topPx + (i - .5) * this.config.fretLengthPx,
                    this.config.markerDotRadiusPx,
                    0,
                    2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.leftPx + 3.5 * this.config.stringSpacingPx,
                    this.topPx + (i - .5) * this.config.fretLengthPx,
                    this.config.markerDotRadiusPx,
                    0,
                    2 * Math.PI);
                ctx.fill();
            }
        }
    }

    /** Renders a circle over the string */
    renderFingering(ctx: any, fret: number, string: number, label: string, noteRadiusPx: number, fontSize: number, bgColor = 'black', fgColor = 'white', drawStar = false) {
        const yPos = fret - .5;
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        if (fret >= 0) {
            ctx.arc(this.leftPx + string * this.config.stringSpacingPx,
                this.topPx + yPos * this.config.fretLengthPx,
                noteRadiusPx,
                0,
                2 * Math.PI);
            if (fret > 0) {
                ctx.fill();
            }
            if (label !== '') {
                ctx.fillStyle = fgColor;
                // Arbitrary positioning of 1/3 fontSize.
                ctx.fillText(label,
                    this.leftPx + string * this.config.stringSpacingPx - fontSize / 3,
                    this.topPx + yPos * this.config.fretLengthPx + fontSize / 3);
            }
            ctx.stroke();
        } else {
            this.drawMutedString(ctx, string, noteRadiusPx);
        }
        if (drawStar) {
            this.drawStar(ctx,
              this.leftPx + string * this.config.stringSpacingPx,
              this.topPx + yPos * this.config.fretLengthPx,
              noteRadiusPx / 2,
              5,
              2);
        }
    }

    /** Draws a text label over the strong with a "halo" to make it legible. */
    renderTextLabel(ctx: any, fret: number, string: number, label: string, fontSize: number, fontWidth: number, font: string, bgColor = 'white', fgColor = 'black') {
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = fontWidth;
        ctx.fillStyle = fgColor;
        ctx.font = font;
        ctx.strokeText(label,
          this.leftPx + string * this.config.stringSpacingPx - fontSize / 2,
          this.topPx + fret * this.config.fretLengthPx - fontSize / 2);
        ctx.fillText(label,
          this.leftPx + string * this.config.stringSpacingPx - fontSize / 2,
          this.topPx + fret * this.config.fretLengthPx - fontSize / 2);
    }

    /** Draws an X above a muted string. */
    drawMutedString(ctx: any, stringNumber: number, radiusPx: number) {
        //Downward to the left.
        ctx.moveTo(this.leftPx + stringNumber * this.config.stringSpacingPx - .5 * radiusPx,
            this.topPx - 2 * radiusPx);
        ctx.lineTo(this.leftPx + stringNumber * this.config.stringSpacingPx + .5 * radiusPx,
            this.topPx - 1 * radiusPx);
        // Downward to the right.
        ctx.moveTo(this.leftPx + stringNumber * this.config.stringSpacingPx + .5 * radiusPx,
            this.topPx - 2 * radiusPx);
        ctx.lineTo(this.leftPx + stringNumber * this.config.stringSpacingPx - .5 * radiusPx,
            this.topPx - 1 * radiusPx);
        ctx.stroke();
    }
    

    private drawStar(ctx : any,
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
}