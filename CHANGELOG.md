# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.3.1] - 2017-08-10
### Fixed
- Fix a typo in the manifest description

## [0.3.0] - 2017-08-10
### Added
- Firefox support

### Changed
- Remove the instructions panel on the options page in favor of inline
  instructions

## [0.2.0] - 2017-08-09
### Added
- A [landing page] to explain PawBlock
- A changelog
- The ability to export rules to a JSON file and import them back in
- The ability to set the strictness of the block: hard means no there is no
  option to continue, and soft means there is a (configurable) number of
  seconds that must elapse before the user can continue

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

[Unreleased]: https://github.com/dguo/pawblock/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/dguo/pawblock/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/dguo/pawblock/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/dguo/pawblock/compare/v0.1.0...v0.2.0
[landing page]: https://dannyguo.com/pawblock
