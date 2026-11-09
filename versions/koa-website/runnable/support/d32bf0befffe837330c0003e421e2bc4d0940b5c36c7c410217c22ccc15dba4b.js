const root = document.documentElement;
const header = document.querySelector("[data-header]");
const timeline = document.querySelector("[data-timeline]");
const frames = [...document.querySelectorAll(".cinema-frame")];
const beats = [...document.querySelectorAll("[data-beat]")];
const frameOutput = document.querySelector("[data-frame]");
const motionToggle = document.querySelector("[data-motion-toggle]");
const motionLabel = document.querySelector("[data-motion-label]");
const donateDialog = document.querySelector("[data-donate-dialog]");
const languageDialog = document.querySelector("[data-language-dialog]");

const totalFrames = 5000;
let framePending = false;

function setMotion(mode, save = true) {
  const fullMotion = mode === "full";
  root.dataset.motion = fullMotion ? "full" : "reduced";
  motionToggle?.setAttribute("aria-pressed", String(fullMotion));
  if (motionLabel) motionLabel.textContent = fullMotion ? "Motion on" : "Motion off";
  if (save) localStorage.setItem("koa-v5-motion", fullMotion ? "full" : "reduced");
}

function updateTimeline() {
  framePending = false;
  if (!timeline || root.dataset.motion === "reduced") return;
  const rect = timeline.getBoundingClientRect();
  const travel = Math.max(1, timeline.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / travel));
  const virtualFrame = Math.round(progress * totalFrames);
  const nextBeat = Math.min(beats.length - 1, Math.floor(progress * beats.length));
  if (frameOutput) frameOutput.textContent = String(virtualFrame).padStart(4, "0");
  frames.forEach((frame, index) => frame.classList.toggle("is-visible", index === nextBeat));
  beats.forEach((beat, index) => beat.classList.toggle("is-active", index === nextBeat));
}

function requestTimelineUpdate() {
  if (framePending) return;
  framePending = true;
  window.requestAnimationFrame(updateTimeline);
}

const storedMotion = localStorage.getItem("koa-v5-motion");
setMotion(storedMotion === "reduced" ? "reduced" : "full", false);
motionToggle?.addEventListener("click", () => setMotion(root.dataset.motion === "full" ? "reduced" : "full"));
window.addEventListener("scroll", requestTimelineUpdate, { passive: true });
window.addEventListener("resize", requestTimelineUpdate);
updateTimeline();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const chapterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    const photo = entry.target.querySelector(".chapter-photo");
    if (photo) photo.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.18, rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll("[data-chapter]").forEach((chapter) => chapterObserver.observe(chapter));

const headerObserver = new IntersectionObserver(([entry]) => header?.classList.toggle("is-scrolled", !entry.isIntersecting), { threshold: 0.1 });
const headerTarget = document.querySelector("#cinema");
if (headerTarget) headerObserver.observe(headerTarget);

document.querySelectorAll("[data-donate-open]").forEach((button) => button.addEventListener("click", () => donateDialog?.showModal()));
document.querySelectorAll("[data-donate-close]").forEach((control) => control.addEventListener("click", () => donateDialog?.close()));
donateDialog?.addEventListener("click", (event) => { if (event.target === donateDialog) donateDialog.close(); });

function openLanguageDialog() {
  if (languageDialog && !languageDialog.open) languageDialog.showModal();
}

document.querySelectorAll("[data-language-open]").forEach((button) => button.addEventListener("click", openLanguageDialog));
document.querySelectorAll("[data-language-close], [data-language-english]").forEach((control) => {
  control.addEventListener("click", () => languageDialog?.close());
});
languageDialog?.addEventListener("click", (event) => { if (event.target === languageDialog) languageDialog.close(); });

document.querySelectorAll("a, button, summary").forEach((element) => element.classList.add("glimmer"));
window.addEventListener("DOMContentLoaded", () => window.setTimeout(openLanguageDialog, 550), { once: true });
