export const alphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
export const finals = 'ךםןףץ';
const regular = 'כמנפצ';
const standardValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400];

export const methods = [
  { id: 'standard', name: 'Mispar Hechrachi', label: 'Standard value', description: 'Traditional letter values, from 1 to 400.' },
  { id: 'gadol', name: 'Mispar Gadol', label: 'Extended value', description: 'Final letters take values from 500 to 900.' },
  { id: 'katan', name: 'Mispar Katan', label: 'Reduced value', description: 'Drop the zeros from each standard letter value.' },
  { id: 'ordinal', name: 'Mispar Siduri', label: 'Ordinal value', description: 'Each letter’s alphabet position, from 1 to 22.' },
  { id: 'atbash', name: 'Atbash', label: 'Atbash value', description: 'Reverse the alphabet, then add the standard values.' },
];

// Only Hebrew letters enter the Hebrew tables. A maqaf separates word subtotals.
export function calculate(input) {
  const text = input.normalize('NFKD');
  const words = [];
  const zeroTotals = Object.fromEntries(methods.map(({ id }) => [id, 0]));
  const totals = { ...zeroTotals };
  const letters = [];
  const english = [];
  for (const token of text.split(/[\s\u05be]+/u)) {
    const word = { text: '', atbash: '', totals: { ...zeroTotals } };
    for (const char of token) {
      if (/[a-z]/i.test(char)) {
        english.push({ char, value: char.toUpperCase().charCodeAt(0) - 64 });
        continue;
      }
      const finalIndex = finals.indexOf(char);
      const index = alphabet.indexOf(finalIndex < 0 ? char : regular[finalIndex]);
      if (index < 0) continue;
      const standard = standardValues[index];
      const mirrored = alphabet.length - 1 - index;
      const values = {
        standard, gadol: finalIndex < 0 ? standard : 500 + finalIndex * 100,
        katan: Number(String(standard)[0]), ordinal: index + 1, atbash: standardValues[mirrored],
      };
      letters.push({ char, mirror: alphabet[mirrored], values });
      word.text += char;
      word.atbash += alphabet[mirrored];
      for (const { id } of methods) {
        word.totals[id] += values[id];
        totals[id] += values[id];
      }
    }
    if (word.text) words.push(word);
  }
  return {
    letters, words, totals, atbash: words.map(word => word.atbash).join(' '),
    english, englishTotal: english.reduce((sum, letter) => sum + letter.value, 0),
  };
}
