/* =========================================================
   共通処理
   ・画像の自動読み込み（jpg → png → webp → jpeg の順に探す）
   ・寄付ボタンのリンク設定
   ・代表者名の差し込み
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var EXTS = ["jpg", "png", "webp", "jpeg"];

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // 本文の整形：{{NAME}} 置換 → エスケープ → **太字** → 改行
  function fmt(text) {
    var s = String(text).replace(/\{\{NAME\}\}/g, SITE.REP_NAME || "");
    s = escapeHTML(s);
    s = s.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\n/g, "<br>");
    return s;
  }

  // 画像スロット：data-img="doboku/02" → images/doboku/02.jpg などを探す
  function imgSlot(key, alt) {
    var el = document.createElement("div");
    el.className = "img-slot";
    el.setAttribute("data-img", key);
    if (alt) el.setAttribute("data-alt", alt);
    if (SITE.SHOW_IMAGE_LABELS) {
      var label = document.createElement("span");
      label.className = "img-label";
      label.innerHTML = "<code>images/" + escapeHTML(key) + ".jpg</code> を置くと表示されます";
      el.appendChild(label);
    }
    return el;
  }

  function loadImage(slot) {
    if (slot.getAttribute("data-loading")) return;
    slot.setAttribute("data-loading", "1");
    var base = "images/" + slot.getAttribute("data-img");
    var i = 0;
    var img = new Image();
    img.alt = slot.getAttribute("data-alt") || "";
    img.decoding = "async";
    img.onload = function () {
      slot.classList.add("has-img");
      slot.appendChild(img);
    };
    img.onerror = function () {
      i += 1;
      if (i < EXTS.length) {
        img.src = base + "." + EXTS[i];
      } else {
        slot.classList.add("is-empty");
      }
    };
    img.src = base + "." + EXTS[0];
  }

  function loadAllImages(root) {
    var slots = (root || document).querySelectorAll(".img-slot[data-img]");
    // 最初の3枚はすぐ、残りはページ読み込み後
    Array.prototype.forEach.call(slots, function (s, idx) {
      if (idx < 3) loadImage(s);
    });
    var rest = function () {
      Array.prototype.forEach.call(slots, loadImage);
    };
    if (document.readyState === "complete") rest();
    else window.addEventListener("load", rest);
  }

  function applyDonate() {
    document.querySelectorAll("[data-donate]").forEach(function (a) {
      a.href = SITE.DONATE_URL || "#";
      a.target = "_blank";
      a.rel = "noopener";
    });
    document.querySelectorAll("[data-project]").forEach(function (a) {
      a.href = SITE.PROJECT_URL || "#";
      a.target = "_blank";
      a.rel = "noopener";
    });
    document.querySelectorAll("[data-name]").forEach(function (el) {
      el.textContent = SITE.REP_NAME || "";
    });
  }

  window.HZ = {
    fmt: fmt,
    escapeHTML: escapeHTML,
    imgSlot: imgSlot,
    loadAllImages: loadAllImages,
    applyDonate: applyDonate
  };
})();
