const WEDDING = new Date('2026-11-07T16:00:00-05:00');
const countdown = document.getElementById('countdown');
function updateCountdown(){
  const now = new Date(), diff = WEDDING - now;
  if(diff <= 0 && now < new Date('2026-11-08T00:00:00-05:00')){countdown.textContent='Wedding day is here';return;}
  if(diff <= 0){countdown.textContent='Laura & Alex • November 7, 2026';return;}
  const days=Math.floor(diff/86400000), hours=Math.floor((diff%86400000)/3600000);
  countdown.textContent=`${days} days • ${hours} hours to the ceremony`;
}
updateCountdown(); setInterval(updateCountdown,60000);

function openTab(id){
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id===id));
  localStorage.setItem('weddingLastTab',id);
  window.scrollTo({top:175,behavior:'smooth'});
}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.tab)));
document.querySelectorAll('[data-open-tab]').forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.openTab)));
const savedTab=localStorage.getItem('weddingLastTab'); if(savedTab && document.getElementById(savedTab)) openTab(savedTab);

const checklistData=[
 ['Travel','United check-in completed for both travelers'],['Travel','IDs / wallets / phones packed'],['Travel','Phone chargers & power bank'],['Travel','Boarding passes available offline or screenshotted'],['Travel','Hotel confirmations available offline or screenshotted'],['Travel','TPA Economy Parking location saved'],['Travel','Uber app ready for IAD rides'],
 ['Wedding','Welcome Party details saved for Friday at 5:00 PM'],['Wedding','Wedding attire / formal wear'],['Wedding','Wedding shoes'],['Wedding','Gift / card if bringing one'],['Wedding','Wedding clothes and shoes ready Friday night'],['Wedding','At hotel lobby before the 3:15 PM shuttle window'],['Wedding','Phones charged before leaving for Sweeney Barn'],
 ['Clothing','Underwear & clean socks for 4 days'],['Clothing','Casual clothes for Friday / Sunday'],['Clothing','Light jacket for November evenings'],
 ['Personal','Toiletries & medications'],['Personal','Toothbrush & toothpaste'],['Personal','Deodorant / cologne / perfume'],['Personal','Cash / cards for tips & incidentals'],['Personal','Headphones / earplugs'],
 ['Return','Return-flight check-in completed Saturday'],['Return','Sunday airport ride/departure time decided before checkout']
];
const checklistEl=document.getElementById('checklistItems');
function renderChecklist(){
 const saved=JSON.parse(localStorage.getItem('weddingChecklist')||'{}'); checklistEl.innerHTML=''; let last='';
 checklistData.forEach(([cat,text],i)=>{if(cat!==last){const h=document.createElement('div');h.className='check-category';h.textContent=cat;checklistEl.append(h);last=cat;}
 const row=document.createElement('div');row.className='check-item';const input=document.createElement('input');input.type='checkbox';input.id=`c${i}`;input.checked=!!saved[i];input.addEventListener('change',()=>{saved[i]=input.checked;localStorage.setItem('weddingChecklist',JSON.stringify(saved));});const label=document.createElement('label');label.htmlFor=input.id;label.textContent=text;row.append(input,label);checklistEl.append(row);});
}
renderChecklist(); document.getElementById('resetChecklist').addEventListener('click',()=>{localStorage.removeItem('weddingChecklist');renderChecklist();});

function updateToday(){
 const now=new Date(), title=document.getElementById('todayTitle'), text=document.getElementById('todayText'), action=document.getElementById('todayAction');
 const ymd=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 if(ymd==='2026-11-05'){title.textContent='Today • Travel to Manassas';text.textContent='UA1576 departs TPA at 1:55 PM • arrives IAD 4:11 PM • Tempo check-in after 4:00 PM';action.textContent='Open travel day';action.onclick=()=>openTab('trip');}
 else if(ymd==='2026-11-06'){title.textContent='Today • Welcome Party';text.textContent='5:00 PM • Laconiko • 11301 Braden Dr • dinner & drinks served';action.textContent='Open Friday details';action.onclick=()=>openTab('trip');}
 else if(ymd==='2026-11-07'){title.textContent='Today • Wedding day';text.textContent='First shuttle 3:15 PM • arrive by 3:45 PM • ceremony 4:00 PM at Sweeney Barn';action.textContent='Open wedding schedule';action.onclick=()=>openTab('wedding');}
 else if(ymd==='2026-11-08'){title.textContent='Today • Fly home';text.textContent='UA2277 departs IAD at 1:05 PM • hotel checkout is 11:00 AM';action.textContent='Open return flight';action.onclick=()=>openTab('trip');}
 else {title.textContent='Your wedding trip';text.textContent='November 5–8, 2026 • Manassas, Virginia';action.textContent='Open itinerary';action.onclick=()=>openTab('trip');}
}
updateToday();

let deferredPrompt; const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true;});
window.addEventListener('appinstalled',()=>installBtn.hidden=true);
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=1.6.3',{updateViaCache:'none'});
      await reg.update();
    }catch(err){console.error(err);}
  });
}


// Italy-style confirmation wallet copy controls
document.querySelectorAll('.copy-btn').forEach(btn=>btn.addEventListener('click',async()=>{
  const value=btn.dataset.copy;
  try{
    await navigator.clipboard.writeText(value);
    const toast=document.getElementById('copyToast');
    if(toast){toast.textContent=`Copied ${value}`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}
    const old=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=old,1400);
  }catch{
    const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
    const old=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=old,1400);
  }
}));


// Local-only TSA PreCheck / Known Traveler Number wallet.
const ktnStorageKey='weddingTravelerKtns';
const davidKtn=document.getElementById('davidKtn');
const melodyKtn=document.getElementById('melodyKtn');

function loadKtns(){
  try{
    const saved=JSON.parse(localStorage.getItem(ktnStorageKey)||'{}');
    if(davidKtn) davidKtn.value=saved.david||'';
    if(melodyKtn) melodyKtn.value=saved.melody||'';
  }catch{}
}
loadKtns();

document.getElementById('saveKtns')?.addEventListener('click',()=>{
  localStorage.setItem(ktnStorageKey,JSON.stringify({
    david:davidKtn?.value.trim()||'',
    melody:melodyKtn?.value.trim()||''
  }));
  const toast=document.getElementById('copyToast');
  if(toast){toast.textContent='TSA numbers saved on this phone';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}
});

document.getElementById('clearKtns')?.addEventListener('click',()=>{
  localStorage.removeItem(ktnStorageKey);
  if(davidKtn) davidKtn.value='';
  if(melodyKtn) melodyKtn.value='';
});

document.querySelectorAll('.reveal-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const input=document.getElementById(btn.dataset.target);
  if(!input)return;
  const visible=input.type==='text';
  input.type=visible?'password':'text';
  btn.textContent=visible?'Show':'Hide';
}));


// Unified Trip cards with persistent completion state.
const tripCompletionKey='weddingTripCompleted';

function tripItemType(article){
  const text=article.textContent.toLowerCase();
  if(text.includes('united') || text.includes('ua1576') || text.includes('ua2277')) return ['flight','FLIGHT','✈️'];
  if(text.includes('tempo by hilton') || text.includes('reservation')) return ['hotel','HOTEL','🏨'];
  if(text.includes('uber') || text.includes('parking') || text.includes('skyconnect')) return ['transport','TRANSPORT','🚗'];
  if(text.includes('welcome party') || text.includes('laconiko')) return ['event','EVENT','🥂'];
  if(text.includes('wedding-day') || text.includes('wedding day')) return ['wedding','WEDDING','💍'];
  return ['other','TRIP ITEM','•'];
}

function normalizeTripCards(){
  const trip=document.getElementById('trip');
  if(!trip) return;
  let saved={};
  try{ saved=JSON.parse(localStorage.getItem(tripCompletionKey)||'{}'); }catch{}
  const cards=[...trip.querySelectorAll('article.card, article.detail-card')];

  cards.forEach((article,index)=>{
    const [type,label,icon]=tripItemType(article);
    article.classList.add('trip-item',`trip-type-${type}`);
    article.dataset.tripKey=article.dataset.tripKey || `trip-${index}`;

    if(!article.querySelector(':scope > .trip-card-head')){
      const head=document.createElement('div');
      head.className='trip-card-head';

      const meta=document.createElement('div');
      meta.className='trip-card-meta';
      meta.innerHTML=`<span class="trip-type-icon">${icon}</span><span>${label}</span>`;

      const done=document.createElement('button');
      done.type='button';
      done.className='trip-done';
      done.setAttribute('aria-label','Mark trip item complete');
      done.innerHTML='✓';

      head.append(meta,done);
      article.prepend(head);
    }

    const button=article.querySelector(':scope > .trip-card-head .trip-done');
    const key=article.dataset.tripKey;
    const apply=()=>{
      const complete=!!saved[key];
      article.classList.toggle('trip-complete',complete);
      button.classList.toggle('checked',complete);
      button.setAttribute('aria-pressed',String(complete));
      button.setAttribute('aria-label',complete?'Mark trip item incomplete':'Mark trip item complete');
    };
    apply();

    button.addEventListener('click',()=>{
      saved[key]=!saved[key];
      localStorage.setItem(tripCompletionKey,JSON.stringify(saved));
      apply();
    });
  });
}

normalizeTripCards();


// Prefer Lyft app; fall back to Lyft's mobile ride page if the app is unavailable.
document.querySelectorAll('.lyft-app-link').forEach(link=>link.addEventListener('click',e=>{
  e.preventDefault();
  let appOpened=false;
  const onVisibility=()=>{ if(document.hidden) appOpened=true; };
  document.addEventListener('visibilitychange',onVisibility,{once:true});
  window.location.href='lyft://ridetype?id=lyft';
  setTimeout(()=>{
    if(!appOpened && !document.hidden) window.location.href='https://ride.lyft.com/u';
  },1200);
}));
