# eslint-plugin-sort-requires-by-path

ESLint rule to enforce sorting of variable declarations in a group of `require("path")` calls based on "path" string.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm install eslint --save-dev
```

Next, install `eslint-plugin-sort-requires-by-path`:

```
$ npm install eslint-plugin-sort-requires-by-path --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must
also install `eslint-plugin-sort-requires-by-path` globally.

## Usage

Add `sort-requires-by-path` to the plugins section of your `.eslintrc` configuration
file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "sort-requires-by-path"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "sort-requires-by-path/sort-requires-by-path": 2
  }
}
```
## License

[MIT](LICENSE.txt)
