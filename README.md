# react-intl-messages

Library for parsing source files and extract react-intl messages. Extracted messages saves to json files. Underhood it uses babe-plugin-react-intl

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@dvhb/react-intl-messages.svg)](https://npmjs.org/package/@dvhb/react-intl-messages)
[![Downloads/week](https://img.shields.io/npm/dw/@dvhb/react-intl-messages.svg)](https://npmjs.org/package/@dvhb/react-intl-messages)
[![License](https://img.shields.io/npm/l/@dvhb/react-intl-messages.svg)](https://github.com/sairus2k/@dvhb/react-intl-messages/blob/master/package.json)

<!-- toc -->

- [Features](#features)
- [Usage](#usage)
- [Commands](#commands)
- [Config](#config)
- [Integration](#integration)
  <!-- tocstop -->

# Features

- synchronize translations with translation service ([lokalise.co](https://lokalise.co/) and [Locize](https://locize.com/) for now)
- custom babel config, appropriate for projects on react-native and typescript
- prettify extracted json files
- store parameters in config

# Usage

<!-- usage -->

```sh-session
$ npm install -g @dvhb/react-intl-messages
$ messages COMMAND
running command...
$ messages (-v|--version|version)
@dvhb/react-intl-messages/2.2.2 darwin-x64 node-v10.16.0
$ messages --help [COMMAND]
USAGE
  $ messages COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`messages clean`](#messages-clean)
- [`messages extract`](#messages-extract)
- [`messages help [COMMAND]`](#messages-help-command)
- [`messages sync`](#messages-sync)

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
  --uploadTranslations           Upload existing translations to provider. Useful for provider migration.
  --version=version              Translations version, for example "production". Required for Locize
```

_See code: [src/commands/clean.ts](https://github.com/dvhb/react-intl-messages/blob/v2.2.2/src/commands/clean.ts)_

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

_See code: [src/commands/extract.ts](https://github.com/dvhb/react-intl-messages/blob/v2.2.2/src/commands/extract.ts)_

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
  --uploadTranslations           Upload existing translations to provider. Useful for provider migration.
  --version=version              Translations version, for example "production". Required for Locize

EXAMPLE
  $ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
```

_See code: [src/commands/sync.ts](https://github.com/dvhb/react-intl-messages/blob/v2.2.2/src/commands/sync.ts)_

<!-- commandsstop -->

# Config

- `messages` property in a package.json file.
- `.messages` file with JSON or YAML syntax.
- `.messages.json` file.
- `.messages.yaml` or `.messages.yml` file.
- `.messages.js` or `messages.config.js` JS file exporting the object.

`package.json` example:

```json
{
  "messages": {
    "langs": "en,fr,de,ru",
    "pattern": "src/**/*.js",
    "messagesDir": "src/messages"
  }
}
```

# Integration

A brief instruction how to integrate `react-intl` in your project. For more details please check the [react-intl documentation](https://github.com/formatjs/react-intl/blob/master/docs/README.md)

1. Install [react-intl](https://www.npmjs.com/package/react-intl) and [@dvhb/react-intl-messages](https://www.npmjs.com/package/@dvhb/react-intl-messages)
   ```shell script
   npm install --save-dev react-intl @dvhb/react-intl-messages
   ```
1. Add config for `@dvhb/react-intl-messages` as described in [Config](#config) section.

   After that you can generate messages files like that:

   ```shell script
   npx messages extract
   ```

1. Add polyfills for `Intl.NumberFormat` and `Intl.DateTimeFormat` if necessary (for IE11 and react-native) like described in the [instruction](https://github.com/formatjs/react-intl/blob/master/docs/Getting-Started.md#runtime-requirements).
1. Wrap the app with [IntlProvider](https://github.com/formatjs/react-intl/blob/master/docs/Components.md#intlprovider).
   Import translations from extracted files. Then reduce translations and pass them to the provider:

   ```jsx harmony
   import messagesEn from '../messages/en.json'

   const reduceMessages = messages => Object.assign({}, ...messages.map(msg => ({ [msg.id]: msg })));

   const locale = 'en';

   const messages = {
     en: reduceMessages(messagesEn),
   }

   <IntlProvider messages={messages[locale]} locale={locale}>
     <App />
   </IntlProvider>;
   ```

1. After that you can use react-intl components in your project. Like that:

   ```jsx harmony
   <FormattedMessage
     id="app.greeting"
     description="Greeting to welcome the user to the app"
     defaultMessage="Hello, <b>Eric</b> {icon}"
     values={{
       b: msg => <b>{msg}</b>,
       icon: <svg />,
     }}
   />
   ```

1. Now if you extract messages again, in `_default.json` file should appear new item.
   ```json
   [
     {
       "id": "app.greeting",
       "defaultMessage": "Greeting to welcome the user to the app",
       "message": "",
       "files": ["src/HelloWorld.js"]
     }
   ]
   ```
