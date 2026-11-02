// LeakBase 프로토타입: 공통 UI + 화면별 동작 (저장은 브라우저 localStorage)
document.addEventListener("DOMContentLoaded", async () => {
  const body = document.body, base = body.dataset.base || "", v = document.getElementById("view");
  let ACCIDENTS = [];
  const KEY = "leakbase", ITEMS = ["계정정보", "금융정보", "연락처", "신원정보", "위치·이용기록"];
  const DEF = () => ({ favs: [], recent: [], services: [], worries: ["계정정보", "금융정보"], checks: {}, cmp: [] });
  let db; try { db = { ...DEF(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) { db = DEF(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const P = (f) => base + "pages/" + f, find = (id) => ACCIDENTS.find((a) => a.id == id);
  const worry = (a) => a.leakedCategories.some((i) => db.worries.includes(i));
  const byDate = (a, b) => (b.refDate || "").localeCompare(a.refDate || "");
  const empty = (msg, btn) => `<div class="panel empty"><p>${msg}</p>${btn || ""}</div>`;
  const I = (d) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = { back: I('<path d="M15 5l-7 7 7 7"/>'), next: I('<path d="M9 5l7 7-7 7"/>'), home: I('<path d="M3 11l9-8 9 8M5 10v10h14V10"/>'), my: I('<path d="M4 6h16M4 12h16M4 18h10"/>'), star: I('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>') };

  // ── 공통 헤더·하단 탭 ──
  const header = $("app-header");
  if (body.dataset.title && body.dataset.back !== "0") {
    header.innerHTML = `<a class="icon-btn" id="back" href="${base}index.html" aria-label="이전">${ICON.back}</a><strong class="page-title">${body.dataset.title}</strong>`;
    $("back").addEventListener("click", (e) => { if (history.length > 1) { e.preventDefault(); history.back(); } });
  } else if (body.dataset.title) header.innerHTML = `<strong class="page-title">${body.dataset.title}</strong>`;
  else header.innerHTML = `<a class="brand" href="${base}index.html"><strong>LeakBase</strong><span>개인정보·보안 유출 사고 아카이브</span></a>`;
  const tabs = [["home", "index.html", "홈", ICON.home], ["my", "pages/my.html", "내 서비스", ICON.my], ["saved", "pages/saved.html", "관심·최근", ICON.star]];
  $("app-nav").innerHTML = tabs.map(([k, h, l, ic]) => `<a href="${base}${h}"${body.dataset.nav === k ? ' aria-current="page"' : ""}>${ic}<span>${l}</span></a>`).join("");

  // ── 카드 ──
  const card = (a, mode) => {
    const href = P("detail.html") + "?id=" + a.id, w = worry(a);
    if (mode === "mini") return `<a class="mini-card" href="${href}"><span class="chip">${a.category}${w ? " ⚠" : ""}</span><strong>${a.title}</strong><span class="muted">${a.dateText} · ${a.countText}</span></a>`;
    return `<article class="accident-card"><div class="row between"><span><span class="chip">${a.category}</span> ${srcChip(a)}</span>${w ? '<span class="chip warning">⚠ 걱정 항목</span>' : ""}</div><a class="card-title" href="${href}">${a.title}</a><div class="card-meta"><span>${a.dateText}</span><span>${a.countText}</span><span>${a.leakedCategories.join("·") || "유출 항목 정보 없음"}</span></div>${mode === "list" ? `<label class="cmp"><input type="checkbox" data-id="${a.id}" ${db.cmp.includes(a.id) ? "checked" : ""}> 비교에 담기</label>` : ""}</article>`;
  };
  const addService = (s) => { s = s.trim(); if (s && !db.services.includes(s)) { db.services.push(s); save(); } };
  const toggleCheck = (id, i, on) => { const c = new Set(db.checks[id] || []); on ? c.add(i) : c.delete(i); db.checks[id] = [...c]; save(); };
  const prog = (a) => (db.checks[a.id] || []).filter((i) => i < a.actions.length).length;
  const checkList = (a) => `<div class="checklist">${a.actions.map((t, i) => `<label><input type="checkbox" data-id="${a.id}" data-i="${i}" ${(db.checks[a.id] || []).includes(i) ? "checked" : ""}> ${t}</label>`).join("")}</div>`;

  // ── 데이터 불러오기·점검 (7주차) ──
  const DATA_URL = base + "data/accidents.json";
  const CATEGORY = ["통신", "금융", "쇼핑·유통", "여행·숙박", "플랫폼·커뮤니티", "게임·레저", "공공", "교육·콘텐츠", "기타"];
  const REQUIRED = ["id", "title", "company", "category", "incidentType", "summary"];
  const ALLOWED = { category: CATEGORY, incidentType: ["해킹", "업무 과실", "시스템 오류", "내부자 유출", "기타"] };
  const TYPES = { id: "string", title: "string", company: "string", category: "string", incidentType: "string", summary: "string", incidentDate: "string", disclosedDate: "string", affectedCount: "number", affectedUnit: "string" };
  const blank = (v) => v === null || v === undefined || v === "";
  function checkData(data, source) {
    console.group("[데이터 점검]", source);
    console.log("배열인가?", Array.isArray(data));
    if (!Array.isArray(data)) { console.groupEnd(); return []; }
    console.log("데이터 건수:", data.length);
    console.log(`첫 번째 객체의 필드(${Object.keys(data[0] || {}).length}개):`, Object.keys(data[0] || {}));
    console.log("첫 번째 id와 자료형:", data[0]?.id, typeof data[0]?.id);
    const warn = [], ids = new Set(), nulls = {}, src = {};
    data.forEach((p) => {
      if (ids.has(p.id)) warn.push(`id 중복: ${p.id}`); ids.add(p.id);
      const so = p.meta?.source || "없음"; src[so] = (src[so] || 0) + 1;
      if (so === "없음") warn.push(`meta.source 없음: id ${p.id}`);
      Object.entries(TYPES).forEach(([k, t]) => {
        const v = p[k]; if (blank(v)) { nulls[k] = (nulls[k] || 0) + 1; return; }
        if (typeof v !== t) warn.push(`자료형: id ${p.id} ${k} = ${JSON.stringify(v)} (${t} 이어야 함)`);
        else if (ALLOWED[k] && !ALLOWED[k].includes(v)) warn.push(`허용값 밖: id ${p.id} ${k} = "${v}"`);
      });
      (p.leakedCategories || []).forEach((c) => { if (!ITEMS.includes(c)) warn.push(`허용값 밖: id ${p.id} leakedCategories = "${c}"`); });
      if ((p.affectedCount == null) !== (p.affectedUnit == null)) warn.push(`규모와 단위가 짝이 아님: id ${p.id}`);
    });
    const valid = data.filter((p) => {
      const miss = REQUIRED.filter((k) => blank(p[k]));
      ["leakedData", "leakedCategories", "sources"].forEach((k) => { if (!Array.isArray(p[k])) miss.push(k); });
      if (miss.length) warn.push(`필수 필드 누락: id ${p.id} ${miss.join("·")} → 화면에서 제외`);
      return !miss.length;
    });
    console.log("빈 값(null) 수:", nulls); console.log("항목 출처:", src);
    if (warn.length) warn.forEach((w) => console.warn(w)); else console.log("경고: 없음");
    console.log("화면에 표시할 건수:", valid.length); console.groupEnd();
    return valid;
  }
  // 화면용 값 만들기: 원본 필드는 그대로 두고 표시용 값만 덧붙임
  const fmtCount = (a) => {
    if (a.affectedCount == null) return "규모 정보 없음";
    const n = a.affectedCount, t = n >= 1e8 ? (n / 1e8).toFixed(1).replace(/\.0$/, "") + "억" : n >= 1e4 ? Math.round(n / 1e4).toLocaleString() + "만" : n.toLocaleString();
    return `${t} ${a.affectedUnit}`;
  };
  const BASE_ACTIONS = ["공식 공지·안내 확인", "다른 서비스와 같은 비밀번호 사용 여부 확인"];
  const ACTION_BY = { 계정정보: "비밀번호 변경과 2단계 인증 설정", 금융정보: "결제·카드 이용 내역 확인", 연락처: "스팸·피싱 문자·전화 주의", 신원정보: "명의도용 여부 확인(본인 인증 수단 점검)", "위치·이용기록": "이용 내역에서 낯선 기록 확인" };
  const adapt = (a) => ({ ...a, refDate: a.incidentDate || a.disclosedDate || null, dateText: a.incidentDate || (a.disclosedDate ? a.disclosedDate + " 공개" : "날짜 정보 없음"), countText: fmtCount(a), actions: [...BASE_ACTIONS, ...a.leakedCategories.map((c) => ACTION_BY[c]).filter(Boolean)] });
  const srcChip = (a) => `<span class="chip src">${a.meta?.source === "api" ? "API" : "JSON"}</span>`;
  const overview = (a) => {
    const fmt = a.affectedCount == null ? null : a.affectedCount.toLocaleString() + a.affectedUnit;
    const rows = [["발생일", a.incidentDate, "incidentDate"], ["공개일", a.disclosedDate, "disclosedDate"], ["피해 규모", fmt, "affectedCount"], ["유출 항목", a.leakedCategories.join(", ") || null, "leakedCategories"], ["유출 상세", a.leakedData.join(", ") || null, "leakedData"], ["유형", a.incidentType, "incidentType"], ["원인", a.cause, "cause"], ["제재", a.penalty, "penalty"]];
    return `<section class="panel"><h2>개요</h2><p class="small source-line">출처 ${srcChip(a)}</p><div class="key-value">${rows.map(([k, v]) => `<span>${k}</span><span>${v ? esc(v) : "정보 없음"}</span>`).join("")}</div></section>`;
  };
  // 홈 가로 넘김 카드 (회색 이미지 자리)
  const rail = (t, list, ranked) => `<section class="rail"><div class="section-heading"><h2>${t}</h2></div><div class="hscroll" tabindex="0" aria-label="${t}">${list.length ? list.map((a, i) => `<a class="h-card" href="${P("detail.html")}?id=${a.id}" data-id="${a.id}"><div class="thumb" aria-hidden="true">${ranked ? `<span class="rank">${i + 1}</span>` : ""}</div><span><span class="chip">${a.category}</span> ${srcChip(a)}</span><strong>${esc(a.title)}</strong><span class="muted">${a.dateText}</span></a>`).join("") : '<p class="muted">표시할 사고가 없습니다.</p>'}</div></section>`;
  const wireRails = () => {
    v.addEventListener("keydown", (e) => { if (e.target.classList.contains("hscroll") && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { e.preventDefault(); e.target.scrollBy({ left: e.target.clientWidth * 0.8 * (e.key === "ArrowRight" ? 1 : -1), behavior: "smooth" }); } });
  };
  const boot = async () => {
    v.innerHTML = '<p class="muted">불러오는 중…</p>';
    try { const res = await fetch(DATA_URL); if (!res.ok) throw new Error("HTTP " + res.status); ACCIDENTS = checkData(await res.json(), DATA_URL).map(adapt); }
    catch (err) { console.error(err); v.innerHTML = empty("사고 정보를 불러오지 못했습니다.", '<button class="button small-button" id="retry">다시 시도</button>'); $("retry").onclick = boot; return; }
    const ok = new Set(ACCIDENTS.map((a) => a.id)); ["favs", "recent", "cmp"].forEach((k) => { db[k] = db[k].filter((i) => ok.has(i)); }); save();
    (pages[body.dataset.page] || (() => {}))();
  };

  const pages = {
    home() {
      const rec = ACCIDENTS.filter((a) => a.recommendOrder != null).sort((x, y) => x.recommendOrder - y.recommendOrder);
      const pop = ACCIDENTS.filter((a) => a.affectedUnit === "명" && a.affectedCount != null).sort((x, y) => y.affectedCount - x.affectedCount).slice(0, 8);
      const neu = [...ACCIDENTS].sort(byDate).slice(0, 8);
      v.innerHTML = `<h1>내 서비스도 해당될까?</h1><p class="lead">서비스의 사고 이력과 확인할 정보를 살펴보세요.</p><form class="panel" id="sf"><div class="panel-title"><strong>서비스 검색</strong></div><div class="input-wrap"><input type="search" name="q" aria-label="서비스명 검색" placeholder="쇼핑몰, 배달 앱 이름"><button class="button primary">검색</button></div></form>
<form class="panel soft" id="rf"><div class="panel-title"><strong>내 서비스 등록</strong></div><div class="input-wrap"><input type="text" name="s" aria-label="등록할 서비스명" placeholder="서비스명 입력"><button class="button">등록</button></div></form>
${rail("추천 사고", rec, true)}${rail("피해 규모가 큰 사고", pop)}${rail("최신 사고", neu)}`;
      $("sf").onsubmit = (e) => { e.preventDefault(); location.href = P("list.html") + "?q=" + encodeURIComponent(e.target.q.value.trim()); };
      $("rf").onsubmit = (e) => { e.preventDefault(); addService(e.target.s.value); location.href = P("my.html"); };
      wireRails();
    },

    list() {
      const p = new URLSearchParams(location.search); let q = p.get("q") || "", cats = (p.get("cat") || "").split(",").filter(Boolean);
      const CATS = ["통신", "금융", "쇼핑·유통", "여행·숙박", "플랫폼·커뮤니티", "게임·레저", "공공", "교육·콘텐츠", "기타"];
      v.innerHTML = `<form class="panel" id="lf"><div class="input-wrap"><input type="search" id="q" value="${esc(q)}" placeholder="서비스명 또는 사고명" aria-label="서비스명 또는 사고명"><button class="button primary">검색</button></div><div class="chips" id="cats" style="margin-top:12px">${CATS.map((c) => `<button type="button" class="chip" data-c="${c}">${c}</button>`).join("")}</div></form><div id="res"></div><a class="button primary full" id="cmpbtn" href="#">선택한 사고 비교</a>`;
      const upd = () => { const n = db.cmp.length, b = $("cmpbtn"); b.textContent = n ? `선택한 ${n}건 비교` : "선택한 사고 비교"; b.href = P("compare.html") + "?ids=" + db.cmp.join(","); b.setAttribute("aria-disabled", n < 2); };
      const draw = () => {
        document.querySelectorAll("#cats .chip").forEach((b) => b.classList.toggle("active", cats.includes(b.dataset.c)));
        const k = q.trim().toLowerCase(), r = ACCIDENTS.filter((a) => (!cats.length || cats.includes(a.category)) && (!k || (a.title + a.company + a.category + a.summary).toLowerCase().includes(k))).sort(byDate);
        $("res").innerHTML = `<div class="row between" style="margin:14px 0 4px"><strong>사고 ${r.length}건</strong><span class="chip">최신순</span></div>` + (r.length ? r.map((a) => card(a, "list")).join("") : empty("조건에 맞는 사고가 없습니다.", '<button class="button small-button" id="reset">조건 초기화</button>'));
        const u = new URLSearchParams(); if (q) u.set("q", q); if (cats.length) u.set("cat", cats.join(","));
        history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "")); upd();
      };
      $("lf").onsubmit = (e) => { e.preventDefault(); q = $("q").value; draw(); };
      $("cats").onclick = (e) => { const c = e.target.dataset.c; if (c) { cats = cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c]; draw(); } };
      $("res").onclick = (e) => { if (e.target.id === "reset") { q = ""; cats = []; $("q").value = ""; draw(); } };
      $("res").onchange = (e) => {
        const id = e.target.dataset.id; if (!id) return;
        if (e.target.checked && db.cmp.length >= 3) { e.target.checked = false; alert("비교는 최대 3건까지 가능합니다."); return; }
        db.cmp = e.target.checked ? [...db.cmp, id] : db.cmp.filter((x) => x !== id); save(); upd();
      };
      draw();
    },

    detail() {
      const a = find(new URLSearchParams(location.search).get("id"));
      if (!a) { v.innerHTML = empty("사고를 찾을 수 없습니다.", `<a class="button small-button" href="${P("list.html")}">사고 목록으로</a>`); return; }
      db.recent = [a.id, ...db.recent.filter((i) => i !== a.id)].slice(0, 10); save();
      const fav = () => db.favs.includes(a.id);
      v.innerHTML = `<h1>${a.title}</h1><div class="row"><span class="chip">${a.category}</span>${srcChip(a)}${worry(a) ? '<span class="chip warning">⚠ 걱정 항목</span>' : ""}</div>
${overview(a)}
<section class="panel"><h2>사고 내용</h2><p>${esc(a.summary)}</p></section>
<section class="panel"><h2>출처</h2>${a.sources.map((x) => `<p class="small"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.org)}</a> · ${esc(x.type)}${x.checkedAt ? " · 열람 " + x.checkedAt : ""}</p>`).join("")}<p class="notice">분야·유출 항목 분류와 요약은 팀 검토 전 초안입니다.</p></section>
<section class="panel"><h2>대응 체크리스트</h2>${checkList(a)}</section>
<div class="row"><button class="button primary" id="favb"></button><a class="button" href="${P("checklist.html")}">체크리스트 모아보기</a></div>`;
      const label = () => ($("favb").textContent = fav() ? "★ 관심 해제" : "☆ 관심 저장"); label();
      $("favb").onclick = () => { db.favs = fav() ? db.favs.filter((i) => i !== a.id) : [a.id, ...db.favs]; save(); label(); };
      v.onchange = (e) => { if (e.target.dataset.i) toggleCheck(a.id, +e.target.dataset.i, e.target.checked); };
    },

    compare() {
      const ids = (new URLSearchParams(location.search).get("ids") || db.cmp.join(",")).split(",").filter(Boolean);
      const L = ids.map(find).filter(Boolean).slice(0, 3);
      if (L.length < 2) { v.innerHTML = empty("비교할 사고를 2건 이상 선택해 주세요.", `<a class="button small-button" href="${P("list.html")}">사고 목록으로</a>`); return; }
      const rows = [["분야", (a) => a.category], ["발생일", (a) => a.dateText], ["규모", (a) => a.countText], ["유출 항목", (a) => a.leakedCategories.join("·") || "정보 없음"], ["유형", (a) => a.incidentType], ["원인", (a) => a.cause || "정보 없음"], ["제재", (a) => a.penalty || "확인되지 않음"], ["걱정 항목", (a) => (worry(a) ? "⚠ 포함" : "-")]];
      v.innerHTML = `<section class="panel"><div class="compare-grid" style="grid-template-columns:64px repeat(${L.length},1fr)"><span></span>${L.map((a) => `<span class="col-title">${a.company}</span>`).join("")}${rows.map(([k, f]) => `<span class="k">${k}</span>` + L.map((a) => `<span>${f(a)}</span>`).join("")).join("")}</div></section><div class="row">${L.map((a) => `<a class="button small-button" href="${P("detail.html")}?id=${a.id}">${a.company} 상세</a>`).join("")}</div>`;
    },

    my() {
      const rel = (s) => ACCIDENTS.filter((a) => a.company.includes(s) || s.includes(a.company));
      const draw = () => {
        const tl = [...new Set(db.services.flatMap(rel))].sort((a, b) => (a.refDate || "9999").localeCompare(b.refDate || "9999"));
        v.innerHTML = `<form class="panel" id="af"><div class="input-wrap"><input type="text" name="s" placeholder="서비스명 입력" aria-label="서비스명 입력"><button class="button primary">추가</button></div></form>
${db.services.length ? db.services.map((s, i) => `<article class="service-card"><div class="panel-title"><strong>${esc(s)}</strong></div><p class="small">관련 사고 ${rel(s).length}건</p><div class="row"><a class="button small-button" href="${P("list.html")}?q=${encodeURIComponent(s)}">사고 보기</a><button class="button small-button" data-del="${i}">삭제</button></div></article>`).join("") : empty("등록한 서비스가 없습니다.")}
<section class="panel"><h2>걱정되는 정보</h2><div class="chips">${ITEMS.map((i) => `<label class="chip"><input type="checkbox" data-w="${i}" ${db.worries.includes(i) ? "checked" : ""}> ${i}</label>`).join("")}</div></section>
<section class="panel"><h2>사고 연표</h2>${tl.length ? `<div class="timeline">${tl.map((a) => `<div class="timeline-item"><div class="muted">${a.dateText}</div><a href="${P("detail.html")}?id=${a.id}">${a.title}</a>${worry(a) ? '<div><span class="chip warning">⚠ 걱정 항목</span></div>' : ""}</div>`).join("")}</div>` : '<p class="muted">등록한 서비스와 관련된 사고가 없습니다.</p>'}</section>
<p class="notice">관련 사고가 없다고 해서 안전하다는 뜻은 아닙니다.</p>`;
        $("af").onsubmit = (e) => { e.preventDefault(); addService(e.target.s.value); draw(); };
      };
      v.onclick = (e) => { if (e.target.dataset.del !== undefined) { db.services.splice(+e.target.dataset.del, 1); save(); draw(); } };
      v.onchange = (e) => { const w = e.target.dataset.w; if (w) { db.worries = e.target.checked ? [...db.worries, w] : db.worries.filter((x) => x !== w); save(); draw(); } };
      draw();
    },

    saved() {
      const sec = (id, t, ids) => `<section id="${id}"><div class="section-heading"><h2>${t}</h2></div>${ids.length ? ids.map(find).filter(Boolean).map((a) => card(a, "plain")).join("") : empty(`${t}가 없습니다.`, `<a class="button small-button" href="${P("list.html")}">사고 둘러보기</a>`)}</section>`;
      v.innerHTML = `<div class="chips"><a class="chip active" href="#favorites">관심 사고</a><a class="chip" href="#recent">최근 본 사고</a></div>${sec("favorites", "관심 사고", db.favs)}${sec("recent", "최근 본 사고", db.recent)}<a class="button primary full" href="${P("checklist.html")}">체크리스트 모아보기</a>`;
    },

    checklist() {
      const L = db.favs.map(find).filter(Boolean);
      if (!L.length) { v.innerHTML = empty("관심 사고를 저장하면 조치 현황을 모아볼 수 있어요.", `<a class="button small-button" href="${P("list.html")}">사고 둘러보기</a>`); return; }
      const done = L.filter((a) => prog(a) === a.actions.length).length;
      v.innerHTML = `<section class="panel soft"><h2>전체 진행</h2><strong>${L.length}건 중 ${done}건 완료</strong></section>${L.map((a) => `<section class="panel"><div class="panel-title"><strong>${a.title}</strong><span class="chip">${prog(a)}/${a.actions.length}</span></div>${checkList(a)}<a class="button small-button" href="${P("detail.html")}?id=${a.id}">상세 보기</a></section>`).join("")}<p class="notice">모든 항목을 완료해도 안전하다는 뜻은 아닙니다.</p>`;
      v.onchange = (e) => { if (e.target.dataset.i) { toggleCheck(e.target.dataset.id, +e.target.dataset.i, e.target.checked); pages.checklist(); } };
    }
  };
  await boot();
});
