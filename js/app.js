// LeakBase 프로토타입: 공통 UI + 화면별 동작 (저장은 브라우저 localStorage)
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body, base = body.dataset.base || "", v = document.getElementById("view");
  const KEY = "leakbase", ITEMS = ["계정정보", "금융정보", "연락처", "신원정보", "위치·이용기록"];
  const DEF = () => ({ favs: [], recent: [], services: [], worries: ["계정정보", "금융정보"], checks: {}, cmp: [] });
  let db; try { db = { ...DEF(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) { db = DEF(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const P = (f) => base + "pages/" + f, find = (id) => ACCIDENTS.find((a) => a.id == id);
  const worry = (a) => a.items.some((i) => db.worries.includes(i));
  const byDate = (a, b) => b.date.localeCompare(a.date);
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
    if (mode === "mini") return `<a class="mini-card" href="${href}"><span class="chip">${a.cat}${w ? " ⚠" : ""}</span><strong>${a.title}</strong><span class="muted">${a.date} · ${a.count}</span></a>`;
    return `<article class="accident-card"><div class="row between"><span class="chip">${a.cat}</span>${w ? '<span class="chip warning">⚠ 걱정 항목</span>' : ""}</div><a class="card-title" href="${href}">${a.title}</a><div class="card-meta"><span>${a.date}</span><span>${a.count}</span><span>${a.items.join("·")}</span></div>${mode === "list" ? `<label class="cmp"><input type="checkbox" data-id="${a.id}" ${db.cmp.includes(a.id) ? "checked" : ""}> 비교에 담기</label>` : ""}</article>`;
  };
  const addService = (s) => { s = s.trim(); if (s && !db.services.includes(s)) { db.services.push(s); save(); } };
  const toggleCheck = (id, i, on) => { const c = new Set(db.checks[id] || []); on ? c.add(i) : c.delete(i); db.checks[id] = [...c]; save(); };
  const prog = (a) => (db.checks[a.id] || []).filter((i) => i < a.actions.length).length;
  const checkList = (a) => `<div class="checklist">${a.actions.map((t, i) => `<label><input type="checkbox" data-id="${a.id}" data-i="${i}" ${(db.checks[a.id] || []).includes(i) ? "checked" : ""}> ${t}</label>`).join("")}</div>`;

  const pages = {
    home() {
      const latest = [...ACCIDENTS].sort(byDate).slice(0, 6);
      v.innerHTML = `<h1>내 서비스도 해당될까?</h1><p class="lead">서비스의 사고 이력과 확인할 정보를 살펴보세요.</p>
<form class="panel" id="sf"><div class="panel-title"><strong>서비스 검색</strong></div><div class="input-wrap"><input type="search" name="q" aria-label="서비스명 검색" placeholder="쇼핑몰, 배달 앱 이름"><button class="button primary">검색</button></div></form>
<form class="panel soft" id="rf"><div class="panel-title"><strong>내 서비스 등록</strong></div><div class="input-wrap"><input type="text" name="s" aria-label="등록할 서비스명" placeholder="서비스명 입력"><button class="button">등록</button></div></form>
<div class="section-heading"><h2>최신 사고</h2><a class="icon-btn right" href="${P("list.html")}" aria-label="전체 사고 보기">${ICON.next}</a></div>
<div class="grid-2">${latest.map((a) => card(a, "mini")).join("")}</div>`;
      $("sf").onsubmit = (e) => { e.preventDefault(); location.href = P("list.html") + "?q=" + encodeURIComponent(e.target.q.value.trim()); };
      $("rf").onsubmit = (e) => { e.preventDefault(); addService(e.target.s.value); location.href = P("my.html"); };
    },

    list() {
      const p = new URLSearchParams(location.search); let q = p.get("q") || "", cats = (p.get("cat") || "").split(",").filter(Boolean);
      const CATS = [...new Set(ACCIDENTS.map((a) => a.cat))];
      v.innerHTML = `<form class="panel" id="lf"><div class="input-wrap"><input type="search" id="q" value="${esc(q)}" placeholder="서비스명 또는 사고명" aria-label="서비스명 또는 사고명"><button class="button primary">검색</button></div><div class="chips" id="cats" style="margin-top:12px">${CATS.map((c) => `<button type="button" class="chip" data-c="${c}">${c}</button>`).join("")}</div></form><div id="res"></div><a class="button primary full" id="cmpbtn" href="#">선택한 사고 비교</a>`;
      const upd = () => { const n = db.cmp.length, b = $("cmpbtn"); b.textContent = n ? `선택한 ${n}건 비교` : "선택한 사고 비교"; b.href = P("compare.html") + "?ids=" + db.cmp.join(","); b.setAttribute("aria-disabled", n < 2); };
      const draw = () => {
        document.querySelectorAll("#cats .chip").forEach((b) => b.classList.toggle("active", cats.includes(b.dataset.c)));
        const k = q.trim().toLowerCase(), r = ACCIDENTS.filter((a) => (!cats.length || cats.includes(a.cat)) && (!k || (a.title + a.service + a.cat).toLowerCase().includes(k))).sort(byDate);
        $("res").innerHTML = `<div class="row between" style="margin:14px 0 4px"><strong>사고 ${r.length}건</strong><span class="chip">최신순</span></div>` + (r.length ? r.map((a) => card(a, "list")).join("") : empty("조건에 맞는 사고가 없습니다.", '<button class="button small-button" id="reset">조건 초기화</button>'));
        const u = new URLSearchParams(); if (q) u.set("q", q); if (cats.length) u.set("cat", cats.join(","));
        history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "")); upd();
      };
      $("lf").onsubmit = (e) => { e.preventDefault(); q = $("q").value; draw(); };
      $("cats").onclick = (e) => { const c = e.target.dataset.c; if (c) { cats = cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c]; draw(); } };
      $("res").onclick = (e) => { if (e.target.id === "reset") { q = ""; cats = []; $("q").value = ""; draw(); } };
      $("res").onchange = (e) => {
        const id = +e.target.dataset.id; if (!id) return;
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
      v.innerHTML = `<h1>${a.title}</h1><div class="row"><span class="chip">${a.cat}</span>${worry(a) ? '<span class="chip warning">⚠ 걱정 항목</span>' : ""}</div>
<section class="panel"><h2>개요</h2><div class="key-value"><span>발생일</span><span>${a.date}</span><span>유출 항목</span><span>${a.items.join(", ")}</span><span>유형</span><span>${a.type}</span></div></section>
<section class="panel"><h2>사고 내용</h2><p>${a.summary}</p></section>
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
      const rows = [["분야", (a) => a.cat], ["발생일", (a) => a.date], ["규모", (a) => a.count], ["유출 항목", (a) => a.items.join("·")], ["원인", (a) => a.type], ["제재", (a) => a.sanction], ["걱정 항목", (a) => (worry(a) ? "⚠ 포함" : "-")]];
      v.innerHTML = `<section class="panel"><div class="compare-grid" style="grid-template-columns:64px repeat(${L.length},1fr)"><span></span>${L.map((a) => `<span class="col-title">${a.service}</span>`).join("")}${rows.map(([k, f]) => `<span class="k">${k}</span>` + L.map((a) => `<span>${f(a)}</span>`).join("")).join("")}</div></section><div class="row">${L.map((a) => `<a class="button small-button" href="${P("detail.html")}?id=${a.id}">${a.service} 상세</a>`).join("")}</div>`;
    },

    my() {
      const rel = (s) => ACCIDENTS.filter((a) => a.service.includes(s) || s.includes(a.service));
      const draw = () => {
        const tl = [...new Set(db.services.flatMap(rel))].sort((a, b) => a.date.localeCompare(b.date));
        v.innerHTML = `<form class="panel" id="af"><div class="input-wrap"><input type="text" name="s" placeholder="서비스명 입력" aria-label="서비스명 입력"><button class="button primary">추가</button></div></form>
${db.services.length ? db.services.map((s, i) => `<article class="service-card"><div class="panel-title"><strong>${esc(s)}</strong></div><p class="small">관련 사고 ${rel(s).length}건</p><div class="row"><a class="button small-button" href="${P("list.html")}?q=${encodeURIComponent(s)}">사고 보기</a><button class="button small-button" data-del="${i}">삭제</button></div></article>`).join("") : empty("등록한 서비스가 없습니다.")}
<section class="panel"><h2>걱정되는 정보</h2><div class="chips">${ITEMS.map((i) => `<label class="chip"><input type="checkbox" data-w="${i}" ${db.worries.includes(i) ? "checked" : ""}> ${i}</label>`).join("")}</div></section>
<section class="panel"><h2>사고 연표</h2>${tl.length ? `<div class="timeline">${tl.map((a) => `<div class="timeline-item"><div class="muted">${a.date}</div><a href="${P("detail.html")}?id=${a.id}">${a.title}</a>${worry(a) ? '<div><span class="chip warning">⚠ 걱정 항목</span></div>' : ""}</div>`).join("")}</div>` : '<p class="muted">등록한 서비스와 관련된 사고가 없습니다.</p>'}</section>
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
      v.onchange = (e) => { if (e.target.dataset.i) { toggleCheck(+e.target.dataset.id, +e.target.dataset.i, e.target.checked); pages.checklist(); } };
    }
  };
  (pages[body.dataset.page] || (() => {}))();
});
