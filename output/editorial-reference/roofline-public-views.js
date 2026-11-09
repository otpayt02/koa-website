async (page) => {
  const proof='C:/Users/olive/Projects/koa-website/output/editorial-reference/';
  await page.emulateMedia({reducedMotion:'no-preference'});
  const views=[];
  for(const [name,width,height] of [['desktop',1280,1000],['mobile',390,844]]) {
    await page.setViewportSize({width,height});
    await page.goto('https://koamerica.org/en');
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('h1').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
    views.push(await page.evaluate(()=>({width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,titleFits:document.querySelector('h1').scrollWidth<=document.querySelector('h1').clientWidth,panelCount:document.querySelectorAll('.koa-pillar-stage > article').length})));
    await page.screenshot({path:proof+'roofline-'+name+'.png'});
  }
  return {url:page.url(),views};
}
