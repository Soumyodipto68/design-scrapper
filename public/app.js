// ── Element refs ──────────────────────────
const scrapeForm = document.getElementById("scrape-form");
const urlInput = document.getElementById("url-input");
const scrapeBtn = document.getElementById("scrape-btn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const outputDesign = document.getElementById("output-design");
const outputSkills = document.getElementById("output-skills");
const tabs = document.querySelectorAll(".tab");

const modeBtns = document.querySelectorAll(".mode-btn");
const batchPanel = document.getElementById("batch-panel");
const urlsInput = document.getElementById("urls-input");
const batchBtn = document.getElementById("batch-btn");
const batchResultsEl = document.getElementById("batch-results");
const batchCards = document.getElementById("batch-cards");
const progressWrap = document.getElementById("progress-wrap");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

let currentTab = "design";
let mode = "single";
let lastBatch = [];

// ── Mode switching ────────────────────────
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;

    scrapeForm.classList.toggle("hidden", mode !== "single");
    batchPanel.classList.toggle("hidden", mode !== "batch");
    resultsEl.classList.add("hidden");
    batchResultsEl.classList.add("hidden");
    statusEl.classList.add("hidden");
  });
});

// ── Tab switching ─────────────────────────
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    document.querySelectorAll(".output").forEach((o) => o.classList.remove("active"));
    document.getElementById(`output-${currentTab}`).classList.add("active");
  });
});

function setLoading(isLoading) {
  scrapeBtn.disabled = isLoading;
  scrapeBtn.textContent = isLoading ? "Scraping..." : "Scrape";
}

function setBatchLoading(isLoading) {
  batchBtn.disabled = isLoading;
  batchBtn.textContent = isLoading ? "Scraping..." : "Scrape All (max 10)";
}

// ── Single scrape ─────────────────────────
scrapeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  setLoading(true);
  resultsEl.classList.add("hidden");
  statusEl.classList.remove("hidden", "error");
  statusEl.innerHTML = `<span class="spinner"></span> Scraping ${url}...`;

  try {
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    outputDesign.textContent = data.design_md;
    outputSkills.textContent = data.skills_md;

    if (data.screenshot) {
      document.getElementById("screenshot").src = `data:image/png;base64,${data.screenshot}`;
      document.getElementById("preview-wrapper").classList.remove("hidden");
    } else {
      document.getElementById("preview-wrapper").classList.add("hidden");
    }

    statusEl.classList.add("hidden");
    resultsEl.classList.remove("hidden");
  } catch (err) {
    statusEl.classList.add("error");
    statusEl.textContent = `❌ ${err.message}`;
  } finally {
    setLoading(false);
  }
});

// ── Batch scrape ──────────────────────────
batchBtn.addEventListener("click", async () => {
  const urls = urlsInput.value
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  if (urls.length === 0) {
    alert("Please enter at least one URL.");
    return;
  }

  setBatchLoading(true);
  batchResultsEl.classList.add("hidden");
  batchCards.innerHTML = "";
  statusEl.classList.remove("hidden", "error");
  statusEl.innerHTML = `<span class="spinner"></span> Scraping ${urls.length} site(s)... this may take a while`;

  // Progress bar: we don't get streaming updates, so estimate by time
  progressWrap.classList.remove("hidden");
  let fakeProgress = 0;
  const tick = setInterval(() => {
    fakeProgress = Math.min(fakeProgress + 2, 90);
    progressBar.style.width = fakeProgress + "%";
    progressText.textContent = `${fakeProgress}%`;
  }, 500);

  try {
    const res = await fetch("/api/batch-scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    clearInterval(tick);
    progressBar.style.width = "100%";
    progressText.textContent = "Done!";
    setTimeout(() => progressWrap.classList.add("hidden"), 800);

    lastBatch = data.results;
    renderBatchCards(lastBatch);
    statusEl.classList.add("hidden");
    batchResultsEl.classList.remove("hidden");
  } catch (err) {
    clearInterval(tick);
    progressWrap.classList.add("hidden");
    statusEl.classList.add("error");
    statusEl.textContent = `❌ ${err.message}`;
  } finally {
    setBatchLoading(false);
  }
});

// ── Render batch result cards ─────────────
function slug(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40) || "site";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderBatchCards(results) {
  batchCards.innerHTML = results
    .map((r, i) => {
      if (!r.success) {
        return `
          <div class="card error-card">
            <div class="card-head">
              <strong>${escapeHtml(r.url)}</strong>
              <span class="badge fail">failed</span>
            </div>
            <p class="err">${escapeHtml(r.error || "Unknown error")}</p>
          </div>`;
      }
      return `
        <div class="card">
          <div class="card-head">
            <strong>${escapeHtml(r.url)}</strong>
            <span class="badge ok">done</span>
          </div>
          ${
            r.screenshot
              ? `<img class="thumb" src="data:image/png;base64,${r.screenshot}" alt="preview" />`
              : ""
          }
          <details>
            <summary>design.md</summary>
            <pre>${escapeHtml(r.design_md)}</pre>
          </details>
          <details>
            <summary>skills.md</summary>
            <pre>${escapeHtml(r.skills_md)}</pre>
          </details>
          <div class="card-actions">
            <button class="btn-secondary" onclick="window.__copy(${i}, 'design')">Copy design.md</button>
            <button class="btn-secondary" onclick="window.__copy(${i}, 'skills')">Copy skills.md</button>
          </div>
        </div>`;
    })
    .join("");
}

// Expose copy handler for inline buttons
window.__copy = (i, kind) => {
  const text = kind === "design" ? lastBatch[i].design_md : lastBatch[i].skills_md;
  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
};

// ── ZIP download ──────────────────────────
document.getElementById("download-zip").addEventListener("click", async () => {
  if (typeof JSZip === "undefined") {
    alert("JSZip failed to load — check your internet connection.");
    return;
  }

  const zip = new JSZip();
  lastBatch.forEach((r) => {
    if (!r.success) return;
    const folder = zip.folder(slug(r.url));
    folder.file("design.md", r.design_md);
    folder.file("skills.md", r.skills_md);
    if (r.screenshot) {
      folder.file("preview.png", r.screenshot, { base64: true });
    }
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "design-scrape.zip";
  link.click();
  URL.revokeObjectURL(link.href);
});

// ── Single-mode actions ───────────────────
document.getElementById("copy-btn").addEventListener("click", () => {
  const text = currentTab === "design" ? outputDesign.textContent : outputSkills.textContent;
  navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
});

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

document.getElementById("download-design").addEventListener("click", () => {
  downloadFile("design.md", outputDesign.textContent);
});

document.getElementById("download-skills").addEventListener("click", () => {
  downloadFile("skills.md", outputSkills.textContent);
});