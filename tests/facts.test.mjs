import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../gematria.mjs';
import { createDeck, evaluateFact, facts, genesis, johnRatio, piDecimals } from '../facts.mjs';

// Expected values are audit fixtures only. Every term, including each side of
// a compound equation, must independently evaluate to the stated result.
const expected = {
  'wine-secret': [70], 'love-one': [13, 26], life: [18], 'messiah-serpent': [358],
  accuser: [364], torah: [611, 613], tzitzit: [600, 613], nature: [86], light: [207],
  humility: [45], amen: [91], ladder: [130], 'high-holidays': [136], 'soul-heavens': [395],
  blessing: [227], noah: [58], delight: [123], family: [44], jacob: [182], place: [186],
  heart: [32], truth: [441], sheshach: [34], peace: [376, 936], year: [355], israel: [541],
};

test('the deck has unique links and a test fixture for every fact', () => {
  assert.deepEqual(facts.map(fact => fact.id).sort(), [...Object.keys(expected), 'genesis-pi', 'genesis-pi-digits'].sort());
});
for (const fact of facts.filter(f => Object.hasOwn(expected, f.id))) {
  test(fact.title, () => {
    const { equations, proof } = evaluateFact(fact);
    assert.ok(proof.some(row => row.word === fact.main));
    assert.equal(equations.length, expected[fact.id].length);
    for (const [i, equation] of equations.entries()) {
      assert.ok(equation.terms.length);
      for (const term of equation.terms) assert.equal(term.value, expected[fact.id][i], term.label);
    }
    for (const row of proof) {
      const result = calculate(row.word);
      assert.deepEqual(row.letters, result.letters);
      assert.equal(row.letters.reduce((n, letter) => n + letter.values[row.method], 0), result.totals[row.method]);
    }
    if (fact.id === 'sheshach') {
      assert.equal(equations[0].mirror, fact.claims[0].to);
      assert.deepEqual(proof[0].letters.map(l => [l.char, l.mirror]), [['ש','ב'], ['ש','ב'], ['ך','ל']]);
    }
  });
}

test('Genesis products, counts, decimal expansion and comparison with pi', () => {
  const fact = facts.find(item => item.id === 'genesis-pi');
  assert.equal(fact.main, genesis);
  const { pi, proof } = evaluateFact(fact);
  assert.deepEqual(proof.map(row => row.totals.standard), pi.wordValues);
  assert.equal(pi.letters, 28);
  assert.equal(pi.words, 7);
  assert.deepEqual(pi.wordValues, [913, 203, 86, 401, 395, 407, 296]);
  assert.equal(pi.total, 2701);
  assert.equal(pi.letterProduct, 23887872000000000000000000000000000n);
  assert.equal(pi.letterProduct, 2n ** 15n * 3n ** 6n * 10n ** 27n);
  assert.equal(pi.wordProduct, 304153525784175760n);
  assert.equal(pi.decimal, '314155450783109979.159413447301');
  assert.equal(pi.mantissa, '3.1415545078310');
  assert.equal(pi.exponent, 17);
  assert.equal(pi.mantissa.slice(0, 6), String(Math.PI).slice(0, 6));
  assert.equal(((Number(pi.mantissa) - Math.PI) / Math.PI).toExponential(3), '-1.214e-5');
});

test('pi starts at decimal place one and contains 700 decimal digits', () => {
  assert.match(piDecimals, /^[0-9]{700}$/);
  assert.ok(piDecimals.startsWith('14159265358979323846264338327950288419716939937510'));
  assert.equal(piDecimals.length, 700);
});

test('pi ends at the supplied 700th decimal place', () => {
  assert.equal(piDecimals.slice(-10), '6892589235');
});

test('the Torah and Genesis values determine both splits, the shifted window and the bonus sums', () => {
  const fact = facts.find(item => item.id === 'genesis-pi-digits');
  assert.equal(fact.main, genesis);
  const { digitSums: d } = evaluateFact(fact);
  for (const [row, word, standard, katan] of [[d.torah, 'תורה', 611, 17], [d.verse, genesis, 2701, 82]]) {
    assert.deepEqual(row.totals, calculate(word).totals);
    assert.equal(row.totals.standard, standard);
    assert.equal(row.totals.katan, katan);
  }
  for (const [part, start, end, sum] of [
    [d.longFirst, 1, 611, 2701], [d.shortFirst, 1, 17, 82], [d.longLast, 18, 628, 2701],
    [d.shortLast, 612, 628, 82], [d.shifted, 17, 627, 2701], [d.full, 1, 628, 2783],
    [d.byWordCount, 1, 7, 28],
  ]) {
    assert.deepEqual([part.start, part.end, part.sum], [start, end, sum]);
    const digits = piDecimals.slice(start - 1, end);
    assert.equal(part.digits, digits);
    assert.equal(Array.from(digits, Number).reduce((a, b) => a + b, 0), sum);
  }
  assert.equal(d.torah.totals.standard + d.torah.totals.katan, d.full.end);
  assert.equal(d.shortFirst.digits + d.longLast.digits, d.full.digits);
  assert.equal(d.longFirst.digits + d.shortLast.digits, d.full.digits);
  assert.equal(piDecimals[17 - 1], '3');
  assert.equal(piDecimals[628 - 1], '3');
  assert.equal(d.verse.words.length, d.byWordCount.end);
  assert.equal(d.verse.letters.length, d.byWordCount.sum);
  assert.equal(d.squareSum, 2701);
  assert.equal(Array.from(piDecimals.slice(0, 82), Number).reduce((a, b) => a + b * b, 0), d.squareSum);
});

test('John uses Greek isopsephy with an explicit iota subscript', () => {
  const result = johnRatio();
  assert.equal(result.letters, 52);
  assert.equal(result.words, 17);
  assert.equal(result.total, 3627);
  assert.equal(result.exponent, 40);
  assert.equal(result.mantissa, '2.7183128121964');
  assert.equal(Number(result.mantissa).toPrecision(5), Math.E.toPrecision(5));
});

test('shuffle bags exhaust every card and avoid adjacent repeats across refills', () => {
  const deck = createDeck();
  let last;
  for (let round = 0; round < 20; round++) {
    const seen = new Set();
    for (let i = 0; i < facts.length; i++) {
      const fact = deck.draw();
      assert.notEqual(fact, last);
      seen.add(fact);
      last = fact;
    }
    assert.equal(seen.size, facts.length);
  }
});

test('a direct link consumes its card from the current bag', () => {
  const deck = createDeck();
  const pi = facts.find(f => f.id === 'genesis-pi');
  assert.equal(deck.draw(pi), pi);
  const rest = Array.from({ length: facts.length - 1 }, () => deck.draw());
  assert.ok(!rest.includes(pi));
  assert.equal(new Set(rest).size, rest.length);
});
