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
  const ICON = { back: I('<path d="M15 5l-7 7 7 7"/>'), next: I('<path d="M9 5l7 7-7 7"/>'), home: I('<path d="M3 11l9-8 9 8M5 10v10h14V10"/>'), my: I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'), search: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'), list: I('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'), phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'), grid: I('<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>'), star: I('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>') };

  // ── 공통 헤더·하단 탭 ──
  const header = $("app-header");
  if (body.dataset.title && body.dataset.back !== "0") {
    header.innerHTML = `<a class="icon-btn" id="back" href="${base}index.html" aria-label="이전">${ICON.back}</a><strong class="page-title">${body.dataset.title}</strong>`;
    $("back").addEventListener("click", (e) => { if (history.length > 1) { e.preventDefault(); history.back(); } });
  } else if (body.dataset.title) header.innerHTML = `<strong class="page-title">${body.dataset.title}</strong>`;
  else header.innerHTML = `<a class="brand" href="${base}index.html"><strong>LeakBase</strong><span>개인정보·보안 유출 사고 아카이브</span></a>`;
  const tabs = [["list", "pages/list.html", "사고 목록", ICON.list], ["my", "pages/my.html", "내 서비스", ICON.my], ["home", "index.html", "홈", ICON.home], ["saved", "pages/saved.html", "관심·최근", ICON.star], ["help", "pages/help.html", "신고·상담", ICON.phone]];
  $("app-nav").innerHTML = tabs.map(([k, h, l, ic]) => `<a href="${base}${h}"${body.dataset.nav === k ? ' aria-current="page"' : ""}>${ic}<span>${l}</span></a>`).join("");

  // ── 카드 ──
  const card = (a, mode) => {
    const href = P("detail.html") + "?id=" + a.id, w = worry(a);
    if (mode === "mini") return `<a class="mini-card" href="${href}"><span class="chip">${a.category}${w ? " ⚠" : ""}</span><strong>${a.title}</strong><span class="muted">${a.dateText} · ${a.countText}</span></a>`;
    return `<article class="accident-card"><div class="row between"><span><span class="chip">${a.category}</span> ${srcChip(a)}</span>${w ? '<span class="chip warning">⚠ 걱정 항목</span>' : ""}</div><a class="card-title" href="${href}">${a.title}</a><div class="card-meta"><span>${esc(a.company)}</span><span>${a.dateText}</span><span>${a.countText}</span><span>${a.leakedCategories.join("·") || "유출 항목 정보 없음"}</span><span class="acc-id">${esc(a.id)}</span></div>${mode === "list" ? `<label class="cmp"><input type="checkbox" data-id="${a.id}" ${db.cmp.includes(a.id) ? "checked" : ""}> 비교에 담기</label>` : ""}</article>`;
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
  // 썸네일: 사고 이미지(a.image) → 기업 로고(a.logo) → 기본 아이콘 순. 로고는 사고 사진으로 오해하지 않도록 "로고" 표시를 붙임
  const DEFAULT_THUMB = I('<path d="M12 3l8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z"/>');
  const thumb = (a, rank) => {
    const img = a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy" onerror="this.remove()">` : a.logo ? `<img class="logo" src="${esc(a.logo)}" alt="" loading="lazy" onerror="this.remove()"><span class="thumb-tag">로고</span>` : "";
    return `<div class="thumb" aria-hidden="true"><span class="thumb-ph">${DEFAULT_THUMB}</span>${img}${rank ? `<span class="rank">${rank}</span>` : ""}</div>`;
  };
  const rail = (t, list, ranked) => `<section class="rail"><div class="section-heading"><h2>${t}</h2></div><div class="hscroll" tabindex="0" aria-label="${t}">${list.length ? list.map((a, i) => `<div class="h-card" data-id="${a.id}"><a class="h-link" href="${P("detail.html")}?id=${a.id}" aria-label="${esc(a.title)} 상세 보기">${thumb(a, ranked ? i + 1 : 0)}</a><span><a class="chip chip-link" href="${P("list.html")}?cat=${encodeURIComponent(a.category)}" aria-label="${esc(a.category)} 사고 목록 보기">${a.category}</a> ${srcChip(a)}</span><a class="h-link h-text" href="${P("detail.html")}?id=${a.id}"><strong>${esc(a.title)}</strong><span class="sub">${esc(a.company)} · ${a.dateText}</span><span class="sub">${a.countText}</span><span class="acc-id">${esc(a.id)}</span></a></div>`).join("") : '<p class="muted">표시할 사고가 없습니다.</p>'}</div></section>`;
  const wireRails = () => {
    v.addEventListener("keydown", (e) => { if (e.target.classList.contains("hscroll") && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { e.preventDefault(); e.target.scrollBy({ left: e.target.clientWidth * 0.8 * (e.key === "ArrowRight" ? 1 : -1), behavior: "smooth" }); } });
  };
  // 홈 헤더 오른쪽 카테고리 버튼: 누르면 목록이 열리고, 선택하면 list.html?cat=…(3-2 필터)로 이동
  const initCategory = () => {
    if (body.dataset.page !== "home" || $("cat-btn")) return;
    header.insertAdjacentHTML("beforeend", `<button type="button" class="button small-button cat-btn" id="cat-btn" aria-label="카테고리" aria-haspopup="true" aria-expanded="false" aria-controls="cat-menu">${ICON.grid}</button><div class="cat-menu" id="cat-menu" hidden><a href="${P("list.html")}">전체</a>${CATEGORY.map((c) => `<a href="${P("list.html")}?cat=${encodeURIComponent(c)}">${c}</a>`).join("")}</div>`);
    const btn = $("cat-btn"), menu = $("cat-menu");
    const setOpen = (on) => { menu.hidden = !on; btn.setAttribute("aria-expanded", on); };
    btn.onclick = (e) => { e.stopPropagation(); setOpen(menu.hidden); };
    document.addEventListener("click", (e) => { if (!menu.hidden && !menu.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setOpen(false); btn.focus(); } });
  };
  const boot = async () => {
    initCategory();
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
      v.innerHTML = `<form class="search-bar" id="sf" role="search"><div class="input-wrap"><input type="search" name="q" aria-label="유출사고 검색" placeholder="유출사고 검색"><button class="button primary search-btn" aria-label="검색">${ICON.search}</button></div></form>
<h1>내 서비스도 해당될까?</h1><p class="lead">서비스의 사고 이력과 확인할 정보를 살펴보세요.</p>
<form class="panel soft reg-form" id="rf"><strong>내 서비스 등록</strong><input type="text" name="s" aria-label="등록할 서비스명" placeholder="서비스명 입력"><button class="button small-button">등록</button></form>
${rail("추천 사고", rec, true)}${rail("피해 규모가 큰 사고", pop)}${rail("최신 사고", neu)}`;
      $("sf").onsubmit = (e) => { e.preventDefault(); location.href = P("list.html") + "?q=" + encodeURIComponent(e.target.q.value.trim()); };
      $("rf").onsubmit = (e) => { e.preventDefault(); addService(e.target.s.value); location.href = P("my.html"); };
      wireRails();
    },

    list() {
      const p = new URLSearchParams(location.search); let q = p.get("q") || "", cats = (p.get("cat") || "").split(",").filter(Boolean);
      const CATS = ["통신", "금융", "쇼핑·유통", "여행·숙박", "플랫폼·커뮤니티", "게임·레저", "공공", "교육·콘텐츠", "기타"];
      v.innerHTML = `<form class="panel" id="lf"><div class="input-wrap"><input type="search" id="q" value="${esc(q)}" placeholder="서비스명 또는 사고명" aria-label="서비스명 또는 사고명"><button class="button primary">검색</button></div><div class="chips" id="cats" style="margin-top:12px"><button type="button" class="chip" data-c="">전체</button>${CATS.map((c) => `<button type="button" class="chip" data-c="${c}">${c}</button>`).join("")}</div></form><div id="res"></div><a class="button primary full" id="cmpbtn" href="#">선택한 사고 비교</a>`;
      const upd = () => { const n = db.cmp.length, b = $("cmpbtn"); b.textContent = n ? `선택한 ${n}건 비교` : "선택한 사고 비교"; b.href = P("compare.html") + "?ids=" + db.cmp.join(","); b.setAttribute("aria-disabled", n < 2); };
      const draw = () => {
        document.querySelectorAll("#cats .chip").forEach((b) => { const on = b.dataset.c ? cats.includes(b.dataset.c) : !cats.length; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
        const k = q.trim().toLowerCase(), r = ACCIDENTS.filter((a) => (!cats.length || cats.includes(a.category)) && (!k || (a.title + a.company + a.category + a.summary).toLowerCase().includes(k))).sort(byDate);
        $("res").innerHTML = `<div class="row between" style="margin:14px 0 4px"><strong>사고 ${r.length}건</strong><span class="muted">최신순</span></div>` + (r.length ? r.map((a) => card(a, "list")).join("") : empty("조건에 맞는 사고가 없습니다.", '<button class="button small-button" id="reset">조건 초기화</button>'));
        const u = new URLSearchParams(); if (q) u.set("q", q); if (cats.length) u.set("cat", cats.join(","));
        history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "")); upd();
      };
      $("lf").onsubmit = (e) => { e.preventDefault(); q = $("q").value; draw(); };
      $("cats").onclick = (e) => { const b = e.target.closest("[data-c]"); if (!b) return; const c = b.dataset.c; cats = !c ? [] : cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c]; draw(); };
      $("cmpbtn").onclick = (e) => { if (db.cmp.length < 2) e.preventDefault(); };
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
      let tab = location.hash === "#recent" ? "recent" : "favorites";
      const TABS = [["favorites", "관심 사고", () => db.favs], ["recent", "최근 본 사고", () => db.recent]];
      const draw = () => {
        const [id, t, ids] = TABS.find((x) => x[0] === tab);
        v.innerHTML = `<div class="chips tabs" role="group" aria-label="보기 선택">${TABS.map(([k, l]) => `<button type="button" class="chip${k === tab ? " active" : ""}" data-tab="${k}" aria-pressed="${k === tab}">${l}</button>`).join("")}</div><section id="${id}"><div class="section-heading"><h2>${t}</h2></div>${ids().length ? ids().map(find).filter(Boolean).map((a) => card(a, "plain")).join("") : empty(`${t}가 없습니다.`, `<a class="button small-button" href="${P("list.html")}">사고 둘러보기</a>`)}</section><a class="button primary full" href="${P("checklist.html")}">체크리스트 모아보기</a>`;
      };
      v.onclick = (e) => { const b = e.target.closest("[data-tab]"); if (!b || b.dataset.tab === tab) return; tab = b.dataset.tab; history.replaceState(null, "", location.pathname + location.search + "#" + tab); draw(); };
      draw();
    },

    help() {
      // 연락처는 공식 기관 안내(KISA·개인정보보호위원회 등) 기준. 바뀔 수 있으므로 화면에도 확인 안내를 둠
      const C = [
        ["개인정보침해 신고센터", "118", "118", "https://privacy.kisa.or.kr", "개인정보 침해 신고·상담 (한국인터넷진흥원)"],
        ["경찰청 사이버범죄 신고", "182", "182", "https://ecrm.police.go.kr", "해킹·피싱 등 범죄 피해 신고"],
        ["금융감독원", "1332", "1332", "https://www.fss.or.kr/s1332", "금융회사·신용정보회사의 개인신용정보 침해 문의"],
        ["개인정보 분쟁조정위원회", "1833-6972", "1833-6972", "https://www.kopico.go.kr", "피해 구제를 위한 분쟁조정 신청"]
      ];
      const TODO = ["해당 기업의 공식 공지·안내 확인", "같은 비밀번호를 쓰는 서비스까지 비밀번호 변경", "결제·카드 이용 내역 확인, 이상 시 카드사 문의", "출처가 불분명한 문자·전화·링크 주의"];
      v.innerHTML = `<h1>유출이 의심될 때</h1><p class="lead">피해가 의심되면 아래 기관에 신고하거나 상담할 수 있어요.</p>
${C.map(([n, d, tel, url, desc]) => `<article class="panel contact"><div class="panel-title"><strong>${n}</strong><span class="chip">${d}</span></div><p class="small">${desc}</p><div class="row"><a class="button small-button primary" href="tel:${tel}">${ICON.phone}전화 ${d}</a><a class="button small-button" href="${url}" target="_blank" rel="noopener">누리집 열기</a></div></article>`).join("")}
<section class="panel"><h2>먼저 해볼 일</h2><ul class="todo">${TODO.map((t) => `<li>${t}</li>`).join("")}</ul><a class="button small-button" href="${P("list.html")}">사고 목록 보기</a></section>
<p class="notice">연락처는 공식 기관 안내를 기준으로 정리했습니다. 변경될 수 있으니 신고 전 각 기관 누리집에서 확인해 주세요.</p>`;
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
