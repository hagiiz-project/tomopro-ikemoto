/* =========================================================
   トップページのミニ模型
   ボタンを押すと雨が降り、水位が上がり、3回目で堤防を越える。
   越えた瞬間に「この体験を届けたい」という支援の入口を出す。
   文言は STEPS と LAST で変えられます。
   ========================================================= */

(function () {
  "use strict";

  var stage = document.getElementById("model");
  if (!stage) return;

  // y が小さいほど水位は高い。堤防の天端は y=114。
  var STEPS = [
    { y: 172, text: "ボタンを押すと、雨が降ります。" },
    { y: 150, text: "水位が上がりました。あと2回。" },
    { y: 122, text: "もう少しで、堤防を越えます。" },
    { y: 106, text: "越えました。" }
  ];
  var LAST = "自分で降らせた雨は、他人事になりません。";

  var step = 0;
  var water = stage.querySelector(".model-water");
  var caption = document.getElementById("model-caption");
  var btn = document.getElementById("model-btn");
  var reset = document.getElementById("model-reset");
  var cta = document.getElementById("model-cta");
  var rain = stage.querySelector(".model-rain");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function draw() {
    var s = STEPS[Math.min(step, STEPS.length - 1)];
    var flooded = step >= 3;
    water.setAttribute("y", String(s.y));
    water.setAttribute("height", String(178 - s.y));
    caption.innerHTML = flooded ? s.text + "<br>" + LAST : s.text;
    stage.classList.toggle("is-flooded", flooded);
    reset.hidden = step === 0;
    btn.hidden = flooded;
    if (cta) cta.hidden = !flooded;
    btn.textContent = step === 0 ? "雨を降らせる" : "もっと降らせる";
    btn.setAttribute("data-step", String(step));
  }

  function pour() {
    step += 1;
    if (!reduce) {
      rain.classList.remove("is-raining");
      void rain.offsetWidth;
      rain.classList.add("is-raining");
      stage.classList.remove("is-shake");
      if (step >= 3) { void stage.offsetWidth; stage.classList.add("is-shake"); }
    }
    draw();
    if (step >= 3 && window.HZ) window.HZ.track("model_flood", {});
  }

  btn.addEventListener("click", pour);
  reset.addEventListener("click", function () { step = 0; draw(); btn.focus(); });
  draw();
})();
