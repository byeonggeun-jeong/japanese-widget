const { TABLES, makeKana, buildPool, isCorrect } = window.Kana;
const app = document.getElementById('app');
const MAX_TRIES = 3;

let s; // 현재 설정
let deck = [];
let idx = 0;
let tableTab = 'seion';

// ---------- 출제 덱 ----------
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function newDeck() {
  deck = buildPool(s.groups);
  if (s.order === 'random') shuffle(deck);
  idx = 0;
}

function nextKana() {
  if (!deck.length) return null;
  if (idx >= deck.length) newDeck();
  const k = deck[idx++];
  const useKata = s.script === 'katakana' || (s.script === 'random' && Math.random() < 0.5);
  return { ...k, show: useKata ? k.kata : k.hira };
}

// ---------- 화면 ----------
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function charEl(k) {
  return el('div', k.show.length > 1 ? 'char small' : 'char', k.show);
}

function renderEmpty() {
  app.replaceChildren(el('div', 'empty', '출제 범위가 비어 있습니다.\n우클릭 → 출제 범위에서 선택하세요.'));
  app.firstChild.style.whiteSpace = 'pre-line';
}

function renderCycle() {
  const k = nextKana();
  if (!k) return renderEmpty();
  let keys = ''; // 한글 IME가 켜진 채 로마자를 쳐도 인정하도록 누른 키를 따로 기록
  let tries = 0;
  let locked = false;
  let submitAfterIme = false;

  const card = el('div', 'card');
  const answer = el('div', 'answer');
  const box = el('input', 'typebox');
  box.placeholder = '정답 입력';
  box.spellcheck = false;
  const dots = el('div', 'tries');
  for (let i = 0; i < MAX_TRIES; i++) dots.append(el('span'));
  card.append(charEl(k), answer, box, dots);
  app.replaceChildren(card);
  box.focus();
  card.addEventListener('mousedown', () => setTimeout(() => box.focus()));

  box.addEventListener('keydown', (e) => {
    if (locked) return e.preventDefault();
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      // 한글 조합 중 Enter는 조합 확정이 끝난 뒤 제출
      if (e.isComposing) submitAfterIme = true;
      else submit();
    } else if (/^Key[A-Z]$/.test(e.code) && !e.ctrlKey && !e.altKey) {
      keys += e.code.slice(3).toLowerCase();
    } else if (e.code === 'Backspace') {
      keys = keys.slice(0, -1);
    }
  });
  box.addEventListener('compositionend', () => {
    if (submitAfterIme) setTimeout(submit);
    submitAfterIme = false;
  });
  box.addEventListener('input', () => {
    box.className = 'typebox';
    if (!box.value) keys = '';
  });

  // 대기 중 모드가 바뀌었으면(카드가 사라졌으면) 다음 글자를 그리지 않는다
  const next = () => card.isConnected && renderCycle();

  function submit() {
    if (locked || !box.value.trim()) return;
    if (isCorrect(k, box.value) || isCorrect(k, keys)) {
      locked = true;
      box.className = 'typebox ok';
      setTimeout(next, 350);
      return;
    }
    tries++;
    dots.children[tries - 1].className = 'used';
    keys = '';
    box.value = '';
    box.className = 'typebox';
    void box.offsetWidth; // 흔들림 애니메이션 재시작
    box.className = 'typebox ng';
    if (tries >= MAX_TRIES) {
      locked = true;
      answer.textContent = `${k.romaji} · ${k.korean}`;
      setTimeout(next, 1500);
    }
  }
}

function renderFlash() {
  const k = nextKana();
  if (!k) return renderEmpty();
  const card = el('div', 'card flash');
  const answer = el('div', 'answer hidden', k.romaji);
  const hint = el('div', 'hint', '클릭하여 확인');
  card.append(charEl(k), answer, hint);
  app.replaceChildren(card);

  card.addEventListener('click', () => {
    if (answer.classList.contains('hidden')) {
      answer.classList.remove('hidden');
      hint.textContent = '클릭하여 다음';
    } else {
      renderFlash();
    }
  });
}

function renderTable() {
  const tabs = el('div', 'tabs');
  for (const [key, t] of Object.entries(TABLES)) {
    const b = el('button', key === tableTab ? 'on' : '', t.label);
    b.addEventListener('click', () => { tableTab = key; renderTable(); });
    tabs.append(b);
  }
  const t = TABLES[tableTab];
  const grid = el('div', 'grid');
  grid.style.gridTemplateColumns = `repeat(${t.cols}, 1fr)`;
  for (const row of t.rows) {
    for (const cell of row) {
      if (!cell) { grid.append(el('div', 'cell')); continue; }
      const k = makeKana(cell);
      const text = s.script === 'hiragana' ? k.hira : s.script === 'katakana' ? k.kata : `${k.hira} ${k.kata}`;
      const c = el('div', 'cell filled');
      c.append(el('b', '', text), el('small', '', k.romaji));
      grid.append(c);
    }
  }
  app.replaceChildren(tabs, grid);
}

function render() {
  ({ cycle: renderCycle, flash: renderFlash, table: renderTable })[s.mode]();
}

// ---------- 설정 반영 ----------
function apply(next) {
  const prev = s;
  s = next;
  document.documentElement.dataset.theme = s.theme;
  // 투명도·테마만 바뀌었으면 풀던 문제를 유지한다
  const key = (x) => JSON.stringify([x.mode, x.script, x.order, x.groups]);
  if (!prev || key(prev) !== key(s)) {
    newDeck();
    render();
  }
}

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  window.widget.showMenu();
});
window.addEventListener('focus', () => document.querySelector('.typebox')?.focus());

window.widget.onSettings(apply);
window.widget.getSettings().then(apply);
