const form = document.getElementById("scrape-form");
const urlInput = document.getElementById("url-input");
const scrapeBtn = document.getElementById("scrape-btn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const outputDesign = document.getElementById("output-design");
const outputSkills = document.getElementById("output-skills");
const tabs = document.querySelectorAll(".tab");

let currentTab = "design";

// ── Tab switching ─────────────────────────
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;

    document
      .querySelectorAll(".output")
      .forEach((o) => o.classList.remove("active"));
    document.getElementById(`output-${currentTab}`).classList.add("active");
  });
});

// ── Scrape submit ─────────────────────────
form.addEventListener("submit", async (e) => {
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

    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    // Populate outputs
    outputDesign.textContent = data.design_md;
    outputSkills.textContent = data.skills_md;

    // Show screenshot
    if (data.screenshot) {
      const img = document.getElementById("screenshot");
      img.src = `data:image/png;base64,${data.screenshot}`;
      document.getElementById("preview-wrapper").classList.remove("hidden");
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

function setLoading(isLoading) {
  scrapeBtn.disabled = isLoading;
  scrapeBtn.textContent = isLoading ? "Scraping..." : "Scrape";
}

// ── Copy button ───────────────────────────
document.getElementById("copy-btn").addEventListener("click", () => {
  const text =
    currentTab === "design"
      ? outputDesign.textContent
      : outputSkills.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  });
});

// ── Download buttons ──────────────────────
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
