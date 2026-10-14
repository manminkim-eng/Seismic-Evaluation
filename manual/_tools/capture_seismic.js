// 내진설계 의무대상 판정기 매뉴얼 화면 캡처 — usage: node capture_seismic.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 · serviceWorkers block · _marks.json(번호 배지 % 좌표) · _example.json(예제값 — 앱에서 읽음)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8897;
/* 예제 A = 학교(중요도 1) RC 라멘조 3층 2,400㎡ · 높이 12.6 · 처마 12.6 · 기둥 사이 8.4 · 2026-10-14 신청 → 의무 · 내진Ⅰ등급
   예제 B = 단독주택 목구조 1층 120㎡ · 높이 6.0 · 처마 4.5 · 기둥 사이 4.8 · 2026-10-14                 → 의무(제9호) · 내진Ⅱ등급
   예제 C = 사무소 RC 라멘조 5층 9,800㎡ · 높이 18 · 처마 18 · 기둥 사이 8.4 · 1995-05-02 신청           → 의무 없음(당시 6층 · 10만㎡) */
const FREEZE=`(()=>{const T=new Date(2026,9,14,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear();}catch(e){}})()`;
const HIDE='#toast,.toast,#pwa-install-banner,.pwa-banner,#installBanner{display:none!important}.judge-right{position:static!important;max-height:none!important;overflow:visible!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__find=sel=>{if(sel.startsWith('up:')){const [a,b]=sel.slice(3).split('|');const e=[...document.querySelectorAll(a)].find(__vis);return e?e.closest(b):null;}
 if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(__vis)[+i]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__sv=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};
window.__quiet=f=>{const si=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(){};try{f();}finally{setTimeout(()=>{Element.prototype.scrollIntoView=si;},300);}};
window.__set=c=>{document.getElementById('a4ProjName').value=c.pn||'';document.getElementById('a4Author').value=c.au||'';
 __sv('permitDate',c.date);__sv('structType',c.st);__sv('buildingUse',c.use);__sv('floorInput',c.f);syncFloor('i',c.f);__sv('areaInput',c.a);
 __sv('impSel',c.imp);__sv('heightInput',c.h);__sv('eavesInput',c.e);__sv('spanInput',c.s);__sv('specialSel',c.sp||'NONE');
 ['chkHeritage','chkStd','chkSoft','chkZone'].forEach(k=>document.getElementById(k).checked=false);seUpdateEra();runJudge();};
window.__E={
 A:{pn:'익산시 ○○초등학교 교사동 증축공사',au:'김만민',date:'2026-10-14',st:'RC_FRAME',use:'OTHER',f:3,a:2400,imp:'1',h:12.6,e:12.6,s:8.4},
 B:{pn:'익산시 ○○리 목조 단독주택 신축공사',au:'김만민',date:'2026-10-14',st:'WOOD',use:'HOUSE_D',f:1,a:120,imp:'2',h:6.0,e:4.5,s:4.8},
 C:{pn:'익산시 ○○동 업무시설 (1995년 허가분 검토)',au:'김만민',date:'1995-05-02',st:'RC_FRAME',use:'OTHER',f:5,a:9800,imp:'2',h:18,e:18,s:8.4},
};
window.__run=k=>__quiet(()=>{try{closeMasterModal();}catch(e){}goTab('judge');__set(__E[k]);window.scrollTo(0,0);});
window.__ex=()=>{const d=G;if(!d)return null;return {date:d.date,era:d.era.id,eraLabel:d.era.label,eraLaw:d.era.law,mandatory:d.mandatory,grade:d.grade,ie:d.ie,perf:d.perf,
 hits:d.clauses.filter(c=>c.hit).map(c=>c.code),clauses:d.clauses.map(c=>[c.law,c.txt,c.hit]),
 verdict:document.getElementById('verdictArea').innerText.replace(/\\s+/g,' ').trim(),sum:[...document.querySelectorAll('.sum-bar .sum-item')].map(e=>e.textContent.trim())};};`;
const SHOTS=[
 {id:'s01_overview',pre:"__run('A')",clip:'viewport',m:[['.tab-bar-inner','작업 탭 · 매뉴얼'],['.sum-bar','요약 스트립'],['up:#a4ProjName|.card','공사 정보(A4 표제)'],['up:#permitDate|.card','기준일(건축허가 신청일)'],['up:#structType|.card','건물 정보'],['#verdictArea','판정 결과'],['#gradeRow','적용 시점 · 내진등급 · 성능목표'],['#fab-group','초기화 · 관련법규']]},
 {id:'s02_tabs',clip:'.hdr-shell',m:[['nth:.tab-bar-inner .tb|0','판정'],['nth:.tab-bar-inner .tb|1','A4 결과서'],['nth:.tab-bar-inner .tb|2','법조문'],['nth:.tab-bar-inner .tb|3','연혁'],['nth:.tab-bar-inner .tb|4','기준표'],['.tb-manual','매뉴얼'],['.hdr-right','근거 · 시행일']]},
 {id:'s03_date',clip:'up:#permitDate|.card',m:[['#permitDate','건축허가 · 대수선허가 신청일'],['#eraHint','적용 시점 · 근거 조문']]},
 {id:'s04_bldg',clip:'up:#structType|.card',m:[['up:#structType|.form-group','구조형식'],['up:#buildingUse|.form-group','건축물 용도'],['up:#floorInput|.form-group','지상 층수'],['#areaInput','연면적'],['#impSel','중요도(별표 11)'],['up:#heightInput|.form-group','높이'],['up:#eavesInput|.form-group','처마높이'],['up:#spanInput|.form-group','기둥 사이 최대 거리'],['up:#specialSel|.form-group','특수구조'],['.se-checks','그 밖의 조건 4종']]},
 {id:'s05_result_a',clip:'#verdictArea',union:'#gradeRow',m:[['#verdictArea','판정'],['nth:.grade-box|0','적용 시점'],['nth:.grade-box|1','내진등급(별표 12)'],['nth:.grade-box|2','최소성능목표 · 중요도계수']]},
 {id:'s06_basis_a',clip:'#basisList',union:'#noticeBox',m:[['nth:.basis-item|0','적용 시점 · 근거'],['nth:.basis-item|1','제1호 층수'],['nth:.basis-item|2','제2호 연면적'],['nth:.basis-item|6','제6호 중요도'],['#noticeBox','이행 사항 · 주의']]},
 {id:'s07_result_b',pre:"__run('B')",wait:800,clip:'#verdictArea',union:'#basisList',crop:1500,m:[['#verdictArea','의무 적용'],['nth:.grade-box|1','내진Ⅱ등급'],['nth:.basis-item|1','층수 1층 — 목구조 3층 기준'],['nth:.basis-item|9','제9호 단독주택 — 해당']]},
 {id:'s08_result_c',pre:"__run('C')",wait:800,clip:'#verdictArea',union:'#basisList',m:[['#verdictArea','의무 없음'],['nth:.grade-box|0','1992.6.1. ~ 1996.1.5.'],['nth:.basis-item|1','6층 이상'],['nth:.basis-item|2','10만㎡ 이상']]},
 {id:'s09_law',pre:"__run('A');goTab('law');['l1','l2','l3','l4'].forEach(k=>{const b=document.getElementById('lb-'+k);if(!b.classList.contains('open'))toggleLaw(k);});scrollTo(0,0)",wait:900,clip:'#tab-law .main-wrap',crop:2400,m:[['nth:.law-card|0','건축법 제48조'],['nth:.law-card|1','시행령 제32조 제2항'],['nth:.law-card|2','KDS 41 17 00 : 2022'],['nth:.law-card|3','지진 · 화산재해대책법']]},
 {id:'s10_history',pre:"goTab('history');scrollTo(0,0)",wait:700,clip:'#tab-history .card',crop:2400,m:[]},
 {id:'s11_guide',pre:"goTab('guide');scrollTo(0,0)",wait:700,clip:'nth:#tab-guide .card|0',m:[]},
 {id:'s12_grade',clip:'nth:#tab-guide .card|1',m:[]},
 {id:'s13_modal',pre:"goTab('judge');scrollTo(0,0);openMasterModal(0)",wait:900,fixed:true,clip:'.master-modal-box',m:[]},
 {id:'s14_modal_law',pre:"switchMasterTab(1)",wait:600,fixed:true,post:"closeMasterModal()",clip:'.master-modal-box',m:[]},
 {id:'s15_a4',pre:"__run('A');goTab('print');scrollTo(0,0)",wait:1500,clip:'viewport',m:[['.mm-btn-print','인쇄 / PDF'],['.mm-btn-jpg','JPG 저장'],['#a4Page','A4 판정 결과서']]},
 {id:'s16_a4page',clip:'#a4Page',crop:2600,m:[['nth:#a4Page .a4-sub|0','1. 입력 정보'],['nth:#a4Page .a4-sub|1','2. 판정 결과'],['nth:#a4Page .a4-sub|2','3. 판정 근거'],['nth:#a4Page .a4-sub|3','4. 안내 사항'],['nth:#a4Page .a4-sub|4','5. 적용 기준']]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block',locale:'ko-KR'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(2500);
 await pg.addStyleTag({content:HIDE});await pg.evaluate(HELP);
 const ex={};const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||700);
  if(S.clip!=='viewport'&&!S.fixed){await pg.evaluate(c=>{const e=__find(c);if(e){window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40);}},S.clip);await pg.waitForTimeout(500);}
  await pg.evaluate(v=>{const f=document.getElementById('fab-group');if(f)f.style.visibility=v?'':'hidden';},S.clip==='viewport');
  if(S.id==='s01_overview')ex.A=await pg.evaluate('__ex()');
  if(S.id==='s07_result_b')ex.B=await pg.evaluate('__ex()');
  if(S.id==='s08_result_c')ex.C=await pg.evaluate('__ex()');
  if(S.id==='s16_a4page')ex.A_a4=await pg.evaluate(()=>document.getElementById('a4Page').innerText.replace(/\s+/g,' '));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}
     const P=12;clip={x:Math.max(0,clip.x-P),y:Math.max(0,clip.y-P),width:clip.width+2*P,height:clip.height+2*P};
     if(S.crop&&clip.height>S.crop)clip.height=S.crop;}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:Math.max(0,c.x-sx),y:Math.max(0,c.y-sy),width:Math.min(c.width,VW),height:Math.min(c.height,VH-Math.max(0,c.y-sy))}});}
  else{try{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}catch(e){errs.push(S.id+' shot '+JSON.stringify(cl));continue;}}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(400);}
 }
 await pg.evaluate("__run('A')");await pg.waitForTimeout(600);ex.after=await pg.evaluate('__ex()');
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true,locale:'ko-KR'});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(2500);
 await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);await mp.evaluate("__run('A')");await mp.waitForTimeout(800);
 await mp.screenshot({path:path.join(out,'s17_mobile_main.png')});meta['s17_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{const e=document.getElementById('resultPanel');const y=e.getBoundingClientRect().top+window.scrollY-12;window.scrollTo(0,y);});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s18_mobile_result.png')});meta['s18_mobile_result']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{goTab('print');window.scrollTo(0,0);});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s19_mobile_a4.png')});meta['s19_mobile_a4']={w:390,h:844,marks:[]};
 ex.mobile=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,vw:innerWidth,tabRows:new Set([...document.querySelectorAll('.tab-bar-inner .tb')].map(e=>Math.round(e.getBoundingClientRect().top))).size}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 const sh=o=>o&&[o.eraLabel,o.mandatory,o.grade,o.ie,o.hits.join(',')];
 console.log(JSON.stringify({A:sh(ex.A),B:sh(ex.B),C:sh(ex.C),same:JSON.stringify(ex.A)===JSON.stringify(ex.after),mobile:ex.mobile,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
