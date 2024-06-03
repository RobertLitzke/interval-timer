export class Scale {
    name: string;
    // Degrees is also the semitones above root.
    degrees: Array<number>;

    constructor(name: string, degrees: Array<number>) {
        this.name = name;
        this.degrees = degrees
    }
}

export const scale_names = {
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

/**
 * As a reference, the interval qualities by semitone.
 * 0	Perfect Unison	P1
 * 1	Minor 2nd	m2
 * 2	Major 2nd	M2
 * 3	Minor 3rd	m3
 * 4	Major 3rd	M3
 * 5	Perfect 4th	P4
 * 6	Augmented 4th/Diminished 5th	A4/d5
 * 7	Perfect 5th	P5
 * 8	Minor 6th	m6
 * 9	Major 6th	M6
 * 10	Minor 7th	m7
 * 11	Major 7th	M7
 * 12	Octave	P8
 */
export const scales = {
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