const screens = [...document.querySelectorAll('.screen')];
const progress = document.querySelector('#progress');
const assets = window.GIFT_ASSETS;
const blobUrls = new Map();
let giftPassword = '';

function decode64(value) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
}
async function decryptAsset(name) {
  if (blobUrls.has(name)) return blobUrls.get(name);
  const meta = assets[name];
  if (!meta) throw new Error('Missing protected asset');
  const response = await fetch(meta.file);
  if (!response.ok) throw new Error('Could not load the encrypted gift media');
  const bytes = await response.arrayBuffer();
  const key = await deriveKey(giftPassword,decode64(meta.salt));
  const clear = await crypto.subtle.decrypt({name:'AES-GCM',iv:decode64(meta.iv),tagLength:128},key,bytes);
  const mime = name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
  const url = URL.createObjectURL(new Blob([clear],{type:mime}));
  blobUrls.set(name,url);
  return url;
}
async function decryptCheck(password) {
  const meta = assets.__check;
  const response = await fetch(meta.file);
  const key = await deriveKey(password,decode64(meta.salt));
  const clear = await crypto.subtle.decrypt({name:'AES-GCM',iv:decode64(meta.iv),tagLength:128},key,await response.arrayBuffer());
  return new TextDecoder().decode(clear) === 'Soukaina birthday gift unlocked';
}
async function revealMedia(root=document) {
  const targets = [...root.querySelectorAll('[data-encrypted]')];
  for (const target of targets) {
    if (target.dataset.ready) continue;
    const name = target.dataset.encrypted;
    try {
      const url = await decryptAsset(name);
      if (target.tagName === 'IMG') { target.src = url; target.hidden = false; }
      else if (target.tagName === 'SOURCE') { target.src = url; target.closest('video').load(); }
      target.dataset.ready = 'true';
    } catch (error) {
      const placeholder = target.closest('figure, .final-photo')?.querySelector('.video-placeholder,.photo-placeholder');
      if (placeholder) placeholder.querySelector('small').textContent = 'This memory could not be opened. Refresh and try again.';
    }
  }
}

function show(id) {
  for (const screen of screens) {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle('is-active', active);
    if (screen.id === 'final') screen.classList.toggle('is-celebrating', active);
  }
  const labels = {opening:'',story:'01 · CYPRUS',memories:'02 · OUR LITTLE THINGS',final:'03 · HAPPY BIRTHDAY'};
  progress.textContent = labels[id];
  if (id === 'story') revealMedia(document.querySelector('#gallery-stage').children[galleryIndex]);
  if (id === 'memories') revealMedia(document.querySelector('#memories'));
  if (id === 'final') revealMedia(document.querySelector('#final'));
  window.scrollTo({top:0,behavior:'smooth'});
}
function openGift() {
  document.querySelector('#open-gift').classList.add('opened');
  window.setTimeout(() => show('story'),420);
}
document.querySelector('#unlock-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const button=event.currentTarget.querySelector('button');
  const error=document.querySelector('#unlock-error');
  button.disabled=true; button.textContent='Opening your gift…'; error.hidden=true;
  const attempt=document.querySelector('#gift-password').value;
  try {
    if (await decryptCheck(attempt)) {
      giftPassword=attempt;
      document.querySelector('#gift').hidden=false;
      document.querySelector('#lock-screen').hidden=true;
      show('opening');
    } else { error.hidden=false; }
  } catch { error.hidden=false; }
  button.disabled=false; button.textContent='Open my gift ♡';
});
document.querySelector('#open-gift').addEventListener('click',openGift);
document.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.next)));
document.querySelector('#back-to-album').addEventListener('click',()=>show('story'));
document.querySelector('#back-to-memories').addEventListener('click',()=>show('memories'));
document.querySelector('#night-toggle').addEventListener('click',event=>{
  const button=event.currentTarget,note=document.querySelector('#night-note');
  const opening=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(opening)); note.hidden=!opening;
  button.querySelector('.tap-prompt').textContent=opening?'MEMORY REVEALED ♡':'TAP TO REVEAL ↓';
});
document.querySelector('#replay').addEventListener('click',()=>{
  document.querySelector('#open-gift').classList.remove('opened');
  document.querySelector('#night-note').hidden=true;
  document.querySelector('#night-toggle').setAttribute('aria-expanded','false');
  document.querySelector('#night-toggle .tap-prompt').textContent='TAP TO REVEAL ↓';
  show('opening');
});

const galleryFiles=Array.from({length:19},(_,i)=>`cyprus-clip-${String(i+1).padStart(2,'0')}.mp4`);
const galleryStage=document.querySelector('#gallery-stage');
galleryStage.innerHTML=galleryFiles.map((file,i)=>`<figure class="gallery-slide gallery-video${i===18?' landscape':''}"${i===0?'':' hidden'}><video controls playsinline preload="none" aria-label="Play Cyprus video ${i+1}"><source data-encrypted="${file}" type="video/mp4"></video><div class="video-placeholder"><span>▶</span><b>Cyprus memory ${String(i+1).padStart(2,'0')}</b><small>your private memory</small></div><figcaption>memory ${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('');
const gallerySlides=[...galleryStage.querySelectorAll('.gallery-slide')];
let galleryIndex=0;
function showGallerySlide(index){
  gallerySlides[galleryIndex].querySelector('video')?.pause();
  galleryIndex=(index+gallerySlides.length)%gallerySlides.length;
  gallerySlides.forEach((slide,i)=>{slide.hidden=i!==galleryIndex;slide.setAttribute('aria-hidden',String(i!==galleryIndex));});
  document.querySelector('#gallery-count').textContent=`${galleryIndex+1} / ${gallerySlides.length}`;
  if(!document.querySelector('#lock-screen').hidden) return;
  revealMedia(gallerySlides[galleryIndex]);
}
document.querySelector('#gallery-prev').addEventListener('click',()=>showGallerySlide(galleryIndex-1));
document.querySelector('#gallery-next').addEventListener('click',()=>showGallerySlide(galleryIndex+1));
galleryStage.querySelectorAll('.gallery-video video').forEach(video=>video.addEventListener('loadedmetadata',()=>video.closest('.gallery-video').classList.add('has-video'),{once:true}));
document.querySelectorAll('.snapshot-video video').forEach(video=>video.addEventListener('loadedmetadata',()=>video.closest('.snapshot-video').classList.add('has-video'),{once:true}));
