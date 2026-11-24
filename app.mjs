import { alphabet, calculate, finals, methods } from './gematria.mjs';
import { lexicon } from './lexicon.mjs';

const $ = id => document.getElementById(id);
const input = $('phrase');
const historyKey = 'gematria-history';
const index = new Map();
for (const entry of lexicon) {
  const { standard } = calculate(entry.word).totals;
  if (!index.has(standard)) index.set(standard, []);
  index.get(standard).push(entry);
}
let selected = 'standard';
let result;
let historyTimer;
let dirty = false;
let entries = [];
try {
  const stored = JSON.parse(localStorage.getItem(historyKey));
  if (Array.isArray(stored)) entries = stored.filter(value => typeof value === 'string').slice(0, 12);
} catch { /* Storage may be unavailable in private browsing. */ }

function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function hebrew(el) {
  el.lang = 'he';
  el.dir = 'rtl';
  return el;
}
function persist() {
  try { localStorage.setItem(historyKey, JSON.stringify(entries)); } catch { /* Keep session history in memory. */ }
}
function remember() {
  clearTimeout(historyTimer);
  if (!dirty) return;
  dirty = false;
  const value = input.value.trim();
  if (!value || !(result.letters.length || result.english.length)) return;
  entries = [value, ...entries.filter(entry => entry !== value)].slice(0, 12);
  persist();
}
function replaceInput(value) {
  remember();
  input.value = value;
  changed();
  remember();
}
function changed() {
  result = calculate(input.value);
  render();
  dirty = true;
  clearTimeout(historyTimer);
  historyTimer = setTimeout(remember, 1200);
}
function createMethod(method) {
  const button = node('button', undefined, 'method');
  button.dataset.method = method.id;
  const detail = node('span');
  detail.append(node('span', method.name, 'method-name'), node('small', method.description));
  if (method.id === 'atbash') {
    const mirror = hebrew(node('bdi', '', 'mirrored'));
    mirror.id = 'atbash-word';
    detail.append(mirror);
  }
  const value = node('span', '', 'method-value');
  button.append(node('span', '', 'radio'), detail, value);
  button.addEventListener('click', () => {
    selected = method.id;
    render();
  });
  $('methods').append(button);
  return { button, value, method };
}
const methodRows = methods.map(createMethod);

function renderMatches() {
  const container = $('matches');
  const phrase = result.words.map(word => word.text).join(' ');
  const matches = (index.get(result.totals.standard) ?? []).filter(entry => entry.word !== phrase);
  container.replaceChildren();
  if (!matches.length) {
    container.append(node('p', phrase ? 'No other entries in the word list share this value.' : 'Enter a Hebrew word to find a match.', 'empty'));
  }
  for (const { word, gloss } of matches) {
    const row = node('button', undefined, 'match-row');
    row.append(node('small', gloss), hebrew(node('b', word)));
    row.addEventListener('click', () => replaceInput(word));
    container.append(row);
  }
}
function render() {
  const method = methods.find(item => item.id === selected);
  $('total').textContent = result.totals[selected];
  $('result-method').textContent = method.name;
  $('result-label').textContent = method.label;
  $('clear').hidden = !input.value;
  $('letter-count').textContent = result.letters.length + (result.letters.length === 1 ? ' letter' : ' letters');
  $('break-method').textContent = method.name + ' · ' + method.label;
  for (const row of methodRows) {
    row.button.setAttribute('aria-pressed', row.method.id === selected);
    row.value.textContent = result.totals[row.method.id];
  }
  $('atbash-word').textContent = result.atbash;
  const tiles = document.createDocumentFragment();
  for (const { char, mirror, values } of result.letters) {
    const tile = node('div', undefined, 'tile');
    tile.append(hebrew(node('span', selected === 'atbash' ? char + ' ← ' + mirror : char)), node('small', values[selected]));
    tiles.append(tile);
  }
  $('tiles').replaceChildren(tiles);
  if (!result.letters.length) $('tiles').append(node('p', 'Hebrew letters will appear here.', 'empty'));
  $('equation').replaceChildren(node('span', result.letters.map(letter => letter.values[selected]).join(' + ') || 'Sum'), node('strong', '= ' + result.totals[selected]));
  const subtotals = $('word-totals');
  subtotals.replaceChildren();
  subtotals.hidden = result.words.length < 2;
  if (!subtotals.hidden) {
    subtotals.append(node('span', 'Word subtotals'));
    for (const word of result.words) {
      const row = node('div', undefined, 'word-row');
      row.append(hebrew(node('b', word.text)), node('span', word.totals[selected]));
      subtotals.append(row);
    }
  }
  $('english').hidden = !result.english.length;
  if (result.english.length) {
    $('english').replaceChildren(node('strong', 'English ordinal · ' + result.englishTotal),
      node('p', 'A = 1 through Z = 26. Latin letters are counted separately from Hebrew.'),
      node('p', result.english.map(({ char, value }) => char.toUpperCase() + ' ' + value).join(' · ')));
  }
  renderMatches();
}

input.addEventListener('input', changed);
input.addEventListener('blur', remember);
window.addEventListener('pagehide', remember);
$('clear').addEventListener('click', () => {
  replaceInput('');
  input.focus();
});
for (const button of document.querySelectorAll('.examples button')) {
  button.addEventListener('click', () => replaceInput(button.textContent));
}

function keyboardEdit(char) {
  let start = input.selectionStart;
  const end = input.selectionEnd;
  if (!char && start === end && start) {
    const previous = [...input.value.slice(0, start)].pop();
    start -= previous.length;
  }
  input.setRangeText(char, start, end, 'end');
  input.focus({ preventScroll: true });
  changed();
}
for (const key of [...alphabet, ...finals, 'Space', 'Backspace']) {
  const wide = key.length > 1;
  const button = node('button', key, wide ? 'wide' : '');
  if (!wide) hebrew(button);
  button.addEventListener('pointerdown', event => event.preventDefault());
  button.addEventListener('click', () => keyboardEdit(key === 'Backspace' ? '' : key === 'Space' ? ' ' : key));
  $('keyboard').append(button);
}
$('keyboard-toggle').addEventListener('click', () => {
  const keyboard = $('keyboard');
  keyboard.hidden = !keyboard.hidden;
  input.inputMode = keyboard.hidden ? 'text' : 'none';
  $('keyboard-toggle').setAttribute('aria-expanded', !keyboard.hidden);
});

function renderHistory() {
  const list = $('history-list');
  list.replaceChildren();
  if (!entries.length) list.append(node('p', 'Your recent calculations will appear here.', 'empty'));
  for (const text of entries) {
    const row = node('button', undefined, 'history-entry');
    const item = calculate(text);
    const title = node('b', text);
    title.dir = 'auto';
    row.append(title, node('span', item.letters.length ? item.totals.standard : item.englishTotal));
    row.addEventListener('click', () => {
      replaceInput(text);
      $('history').close();
    });
    list.append(row);
  }
  $('history-clear').hidden = !entries.length;
}
$('history-open').addEventListener('click', () => {
  remember();
  renderHistory();
  $('history').showModal();
});
$('history-close').addEventListener('click', () => $('history').close());
$('history-clear').addEventListener('click', () => {
  entries = [];
  persist();
  renderHistory();
});
let feedbackTimer;
$('copy').addEventListener('click', async () => {
  const method = methods.find(item => item.id === selected);
  let text = input.value.trim() + ' · ' + method.name + ' = ' + result.totals[selected];
  if (selected === 'atbash' && result.atbash) text += ' (' + result.atbash + ')';
  if (result.english.length) text += '\nEnglish ordinal = ' + result.englishTotal;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch (error) { if (error.name === 'AbortError') return; }
    }
    window.prompt('Copy your result', text);
    return;
  }
  const label = $('copy').lastChild;
  label.textContent = 'Copied';
  $('status').textContent = 'Result copied.';
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { label.textContent = 'Copy result'; $('status').textContent = ''; }, 1800);
});
result = calculate(input.value);
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
