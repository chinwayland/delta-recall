import { CARDS, TOPICS, SOURCES } from './cards.js';
import { createQueue, rateCard, ready, INTERVALS } from './engine.js';
const KEY = 'delta-recall-v1';
const $ = s => document.querySelector(s);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId = Object.fromEntries(CARDS.map(c => [c.id,c]));
let storageOK = true, data = {version:1, stats:{},session:null};
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved?.version === 1 && saved.stats && typeof saved.stats === 'object' && !Array.isArray(saved.stats)) {
    data.stats = Object.fromEntries(Object.entries(saved.stats).filter(([id,s])=>byId[id] && s && Number.isFinite(s.due) && Number.isInteger(s.streak) && s.streak>=0 && s.streak<=5));
    const s=saved.session;
    if(s && Array.isArray(s.queue) && s.queue.every(id=>byId[id]) && TOPICS.some(t=>t.id===s.topic) && Array.isArray(s.completed) && Number.isFinite(s.initial) && s.initial>0 && s.counts && ['again','hard','good'].every(k=>Number.isFinite(s.counts[k]))) {
      data.session={...s,draft:typeof s.draft==='string'?s.draft:'',revealed:!!s.revealed,undo:null};
    }
  }
} catch { storageOK = false; }
function persist() {
  try { localStorage.setItem(KEY,JSON.stringify(data)); storageOK=true; } catch {storageOK=false;}
  $('#storage-note').textContent=storageOK?'Progress saved on this browser.':'Storage unavailable. Progress lasts in this tab.';
  $('#storage-note').dataset.unavailable=String(!storageOK);
}
function start(topic='all', all=false) {
  if(!TOPICS.some(t=>t.id===topic)) throw new Error('Unknown topic');
  const queue=createQueue(CARDS,data.stats,topic,all);
  data.session={topic,queue,initial:queue.length,completed:[],counts:{again:0,hard:0,good:0},draft:'',revealed:false,undo:null};
  persist();render();
}
function renderSidebar() {
  $('#topics').innerHTML=TOPICS.map((t,i)=>`${i===1?'<div class="topic-separator"></div>':''}<button class="topic ${data.session.topic===t.id?'active':''}" data-topic="${t.id}" aria-pressed="${data.session.topic===t.id}"><span class="topic-symbol" aria-hidden="true">${t.symbol}</span><span>${t.name}</span><span class="topic-count">${CARDS.filter(c=>(t.id==='all'||c.topic===t.id)&&ready(c,data.stats)).length}</span></button>`).join('');
  const strengthened=CARDS.filter(c=>(data.stats[c.id]?.streak||0)>=3).length;
  $('#learned').textContent=strengthened;$('#deck-size').textContent=`of ${CARDS.length} cards strengthened`;$('#learned-bar').style.width=`${strengthened/CARDS.length*100}%`;
  $('#topics').querySelectorAll('button').forEach(b=>b.onclick=()=>{start(b.dataset.topic);focusPrompt();});
}
function nextGoodLabel(id){const old=data.stats[id];if(old?.streak>0&&old.due>Date.now())return 'Keep schedule';const days=INTERVALS[Math.min(old?.streak||0,4)];return days===1?'Tomorrow':`In ${days} days`;}
function render() {
  renderSidebar();
  const s=data.session,t=TOPICS.find(t=>t.id===s.topic),done=s.completed.length;
  $('#session-title').textContent=t.name;$('#session-description').textContent=t.description;
  $('#session-size').textContent=s.initial||'—';$('#session-counter').textContent=`${done} of ${s.initial} complete`;
  $('#session-bar').setAttribute('aria-valuemax',Math.max(1,s.initial));$('#session-bar').setAttribute('aria-valuenow',done);$('#progress-fill').style.width=`${s.initial?done/s.initial*100:0}%`;
  $('#attempt-counter').textContent=s.counts.again?`${s.counts.again} revisit${s.counts.again===1?'':'s'}`:'Take your time';
  $('#undo').disabled=!s.undo;
  if(!s.queue.length){renderEnd();return;}
  const c=byId[s.queue[0]], topic=TOPICS.find(t=>t.id===c.topic),source=SOURCES[c.source];
  const prompt=`<h2 class="prompt" id="prompt" tabindex="-1">${esc(c.q)}</h2>${c.example?`<blockquote class="example">${esc(c.example)}</blockquote>`:''}`;
  $('#card-area').innerHTML=`<article class="flashcard ${s.revealed?'answer':''}"><div class="card-content"><div class="card-meta"><span class="tag">${topic.name}</span><span class="card-kind">${c.kind}</span></div>${prompt}${s.revealed?`<h3 class="answer-title">${esc(c.answer)}</h3><p class="answer-body">${esc(c.explain)}</p><p class="check-heading">CHECK YOUR RECALL</p><ul class="check-list">${c.checks.map(x=>`<li><label><input type="checkbox"><span>${esc(x)}</span></label></li>`).join('')}</ul><div class="trap"><strong>COMMON TRAP</strong>${esc(c.trap)}</div>${s.draft?`<details class="your-answer"><summary>Your answer</summary><p>${esc(s.draft)}</p></details>`:''}<a class="answer-reference" href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label} ↗</a>`:`<label class="write-label" for="draft">Your answer <span>optional</span></label><textarea id="draft" placeholder="Think it through, or write a few words…" maxlength="4000">${esc(s.draft)}</textarea>`}</div><div class="card-footer">${s.revealed?`<div style="width:100%"><div class="ratings"><button class="rating again" data-grade="again"><strong>1 · Again</strong><small>Later this session</small></button><button class="rating hard" data-grade="hard"><strong>2 · Hard</strong><small>Tomorrow</small></button><button class="rating good" data-grade="good"><strong>3 · Got it</strong><small>${nextGoodLabel(c.id)}</small></button></div><p class="selfcheck-note">Rate your recall, not how familiar the answer looks.</p></div>`:`<span class="footer-hint">Try recalling before you look.</span><button class="primary" id="reveal">Reveal answer <span aria-hidden="true">↗</span></button>`}</div></article>`;
  if(!s.revealed){$('#draft').addEventListener('input',e=>{s.draft=e.target.value;persist();});$('#reveal').onclick=reveal;}
  else document.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>rate(b.dataset.grade));
}
function focusIntoView(el){if(!el)return;el.focus({preventScroll:true});const r=el.getBoundingClientRect();if(r.top<15||r.bottom>innerHeight-15)el.scrollIntoView({block:'start',behavior:'instant'});}
function reveal(){if(!data.session.queue.length||data.session.revealed)return;data.session.revealed=true;persist();render();$('#announcer').textContent='Answer revealed. Compare your response and choose a recall rating.';$('.answer-title').setAttribute('tabindex','-1');focusIntoView($('.answer-title'));}
function focusPrompt(){focusIntoView($('#prompt')||$('#finish-title'));}
function rate(grade){
  const s=data.session;if(!s.revealed||!s.queue.length) return;
  const id=s.queue[0],{undo,...previousSession}=s;
  const snapshot=JSON.parse(JSON.stringify(previousSession));
  const previousStats=data.stats[id]?{...data.stats[id]}:null;
  data.stats[id]=rateCard(previousStats,grade);
  s.queue.shift();
  if(grade==='again')s.queue.splice(Math.min(2,s.queue.length),0,id);
  else if(!s.completed.includes(id))s.completed.push(id);
  s.counts[grade]++;s.draft='';s.revealed=false;s.undo={id,previousStats,session:snapshot};
  persist();render();focusPrompt();
  $('#announcer').textContent=grade==='again'?'Card will return later in this session.':`Rating saved. ${s.completed.length} of ${s.initial} cards complete.`;
}
function undo(){const u=data.session.undo;if(!u)return;if(u.previousStats)data.stats[u.id]=u.previousStats;else delete data.stats[u.id];data.session={...u.session,undo:null};persist();render();focusPrompt();$('#announcer').textContent='Last rating undone.';}
function renderEnd(){
  const s=data.session,finished=s.initial>0;
  const available=CARDS.filter(c=>(s.topic==='all'||c.topic===s.topic)&&ready(c,data.stats)).length;
  $('#card-area').innerHTML=`<article class="flashcard empty"><div class="finish-icon" aria-hidden="true">✓</div><p class="eyebrow">${finished?'SESSION COMPLETE':'UP TO DATE'}</p><h2 id="finish-title" tabindex="-1">${finished?'A little stronger.':'Nothing due right now.'}</h2><p>${finished?`You completed ${s.initial} cards. Your next reviews are scheduled from your ratings.`:'Your cards are scheduled for later. Return when they are due, or practise an extra set.'}</p>${finished?`<div class="results"><div><strong>${s.counts.good}</strong><span>Got it</span></div><div><strong>${s.counts.hard}</strong><span>Hard</span></div><div><strong>${s.counts.again}</strong><span>Revisits</span></div></div>`:''}<button class="primary" id="continue">${available?'Next set':'Practise an extra set'}</button><button class="text-button" id="help-end">How does scheduling work?</button></article>`;
  $('#continue').onclick=()=>{start(s.topic,!available);focusPrompt();};$('#help-end').onclick=()=>$('#help-dialog').showModal();
}
$('#new-set').onclick=()=>{start(data.session.topic);focusPrompt();};$('#undo').onclick=undo;
$('#help-open').onclick=()=>$('#help-dialog').showModal();$('#sources-open').onclick=()=>$('#sources-dialog').showModal();
document.querySelectorAll('.dialog-close,.dialog-done').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#reset-request').onclick=()=>{$('#sources-dialog').close();$('#reset-dialog').showModal();};$('#reset-cancel').onclick=()=>$('#reset-dialog').close();
$('#reset-confirm').onclick=()=>{$('#reset-dialog').close();data={version:1,stats:{},session:null};start();focusPrompt();};
document.addEventListener('keydown',e=>{
  if(e.repeat||e.altKey||e.metaKey||e.ctrlKey||$('dialog[open]')||e.target.closest('textarea,input,select,[contenteditable="true"]'))return;
  if(e.code==='Space'&&!data.session.revealed&&data.session.queue.length){if(e.target.closest('button,a'))return;e.preventDefault();reveal();}
  if(data.session.revealed&&['1','2','3'].includes(e.key)){e.preventDefault();rate({1:'again',2:'hard',3:'good'}[e.key]);}
});
if(!data.session)start();else {persist();render();}
// Optional agent access uses exactly the same visible practice flow.
const context=document.modelContext;
if(context?.registerTool){
  const lifetime=new AbortController();
  const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});}catch{}};
  const validate=input=>{if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object');};
  register({name:'get_practice_card',description:'Read the visible flashcard. The answer is included only if already revealed.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:(input)=>{validate(input);const s=data.session,c=byId[s.queue[0]];return c?{id:c.id,topic:c.topic,question:c.q,example:c.example||null,revealed:s.revealed,...(s.revealed?{answer:c.answer,explanation:c.explain,checks:c.checks}:{})}:{complete:true};}});
  register({name:'reveal_practice_answer',description:'Reveal the current flashcard answer for self-checking. Does not grade or save a rating.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:(input)=>{validate(input);if(!data.session.queue.length)throw new Error('No active card');reveal();return {revealed:true,id:data.session.queue[0]};}});
  window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});
}
