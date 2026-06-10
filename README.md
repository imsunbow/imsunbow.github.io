# 이재민 | SAP FI Developer Portfolio

**[포트폴리오 바로가기](https://imsunbow.github.io)**

SAP FI(Financial Accounting) 모듈 커스텀 개발을 담당한 개발자의 포트폴리오입니다.  
ABAP 백엔드부터 OData 게이트웨이, SAP Fiori 프론트엔드까지 전 스택을 직접 설계·구현했으며,  
자전거 기업 대상 SD→FI End-to-End ERP 구축 프로젝트에서 **FI 모듈 전체 및 개발 리드(PL)** 를 맡았습니다.

---

## 소개

| 항목 | 내용 |
|------|------|
| 이름 | 이재민 |
| 역할 | SAP FI Developer · PL (개발 리드) |
| 이메일 | imsunbow@gmail.com |
| GitHub | [@imsunbow](https://github.com/imsunbow) |
| LinkedIn | [jaemin-lee](https://www.linkedin.com/in/jaemin-lee-68696820b/) |
| Blog | [imsunbow.tistory.com](https://imsunbow.tistory.com/) |

---

## 주요 프로젝트

### ABAP 커스텀 프로그램

| ID | 프로그램명 | 핵심 기능 |
|----|-----------|-----------|
| ZE1FI0001 | 임시전표 작성 | ALV Grid + TextEditor, 전기 키(SA/DR/KR/AA) 유효성 검증, 차대변 잔액 체크, Number Range 채번 |
| ZRE1FI0008 | 임시전표 결재 | ALV 커스텀 툴바(결재/반려/일괄결재), GET PARAMETER 전표 수신, FI·CO 동기 전기 |
| ZE1FI0002 | 고정자산 현황 관리 | ALV Column Tree + iXML 바/그룹 차트 3-panel, 감가상각 계산, 취득·매각 전표 자동 생성 |
| ZRE1FI0002 | 전표 조회 / 역분개 | CDS View 기반 2-panel 조회, 전표유형별 동적 컬럼, 역분개 전표 생성, OLE2 PDF 출력 |
| ZRE1FI0004 | 총계정원장 조회 | 4-테이블 JOIN, KTOKS 5그룹 ALV Column Tree, iXML 바·라인 추이 차트 |
| ZRE1FI0003 | 재무상태표 조회 | KTOKS+SHKZG 잔액 부호 결정, 당기·전년 비교 ALV Tree, SVG 꺾은선 차트 |
| ZRE1FI0009 | 전표 반제 처리 | AR/AP 분기, 4-테이블 JOIN, 완전반제(C)/부분반제(P) 자동 결정, 청구문서 동기화 |
| ZRE1FI0010 | Excel 업로드 일괄 반제 | 동적 필드 매핑, FAE 3-쿼리 유효성 검증(누적금액 추적), 채번+INSERT/MODIFY 일괄 처리 |
| ZRE1FI0007 | 여신 등급 자동 갱신 배치 | DR 전표 GROUP BY SUM 매출 집계, S/A/B/C 등급 산정, 월말/일배치 분기, MODIFY upsert |
| ZRE1FI0001 | 환율 자동 수집 배치 | 한국수출입은행 Open API 호출(cl_http_client), JSON 역직렬화, 100단위 통화 처리, MODIFY upsert |

### SAP Fiori 앱

| ID | 앱명 | 핵심 기능 |
|----|------|-----------|
| ZPE1FI_GW02 · zgwe1fi0002 | 독촉장 관리 시스템 | 미결 채권 KPI 대시보드, VizFrame 차트, 거래처별 독촉장 발행, Gmail 연동 메일 발송 |

---

## 기술 스택

**SAP Backend**
- ABAP (OO / Procedural), ALV Grid / Column Tree / iXML Chart
- OData 2.0 (SEGW), CDS View, HTTP Client / JSON 파싱
- Number Range, FOR ALL ENTRIES, COMMIT/ROLLBACK

**SAP Frontend**
- SAP UI5 / SAP Fiori (MVC)
- sap.viz VizFrame, OData 모델 바인딩, 클라이언트 사이드 필터링

**SAP FI 도메인**
- 전표 처리 (SA/DR/KR/AA), 전기 키 / G/L 계정
- 고정자산 · 감가상각, 채권·채무 관리 / 반제(Clearing)
- 결재 워크플로우, 여신 등급 관리, 재무상태표

**기타**
- Python (백준 알고리즘 900+), SQLD 자격증
- JavaScript, Git / GitHub, npm / ui5-tooling

---

## 경력

| 기간 | 내용 |
|------|------|
| 2025.10 – 2026.07 | SAP Code 아카데미 수료 · FI 모듈 ERP 구축 프로젝트 PL |
| 2025.04 – 2025.06 | 에코아이시티 교육 인턴 (Classic ABAP · ALV 리포트) |
| 2018.03 – 2024.08 | 연세대학교 미래캠퍼스 · 환경공학 + 컴퓨터공학 복수전공 |

---

## 관련 리포지토리

| 리포지토리 | 설명 |
|-----------|------|
| [ui5](https://github.com/imsunbow/ui5) | UI5 라우팅·뷰 구조 실습 |
| [study_algorithm](https://github.com/imsunbow/study_algorithm) | 백준 알고리즘 풀이 (BaekjoonHub 자동 푸시, Python) |
