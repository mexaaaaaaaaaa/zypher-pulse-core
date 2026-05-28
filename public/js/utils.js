// [ZypherMC] Shared utilities
const fmtNum = n => n==null ? '—' : new Intl.NumberFormat().format(Math.round(n));
const fmtDuration = s => { if(!s) return '—'; const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=Math.floor(s%60); return h?`${h}h ${m}m`:m?`${m}m ${x}s`:`${x}s`; };
const fmtTimeAgo = ts => { if(!ts) return 'never'; const d=Date.now()-ts; if(d<60000) return Math.floor(d/1000)+'s ago'; if(d<3600000) return Math.floor(d/60000)+'m ago'; if(d<86400000) return Math.floor(d/3600000)+'h ago'; return Math.floor(d/86400000)+'d ago'; };
const fmtPercent = n => n==null ? '—' : (Math.round(n*10)/10)+'%';
const avatarUrl = name => name ? `https://mc-heads.net/avatar/${encodeURIComponent(name)}/64` : '';
const headUrl = name => name ? `https://mc-heads.net/head/${encodeURIComponent(name)}/128` : '';
const tierFromElo = elo => { elo=elo||0; if(elo>=1900) return {name:'Legend',color:'rainbow'}; if(elo>=1700) return {name:'Master',color:'#9b35e8'}; if(elo>=1500) return {name:'Diamond',color:'#00d4ff'}; if(elo>=1300) return {name:'Gold',color:'#ffd700'}; if(elo>=1100) return {name:'Silver',color:'#c0c0c0'}; return {name:'Bronze',color:'#cd7f32'}; };
const tierBadge = elo => { const t=tierFromElo(elo); const style=t.color==='rainbow'?'background:linear-gradient(90deg,#ff0080,#9b35e8,#00d4ff,#00ff88,#ffd700,#ff0080);background-size:300% 100%;animation:rainbow 3s linear infinite;color:#000;':`background:${t.color}22;color:${t.color};border:1px solid ${t.color}66`; return `<span class="tier-badge" style="${style}">${t.name}</span>`; };
const qs = k => new URLSearchParams(location.search).get(k);
const skeleton = (n=3) => Array.from({length:n}).map(()=>`<div class="skeleton-row"></div>`).join('');
const copyIP = () => { navigator.clipboard.writeText('play.zypermc.fun').then(()=>showToast('IP copied! play.zypermc.fun','success')); };
const objToArr = obj => obj ? Object.entries(obj).map(([k,v])=>({_key:k,...v})) : [];
