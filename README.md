# Interval Timer

This is a context-specific interval timer, initially created for timing of
Guitar practice sessions. You can enter a schedule and receive notifications as
each interval on the schedule completes, as well as task-specific hints for each
interval. For example, in a guitar context, hints may include scale references
or chords,  tabs, etc.

[Try it here](https://robertlitzke.github.io/interval-timer/).

## TODOs
### General features
* Support UI for updating schedule without needing to modify CSVs (+CSV export).
* More subtle custom color scheme, maybe using Bulma.
* Improve documentation around the CSV schedule, hinting for supported options by feature class.
* Basic support for some non-Guitar feature class, to ensure multiple feature classes work.
* Allow sub-intervals.

### Infrastructure
* README with instructions :)
* Decompose some classes to more basic components.
* Add tests.
* Support cellphone form factors.
* Web workers.
* Support multiple languages.
* ARIA support.

### Guitar-related
* Add more scales.
* Add more chords. Support multiple chord representations.
* Support visual representation of barres for chords.
* Find good TAB format and display tabs.
* Allow fretboard rotation and support for left-handed mode.
* Prettier rendering of notes on fretboard.
* Show notes in scales on fretboard. Show scale degrees and spellings.
* Metronome?

## Buildiing

Interval Timer currently uses CommonJS, and will output to a `./js` directory. It relies [browserify]() and `tsify`. Interval Timer can be compiled with this command:

```
browserify main.ts -p tsify --standalone IntervalTimer > ../js/interval_timer.js
```

Which will run typescript compile according to tsconfig.json, using an entry point of `main.ts`, and compile a module named IntervalTimer to the `js/interval_timer.js` file. `IntervalTimer#init` is referenced from `index.html`'s body onload.