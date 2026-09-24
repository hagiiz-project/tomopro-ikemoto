/* =========================================================
   物語ページ（縦に読む）
   ・content/*.js の場面を上から順に描く
   ・段落全体が **…** の行は「主張」（太いゴシック）、それ以外は「説明」（手書き体）
   ・倍速モード：主張と見出しだけを残して、約2分で読めるようにする
   ・上のバー：場面ごとの読んだ量（ストーリーズ風）と、のこり時間
   ・途中と最後に、支援の入口
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var STORY = window.STORY;
  var HZ = window.HZ;
  if (!STORY || !HZ) return;

  var main = document.getElementById("story");
  var layer = STORY.layer;
  var CPM = 500; // 1分で読める文字数の目安

  var LAYERS = {
    science: { href: "science.html", label: "教育・科学に携わる方へ", title: "いろんなかたちの好奇心が、光る場をつくりたい" },
    doboku:  { href: "doboku.html",  label: "土木・インフラに携わる方へ", title: "守られた日常が、誰かの仕事の結果だと知られてほしい" },
    bosai:   { href: "bosai.html",   label: "防災に携わる方へ", title: "防災に関心がない人にこそ、届いてほしい" }
  };

  /* ---------- 〔未記入〕の扱い ----------
     制作中：黄色で見せる。
     公開時：注記（論文名・進捗・出典）は消し、数字などの穴が残る段落は隠す。 */
  var STRIP = /〔(論文名|進捗|出典)[^〕]*〕/g;
  function clean(text) {
    if (text === undefined || text === null) return text;
    if (HZ.DRAFT || !HZ.hasTodo(text)) return text;
    var t = String(text).replace(STRIP, "");
    return HZ.hasTodo(t) ? null : t;
  }

  function plainLen(text) {
    return String(text || "").replace(/\*\*/g, "").replace(/\s/g, "").length;
  }

  /* ---------- 描画 ---------- */

  function paras(list, stat) {
    return (list || []).map(function (raw) {
      var t = clean(raw);
      if (t === null) return "";
      if (HZ.isClaim(t)) {
        stat.claims += 1;
        stat.fast += plainLen(t);
        stat.all += plainLen(t);
        return '<p class="claim"><span class="hl">' + HZ.fmt(t.trim().slice(2, -2)) + "</span></p>";
      }
      stat.all += plainLen(t);
      return '<p class="note">' + HZ.fmt(t) + "</p>";
    }).join("");
  }

  function itemsHTML(items, stat) {
    return '<ul class="items">' + items.map(function (it) {
      var text = clean(it.text);
      stat.all += plainLen(it.title) + plainLen(text);
      stat.fast += plainLen(it.title);
      stat.claims += 1;
      var link = "";
      if (it.link && it.link.url) {
        link = '<a class="item-link" href="' + HZ.escapeHTML(it.link.url) + '" target="_blank" rel="noopener">' +
          HZ.escapeHTML(it.link.text) + "</a>";
      }
      return '<li class="item"><h3 class="item-title">' + HZ.fmt(it.title) + "</h3>" +
        (text ? '<p class="note item-text">' + HZ.fmt(text) + "</p>" : "") + link + "</li>";
    }).join("") + "</ul>";
  }

  function supportHTML() {
    var stages = HZ.stagesHTML();
    return '<div class="support-box">' +
      '<div class="support-col">' +
        '<p class="claim"><span class="hl">' + HZ.yen(SITE.GOAL || 0) + "を、こう使います。</span></p>" +
        HZ.fundsHTML() +
        '<div class="progress-meter" data-gauge></div>' +
      "</div>" +
      '<div class="support-col">' +
        '<h3 class="mini-title">あなたの寄付で、できること</h3>' + HZ.unitsHTML() +
        (stages ? '<h3 class="mini-title">目標を超えたら</h3>' + stages : "") +
      "</div>" +
      '<div class="support-col">' +
        '<h3 class="mini-title">寄付すると届くもの</h3>' + HZ.giftsHTML() +
        '<h3 class="mini-title">寄付のしかた</h3>' + HZ.howtoHTML() +
        '<a class="btn btn--donate btn--lg btn--block" data-donate="story-support" href="#">寄付する</a>' +
      "</div></div>";
  }

  function crossHTML() {
    if (!SITE.CROSS_LINKS) return "";
    var others = Object.keys(LAYERS).filter(function (k) { return k !== layer; });
    return '<div class="cross"><h3 class="mini-title">ほかの視点からも読めます</h3><div class="cross-grid">' +
      others.map(function (k) {
        var L = LAYERS[k];
        return '<a class="cross-card" data-layer="' + k + '" href="' + L.href + '">' +
          '<span class="door-pill">' + HZ.escapeHTML(L.label) + "</span>" +
          '<span class="cross-title">' + HZ.escapeHTML(L.title) + "</span></a>";
      }).join("") + "</div></div>";
  }

  function midHTML() {
    return '<aside class="mid" aria-label="ここで半分">' +
      '<p class="mid-claim">ここで、ちょうど半分。</p>' +
      '<p class="note">この先は、私たちが積み上げてきたことと、「ともプロ！2026」で挑戦することの話です。<br>先にお金の使い道だけ見るのも大歓迎です。</p>' +
      '<div class="btn-row">' +
        '<a class="btn btn--sub" href="#support">使い道だけ見る</a>' +
        '<a class="btn btn--donate" data-donate="story-mid" href="#">寄付する</a>' +
      "</div></aside>";
  }

  function sceneEl(sc, idx) {
    var kind = sc.kind || "text";
    var stat = { all: 0, fast: 0, claims: 0 };
    var art = document.createElement("article");
    art.className = "scene scene--" + kind;
    art.id = kind === "stages" ? "support" : "s-" + idx;
    art.setAttribute("data-idx", idx);

    var html = "";
    if (sc.heading) {
      stat.all += plainLen(sc.heading);
      stat.fast += plainLen(sc.heading);
      stat.claims += 1;
      html += '<h2 class="scene-title">' + HZ.fmt(sc.heading) + "</h2>";
    }

    if (kind === "win") {
      html = '<span class="win-label">この取り組みで、変わること</span>' + paras(sc.body, stat);
    } else {
      html += paras(sc.body, stat);
      if (sc.researchmap && SITE.RESEARCHMAP_URL) {
        html += '<p><a class="item-link" href="' + HZ.escapeHTML(SITE.RESEARCHMAP_URL) +
          '" target="_blank" rel="noopener">researchmap（研究業績）</a></p>';
      }
      if (sc.items) html += itemsHTML(sc.items, stat);
      if (kind === "stages") html += supportHTML();
      if (kind === "cta") {
        var name = HZ.hasTodo(SITE.REP_NAME) && !HZ.DRAFT ? "" : (SITE.REP_NAME || "");
        html += '<p class="sign note">東北大学発 HagiiZ 代表　' + HZ.fmt(name) + "</p>";
        html += '<div class="btn-row">' +
          '<a class="btn btn--donate btn--lg" data-donate="story-end" href="#">寄付する</a></div>';
        html += HZ.shareHTML();
        html += crossHTML();
      }
    }

    var text = document.createElement("div");
    text.className = "scene-text";
    text.innerHTML = html;

    // 見出しも主張も無い場面は、倍速モードでは最初の説明だけ残す
    var hasClaim = text.querySelector(".claim, .item-title");
    if (!hasClaim && kind !== "stages" && kind !== "cta") {
      art.classList.add("no-claim");
      var first = text.querySelector(".note");
      if (first) {
        first.classList.add("keep");
        stat.fast += plainLen(first.textContent);
      }
    }

    if (kind !== "win" && kind !== "stages") {
      var fig = document.createElement("figure");
      fig.className = "scene-fig";
      fig.setAttribute("data-hide-empty", "");
      fig.appendChild(HZ.imgSlot(layer + "/" + sc.id, sc.heading ? sc.heading.replace(/\*\*/g, "") : STORY.title));
      art.appendChild(fig);
    }
    art.appendChild(text);
    art._stat = stat;
    return art;
  }

  function coverEl(sc, total) {
    var sec = document.createElement("section");
    sec.className = "cover";
    sec.id = "top";
    var tl = (STORY.tldr || []).map(function (t) { return "<li>" + HZ.fmt(t) + "</li>"; }).join("");
    sec.innerHTML =
      '<div class="cover-text">' +
        '<span class="door-pill cover-pill">' + HZ.escapeHTML(STORY.label) + "</span>" +
        '<h1 class="cover-title">' + HZ.fmt(STORY.title) + "</h1>" +
        (tl ? '<div class="tldr"><p class="tldr-h">3行でいうと</p><ol>' + tl + "</ol></div>" : "") +
        '<div class="cover-actions">' +
          '<button class="btn btn--fast" type="button" data-fast-on>⚡ 倍速で読む（約' + total.fast + "分）</button>" +
          '<a class="btn btn--sub" href="#s-1" data-read>全部読む（約' + total.all + "分）</a>" +
        "</div>" +
        '<a class="btn-text cover-skip" href="#support">先に、お金の使い道を見る</a>' +
      "</div>";
    var fig = document.createElement("figure");
    fig.className = "cover-fig";
    fig.setAttribute("data-hide-empty", "");
    fig.appendChild(HZ.imgSlot(layer + "/" + sc.id, STORY.title));
    sec.appendChild(fig);
    return sec;
  }

  /* ---------- 組み立て ---------- */

  var scenesData = STORY.scenes.filter(function (s) { return s.kind !== "cover"; });
  var coverData = STORY.scenes.filter(function (s) { return s.kind === "cover"; })[0] || { id: "01" };

  var sceneEls = scenesData.map(function (sc, i) { return sceneEl(sc, i + 1); });
  var sum = sceneEls.reduce(function (a, el) {
    a.all += el._stat.all; a.fast += el._stat.fast; return a;
  }, { all: 0, fast: 0 });
  var FAST_CPM = CPM * 0.8; // 太字の主張は、ゆっくり目に読まれる
  var minutes = {
    all: Math.max(1, Math.round(sum.all / CPM)),
    fast: Math.max(1, Math.round(sum.fast / FAST_CPM))
  };

  var frag = document.createDocumentFragment();
  frag.appendChild(coverEl(coverData, minutes));
  var sentinel = document.createElement("span");
  sentinel.setAttribute("data-dock-after", "");
  frag.appendChild(sentinel);

  var flow = document.createElement("div");
  flow.className = "flow";
  var midAt = Math.floor(sceneEls.length / 2);
  sceneEls.forEach(function (el, i) {
    flow.appendChild(el);
    if (i === midAt - 1) {
      var mid = document.createElement("div");
      mid.innerHTML = midHTML();
      flow.appendChild(mid.firstChild);
    }
  });
  frag.appendChild(flow);

  // 関連リンク
  if (STORY.links && STORY.links.length) {
    var links = document.createElement("section");
    links.className = "story-links";
    links.innerHTML = '<h2 class="mini-title">関連リンク</h2><ul>' + STORY.links.map(function (l) {
      return '<li><a href="' + HZ.escapeHTML(l.url) + '" target="_blank" rel="noopener">' + HZ.escapeHTML(l.text) + "</a></li>";
    }).join("") + '</ul><p><a class="home-link" href="index.html">トップページへ戻る</a></p>';
    frag.appendChild(links);
  }

  main.innerHTML = "";
  main.appendChild(frag);

  document.title = STORY.title.replace(/\*\*/g, "") + "｜HagiiZ";
  HZ.finish(document);
  HZ.loadAllImages(main);
  HZ.stickyBar();

  /* ---------- 上のバー：場面ごとの読んだ量 ---------- */

  var segWrap = document.querySelector(".segs");
  var leftEl = document.querySelector(".bar-left");
  var segs = [];
  if (segWrap) {
    sceneEls.forEach(function () {
      var s = document.createElement("span");
      s.className = "seg";
      s.innerHTML = "<i></i>";
      segWrap.appendChild(s);
      segs.push(s.firstChild);
    });
  }

  var fast = false;
  var ticking = false;

  function update() {
    ticking = false;
    var line = window.innerHeight * 0.55;
    var remainChars = 0;
    sceneEls.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      var p = r.height > 0 ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : (r.top < line ? 1 : 0);
      if (segs[i]) segs[i].style.transform = "scaleX(" + p.toFixed(3) + ")";
      remainChars += (1 - p) * (fast ? el._stat.fast : el._stat.all);
    });
    if (leftEl) {
      var m = Math.ceil(remainChars / (fast ? FAST_CPM : CPM));
      leftEl.textContent = m <= 0 ? "読了" : "のこり約" + m + "分";
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  /* ---------- 倍速モード ---------- */

  var toggles = document.querySelectorAll(".fast-toggle");

  function currentScene() {
    var line = window.innerHeight * 0.35;
    var best = null;
    sceneEls.forEach(function (el) {
      if (el.getBoundingClientRect().top <= line) best = el;
    });
    return best;
  }

  function setFast(on, jump) {
    var anchor = currentScene();
    fast = !!on;
    document.body.classList.toggle("is-fast", fast);
    toggles.forEach(function (b) {
      b.setAttribute("aria-pressed", fast ? "true" : "false");
    });
    HZ.track("fast_mode", { page: layer, on: fast });
    if (jump) {
      document.getElementById("s-1").scrollIntoView({ behavior: HZ.REDUCE ? "auto" : "smooth" });
    } else if (anchor) {
      anchor.scrollIntoView({ behavior: "auto" });
    }
    onScroll();
  }

  toggles.forEach(function (b) {
    b.addEventListener("click", function () { setFast(!fast, false); });
  });
  document.querySelectorAll("[data-fast-on]").forEach(function (b) {
    b.addEventListener("click", function () { setFast(true, true); });
  });
  document.querySelectorAll("[data-read]").forEach(function (a) {
    a.addEventListener("click", function () { if (fast) setFast(false, false); });
  });

  if (/[?&]fast=1/.test(location.search)) setFast(true, false);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", onScroll);
  update();
})();
