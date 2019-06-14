react-intl-messages
==================

Library for parsing source files and extract react-intl messages. Extracted messages saves to json files. Underhood it uses babe-plugin-react-intl

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@dvhb/react-intl-messages.svg)](https://npmjs.org/package/@dvhb/react-intl-messages)
[![Downloads/week](https://img.shields.io/npm/dw/@dvhb/react-intl-messages.svg)](https://npmjs.org/package/@dvhb/react-intl-messages)
[![License](https://img.shields.io/npm/l/@dvhb/react-intl-messages.svg)](https://github.com/sairus2k/@dvhb/react-intl-messages/blob/master/package.json)

<!-- toc -->
* [Features](#features)
* [Usage](#usage)
* [Commands](#commands)
* [Config](#config)
<!-- tocstop -->
# Features
* synchronize translations with translation service ([lokalise.co](https://lokalise.co/) for now)
* custom babel config, appropriate for projects on react-native and typescript
* prettify extracted json files
* store parameters in config
# Usage
<!-- usage -->
```sh-session
$ npm install -g @dvhb/react-intl-messages
$ messages COMMAND
running command...
$ messages (-v|--version|version)
@dvhb/react-intl-messages/2.2.1 darwin-x64 node-v10.16.0
$ messages --help [COMMAND]
USAGE
  $ messages COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`messages clean`](#messages-clean)
* [`messages extract`](#messages-extract)
* [`messages help [COMMAND]`](#messages-help-command)
* [`messages sync`](#messages-sync)

## `messages clean`

Clean lokalise for unused translation keys

```
USAGE
  $ messages clean

OPTIONS
  -d, --messagesDir=messagesDir  (required) [default: src/messages] Directory for extracted messages
  -h, --help                     show CLI help
  --namespace=namespace          Provider`s namespace. Required for Locize
  --projectId=projectId          Provider`s project id
  --provider=lokalise|locize     (required) Translation service provider
  --token=token                  Provider`s token
  --version=version              Translations version, for example "production". Required for Locize
```

_See code: [src/commands/clean.ts](https://github.com/dvhb/react-intl-messages/blob/v2.2.1/src/commands/clean.ts)_

## `messages extract`

Extract translations from source files to json

```
USAGE
  $ messages extract

OPTIONS
  -d, --messagesDir=messagesDir  (required) [default: src/messages] Directory for extracted messages
  -h, --help                     show CLI help
  -i, --ignore=ignore            Regex mask for ignored files
  -l, --langs=langs              (required) Comma separated languages
  -p, --pattern=pattern          (required) Regex mask for files

EXAMPLE
  $ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
```

_See code: [src/commands/extract.ts](https://github.com/dvhb/react-intl-messages/blob/v2.2.1/src/commands/extract.ts)_

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

Synchronise extracted files with Lokalise.co

```
USAGE
  $ messages sync

OPTIONS
  -d, --messagesDir=messagesDir  (required) [default: src/messages] Directory for extracted messages
  -h, --help                     show CLI help
  -l, --langs=langs              (required) Comma separated languages
  --namespace=namespace          Provider`s namespace. Required for Locize
  --projectId=projectId          Provider`s project id
  --provider=lokalise|locize     (required) Translation service provider
  --token=token                  Provider`s token
  --version=version              Translations version, for example "production". Required for Locize

EXAMPLE
  $ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
```

_See code: [src/commands/sync.ts](https://github.com/dvhb/react-intl-messages/blob/v2.2.1/src/commands/sync.ts)_
<!-- commandsstop -->

# Config
* `messages` property in a package.json file.
* `.messages` file with JSON or YAML syntax.
* `.messages.json` file.
* `.messages.yaml` or `.messages.yml` file.
* `.messages.js` or `messages.config.js` JS file exporting the object.
