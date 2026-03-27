# 내진성능 PWA — MANMIN-Ver.2.0

> 건축법 제48조·시행령 제32조·KDS 41 17 00 기준 내진설계 의무 대상 자동 판별  
> GitHub Pages에서 바로 사용 가능한 PWA(Progressive Web App)

---

## 📁 파일 구조

```
/
├── index.html            ← 메인 앱 파일
├── manifest.json         ← PWA 매니페스트 (앱 이름·아이콘 등)
├── sw.js                 ← Service Worker (오프라인 캐시)
├── header-logo.jpg       ← 헤더 로고 이미지
├── README.md             ← 이 파일
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── apple-touch-icon.png
    ├── favicon-32x32.png
    └── favicon-16x16.png
```

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — 저장소 생성
1. [github.com](https://github.com) 로그인
2. **New repository** 클릭
3. Repository name: `naejin` (또는 원하는 이름)
4. **Public** 선택 → **Create repository**

### 2단계 — 파일 업로드
1. **Add file → Upload files** 클릭
2. 이 폴더의 **모든 파일/폴더** 드래그 업로드  
   ⚠️ `icons/` 폴더도 반드시 포함
3. Commit message: `PWA 내진성능 v2.0 배포`
4. **Commit changes**

### 3단계 — GitHub Pages 활성화
1. 저장소 **Settings** 탭
2. 왼쪽 메뉴 **Pages** 클릭
3. Source: **Deploy from a branch**
4. Branch: **main** / folder: **/ (root)**
5. **Save** 클릭

### 4단계 — 완료
약 1~2분 후 아래 주소에서 접속 가능:
```
https://[GitHub아이디].github.io/[저장소이름]/
```

---

## 📱 앱 설치 방법

| 플랫폼 | 방법 |
|--------|------|
| **Android Chrome** | 화면 하단 "설치하기" 배너 탭 |
| **iPhone Safari** | 공유 버튼 → "홈 화면에 추가" |
| **PC Chrome/Edge** | 주소창 우측 설치 아이콘 클릭 |

설치 후 바로가기 이름: **내진성능**

---

## ✨ PWA 기능

- ✅ 오프라인 작동 (Service Worker 캐시)
- ✅ 홈 화면 설치 (Android·iOS·PC)
- ✅ 앱 이름 "내진성능" 바로가기
- ✅ 전체화면 독립 앱 모드
- ✅ 반응형 (데스크탑 · 태블릿 · 모바일)
