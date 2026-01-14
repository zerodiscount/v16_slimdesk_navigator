# Changelog

## [v3.40] - 2026-01-14
### Fixed
- **Persistence:** Resolved a critical bug where custom shortcuts were not being saved or loaded correctly due to a duplicate data fetching method. Modifications made to `v16_slim_desk.js`.

## [v3.39] - 2026-01-14
### Fixed
- **Regression:** Restored Dark Theme and Sidebar Layout properties that were inadvertently removed in v3.38.

## [v3.38] - 2026-01-14
### Changed
- **UI:** Optimized vertical spacing. Moved the top "Apps" grid icon higher (reduced padding) and significantly tightened the bottom spacing to maximize available workspace for shortcuts.

## [v3.37] - 2026-01-14
### Added
- **UI:** Added a white divider line above the bottom "Edit" section for better visual separation.
### Changed
- **UI:** Reduced the size of text-based icons (from 18px to 14px) to better match the standard icon set.
### Fixed
- **Edit Logic:** Implemented persistence for "Link Type" (Report/DocType/Page) during edits to prevent data loss when modifying existing shortcuts.

## [v3.36] - 2026-01-14
### Added
- **Smart Logic:** Added auto-route generation for Reports (handling both Query Reports and Report Builder) and auto-fetching of icons from parent DocTypes.

## [v3.35] - 2026-01-14
- Initial Public Release Candidate.
