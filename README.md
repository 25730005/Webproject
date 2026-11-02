# LeakBase

국내 개인정보 유출 사고 아카이브 프로토타입.

- `index.html`, `pages/`: 화면
- `css/style.css`: 공통 스타일
- `js/app.js`: 화면 동작. `data/accidents.json`을 fetch로 불러와 렌더링하고 Console에 `[데이터 점검]`을 출력
- `data/accidents.json`: 사고 데이터(JSON 저장 파일 사용, **API 미연동**). 각 항목의 `meta`에 출처 플래그(`source`, `real`, `dummy`, `draft`)가 있음
- 가상 사고 데이터는 없음. 분야·유출 항목 분류와 요약은 팀 검토 전 초안(`draft`)
- GitHub Pages 주소에서 확인(파일을 더블클릭해 열면 fetch가 막힘)
