# LeakBase

국내 개인정보 유출 사고 아카이브 프로토타입.

- `index.html`, `pages/`: 화면
- `css/style.css`: 공통 스타일
- `js/app.js`: 화면 동작. `data/accidents.json`을 fetch로 불러와 렌더링하고 Console에 `[데이터 점검]`을 출력
- `data/accidents.json`: 사고 데이터(JSON 저장 파일 사용, **API 미연동**). 각 항목의 `meta`에 출처 플래그(`source`, `kind`, `real`, `dummy`, `draft`)가 있음. `kind`는 `real`(실제)·`dummy`(더미)·`api`(API) 중 하나
- 데이터는 실제 사고 167건 + 더미(예시) 133건으로 총 300건. 더미는 생성형 AI로 만든 가상 사고이며 `meta.kind`가 `dummy`이고 화면에서 플라스크 아이콘으로 구분. 분야·유출 항목 분류와 요약은 팀 검토 전 초안(`draft`)
- GitHub Pages 주소에서 확인(파일을 더블클릭해 열면 fetch가 막힘)
- `asset/dummy/`: 더미 사고 카드에 쓰는 가상 기업 로고 40개. **AI 생성 실습용 이미지 · 실제 기업 로고 아님 · 실제 사고 사진 아님**. 제작 도구·날짜·프롬프트는 `asset/dummy/CREDITS.md`에 기록. 각 사고의 `thumbnail` 필드(이미지 경로, 없으면 null)로 연결하고, 이미지가 없거나 불러오지 못하면 회색 칸으로 표시
