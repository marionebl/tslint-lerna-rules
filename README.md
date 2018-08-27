# tslint-lerna-rules

> TSLint rules useful for Lerna repositories


## Getting started

```sh
npm install --save-dev tslint-lerna-rules
```


```js
// tslint.json
{
  rulesDirectory: [
    "tslint-lerna-rules"
  ],
  rules: {
    "no-relative-import": true
  }
}
```

## License

MIT. Copyright 2018 - present Mario Nebl

## Development

```
git clone git@github.com:marionebl/tslint-lerna-rules.git
cd tslint-lerna-rules
yarn
yarn test --watchAll
```
