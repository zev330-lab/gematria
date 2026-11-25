import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { calculate, methods } from '../gematria.mjs';
import { lexicon } from '../lexicon.mjs';
import { findRows } from '../lookup.mjs';

const root = new URL('../data/words/', import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(name + '.json', root)));
const manifest = await read('manifest');

test('every spelling is unique and all five reverse indexes are complete, ranked and exact', async () => {
  const files = new Set(['manifest.json']);
  const rows = [], spellings = new Set();
  const curated = new Map(lexicon.map(({word, gloss}) => [word, gloss]));
  for (let i = 0; rows.length < manifest.counts.entries; i++) {
    const name = 'rows-' + i;
    const page = await read(name);
    files.add(name + '.json');
    assert.equal(page.length, Math.min(manifest.pageSize, manifest.counts.entries - rows.length));
    for (const [word, frequency, gloss] of page) {
      assert.match(word, /^[א-ת]+(?: [א-ת]+)*$/u);
      assert.ok(!spellings.has(word), word);
      spellings.add(word);
      assert.ok(Number.isInteger(frequency) && frequency >= 0, word);
      assert.equal(typeof gloss, 'string');
      if (curated.has(word)) assert.equal(gloss, curated.get(word));
      rows.push({word, frequency, pinned:curated.has(word), totals:calculate(word).totals});
    }
  }
  for (const word of curated.keys()) assert.ok(spellings.has(word), word);
  const written = rows.filter(row => !row.word.includes(' ') && row.frequency);
  assert.equal(written.length, manifest.counts.writtenForms);
  assert.equal(written.reduce((n,row) => n + row.frequency, 0), manifest.counts.tokens);
  for (const {id} of methods) {
    const seen = new Set();
    let lower = 0;
    for (const [shard, upper] of manifest.methods[id].entries()) {
      const name = id + '-' + shard;
      const buckets = await read(name);
      files.add(name + '.json');
      assert.equal(Math.max(...Object.keys(buckets)), upper);
      for (const [value, gaps] of Object.entries(buckets)) {
        assert.ok(+value > lower && +value <= upper);
        let index = 0, previous;
        for (const gap of gaps) {
          index += gap;
          assert.ok(!seen.has(index));
          seen.add(index);
          const row = rows[index];
          assert.equal(row.totals[id], +value, id + ' ' + row.word);
          if (previous?.pinned === row.pinned) assert.ok(previous.frequency >= row.frequency);
          else if (previous) assert.ok(previous.pinned && !row.pinned);
          previous = row;
        }
      }
      lower = upper;
    }
    assert.equal(seen.size, rows.length, id);
  }
  assert.deepEqual(files, new Set(await readdir(root)));
});

test('lookup loads only the selected value shard and requested rows, including pinned matches', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async url => {
    assert.ok(url.href.startsWith(root.href));
    requests.push(url.href.slice(root.href.length));
    return {ok:true, json:async () => JSON.parse(await readFile(url))};
  });
  for (const [value, expected] of [[26,['יהוה']], [70,['יין','סוד']], [376,['שלום']], [13,['אהבה','אחד']], [86,['אלהים']]]) {
    const matches = await findRows('standard', value);
    if (value === 26) assert.deepEqual(requests, ['manifest.json','standard-0.json']);
    const first = await matches.page(0, 12);
    for (const word of expected) assert.ok(first.some(row => row[0] === word), word);
    if (value === 26) {
      assert.deepEqual(first[0], ['יהוה',6007,'the Divine Name']);
      assert.equal(requests.length, 3);
    }
    const rest = await matches.page(12, matches.count);
    assert.equal(first.length + rest.length, matches.count);
  }
  const before = requests.length;
  assert.equal((await findRows('standard', Number.MAX_SAFE_INTEGER)).count, 0);
  assert.equal(requests.length, before);
});
