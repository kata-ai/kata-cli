# CHANGELOG

## [2.6.0] - 2019/11/19
- Fix search user on`kata invite-member` and `kata impersonate`command ([#133](https://github.com/kata-ai/kata-cli/pull/133), [#139](https://github.com/kata-ai/kata-cli/pull/139))

## [2.5.0] - 2019/09/02
- Fix bug when switch to team during in impersonate mode ([#126](https://github.com/kata-ai/kata-cli/pull/126))
- Add feature to select project name inline ([#127](https://github.com/kata-ai/kata-cli/pull/127))
- Add handler to display notification message when error happened, instead of letting string quotes `''` pop up ([#128](https://github.com/kata-ai/kata-cli/pull/128))

## [2.4.0] - 2019/07/12
- Add missing feature so that Kata-CLI is aligned with Platform. (#122)
  - For the sake of consistency, we renamed several commands, such as:
    - `kata add-channel` to `kata create-channel`
    - `kata edit-channel` to `kata update-channel`
    - `kata config-view` to `kata view-config`
    - `kata add-member` to `kata invite-member`
- Add feature: impersonate user when logging in as administrator (#121)

## [2.3.0] - 2019/04/16
- Improved user experience for update-environment command (#120)

## [2.2.0] - 2019/03/20
- Improved user experience for update-environment command (#114)
- Add 20 character limit validation for environment URL and project name (#115)
- Improved error message for missing NLU.yml (#117)
- Fixed bug on create-deployment command not choosing the correct NLU revision (#118)

## [2.1.1] - 2019/03/01
- Change analytics message (#119)

## [2.1.0] - 2019/02/14
### Fixed : 
- Change endpoint API for command `push` (#109)
- Check job training status on command `nl-train` (#108)
- Add training error detail for command `nl-train` (#107)
- Fix endpoint API for command `nl-snapshot` (#106)
- Add Google Analytics for command tracking (#105)

## [2.0.11] - 2019/01/03
### Fixed : 
- Create new revision on push (#102)
- Fix get latest revision (#101)
- Limit new entity name to 20 chars and add detailed error messages (#98)
- Set substring to 7 (#97)

## [2.0.8] - 2018/12/20
### Fixed : 
- Fix nl-pull for entity type dictionary 
- Latest bot, nlu, and cms revision endpoint
- Remove yarn.lock

## [2.0.6] - 2018/12/20
### Fixed : 
- Remove warning http2

## [2.0.5] - 2018/12/20
### Fixed : 
- Restrict create-environment when name exist
- Change Project Push endpoint

### Added : 
- NL docs on README
- Move CONTRIBUTING to README

## [2.0.4] - 2018/12/13
### Fixed : 
- Remove *.yml from .gitignore

## [2.0.3] - 2018/12/13
### Fixed : 
- Fix vulnerabilities

## [2.0.2] - 2018/12/13
### Fixed : 
- Switch team error
- Create team error namespace
- Add or remove member to team

### Added : 
- Pull with revision
- Version type when create-deployment

## [2.0.1] - 2018/12/05
### Fixed : 
- Fix .gitignore

## [2.0.0] - 2018/12/05
### Added : 
- Kata CLI v2.0

## [1.4.0] - 2018/08/16
### Added : 
- Add twitter channel type

### Fixed :
- Switch team method

## [1.3.2] - 2018/07/12
### Added : 
- Add config-view command

### Fixed
- Integrate function 'versions' to new bot version object

## [1.3.1] - 2018/02/12
### Fixed
- Fix undefined context and state in flow spec

## [1.3.0] - 2018/02/05
### Added :
- Kata pull bot

### Fixed
- Fix version still increment when failed push bot

## [1.2.4] - 2017/01/08
### Fixed :
- Handle kata console error when no bot.yml in directory

## [1.2.3] - 2017/12/27
### Fixed :
- Fix bug on kata deploy and kata nl-push command

## [1.2.1] - 2017/12/21
### Changed :
- Update kata init command

## [1.2.0] - 2017/12/06
### Added : 
- Add discard and update draft
- Add new version information when pushing bot
- Generate challenge token for fbmessenger channel type

### Changed :
- Change kata init output message

### Fixed : 
- Fix proper handling for kata versions

## [1.1.0] - 2017/11/28
### Added : 
- Handle NLU Management

### Fixed :
- Fix wrong username and password
- Fix invalid user command input

## 1.0.0 - 2017/10/26
### Added : 
- Handle Bot Management
- Handle Deployment Management
- Handle User & Team Management

[2.0.11]: https://github.com/kata-ai/kata-cli/compare/v2.0.8...v2.0.11
[2.0.8]: https://github.com/kata-ai/kata-cli/compare/v2.0.6...v2.0.8
[2.0.6]: https://github.com/kata-ai/kata-cli/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/kata-ai/kata-cli/compare/v2.0.4...v2.0.5
[2.0.4]: https://github.com/kata-ai/kata-cli/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/kata-ai/kata-cli/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/kata-ai/kata-cli/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/kata-ai/kata-cli/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/kata-ai/kata-cli/compare/v1.4.0...v2.0.0
[1.4.0]: https://github.com/kata-ai/kata-cli/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/kata-ai/kata-cli/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/kata-ai/kata-cli/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/kata-ai/kata-cli/compare/v1.2.4...v1.3.0
[1.2.4]: https://github.com/kata-ai/kata-cli/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/kata-ai/kata-cli/compare/v1.2.1...v1.2.3
[1.2.1]: https://github.com/kata-ai/kata-cli/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/kata-ai/kata-cli/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kata-ai/kata-cli/compare/v1.0.0...v1.1.0
