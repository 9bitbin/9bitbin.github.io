/* ==========================================================
   🌌 Rotating Soul — CONTINUOUS PARALLAX STARFIELD
   Author: Himal Shrestha (9bitbin)
   Description:
   A slow, dreamy, 80’s VHS-style starfield with glistening
   stars that flow continuously and react to mouse movement.
   The result feels like drifting through infinite space.
   ========================================================== */

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.id = "starfield";
document.body.prepend(canvas);

let stars = [];
let numStars = 600;         // Number of stars to render
let speed = 0.003;         // 🌙 Dreamy slow motion
let width, height;

// Mouse-based parallax control
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// Track mouse movement for parallax
document.addEventListener("mousemove", (e) => {
  targetMouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
  targetMouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
});

// Resize canvas dynamically
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Create a single new star (used for continuous flow)
function createStar() {
  return {
    x: Math.random() * width - width / 2,
    y: Math.random() * height - height / 2,
    z: Math.random() * width,
    flickerSpeed: 0.002 + Math.random() * 0.004,
    flickerPhase: Math.random() * Math.PI * 2,
    hueShift: Math.random() * 360
  };
}

// Initialize starfield
function createStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push(createStar());
  }
}

// Animate stars (smooth continuous flow)
function animateStars(time) {
  ctx.fillStyle = "rgb(0, 0, 0)"; // Solid black background
  ctx.fillRect(0, 0, width, height);

  // Ease mouse parallax motion for smoothness
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.z -= speed * width; // Move stars toward viewer

    // When a star passes the viewer, recycle instantly (continuous flow)
    if (star.z <= 0) {
      stars[i] = createStar();
      stars[i].z = width;
      continue;
    }

    // Apply 3D perspective and parallax shift
    const k = 128.0 / star.z;
    const x = star.x * k + width / 2 + mouseX * 200; // parallax shift
    const y = star.y * k + height / 2 + mouseY * 200;

    // Skip offscreen stars
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    // Twinkle and color
    const flicker =
      0.75 + Math.sin(time * star.flickerSpeed + star.flickerPhase) * 0.25;
    const hue = (star.hueShift + time * 0.01) % 360;
    const color = `hsl(${hue}, 100%, ${65 + flicker * 30}%)`;

    // Draw star with glow
    const size = (1 - star.z / width) * 2.4 * flicker;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fill();
  }

  requestAnimationFrame(animateStars);
}

// Initialize and start
createStars();
animateStars(0);
