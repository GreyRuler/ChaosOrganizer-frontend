import { expect, test } from '@jest/globals';

test.each([
	{ actual: '51.50851, —0.12572', expected: true },
	{ actual: '51.50851,-0.12572', expected: false },
	{ actual: '[51.50851, -0.12572]', expected: false },
])('Должен проверить строки на валидность', ({ actual, expected }) => {
	const pattern = /(?<!.)-?\d+.\d+, [—-]?\d+.\d+(?!.)/;
	const re = new RegExp(pattern);
	expect(re.test(actual)).toBe(expected);
});
