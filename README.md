# 이재민 | SAP FI Developer Portfolio

**[포트폴리오 바로가기](https://imsunbow.github.io)**

SAP FI(Financial Accounting) 모듈 커스텀 개발을 단독으로 담당한 개발자의 포트폴리오입니다.  
ABAP 백엔드부터 OData 게이트웨이, SAP Fiori 프론트엔드까지 전 스택을 직접 설계·구현했습니다.

---

## 소개

| 항목 | 내용 |
|------|------|
| 이름 | 이재민 |
| 역할 | SAP FI Developer |
| 이메일 | imsunbow@gmail.com |
| GitHub | [@imsunbow](https://github.com/imsunbow) |

---

## 주요 프로젝트

### ABAP 커스텀 프로그램

| ID | 프로그램명 | 핵심 기능 |
|----|-----------|-----------|
| ZE1FI0001 | 임시전표 작성 | ALV Grid, TextEditor, 전표 밸런스 검증, Number Range 채번 |
| ZRE1FI0008 | 임시전표 결재 | 결재 워크플로우, 승인/반려 처리, 정식 전기 연계 |
| ZE1FI0002 | 고정자산 현황 관리 | ALV Column Tree + iXML 바/그룹 차트 3-panel, 감가상각 계산 |

### SAP Fiori 앱

| ID | 앱명 | 핵심 기능 |
|----|------|-----------|
| ZPE1FI_GW02 / zgwe1fi0002 | 독촉장 관리 시스템 | 미결 채권 KPI 대시보드, 거래처별 독촉장 발행, Gmail 연동 메일 발송 |
| cyclone_layout_example | 매출 실적 분석 (ALP 패턴) | Analytical List Page, 차트-테이블 인터랙션, KPI 스트립 |

---

## 기술 스택

**SAP Backend**
- ABAP (OO / Procedural), ALV Grid / Tree / Chart
- OData 2.0 (SEGW), SAP Gateway, Number Range, BAPI

**SAP Frontend**
- SAP UI5 (1.120 / 1.148), SAP Fiori (MVC)
- sap.viz VizFrame, sap.f DynamicPage, Fiori Launchpad 배포

**SAP FI 도메인**
- 전표 처리 (SA/DR/KR/AA), 전기 키 / 계정 과목
- 고정자산(감가상각), 채권 관리 / 독촉, 결재 워크플로우

**기타**
- JavaScript, XML View / Binding, Git / GitHub, npm / ui5-tooling

---

## 관련 리포지토리

| 리포지토리 | 설명 |
|-----------|------|
| [ui5_fiori](https://github.com/imsunbow/ui5_fiori) | SAP UI5 / Fiori 자기학습 노트 및 예제 코드 |
| [selfstudy_abap](https://github.com/imsunbow/selfstudy_abap) | ABAP 자기학습 코드 스니펫 |
| [study_algorithm](https://github.com/imsunbow/study_algorithm) | 백준 알고리즘 풀이 (BaekjoonHub 자동 푸시, Python) |
| [ui5](https://github.com/imsunbow/ui5) | UI5 라우팅·뷰 구조 실습 |
