# Model and data notes

This document separates what Tide Flow VN currently computes from what would be required for a defensible tide prediction.

## Current implementation

Each location has a mean offset `Z0` and approximate amplitude/phase pairs for five constituents: M2, S2, N2, K1, and O1. `src/tide-math.js` evaluates:

```text
h(t) = Z0 + Σ Aᵢ cos(ωᵢt − φᵢ)
```

Angular speeds are expressed in degrees per hour, and `t` is measured from 2000-01-01 00:00 UTC. The UI generates one value for each hour in the requested Vietnam-local calendar range.

This is enough to demonstrate harmonic composition, mixed versus semi-diurnal shapes, spring/neap-like modulation, and a charting workflow. It is not enough to publish operational tide times or heights.

## What the coefficients are not

The values in `src/tide-constituents.js` are approximate demo coefficients. The repository does not currently contain the station metadata, datum, raw observations, astronomical argument convention, calibration code, or validation report needed to trace them to an authoritative source.

The same provenance limitation applies to the coordinates in `src/locations.js`. See [Data provenance](DATA_PROVENANCE.md) for the current status and the evidence required in a replacement.

They must therefore not be described as verified IHO, IOC, UHSLC, hydrographic-office, or gauge coefficients.

## Missing physical and statistical effects

- Nodal factors and equilibrium arguments.
- Shallow-water constituents beyond the five-component model.
- Datum conversion and long-term sea-level change.
- Wind, atmospheric pressure, river discharge, storm surge, and waves.
- Harbor geometry and other local nonlinear effects.
- Interpolation of extrema between hourly samples.
- An uncertainty interval or published error budget.

## Standard for a calibrated location

A pull request may label a location `calibrated` only when it includes:

1. A redistributable observation source with provider, station ID, coordinates, license, timezone, and datum.
2. A reproducible data-cleaning and constituent-fitting process.
3. A declared calibration interval.
4. Evaluation against observations not used to fit the coefficients.
5. At minimum, height MAE/RMSE and high/low timing error.
6. Known gaps and a date after which the evaluation should be repeated.

Prefer improving one location to this standard over adding many unsupported coefficient sets.

## Time handling

The UI interprets selected dates as Vietnam time (UTC+7). `toLocalISODate` prevents the browser's UTC serialization from moving a local-midnight selection to the previous date. `generateHourlyData` then creates exactly 24 samples per Vietnam-local day.

The harmonic phase convention remains tied to the UTC epoch. Any future imported constituent set must document its phase convention and convert it explicitly rather than assuming compatibility.
