document.addEventListener("DOMContentLoaded", () => {
  console.log("=== SCRIPT INITIALISÉ AVEC SUCCÈS ===");

  // Sélection des éléments
  const audioRows = document.querySelectorAll(".index-row[data-audio]");
  const videoItems = document.querySelectorAll(".project-item.type-video");
  const audioElement = document.getElementById("main-audio-element");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playerTrackTitle = document.getElementById("player-track-title");
  const playerStatus = document.getElementById("player-status");
  const progressBar = document.getElementById("progress-bar");
  const progressContainer = document.getElementById("progress-container");

  if (playPauseBtn) playPauseBtn.style.display = "flex";

  let currentActiveAudioRow = null;
  let currentActiveVideoItem = null;

  // 1. GESTION DU CLIC AUDIO (100% AUTOMATIQUE)
  audioRows.forEach((row) => {
    row.addEventListener("click", () => {
      const audioUrl = row.getAttribute("data-audio");
      const trackTitle = row.getAttribute("data-title");

      closeActiveVideo();

      if (currentActiveAudioRow === row) {
        toggleAudio();
        return;
      }

      if (currentActiveAudioRow) {
        currentActiveAudioRow.classList.remove("is-active");
      }

      row.classList.add("is-active");
      currentActiveAudioRow = row;

      // Grâce au plugin static copy, l'URL relative fonctionne directement !
      audioElement.src = audioUrl;
      audioElement.load();

      playerTrackTitle.textContent = trackTitle;
      playerStatus.textContent = "Chargement...";

      audioElement
        .play()
        .then(() => {
          updateButtonUI(true);
          playerStatus.textContent = "En lecture";
        })
        .catch((err) => {
          console.error("Erreur de lecture audio :", err);
          playerStatus.textContent = "Erreur de chargement";
          row.classList.remove("is-active");
          currentActiveAudioRow = null;
        });
    });
  });

  // 2. GESTION ACCORDÉON VIDÉO
  videoItems.forEach((item) => {
    const rowClickable = item.querySelector(".index-row");
    if (!rowClickable) return;

    rowClickable.addEventListener("click", () => {
      if (currentActiveVideoItem === item) {
        closeActiveVideo();
        return;
      }

      // Stopper la musique si une vidéo est lancée
      if (!audioElement.paused) {
        audioElement.pause();
        updateButtonUI(false);
        playerStatus.textContent = "En pause";
        if (currentActiveAudioRow) {
          currentActiveAudioRow.classList.remove("is-active");
          currentActiveAudioRow = null;
        }
      }

      closeActiveVideo();
      item.classList.add("is-active");
      currentActiveVideoItem = item;
    });
  });

  function closeActiveVideo() {
    if (currentActiveVideoItem) {
      currentActiveVideoItem.classList.remove("is-active");
      const iframe = currentActiveVideoItem.querySelector("iframe");
      if (iframe) {
        const src = iframe.src;
        iframe.src = src; // Reset pour couper la lecture YouTube
      }
      currentActiveVideoItem = null;
    }
  }

  // 3. CONTRÔLES DU LECTEUR
  if (playPauseBtn) playPauseBtn.addEventListener("click", toggleAudio);

  function toggleAudio() {
    if (!audioElement.src) return;

    if (audioElement.paused) {
      audioElement.play();
      updateButtonUI(true);
      playerStatus.textContent = "En lecture";
      if (currentActiveAudioRow)
        currentActiveAudioRow.classList.add("is-active");
    } else {
      audioElement.pause();
      updateButtonUI(false);
      playerStatus.textContent = "En pause";
      if (currentActiveAudioRow)
        currentActiveAudioRow.classList.remove("is-active");
    }
  }

  function updateButtonUI(isPlaying) {
    const iconPlay = document.querySelector(".icon-play");
    const iconPause = document.querySelector(".icon-pause");
    if (iconPlay && iconPause) {
      iconPlay.style.display = isPlaying ? "none" : "block";
      iconPause.style.display = isPlaying ? "block" : "none";
    }
  }

  // BARRE DE PROGRESSION
  audioElement.addEventListener("timeupdate", () => {
    if (audioElement.duration && progressBar) {
      const progressPercent =
        (audioElement.currentTime / audioElement.duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
  });

  if (progressContainer) {
    progressContainer.addEventListener("click", (e) => {
      if (!audioElement.src) return;
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audioElement.duration;
      if (duration) {
        audioElement.currentTime = (clickX / width) * duration;
      }
    });
  }

  audioElement.addEventListener("ended", () => {
    updateButtonUI(false);
    playerStatus.textContent = "Terminé";
    if (progressBar) progressBar.style.width = "0%";
    if (currentActiveAudioRow) {
      currentActiveAudioRow.classList.remove("is-active");
      currentActiveAudioRow = null;
    }
  });

  // 4. NAVIGATION
  const navLinks = document.querySelectorAll("header nav a, .logo-text-link");
  const pages = document.querySelectorAll(".app-page");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      let targetPage = null;

      if (targetId === "#projets")
        targetPage = document.getElementById("page-index");
      if (targetId === "#about")
        targetPage = document.getElementById("page-about");
      if (targetId === "#contact")
        targetPage = document.getElementById("page-contact");

      if (targetPage) {
        e.preventDefault();
        pages.forEach((page) => page.classList.remove("is-visible"));
        targetPage.classList.add("is-visible");
        window.scrollTo(0, 0);
      }
    });
  });

  // 5. CURSEUR CUSTOM AVEC INERTIE
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    let mouseX = 0,
      mouseY = 0;
    let cursorX = 0,
      cursorY = 0;
    const speed = 0.09;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const refreshHoverListeners = () => {
      const clickables = document.querySelectorAll(
        "a, button, .index-row, .progress-container",
      );
      clickables.forEach((el) => {
        el.addEventListener("mouseenter", () =>
          cursor.classList.add("is-hovered"),
        );
        el.addEventListener("mouseleave", () =>
          cursor.classList.remove("is-hovered"),
        );
      });
    };

    refreshHoverListeners();
    navLinks.forEach((link) =>
      link.addEventListener("click", () =>
        setTimeout(refreshHoverListeners, 100),
      ),
    );
  }

  // 6. EFFET TEXT GLITCH / MATRIX
  const projectTitles = document.querySelectorAll(".index-row .index-title");
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@#$-_+=";

  projectTitles.forEach((titleElement) => {
    const originalText = titleElement.innerText;
    let isShuffling = false;
    const parentRow = titleElement.closest(".index-row");

    if (parentRow) {
      parentRow.addEventListener("mouseenter", () => {
        if (isShuffling) return;
        isShuffling = true;
        let iteration = 0;

        const interval = setInterval(() => {
          titleElement.innerText = originalText
            .split("")
            .map((letter, index) => {
              if (letter === " " || letter === "_") return letter;
              if (index < iteration) return originalText[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

          if (iteration >= originalText.length) {
            clearInterval(interval);
            titleElement.innerText = originalText;
            isShuffling = false;
          }
          iteration += 1;
        }, 30);
      });
    }
  });
});
