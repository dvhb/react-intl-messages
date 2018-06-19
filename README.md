# react-intl-extract
Library for parsing source files and extract react-intl messages. Extracted messages saves to json files. Underhood it uses babe-plugin-react-intl

## Features
* syncronize translations with translation service (lokalise.co for now)
* custom babel config, appropriate for projects on react-native and typescript
* prettify extracted json files

## Options
langs - comma separeted languages,
pattern - regex mask for files
babelrc - path to babel rc custom config

`react-intl-extract --langs=en,fr,de,ru --pattern=src/**/*.{ts,tsx} --dest=src/messages --babelrc=.babelrcts`

### Extracted json structure:
`_default.json`
```json
[
  {
    "id": "home.helloWorld",
    "description": "Greeting the world",
    "defaultMessage": "Hello world!",
    "message": "",
    "files": ["src/components/Home/index.js"]
  }
]
```

### File after translation on lokalise.co:
`fr.json`
```json
[
  {
    "id": "home.helloWorld",
    "description": "Greeting the world",
    "defaultMessage": "Hello world!",
    "message": "Bonjour le monde",
    "files": ["src/components/Home/index.js"]
  }
]
```
