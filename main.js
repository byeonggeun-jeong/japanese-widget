const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const fs = require('fs');
const path = require('path');

const SIZES = {
  cycle: { width: 220, height: 260 },
  flash: { width: 220, height: 260 },
  table: { width: 420, height: 540 },
};

const DEFAULTS = {
  mode: 'cycle', // cycle | flash | table
  script: 'hiragana', // hiragana | katakana | random
  groups: { seion: true, daku: false, yoon: false },
  order: 'random', // random | sequential
  opacity: 1,
  theme: 'dark', // dark | light
  x: undefined,
  y: undefined,
};

const settingsFile = path.join(app.getPath('userData'), 'settings.json');
let settings;
let win;

function loadSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    return { ...DEFAULTS, ...saved, groups: { ...DEFAULTS.groups, ...saved.groups } };
  } catch {
    return { ...DEFAULTS, groups: { ...DEFAULTS.groups } };
  }
}

function saveSettings() {
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
}

// 자동 실행: exe 버전은 exe만, 소스 실행은 electron.exe + 앱 폴더 경로로 등록한다
const loginItem = { path: process.execPath, args: app.isPackaged ? [] : [path.resolve(__dirname)] };

function update(patch) {
  const modeChanged = patch.mode && patch.mode !== settings.mode;
  settings = { ...settings, ...patch };
  saveSettings();
  if (modeChanged) win.setBounds({ ...win.getBounds(), ...SIZES[settings.mode] });
  win.setOpacity(settings.opacity);
  win.webContents.send('settings', settings);
}

// 저장된 위치가 현재 연결된 모니터 밖이면(모니터 분리 등) 기본 위치 사용
function initialPosition(size) {
  if (settings.x !== undefined) {
    const visible = screen.getAllDisplays().some(({ workArea: a }) =>
      settings.x >= a.x && settings.y >= a.y && settings.x < a.x + a.width - 40 && settings.y < a.y + a.height - 40);
    if (visible) return { x: settings.x, y: settings.y };
  }
  const a = screen.getPrimaryDisplay().workArea;
  return { x: a.x + a.width - size.width - 40, y: a.y + 40 };
}

function buildMenu() {
  const radio = (label, key, value) => ({
    label, type: 'radio', checked: settings[key] === value, click: () => update({ [key]: value }),
  });
  const group = (label, key) => ({
    label, type: 'checkbox', checked: settings.groups[key],
    click: () => update({ groups: { ...settings.groups, [key]: !settings.groups[key] } }),
  });
  return Menu.buildFromTemplate([
    radio('순환 학습', 'mode', 'cycle'),
    radio('플래시카드', 'mode', 'flash'),
    radio('전체 표', 'mode', 'table'),
    { type: 'separator' },
    { label: '문자', submenu: [
      radio('히라가나', 'script', 'hiragana'),
      radio('가타가나', 'script', 'katakana'),
      radio('랜덤', 'script', 'random'),
    ] },
    { label: '출제 범위', submenu: [group('청음', 'seion'), group('탁음·반탁음', 'daku'), group('요음', 'yoon')] },
    { label: '순서', submenu: [radio('랜덤', 'order', 'random'), radio('순서대로', 'order', 'sequential')] },
    { label: '투명도', submenu: [1, 0.9, 0.8, 0.7, 0.5].map((v) => radio(`${v * 100}%`, 'opacity', v)) },
    { label: '테마', submenu: [radio('다크', 'theme', 'dark'), radio('라이트', 'theme', 'light')] },
    { type: 'separator' },
    {
      label: 'Windows 시작 시 자동 실행', type: 'checkbox',
      checked: app.getLoginItemSettings(loginItem).openAtLogin,
      click: (item) => app.setLoginItemSettings({ ...loginItem, openAtLogin: item.checked }),
    },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() },
  ]);
}

function createWindow() {
  const size = SIZES[settings.mode];
  win = new BrowserWindow({
    ...size,
    ...initialPosition(size),
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    skipTaskbar: true,
    alwaysOnTop: false,
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setOpacity(settings.opacity);
  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => win.showInactive());

  let moveTimer;
  win.on('moved', () => {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      const [x, y] = win.getPosition();
      settings = { ...settings, x, y };
      saveSettings();
    }, 300);
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    settings = loadSettings();
    ipcMain.handle('get-settings', () => settings);
    ipcMain.on('show-menu', () => buildMenu().popup({ window: win }));
    createWindow();
  });
  app.on('second-instance', () => win && win.show());
  app.on('window-all-closed', () => app.quit());
}
