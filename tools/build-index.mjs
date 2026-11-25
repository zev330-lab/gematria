// Dev-time only. xsltproc handles XML namespaces, entities and inline markup.
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { calculate, methods } from '../gematria.mjs';
import { lexicon } from '../lexicon.mjs';

const source = join(homedir(), 'dev/gematria-data');
const output = new URL('../data/words/', import.meta.url);
const books = ('Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov ' +
  'Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal').split(' ');

function xmlRows(path, namespace, select, columns) {
  const fields = columns.map(expr => '<xsl:value-of select="normalize-space(' + expr + ')"/>');
  const input = `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x="${namespace}">
    <xsl:output method="text"/><xsl:template match="/"><xsl:for-each select="${select}">
    ${fields.join('<xsl:text>&#9;</xsl:text>')}<xsl:text>&#10;</xsl:text>
    </xsl:for-each></xsl:template></xsl:stylesheet>`;
  const lines = execFileSync('xsltproc', ['--nonet', '-', path], {input, encoding:'utf8', maxBuffer:8 * 1024 * 1024});
  if (!lines.length) throw new Error('No matching XML records in ' + path);
  return lines.trimEnd().split('\n').map(line => line.split('\t'));
}

function spelling(text) {
  return text.normalize('NFKD').split(/[\s־]+/u).map(part => part.replace(/[^א-ת]/gu, '')).filter(Boolean).join(' ');
}

const records = new Map();
function record(word) {
  if (!word) throw new Error('Empty Hebrew spelling');
  if (!records.has(word)) records.set(word, {word, frequency:0, gloss:'', pinned:false, lemmas:new Map()});
  return records.get(word);
}

const glosses = new Map();
const headwords = xmlRows(join(source, 'HebrewLexicon/HebrewStrong.xml'),
  'http://openscriptures.github.com/morphhb/namespace', '//x:entry',
  ['@id', 'x:w', '(x:meaning//x:def)[1]', 'x:usage']);
for (const [id, text, def, usage] of headwords) {
  const gloss = (def || usage?.split(/[,;]/)[0] || '').replace(/[.;:]$/, '').trim();
  const short = gloss.length > 40 ? gloss.slice(0, 39).replace(/\s+\S*$/, '') + '…' : gloss;
  glosses.set(Number(id.slice(1)), short);
  record(spelling(text)).gloss ||= short;
}
for (const { word, gloss } of lexicon) Object.assign(record(spelling(word)), {gloss, pinned:true});

// Match multi-word dictionary headwords and curated phrases within each verse.
const phrases = new Set([...records.keys()].filter(word => word.includes(' ')));
const maxLength = Math.max(...[...phrases].map(word => word.split(' ').length));
let tokens = 0;
const written = new Set();
for (const book of books) {
  const words = xmlRows(join(source, 'morphhb/wlc', book + '.xml'),
    'http://www.bibletechnologies.net/2003/OSIS/namespace', '//x:div[@type=\'book\']//x:verse/x:w',
    ['../@osisID', '@lemma', '.']);
  let lastVerse;
  const recent = [];
  for (const [verse, lemma, text] of words) {
    if (verse !== lastVerse) recent.length = 0;
    lastVerse = verse;
    // Prefix codes have no digits. Senses (e.g. 5921 a) and compound markers
    // (e.g. 1008+) share the same numeric Strong’s entry.
    const main = lemma.match(/\d+/)?.[0];
    for (const word of spelling(text).split(' ')) {
      const item = record(word);
      item.frequency++;
      tokens++;
      written.add(word);
      if (main) item.lemmas.set(+main, (item.lemmas.get(+main) || 0) + 1);
      recent.push(word);
      if (recent.length > maxLength) recent.shift();
      for (let i = 0; i < recent.length - 1; i++) {
        const phrase = recent.slice(i).join(' ');
        if (phrases.has(phrase)) records.get(phrase).frequency++;
      }
    }
  }
}

const ranked = [...records.values()].sort((a,b) => b.pinned - a.pinned || b.frequency - a.frequency ||
  (a.word < b.word ? -1 : 1));
const counts = {books:books.length, tokens, writtenForms:written.size, headwords:headwords.length,
  curated:lexicon.length, entries:ranked.length};
const manifest = {counts, pageSize:1024, methods:{}};
const byMethod = Object.fromEntries(methods.map(({id}) => [id, new Map()]));
// Nearby Standard values share a row page. Most Standard queries need only one.
for (const item of ranked) item.totals = calculate(item.word).totals;
const dictionary = [...ranked].sort((a, b) => a.totals.standard - b.totals.standard);
const rows = dictionary.map((item, index) => {
  item.index = index;
  let {word, frequency, pinned, gloss, lemmas} = item;
  if (!pinned && lemmas.size) {
    const [main] = [...lemmas].sort(([a, n], [b, m]) => m - n || a - b)[0];
    gloss = glosses.get(main) || gloss;
  }
  return [word, frequency, gloss];
});
for (const {index, totals} of ranked) {
  for (const [method, value] of Object.entries(totals)) {
    const indexByValue = byMethod[method];
    if (!indexByValue.has(value)) indexByValue.set(value, []);
    indexByValue.get(value).push(index);
  }
}

await mkdir(output, {recursive:true});
let raw = 0, gzip = 0, files = 0;
async function save(name, value) {
  const data = JSON.stringify(value) + '\n';
  await writeFile(new URL(name + '.json', output), data);
  raw += Buffer.byteLength(data);
  gzip += gzipSync(data).length;
  files++;
}
for (let i = 0; i < rows.length; i += manifest.pageSize) {
  await save('rows-' + i / manifest.pageSize, rows.slice(i, i + manifest.pageSize));
}
// Each method lists the upper value bound of each shard. Keep common values together
// and store gaps between ranked row IDs to reduce posting sizes.
for (const {id} of methods) {
  const bounds = manifest.methods[id] = [];
  let shard = {}, size = 0;
  for (const [value, ids] of [...byMethod[id]].sort(([a],[b]) => a - b)) {
    if (size && size + ids.length > 2048) {
      await save(id + '-' + bounds.length, shard);
      bounds.push(Number(Object.keys(shard).at(-1)));
      shard = {};
      size = 0;
    }
    shard[value] = ids.map((row, i) => i ? row - ids[i - 1] : row);
    size += ids.length;
  }
  await save(id + '-' + bounds.length, shard);
  bounds.push(Number(Object.keys(shard).at(-1)));
}
await save('manifest', manifest);
console.log({...counts, files, raw, gzip});
