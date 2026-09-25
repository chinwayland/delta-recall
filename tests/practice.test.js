import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, TOPICS, SOURCES } from '../dist/cards.js';
import { rateCard, createQueue, DAY, ready } from '../dist/engine.js';

test('complete deck has unique, fully populated cards and valid references',()=>{
  assert.equal(CARDS.length,60);assert.equal(new Set(CARDS.map(c=>c.id)).size,60);
  for(const c of CARDS){for(const k of ['id','topic','kind','q','answer','explain','trap','source'])assert.ok(typeof c[k]==='string'&&c[k].trim(),`${c.id} ${k}`);assert.ok(c.checks.length>=2);assert.ok(TOPICS.some(t=>t.id===c.topic));assert.ok(SOURCES[c.source].url.startsWith('https://'));}
});
test('spaced good recalls grow the interval, early repeats do not',()=>{
  let now=10000000,s=rateCard(null,'good',now);assert.equal(s.due,now+DAY);assert.equal(s.streak,1);
  const early=rateCard(s,'good',now+1000);assert.equal(early.streak,1);assert.equal(early.due,s.due);
  now=s.due;s=rateCard(s,'good',now);assert.equal(s.streak,2);assert.equal(s.due,now+3*DAY);
  now=s.due;s=rateCard(s,'good',now);assert.equal(s.streak,3);assert.equal(s.due,now+7*DAY);
});
test('forgetting resets confidence and permits recovery in the same session',()=>{
  const old={streak:4,reviews:8,lapses:1,due:100};const s=rateCard(old,'again',200);assert.equal(s.streak,0);assert.equal(s.lapses,2);assert.equal(s.due,600200);
  const recovered=rateCard(s,'good',1000);assert.equal(recovered.streak,1);assert.equal(recovered.due,1000+DAY);
  const hard=rateCard(old,'hard',200);assert.equal(hard.streak,0);assert.equal(hard.due,200+DAY);
  assert.throws(()=>rateCard(null,'perfect'));
});
test('mixed queue is unique, weighted and excludes future cards',()=>{
  const q=createQueue(CARDS,{},'all',false,1000,()=>.5);assert.equal(q.length,10);assert.equal(new Set(q).size,10);
  assert.equal(q.filter(id=>CARDS.find(c=>c.id===id).topic==='grammar').length,3);
  const future=Object.fromEntries(CARDS.map(c=>[c.id,{due:2000}]));assert.deepEqual(createQueue(CARDS,future,'all',false,1000),[]);assert.equal(createQueue(CARDS,future,'all',true,1000).length,10);
});
test('topic queue includes due reviews first and respects due boundary',()=>{
  const term=CARDS.find(c=>c.topic==='terms'),stats={[term.id]:{due:1000}};
  assert.equal(ready(term,stats,999),false);assert.equal(ready(term,stats,1000),true);
  const q=createQueue(CARDS,stats,'terms',false,1000,()=>.5);assert.equal(q[0],term.id);assert.ok(q.every(id=>CARDS.find(c=>c.id===id).topic==='terms'));
});
