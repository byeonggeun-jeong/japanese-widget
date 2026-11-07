// 가나 데이터. 각 칸은 [히라가나, '헵번식|대체표기...', '한글|대체표기...'] 또는 빈칸(null).
// 브라우저(window.Kana)와 Node 테스트(module.exports) 양쪽에서 사용한다.
(function () {
  const _ = null;
  const TABLES = {
    seion: {
      label: '청음',
      cols: 5,
      rows: [
        [['あ', 'a', '아'], ['い', 'i', '이'], ['う', 'u', '우'], ['え', 'e', '에'], ['お', 'o', '오']],
        [['か', 'ka', '카|가'], ['き', 'ki', '키|기'], ['く', 'ku', '쿠|구'], ['け', 'ke', '케|게'], ['こ', 'ko', '코|고']],
        [['さ', 'sa', '사'], ['し', 'shi|si', '시'], ['す', 'su', '스'], ['せ', 'se', '세'], ['そ', 'so', '소']],
        [['た', 'ta', '타|다'], ['ち', 'chi|ti', '치|지'], ['つ', 'tsu|tu', '츠|쓰|쯔'], ['て', 'te', '테|데'], ['と', 'to', '토|도']],
        [['な', 'na', '나'], ['に', 'ni', '니'], ['ぬ', 'nu', '누'], ['ね', 'ne', '네'], ['の', 'no', '노']],
        [['は', 'ha', '하'], ['ひ', 'hi', '히'], ['ふ', 'fu|hu', '후'], ['へ', 'he', '헤'], ['ほ', 'ho', '호']],
        [['ま', 'ma', '마'], ['み', 'mi', '미'], ['む', 'mu', '무'], ['め', 'me', '메'], ['も', 'mo', '모']],
        [['や', 'ya', '야'], _, ['ゆ', 'yu', '유'], _, ['よ', 'yo', '요']],
        [['ら', 'ra', '라'], ['り', 'ri', '리'], ['る', 'ru', '루'], ['れ', 're', '레'], ['ろ', 'ro', '로']],
        [['わ', 'wa', '와'], _, _, _, ['を', 'wo|o', '오|워']],
        [['ん', 'n|nn', '응|ㄴ'], _, _, _, _],
      ],
    },
    daku: {
      label: '탁음',
      cols: 5,
      rows: [
        [['が', 'ga', '가'], ['ぎ', 'gi', '기'], ['ぐ', 'gu', '구'], ['げ', 'ge', '게'], ['ご', 'go', '고']],
        [['ざ', 'za', '자'], ['じ', 'ji|zi', '지'], ['ず', 'zu', '즈'], ['ぜ', 'ze', '제'], ['ぞ', 'zo', '조']],
        [['だ', 'da', '다'], ['ぢ', 'ji|di|zi', '지'], ['づ', 'zu|du', '즈'], ['で', 'de', '데'], ['ど', 'do', '도']],
        [['ば', 'ba', '바'], ['び', 'bi', '비'], ['ぶ', 'bu', '부'], ['べ', 'be', '베'], ['ぼ', 'bo', '보']],
        [['ぱ', 'pa', '파'], ['ぴ', 'pi', '피'], ['ぷ', 'pu', '푸'], ['ぺ', 'pe', '페'], ['ぽ', 'po', '포']],
      ],
    },
    yoon: {
      label: '요음',
      cols: 3,
      rows: [
        [['きゃ', 'kya', '캬|갸'], ['きゅ', 'kyu', '큐|규'], ['きょ', 'kyo', '쿄|교']],
        [['しゃ', 'sha|sya', '샤'], ['しゅ', 'shu|syu', '슈'], ['しょ', 'sho|syo', '쇼']],
        [['ちゃ', 'cha|tya|cya', '차|자'], ['ちゅ', 'chu|tyu|cyu', '추|주'], ['ちょ', 'cho|tyo|cyo', '초|조']],
        [['にゃ', 'nya', '냐'], ['にゅ', 'nyu', '뉴'], ['にょ', 'nyo', '뇨']],
        [['ひゃ', 'hya', '햐'], ['ひゅ', 'hyu', '휴'], ['ひょ', 'hyo', '효']],
        [['みゃ', 'mya', '먀'], ['みゅ', 'myu', '뮤'], ['みょ', 'myo', '묘']],
        [['りゃ', 'rya', '랴'], ['りゅ', 'ryu', '류'], ['りょ', 'ryo', '료']],
        [['ぎゃ', 'gya', '갸'], ['ぎゅ', 'gyu', '규'], ['ぎょ', 'gyo', '교']],
        [['じゃ', 'ja|zya|jya', '자'], ['じゅ', 'ju|zyu|jyu', '주'], ['じょ', 'jo|zyo|jyo', '조']],
        [['びゃ', 'bya', '뱌'], ['びゅ', 'byu', '뷰'], ['びょ', 'byo', '뵤']],
        [['ぴゃ', 'pya', '퍄'], ['ぴゅ', 'pyu', '퓨'], ['ぴょ', 'pyo', '표']],
      ],
    },
  };

  // 히라가나 → 가타가나는 유니코드상 0x60 차이
  function toKatakana(s) {
    return s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
  }

  function makeKana([hira, rom, ko]) {
    const answers = rom.split('|');
    const koAnswers = ko.split('|');
    return { hira, kata: toKatakana(hira), romaji: answers[0], answers, korean: koAnswers[0], koAnswers };
  }

  // groups: { seion, daku, yoon } 중 true인 그룹의 글자를 표 순서대로 반환
  function buildPool(groups) {
    const pool = [];
    for (const key of Object.keys(TABLES)) {
      if (!groups[key]) continue;
      for (const row of TABLES[key].rows) for (const cell of row) if (cell) pool.push(makeKana(cell));
    }
    return pool;
  }

  function isCorrect(kana, input) {
    const v = input.trim().toLowerCase();
    return kana.answers.includes(v) || kana.koAnswers.includes(v);
  }

  const api = { TABLES, toKatakana, makeKana, buildPool, isCorrect };
  if (typeof module !== 'undefined') module.exports = api;
  else window.Kana = api;
})();
