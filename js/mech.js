// Décor du thème « Machine antique » : engrenages et câbles (simples dessins génériques, aucun emblème officiel)
const gear=(n,R,r,hole,fill)=>{let p='';for(let i=0;i<n;i++){const a=i*2*Math.PI/n,w=Math.PI/n*.5;const pts=[[R,a-w],[R,a+w*.6],[r,a+w],[r,a+2*w]].map(([q,t])=>[(Math.cos(t)*q).toFixed(1),(Math.sin(t)*q).toFixed(1)]);p+=(i?'L':'M')+pts.map(x=>x.join(' ')).join('L')}
return `<path d="${p}Z M${hole} 0A${hole} ${hole} 0 1 0 ${-hole} 0A${hole} ${hole} 0 1 0 ${hole} 0Z" fill="${fill}" fill-rule="evenodd" stroke="#0a0705" stroke-width="3"/>`};
const g=(w,css,n,R,r,h,fill,cls)=>`<svg width="${w}" height="${w}" viewBox="${-R-6} ${-R-6} ${2*R+12} ${2*R+12}" style="${css}"><g class="gear ${cls}">${gear(n,R,r,h,fill)}<circle r="${h*.55}" fill="none" stroke="#0a0705" stroke-width="3"/></g></svg>`;
const DECO=
 g(520,'left:-170px;bottom:-190px;opacity:.55',16,240,200,70,'#5a3a1e','')+
 g(300,'left:230px;bottom:-120px;opacity:.5',12,140,115,40,'#3d4a46','r')+
 g(420,'right:-150px;bottom:-110px;opacity:.5',14,200,168,55,'#4a3a22','r')+
 `<svg width="100%" height="260" style="left:0;top:50px;opacity:.9" viewBox="0 0 1200 260" preserveAspectRatio="none">
   <path d="M1010 0 C1010 90 1090 80 1090 170 S1040 230 1030 260" stroke="#050403" stroke-width="12" fill="none"/>
   <path d="M1010 0 C1010 90 1090 80 1090 170 S1040 230 1030 260" stroke="#6f4a2a" stroke-width="7" fill="none" stroke-dasharray="14 3"/>
   <path d="M1060 0 C1060 60 1140 60 1130 140 S1170 200 1160 260" stroke="#050403" stroke-width="10" fill="none"/>
   <path d="M1060 0 C1060 60 1140 60 1130 140 S1170 200 1160 260" stroke="#3b6b61" stroke-width="5" fill="none"/>
 </svg>`;

function syncDeco() {
  const on = document.documentElement.dataset.theme === 'mech';
  let d = document.getElementById('mech-deco');
  if (on && !d) { d = document.createElement('div'); d.id = 'mech-deco'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = DECO; document.body.prepend(d); }
  else if (!on && d) d.remove();
}
if (typeof document !== 'undefined') {
  new MutationObserver(syncDeco).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (document.body) syncDeco(); else document.addEventListener('DOMContentLoaded', syncDeco);
}
