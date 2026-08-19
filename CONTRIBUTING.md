# Contributing to Tide Flow

Thank you for helping make this project more useful and more honest. Small, focused pull requests are easier to review and more likely to ship.

## Before you start

- Search existing issues and pull requests.
- Open an issue first for a new feature, a new dependency, or a model/data change.
- Do not describe approximate coefficients as official or verified without a reproducible source and validation.
- Never include private, licensed, or scraped data that cannot be redistributed.
- Read [docs/DATA_PROVENANCE.md](docs/DATA_PROVENANCE.md) before changing locations or coefficients.

## Development setup

```bash
git clone https://github.com/vinhnguyenthanhdn/tide-flow.git
cd tide-flow
npm ci
npm run build
npx playwright install chromium
npm run test:all
```

Run the app with `npm run serve`, then open <http://localhost:3000>.

Two more scripts exist and are easy to miss, because nothing else in this file names them:

| Script | Use it when |
| --- | --- |
| `npm run test:watch` | Iterating on a unit test. Same tests as `npm test`, left running instead of exiting |
| `npm run capture:social` | The social preview image needs regenerating. Renders `docs/social-preview.html` to `docs/assets/social-preview.png` at 1280×640 with Playwright's Chromium, so it needs the browser installed above |

`build:css`, `build:vendor` and `build:site` are steps that `build` and the deploy workflow call; there is no reason to run them by hand.

## Choosing a contribution

[Issues labeled `good first issue`](https://github.com/vinhnguyenthanhdn/tide-flow/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22) should be self-contained. Model and calibration work is intentionally held to a higher evidence standard; see [docs/MODEL.md](docs/MODEL.md).

Useful contributions include:

- a failing test for a timezone or numerical bug;
- keyboard, contrast, screen-reader, or small-screen improvements;
- a documented public gauge dataset and import procedure;
- validation metrics for an existing location;
- clear English copy and accurate local place names.

## Ways to contribute that aren't code

This project predicts something a person can walk down to the water and check. That check is a contribution, and it is the one nobody at a keyboard can substitute:

- **Compare a prediction against the water, or against a published gauge.** Date, place, predicted time and height, observed time and height. A disagreement is a finding; an agreement is a validation record.
- **Report what the page does on your device.** Small screens, screen readers, high-contrast modes and older browsers are where the interface breaks, and the test suite runs in one browser engine.
- **Reproduce an open issue, or report that you could not** — with the browser and locale you used.
- **Say what a place name should be** in the language of the people who live there.
- **Review an open pull request**, especially one touching the harmonic model, where a plausible-looking curve is the failure mode.

`CHANGELOG.md` credits the person who reported or verified a change, not only the author of the commit.

## Pull request checklist

- Keep the change focused and explain the user-visible outcome.
- Name every export you remove from `src/`. The page, the tests and anyone who vendored these modules all import from there, so a name that quietly disappears breaks callers who never saw the pull request. You may still remove one — the description has to say which and why. The `scope-guard` job compares the exports of each changed `src/*.js` between the base and your branch and fails on an unmentioned removal.
- Add or update tests for behavior changes.
- Add a line under `## [Unreleased]` in [`CHANGELOG.md`](CHANGELOG.md) for anything a visitor to
  the page would notice. Pure refactors, typo fixes and internal test additions do not need one.
- Run `npm run build`, `npm run test:all`, and `npm audit`.
- Update documentation when assumptions, commands, or limitations change.
- Include screenshots for visual changes.
- Link the issue the pull request addresses.

### Extra requirements for model/data changes

Include all of the following:

1. Source URL, provider, license, station ID, coordinates, and vertical datum.
2. Observation period and timezone.
3. A reproducible script or documented transformation from source to coefficients.
4. Train/validation split or another honest out-of-sample check.
5. Timing and height error metrics, plus known limitations.

A curve that merely looks plausible is not enough.

## Commit style

Use a short imperative subject, for example:

```text
fix: preserve local date from the range picker
docs: document gauge calibration requirements
test: cover a daylight-boundary date range
```

By contributing, you agree that your work will be released under the repository's MIT License and that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).
