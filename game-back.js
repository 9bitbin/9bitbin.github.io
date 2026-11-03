/*
  game-back.js — adds a brass "Games" back button to a game page.
  Add to any game:  <script src="/game-back.js" defer></script>
  It takes you to the Pinned app's Games screen (/pinned/?games).
  If it covers the game's score, move it: data-pos="bl" (bottom-left), "br" or "tr".
  Inside the Pinned app the game runs in a frame that already has a Back button,
  so this button only shows when the game is opened on its own.
*/
(function () {
  if (window.self !== window.top) return;            // inside Pinned: it has its own Back
  var HREF = "/pinned/?games";
  var me = document.currentScript;
  var pos = (me && me.getAttribute("data-pos")) || "tl";
  var y = pos.charAt(0) === "b" ? "bottom:calc(env(safe-area-inset-bottom,0px) + 10px)" : "top:calc(env(safe-area-inset-top,0px) + 10px)";
  var x = pos.charAt(1) === "r" ? "right:calc(env(safe-area-inset-right,0px) + 10px)" : "left:calc(env(safe-area-inset-left,0px) + 10px)";

  function add() {
    if (document.getElementById("nbb-back")) return;
    var css = document.createElement("style");
    css.textContent =
      "#nbb-back{position:fixed;z-index:2147483000;" + y + ";" + x + ";" +
      "display:inline-flex;align-items:center;gap:6px;padding:6px 12px 6px 10px;min-height:34px;box-sizing:border-box;" +
      "font:600 14px/1 'Chakra Petch',system-ui,sans-serif;letter-spacing:.04em;text-decoration:none;color:#1A1408;" +
      "background:linear-gradient(180deg,#E2BE73,#C49A4E 45%,#7A5A26);border:1px solid #3B2B10;border-radius:3px;" +
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 0 #2A1E0A,0 4px 14px rgba(0,0,0,.45);opacity:.9;" +
      "-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:manipulation}" +
      "#nbb-back:hover,#nbb-back:focus-visible{opacity:1}" +
      "#nbb-back:focus-visible{outline:2px solid #6DFF8E;outline-offset:3px}" +
      "#nbb-back:active{transform:translateY(1px)}" +
      "#nbb-back b{font-size:18px;line-height:0;margin-top:-2px}" +
      "@media print{#nbb-back{display:none}}";
    document.head.appendChild(css);

    var a = document.createElement("a");
    a.id = "nbb-back";
    a.href = HREF;
    a.setAttribute("aria-label", "Back to Pinned games");
    a.innerHTML = "<b aria-hidden='true'>‹</b>Games";
    // keep taps on the button from also counting as a game input (flap, jump, etc.)
    ["pointerdown", "mousedown", "touchstart", "keydown"].forEach(function (t) {
      a.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true });
    });
    document.body.appendChild(a);
  }
  if (document.body) add(); else document.addEventListener("DOMContentLoaded", add);
})();
