const test = require('node:test');
const assert = require('node:assert');
const { TABLES, buildPool, isCorrect, toKatakana } = require('./kana.js');

test('글자 수: 청음 46, 탁음·반탁음 25, 요음 33', () => {
  assert.strictEqual(buildPool({ seion: true }).length, 46);
  assert.strictEqual(buildPool({ daku: true }).length, 25);
  assert.strictEqual(buildPool({ yoon: true }).length, 33);
  assert.strictEqual(buildPool({ seion: true, daku: true, yoon: true }).length, 104);
  assert.strictEqual(buildPool({}).length, 0);
});

test('표의 각 행은 열 수와 같다', () => {
  for (const t of Object.values(TABLES)) {
    for (const row of t.rows) assert.strictEqual(row.length, t.cols, JSON.stringify(row));
  }
});

test('가타가나 변환', () => {
  assert.strictEqual(toKatakana('あ'), 'ア');
  assert.strictEqual(toKatakana('きゃ'), 'キャ');
  assert.strictEqual(toKatakana('ん'), 'ン');
});

test('정답 판정: 헵번식·훈령식·대소문자·공백', () => {
  const find = (h) => buildPool({ seion: true, daku: true, yoon: true }).find((k) => k.hira === h);
  assert.ok(isCorrect(find('し'), 'shi'));
  assert.ok(isCorrect(find('し'), 'si'));
  assert.ok(isCorrect(find('つ'), ' TU '));
  assert.ok(isCorrect(find('を'), 'o'));
  assert.ok(isCorrect(find('を'), 'wo'));
  assert.ok(isCorrect(find('ん'), 'nn'));
  assert.ok(isCorrect(find('ぢ'), 'di'));
  assert.ok(isCorrect(find('しゃ'), 'sya'));
  assert.ok(isCorrect(find('ちゃ'), 'cha'));
  assert.ok(isCorrect(find('じゅ'), 'zyu'));
  assert.ok(!isCorrect(find('し'), 'chi'));
  assert.ok(!isCorrect(find('か'), ''));
});

test('정답 판정: 한글', () => {
  const find = (h) => buildPool({ seion: true, daku: true, yoon: true }).find((k) => k.hira === h);
  assert.ok(isCorrect(find('か'), '카'));
  assert.ok(isCorrect(find('か'), '가'));
  assert.ok(isCorrect(find('つ'), ' 쓰 '));
  assert.ok(isCorrect(find('ん'), '응'));
  assert.ok(isCorrect(find('しゃ'), '샤'));
  assert.ok(!isCorrect(find('し'), '치'));
  assert.strictEqual(find('つ').korean, '츠');
});

test('모든 글자에 한글 발음이 있다', () => {
  for (const k of buildPool({ seion: true, daku: true, yoon: true })) assert.ok(k.korean, k.hira);
});

test('표시용 로마자는 헵번식', () => {
  const find = (h) => buildPool({ seion: true, yoon: true }).find((k) => k.hira === h);
  assert.strictEqual(find('ふ').romaji, 'fu');
  assert.strictEqual(find('しょ').romaji, 'sho');
});
