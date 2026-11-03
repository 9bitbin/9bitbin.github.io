const floatingLayer = document.getElementById("floatingLayer");
const surpriseBtn = document.getElementById("surpriseBtn");
const message = document.getElementById("message");

const symbols = ["❤️", "💕", "💖", "🌹", "🌷"];

function createFloatingItem() {
  const item = document.createElement("div");
  item.className = "float-item";
  item.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  item.style.left = Math.random() * 100 + "vw";
  item.style.animationDuration = 5 + Math.random() * 5 + "s";
  item.style.fontSize = 20 + Math.random() * 30 + "px";
  floatingLayer.appendChild(item);

  setTimeout(() => item.remove(), 10000);
}

setInterval(createFloatingItem, 650);

surpriseBtn.addEventListener("click", () => {
  message.classList.remove("hidden");
  for (let i = 0; i < 16; i++) {
    setTimeout(createFloatingItem, i * 100);
  }
});

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];

function createFirework() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.45;
  const count = 45;
  const colors = ["#ff5c8a", "#ffd1e6", "#ffffff", "#ff9ac8", "#ff2f7d"];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = Math.random() * 4 + 1.5;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 90,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.025;
    p.life--;

    ctx.globalAlpha = Math.max(p.life / 90, 0);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    if (p.life <= 0) {
      particles.splice(index, 1);
    }
  });

  ctx.globalAlpha = 1;
  requestAnimationFrame(animateFireworks);
}

setInterval(createFirework, 1600);
animateFireworks();
