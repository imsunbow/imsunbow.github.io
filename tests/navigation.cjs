const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=require('node:path').resolve(__dirname, '..').replaceAll('\\', '/') + '/';
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,390]){
 await page.setViewportSize({width,height:950});
 await page.goto('file:///'+root+'index.html');
 assert.notEqual(await page.locator('.primary-link').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
 await page.locator('.secondary-link').click();
 assert(page.url().endsWith('projects.html'));
 assert(await page.locator('.current-work').isVisible());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('.text-link').click();
 assert(page.url().endsWith('cyclone.html'));
 for(const button of await page.locator('[data-erd]').all()){
  await button.click();
  const target=await button.getAttribute('data-erd');
  assert(await page.locator('#erd-'+target).isVisible());
 }
 for(const button of await page.locator('[data-program]').all()){
  await button.click();
  const target=await button.getAttribute('data-program');
  assert(await page.locator('#'+target).isVisible());
  const thumbs=page.locator('#'+target+' [data-gallery]');
  await thumbs.last().click();
  assert.equal(await thumbs.last().getAttribute('aria-pressed'),'true');
 }
 await page.locator('#p11 .gallery-main a:visible').click();
 assert(await page.locator('dialog').isVisible());
 await page.locator('[data-zoom="1.25"]').click();
 assert((await page.locator('#lightbox-img').getAttribute('style')).includes('1.25'));
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('dialog').isVisible(),false);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('.breadcrumb').click();
 assert(page.url().endsWith('projects.html'));
 await page.goBack();assert(page.url().endsWith('cyclone.html'));
 await page.reload();assert(await page.locator('#p1').isVisible());
 await page.locator('.nav-logo').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('PASS',width,'navigation, all ERD/program tabs, galleries, dialog, history, overflow');
}
for(const file of ['index.html','projects.html','cyclone.html']){
 const html=fs.readFileSync(root+file,'utf8');
 assert(!/\bonclick=|\bonmouseover=|<style>|style=|showTab|refined.css|openCode/.test(html));
 await page.goto('file:///'+root+file);
 const broken=await page.evaluate(()=>[...document.images].filter(i=>i.getAttribute('src')&&(!i.complete||i.naturalWidth===0)).map(i=>i.src));
 assert.deepEqual(broken,[]);
}
assert.deepEqual(errors,[]);
await browser.close();console.log('All checks passed');
})().catch(e=>{console.error(e);process.exit(1)});