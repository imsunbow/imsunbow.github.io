# 이재민 포트폴리오

빌드 단계나 프레임워크 없이 GitHub Pages에서 제공하는 정적 사이트입니다.

## 파일 역할

- index.html: 소개, 경력, 역량, 학력·자격.
- projects.html: 현재 메타넷 업무 요약과 SAP Code Academy 1기 최종 프로젝트 소개.
- cyclone.html: SAP Code Academy 1기 최종 프로젝트 Cyclone 상세.
- styles.css: 공통 디자인, 상세 화면, 모바일 스타일.
- project.js: 상세 페이지의 업무 선택, ERD, 이미지 갤러리와 확대 창.
- images/: 프로필 사진과 프로젝트 이미지.
- tests/navigation.cjs: 데스크톱·모바일 탐색 및 상세 화면 회귀 검증.

## 수정 방법

소개와 현재 경력은 index.html, 프로젝트 목록은 projects.html에서 수정합니다.
최종 프로젝트 자료는 cyclone.html에 추가합니다. 클릭 동작은 HTML의
data-program, data-erd, data-gallery, data-lightbox 속성과 project.js에서 관리합니다.
HTML에 인라인 스타일이나 이벤트 핸들러를 추가하지 않습니다.

스타일은 styles.css에서 수정합니다. 동일 선택자는 미디어 쿼리별 한 번만 정의합니다.
프로젝트 이동은 일반 HTML 링크를 사용하므로 상세 URL, 새로고침, 뒤로가기가
브라우저 기본 동작을 따릅니다. 홈페이지와 목록 페이지는 JavaScript가 필요하지 않습니다.

## 확인

각 HTML 파일을 브라우저에서 직접 열어 확인할 수 있습니다.
Node.js, Playwright, Microsoft Edge가 있는 개발 환경에서는 다음 명령으로 검증합니다.

    node tests/navigation.cjs

Playwright가 별도 공용 경로에 설치되어 있으면 해당 모듈 경로를 NODE_PATH로 지정합니다.
이는 개발 검증용이며 배포 사이트에는 Node.js나 Playwright가 필요하지 않습니다.