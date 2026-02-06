# Changelog

All notable changes to PromptVault will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.0] - 2026-02-07

### Added
- **Context Menu Integration** - Right-click on selected text to add prompts
  - **Quick Add** - Instantly save highlighted text with formatting preserved
  - Auto-names from first 30 characters of content
- **Unconfigured Filter** - Filter prompts without category/tags for batch editing
- **Blank Line Settings** - Choose "Keep blank lines (max 1)" or "Remove all" in settings
- **Quick Guide** - In-app help popup with usage instructions (Japanese/English)
- New permissions: `contextMenus`, `activeTab`, `scripting`, `host_permissions`

### Changed
- Side panel auto-opens when adding from context menu
- Improved filter badges with "Unconfigured" indicator

### Fixed
- Text selection now preserves formatting with configurable blank line handling

---

## [1.5.0] - 2026-02-06

### Added
- **Tag/Category Filtering** - Click tags or categories to filter prompts
- **Combined Filters** - Mix tags, categories, and search keywords
- **Filter Badges** - Visual indicators for active filters below search bar
- **Tag Filter for Export** - Export by tags, categories, or both

### Changed
- **Drag & Drop** - Only "All Prompts" section is sortable; Pinned and Recent are read-only
- **Case Sensitivity Toggle** - Modern switch-style design
- **Search UX** - Filter active state affects Recently Used section visibility

### Fixed
- Removed unused imports causing build warnings

---

## [1.4.0] - 2026-02-06

### Added
- **Glassmorphism UI** - Modern glass-effect design with gradient backgrounds
- **CSV Export** - Export prompts to CSV format with category filter
- **CSV Import** - Import prompts from CSV files
- **Import Mode Selection** - Choose between "Add" and "Replace" modes
- **Import Confirmation Dialog** - Confirm before importing with mode selection
- **Category Filter for Export** - Select specific categories to export
- **Danger Zone** - Delete all data with "DELETE" confirmation
- **Third-party License Documentation** - All external library licenses listed in LICENSE

### Changed
- README.md is now English (README_JA.md for Japanese)
- Export dialog redesigned with format selection (JSON/CSV)
- FAB button now has glow effect
- Improved card hover effects with glassmorphism

---

## [1.3.0] - 2026-02-06

### Added
- **Performance Optimization** - Support for 10,000 prompts
- **Search Caching** - Cached results for faster repeated searches
- **Lazy Loading** - Load 50 prompts at a time on scroll
- **CHANGELOG.md** - This changelog file
- **PRIVACY_POLICY.md** - Comprehensive privacy policy (EN/JA)
- **CONTRIBUTING.md** - Contribution guidelines (EN/JA)
- **TECHNICAL.md** - Technical specification document

### Changed
- Search algorithm optimized with early termination
- Prompt count display shows visible/total count

---

## [1.2.0] - 2026-01-30

### Added
- **Multi-language Support** - Japanese / English toggle
- **Drag & Drop Reorder** - Sort prompts with mouse
- **Case Sensitivity Toggle** - Improved visibility with icon
- **Installation Guides** - INSTALL_EN.md, INSTALL_JA.md
- **User Guides** - USAGE_EN.md, USAGE_JA.md

### Changed
- Search bar redesigned for better UX
- Settings dialog reorganized

---

## [1.1.0] - 2026-01-20

### Added
- **Pin Prompts** - Keep important prompts at top
- **Recent Prompts** - Quick access to recently used
- **Tag System** - Multiple tags per prompt
- **Export to JSON** - Backup all prompts

### Fixed
- Storage sync issues resolved
- Search performance improved

---

## [1.0.0] - 2026-01-10

### Added
- Initial release
- Chrome side panel interface
- Prompt CRUD operations
- Real-time search
- Dark/Light mode
- Markdown preview
- One-click copy to clipboard
