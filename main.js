'use strict';

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const DEFAULT_SERVER_URL = 'http://localhost:3000';
const FALLBACK_FILE = path.join(__dirname, 'fallback.html');

let mainWindow = null;

// ---------------------------------------------------------------------------
// 설정 파일 (userData/config.json) — { serverUrl }
// ---------------------------------------------------------------------------

function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.json');
}

function loadConfig() {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.serverUrl === 'string' && parsed.serverUrl.trim()) {
      return { serverUrl: parsed.serverUrl.trim() };
    }
  } catch (err) {
    // 파일 없음/파싱 실패 → 기본값 사용
  }
  return { serverUrl: DEFAULT_SERVER_URL };
}

function saveConfig(config) {
  try {
    const dir = app.getPath('userData');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('config.json 저장 실패:', err);
    return false;
  }
}

function getServerUrl() {
  return loadConfig().serverUrl;
}

function isValidServerUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 창 생성
// ---------------------------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    title: '피플 애널리틱스',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 서버 로드 실패 시 안내 페이지 표시
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame) return;
    // -3 (ERR_ABORTED)은 정상적인 내비게이션 취소인 경우가 많아 무시
    if (errorCode === -3) return;
    mainWindow.loadFile(FALLBACK_FILE);
  });

  // 새 창(window.open, target=_blank)은 차단하고 외부 브라우저로 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const serverOrigin = safeOrigin(getServerUrl());
      const targetOrigin = safeOrigin(url);
      if (serverOrigin && targetOrigin && serverOrigin !== targetOrigin) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      // 같은 서버 오리진이라도 새 창 대신 현재 창에서 연다
      mainWindow.loadURL(url);
    }
    return { action: 'deny' };
  });

  // 외부 오리진으로의 내비게이션도 외부 브라우저로 위임
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const serverOrigin = safeOrigin(getServerUrl());
    const targetOrigin = safeOrigin(url);
    if (url.startsWith('file://')) return; // fallback.html 허용
    if (serverOrigin && targetOrigin && serverOrigin !== targetOrigin) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.loadURL(getServerUrl());
}

function safeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// IPC
// ---------------------------------------------------------------------------

ipcMain.handle('get-server-url', () => {
  return getServerUrl();
});

ipcMain.handle('set-server-url', (event, url) => {
  if (!isValidServerUrl(url)) {
    return { ok: false, error: 'http:// 또는 https:// 로 시작하는 올바른 주소를 입력해 주세요.' };
  }
  const serverUrl = url.trim();
  saveConfig({ serverUrl });
  if (mainWindow) {
    mainWindow.loadURL(serverUrl);
  }
  return { ok: true, serverUrl };
});

// ---------------------------------------------------------------------------
// 애플리케이션 메뉴 (한국어)
// ---------------------------------------------------------------------------

function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // 앱 메뉴
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about', label: '피플 애널리틱스 정보' },
              { type: 'separator' },
              { role: 'hide', label: '피플 애널리틱스 가리기' },
              { role: 'hideOthers', label: '기타 가리기' },
              { role: 'unhide', label: '모두 보기' },
              { type: 'separator' },
              { role: 'quit', label: '피플 애널리틱스 종료' },
            ],
          },
        ]
      : []),
    // 편집 — 한글 입력 및 복사/붙여넣기에 필수
    {
      label: '편집',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '실행 복귀' },
        { type: 'separator' },
        { role: 'cut', label: '오려두기' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣기' },
        { role: 'selectAll', label: '전체 선택' },
      ],
    },
    // 보기
    {
      label: '보기',
      submenu: [
        { role: 'reload', label: '새로고침' },
        {
          label: '강력 새로고침',
          accelerator: 'Shift+CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reloadIgnoringCache();
          },
        },
        { role: 'toggleDevTools', label: '개발자 도구' },
        { type: 'separator' },
        { role: 'resetZoom', label: '실제 크기' },
        { role: 'zoomIn', label: '확대' },
        { role: 'zoomOut', label: '축소' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '전체 화면' },
      ],
    },
    // 서버
    {
      label: '서버',
      submenu: [
        {
          label: '서버 주소 변경…',
          click: () => {
            if (mainWindow) mainWindow.loadFile(FALLBACK_FILE);
          },
        },
        {
          label: '서버 다시 연결',
          click: () => {
            if (mainWindow) mainWindow.loadURL(getServerUrl());
          },
        },
      ],
    },
    // 윈도우
    {
      label: '윈도우',
      submenu: [
        { role: 'minimize', label: '최소화' },
        { role: 'zoom', label: '확대/축소' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front', label: '모두 앞으로 가져오기' }] : [{ role: 'close', label: '닫기' }]),
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---------------------------------------------------------------------------
// 앱 라이프사이클
// ---------------------------------------------------------------------------

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
