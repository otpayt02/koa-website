async (page) => {
  const result = {};

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3013/en", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(1200);
  result.start = await page.evaluate(() => {
    const intro = document.querySelector("[data-koa-intro]");
    const header = document.querySelector(".nav-banner");
    return {
      progress: intro?.getAttribute("data-intro-progress"),
      authenticOrbitImages: document.querySelectorAll(".koa-intro__authentic-orbit-image").length,
      generatedOrbitLabels: document.querySelectorAll(".koa-intro__orbit-label, textPath").length,
      headerHeight: Math.round(header?.getBoundingClientRect().height || 0),
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  await page.screenshot({
    path: "C:/Users/olive/Projects/koa-website/output/playwright/koa-precision-desktop-start.png",
  });

  await page.evaluate(() => window.scrollTo(0, innerHeight * 2.1));
  await page.waitForTimeout(900);
  result.mid = await page.evaluate(() => {
    const intro = document.querySelector("[data-koa-intro]");
    const orbit = document.querySelector(".koa-intro__orbit-spin");
    const caption = document.querySelector(".koa-intro__lockup-caption");
    const copy = document.querySelector("[data-intro-copy]");
    return {
      progress: intro?.getAttribute("data-intro-progress"),
      orbit: orbit?.getAttribute("transform"),
      captionOpacity: caption ? getComputedStyle(caption).opacity : null,
      copyOpacity: copy ? getComputedStyle(copy).opacity : null,
    };
  });
  await page.screenshot({
    path: "C:/Users/olive/Projects/koa-website/output/playwright/koa-precision-desktop-mid.png",
  });

  await page.evaluate(() => window.scrollTo(0, innerHeight * 4.1));
  await page.waitForTimeout(900);
  result.end = await page.evaluate(() => {
    const intro = document.querySelector("[data-koa-intro]");
    const orbit = document.querySelector(".koa-intro__orbit-spin");
    const caption = document.querySelector(".koa-intro__lockup-caption");
    const copy = document.querySelector("[data-intro-copy]");
    return {
      progress: intro?.getAttribute("data-intro-progress"),
      orbit: orbit?.getAttribute("transform"),
      captionOpacity: caption ? getComputedStyle(caption).opacity : null,
      copyOpacity: copy ? getComputedStyle(copy).opacity : null,
    };
  });
  await page.locator('[data-koa-action="primary"]').click({ trial: true });
  await page.screenshot({
    path: "C:/Users/olive/Projects/koa-website/output/playwright/koa-precision-desktop-end.png",
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3013/en", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, innerHeight * 2.1));
  await page.waitForTimeout(800);
  result.mobile = await page.evaluate(() => {
    const intro = document.querySelector("[data-koa-intro]");
    const header = document.querySelector(".nav-banner");
    const strips = Array.from(document.querySelectorAll(".nav-banner__strip"));
    return {
      progress: intro?.getAttribute("data-intro-progress"),
      headerHeight: Math.round(header?.getBoundingClientRect().height || 0),
      headerWrap: header ? getComputedStyle(header).flexWrap : null,
      stripOverflow: strips.map((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowX: getComputedStyle(element).overflowX,
      })),
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  await page.screenshot({
    path: "C:/Users/olive/Projects/koa-website/output/playwright/koa-precision-mobile-formation.png",
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3013/en", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(800);
  result.reduced = await page.evaluate(() => {
    const intro = document.querySelector("[data-koa-intro]");
    const header = document.querySelector(".nav-banner");
    const orbit = document.querySelector(".koa-intro__orbit-spin");
    const caption = document.querySelector(".koa-intro__lockup-caption");
    return {
      state: intro?.getAttribute("data-intro-state"),
      progress: intro?.getAttribute("data-intro-progress"),
      headerHeight: Math.round(header?.getBoundingClientRect().height || 0),
      headerWrap: header ? getComputedStyle(header).flexWrap : null,
      orbit: orbit?.getAttribute("transform"),
      captionOpacity: caption ? getComputedStyle(caption).opacity : null,
      generatedOrbitLabels: document.querySelectorAll(".koa-intro__orbit-label, textPath").length,
    };
  });
  await page.screenshot({
    path: "C:/Users/olive/Projects/koa-website/output/playwright/koa-precision-reduced.png",
  });

  return result;
}
