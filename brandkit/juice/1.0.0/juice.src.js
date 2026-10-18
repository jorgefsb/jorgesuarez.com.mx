(function(w,d){'use strict';
var H=d.documentElement,SK='gamedev_sfx',LK='jz-level',C=['#FF6B35','#FFA500','#F4E8D5'];
var NEED={press:1,flash:1,ripple:1,shake:1,burst:1,impact:1,check:1,stamp:1,'moki-hop':1,'moki-look':1,party:1,anticipation:1,stagger:1,around:2,foreshadow:2,tilt:2,haptics:2};
var I={es:['Silenciar','Activar sonido','Sonido: sí','Sonido: no','Apagado','Discreto','Completo','Juice','Listo','Algo salió mal.'],en:['Mute sound','Turn sound on','Sound: on','Sound: off','Off','Subtle','Full','Juice','Done','Something went wrong.']};
var mq=matchMedia('(prefers-reduced-motion: reduce)'),red=mq.matches,HOLD=150;
var sS,sL;try{sS=localStorage.getItem(SK);sL=localStorage.getItem(LK)}catch(e){}
var sndOn=sS==='on',level=red?'off':(sL==='off'||sL==='full'?sL:'subtle');
var ac,mas,paid=0,seen={},nP=0,fns={},fbs={},timers=[],gest=0;
function $(s,r){return(r||d).querySelector(s)}
function $$(s,r){return[].slice.call((r||d).querySelectorAll(s))}
function T(){return I[H.lang==='en'?'en':'es']}
function pullOff(){var c=w.JZ_CONFIG||{},a=(H.getAttribute('data-jz-off')||'').split(/\s+/),k;for(k in c)if(c[k]===false&&a.indexOf(k)<0)a.push(k);a=a.filter(Boolean);if(a.length)H.setAttribute('data-jz-off',a.join(' '))}
function siteOff(n){return(w.JZ_CONFIG||{})[n]===false||(' '+(H.getAttribute('data-jz-off')||'')+' ').indexOf(' '+n+' ')>=0}
function ok(n){return!siteOff(n)&&!red&&level!=='off'&&(level==='full'?2:1)>=(NEED[n]||0)}
function later(fn,ms){if(!ms){fn();return}var id=setTimeout(fn,ms);timers.push(id)}
function kill(){timers.forEach(clearTimeout);timers=[];nP=0;$$('.jz-dot,.jz-ripple').forEach(function(el){el.remove()});$$('.juice-press,.juice-shake,.jz-hop,.jz-pop,.jz-held,.jz-glow.is-on').forEach(function(el){el.classList.remove('juice-press','juice-shake','jz-hop','jz-pop','jz-held','is-on')});$$('[data-jz-moki],.ia-moki-live,.jz-moki').forEach(function(m){m.style.transform=''})}
var paintMenu=function(){};
function setLv(v,save){if(red)v='off';if(v!=='off'&&v!=='subtle'&&v!=='full')v='subtle';var prev=level;level=v;H.setAttribute('data-jz-level',v);if(save&&!red)try{localStorage.setItem(LK,v)}catch(e){}if(v==='off'&&prev!=='off')kill();paintMenu()}
function audio(){if(!sndOn)return;var AC=w.AudioContext||w.webkitAudioContext;if(!AC)return;if(!ac){ac=new AC();mas=ac.createGain();mas.gain.value=.125;mas.connect(ac.destination)}if(ac.state==='suspended')ac.resume();return ac}
function tone(f,du,ty,sl){var c=audio();if(!c)return;du=Math.min(du,.15);var t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(sl,1),t+du);g.gain.setValueAtTime(1,t);g.gain.exponentialRampToValueAtTime(.001,t+du);o.connect(g);g.connect(mas);o.start(t);o.stop(t+du+.01)}
function snd(n){if(!sndOn)return;var j=.95+Math.random()*.1;if(n==='tap')tone(880*j,.07);else if(n==='success'){tone(523*j,.06);setTimeout(function(){tone(784*j,.08)},55)}else if(n==='error')tone(220*j,.14,'square',110*j)}
function hap(k){if(!gest||!ok('haptics')||!navigator.vibrate)return;try{navigator.vibrate(k==='success'?[15,40,15]:k==='error'?[30,40,30]:[10])}catch(e){}}
function paintSfx(b){if(!b)return;var t=T();b.innerHTML=(sndOn?'🔊':'🔇')+'<span class="juice-sfx__label">'+t[sndOn?2:3]+'</span>';b.setAttribute('aria-pressed',String(sndOn));b.setAttribute('aria-label',t[sndOn?0:1])}
function setSfx(v){sndOn=!!v;try{localStorage.setItem(SK,sndOn?'on':'off')}catch(e){}$$('.juice-sfx').forEach(paintSfx);if(sndOn)audio();else if(ac&&ac.state==='running')ac.suspend()}
function hostOf(el){return el&&el.closest&&el.closest('.jz-host,[class*=-card],.ia-sponsor__form')||d.body}
function box(el,host){var r=el.getBoundingClientRect(),h=host===d.body?{left:0,top:0}:host.getBoundingClientRect();return{r:r,x:r.left-h.left,y:r.top-h.top}}
function dot(host,x,y,c,dx,dy,du){if(nP>=(du>500?40:24))return;var p=d.createElement('span');p.className='jz-dot'+(du?' jz-g':'');p.style.cssText='left:'+x+'px;top:'+y+'px;background:'+c+';--dx:'+dx+'px;--dy:'+dy+'px'+(du?';animation-duration:'+du+'ms':'');host.appendChild(p);nP++;p.addEventListener('animationend',function(){nP--;this.remove()})}
function spray(el,k){if(!el||!ok(k))return;var host=hostOf(el),b=box(el,host),r=b.r,cx=b.x+r.width/2,cy=b.y+r.height/2,n=k==='around'?4+(Math.random()*3|0):12,i;for(i=0;i<n;i++){var a=Math.PI*2*i/n,c=Math.cos(a),s=Math.sin(a),di=k==='around'?16:12+(i%3)*6;dot(host,cx+c*(r.width/2+6),cy+s*(r.height/2+6),C[i%3],c*di,s*di,k==='around'?300:0)}}
function party(el){if(!ok('party')||!el||paid)return;paid=1;var host=hostOf(el),b=box(el,host),r=b.r,n=30+(Math.random()*11|0),i;for(i=0;i<n;i++){var x0=b.x+8+(r.width-16)*((i+.5)/n),vx=(Math.random()*2-1)*48;dot(host,x0,b.y+4,C[i%3],vx,64+Math.random()*(r.height||80),800+(Math.random()*400|0))}}
function replay(el,c){if(!el)return;el.classList.remove(c);void el.offsetWidth;el.classList.add(c)}
function press(el){ok('press')&&replay(el,'juice-press')}
function shake(el){ok('shake')&&replay(el,'juice-shake')}
function hold(el){if(el){el.classList.remove('juice-press');if(!red&&ok('impact'))el.classList.add('jz-held')}}
function rel(el){el&&el.classList.remove('jz-held')}
function layer(b,c){var l=b.querySelector(':scope>.'+c);if(!l){l=d.createElement('span');l.className=c;l.setAttribute('aria-hidden','true');b.appendChild(l)}return l}
function flash(b){if(!b||!ok('flash'))return;replay(layer(b,'jz-glow'),'is-on')}
function ripple(b,x,y){if(!ok('ripple')||!b)return;var r=b.getBoundingClientRect(),px=(x==null?r.left+r.width/2:x)-r.left,py=(y==null?r.top+r.height/2:y)-r.top,R=Math.max(Math.hypot(px,py),Math.hypot(r.width-px,py),Math.hypot(px,r.height-py),Math.hypot(r.width-px,r.height-py)),o=d.createElement('span');o.className='jz-ripple';o.style.cssText='left:'+(px-R)+'px;top:'+(py-R)+'px;width:'+2*R+'px;height:'+2*R+'px';layer(b,'jz-ripple-clip').appendChild(o);o.addEventListener('animationend',function(){this.remove()})}
function impact(el,cb){var ms=ok('impact')&&!red?HOLD:0;hold(el);later(function(){rel(el);cb&&cb()},ms)}
function check(el){var r=el&&(el.closest('.jz-host,li,form')||el),m=r&&$('.jz-check',r),li=m&&m.closest('li');if(!li)return;li.classList.add('is-done');if(ok('check')){li.style.setProperty('--jz-peak','1.2');replay(li,'jz-pop')}}
function stamp(form){if(!form||form.classList.contains('jz-locked'))return;form.classList.add('jz-locked');$$('input,textarea,select',form).forEach(function(f){if(!f.closest('.ia-hp')){f.readOnly=1;f.setAttribute('aria-readonly','true')}});var s=$('button[type=submit]',form);if(s){s.disabled=1;s.setAttribute('aria-disabled','true')}var host=form.closest('.ia-sponsor__form,.jz-host')||form;if($('.jz-stamp',host))return;var el=d.createElement('span');el.className='jz-stamp';el.innerHTML=T()[8]+'<span class="jz-stamp__ring" aria-hidden="true"></span>';host.appendChild(el);if(!ok('stamp')){el.style.cssText+='animation:none;transform:none;opacity:1';var rg=$('.jz-stamp__ring',el);if(rg)rg.style.animation='none'}}
function init(){$$('[data-jz*=success]').forEach(function(b){var h=b.closest('.jz-host,[class*=-card],.ia-sponsor__form');if(h)h.setAttribute('data-jz-stamp','')})}
function moki(){return $('[data-jz-moki],.ia-moki-live,.jz-moki')}
function hop(el){if(!ok('moki-hop'))return;var m=(el&&el.closest&&el.closest('[data-jz-moki],.ia-moki-live,.jz-moki'))||moki();m&&replay(m,'jz-hop')}
function look(field){$$('[data-jz-moki],.ia-moki-live,.jz-moki').forEach(function(m){if(!ok('moki-look')||!field){m.style.transform='';return}var fr=field.getBoundingClientRect(),mr=m.getBoundingClientRect();if(!mr.width||mr.bottom<0||mr.top>innerHeight){m.style.transform='';return}var vx=fr.left+fr.width/2-(mr.left+mr.width/2),vy=fr.top+fr.height/2-(mr.top+mr.height/2),len=Math.hypot(vx,vy);m.style.transform=len<1?'':'translate('+(5*vx/len).toFixed(2)+'px,'+(5*vy/len).toFixed(2)+'px)'})}
function peek(el,k){if(!ok('foreshadow')||!el||seen[k])return;seen[k]=1;var m=moki();if(!m)return;var er=el.getBoundingClientRect(),mr=m.getBoundingClientRect(),tx=er.left+er.width/2>mr.left+mr.width/2?10:-10;if(mr.right+tx>er.left-8&&mr.left+tx<er.right+8)tx=-tx;m.style.transform='translate('+tx+'px,-8px)';later(function(){m.style.transform=''},320)}
function err(el){var f=el&&el.closest&&el.closest('form'),s=(f&&$('[data-status],.ia-form__status,.jz-err',f))||$('.jz-err');if(s&&!s.textContent){s.textContent=T()[9];s.classList.add('is-error')}}
function stagger(list,kind){if(!ok('stagger')||!list||list.getAttribute('data-jz-did')==='1')return;if(level==='subtle'&&kind!=='menu')return;if(kind==='list')list.setAttribute('data-jz-did','1');var kids=$$(':scope>*',list),n=Math.min(kids.length,8),step=n>1?Math.min(30,300/Math.max(n-1,1)|0):0;kids.forEach(function(el,i){el.classList.remove('jz-in');el.classList.add('jz-pre');el.style.transitionDelay=(i<8?i:n-1)*step+'ms';requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('jz-in')})})})}
function play(name,el,o){o=o||{};var i=o.intensity==null?1:o.intensity,steps=fbs[name]||String(name).split('+').map(function(fx){return{fx:fx.trim()}}),hk=o.kind;steps.forEach(function(s){var fx=s.fx;if(fx==='haptics'){hk=hk||'tap';return}if(!hk&&(fx==='tap'||fx==='success'||fx==='error'))hk=fx;var run=function(){fns[fx]&&fns[fx](el,(s.intensity||1)*i,o)};var wait=s.delay&&ok('impact')?s.delay:0;wait?later(run,wait):run()});if(hk)hap(hk)}
fns.press=press;fns.flash=flash;fns.ripple=function(e,i,o){ripple(e,o.x,o.y)};fns.shake=shake;fns.burst=function(e){spray(e,'burst')};fns.around=function(e){spray(e,'around')};fns.impact=function(e,i,o){impact(e,o.after)};fns.check=check;fns.stamp=function(e){stamp(e&&e.closest&&e.closest('form')||e)};fns['moki-hop']=hop;fns['moki-look']=look;fns.party=party;fns.stagger=function(e){stagger(e,'list')};fns.foreshadow=function(e){peek(e,'play')};fns.tap=function(){snd('tap')};fns.success=function(){snd('success')};fns.error=function(e){snd('error');err(e)};
fbs['jz-tap']=[{fx:'press'},{fx:'flash'},{fx:'ripple'},{fx:'tap'}];
fbs['jz-success']=[{fx:'impact'},{fx:'check',delay:150},{fx:'burst',delay:150},{fx:'stamp',delay:150},{fx:'moki-hop',delay:150},{fx:'success',delay:150}];
fbs['jz-error']=[{fx:'shake'},{fx:'error'}];
fbs['jz-pay']=[{fx:'impact'},{fx:'party',delay:150},{fx:'moki-hop',delay:150},{fx:'success',delay:150}];
function prim(el){return el&&el.closest&&el.closest('.btn--primary:not([data-jz])')}
function drop(){setTimeout(function(){gest=0})}
function arm(e){e.isTrusted&&(gest=1,sndOn&&audio())}
d.addEventListener('pointerdown',function(e){arm(e);if(e.button)return;var b=prim(e.target);if(b&&!b.disabled){flash(b);ripple(b,e.clientX,e.clientY)}},true);
d.addEventListener('keydown',function(e){arm(e);if((e.key==='Enter'||e.key===' ')&&prim(e.target)){flash(e.target);ripple(e.target)}});
'pointerup pointercancel keyup'.split(' ').forEach(function(n){d.addEventListener(n,drop)});
d.addEventListener('click',function(e){if(!e.isTrusted)return;gest=1;var t=e.target,s=t.closest('.juice-sfx');if(s){press(s);setSfx(!sndOn);if(sndOn)snd('tap')}else{var n=t.closest('[data-jz]');if(n)play(n.getAttribute('data-jz'),n,{x:e.clientX,y:e.clientY})}drop()});
d.addEventListener('animationend',function(e){var n=e.animationName;if(n==='juice-press'||n==='juice-shake'||n==='jz-hop')e.target.classList.remove(n==='jz-hop'?'jz-hop':n);if(n==='jz-pop'&&e.target.closest('li'))e.target.closest('li').classList.remove('jz-pop');if(n==='jz-flash')e.target.classList.remove('is-on')});
mq.addEventListener('change',function(){red=mq.matches;setLv(red?'off':(sL==='off'||sL==='full'?sL:'subtle'),0)});
pullOff();setLv(level,0);$$('.juice-sfx').forEach(paintSfx);init();
w.JZ={register:function(n,fn){fns[n]=fn},feedback:function(n,s){fbs[n]=s},play:play,setLevel:function(v){setLv(v,1)},get level(){return level},allowed:ok,snd:snd,hap:hap,hold:hold,rel:rel,spray:spray,party:party,hop:hop,look:look,peek:peek,stagger:stagger,stamp:stamp,press:press,shake:shake,kill:kill,init:init,t:T,paint:function(){$$('.juice-sfx').forEach(paintSfx);paintMenu()},hook:function(fn){paintMenu=fn;fn()},HOLD:HOLD,red:function(){return red}};
})(window,document);
