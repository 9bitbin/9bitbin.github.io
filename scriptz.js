const loveSong = document.getElementById("loveSong");
const musicOverlay = document.getElementById("musicOverlay");
const startMusicBtn = document.getElementById("startMusicBtn");
const musicPlayer = document.getElementById("musicPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextSongBtn = document.getElementById("nextSongBtn");
const volumeSlider = document.getElementById("volumeSlider");
const songTitle = document.getElementById("songTitle");

/*
  Add your legal MP3 files to the same folder as mothers-day.html.
*/

const playlist = [
  {
    title: "Stevie Wonder - I Just Called to Say I Love You",
    file: "i-just-called-to-say-i-love-you.mp3"
  },
  {
    title: "song-2",
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
