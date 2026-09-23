/* =========================================================
   トップページのミニ模型
   ボタンを押すと雨が降り、水位が上がり、やがて堤防を越える。
   HagiiZが洪水模型で確かめた「現象の主語を自分に変える」を、
   サイト上でそのまま体験してもらうための仕掛けです。
   ========================================================= */

(function () {
  "use strict";

  var stage = document.getElementById("model");
  if (!stage) return;

  // y が小さいほど水位は高い。堤防の天端は y=116。
  var STEPS = [
    { y: 172, text: "ボタンを押すと、雨が降ります。" },
    { y: 150, text: "水位が上がりました。" },
    { y: 122, text: "もう少しで、堤防を越えます。" },
    { y: 106, text: "越えました。" }
  ];
  var LAST = "自分で降らせた雨は、他人事になりません。<br>これが、私たちのやり方です。";

  var step = 0;
  var water = stage.querySelector(".model-water");
  var caption = document.getElementById("model-caption");
  var btn = document.getElementById("model-btn");
  var reset = document.getElementById("model-reset");
  var rain = stage.querySelector(".model-rain");
  var flood = stage.querySelector(".model-flood");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function draw() {
    var s = STEPS[Math.min(step, STEPS.length - 1)];
    water.setAttribute("y", String(s.y));
    water.setAttribute("height", String(178 - s.y));
    caption.innerHTML = step >= 3 ? s.text + "<br>" + LAST : s.text;
    stage.classList.toggle("is-flooded", step >= 3);
    reset.hidden = step === 0;
    btn.textContent = step >= 3 ? "もう一度、降らせる" : "雨を降らせる";
  }

  function pour() {
    if (step >= 3) { step = 0; draw(); return; }
    step += 1;
    if (!reduce) {
      rain.classList.remove("is-raining");
      void rain.offsetWidth;
      rain.classList.add("is-raining");
    }
    draw();
  }

  btn.addEventListener("click", pour);
  reset.addEventListener("click", function () { step = 0; draw(); });
  draw();
})();
