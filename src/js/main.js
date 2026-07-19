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

  console.log("Nombre de pistes audio trouvées :", audioRows.length);
  console.log("Nombre de vidéos trouvées :", videoItems.length);

  // Forcer l'affichage du bouton Play au démarrage pour être sûr qu'il ne reste pas bloqué caché
  if (playPauseBtn) {
    playPauseBtn.style.display = "flex";
  }

  let currentActiveAudioRow = null;
  let currentActiveVideoItem = null;

  // 1. GESTION DU CLIC SUR LES PISTES AUDIO
  audioRows.forEach((row, index) => {
    row.addEventListener("click", () => {
      const audioUrl = row.getAttribute("data-audio");
      const trackTitle = row.getAttribute("data-title");
      console.log(`Clic sur la prod index ${index} : ${trackTitle}`);

      // Fermer la vidéo si elle est ouverte
      closeActiveVideo();

      // Si on clique sur la musique déjà active -> Toggle Play/Pause
      if (currentActiveAudioRow === row) {
        toggleAudio();
        return;
      }

      // Nettoyer l'ancienne ligne active
      if (currentActiveAudioRow) {
        currentActiveAudioRow.classList.remove("is-active");
      }

      // Activer la nouvelle ligne
      row.classList.add("is-active");
      currentActiveAudioRow = row;

      // Charger et lire le son
      audioElement.src = audioUrl;
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
      console.log("Clic sur un projet vidéo");

      if (currentActiveVideoItem === item) {
        closeActiveVideo();
        return;
      }

      // Couper la musique en cours si nécessaire
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
        iframe.src = src; // Reset pour couper le son Youtube
      }
      currentActiveVideoItem = null;
    }
  }

  // 3. BOUTON PLAY/PAUSE DU PLAYER
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", toggleAudio);
  }

  function toggleAudio() {
    if (!audioElement.src) {
      console.log("Aucune source audio chargée dans le lecteur.");
      return;
    }

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

  // 4. GESTION DU CHANGEMENT DE PAGE (BEATS / INFO / CONTACT)
  const navLinks = document.querySelectorAll("header nav a");
  const pages = document.querySelectorAll(".app-page");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      console.log("Clic menu, cible :", targetId);

      let targetPage = null;
      if (targetId === "#beats")
        targetPage = document.getElementById("page-index");
      if (targetId === "#about")
        targetPage = document.getElementById("page-about");
      if (targetId === "#contact")
        targetPage = document.getElementById("page-contact");

      if (targetPage) {
        e.preventDefault();

        // Cacher toutes les pages
        pages.forEach((page) => page.classList.remove("is-visible"));

        // Afficher la page ciblée
        targetPage.classList.add("is-visible");
        console.log("Page affichée :", targetPage.id);

        window.scrollTo(0, 0);
      }
    });
  });
});
