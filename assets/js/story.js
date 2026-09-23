/* =========================================================
   物語ページ
   ・content/*.js の場面を描画
   ・PC（幅960px以上）：縦スクロールで左→右へ流れる
   ・スマホ／動きを減らす設定：上→下へ流れる
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var STORY = window.STORY;
  var HZ = window.HZ;
  if (!STORY || !HZ) return;

  var main = document.getElementById("story");
  var layer = STORY.layer;

  /* ---------- 描画 ---------- */

  function paras(list) {
    return (list || []).map(function (t) { return "<p>" + HZ.fmt(t) + "</p>"; }).join("");
  }

  function itemsHTML(items, start) {
    var st = start ? ' style="counter-reset: item ' + (start - 1) + '"' : "";
    return '<ol class="items"' + st + '>' + items.map(function (it) {
      var link = "";
      if (it.link && it.link.url) {
        link = '<a href="' + HZ.escapeHTML(it.link.url) + '" target="_blank" rel="noopener">' +
          HZ.escapeHTML(it.link.text) + "</a>";
      }
      return "<li><h3>" + HZ.fmt(it.title) + "</h3><p>" + HZ.fmt(it.text) + "</p>" + link + "</li>";
    }).join("") + "</ol>";
  }

  function stagesHTML() {
    var funds = paras(SITE.FUNDS);
    var stages = (SITE.STAGES || []).slice().reverse().map(function (s) {
      return "<li>" +
        '<div class="gauge-amount">' + HZ.escapeHTML(s.amount) +
        (s.goal ? '<span class="gauge-goal">目標</span>' : "") + "</div>" +
        "<h3>" + HZ.fmt(s.title) + "</h3>" +
        "<p>" + HZ.fmt(s.text) + "</p></li>";
    }).join("");
    return '<div class="funds-grid"><div class="funds">' + funds + '</div><ol class="gauge" aria-label="調達額ごとのステージ">' + stages + "</ol></div>";
  }

  function sceneHTML(sc, idx) {
    var kind = sc.kind || "text";
    var art = document.createElement("article");
    art.className = "scene scene--" + kind;
    art.setAttribute("data-idx", idx);

    var fig = null;
    if (kind !== "win" && kind !== "links") {
      fig = document.createElement("figure");
      fig.className = "scene-fig";
      fig.appendChild(HZ.imgSlot(layer + "/" + sc.id, sc.heading || STORY.title));
    }

    var text = document.createElement("div");
    text.className = "scene-text";

    var html = "";
    if (kind === "cover") {
      html += '<span class="cover-label">' + HZ.escapeHTML(STORY.label) + "</span>";
      html += '<h1 class="cover-title">' + HZ.fmt(STORY.title) + "</h1>";
      html += '<p class="cover-hint"><span class="hint-v">下へスクロールすると、物語が進みます。</span>' +
        '<span class="hint-h">下へスクロールすると、物語が右へ進みます。</span></p>';
    } else if (kind === "win") {
      html += '<span class="win-label">この取り組みで、変わること</span>';
      html += paras(sc.body);
    } else if (kind === "links") {
      html += "<h2>関連リンク</h2>";
      html += '<ul class="story-links">' + (STORY.links || []).map(function (l) {
        return '<li><a href="' + HZ.escapeHTML(l.url) + '" target="_blank" rel="noopener">' +
          HZ.escapeHTML(l.text) + "</a></li>";
      }).join("") + "</ul>";
      html += '<p><a class="home-link" href="index.html">トップページへ戻る</a></p>';
    } else {
      if (sc.heading) html += "<h2>" + HZ.fmt(sc.heading) + "</h2>";
      html += paras(sc.body);
      if (sc.researchmap && SITE.RESEARCHMAP_URL) {
        html += '<p><a class="researchmap-link" href="' + HZ.escapeHTML(SITE.RESEARCHMAP_URL) +
          '" target="_blank" rel="noopener">researchmap（研究業績）</a></p>';
      }
      if (sc.items) html += itemsHTML(sc.items, sc.start);
      if (sc.win) {
        html += '<div class="win"><span class="win-label">この取り組みで、変わること</span><p>' +
          HZ.fmt(sc.win) + "</p></div>";
      }
      if (kind === "stages") html += stagesHTML();
      if (kind === "cta") {
        html += '<p class="sign">東北大学発 HagiiZ 代表　' + HZ.escapeHTML(SITE.REP_NAME || "") + "</p>";
        html += '<div class="cta-row">' +
          '<a class="btn btn--donate" data-donate href="#">寄付する</a>' +
          '<a class="btn btn--sub" data-project href="#">宮岸プロジェクトを見る</a></div>';
      }
    }
    text.innerHTML = html;

    if (fig) art.appendChild(fig);
    art.appendChild(text);
    return art;
  }

  var flow = document.createElement("section");
  flow.className = "flow";
  flow.setAttribute("aria-label", STORY.title);

  var sticky = document.createElement("div");
  sticky.className = "flow-sticky";
  var track = document.createElement("div");
  track.className = "flow-track";

  var riverV = document.createElement("div");
  riverV.className = "flow-river-v";
  flow.appendChild(riverV);

  // 横の川（SVG）
  var NS = "http://www.w3.org/2000/svg";
  var river = document.createElementNS(NS, "svg");
  river.setAttribute("class", "river");
  river.setAttribute("aria-hidden", "true");
  var bed = document.createElementNS(NS, "path");
  bed.setAttribute("class", "river-bed");
  var water = document.createElementNS(NS, "path");
  water.setAttribute("class", "river-flow");
  river.appendChild(bed);
  river.appendChild(water);
  track.appendChild(river);

  var allScenes = STORY.scenes.concat([{ id: "links", kind: "links" }]);
  var scenes = allScenes.map(function (sc, i) {
    var el = sceneHTML(sc, i);
    track.appendChild(el);
    return el;
  });

  sticky.appendChild(track);
  flow.appendChild(sticky);
  main.innerHTML = "";
  main.appendChild(flow);


  document.title = STORY.title + "｜HagiiZ";
  HZ.applyDonate();
  HZ.loadAllImages(main);

  /* ---------- スクロール制御 ---------- */

  var fill = document.querySelector(".bar-fill");
  var count = document.querySelector(".bar-count");
  var mq = window.matchMedia("(min-width: 960px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)");
  var horizontal = false;
  var maxX = 0;
  var riverLen = 0;
  var ticking = false;

  function buildRiver() {
    var w = track.scrollWidth;
    var h = 60;
    river.setAttribute("width", w);
    river.setAttribute("height", h);
    river.setAttribute("viewBox", "0 0 " + w + " " + h);
    // 上流から下流へ、ゆるやかに蛇行する線
    var d = "M 0 " + (h / 2);
    var step = 40;
    for (var x = step; x <= w; x += step) {
      var y = h / 2 + Math.sin(x / 210) * 14 + Math.sin(x / 67) * 4;
      d += " L " + x + " " + y.toFixed(1);
    }
    bed.setAttribute("d", d);
    water.setAttribute("d", d);
    riverLen = water.getTotalLength();
    water.style.strokeDasharray = riverLen;
    water.style.strokeDashoffset = riverLen;
  }

  function layout() {
    horizontal = mq.matches;
    document.body.classList.toggle("is-horizontal", horizontal);
    if (horizontal) {
      // 文字が収まらない場面は、横幅を広げて文字の列を太くする
      scenes.forEach(function (el) { el.classList.remove("scene--wide", "scene--wider", "scene--textonly"); });
      scenes.forEach(function (el) {
        var t = el.querySelector(".scene-text");
        if (t && t.scrollHeight > t.clientHeight + 2) el.classList.add("scene--wide");
      });
      scenes.forEach(function (el) {
        var t = el.querySelector(".scene-text");
        if (el.classList.contains("scene--wide") && t && t.scrollHeight > t.clientHeight + 2) el.classList.add("scene--wider");
      });
      // それでも収まらない場面（画面の低いPC）は、絵を外して文字を2段にする
      scenes.forEach(function (el) {
        var t = el.querySelector(".scene-text");
        if (el.classList.contains("scene--wider") && t && t.scrollHeight > t.clientHeight + 2) el.classList.add("scene--textonly");
      });
      // 横幅ぶんだけ縦にスクロールできる高さを確保
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      maxX = Math.max(0, track.scrollWidth - vw);
      flow.style.setProperty("--flow-h", (maxX + vh) + "px");
      buildRiver();
    } else {
      flow.style.removeProperty("--flow-h");
      track.style.transform = "";
      maxX = 0;
    }
    update();
  }

  function progress() {
    if (horizontal) {
      var top = flow.getBoundingClientRect().top;
      return maxX > 0 ? Math.min(1, Math.max(0, -top / maxX)) : 0;
    }
    var rect = flow.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
  }

  function currentIndex() {
    var best = 0;
    var bestDist = Infinity;
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    scenes.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      var d = horizontal ? Math.abs((r.left + r.right) / 2 - cx) : Math.abs((r.top + Math.min(r.bottom, r.top + window.innerHeight)) / 2 - cy);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  function update() {
    ticking = false;
    var p = progress();
    if (horizontal) {
      track.style.transform = "translate3d(" + (-p * maxX) + "px,0,0)";
      var tw = track.scrollWidth || 1;
      var reach = Math.min(1, (p * maxX + window.innerWidth * 0.5) / tw);
      water.style.strokeDashoffset = riverLen * (1 - reach);
    } else {
      var rect = flow.getBoundingClientRect();
      var readTo = Math.max(0, Math.min(rect.height, window.innerHeight * 0.6 - rect.top));
      riverV.style.height = readTo + "px";
    }
    if (fill) fill.style.width = (p * 100).toFixed(1) + "%";
    if (count) count.textContent = (currentIndex() + 1) + " / " + scenes.length;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  // PCでは左右キーでも1場面ずつ進める
  function onKey(e) {
    if (!horizontal) return;
    var tag = (e.target && e.target.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    var i = currentIndex() + (e.key === "ArrowRight" ? 1 : -1);
    i = Math.max(0, Math.min(scenes.length - 1, i));
    var target = scenes[i].offsetLeft - (window.innerWidth - scenes[i].offsetWidth) / 2;
    target = Math.max(0, Math.min(maxX, target));
    var flowTop = flow.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: flowTop + target, behavior: "smooth" });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { window.requestAnimationFrame(layout); });
  window.addEventListener("keydown", onKey);
  if (mq.addEventListener) mq.addEventListener("change", layout);
  window.addEventListener("load", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();
