const titles = [
  "🧰 Mind over Machine",
  "🧠 Himal’s Realm",
  "🌿 The Reflective Engineer",
  "💬 Tech & Tranquility",
  "🎨 Wired Soul Journal"
];
const taglines = [
  "Command lines and clarity.",
  "Where thoughts find structure.",
  "Building systems within.",
  "Bridges between people and progress.",
  "Glitch, art, and emotion."
];
let i = 0;
function rotate() {
  const t = document.querySelector("#title");
  const s = document.querySelector("#tagline");
  if (!t || !s) return;
  t.textContent = titles[i];
  s.textContent = taglines[i];
  document.body.setAttribute("data-theme", titles[i]); // For accent CSS
  i = (i + 1) % titles.length;
}
setInterval(rotate, 5000);
rotate();
