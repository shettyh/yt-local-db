(() => {
  const SAVE_INTERVAL = 5_000;
  let lastSavedAt = 0;
  let lastSavedVideo = null;
  let navigating = false;
  let awaitingMedia = false;
  let mediaVideoId = watchId();

  function watchId() {
    const url = new URL(location.href);
    const id = url.searchParams.get("v");
    return url.pathname === "/watch" && /^[\w-]{11}$/.test(id ?? "") ? id : null;
  }

  function save(force = false) {
    if (navigating || awaitingMedia) return;

    const id = watchId();
    const player = document.querySelector("#movie_player");
    const video = player?.querySelector("video");
    const watch = document.querySelector("ytd-watch-flexy");
    if (!id || !video || watch?.getAttribute("video-id") !== id) return;
    if (player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting")) return;
    if (video.readyState < 2 || !Number.isFinite(video.duration) || video.duration <= 0) return;
    if (!Number.isFinite(video.currentTime) || video.currentTime <= 0) return;

    const position = Math.min(video.currentTime, video.duration);
    const now = Date.now();
    if (lastSavedVideo?.id === id && lastSavedVideo.position === position) return;
    if (!force && lastSavedVideo?.id === id && now - lastSavedAt < SAVE_INTERVAL) return;

    const title = document.querySelector("ytd-watch-metadata h1, #title h1")?.textContent.trim();
    const entry = {
      id,
      title: title || document.title.replace(/ - YouTube$/, "") || "Untitled video",
      position,
      duration: video.duration,
      lastWatched: now
    };
    lastSavedAt = now;
    lastSavedVideo = entry;

    // Separate keys keep different tabs from overwriting each other's history.
    try {
      chrome.storage.local.set({ [`video:${id}`]: entry }).catch(reportError);
    } catch (error) {
      reportError(error); // The extension may have been reloaded while this tab was open.
    }
  }

  function reportError(error) {
    lastSavedVideo = null; // Allow the next playback event to retry.
    console.warn("YT Local could not save playback progress:", error);
  }

  for (const event of ["timeupdate", "pause", "seeked", "ended"]) {
    document.addEventListener(event, (event) => {
      if (event.target === document.querySelector("#movie_player video")) {
        save(event.type !== "timeupdate");
      }
    }, true);
  }

  document.addEventListener("yt-navigate-start", () => {
    save(true);
    navigating = true;
    awaitingMedia = true;
  });
  document.addEventListener("loadedmetadata", (event) => {
    if (event.target === document.querySelector("#movie_player video")) {
      mediaVideoId = watchId();
      awaitingMedia = false;
    }
  }, true);
  document.addEventListener("yt-navigate-finish", () => {
    navigating = false;
    // Changing a playlist or timestamp can navigate without loading new media.
    if (watchId() === mediaVideoId) awaitingMedia = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") save(true);
  });
  window.addEventListener("pagehide", () => save(true));
  // Playback can pause before YouTube finishes attaching watch-page metadata.
  setInterval(save, SAVE_INTERVAL);
  save();
})();
