import { normalizeState, mergeProgress } from './progress-state.js';
const EMPTY={version:1,stats:{},session:null};
const clone=x=>JSON.parse(JSON.stringify(x));

export class ProgressSync {
  constructor({apply,status,conflict}){this.apply=apply;this.status=status;this.conflict=conflict;this.revision=0;this.dirty=false;this.saving=false;this.pending=false;this.ready=false;this.state=clone(EMPTY);this.cacheKey=null;this.timer=null;}
  cache(){if(!this.cacheKey)return;try{localStorage.setItem(this.cacheKey,JSON.stringify({revision:this.revision,dirty:this.dirty,state:this.state}));}catch{}}
  async request(method='GET',body){
    const r=await fetch('/api/progress',{method,credentials:'same-origin',cache:'no-store',redirect:'error',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
    if(r.status===401){this.status('Sign in again to sync','auth');throw new Error('AUTH');}
    const payload=await r.json();return {r,payload};
  }
  async connect(){
    const {r,payload}=await this.request();if(!r.ok)throw new Error('Could not load your account.');
    this.user=payload.user;this.cacheKey=`delta-recall-account:${this.user.id}`;this.revision=payload.revision;
    this.state=payload.state?normalizeState(payload.state):clone(EMPTY);
    let cached;try{cached=JSON.parse(localStorage.getItem(this.cacheKey));}catch{}
    if(cached?.dirty){
      const local=normalizeState(cached.state);
      this.dirty=true;
      if(cached.revision===this.revision){this.state=local;}
      else {this.state=local;this.remote=payload;this.revision=cached.revision;this.pending=true;}
    }
    this.ready=true;this.status(this.dirty?'Waiting to save':'Saved to account',this.dirty?'pending':'saved');this.cache();
    window.addEventListener('online',()=>this.refresh());
    window.addEventListener('focus',()=>this.refresh());
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')this.refresh();else if(this.dirty)this.flush();});
    this.poll=setInterval(()=>{if(document.visibilityState==='visible')this.refresh();},15000);
    window.addEventListener('beforeunload',e=>{if(this.dirty){e.preventDefault();e.returnValue='';}});
    return clone(this.state);
  }
  activate(){if(this.pending)this.showConflict();else if(this.dirty)this.schedule();}
  change(value){if(!this.ready)return;const next=normalizeState(value);if(JSON.stringify(next)===JSON.stringify(this.state))return;this.state=next;this.dirty=true;this.cache();this.status('Saving to account…','pending');this.schedule();}
  schedule(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),500);}
  async flush(){
    if(!this.ready||!this.dirty||this.saving||this.pending)return;
    this.saving=true;const snapshot=clone(this.state),sent=JSON.stringify(snapshot);
    try{
      const {r,payload}=await this.request('PUT',{accountId:this.user.id,revision:this.revision,state:snapshot});
      if(r.status===409){this.remote=payload;this.pending=true;this.showConflict();return;}
      if(!r.ok)throw new Error(payload.error||'Save failed');
      this.revision=payload.revision;
      if(JSON.stringify(this.state)===sent)this.dirty=false;
      this.cache();this.status(this.dirty?'Saving to account…':'Saved to account',this.dirty?'pending':'saved');
    }catch(error){this.status(error.message==='AUTH'?'Sign in again to sync':'Offline or unable to save · retry','error');this.cache();}
    finally{this.saving=false;if(this.dirty&&!this.pending&&navigator.onLine&&this.revision>0&&JSON.stringify(this.state)!==sent)this.schedule();}
  }
  async refresh(){
    if(!this.ready||this.saving||this.pending||this.refreshing)return;
    if(this.dirty){await this.flush();return;}
    this.refreshing=true;
    try{
      const {r,payload}=await this.request();if(!r.ok)throw new Error('Load failed');
      if(payload.user.id!==this.user.id){location.reload();return;}
      // A user may have typed while the request was in flight.
      if(this.dirty){if(payload.revision!==this.revision){this.remote=payload;this.pending=true;this.showConflict();}return;}
      if(payload.revision!==this.revision){this.revision=payload.revision;this.state=payload.state?normalizeState(payload.state):clone(EMPTY);this.cache();this.apply(clone(this.state));}
      this.status('Saved to account','saved');
    }catch(error){if(!this.pending)this.status(error.message==='AUTH'?'Sign in again to sync':'Offline or unable to load · retry','error');}
    finally{this.refreshing=false;}
  }
  showConflict(){this.status('Choose a session to resume','conflict');this.conflict();}
  async resolve(prefer){
    if(!this.pending||!['local','remote'].includes(prefer))return;
    this.state=mergeProgress(this.state,this.remote.state||EMPTY,prefer==='local'?'left':'right');
    this.revision=this.remote.revision;this.pending=false;this.dirty=true;this.cache();this.apply(clone(this.state));await this.flush();
  }
  async import(value){
    if(!this.ready)throw new Error('Wait for your account to finish loading.');
    if(this.pending)throw new Error('Choose a session before importing.');
    const imported=normalizeState(value?.state||value);
    // A first visit creates a blank session automatically. Do not let that
    // placeholder displace an unfinished session imported from an old device.
    const s=this.state.session;
    const untouched=!(this.state.resetAt||0)&&Object.keys(this.state.stats).length===0&&(!s||(!s.draft&&!s.revealed&&Object.values(s.counts).every(n=>n===0)));
    this.state=mergeProgress(imported,this.state,untouched?'left':'right');this.dirty=true;this.cache();this.apply(clone(this.state));await this.flush();
    return !this.dirty;
  }
}
