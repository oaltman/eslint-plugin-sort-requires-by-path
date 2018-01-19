const rule = require('../../../lib').rules['sort-requires-by-path'];
const { RuleTester } = require('eslint');

const code = (lines) => lines.join('\n');
const ruleTester = new RuleTester();

ruleTester.run('sort-requires', rule, {
  valid: [
    code([
      'var a = require("./a")',
      'var b = require("./b")',
    ]),
    code([
      'var a = require("./a")',
      'var b =',
      '  require("./b")',
      'var c = require("./c")',
    ]),
    code([
      'var a = require("./a")',
      'var A = require("./A")',
    ]),
    code([
      'var A = require("./A")',
      'var a = require("./a")',
    ]),
    code([
      'var a = require("./a")',
      'var c = require("./c")',
      '',
      'var b = require("./b")',
    ]),
    code([
      'var a = require("./a")',
      'var b = require("./b")',
      'var c = require("./c")',
    ]),
    {
      code: code([
        'var a = require("./a")',
        'var A = require("./aa")',
        'var b = require("./b")',
        'var B = require("./bb")',
        'var { a } = require("./xA")',
				'var { b } = require("./xB")',
        'var _ = require("_")',
      ]),
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'const a = require("./a")',
        'const b = require("./b")',
      ]),
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'const b = require("./a")',
        'let a = require("./b")',
      ]),
      parserOptions: { ecmaVersion: 6 },
    },
    code([
      'var b = "hi"',
      'var a = "sup"',
    ]),
    code([
      'var a = require("./a")',
      'var c = require("./c")',
      '',
      'var b = require("./b")',
    ]),
  ],

  invalid: [
    {
      code: code([
        'var b = require("./b")',
        'var a = require("./a")',
      ]),
      output: code([
				'var a = require("./a")',
        'var b = require("./b")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
    },
    {
      code: code([
        'var b =',
        '  require("./b")',
        'var a = require("./a")',
      ]),
      output: code([
        'var a = require("./a")',
        'var b =',
        '  require("./b")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
    },
    {
      code: code([
        'var b =',
        '',
        '  require("./b")',
        'var a = require("./a")',
      ]),
      output: code([
        'var a = require("./a")',
        'var b =',
        '',
        '  require("./b")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
    },
    {
      code: code([
        'var { a } = require("./b")',
        'var { b } = require("./a")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'var { c, a } = require("./b")',
        'var { b } = require("./a")',
      ]),
      output: code([
        'var { b } = require("./a")',
        'var { c, a } = require("./b")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'var { b } = require("./b")',
        'var a = require("./a")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'let a = require("./b")',
        'const B = require("./a")',
      ]),
      output: code([
        'const B = require("./a")',
        'let a = require("./b")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'const a = require("./c")',
        'let c = require("./a")',
        'let b = require("./b")',
      ]),
      output: code([
				'let c = require("./a")',
        'let b = require("./b")',
        'const a = require("./c")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'var c = require("./c")',
        'var b = require("./a")',
        'var a = require("./b")',
      ]),
      output: code([
				'var b = require("./a")',
        'var a = require("./b")',
        'var c = require("./c")',
      ]),
      errors: [{ message: 'This group of requires is not sorted' }],
    },
    {
      code: code([
        'var b = require("./b")',
        'var a = require("./a")',
        '',
        'var d = require("./d")',
        'var c = require("./c")',
      ]),
      output: code([
        'var a = require("./a")',
        'var b = require("./b")',
				'',
        'var c = require("./c")',
        'var d = require("./d")',
      ]),
      errors: [
        { message: 'This group of requires is not sorted' },
        { message: 'This group of requires is not sorted' },
      ],
    },
  ],
});
