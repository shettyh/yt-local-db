const historyList = document.querySelector("#history");
const status = document.querySelector("#status");
const clearButton = document.querySelector("#clear");
const template = document.querySelector("#video-template");

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${remaining}` : `${minutes}:${remaining}`;
}

async function refresh() {
  try {
    const stored = await chrome.storage.local.get(null);
    const entries = Object.entries(stored)
      .filter(([key]) => key.startsWith("video:"))
      .map(([, entry]) => entry)
      .sort((a, b) => b.lastWatched - a.lastWatched);

    historyList.replaceChildren();
    document.querySelector("#count").textContent = entries.length || "";
    clearButton.disabled = entries.length === 0;
    status.textContent = entries.length ? "" : "Nothing here yet. Watch a YouTube video and your place will be saved.";
    status.hidden = entries.length > 0;

    for (const entry of entries) {
      const item = template.content.cloneNode(true);
      const finished = entry.duration - entry.position <= 1;
      const seconds = finished ? 0 : Math.floor(entry.position);
      const url = `https://www.youtube.com/watch?v=${encodeURIComponent(entry.id)}&t=${seconds}s`;
      const title = item.querySelector(".title");
      title.textContent = entry.title;
      title.href = url;

      const watched = new Date(entry.lastWatched).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      item.querySelector(".details").textContent = `${formatTime(entry.position)} / ${formatTime(entry.duration)} · ${watched}`;
      item.querySelector("progress").value = Math.min(1, entry.position / entry.duration);
      const resume = item.querySelector(".resume");
      resume.href = url;
      resume.textContent = finished ? "Watch again ↗" : "Resume ↗";

      const deleteButton = item.querySelector(".delete");
      deleteButton.setAttribute("aria-label", `Delete ${entry.title} from local history`);
      deleteButton.addEventListener("click", async () => {
        try {
          await chrome.storage.local.remove(`video:${entry.id}`);
          await refresh();
        } catch (error) {
          showError(error);
        }
      });
      historyList.append(item);
    }
  } catch (error) {
    showError(error);
  }
}

function showError(error) {
  status.hidden = false;
  status.textContent = "Could not access local history. Try reopening the extension.";
  console.error("YT Local DB:", error);
}

clearButton.addEventListener("click", async () => {
  if (!confirm("Clear all locally saved videos? This cannot be undone.")) return;
  try {
    await chrome.storage.local.clear();
    await refresh();
  } catch (error) {
    showError(error);
  }
});

refresh();
