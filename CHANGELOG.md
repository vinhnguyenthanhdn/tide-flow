# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries name the people a change came from, which is not always the person who wrote it:
a reproduction, a review or a report from a device nobody here owns is credited the same
way a patch is.

Every coefficient in this project remains an approximate, uncalibrated demonstration
input. No release changes that.

## [Unreleased]

### Added

- A Playwright case for panning, the one interaction the Features list names that no test
  touched. Deleting the whole `pan` block from the chart options left the suite green, so
  the feature could stop working without anything reporting it. Pan is easy to leave
  uncovered because it needs a zoom first: the x scale is a category scale whose default
  view already spans every hour in the range, so a drag on an unzoomed chart is clamped to
  exactly where it started, which is correct and indistinguishable from a pan that does
  nothing. The case zooms, drags, and requires both x bounds to move the same way by the
  same amount -- moving them towards each other would be a second zoom, not a pan.

### Changed

- The bug-report form now warns that screenshots and console output can carry tokens,
  account identifiers, private URLs, and unrelated browser data, and asks reporters to
  remove them before attaching evidence.
- `npm run test:all` runs the gates CI runs, in CI's order: build, unit tests under the
  coverage thresholds, `npm audit --audit-level=high`, then the end-to-end suite. It used to
  run plain `npm test` and no audit, so the command `CONTRIBUTING.md` told contributors to run
  before opening a pull request could pass while CI failed on a threshold it never checked.

### Added

- An accessible reset-zoom control on the chart, reachable by keyboard and announced to
  screen readers (#11, contributed by `floze-the-genius`).
- Regression coverage for custom date-range boundaries, including the first and last day
  of a selected range (#10, contributed by `floze-the-genius`).
- `scope-guard` CI job (`scripts/scope-guard.mjs`): a pull request that removes an export
  from `src/` fails unless the description names that export (#14). The page, the tests
  and anyone who vendored these modules import from there, so a name that disappears
  quietly breaks callers who never saw the pull request.
- A test tying the `package.json` version to the newest released heading in this file.
  Both are read as the shipped version and nothing compared them, so a release could move
  one and leave the other behind with the suite still green.

## [1.1.0] - 2026-08-11

### Added

- 12 further coastlines and harbours across six continents, for 24 locations in total,
  with English country labels and IANA timezone metadata for each.
- Hourly ranges and chart labels that follow each location's own timezone, including the
  23- and 25-hour days at a daylight-saving transition.
- Model, location, timezone and browser tests covering the wider set of locations.

### Changed

- The English interface and documentation are now Tide Flow rather than Tide Flow VN.

## [1.0.0] - 2026-08-11

### Added

- First public release: harmonic tide patterns for Vietnamese coastal locations, with the
  chart, the day and range selectors, and the documented model in `docs/MODEL.md`.

[Unreleased]: https://github.com/vinhnguyenthanhdn/tide-flow/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/vinhnguyenthanhdn/tide-flow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/vinhnguyenthanhdn/tide-flow/releases/tag/v1.0.0
