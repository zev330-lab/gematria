import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, methods } from '../gematria.mjs';
import { lexicon } from '../lexicon.mjs';

for (const [word, value] of Object.entries({
  שלום: 376, אמת: 441, חי: 18, אהבה: 13, אחד: 13, יהוה: 26, ישראל: 541, תורה: 611, 'שָׁלוֹם': 376,
})) {
  test('standard value of ' + word, () => assert.equal(calculate(word).totals.standard, value));
}

test('every Hebrew letter in standard, reduced, ordinal and Atbash order', () => {
  const word = 'אבגדהוזחטיכלמנסעפצקרשת';
  const result = calculate(word);
  const values = [1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400];
  for (const [index, { values: letter }] of result.letters.entries()) {
    assert.equal(letter.standard, values[index]);
    assert.equal(letter.gadol, values[index]);
    assert.equal(letter.katan, index % 9 + 1);
    assert.equal(letter.ordinal, index + 1);
    assert.equal(letter.atbash, values[21-index]);
  }
  assert.equal(result.atbash, [...word].reverse().join(''));
  assert.equal(calculate('א').atbash, 'ת');
});

test('every final form in every method', () => {
  const finals = calculate('ךםןףץ').letters;
  const regular = calculate('כמנפצ').letters;
  for (const [i, letter] of finals.entries()) {
    assert.deepEqual(letter.values, { ...regular[i].values, gadol: [500,600,700,800,900][i] });
    assert.equal(letter.mirror, regular[i].mirror);
  }
});
test('shalom per-letter values and totals', () => {
  const { letters, totals, atbash } = calculate('שלום');
  assert.deepEqual(letters.map(l => l.values.katan), [3,3,6,4]);
  assert.deepEqual(letters.map(l => l.values.ordinal), [21,12,6,13]);
  assert.deepEqual(totals, { standard:376, gadol:936, katan:16, ordinal:52, atbash:112 });
  assert.equal(atbash, 'בכפי');
});
test('vowels, cantillation, punctuation, digits, whitespace and maqaf', () => {
  const result = calculate('  שָׁל֖וֹם־אֱמֶת!  ג׳ ד״ 123 ');
  assert.deepEqual(result.words.map(w => w.text), ['שלום','אמת','ג','ד']);
  assert.deepEqual(result.words.map(w => w.totals.standard), [376,441,3,4]);
  for (const { id } of methods) {
    assert.equal(result.totals[id], result.words.reduce((sum,w) => sum + w.totals[id], 0));
  }
  assert.equal(calculate('שׁ').totals.standard, 300);
});
test('empty and unsupported symbols', () => {
  for (const input of ['', '123 ־  ׳ ״ ✨']) {
    assert.equal(calculate(input).letters.length, 0);
    assert.deepEqual(Object.values(calculate(input).totals), [0,0,0,0,0]);
  }
});
test('English ordinal stays separate from Hebrew totals', () => {
  const mixed = calculate('Az חי!');
  assert.equal(mixed.englishTotal, 27);
  assert.equal(mixed.totals.standard, 18);
  assert.equal(calculate('shalom').englishTotal, 68);
});
test('built-in lexicon has distinct Hebrew entries and computed matches', () => {
  assert.ok(lexicon.length >= 200);
  assert.equal(new Set(lexicon.map(entry => entry.word)).size, lexicon.length);
  for (const { word, gloss } of lexicon) {
    assert.match(word, /^[א-ת ]+$/u);
    assert.ok(gloss.trim());
  }
  const matches = lexicon.filter(({ word }) => calculate(word).totals.standard === 13);
  assert.ok(['אחד','אהבה'].every(word => matches.some(entry => entry.word === word)));
});
