# 일본어 위젯

Windows·macOS 바탕화면에 띄워두고 히라가나·가타가나를 익히는 위젯입니다.

## 설치 (일반 사용자)

### Windows

1. [Releases](../../releases/latest)에서 `JapaneseWidget-win-x64.zip`을 받습니다.
2. 원하는 곳에 압축을 풉니다.
3. 폴더 안의 `JapaneseWidget.exe`를 실행합니다.

> 서명되지 않은 프로그램이라 처음 실행할 때 "Windows의 PC 보호" 창이 뜰 수 있습니다. **추가 정보 → 실행**을 누르세요.

### macOS

1. [Releases](../../releases/latest)에서 `JapaneseWidget-mac-universal.zip`을 받습니다. (Apple Silicon·Intel 공용)
2. 압축을 풀고 `JapaneseWidget.app`을 **응용 프로그램** 폴더로 옮깁니다.
3. 처음 한 번은 앱을 **우클릭 → 열기 → 열기**로 실행합니다.

> 서명되지 않은 앱이라 그냥 더블클릭하면 "확인되지 않은 개발자" 경고가 뜹니다. 위 방법으로도 안 되면 **시스템 설정 → 개인정보 보호 및 보안**에서 **그래도 열기**를 누르거나, 터미널에서 `xattr -cr /Applications/JapaneseWidget.app`을 실행하세요.

위젯은 화면 오른쪽 위에 나타나고, 작업표시줄(macOS는 Dock)에는 표시되지 않습니다. 끌 때는 **우클릭 → 종료**를 누릅니다. (macOS 트랙패드는 두 손가락 클릭)

## 사용법

| 모드 | 동작 |
|---|---|
| 순환 학습 | 글자의 읽는 법을 로마자나 한글로 입력하고 Enter를 누릅니다. 3번 틀리면 정답이 나옵니다 |
| 플래시카드 | 클릭하면 읽는 법이 나오고, 한 번 더 클릭하면 다음 글자로 넘어갑니다 |
| 전체 표 | 청음·탁음·요음 50음도 표 |

**우클릭 메뉴**에서 바꿀 수 있는 것:
- 모드
- 문자: 히라가나 / 가타가나 / 랜덤
- 출제 범위: 청음 / 탁음·반탁음 / 요음
- 순서
- 투명도
- 테마
- 글꼴: 고딕체 / 교과서체 (손글씨 획 모양, 쓰기 연습용)
- 배경 이미지: 내 컴퓨터의 PNG·JPG를 학습·카드 모드 배경으로 사용하고, 글자가 잘 보이도록 가림막 진하기를 조절합니다. 이미지는 내 컴퓨터에만 저장됩니다
- Windows 시작 시 자동 실행 (macOS: 로그인 시 자동 실행)

**창 이동**: 위젯 위쪽 가장자리를 끌어서 옮깁니다. 위치와 설정은 다음 실행 때도 그대로 유지됩니다.

## 개발

[Node.js](https://nodejs.org/)가 필요합니다.

```bash
npm install
npm start       # 소스에서 실행
npm test        # 가나 데이터·정답 판정 테스트
npm run pack      # dist/에 Windows exe 빌드
npm run pack:mac  # dist/에 macOS .app 빌드 (universal, macOS에서 실행)
```

macOS에서 소스 실행(`npm start`)할 때는 로그인 시 자동 실행 메뉴가 비활성화됩니다. 빌드한 .app에서는 정상 동작합니다.

## 글꼴 라이선스

교과서체는 [Klee One](https://github.com/fontworks-fonts/Klee)(Fontworks)에서 가나·영문만 추려 사용합니다. 라이선스는 SIL Open Font License 1.1이며 전문은 [fonts/OFL.txt](fonts/OFL.txt)에 있습니다.
