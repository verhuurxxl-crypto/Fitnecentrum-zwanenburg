import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium,webkit}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base='http://127.0.0.1:8090';
await fs.mkdir('test-results',{recursive:true});
const results=[];
const heroPages=JSON.parse(await fs.readFile('hero-pages.json','utf8'));
const routes=['/',...Object.keys(heroPages).map(path=>path==='404.html'?'/404.html':'/'+path.replace(/index\.html$/,''))];
for (const [engine,type] of Object.entries({chromium,webkit})) {
 const browser=await type.launch({headless:true});
 try {
  for(const width of [320,375,390,430,1366]) {
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const route of routes){
    const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200,`${engine} ${width} ${route}: HTTP`);
    await page.locator('h1').waitFor({state:'visible'});
    await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]));
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,bad:[...document.querySelectorAll('main h1,main h2,main h3,main h4,footer h2,footer address,footer a,.fcz-footer-grid,.fcz-membership-page,.fcz-faq-list,body>header .logo,body>header .header-cta,body>header .menu-toggle')].filter(e=>e.getClientRects().length).map(e=>({text:e.textContent.trim().slice(0,60),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left < -1||e.right>innerWidth+1)}));
    if(route!=='/')await page.waitForFunction(()=>[...document.querySelectorAll('.fcz-hero-visual img')].every(image=>image.complete&&image.naturalWidth>0));
    if(engine==='chromium'&&[375,1366].includes(width)&&['/aanbod/fitness/','/aanbod/yoga/','/aanbod/kickboksen/','/aanbod/personal-training/','/lesrooster/','/tarieven/','/voorwaarden/','/privacy/','/contact/'].includes(route))await page.screenshot({path:`test-results/hero-${width}-${route.replaceAll('/','_')}.png`,fullPage:false,animations:'disabled'});
    const label=`${engine} ${width} ${route}`;
    try {
     assert.ok(layout.scroll<=layout.width+1,label+': horizontale overflow '+JSON.stringify(layout));
     assert.deepEqual(layout.bad,[],label+': content buiten beeld');
     if(width>1050)assert.equal(await page.locator('#navigation .mobile-join').isVisible(),false,label+': geen dubbele proeflesknop');
     if(await page.locator('.page-hero h1 br').count())assert.notEqual(await page.locator('.page-hero h1 br').first().evaluate(e=>getComputedStyle(e).display),'none',label+': bewuste regelafbreking zichtbaar');
     const footerState=await page.locator('footer.fcz-footer').evaluate(e=>({color:getComputedStyle(e).backgroundColor,height:e.getBoundingClientRect().height,display:getComputedStyle(e).display,visibility:getComputedStyle(e).visibility,opacity:getComputedStyle(e).opacity}));
     assert.equal(footerState.color,'rgb(17, 17, 17)',label+': footer heeft donkere achtergrond');
     assert.ok(footerState.height>300,label+': footer heeft zichtbare inhoud');
     assert.notEqual(footerState.display,'none',label+': footer wordt weergegeven');
     assert.equal(footerState.visibility,'visible',label+': footer zichtbaar');
     assert.equal(footerState.opacity,'1',label+': footer niet transparant');
     assert.equal(await page.locator('footer a[href="/opzeggen/"]').count(),1,label+': opzegroute');
     assert.equal(await page.locator('footer a[href="tel:+31204978616"]').count(),1,label+': telefoon');
     if(route!=='/'){
      assert.equal(await page.locator('main .fcz-hero').count(),1,label+': eigen hero');
      const heroImages=page.locator('.fcz-hero-visual img');
      if(await heroImages.count()){
       const photos=await heroImages.evaluateAll(images=>images.map(image=>({src:image.getAttribute('src'),height:image.getBoundingClientRect().height,width:image.getBoundingClientRect().width})));
       assert.ok(photos.every(photo=>photo.height>=100&&photo.width>=50),label+': herofoto’s zichtbaar '+JSON.stringify(photos));
      }
      assert.notEqual(await page.locator('.fcz-hero h1 br').evaluate(e=>getComputedStyle(e).display),'none',label+': bewuste kopindeling');
     }
     if(route==='/voorwaarden/'){
      assert.equal(await page.locator('.terms-section').count(),18,label+': volledige voorwaarden');
      assert.match(await page.locator('.terms-status').textContent(),/Concept ter controle/);
      assert.equal(await page.locator('#print-terms').isVisible(),true,label+': voorwaarden bewaren');
      if(width<=900){
       await page.locator('.terms-toc summary').click();
       assert.equal(await page.locator('.terms-toc nav').isVisible(),true,label+': inhoud uitklappen');
       await page.locator('.terms-toc summary').click();
      }
     }
     if(route==='/lesrooster/'){
      await page.locator('#schedule-controls').waitFor({state:'visible'});
      assert.equal(await page.locator('#lessons .lesson').count(),37,label+': volledig rooster');
      assert.equal(await page.locator('#lessons .lesson:visible').count(),10,label+': maandag');
      for(const [day,count] of [10,5,10,7,3,1,1].entries()){
       await page.locator(`[data-day="${day}"]`).click();
       assert.equal(await page.locator('#lessons .lesson:visible').count(),count,label+': dag '+day);
       assert.equal(await page.locator(`[data-day="${day}"]`).getAttribute('aria-pressed'),'true');
      }
      await page.locator('[data-day="all"]').click();
      assert.equal(await page.locator('#lessons .lesson:visible').count(),37);
      await page.locator('#lesson-filter').selectOption('jeugd');
      assert.equal(await page.locator('#lessons .lesson:visible').count(),8);
      await page.locator('[data-day="6"]').click();
      assert.equal(await page.locator('#schedule-empty').isVisible(),true);
      await page.locator('#lesson-filter').selectOption('all');
      assert.equal(await page.locator('#schedule-empty').isVisible(),false);
      await page.locator('[data-day="all"]').click();
      await page.locator('#lesson-filter').selectOption('kick');
      assert.equal(await page.locator('#lessons .lesson:visible').count(),9);
      await page.locator('#lesson-filter').selectOption('groep');
      assert.equal(await page.locator('#lessons .lesson:visible').count(),20);
      await page.locator('#lesson-filter').selectOption('all');
      await page.locator('[data-day="0"]').click();
     }
     if(route==='/opzeggen/'){
      assert.equal(await page.locator('main form').count(),0,label+': geen opzegformulier');
      await page.getByText('Moet ik vertellen waarom ik stop?',{exact:true}).click();
      assert.equal(await page.getByText(/Je mag je reden delen als je dat wilt/).isVisible(),true,label+': vriendelijke uitleg leesbaar');
      await page.getByText('Moet ik vertellen waarom ik stop?',{exact:true}).click();
      assert.equal(await page.locator('main a[href="/voorwaarden/"]').count(),1,label+': voorwaarden bereikbaar');
      assert.equal(await page.locator('main a[href="/contact/"]').count(),2,label+': adres en openingstijden');
     }
     if(route==='/tarieven/'){
      assert.match(await page.locator('.club-extra-prices').textContent(),/€72,50/);
      assert.match(await page.locator('.pricing').textContent(),/Geen inschrijfkosten/);
      assert.match(await page.locator('.club-extra-prices').textContent(),/€65/);
     }
     if(route==='/gratis-proefles/'){
      await page.waitForFunction(()=>document.querySelector('#trial-form').hidden);
      assert.equal(await page.locator('#trial-success').isVisible(),false,label+': geen fictief succes');
      assert.equal(await page.locator('#trial-availability a[href^="tel:"]').isVisible(),true,label+': bellen als mail uit staat');
     }
     if(route==='/'){
      await page.locator(width<=1050?'.menu-toggle':'#mega-toggle').click();
      if(width<=1050)await page.locator('#mega-toggle').click();
      assert.equal(await page.locator('#mega-panel').isVisible(),true,label+': menu open');
      const menu=await page.locator('#mega-panel').boundingBox();
      assert.ok(menu.x>=0&&menu.x+menu.width<=width+1&&menu.y+menu.height<=901,label+': menu past in scherm '+JSON.stringify(menu));
      if(width>1050){
       assert.ok(menu.height<=620,label+': compact desktopmenu '+menu.height);
       const dimensions=await page.locator('#mega-panel').evaluate(e=>({height:e.clientHeight,scroll:e.scrollHeight}));
       assert.ok(dimensions.scroll<=dimensions.height+1,label+': menu zonder intern scrollen');
      }
      if(width<=600){
       assert.ok(menu.height>=500,label+': mobiel menu heeft bruikbare hoogte '+menu.height);
       assert.equal(await page.locator('.mega-heading-toggle[aria-expanded="true"]').count(),0,label+': categorieën starten compact');
       await page.locator('.mega-heading-toggle').nth(0).click();
       assert.equal(await page.locator('#menu-group-0').isVisible(),true);
       await page.locator('.mega-heading-toggle').nth(1).click();
       assert.equal(await page.locator('#menu-group-0').isVisible(),false);
       assert.equal(await page.locator('#menu-group-1').isVisible(),true);
       assert.equal(await page.locator('.mega-heading-toggle[aria-expanded="true"]').count(),1,label+': één categorie tegelijk');
       await page.locator('.mega-heading-toggle').nth(1).click();
       const afterToggle=await page.locator('#mega-panel').boundingBox();
       assert.ok(afterToggle.height>=500,label+': hoogte blijft correct na inklappen');
      }
      if(engine==='chromium'&&[375,1366].includes(width))await page.screenshot({path:`test-results/compact-menu-${width}.png`});
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mega-panel').isVisible(),false,label+': Escape sluit');
      assert.equal(await page.evaluate(()=>document.body.classList.contains('menu-open')||document.body.classList.contains('mega-open')),false,label+': scroll hersteld');
     }
     assert.deepEqual(errors,[],label+': JavaScript-fouten');
     results.push({engine,width,route,ok:true});
    }catch(error){
     await page.screenshot({path:`test-results/FAIL-${engine}-${width}-${route.replaceAll('/','_')}.png`,fullPage:true});
     await fs.writeFile('test-results/failure.json',JSON.stringify({label,layout,error:error.message},null,2));
     throw error;
    }
    if(engine==='chromium'&&[375,1366].includes(width)&&['/','/inschrijven/','/opzeggen/','/gratis-proefles/','/lesrooster/','/tarieven/'].includes(route))await page.screenshot({path:`test-results/${engine}-${width}-${route.replaceAll('/','_')||'home'}.png`,fullPage:true});
    if(route==='/'){
     await page.locator('footer.fcz-footer').scrollIntoViewIfNeeded();
     await page.waitForFunction(()=>!document.querySelector('.mobile-sticky-join')?.classList.contains('show'));
     if(engine==='chromium'&&[375,1366].includes(width))await page.locator('footer.fcz-footer').screenshot({path:`test-results/footer-${width}.png`,animations:'disabled'});
    }
   }
   await context.close();
  }
 } finally {await browser.close();}
}
// Exercise the real frontend against a local intercepted transport, never a live mailbox.
const browser=await chromium.launch();
try{
 const noScript=await browser.newContext({javaScriptEnabled:false});
 const fallback=await noScript.newPage();
 await fallback.goto(base+'/lesrooster/');
 assert.equal(await fallback.locator('#lessons .lesson:visible').count(),37,'Volledig weekrooster zonder JavaScript');
 assert.equal(await fallback.locator('#schedule-controls').isVisible(),false);
 await noScript.close();
 results.push({flow:'complete-week-without-javascript',ok:true});
 const page=await browser.newPage();let attempts=0;let payload;
 await page.route('**/api/trial.php',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{available:true}});
  payload=route.request().postDataJSON();attempts++;
  return attempts===1?route.fulfill({status:503,json:{error:'Tijdelijke testfout'}}):route.fulfill({status:202,json:{accepted:true,confirmationSent:false}});
 });
 await page.goto(base+'/gratis-proefles/?interest=yoga');
 assert.equal(await page.locator('#trial-interest').inputValue(),'yoga');
 await page.locator('#trial-name').fill('Robin Voorbeeld');await page.locator('#trial-email').fill('robin@example.com');
 await page.locator('#trial-form button').click();
 await page.locator('#trial-error').waitFor({state:'visible'});
 assert.equal(await page.locator('#trial-name').inputValue(),'Robin Voorbeeld');
 assert.equal(await page.locator('#trial-success').isVisible(),false);
 await page.locator('#trial-form button').click();
 await page.locator('#trial-success').waitFor({state:'visible'});
 assert.match(await page.locator('#trial-confirmation').textContent(),/kon nog niet worden verstuurd/);
 assert.equal(payload.interest,'yoga');assert.equal(attempts,2);
 results.push({flow:'frontend-error-retry-and-partial-mail',ok:true});
}finally{await browser.close();}
await fs.writeFile('test-results/responsive.json',JSON.stringify(results,null,2));
console.log(`${results.length} responsieve pagina- en formuliercontroles geslaagd. Geen echte mail verstuurd.`);
