# People Analytics — Desktop (아이센스에프앤비)

**iSENS People Analytics** 데스크톱 애플리케이션 (Windows / Electron).

People Analytics 정식 배포(`https://pa-isens.vercel.app`, 기본값) 또는 사내 서버 주소에 연결하는
가벼운 Electron 래퍼입니다. 서버에 연결할 수 없을 때는 iSENS 로고가 표시된 연결 안내
화면에서 서버 주소를 직접 입력해 다시 연결할 수 있습니다.

> ⚠️ 본 저장소/빌드는 **가상(더미) 데이터** 기반의 공개 데모용입니다. 실제 사내 기밀 데이터는 포함되어 있지 않습니다.

## 다운로드

최신 Windows 빌드는 [Releases](../../releases/latest) 에서 받을 수 있습니다.

| 파일 | 설명 |
| --- | --- |
| `People-Analytics-Setup-0.1.0-win-x64.exe` | 설치 마법사 (NSIS). 설치 경로 선택·바로가기 생성 지원 |
| `People-Analytics-0.1.0-win-x64-portable.zip` | 설치 불필요 포터블. 압축 해제 후 `People Analytics.exe` 실행 |

> 코드 서명이 없어 최초 실행 시 Windows SmartScreen 경고가 뜰 수 있습니다.
> **추가 정보 → 실행** 을 누르면 됩니다.

## 개발 / 직접 빌드

```bash
npm install
npm start            # 로컬 실행 (electron .)
npm run dist         # Windows 설치파일 빌드 (electron-builder --win nsis)
```

- 서버 주소는 앱 메뉴 **서버 → 서버 주소 변경…** 또는 연결 안내 화면에서 변경할 수 있으며,
  `userData/config.json` 에 저장됩니다.

## 구성

| 파일 | 역할 |
| --- | --- |
| `main.js` | Electron 메인 프로세스 (창 생성, 서버 로드, 메뉴, 설정) |
| `preload.js` | 렌더러 ↔ 메인 브리지 (`window.desktop`) |
| `fallback.html` | 서버 연결 실패 시 안내/서버 주소 입력 화면 |
| `build/icon.ico` | 앱·설치파일 아이콘 (iSENS 로고) |

---

© 2026 (주)아이센스에프앤비 (iSens F&B)
