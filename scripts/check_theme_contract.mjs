import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const THEME_JS_PATH = "public/assets/theme.js";
const BASE_LAYOUT_PATH = "src/layouts/BaseLayout.astro";

function findHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

const consumers = findHtmlFiles("public").filter((file) =>
  fs.readFileSync(file, "utf8").includes("/assets/theme.js"),
);
consumers.push(BASE_LAYOUT_PATH);

for (const file of consumers) {
  const content = fs.readFileSync(file, "utf8");
  assert.match(
    content,
    /<html\b[^>]*\bdata-theme=["']light["']/,
    `${file} must declare light before first paint`,
  );
  assert.match(
    content,
    /getItem\(["']mint-theme["']\)\s*===\s*["']dark["']/,
    `${file} must recognize an explicit stored dark preference`,
  );
  assert.match(
    content,
    /removeAttribute\(["']data-theme["']\)/,
    `${file} must apply an explicit stored dark preference before first paint`,
  );
}

const themeJs = fs.readFileSync(THEME_JS_PATH, "utf8");

function initialTheme(storedValue, storageBlocked = false) {
  const attributes = new Map();
  const documentElement = {
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
  };
  const context = {
    document: {
      documentElement,
      readyState: "loading",
      addEventListener() {},
    },
    localStorage: {
      getItem() {
        if (storageBlocked) throw new Error("storage blocked");
        return storedValue;
      },
      setItem() {},
    },
  };

  vm.runInNewContext(themeJs, context, { filename: THEME_JS_PATH });
  return documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

assert.equal(initialTheme(null), "light", "missing preference must default to light");
assert.equal(initialTheme("light"), "light", "stored light preference must remain light");
assert.equal(initialTheme("dark"), "dark", "stored dark preference must remain dark");
assert.equal(initialTheme(null, true), "light", "blocked storage must default to light");

console.log(`Theme contract OK: light-first across ${consumers.length} shared-theme surfaces.`);
