# Changelog

## [v3.46] - 2026-01-15
### Fixed
- **UI:** Moved "Restore Defaults" button to the Dialog Header (top-right) for better visibility and reliability.

## [v3.45] - 2026-01-15
### Fixed
- **UI:** Simplified "Restore Defaults" button implementation to use standard `add_custom_action` matching other buttons.

## [v3.44] - 2026-01-15
### Fixed
- **UI:** Reverted "Restore Defaults" button implementation to direct DOM injection to ensure visibility in the dialog footer.

## [v3.43] - 2026-01-15
### Fixed
- **UI:** Fixed "Restore Defaults" button visibility by using the native `add_custom_action` API instead of direct DOM manipulation.

## [v3.42] - 2026-01-15
### Added
- **Restore Defaults:** Added a button to the "Customize Sidebar" dialog that allows users to reset their layout to the system defaults (clearing all custom shortcuts and re-fetching auto-discovered workspaces).

## [v3.41] - 2026-01-15
### Fixed
- **Unresponsive Icons:** Refactored event binding from global delegation to direct DOM attachment. This resolves an issue where icons became unclickable after a system reload (soft refresh).

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
