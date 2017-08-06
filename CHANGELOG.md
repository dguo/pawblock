# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- A [landing page] to explain PawBlock
- A changelog
- The ability to export rules to a JSON file and import them back in

### Changed
- The rule inputs now have placeholders to guide the user
- Show the blocked link on the block page
- When adding a rule, the domain and path are lowercased, and forward slashes
  are removed from the domain

### Fixed
- Fix closing the tab when there is forward history but no back history
- Fix navigating (through back, forward, or refresh) to a newly blocked page
  when PawBlock is turned on or a rule is added

## 0.1.0 - 2017-07-21
### Added
- Initial implementation

[Unreleased]: https://github.com/dguo/pawblock/compare/v0.1.0...HEAD
[landing page]: https://dannyguo.com/pawblock
