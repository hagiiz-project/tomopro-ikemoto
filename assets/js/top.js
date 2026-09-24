/* =========================================================
   トップページ
   ・挨拶動画（未設定のまま公開すると、セクションごと隠す）
   ・支援額ゲージ／ステージ／返礼品／寄付のしかた
   ・扉の画像、残り金額、シェア、下の寄付バー
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var HZ = window.HZ;

  /* 動画 */
  var frame = document.getElementById("video");
  var v = SITE.VIDEO || {};
  if (v.type === "youtube" && v.id) {
    var ifr = document.createElement("iframe");
    ifr.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.id) + "?rel=0&playsinline=1";
    ifr.title = "HagiiZ 代表からのあいさつ";
    ifr.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    ifr.allowFullscreen = true;
    ifr.loading = "lazy";
    frame.appendChild(ifr);
  } else if (v.type === "file" && v.src) {
    var video = document.createElement("video");
    video.src = v.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.poster = "images/top/video-poster.jpg";
    frame.appendChild(video);
  } else if (HZ.DRAFT) {
    frame.appendChild(HZ.imgSlot("top/video-poster", "HagiiZ 代表からのあいさつ"));
  } else {
    document.getElementById("greeting").hidden = true;
  }

  /* 扉の画像 */
  document.querySelectorAll("[data-slot]").forEach(function (el) {
    var slot = HZ.imgSlot(el.getAttribute("data-slot"), el.getAttribute("data-alt"));
    el.appendChild(slot);
  });

  /* ゲージ・ステージ・返礼品・手順・シェア */
  document.getElementById("units").innerHTML = HZ.unitsHTML();
  document.getElementById("funds").innerHTML = HZ.fundsHTML();
  document.getElementById("stages").innerHTML = HZ.stagesHTML();
  document.getElementById("gifts").innerHTML = HZ.giftsHTML();
  document.getElementById("howto").innerHTML = HZ.howtoHTML() +
    '<a class="btn btn--donate btn--lg" data-donate="howto" href="#">寄付する</a>';
  document.getElementById("share").innerHTML = HZ.shareHTML();

  /* 目標まであと〇円（自動更新の数字が届いてから書く） */
  var remain = document.getElementById("remain");
  function writeRemain() {
    var phase = HZ.cfState().phase;
    var min = SITE.MIN_AMOUNT_TEXT || "";
    if (phase === "before") {
      remain.textContent = "受付は10月1日から。" + min + "応援できます。";
    } else if (phase === "after") {
      remain.textContent = "受付は終了しました。たくさんの応援、ありがとうございました。";
    } else if (typeof SITE.CURRENT === "number" && SITE.CURRENT > 0) {
      var left = Math.max(0, SITE.GOAL - SITE.CURRENT);
      remain.textContent = left > 0
        ? "目標まで、あと" + HZ.yen(left) + "。" + min + "応援できます。"
        : "目標を達成しました。ありがとうございます。11月30日まで受け付けています。";
    } else {
      remain.textContent = "最初の一人になってください。" + min + "応援できます。";
    }
  }
  document.addEventListener("hz:progress", writeRemain);

  HZ.finish(document);
  HZ.loadAllImages(document);
  HZ.stickyBar();
})();
