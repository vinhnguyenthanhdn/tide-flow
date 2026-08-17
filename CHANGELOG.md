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

- An accessible reset-zoom control on the chart, reachable by keyboard and announced to
  screen readers (#11, contributed by `floze-the-genius`).
- Regression coverage for custom date-range boundaries, including the first and last day
  of a selected range (#10, contributed by `floze-the-genius`).
- `scope-guard` CI job (`scripts/scope-guard.mjs`): a pull request that removes an export
  from `src/` fails unless the description names that export (#14). The page, the tests
  and anyone who vendored these modules import from there, so a name that disappears
  quietly breaks callers who never saw the pull request.

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
