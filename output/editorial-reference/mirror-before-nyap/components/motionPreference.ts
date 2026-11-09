// Motion runs by default; respect the OS preference and the explicit QA freeze.
export function shouldReduceMotion(media: MediaQueryList) {
  const mode = new URLSearchParams(window.location.search).get("motion");
  return mode === "off" || media.matches;
}
