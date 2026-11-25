import { createDeck, evaluateFact, facts } from './facts.mjs';

const byId = id => document.getElementById(id);
function element(tag, text, css) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (css) el.className = css;
  return el;
}
function he(text) {
  const word = element('bdi', text);
  word.lang = 'he';
  word.dir = 'rtl';
  return word;
}

// Keep each Hebrew operand isolated within the left-to-right arithmetic.
function expression(label) {
  const span = element('span');
  for (const part of label.split(/([א-ת]+)/u)) {
    if (part) span.append(/[א-ת]/u.test(part) ? he(part) : part);
  }
  return span;
}

function equationsBlock(equations) {
  const block = element('div', undefined, 'fact-equations');
  for (const { terms, method, mirror } of equations) {
    if (method !== 'standard') block.append(element('small', method === 'gadol' ? 'Mispar Gadol' : 'Atbash'));
    const line = element('div', undefined, 'fact-equation');
    for (const [i, item] of terms.entries()) {
      if (i) line.append(element('span', mirror ? '→' : '=', 'fact-op'));
      line.append(expression(item.label));
    }
    line.append(element('span', '=', 'fact-op'), element('strong', terms[0].value));
    block.append(line);
    for (const item of terms) {
      if (item.arithmetic) block.append(element('p', item.arithmetic + ' = ' + item.value, 'fact-arithmetic'));
    }
  }
  return block;
}

function wordProof(rows) {
  const list = element('ol', undefined, 'fact-proof');
  for (const { word, method, letters, totals } of rows) {
    const row = element('li');
    const head = element('div', undefined, 'proof-head');
    const label = element('strong');
    label.append(he(word));
    head.append(label, element('span', '= ' + totals[method]));
    if (method !== 'standard') head.append(element('small', method === 'gadol' ? 'Gadol' : 'Atbash'));
    const breakdown = element('div', undefined, 'proof-letters');
    breakdown.dir = 'rtl';
    for (const [i, letter] of letters.entries()) {
      if (i) breakdown.append(element('span', '+', 'proof-plus'));
      const tile = element('span', undefined, 'proof-letter');
      tile.append(he(method === 'atbash' ? letter.char + ' ← ' + letter.mirror : letter.char),
        element('small', letter.values[method]));
      breakdown.append(tile);
    }
    row.append(head, breakdown);
    list.append(row);
  }
  return list;
}

function details(summary, ...children) {
  const box = element('details', undefined, 'fact-details');
  box.append(element('summary', summary), ...children);
  return box;
}

function piBlock(fact, pi) {
  const block = element('div', undefined, 'pi-block');
  const reference = String(Math.PI);
  let match = 0;
  while (pi.mantissa[match] === reference[match]) match++;
  const comparison = element('div', undefined, 'pi-comparison');
  function digitsLine(label, digits, scaled) {
    const line = element('div');
    line.append(element('small', label), element('mark', digits.slice(0, match)), digits.slice(match, 11) + '…');
    if (scaled) {
      const scale = element('span', ' × 10');
      scale.append(element('sup', pi.exponent));
      line.append(scale);
    }
    return line;
  }
  comparison.append(digitsLine('Verse ratio', pi.mantissa, true), digitsLine('π', reference, false));
  const counts = element('p', pi.letters + ' letters · ' + pi.words + ' words · Sum ' + pi.total, 'pi-counts');
  const verse = element('div', undefined, 'pi-verse');
  verse.append(he(fact.main));
  block.append(verse, counts, comparison);
  return block;
}

function piProof(pi, proof) {
  const error = (Number(pi.mantissa) - Math.PI) / Math.PI;
  const formula = element('p', 'Multiply the letter count by the product of the letter values. Divide by the word count times the product of the word values.');
  const steps = element('dl', undefined, 'pi-steps');
  const [integer, fraction] = pi.decimal.split('.');
  for (const [label, value] of [
    ['Word values', pi.wordValues.join(' + ') + ' = ' + pi.total],
    ['Product of letter values', pi.letterProduct.toString()],
    ['Product of word values', pi.wordProduct.toString()],
    ['(' + pi.letters + ' × letter product) ÷ (' + pi.words + ' × word product)', integer + '.' + fraction.slice(0, 4) + '…'],
  ]) steps.append(element('dt', label), element('dd', value));
  const accuracy = element('p', 'After scaling, the first five significant digits match. The verse figure is about ' +
    (Math.abs(error) * 100).toFixed(4) + '% below π (relative error ' + (error * 1e5).toFixed(3) + ' × 10⁻⁵).');
  return [element('h3', 'How the ratio is calculated'), formula, steps, accuracy,
    details('Letter-by-letter proof', wordProof(proof))];
}

function digitSummary({ verse, torah, longFirst, shortFirst }) {
  const block = element('div', undefined, 'pi-block');
  const verseLine = element('div', undefined, 'pi-verse');
  verseLine.append(he(verse.word));
  block.append(verseLine, element('p', 'Genesis 1:1 · ' + verse.words.length + ' words · ' +
    verse.letters.length + ' letters', 'pi-counts'));
  for (const [label, method, prefix] of [['Standard', 'standard', longFirst], ['Katan', 'katan', shortFirst]]) {
    const row = element('p', undefined, 'pi-prefix');
    row.append(element('strong', label + ' · '), he(torah.word), ' (Torah) = ' + torah.totals[method],
      element('br'), 'First ' + prefix.end + ' digits sum to ', element('strong', prefix.sum),
      '. Verse value: ' + verse.totals[method] + '.');
    block.append(row);
  }
  return block;
}

function digitProof({ verse, shortFirst, longLast, longFirst, shortLast, full, shifted, byWordCount, squareSum }) {
  const heading = element('h3', 'Two ways to split the first ' + full.end + ' decimals');
  const intro = element('p', 'Position 1 is the first digit after the decimal point in π.');
  const picker = element('select');
  const label = element('label', 'Split order ', 'pi-split');
  label.append(picker);
  const splits = [[shortFirst, longLast], [longFirst, shortLast]];
  for (const pair of splits) {
    picker.append(element('option', pair.map(part => part.digits.length).join(' + ') + ' = ' + full.end + ' digits'));
  }
  const legend = element('div', undefined, 'pi-legend');
  legend.setAttribute('aria-live', 'polite');
  const digits = element('div', undefined, 'pi-digits');
  digits.tabIndex = 0;
  digits.setAttribute('role', 'region');
  digits.setAttribute('aria-label', 'First ' + full.end + ' decimal digits of pi');
  function showSplit() {
    legend.replaceChildren();
    digits.replaceChildren();
    for (const part of splits[picker.selectedIndex]) {
      const color = part.digits.length === shortFirst.digits.length ? 'pi-short' : 'pi-long';
      legend.append(element('span', 'Digits ' + part.start + '–' + part.end + ' sum to ' + part.sum, color));
      digits.append(element('span', part.digits, color));
    }
    digits.scrollTop = 0;
  }
  picker.addEventListener('change', showSplit);
  showSplit();
  const total = element('p', 'Digits 1–' + full.end + ' sum to ' + full.sum + '.');
  const shift = element('p', 'Digits ' + shifted.start + '–' + shifted.end + ' also sum to ' + shifted.sum +
    '. Slide that window one place right: digit ' + shifted.start + ' (' + shifted.digits[0] +
    ') drops out and digit ' + full.end + ' (' + full.digits.at(-1) + ') enters. The sum stays the same.');
  const bonus = element('ul', undefined, 'pi-bonus');
  bonus.append(element('li', 'Add the first ' + byWordCount.end + ' digits: ' + [...byWordCount.digits].join(' + ') +
    ' = ' + byWordCount.sum + '. This matches the verse’s ' + verse.words.length + ' words and ' +
    verse.letters.length + ' letters.'),
    element('li', 'Square each of the first ' + verse.totals.katan + ' digits, then add the squares: ' + squareSum + '.'));
  return [heading, intro, label, legend, digits, total, element('h3', 'Why the shifted window matches'), shift,
    element('h3', 'Two more sums'), bonus];
}

export function setupFactCard(loadPhrase) {
  const deck = createDeck();
  const dialog = byId('fact-card');
  const title = byId('fact-title');
  const body = byId('fact-body');
  const random = byId('fact-open');
  let current;
  function show(preferred) {
    current = deck.draw(preferred);
    const { equations, proof, pi, digitSums } = evaluateFact(current);
    const featured = Boolean(pi || digitSums);
    dialog.classList.toggle('featured', featured);
    byId('fact-kind').textContent = featured ? 'Featured · Genesis 1:1' : 'Random fact';
    title.textContent = current.title;
    const note = element('p', current.note, 'fact-note');
    if (digitSums) body.replaceChildren(digitSummary(digitSums), ...digitProof(digitSums), note,
      details('Standard letter values', wordProof(proof)));
    else if (pi) body.replaceChildren(piBlock(current, pi), note, ...piProof(pi, proof));
    else body.replaceChildren(equationsBlock(equations), note, element('h3', 'Letter-by-letter proof'), wordProof(proof));
    if (current.sources) {
      const links = element('div', undefined, 'fact-sources');
      for (const [label, href] of current.sources) {
        const link = element('a', label);
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener';
        links.append(link);
      }
      body.append(links);
    }
    const hash = '#fact=' + current.id;
    if (location.hash !== hash) history.replaceState(history.state, '', hash);
    if (!dialog.open) {
      dialog.showModal();
      title.focus({ preventScroll: true });
    } else byId('fact-status').textContent = current.title;
    body.scrollTop = 0;
  }
  function dismiss() {
    dialog.close();
    if (location.hash.startsWith('#fact=')) history.replaceState(history.state, '', location.pathname + location.search);
    byId('fact-status').textContent = '';
    random.focus();
  }
  function followLink() {
    const fact = facts.find(item => location.hash === '#fact=' + item.id);
    if (fact) show(fact);
    else if (dialog.open) dismiss();
  }
  random.addEventListener('click', () => show());
  byId('fact-next').addEventListener('click', () => show());
  byId('fact-close').addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  byId('fact-load').addEventListener('click', () => {
    dismiss();
    loadPhrase(current.main);
  });
  window.addEventListener('hashchange', followLink);
  followLink();
}
