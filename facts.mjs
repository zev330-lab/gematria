import { calculate } from './gematria.mjs';

const equal = (...terms) => ({ type: 'equal', terms });
const value = word => ({ type: 'value', word });
const sum = (...parts) => ({ type: 'sum', parts });
const sefaria = (label, path) => [label, 'https://www.sefaria.org/' + path];

export const genesis = 'בראשית ברא אלהים את השמים ואת הארץ';
// Position 1 is the first decimal place of π.
export const piDecimals =
  '1415926535897932384626433832795028841971693993751058209749445923078164' +
  '0628620899862803482534211706798214808651328230664709384460955058223172' +
  '5359408128481117450284102701938521105559644622948954930381964428810975' +
  '6659334461284756482337867831652712019091456485669234603486104543266482' +
  '1339360726024914127372458700660631558817488152092096282925409171536436' +
  '7892590360011330530548820466521384146951941511609433057270365759591953' +
  '0921861173819326117931051185480744623799627495673518857527248912279381' +
  '8301194912983367336244065664308602139494639522473719070217986094370277' +
  '0539217176293176752384674818467669405132000568127145263560827785771342' +
  '7577896091736371787214684409012249534301465495853710507922796892589235';

// Numbers in expressions are operands from the teaching. Hebrew totals come from calculate().
export const facts = [
  { id: 'wine-secret', title: 'Wine and a secret', main: 'יין', claims: [equal('יין', 'סוד')],
    note: '“When wine goes in, secrets come out.” The Talmud connects wine (yayin) with a secret (sod) through their shared value.',
    sources: [sefaria('Sanhedrin 38a', 'Sanhedrin.38a')] },
  { id: 'love-one', title: 'Love and oneness', main: 'אהבה', claims: [equal('אהבה', 'אחד'), equal(sum('אהבה', 'אחד'), 'יהוה')],
    note: 'A traditional teaching pairs love (ahavah) with one (echad). Together they have the value of the four-letter Divine Name.' },
  { id: 'life', title: 'A gift of life', main: 'חי', claims: [value('חי')],
    note: 'Chai means “alive.” The custom of giving gifts in multiples of its value turns an amount of money into a wish for life.' },
  { id: 'messiah-serpent', title: 'The Messiah and the serpent', main: 'משיח', claims: [equal('משיח', 'נחש')],
    note: 'A classic Kabbalistic teaching pairs Mashiach, the Messiah, with nachash, the serpent. The redeemer overturns the harm associated with the serpent.' },
  { id: 'accuser', title: 'A day without accusation', main: 'השטן', claims: [equal('השטן', { type: 'difference', whole: 365, less: 1 })],
    note: 'The Talmud reads ha-satan, “the accuser,” against a solar year counted as 365 days. In this teaching, Yom Kippur is the one day on which he cannot accuse.',
    sources: [sefaria('Yoma 20a', 'Yoma.20a')] },
  { id: 'torah', title: 'The commandments at Sinai', main: 'תורה', claims: [value('תורה'), sum('תורה', 2)],
    note: 'In the Talmud’s account, Moses transmitted the commandments counted by the value of Torah. Israel heard the first two directly from God.',
    sources: [sefaria('Makkot 23b–24a', 'Makkot.23b')] },
  { id: 'tzitzit', title: 'A reminder in the fringes', main: 'ציצית', claims: [value('ציצית'), sum('ציצית', 8, 5)],
    note: 'Rashi adds the eight thread ends and five knots of a tassel to the value of tzitzit. Together they recall the commandments.',
    sources: [sefaria('Rashi on Numbers 15:39', 'Rashi_on_Numbers.15.39')] },
  { id: 'nature', title: 'A Divine Name and nature', main: 'אלהים', claims: [equal('אלהים', 'הטבע')],
    note: 'A popular Kabbalistic and Chassidic teaching connects Elohim, a name of God, with ha-teva, “nature,” finding divine presence in the natural world.' },
  { id: 'light', title: 'Light and mystery', main: 'אור', claims: [equal('אור', 'רז')],
    note: 'A Kabbalistic observation pairs or, “light,” with raz, “mystery.” The words for illumination and for something hidden have the same value.' },
  { id: 'humility', title: 'What are we?', main: 'אדם', claims: [equal('אדם', 'מה')],
    note: 'A popular teaching connects adam, “human being,” with mah, “what?” It recalls the humble question of Moses and Aaron in Exodus 16:7, “What are we?”' },
  { id: 'amen', title: 'Two names in one amen', main: 'אמן', claims: [equal('אמן', sum('יהוה', 'אדני'), 'מלאך')],
    note: 'Kabbalistic tradition hears two Divine Names in amen. Their combined value also equals that of malakh, “angel.”' },
  { id: 'ladder', title: 'Jacob’s ladder and Sinai', main: 'סלם', claims: [equal('סלם', 'סיני')],
    note: 'Genesis 28:12 spells sulam, “ladder,” without a vav. The Midrash identifies Jacob’s ladder with Sinai, and this spelling gives them the same value.',
    sources: [sefaria('Bereshit Rabbah 68:12', 'Bereshit_Rabbah.68.12')] },
  { id: 'high-holidays', title: 'Fast, voice, and money', main: 'צום', claims: [equal('צום', 'קול', 'ממון')],
    note: 'In the High Holiday prayer-book tradition, fasting, raising one’s voice in prayer, and giving money to charity are linked by these three equal words.' },
  { id: 'soul-heavens', title: 'The soul and the heavens', main: 'נשמה', claims: [equal('נשמה', 'השמים')],
    note: 'A popular observation pairs neshamah, “soul,” with ha-shamayim, “the heavens.” The latter spelling appears in the opening verse of Genesis.' },
  { id: 'blessing', title: 'Two words for one value', main: 'זכר', claims: [equal('זכר', 'ברכה')],
    note: 'A popular observation pairs zakhar, “male,” with berakhah, “blessing,” on the strength of their letter values.' },
  { id: 'noah', title: 'Noah finds grace', main: 'נח', claims: [equal('נח', 'חן')],
    note: 'Genesis says Noah found grace. Read the two letters of Noach in reverse and they spell chen, the very word for grace used in the verse.',
    sources: [sefaria('Genesis 6:8', 'Genesis.6.8')] },
  { id: 'delight', title: 'Delight and affliction', main: 'ענג', claims: [equal('ענג', 'נגע')],
    note: 'Sefer Yetzirah contrasts the height of delight (oneg) with the depth of affliction (nega). Rearranging the same three letters takes you from one to the other.',
    sources: [sefaria('Sefer Yetzirah 2:4', 'Sefer_Yetzirah.2.4')] },
  { id: 'family', title: 'Father, mother, child', main: 'ילד', claims: [equal(sum('אב', 'אם'), 'ילד')],
    note: 'A popular observation adds av, “father,” to em, “mother.” Their values add up to yeled, “child.”' },
  { id: 'jacob', title: 'Sevenfold Jacob', main: 'יעקב', claims: [equal('יעקב', { type: 'multiple', factor: 7, word: 'יהוה' })],
    note: 'A popular observation finds the value of the four-letter Divine Name seven times in the value of Yaakov, “Jacob.”' },
  { id: 'place', title: 'The Place', main: 'מקום', claims: [equal('מקום', { type: 'letterSquares', word: 'יהוה' })],
    note: 'A Kabbalistic teaching associated with Pardes Rimonim explains Makom, “Place,” a name of God. Square each letter value of the four-letter Name, then add the squares.' },
  { id: 'heart', title: 'The heart of the Torah', main: 'לב', claims: [value('לב')],
    note: 'Read the Torah’s last letter (lamed in Yisrael) and then its first (bet in Bereshit). They spell lev, “heart.” Its value also recalls the paths of wisdom at the opening of Sefer Yetzirah.',
    sources: [sefaria('Sefer Yetzirah 1:1', 'Sefer_Yetzirah.1.1')] },
  { id: 'truth', title: 'The seal of truth', main: 'אמת', claims: [equal('אמת', { type: 'square', base: 21 })],
    note: 'The Talmud calls truth God’s seal. A traditional reading sees beginning, middle, and end in emet: aleph opens the alphabet, mem lies near its middle, and tav closes it.',
    sources: [sefaria('Shabbat 55a', 'Shabbat.55a')] },
  { id: 'sheshach', title: 'Babylon in a mirror', main: 'ששך', claims: [{ type: 'atbash', from: 'ששך', to: 'בבל' }],
    note: 'Rashi reads Sheshach in Jeremiah as an Atbash name for Babylon. Pair the first letter of the alphabet with the last, the second with the next-to-last, and so on.',
    sources: [sefaria('Rashi on Jeremiah 25:26', 'Rashi_on_Jeremiah.25.26')] },
  { id: 'peace', title: 'Peace and Esau', main: 'שלום', claims: [equal('שלום', 'עשו'), { type: 'value', word: 'שלום', method: 'gadol' }],
    note: 'Shalom, “peace,” and Esav, “Esau,” share a standard value, a well-known coincidence. Under Mispar Gadol the final mem in shalom takes its extended value.' },
  { id: 'year', title: 'Counting a lunar year', main: 'שנה', claims: [value('שנה')],
    note: 'A popular observation compares shanah, “year,” with twelve lunar months, which last about 354 days. The two figures are close.' },
  { id: 'israel', title: 'The letters of Israel', main: 'ישראל', claims: [value('ישראל')],
    note: 'The name Yisrael has five letters. Its largest contribution comes from shin, the second letter of the name.' },
  { id: 'genesis-pi', title: 'Pi in Genesis', main: genesis, claims: [{ type: 'verseRatio' }],
    note: 'A famous numerical curiosity popularised by Vernon Jenkins. The formula was chosen after the fact and the power of ten is ignored, so mathematicians treat it as a coincidence — but the arithmetic is real.',
    sources: [['Vernon Jenkins’ calculation', 'https://www.biblewheel.com/resources/Vernon_Jenkins/whatabeginning/ASPECTS/Pi_evaluation.htm'],
      ['A skeptical view', 'https://skeptics.stackexchange.com/questions/44376']] },
  { id: 'genesis-pi-digits', title: "Pi's digits and the first verse", main: genesis, claims: [{ type: 'piDigitSums' }],
    note: 'A numerical curiosity popularised by Oren Evron and shared widely (e.g. by Rabbi Dov Ber on Instagram). Digit sums of pi behave almost randomly, and with many possible numbers to try some matches are expected — but every sum here is real and you can check it.',
    sources: [['Daf Yomi · Torah numerology', 'https://www.dafyomi.co.il/general/info/torahau/torah_numerology.php?d=5'],
      ['Haim Shore on Evron’s findings', 'https://haimshore.blog/2020/01/17/linkage-between-torah-first-verse-and-pi-some-of-evrons-findings/'],
      ['Rabbi Dov Ber’s video', 'https://www.instagram.com/reel/DgFyAMNoK7l/']] },
];

const sumOf = numbers => numbers.reduce((total, n) => total + n, 0);
const productOf = numbers => numbers.reduce((total, n) => total * BigInt(n), 1n);

function piDigitSums(verse, torah) {
  const { standard, katan } = torah.totals;
  const end = standard + katan;
  function window(start, end) {
    const digits = piDecimals.slice(start - 1, end);
    return { start, end, digits, sum: sumOf(Array.from(digits, Number)) };
  }
  const squaredDigits = Array.from(piDecimals.slice(0, verse.totals.katan), Number);
  return { verse, torah, full: window(1, end),
    shortFirst: window(1, katan), longLast: window(katan + 1, end),
    longFirst: window(1, standard), shortLast: window(standard + 1, end),
    shifted: window(katan, end - 1), byWordCount: window(1, verse.words.length),
    squareSum: sumOf(squaredDigits.map(digit => digit ** 2)) };
}

function verseRatio(letterValues, wordValues) {
  const letters = letterValues.length;
  const words = wordValues.length;
  const letterProduct = productOf(letterValues);
  const wordProduct = productOf(wordValues);
  const numerator = BigInt(letters) * letterProduct;
  const denominator = BigInt(words) * wordProduct;
  const integer = String(numerator / denominator);
  const fraction = String(numerator % denominator * 10n ** 12n / denominator).padStart(12, '0');
  const digits = integer + fraction;
  return { letters, words, letterProduct, wordProduct, wordValues, total: sumOf(wordValues),
    decimal: integer + '.' + fraction, exponent: integer.length - 1,
    mantissa: digits[0] + '.' + digits.slice(1, 14) };
}

// Each equation term carries its typeset expression and its independently evaluated value.
function term(label, value, arithmetic) { return { label, value, arithmetic }; }

export function evaluateFact(fact) {
  const proof = new Map();
  function read(word, method = 'standard') {
    const key = method + ':' + word;
    if (!proof.has(key)) proof.set(key, { word, method, ...calculate(word) });
    return proof.get(key);
  }
  function evaluate(part, method = 'standard') {
    if (typeof part === 'string') return term(part, read(part, method).totals[method]);
    if (typeof part === 'number') return term(String(part), part);
    switch (part.type) {
      case 'sum': {
        const parts = part.parts.map(item => evaluate(item, method));
        const values = parts.map(item => item.value);
        return term(parts.map(item => item.label).join(' + '), sumOf(values), values.join(' + '));
      }
      case 'difference': return term(part.whole + ' − ' + part.less, part.whole - part.less);
      case 'multiple': {
        const value = evaluate(part.word, method).value;
        return term(part.factor + ' × ' + part.word, part.factor * value, part.factor + ' × ' + value);
      }
      case 'square': return term(part.base + '²', part.base ** 2);
      case 'letterSquares': {
        const values = read(part.word, method).letters.map(letter => letter.values[method]);
        return term(values.map(n => n + '²').join(' + '), sumOf(values.map(n => n ** 2)));
      }
      default: throw new Error('Unknown term ' + part.type);
    }
  }
  let pi;
  let digitSums;
  const equations = [];
  for (const claim of fact.claims) {
    const method = claim.method ?? 'standard';
    if (claim.type === 'verseRatio') {
      const verse = calculate(fact.main);
      for (const word of verse.words) read(word.text);
      pi = verseRatio(verse.letters.map(l => l.values.standard), verse.words.map(w => w.totals.standard));
    } else if (claim.type === 'piDigitSums') {
      digitSums = piDigitSums(read(fact.main), read('תורה'));
    } else if (claim.type === 'atbash') {
      const source = read(claim.from, 'atbash');
      equations.push({ method: 'atbash', mirror: source.atbash, terms: [
        term(claim.from, source.totals.atbash), evaluate(claim.to)] });
    } else if (['equal', 'value', 'sum'].includes(claim.type)) {
      const parts = claim.terms ?? [claim.type === 'value' ? claim.word : claim];
      equations.push({ method, terms: parts.map(part => evaluate(part, method)) });
    } else throw new Error('Unknown claim ' + claim.type);
  }
  return { equations, proof: [...proof.values()], pi, digitSums };
}

export function createDeck() {
  let remaining = [];
  let last;
  return {
    draw(preferred) {
      if (!remaining.length) {
        remaining = [...facts];
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        if (remaining.at(-1) === last) {
          const end = remaining.length - 1;
          [remaining[0], remaining[end]] = [remaining[end], remaining[0]];
        }
      }
      if (preferred) {
        const index = remaining.indexOf(preferred);
        if (index >= 0) remaining.splice(index, 1);
        last = preferred;
      } else last = remaining.pop();
      return last;
    },
  };
}
