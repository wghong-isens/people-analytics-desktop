# Changelog

## v0.1.1 — 2026-08-26 · 보안·안정성 하드닝

코드 리뷰(Fowler smell) · 보안 리뷰(OWASP) · Electron 보안 베스트프랙티스 기준으로
프로그램을 점검하고 다음을 보완했습니다.

### 보안 (Security)
- **렌더러 샌드박스 명시** — `webPreferences.sandbox: true`, `webSecurity: true` 명시(방어적 설정).
- **권한 기본 차단** — 카메라·마이크·위치·알림 등 모든 권한 요청을 기본 거부
  (`setPermissionRequestHandler` / `setPermissionCheckHandler`). 대시보드 앱에 불필요한 장치 접근 차단.
- **`<webview>` 첨부 차단** — `web-contents-created`에서 `will-attach-webview` 방지.
- **전역 새 창/외부 내비게이션 정책** — 모든 web-contents에 외부 링크 → 기본 브라우저 위임 일원화.
- **연결 안내 화면 CSP** — `fallback.html`에 Content-Security-Policy 적용
  (`default-src 'none'` 기반, 외부 리소스·프레임 차단).
- **개발자 도구 노출 제한** — 패키지(배포) 빌드에서는 DevTools 메뉴 숨김, 개발 빌드에서만 노출.

### 안정성 (Reliability)
- **단일 인스턴스 보장** — 중복 실행 시 새 창 대신 기존 창을 포커스(`requestSingleInstanceLock`).
- **fallback 재로딩 루프 방지** — 안내 화면 자체 로드 실패 시 무한 재로딩 차단.

### 코드 품질 (Quality)
- **중복 로직 정리** — 새 창/내비게이션의 외부 링크 판정을 `isExternalHttpUrl()`로 추출(중복 제거).
- 패키징에 `asar: true` 명시.

### 참고
- 코드 서명은 여전히 미적용(로드맵 v0.2.0). 최초 실행 시 SmartScreen 안내는 동일합니다.

## v0.1.0 — 최초 릴리스
- macOS(.dmg) 배포본을 Windows(NSIS/포터블)로 재패키징.
- 아이센스에프앤비 iSENS 로고로 아이콘·연결 화면 리브랜딩.
- GitHub 소스/릴리스 및 Vercel 다운로드 페이지 공개.
