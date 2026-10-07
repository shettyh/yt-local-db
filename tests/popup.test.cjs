const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(`${__dirname}/../popup.js`, "utf8");

async function popup(stored = {}, failStorage = false) {
  const element = () => ({
    listeners: {},
    addEventListener(type, listener) { this.listeners[type] = listener; },
    setAttribute(name, value) { this[name] = value; }
  });
  const history = { items: [], replaceChildren() { this.items = []; }, append(item) { this.items.push(item); } };
  const status = element();
  const clear = element();
  const count = element();
  const template = { content: { cloneNode() {
    const fields = Object.fromEntries([".title", ".details", "progress", ".resume", ".delete"].map((name) => [name, element()]));
    return { fields, querySelector: (selector) => fields[selector] };
  } } };
  const document = { querySelector: (selector) => ({
    "#history": history, "#status": status, "#clear": clear, "#count": count, "#video-template": template
  })[selector] };
  let confirmClear = true;
  const context = vm.createContext({
    document, Date, encodeURIComponent,
    confirm: () => confirmClear,
    console: { error() {} },
    chrome: { storage: { local: {
      async get() { if (failStorage) throw new Error("Storage unavailable"); return stored; },
      async remove(key) { delete stored[key]; },
      async clear() { for (const key of Object.keys(stored)) delete stored[key]; }
    } } }
  });
  vm.runInContext(source, context);
  await context.refresh();
  return { stored, history, status, clear, count, context, confirm(value) { confirmClear = value; } };
}

function entry(id, position = 12.5, lastWatched = 10_000) {
  return { id, title: "A useful video", position, duration: 120, lastWatched };
}

test("empty history shows guidance and disables clear", async () => {
  const p = await popup();
  assert.equal(p.history.items.length, 0);
  assert.equal(p.clear.disabled, true);
  assert.equal(p.status.hidden, false);
  assert.match(p.status.textContent, /Watch a YouTube video/);
});

test("orders videos by recency and builds timestamped resume links", async () => {
  const p = await popup({
    "video:abcdefghijk": entry("abcdefghijk"),
    "video:lmnopqrstuv": entry("lmnopqrstuv", 25.8, 20_000),
    unrelated: "not a video"
  });
  assert.equal(p.history.items.length, 2);
  assert.equal(p.count.textContent, 2);
  assert.equal(p.status.hidden, true);
  const item = p.history.items[0].fields;
  assert.equal(item[".resume"].href, "https://www.youtube.com/watch?v=lmnopqrstuv&t=25s");
  assert.equal(item[".title"].href, item[".resume"].href);
  assert.match(item[".details"].textContent, /^0:25 \/ 2:00/);
  assert.equal(item.progress.value, 25.8 / 120);
});

test("completed videos open from the beginning", async () => {
  const p = await popup({ "video:abcdefghijk": entry("abcdefghijk", 120) });
  const item = p.history.items[0].fields;
  assert.equal(item[".resume"].textContent, "Watch again ↗");
  assert.match(item[".resume"].href, /t=0s$/);
  assert.equal(item.progress.value, 1);
});

test("titles are assigned as text, not HTML", async () => {
  const video = { ...entry("abcdefghijk"), title: "<img src=x onerror=alert(1)>" };
  const p = await popup({ "video:abcdefghijk": video });
  const title = p.history.items[0].fields[".title"];
  assert.equal(title.textContent, video.title);
  assert.equal(title.innerHTML, undefined);
});

test("deleting a video preserves other entries", async () => {
  const p = await popup({
    "video:abcdefghijk": entry("abcdefghijk"),
    "video:lmnopqrstuv": entry("lmnopqrstuv", 25, 20_000)
  });
  await p.history.items[0].fields[".delete"].listeners.click();
  assert.equal(p.stored["video:lmnopqrstuv"], undefined);
  assert.ok(p.stored["video:abcdefghijk"]);
  assert.equal(p.history.items.length, 1);
});

test("clear only deletes history after confirmation", async () => {
  const p = await popup({ "video:abcdefghijk": entry("abcdefghijk") });
  p.confirm(false);
  await p.clear.listeners.click();
  assert.ok(p.stored["video:abcdefghijk"]);
  p.confirm(true);
  await p.clear.listeners.click();
  assert.equal(p.history.items.length, 0);
  assert.equal(p.clear.disabled, true);
});

test("formats minute and hour timestamps", async () => {
  const p = await popup();
  assert.equal(p.context.formatTime(0), "0:00");
  assert.equal(p.context.formatTime(59.9), "0:59");
  assert.equal(p.context.formatTime(3601), "1:00:01");
});

test("storage failures show an error instead of a misleading empty state", async () => {
  const p = await popup({}, true);
  assert.equal(p.status.hidden, false);
  assert.match(p.status.textContent, /Could not access local history/);
});
