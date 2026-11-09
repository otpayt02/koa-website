async (page) => {
  const proof = 'C:/Users/olive/Projects/koa-website/output/editorial-reference/';
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1280,height:1000});
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('h1').evaluate(el => Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  const measure = () => {
    const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
    return {width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
      photo:rect('.koa-static-portrait'),mark:rect('.koa-static-mark'),english:rect('.koa-static-name'),karen:rect('.koa-static-karen-name'),tagline:rect('.koa-static-tagline'),
      englishFont:getComputedStyle(document.querySelector('h1')).fontSize,karenFont:getComputedStyle(document.querySelector('.koa-static-karen-name')).fontSize,
      titleFits:document.querySelector('h1').scrollWidth <= document.querySelector('h1').clientWidth,
      karenFits:document.querySelector('.koa-static-karen-name').scrollWidth <= document.querySelector('.koa-static-karen-name').clientWidth};
  };
  const desktop = await page.evaluate(measure);
  await page.screenshot({path:proof+'roofline-desktop.png'});
  const first = await page.locator('[role=tab][aria-selected=true]').textContent();
  const started = Date.now();
  await page.waitForFunction(first => document.querySelector('[role=tab][aria-selected=true]').textContent !== first,first,{timeout:10000});
  await page.waitForFunction(() => [...document.querySelectorAll('.koa-pillar-stage > article')].filter(el => {const n=Number(getComputedStyle(el).opacity);return n>.05&&n<.95;}).length===2,null,{timeout:1500});
  const crossfade = await page.locator('.koa-pillar-stage > article').evaluateAll(items=>items.map(el=>({active:el.getAttribute('data-active'),opacity:getComputedStyle(el).opacity,blur:getComputedStyle(el).filter,inert:el.inert})));
  const next = await page.locator('[role=tab][aria-selected=true]').textContent();
  const cycle = [{label:next,at:Date.now()}];
  for (let step=0;step<2;step++) {
    const current=cycle[cycle.length-1].label;
    await page.waitForFunction(current=>document.querySelector('[role=tab][aria-selected=true]').textContent!==current,current,{timeout:10000});
    cycle.push({label:await page.locator('[role=tab][aria-selected=true]').textContent(),at:Date.now()});
  }
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.koa-pillar-stage > [data-active=true]')).opacity==='1');
  await page.locator('#koa-pillar-tab-1').focus();
  await page.keyboard.press('ArrowRight');
  const keyboard = await page.locator('[role=tab][aria-selected=true]').textContent();
  await page.setViewportSize({width:390,height:844});
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('h1').evaluate(el => Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  const mobile = await page.evaluate(measure);
  await page.screenshot({path:proof+'roofline-mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  const reduced = await page.locator('.koa-pillar-stage > article').first().evaluate(el=>({transition:getComputedStyle(el).transitionDuration,visibleTitle:getComputedStyle(document.querySelector('h1')).opacity}));
  return {desktop,mobile,first,cycle,intervals:cycle.slice(1).map((item,index)=>item.at-cycle[index].at),crossfade,keyboard,reduced,errors};
}
