import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium,webkit}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base='http://127.0.0.1:8090';
await fs.mkdir('test-results',{recursive:true});
const results=[];
const routes=['/','/aanbod/','/aanbod/yoga/','/gratis-proefles/','/inschrijven/','/veelgestelde-vragen/','/contact/','/privacy/','/voorwaarden/','/404.html'];
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
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,bad:[...document.querySelectorAll('main h1,main h2,main h3,.fcz-footer-grid,.fcz-membership-page,.fcz-faq-list,body>header .logo,body>header .header-cta,body>header .menu-toggle')].filter(e=>e.getClientRects().length).map(e=>({text:e.textContent.trim().slice(0,60),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left < -1||e.right>innerWidth+1)}));
    const label=`${engine} ${width} ${route}`;
    try {
     assert.ok(layout.scroll<=layout.width+1,label+': horizontale overflow '+JSON.stringify(layout));
     assert.deepEqual(layout.bad,[],label+': content buiten beeld');
     if(width>1050)assert.equal(await page.locator('#navigation .mobile-join').isVisible(),false,label+': geen dubbele proeflesknop');
     if(await page.locator('.page-hero h1 br').count())assert.notEqual(await page.locator('.page-hero h1 br').first().evaluate(e=>getComputedStyle(e).display),'none',label+': bewuste regelafbreking zichtbaar');
     assert.equal(await page.locator('footer a[href="/inschrijven/#opzeggen"]').count(),1,label+': opzegroute');
     assert.equal(await page.locator('footer a[href="tel:+31204978616"]').count(),1,label+': telefoon');
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
    if(engine==='chromium'&&[375,1366].includes(width)&&['/','/inschrijven/','/gratis-proefles/'].includes(route))await page.screenshot({path:`test-results/${engine}-${width}-${route.replaceAll('/','_')||'home'}.png`,fullPage:true});
   }
   await context.close();
  }
 } finally {await browser.close();}
}
// Exercise the real frontend against a local intercepted transport, never a live mailbox.
const browser=await chromium.launch();
try{
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
