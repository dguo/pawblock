# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.5.1] - 2022-12-28

### Changed

- Stop requesting the `tabs` permission, which is not needed

## [0.5.0] - 2018-04-16

### Added

- Option to automatically turn PawBlock back on x minutes after turning
  it off

### Changed

- Delay turning off PawBlock from the toolbar popup

## [0.4.0] - 2018-01-22

### Changed

- Rules are treated as JS regexes now

## [0.3.3] - 2017-09-03

### Added

- A basic test setup for the JS code

### Changed

- Vendor the external assets (required by Firefox)
- Reorganize the styles and scripts

## [0.3.2] - 2017-08-10

### Changed

- Just bumping the version number because I need to uncheck that this is
  compatible with Firefox for Android, but I can't do that without submitting
  a new version

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

[Unreleased]: https://github.com/dguo/pawblock/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/dguo/pawblock/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/dguo/pawblock/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/dguo/pawblock/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/dguo/pawblock/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/dguo/pawblock/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/dguo/pawblock/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/dguo/pawblock/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/dguo/pawblock/compare/v0.1.0...v0.2.0
[landing page]: https://dannyguo.com/pawblock
