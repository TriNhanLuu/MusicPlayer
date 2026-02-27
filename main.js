// TODO
// 1. Render songs
// 2. Scroll Top
// 3. Play / Pause / Seek
// 4. CD rotate
// 5. Next / Previous
// 6. Random 
// 7. Next / Repeat when end
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click
// 11. Set config


// END TODO

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'TN_PLAYER';

const player = $(".player");
const playlist = $(".playlist");
const cd = $(".cd");
const cdthumb = $(".cd-thumb");
const songName = $("h2");
const cdThumb = $(".cd-thumb");
const audio = $("audio");

const playBtn = $(".btn-toggle-play");
const progress = $(".progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

  songs: [
    {
      songName: "Epic",
      singer: "Oh da da",
      path: "./MusicSource/Epic.mp3",
      image: "./MusicSource/epic.jpg",
    },
    {
      songName: "Chinese Lunar New Year",
      singer: "nihao",
      path: "./MusicSource/ChineseLunarNewYear.mp3",
      image: "./MusicSource/ChineseLunarNewYear.jpg",
    },
    {
      songName: "Honey Kisses",
      singer: "Oh my honey",
      path: "./MusicSource/HoneyKisses.mp3",
      image: "./MusicSource/HoneyKisses.jpg",
    },
    {
      songName: "Night Summer Longue",
      singer: "Alexander the Poporo",
      path: "./MusicSource/NightSummerLounge.mp3",
      image: "./MusicSource/NightSummerLounge.jpg",
    },
    {
      songName: "A little bit",
      singer: "Hiiii",
      path: "./MusicSource/Alittlebit.mp3",
      image: "./MusicSource/Alittlebit.png",
    },
    {
      songName: "Deep Sea Exploration",
      singer: "Fish and other sea creatures",
      path: "./MusicSource/DeepSeaExploration.mp3",
      image: "./MusicSource/DeepSeaExploration.png",
    },
    {
      songName: "Glorious Adventure",
      singer: "Arthur the king",
      path: "./MusicSource/GloriousAdventure.mp3",
      image: "./MusicSource/GloriousAdventure.png",
    },
    {
      songName: "Reunited",
      singer: "Family is the best",
      path: "./MusicSource/Reunited.mp3",
      image: "./MusicSource/Reunited.png",
    },
    {
      songName: "Rise of the Enemy",
      singer: "The enemy",
      path: "./MusicSource/RiseOfTheEnemy.mp3",
      image: "./MusicSource/RiseOfTheEnemy.png",
    },
    {
      songName: "Transcended",
      singer: "Idk",
      path: "./MusicSource/Transcended.mp3",
      image: "./MusicSource/Transcended.png",
    }
  ],

  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },


  render: function () {
    var htmls = app.songs.map((song, index) => {
      return `<div class="song ${index == this.currentIndex ? 'active' : ''}" data-index="${index}">
          <div class="thumb-container">
            <div
              class="thumb"
              style="background-image: url(${song.image})"
            ></div>
          </div>
          <div class="body">
            <h3 class="title">${song.songName}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="options">
            <i class="fa-regular fa-heart"></i>
            <i class="fa-solid fa-ellipsis"></i>
          </div>
        </div>`;
    });

    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvent: function () {
    const _this = this;

    // ----- Scroll with resizing CD -----
    const cdWidth = cd.offsetWidth;

    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // ----- Play / Pause -----
    playBtn.onclick = function () {
      if (_this.isPlaying == false) {
        audio.play();
      } else {
        audio.pause();
      }
    };

    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdRotation.play();
    };

    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdRotation.pause();
    };

    // ----- Progress -----
    audio.ontimeupdate = function () {
      const progressPercent = Math.ceil(audio.currentTime / audio.duration * 100);

      if(progressPercent) {
        progress.value = progressPercent;
      }
    };

    // Progress on change
    progress.onchange = function() {
      const percentChange = progress.value;
      audio.currentTime = Math.ceil(percentChange / 100 * audio.duration);
    }


    // ----- CD Rotation Animation -----
    const cdRotation = cdthumb.animate([
      {transform: "rotate(0)"},
      {transform: "rotate(360deg)"}
    ],
    {
      duration: 15000,
      iterations: Infinity
    })
    cdRotation.pause();
    const resetCdRotation = function() {
      cdRotation.cancel();
      cdRotation.play();
    }

    // Common functions after changing songs 
    changeSong = function() {
      _this.loadCurrentSong();
      audio.play();
      resetCdRotation();
      _this.activeSong();
      _this.scrollToActiveSong();

      _this.setConfig('currentIndex', _this.currentIndex);
    }

    // ----- Next song -----
    nextBtn.onclick = function() {
      if(_this.isRandom) {
        _this.playRandomsong();
      }
      else {
        if(_this.currentIndex == _this.songs.length - 1) {
          _this.currentIndex = 0;
        }
        else {
          _this.currentIndex++;
        }
      }
      changeSong();
    }

  
    // ----- Previous song -----
    prevBtn.onclick = function() {
      if(_this.isRandom) {
        _this.playRandomsong();
      }
      else {
        if(_this.currentIndex == 0) {
          _this.currentIndex = _this.songs.length - 1;
        }
        else {
          _this.currentIndex--;
        }
      }
      changeSong();
    }

    // ----- Random song -----
    randomBtn.onclick = function() {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);

      _this.playRandomsong()
    }

    // ----- Repeat song -----
    repeatBtn.onclick = function() {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    }

    audio.onended = function() {
      if(_this.isRepeat) {
        audio.play()
      }
      else {
        nextBtn.click();
      }
    }

    // ----- CLick new song -----
    playlist.onclick = function(e) {
      const songNode = e.target.closest(".song:not(.active)");
      const heartNode = e.target.closest(".fa-heart");
      
      if(songNode) {
        _this.currentIndex = Number(songNode.dataset.index); // ! NOTICE THIS
        changeSong();
      }
    }
  },

  loadCurrentSong: function () {
    songName.innerText = this.currentSong.songName;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = `${this.currentSong.path}`;
  },

  loadConfig: function() {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.currentIndex = this.config.currentIndex;
    
    randomBtn.classList.toggle('active', this.isRandom);
    repeatBtn.classList.toggle('active', this.isRepeat);
  },

  playRandomsong: function() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while(newIndex == this.currentIndex);
    this.currentIndex = newIndex;
  },

  activeSong: function() {
    let currentSong = $('.song.active');
    if(currentSong) {
      currentSong.classList.remove('active');
    }
    const newSong = $(`.song[data-index="${this.currentIndex}"]`)
    newSong.classList.add('active');
  },

  scrollToActiveSong: function() {
    let currentSong = $('.song.active');
    currentSong.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  },

  start: function () {
    // Config
    this.loadConfig();

    this.defineProperties();

    this.handleEvent();

    this.loadCurrentSong();

    this.render();
  },
};

app.start();
