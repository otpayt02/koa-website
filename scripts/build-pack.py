# -*- coding: utf-8 -*-
"""Build a self-contained single-file KOA site (hash router, inlined assets)."""
import re, os, shutil, base64, datetime, json

BASE = r"C:\Users\olive\Projects\koa-website\public\koa"
OUT = r"C:\Users\olive\Projects\koa-website\dist\koa.html"

PAGES = {
    "/":              ("index.html",        "KOA — Karen Organization of America"),
    "/about":         ("about.html",        "About — Karen Organization of America"),
    "/programs":      ("programs.html",     "Programs — Karen Organization of America"),
    "/stories":       ("stories.html",      "Stories — Karen Organization of America"),
    "/contact":       ("contact.html",      "Contact — Karen Organization of America"),
    "/coming-soon":   ("coming-soon.html",  "Coming Soon — Karen Organization of America"),
    "/music":         ("music.html",        "Music — Karen Organization of America"),
}

def b64img(path):
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        return "data:%s;base64," % mime + base64.b64encode(f.read()).decode()

def extract_parts(html):
    head = html[:html.find("</head>")]
    body = html[html.find("<body>") + 6 : html.rfind("</body>")]
    hs, he = body.find("<header"), body.find("</header>") + len("</header>")
    fs = body.rfind("<footer")
    fe = body.find("</footer>", fs) + len("</footer>")
    main = (body[:hs] + body[he:fs] + body[fe:])
    return head, body[hs:he], main, body[fs:fe]

def normalize(href):
    """Rewrite an internal href to the packed hash-router form."""
    if not href:
        return href
    if "waitlist" in href:
        return "#/coming-soon#waitlist"          # the early-access signup lives on Coming Soon
    m = re.search(r"([A-Za-z0-9_\-]+)\.html(?:[#?](.*))?$", href)
    if m:
        name, frag = m.group(1), m.group(2) or ""
        route = "/" if name == "index" else "/" + name
        if route not in PAGES:
            return href
        return "#" + route + ("#" + frag if frag else "")
    return href  # mailto:, http(s):, bare #anchor, tel: …

def rewrite_attrs(html):
    html = re.sub(r'(src|href)="(assets/[^"]+)"',
                  lambda m: m.group(1) + '="IMG:' + m.group(2) + '"', html)
    html = re.sub(r'href="([^"]+)"',
                  lambda m: 'href="' + normalize(m.group(1)) + '"', html)
    return html

css = open(os.path.join(BASE, "storytelling.css"), encoding="utf-8").read()
js  = open(os.path.join(BASE, "storytelling.js"),  encoding="utf-8").read()
# storytelling.js self-executes on load and exposes window.__koaInit for the
# hash router to re-run content setup after each page injection.

pages_obj = {}
header = footer = canonical_head = None
for route, (fname, title) in PAGES.items():
    html = open(os.path.join(BASE, fname), encoding="utf-8").read()
    head, hdr, main, ftr = extract_parts(html)
    if header is None:
        header, footer, canonical_head = hdr, ftr, head
    main = rewrite_attrs(main)
    pages_obj[route] = main

# One canonical header/footer, pill pointed at the signup
header = re.sub(r'href="([^"]*)"(?=\s*>\s*<span class="pulse")', 'href="#/coming-soon#waitlist"', header)
footer = rewrite_attrs(footer)
header = rewrite_attrs(header)

# Inline images across every page + shared chrome
for route in pages_obj:
    for m in re.finditer(r'IMG:assets/([^"]+)"', pages_obj[route]):
        pages_obj[route] = pages_obj[route].replace('IMG:assets/' + m.group(1) + '"',
                                                    b64img(os.path.join(BASE, "assets/" + m.group(1))) + '"')
header = re.sub(r'IMG:assets/([^"]+)"', lambda m: b64img(os.path.join(BASE, "assets/" + m.group(1))) + '"', header)
footer = re.sub(r'IMG:assets/([^"]+)"', lambda m: b64img(os.path.join(BASE, "assets/" + m.group(1))) + '"', footer)

titles_js = ",\n    ".join('%s: %s' % (json.dumps(r), json.dumps(t, ensure_ascii=False)) for r, (_, t) in PAGES.items())
pages_js  = ",\n    ".join('%s: %s' % (json.dumps(r), json.dumps(pages_obj[r], ensure_ascii=False)) for r in PAGES)

router = r"""
/* ================= KOA hash router (packed single-file build) ================= */
(function () {
  "use strict";
  var PAGES = {
    __PAGES__
  };
  var TITLES = {
    __TITLES__
  };
  var main = document.getElementById("main");
  var header = document.querySelector("header");

  /* Minimalist route transition: a fixed ink veil that fades the swap. */
  var veil = document.createElement("div");
  veil.className = "veil";
  document.body.appendChild(veil);
  var motionOff = function () { return document.body.dataset.motion === "off"; };

  function currentRoute() {
    var h = location.hash;
    var route = h.indexOf("#/") === 0 ? h.slice(1) : "/";
    var anchor = "";
    var i = route.indexOf("#", 1);
    if (i > 0) { anchor = route.slice(i); route = route.slice(0, i); }
    if (!(route in PAGES)) { route = "/"; anchor = ""; }
    return { route: route, anchor: anchor };
  }

  function initPage() {
    if (typeof window.__koaInit === "function") { window.__koaInit(); }
  }

  function render() {
    var c = currentRoute();
    main.innerHTML = PAGES[c.route];
    document.title = TITLES[c.route];
    if (header) {
      header.querySelectorAll("a[href]").forEach(function (a) {
        var r = a.getAttribute("href").replace(/^#/, "");
        if (a.getAttribute("href").indexOf("#/") === 0) r = a.getAttribute("href").slice(1).split("#")[0];
        if (r === c.route) { a.setAttribute("aria-current", "page"); }
        else { a.removeAttribute("aria-current"); }
      });
    }
    var panel = document.querySelector("[data-mobile-panel]");
    if (panel) { panel.classList.remove("is-open"); document.body.style.overflow = ""; }
    window.scrollTo(0, 0);
    initPage();
    if (c.anchor) {
      setTimeout(function () {
        var el = document.querySelector(c.anchor);
        if (el) { el.scrollIntoView({ behavior: "auto", block: "start" }); }
      }, 80);
    }
    return c;
  }

  function navigate(first) {
    if (first || motionOff()) {
      var c = render();
      if (!first) { history.replaceState(null, "", "#" + c.route); }
      // First paint / motion off: just clear the veil.
      requestAnimationFrame(function () { veil.classList.add("is-clear"); });
      return;
    }
    // Fade to ink, swap at the midpoint, fade back in.
    veil.classList.remove("is-clear");
    setTimeout(function () {
      var c = render();
      history.replaceState(null, "", "#" + c.route);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { veil.classList.add("is-clear"); });
      });
    }, 240);
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || !a.hasAttribute("href")) { return; }
    var href = a.getAttribute("href");
    var m = href.match(/^#(\/[A-Za-z0-9_-]*)(#[A-Za-z0-9_-]+)?$/);
    if (m) { e.preventDefault(); location.hash = "#" + m[1] + (m[2] || ""); return; }
    if (href.indexOf("#waitlist") === 0) {           // bare in-page waitlist anchor
      e.preventDefault();
      var c = currentRoute();
      if (c.route === "/coming-soon") {
        var el = document.querySelector(href);
        if (el) { el.scrollIntoView({ behavior: "auto", block: "start" }); }
      } else { location.hash = "#/coming-soon#waitlist"; }
    }
  });

  window.addEventListener("hashchange", function () { navigate(false); });
  if (!location.hash) { history.replaceState(null, "", "#/"); navigate(true); }
  else { navigate(true); }
})();
"""

router = router.replace("__PAGES__", pages_js).replace("__TITLES__", titles_js)

# Canonical <head>: keep the original head (without </head>), drop the
# external stylesheet + deferred script, inline the favicon, then append
# the inlined CSS and close the head explicitly.
def drop_line(h, needle):
    return "\n".join(l for l in h.splitlines() if needle not in l)

head = drop_line(canonical_head, "storytelling.css")
head = drop_line(head, "storytelling.js")
head = re.sub(r'<link[^>]+href="assets/koa-logo\.png"[^>]*>',
              '<link rel="icon" type="image/png" href="%s">' % b64img(os.path.join(BASE, "assets/koa-logo.png")),
              head, count=1)
assert "storytelling.css" not in head and "storytelling.js" not in head
assert "</head>" not in head  # we close it ourselves below
head = head.rstrip("\n") + '\n<style>\n' + css + '\n</style>\n</head>'

stamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
out = ["<!DOCTYPE html>", "<html lang=\"en\">", head, "<body>", header,
       '<main id="main"><!-- packed: page content injected by the hash router --></main>',
       footer, "<script>", js, "</script>", "<script>", router, "</script>",
       "<!-- packed by scripts/build-pack.py on " + stamp + " -->",
       "</body></html>"]
text = "\n".join(out)

# sanity: nothing left referencing loose files, exactly one head, css inlined
leftover = re.findall(r'(?:src|href)="(?:assets/|storytelling|script\.js|styles\.css|v4)', text)
assert not leftover, "loose refs remain: %r" % leftover[:5]
assert "IMG:assets" not in text
assert text.count("</head>") == 1 and text.count("<style>") == 1
assert "--ink-950" in text and "window.__koaInit" in text

os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT):
    shutil.copy(OUT, OUT + ".bak")
with open(OUT, "w", encoding="utf-8") as f:
    f.write(text)
print("wrote", OUT, len(text)/1024/1024, "MB")
