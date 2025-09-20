console.log("Hello, world!");

// Player elements
const audio = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const musicPlayer = document.getElementById("music-player");

const mainPlayBtn = document.getElementById("main-play");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const playerCover = document.querySelector(".player-cover");
const playerTitle = document.querySelector(".player-title");
const playerArtist = document.querySelector(".player-artist");

let songList = []; // all songs from JSON
let currentIndex = 0;
let isPlaying = false;

// Format seconds -> MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}


// Load JSON and render cards
fetch("songs.json")
  .then((res) => res.json())
  .then((data) => {
    // Render each section dynamically
    console.log("Trending data:", data.trending);

    renderCards("trending-row", data.trending,"song");
    renderCards("artists-row", data.artists,"artist");
    renderCards("albums-row", data.albums,"album");

    // Flatten all songs into one list for player navigation
    songList = [
      ...data.trending,
      ...data.artists,
      ...data.albums,
    ];
  });

// Render cards into a row section
function renderCards(rowId, items, type = "song") {
  const row = document.getElementById(rowId);
  row.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    if (type === "song") {
      card.dataset.index = songList.length + index;
      card.dataset.audio = item.audio; // store audio directly
      card.innerHTML = `
        <div class="img" data-audio="${item.audio}">
          <img src="${item.image}" alt="song" />
        </div>
        <div class="play-btn">
          <img src="svg/play.svg" alt="Play" />
        </div>
        <div class="card-title">${item.title}</div>
        <div class="card-subtitle">${item.artist}</div>
      `;
    } else if (type === "artist") {
      card.innerHTML = `
        <div class="img pict" data-audio="${item.audio}">
          <img src="${item.image}" alt="artist" />
        </div>
        <div class="play-btn">
          <img src="svg/play.svg" alt="Play" />
        </div>
        <div class="card-title">${item.name}</div>
        <div class="card-subtitle">${item.artist}</div>
      `;
    } else if (type === "album") {
      card.innerHTML = `
        <div class="img">
          <img src="${item.image}" alt="album" />
        </div>
        <div class="play-btn">
          <img src="svg/play.svg" alt="Play" />
        </div>
        <div class="card-title">${item.title}</div>
      `;
    }

    row.appendChild(card);
  });

  updateCardButtons(); // re-bind play events
}

let currentSong = null;
let cardPlayButtons = [];

// Attach play events to all cards
function updateCardButtons() {
  cardPlayButtons = document.querySelectorAll(".card .play-btn img");

  cardPlayButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      if (currentIndex === index && isPlaying) {
        // Pause if the same song is clicked
        audio.pause();
        isPlaying = false;
        btn.src = "svg/play.svg";
        mainPlayBtn.src = "svg/play1.svg";
      } else {
        playSongByIndex(index);
        // reset all card buttons to play
        cardPlayButtons.forEach(b => b.src = "svg/play.svg");
        btn.src = "svg/pause.svg"; // active card
      }
    });
  });
}



// Play a song by index
function playSongByIndex(index) {
  currentIndex = index;
  const song = songList[index];

  currentSong = song.audio;
  audio.src = currentSong;
  playerCover.src = song.image;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;

  musicPlayer.classList.remove("hidden");
  musicPlayer.classList.add("show");
  audio.play();
  isPlaying = true;

  // update icons
  mainPlayBtn.src = "svg/pause.svg";
}

// Toggle play/pause
mainPlayBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    mainPlayBtn.src = "svg/pause.svg";
    // also update the matching card button
    const activeCard = [...cardPlayButtons].find(
      btn => btn.closest(".card").dataset.audio === currentSong
    );
    if (activeCard) activeCard.src = "svg/pause.svg";
  } else {
    audio.pause();
    mainPlayBtn.src = "svg/play1.svg";
    const activeCard = [...cardPlayButtons].find(
      btn => btn.closest(".card").dataset.audio === currentSong
    );
    if (activeCard) activeCard.src = "svg/play.svg";
  }
});

// Next / Prev buttons
nextBtn.addEventListener("click", () => {
  let nextIndex = (currentIndex + 1) % songList.length;
  playSongByIndex(nextIndex);
});

prevBtn.addEventListener("click", () => {
  let prevIndex = (currentIndex - 1 + songList.length) % songList.length;
  playSongByIndex(prevIndex);
});

// Auto play next when song ends
audio.addEventListener("ended", () => {
  let nextIndex = (currentIndex + 1) % songList.length;
  playSongByIndex(nextIndex);
});

// Progress bar update
audio.addEventListener("timeupdate", () => {
  progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent = formatTime(audio.duration || 0);
});

// Seek manually
progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});
