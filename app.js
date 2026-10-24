const TRIP_START = new Date('2026-11-05T13:55:00-05:00');
const WEDDING = new Date('2026-11-07T16:00:00-05:00');
function countdownText(target,doneText){
  const now=new Date(),diff=target-now;
  if(diff<=0) return doneText;
  const days=Math.floor(diff/86400000);
  const hours=Math.floor((diff%86400000)/3600000);
  const mins=Math.floor((diff%3600000)/60000);
  return days>0 ? days+'d '+hours+'h '+mins+'m' : hours+'h '+mins+'m';
}
function updateCountdowns(){
  const trip=document.getElementById('tripCountdown');
  const wedding=document.getElementById('weddingCountdown');
  if(trip) trip.textContent=countdownText(TRIP_START,'Trip underway');
  if(wedding) wedding.textContent=countdownText(WEDDING,'Wedding day');
}
updateCountdowns(); setInterval(updateCountdowns,60000);

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
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=1.7.0',{updateViaCache:'none'});
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


// Manassas trip weather (Open-Meteo, no API key). Cached locally for offline viewing.
const weatherCacheKey='weddingManassasWeatherV1';
const weatherUrl='https://api.open-meteo.com/v1/forecast?latitude=38.75095&longitude=-77.47527&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=16';
function weatherIcon(code){if(code===0)return '☀️';if([1,2].includes(code))return '🌤️';if(code===3)return '☁️';if([45,48].includes(code))return '🌫️';if([51,53,55,56,57].includes(code))return '🌦️';if([61,63,65,66,67,80,81,82].includes(code))return '🌧️';if([71,73,75,77,85,86].includes(code))return '🌨️';if([95,96,99].includes(code))return '⛈️';return '🌡️';}
function dressGuidance(days){if(!days.length)return 'Trip forecast will appear when Nov 5–8 enters the forecast window.';const minLow=Math.min(...days.map(x=>x.low)),maxHigh=Math.max(...days.map(x=>x.high)),maxRain=Math.max(...days.map(x=>x.rain));const tips=[];if(minLow<=40)tips.push('pack a warm coat and layers');else if(minLow<=50)tips.push('bring a jacket and layers for mornings/evenings');else if(maxHigh<=65)tips.push('a light jacket should be useful');else tips.push('light layers should cover most daytime conditions');if(maxRain>=40)tips.push('include a compact umbrella or rain shell');return 'Dress cue: '+tips.join('; ')+'.';}
function renderWeather(data,isCached=false){const nowEl=document.getElementById('weatherNow'),daysEl=document.getElementById('weatherDays'),dressEl=document.getElementById('weatherDress'),updatedEl=document.getElementById('weatherUpdated');if(!nowEl||!daysEl||!dressEl||!updatedEl)return;if(data.current){nowEl.innerHTML=weatherIcon(data.current.weather_code)+' <b>'+Math.round(data.current.temperature_2m)+'°</b><small>Feels '+Math.round(data.current.apparent_temperature)+'°</small>';}const tripDates=['2026-11-05','2026-11-06','2026-11-07','2026-11-08'];const rows=[];for(const date of tripDates){const i=data.daily&&data.daily.time?data.daily.time.indexOf(date):-1;if(i<0)continue;rows.push({date:date,code:data.daily.weather_code[i],high:Math.round(data.daily.temperature_2m_max[i]),low:Math.round(data.daily.temperature_2m_min[i]),rain:Math.round(data.daily.precipitation_probability_max[i]||0),wind:Math.round(data.daily.wind_speed_10m_max[i]||0)});}const names={'2026-11-05':'Thu 5','2026-11-06':'Fri 6','2026-11-07':'Sat 7','2026-11-08':'Sun 8'};if(rows.length){daysEl.innerHTML=rows.map(x=>'<div class="weather-day"><span>'+names[x.date]+'</span><b>'+weatherIcon(x.code)+' '+x.high+'°</b><small>'+x.low+'° low</small><small>'+x.rain+'% rain</small></div>').join('');}else{daysEl.innerHTML='<div class="weather-pending">The Nov 5–8 forecast is not available yet. This panel will fill in automatically as the trip gets closer.</div>';}dressEl.textContent=dressGuidance(rows);const stamp=data._savedAt?new Date(data._savedAt):new Date();updatedEl.textContent=(isCached?'Offline cached forecast':'Updated')+' • '+stamp.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}
async function loadManassasWeather(){try{const res=await fetch(weatherUrl,{cache:'no-store'});if(!res.ok)throw new Error('Weather request failed');const data=await res.json();data._savedAt=Date.now();localStorage.setItem(weatherCacheKey,JSON.stringify(data));renderWeather(data,false);}catch{try{const cached=JSON.parse(localStorage.getItem(weatherCacheKey)||'null');if(cached)renderWeather(cached,true);else{const el=document.getElementById('weatherDress');if(el)el.textContent='Weather unavailable right now. Reopen the app with internet to refresh.';}}catch{}}}
loadManassasWeather();
