# Contributing to Tide Flow VN

Thank you for helping make this project more useful and more honest. Small, focused pull requests are easier to review and more likely to ship.

## Before you start

- Search existing issues and pull requests.
- Open an issue first for a new feature, a new dependency, or a model/data change.
- Do not describe approximate coefficients as official or verified without a reproducible source and validation.
- Never include private, licensed, or scraped data that cannot be redistributed.

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

## Choosing a contribution

Issues labeled `good first issue` should be self-contained. Model and calibration work is intentionally held to a higher evidence standard; see [docs/MODEL.md](docs/MODEL.md).

Useful contributions include:

- a failing test for a timezone or numerical bug;
- keyboard, contrast, screen-reader, or small-screen improvements;
- a documented public gauge dataset and import procedure;
- validation metrics for an existing location;
- clear English copy and accurate Vietnamese place names.

## Pull request checklist

- Keep the change focused and explain the user-visible outcome.
- Add or update tests for behavior changes.
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
