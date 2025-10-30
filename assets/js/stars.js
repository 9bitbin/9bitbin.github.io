/* ==========================================================
   🌠 Rotating Soul — STARFIELD BACKGROUND
   Author: Himal Shrestha (9bitbin)
   Description:
   Creates a retro 80’s VHS-style moving starfield animation.
   Feels like you’re flying through space behind your neon UI.
   ========================================================== */

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Insert canvas at the very back of the page
canvas.id = "starfield";
document.body.prepend(canvas);

let stars = [];
let numStars = 500;         // number of stars
let speed = 0.003;           // movement speed (higher = faster warp)
let width, height;

// Initialize and resize canvas to full window size
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Create random star positions
function createStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      z: Math.random() * width,
    });
  }
}

// Animate stars (gives forward motion illusion)
function animateStars() {
  ctx.fillStyle = "rgba(10,10,20,0.4)"; // faint trail (VHS feel)
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "white";

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.z -= speed * width;           // move stars toward viewer
    if (star.z <= 0) star.z = width;   // recycle star once past viewer

    const k = 128.0 / star.z;
    const x = star.x * k + width / 2;
    const y = star.y * k + height / 2;

    // skip drawing if offscreen
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const size = (1 - star.z / width) * 2; // size by depth
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${1 - star.z / width})`;
    ctx.fill();
  }
  requestAnimationFrame(animateStars);
}

createStars();
animateStars();
