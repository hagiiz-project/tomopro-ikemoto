/* =========================================================
   トップページ
   ・挨拶動画（YouTube / 動画ファイル / 未設定なら静止画）
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var HZ = window.HZ;
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
  } else {
    frame.appendChild(HZ.imgSlot("top/video-poster", "HagiiZ 代表からのあいさつ"));
  }

  // 扉の画像
  document.querySelectorAll("[data-slot]").forEach(function (el) {
    el.parentNode.replaceChild(HZ.imgSlot(el.getAttribute("data-slot"), el.getAttribute("data-alt")), el);
  });

  HZ.applyDonate();
  HZ.loadAllImages(document);
})();
