export class Chord {
    name: string;
    strings: Array<number>;
    fingers: Array<number>;

    constructor(name: string, strings: Array<number>, fingers: Array<number>) {
        this.name = name;
        this.strings = strings;
        this.fingers = fingers;
    }
}

export const chord_library = {
    // Simple majors
    "A_MAJOR": new Chord("A",
        [-1, 0, 2, 2, 2, 0],
        [-1, 0, 2, 1, 3, 0]),
    "C_MAJOR": new Chord("C",
        [-1, 3, 2, 0, 1, 0],
        [-1, 3, 2, 0, 1, 0]),
    "D_MAJOR": new Chord("D",
        [-1, -1, 0, 2, 3, 2],
        [-1, -1, 0, 1, 2, 3]),
    "E_MAJOR": new Chord("E",
        [0, 2, 2, 1, 0, 0],
        [0, 2, 3, 1, 0, 0]),
    "F_MAJOR": new Chord("F",
        [1, 3, 3, 2, 1, 1],
        [1, 3, 4, 2, 1, 1]),
    "G_MAJOR": new Chord("G",
        [3, 2, 0, 0, 0, 3],
        [2, 1, 0, 0, 0, 3]),
    // small F

    // Simple minors
    "A_MINOR": new Chord("A minor",
        [-1, 0, 2, 2, 1, 0],
        [0, 0, 2, 3, 1, 0]),
    "B_MINOR": new Chord("B",
        [-1, 1, 3, 3, 2, 1],
        [-1, 1, 3, 4, 2, 1]),
    "D_MINOR": new Chord("D minor",
        [-1, -1, 0, 2, 3, 1],
        [-1, -1, 0, 2, 3, 1]),
    "E_MINOR": new Chord("E minor",
        [0, 2, 2, 0, 0, 0],
        [0, 2, 3, 0, 0, 0]),
};