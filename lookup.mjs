// These same-origin JSON requests begin only after a lookup has a number.
const files = new Map();
function jsonFile(name) {
  if (!files.has(name)) {
    const request = fetch(new URL('./data/words/' + name + '.json', import.meta.url)).then(response => {
      if (!response.ok) throw new Error('Could not load ' + name);
      return response.json();
    }).catch(error => {
      files.delete(name);
      throw error;
    });
    files.set(name, request);
  }
  return files.get(name);
}

export async function findRows(method, number) {
  const {methods, pageSize} = await jsonFile('manifest');
  const shard = methods[method].findIndex(upper => number <= upper);
  const groups = shard < 0 ? {} : await jsonFile(method + '-' + shard);
  let id = 0;
  const ids = (groups[number] || []).map(gap => id += gap);
  return {
    count: ids.length,
    page(start, size) {
      return Promise.all(ids.slice(start, start + size).map(async index => {
        const rows = await jsonFile('rows-' + Math.floor(index / pageSize));
        return rows[index % pageSize];
      }));
    },
  };
}

export function setupLookup(loadPhrase) {
  const byId = id => document.getElementById(id);
  const dialog = byId('find-dialog');
  const number = byId('find-number');
  const method = byId('find-method');
  const count = byId('find-count');
  const list = byId('find-results');
  const more = byId('find-more');
  const retry = byId('find-retry');
  const format = new Intl.NumberFormat('en');
  let version = 0;
  let timer;
  let matches;
  let shown = 0;

  function resultRow([word, frequency, gloss]) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    const hebrew = document.createElement('bdi');
    hebrew.lang = 'he';
    hebrew.dir = 'rtl';
    hebrew.textContent = word;
    const detail = document.createElement('span');
    detail.textContent = gloss;
    const hint = document.createElement('small');
    hint.textContent = '×' + format.format(frequency) + ' in Tanakh';
    detail.append(hint);
    button.append(detail, hebrew);
    button.addEventListener('click', () => {
      dismiss();
      loadPhrase(word);
    });
    row.append(button);
    return row;
  }
  async function nextPage(request) {
    retry.hidden = true;
    more.disabled = true;
    try {
      if (!matches) {
        const found = await findRows(method.value, Number(number.value));
        if (version !== request) return;
        matches = found;
      }
      const rows = await matches.page(shown, 24);
      if (version !== request) return;
      list.append(...rows.map(resultRow));
      shown += rows.length;
      count.textContent = matches.count ? format.format(matches.count) +
        (matches.count === 1 ? ' match' : ' matches') : 'No matches for this number.';
      more.hidden = shown >= matches.count;
      more.disabled = false;
    } catch {
      if (version !== request) return;
      count.textContent = 'Couldn’t load these words. Check your connection and try again.';
      more.hidden = true;
      retry.hidden = false;
    }
  }
  function search() {
    const request = ++version;
    clearTimeout(timer);
    matches = undefined;
    shown = 0;
    list.replaceChildren();
    byId('find-scroll').scrollTop = 0;
    more.hidden = retry.hidden = true;
    const value = number.value;
    const digits = /^\d+$/.test(value);
    const hash = '#find=' + (digits ? value : '') + (method.value === 'standard' ? '' : '&m=' + method.value);
    if (location.hash !== hash) history.replaceState(history.state, '', hash);
    if (!digits) {
      count.textContent = value ? 'Use digits 0–9.' : 'Enter a number to find matching words.';
      return;
    }
    count.textContent = 'Looking up words…';
    timer = setTimeout(() => nextPage(request), 120);
  }
  function open(value, selection) {
    number.value = value;
    method.value = selection;
    if (!method.value) method.value = 'standard';
    if (!dialog.open) dialog.showModal();
    search();
  }
  function dismiss() {
    ++version;
    clearTimeout(timer);
    dialog.close();
    if (location.hash.startsWith('#find=')) history.replaceState(history.state, '', location.pathname + location.search);
  }
  function followLink() {
    const params = new URLSearchParams(location.hash.slice(1));
    if (location.hash.startsWith('#find=')) open(params.get('find'), params.get('m') || 'standard');
    else if (dialog.open) dismiss();
  }
  byId('find-open').addEventListener('click', () => open(number.value, method.value));
  byId('find-chip').addEventListener('click', () => open(byId('phrase').value, 'standard'));
  byId('find-close').addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  number.addEventListener('input', search);
  method.addEventListener('change', search);
  more.addEventListener('click', () => nextPage(version));
  retry.addEventListener('click', () => nextPage(version));
  window.addEventListener('hashchange', followLink);
  followLink();
}
