const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(`${__dirname}/../content.js`, "utf8");
const FIRST = "abcdefghijk";
const SECOND = "lmnopqrstuv";

function browser() {
  const listeners = new Map();
  const stored = {};
  const classes = new Set();
  const video = { currentTime: 0, duration: 120, readyState: 4 };
  const watch = { id: FIRST, getAttribute: () => watch.id };
  const location = { href: `https://www.youtube.com/watch?v=${FIRST}` };
  const player = { querySelector: () => video, classList: { contains: (name) => classes.has(name) } };
  const title = { textContent: "A useful video" };
  let now = 10_000;
  let writes = 0;
  let failStorage = false;
  let poll;
  const addEventListener = (type, listener) => {
    const handlers = listeners.get(type) ?? [];
    handlers.push(listener);
    listeners.set(type, handlers);
  };
  const document = {
    title: "A useful video - YouTube",
    visibilityState: "visible",
    addEventListener,
    querySelector: (selector) => ({
      "#movie_player": player,
      "#movie_player video": video,
      "ytd-watch-flexy": watch,
      "ytd-watch-metadata h1, #title h1": title
    })[selector]
  };
  vm.runInNewContext(source, {
    URL, location, document, window: { addEventListener },
    Date: { now: () => now },
    setInterval: (callback) => { poll = callback; },
    console: { warn() {} },
    chrome: { storage: { local: { async set(values) {
      if (failStorage) throw new Error("Storage unavailable");
      Object.assign(stored, structuredClone(values));
      writes++;
    } } } }
  });
  return {
    stored, video, watch, location, title, classes, document,
    get writes() { return writes; },
    failStorage(value) { failStorage = value; },
    advance(milliseconds) { now += milliseconds; },
    poll() { poll?.(); },
    emit(type, target = video) {
      for (const listener of listeners.get(type) ?? []) listener({ type, target });
    }
  };
}

test("visiting an unplayed video does not add history", () => {
  const b = browser();
  b.emit("timeupdate");
  b.emit("pause");
  assert.equal(b.writes, 0);
});

test("saves video metadata and progress in an independent local key", () => {
  const b = browser();
  b.video.currentTime = 12.5;
  b.emit("timeupdate");
  assert.deepEqual(b.stored[`video:${FIRST}`], {
    id: FIRST, title: "A useful video", position: 12.5, duration: 120, lastWatched: 10_000
  });
});

test("throttles playback writes to five seconds but flushes on pause", () => {
  const b = browser();
  b.video.currentTime = 1;
  b.emit("timeupdate");
  b.advance(1_000);
  b.video.currentTime = 2;
  b.emit("timeupdate");
  assert.equal(b.writes, 1);
  b.emit("pause");
  assert.equal(b.stored[`video:${FIRST}`].position, 2);
  b.advance(5_000);
  b.video.currentTime = 7;
  b.emit("timeupdate");
  assert.equal(b.writes, 3);
});

test("unchanged progress does not write or reorder paused videos", () => {
  const b = browser();
  b.video.currentTime = 5;
  b.emit("timeupdate");
  b.advance(10_000);
  b.emit("pause");
  assert.equal(b.writes, 1);
  assert.equal(b.stored[`video:${FIRST}`].lastWatched, 10_000);
});

for (const event of ["seeked", "ended", "pagehide", "visibilitychange"]) {
  test(`flushes unsaved progress on ${event}`, () => {
    const b = browser();
    b.video.currentTime = 5;
    b.emit("timeupdate");
    b.video.currentTime = event === "ended" ? 120 : 6;
    b.document.visibilityState = "hidden";
    b.emit(event);
    assert.equal(b.stored[`video:${FIRST}`].position, b.video.currentTime);
  });
}

for (const adClass of ["ad-showing", "ad-interrupting"]) {
  test(`does not save advertisement progress (${adClass})`, () => {
    const b = browser();
    b.classes.add(adClass);
    b.video.currentTime = 30;
    b.emit("pause");
    assert.equal(b.writes, 0);
    b.classes.clear();
    b.emit("timeupdate");
    assert.equal(b.writes, 1);
  });
}

for (const invalid of [
  { url: "https://www.youtube.com/" },
  { url: `https://www.youtube.com/shorts/${FIRST}` },
  { url: "https://www.youtube.com/watch?v=invalid" },
  { watchId: SECOND },
  { duration: Infinity },
  { duration: NaN },
  { duration: 0 },
  { position: NaN },
  { readyState: 1 }
]) {
  test(`ignores unsupported or unready playback: ${JSON.stringify(invalid)}`, () => {
    const b = browser();
    b.video.currentTime = invalid.position ?? 5;
    if (invalid.url) b.location.href = invalid.url;
    if (invalid.watchId) b.watch.id = invalid.watchId;
    if ("duration" in invalid) b.video.duration = invalid.duration;
    if ("readyState" in invalid) b.video.readyState = invalid.readyState;
    b.emit("pause");
    assert.equal(b.writes, 0);
  });
}

for (const metadataFirst of [false, true]) {
  test(`SPA navigation does not assign outgoing progress to the next video (metadata first: ${metadataFirst})`, () => {
    const b = browser();
    b.video.currentTime = 20;
    b.emit("timeupdate");
    b.video.currentTime = 21;
    b.emit("yt-navigate-start");
    b.location.href = `https://www.youtube.com/watch?v=${SECOND}`;
    b.watch.id = SECOND;
    b.title.textContent = "The next video";
    b.emit("timeupdate");
    if (metadataFirst) {
      b.video.currentTime = 0;
      b.emit("loadedmetadata");
    }
    b.emit("yt-navigate-finish");
    b.emit("timeupdate");
    assert.equal(b.stored[`video:${SECOND}`], undefined);
    if (!metadataFirst) {
      b.video.currentTime = 0;
      b.emit("loadedmetadata");
    }
    b.video.currentTime = 1;
    b.emit("timeupdate");
    assert.equal(b.stored[`video:${FIRST}`].position, 21);
    assert.equal(b.stored[`video:${SECOND}`].position, 1);
    assert.equal(b.stored[`video:${SECOND}`].title, "The next video");
  });
}

test("same-video navigation continues tracking without a metadata event", () => {
  const b = browser();
  b.video.currentTime = 10;
  b.emit("timeupdate");
  b.emit("yt-navigate-start");
  b.location.href += "&t=30s";
  b.emit("yt-navigate-finish");
  b.video.currentTime = 30;
  b.emit("seeked");
  assert.equal(b.stored[`video:${FIRST}`].position, 30);
});

test("same-video navigation before first playback does not disable tracking", () => {
  const b = browser();
  b.emit("yt-navigate-start");
  b.location.href += "&list=example";
  b.emit("yt-navigate-finish");
  b.video.currentTime = 5;
  b.emit("timeupdate");
  assert.equal(b.stored[`video:${FIRST}`]?.position, 5);
});

test("ignores events from videos outside the main player", () => {
  const b = browser();
  b.video.currentTime = 10;
  b.emit("timeupdate", {});
  assert.equal(b.writes, 0);
});

test("falls back to the document title", () => {
  const b = browser();
  b.title.textContent = "";
  b.video.currentTime = 10;
  b.emit("timeupdate");
  assert.equal(b.stored[`video:${FIRST}`].title, "A useful video");
});

test("records paused progress once delayed YouTube metadata becomes available", () => {
  const b = browser();
  b.watch.id = null;
  b.video.currentTime = 20;
  b.emit("seeked");
  b.emit("pause");
  assert.equal(b.writes, 0);
  b.watch.id = FIRST;
  b.advance(5_000);
  b.poll();
  assert.equal(b.stored[`video:${FIRST}`]?.position, 20);
  b.advance(5_000);
  b.poll();
  assert.equal(b.writes, 1);
});

test("retries after a failed storage write", async () => {
  const b = browser();
  b.failStorage(true);
  b.video.currentTime = 10;
  b.emit("timeupdate");
  await Promise.resolve();
  b.failStorage(false);
  b.emit("timeupdate");
  assert.equal(b.writes, 1);
});
