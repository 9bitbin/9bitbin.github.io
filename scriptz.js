const loveSong = document.getElementById("loveSong");
const musicOverlay = document.getElementById("musicOverlay");
const startMusicBtn = document.getElementById("startMusicBtn");
const musicPlayer = document.getElementById("musicPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextSongBtn = document.getElementById("nextSongBtn");
const volumeSlider = document.getElementById("volumeSlider");
const songTitle = document.getElementById("songTitle");

const floatingLayer = document.getElementById("floatingLayer");
const surpriseBtn = document.getElementById("surpriseBtn");
const surprise = document.getElementById("surprise");

const nodes = document.querySelectorAll(".family-node");
const profilePopout = document.getElementById("profilePopout");
const profileName = document.getElementById("profileName");
const profileMeta = document.getElementById("profileMeta");
const profileDetails = document.getElementById("profileDetails");
const sceneTitle = document.getElementById("sceneTitle");
const sceneLayers = document.querySelectorAll(".scene-layer");

const playlist = [
  {
    title: "Stevie Wonder - I Just Called to Say I Love You",
    file: "i-just-called-to-say-i-love-you.mp3"
  },
  {
    title: "Song 2",
    file: "song-2.mp3"
  }
];

let currentSongIndex = 0;

function loadSong(index) {
  currentSongIndex = index;
  loveSong.src = playlist[currentSongIndex].file;
  songTitle.textContent = playlist[currentSongIndex].title;
  loveSong.load();
}

async function playCurrentSong() {
  try {
    loveSong.volume = Number(volumeSlider.value) / 100;
    await loveSong.play();
    playPauseBtn.textContent = "⏸️";
  } catch (error) {
    console.log("Music could not start:", error);
  }
}

function nextSong() {
  const nextIndex = (currentSongIndex + 1) % playlist.length;
  loadSong(nextIndex);
  playCurrentSong();
}

loadSong(0);

startMusicBtn.addEventListener("click", async () => {
  musicOverlay.classList.add("hidden");
  musicPlayer.classList.add("visible");
  await playCurrentSong();
  burst();
  createFirework();
});

playPauseBtn.addEventListener("click", () => {
  if (loveSong.paused) {
    playCurrentSong();
  } else {
    loveSong.pause();
    playPauseBtn.textContent = "▶️";
  }
});

nextSongBtn.addEventListener("click", nextSong);

volumeSlider.addEventListener("input", () => {
  loveSong.volume = Number(volumeSlider.value) / 100;
});

loveSong.addEventListener("ended", nextSong);

const people = {
  mom: {
    name: "Shobha Shrestha",
    meta: "Mother",
    details: "Mom is in the garden planting love, patience, and care into the family every day.",
    scene: "momScene",
    title: "Mom’s Night Garden 🌙"
  },
  himal: {
    name: "Himal",
    meta: "25 • Male • Information Technology",
    details: "Himal is on the computer working in IT, then taking the train home to the family.",
    scene: "himalScene",
    title: "Himal’s IT Desk and Train Ride 💻🚆"
  },
  prajwol: {
    name: "Prajwol",
    meta: "Born January 10, 2003 • Brother",
    details: "Prajwol rides in on a motorbike and pulls up to the family garage.",
    scene: "prajwolScene",
    title: "Prajwol Riding Into the Garage 🏍️"
  },
  bhuban: {
    name: "Bhuban",
    meta: "Born May 13, 1974 • Father",
    details: "Bhuban drives home and arrives at the family house.",
    scene: "bhubanScene",
    title: "Bhuban Driving Home 🚗"
  }
};

function restartAnimations(element) {
  const all = element.querySelectorAll("*");

  all.forEach(el => {
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "";
  });
}

function selectPerson(key) {
  const person = people[key];

  nodes.forEach(node => {
    node.classList.toggle("active", node.dataset.person === key);
  });

  profileName.textContent = person.name;
  profileMeta.textContent = person.meta;
  profileDetails.textContent = person.details;
  sceneTitle.textContent = person.title;

  profilePopout.classList.remove("pop");
  profilePopout.offsetHeight;
  profilePopout.classList.add("pop");

  sceneLayers.forEach(layer => {
    layer.classList.remove("active");

    if (layer.id === person.scene) {
      layer.classList.add("active");
      restartAnimations(layer);
    }
  });

  burst();
  createFirework();
}

nodes.forEach(node => {
  node.addEventListener("click", () => selectPerson(node.dataset.person));
});

const symbols = ["💖", "🌸", "🌷", "🌹", "✨", "💐", "💗", "🏡"];

function createFloatingItem() {
  const item = document.createElement("div");
  item.className = "float-item";
  item.textContent = symbols[Math.floor(Math.random() * symbols.length)];

  item.style.left = Math.random() * 100 + "vw";
  item.style.fontSize = 22 + Math.random() * 30 + "px";
  item.style.animationDuration = 5 + Math.random() * 5 + "s";

  floatingLayer.appendChild(item);
  setTimeout(() => item.remove(), 10000);
}

function burst() {
  for (let i = 0; i < 16; i++) {
    setTimeout(createFloatingItem, i * 80);
  }
}

setInterval(createFloatingItem, 850);

surpriseBtn.addEventListener("click", () => {
  surprise.classList.remove("hidden");
  burst();
  createFirework();
  createFirework();
});

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createFirework() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.45;
  const count = 52;
  const colors = ["#ff4f9a", "#ff8fc1", "#ffffff", "#ffe9a8", "#ffd1e6"];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = Math.random() * 4 + 1.4;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 95,
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

    ctx.globalAlpha = Math.max(p.life / 95, 0);
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

selectPerson("mom");
setInterval(createFirework, 2300);
animateFireworks();
