# Data provenance

Tide Flow VN currently contains two data-like inputs: coastal location coordinates in `src/locations.js` and harmonic demonstration coefficients in `src/tide-constituents.js`.

## Current status

The repository history does not document an authoritative source, collection method, or derivation process for either set. Their provenance is therefore **undocumented**. They must not be represented as measurements, official station records, calibrated predictions, or verified hydrographic data.

The MIT License covers the software in this repository. It does not turn future third-party observations or coefficient datasets into MIT-licensed data. Contributors must preserve and document the license and attribution requirements of every external dataset they introduce.

## Required resolution

Before a location can be described as calibrated or evidence-based, replace its demonstration values through a pull request that includes:

1. The original public source and a stable URL.
2. Provider, station identifier, coordinates, vertical datum, timezone, and observation period.
3. The source data license and redistribution terms.
4. Reproducible transformation and fitting code.
5. Validation against observations excluded from fitting.
6. Height and timing error metrics with known limitations.

Until that work is complete, treat every displayed value as model-generated educational output and retain the safety warning in the application and documentation.
