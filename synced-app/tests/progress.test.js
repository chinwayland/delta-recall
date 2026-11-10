import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState,mergeProgress } from '../public/progress-state.js';
import { ProgressSync } from '../public/cloud-sync.js';
const record=(lastReviewed,streak=1)=>({lastReviewed,due:lastReviewed+86400000,reviews:1,lapses:0,grade:'good',streak});
const state=stats=>({version:1,stats,session:null});
test('imports merge cards by recency, not a higher but older streak',()=>{
  const a=state({g01:record(100,4)}),b=state({g01:record(200,1),t01:record(300)});
  const merged=mergeProgress(a,b);assert.equal(merged.stats.g01.streak,1);assert.equal(Object.keys(merged.stats).length,2);
  assert.deepEqual(mergeProgress(merged,b),merged);
});
test('session validation preserves current card and draft but strips undo history',()=>{
  const s={...state({}),session:{topic:'all',initial:2,queue:['g01'],completed:['t01'],counts:{again:1,hard:0,good:1},draft:'My answer',revealed:true,undo:{sensitive:'old draft'}}};
  const result=normalizeState(s);assert.equal(result.session.draft,'My answer');assert.equal(result.session.undo,null);
  assert.throws(()=>normalizeState({...s,session:{...s.session,queue:['g01','g01']}}));
});
test('invalid or oversized data cannot corrupt a saved state',()=>{
  assert.throws(()=>normalizeState({version:2,stats:{}}));
  assert.throws(()=>normalizeState(state({g01:{...record(100),streak:99}})));
  assert.throws(()=>normalizeState(state({g01:{...record(100),due:-1}})));
  assert.deepEqual(normalizeState(state({unknown:record(100)})).stats,{});
});
test('reset is not undone by an old device or an old import',()=>{
  const old={...state({g01:record(100)}),session:{topic:'all',initial:1,queue:['t01'],completed:[],counts:{again:0,hard:0,good:0},draft:'old',revealed:false}};
  const reset={...state({g02:record(500)}),resetAt:400};
  const result=mergeProgress(old,reset,'left');assert.ok(!result.stats.g01);assert.ok(result.stats.g02);assert.equal(result.session,null);
});
test('first import restores an unfinished legacy session without replacing later cloud work',async()=>{
  const session={topic:'terms',initial:1,queue:['t01'],completed:[],counts:{again:0,hard:0,good:0},draft:'Saved legacy answer',revealed:false};
  const sync=new ProgressSync({apply(){},status(){},conflict(){}});sync.ready=true;sync.cache=()=>{};sync.flush=async()=>{sync.dirty=false;};
  sync.state=normalizeState({...state({}),session:{...session,topic:'all',draft:''}});
  await sync.import({...state({t02:record(100)}),session});
  assert.equal(sync.state.session.draft,'Saved legacy answer');
  sync.state.session.draft='Current cloud answer';
  await sync.import({...state({t02:record(200)}),session});
  assert.equal(sync.state.session.draft,'Current cloud answer');
  assert.equal(sync.state.stats.t02.lastReviewed,200);
});
