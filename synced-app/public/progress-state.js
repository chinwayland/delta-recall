import { CARDS, TOPICS } from './cards.js';
const ids = new Set(CARDS.map(c=>c.id));
const topics = new Set(TOPICS.map(t=>t.id));
const object = x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const number = x=>Number.isSafeInteger(x)&&x>=0;
export function normalizeState(value) {
  if(!object(value)||value.version!==1||!object(value.stats))throw new Error('This is not a DELTA Recall progress file.');
  const resetAt=value.resetAt===undefined?0:value.resetAt;
  if(!number(resetAt))throw new Error('Invalid reset timestamp.');
  const stats={};
  for(const [id,s] of Object.entries(value.stats)) {
    if(!ids.has(id))continue;
    if(!object(s)||!number(s.due)||!number(s.lastReviewed)||!number(s.reviews)||!number(s.lapses)||!number(s.streak)||s.streak>5||!['again','hard','good'].includes(s.grade))throw new Error(`Invalid review record: ${id}`);
    if(s.lastReviewed>=resetAt)stats[id]={due:s.due,lastReviewed:s.lastReviewed,reviews:s.reviews,lapses:s.lapses,streak:s.streak,grade:s.grade};
  }
  let session=null;
  if(value.session!==null&&value.session!==undefined){
    const s=value.session;
    if(!object(s)||!topics.has(s.topic)||!Array.isArray(s.queue)||s.queue.length>10||!s.queue.every(id=>ids.has(id))||new Set(s.queue).size!==s.queue.length||!number(s.initial)||s.initial>10||!Array.isArray(s.completed)||s.completed.length>s.initial||!s.completed.every(id=>ids.has(id))||new Set(s.completed).size!==s.completed.length||!object(s.counts)||!['again','hard','good'].every(k=>number(s.counts[k]))||typeof s.draft!=='string'||s.draft.length>4000||typeof s.revealed!=='boolean')throw new Error('The saved session is invalid.');
    if(s.queue.some(id=>s.completed.includes(id))||s.queue.length+s.completed.length!==s.initial)throw new Error('The saved session is incomplete.');
    session={topic:s.topic,queue:[...s.queue],initial:s.initial,completed:[...s.completed],counts:{again:s.counts.again,hard:s.counts.hard,good:s.counts.good},draft:s.draft,revealed:s.revealed,undo:null};
  }
  return {version:1,resetAt,stats,session};
}
export function mergeProgress(left,right,prefer='right') {
  const a=normalizeState(left),b=normalizeState(right),resetAt=Math.max(a.resetAt,b.resetAt),stats={};
  for(const [id,s] of Object.entries(a.stats))if(s.lastReviewed>=resetAt)stats[id]=s;
  for(const [id,s] of Object.entries(b.stats)) {
    const old=stats[id];
    if(s.lastReviewed>=resetAt&&(!old||s.lastReviewed>old.lastReviewed||(s.lastReviewed===old.lastReviewed&&s.reviews>=old.reviews)))stats[id]=s;
  }
  const sa=a.resetAt===resetAt?a.session:null,sb=b.resetAt===resetAt?b.session:null;
  return {version:1,resetAt,stats,session:prefer==='left'?(sa||sb):(sb||sa)};
}
