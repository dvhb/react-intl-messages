react-intl-extract
==================

Library for parsing source files and extract react-intl messages. Extracted messages saves to json files. Underhood it uses babe-plugin-react-intl

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/react-intl-extract.svg)](https://npmjs.org/package/react-intl-extract)
[![Downloads/week](https://img.shields.io/npm/dw/react-intl-extract.svg)](https://npmjs.org/package/react-intl-extract)
[![License](https://img.shields.io/npm/l/react-intl-extract.svg)](https://github.com/sairus2k/react-intl-extract/blob/master/package.json)

<!-- toc -->
* [Features](#features)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Features
* synchronize translations with translation service ([lokalise.co](https://lokalise.co/) for now)
* custom babel config, appropriate for projects on react-native and typescript
* prettify extracted json files
# Usage
<!-- usage -->
```sh-session
$ npm install -g react-intl-extract
$ messages COMMAND
running command...
$ messages (-v|--version|version)
react-intl-extract/0.0.0 darwin-x64 node-v8.12.0
$ messages --help [COMMAND]
USAGE
  $ messages COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`messages extract`](#messages-extract)
* [`messages help [COMMAND]`](#messages-help-command)
* [`messages sync`](#messages-sync)

## `messages extract`

describe the command here

```
USAGE
  $ messages extract

OPTIONS
  -d, --dest=dest        (required) [default: src/messages] directory for extracted messages
  -h, --help             show CLI help
  -i, --ignore=ignore    regex mask for ignored files
  -l, --langs=langs      (required) comma separated languages
  -p, --pattern=pattern  (required) regex mask for files

EXAMPLE
  $ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
```

## `messages help [COMMAND]`

display help for messages

```
USAGE
  $ messages help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `messages sync`

describe the command here

```
USAGE
  $ messages sync

OPTIONS
  -h, --help                 show CLI help
  -i, --projectId=projectId  (required) Lokalise project id
  -l, --langs=langs          (required) comma separated languages
  -s, --source=source        (required) [default: src/messages] directory for extracted messages
  -t, --token=token          (required) Lokalise token

EXAMPLE
  $ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
```
<!-- commandsstop -->
