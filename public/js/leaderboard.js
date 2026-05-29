// [ZypherMC] PvP leaderboard — bound to real Firebase /pvp/leaderboard structure.
// DB only exposes two ranked boards: `elo` and `kills`. Each is an array of
// { rank, player, tier, elo|kills }. We render exactly what exists, no fake data.
const LB_TABS = [
  {key:'elo',label:'Top ELO',metric:'elo',metricLabel:'ELO'},
  {key:'kills',label:'Top Kills',metric:'kills',metricLabel:'Kills'}
];
let LB_STATE = { tab:'elo', search:'', tier:'', page:1, perPage:25, data:[] };
// helper: current tab definition
const lbTab = () => LB_TABS.find(t=>t.key===LB_STATE.tab) || LB_TABS[0];
// helper: normalise DB tier strings ("SILVER") to display case ("Silver")
const tierCase = t => t ? t.charAt(0).toUpperCase()+t.slice(1).toLowerCase() : '—';

function renderTabs() {
  const el = document.getElementById('lb-tabs');
  el.innerHTML = LB_TABS.map(t=>`<button class="lb-tab ${t.key===LB_STATE.tab?'active':''}" data-key="${t.key}">${t.label}</button>`).join('');
  el.querySelectorAll('.lb-tab').forEach(b => b.onclick = () => { LB_STATE.tab = b.dataset.key; LB_STATE.page=1; loadLB(); });
}
function renderPodium(top3) {
  const m = lbTab().metric;
  const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd visually
  return order.map((p,i) => {
    if (!p) return `<div class="podium-item rank-${i===1?1:i===0?2:3}"><div class="empty">—</div></div>`;
    const rank = i===1?1:i===0?2:3;
    return `<div class="podium-item rank-${rank}">
      <div class="rank-num">#${rank}</div>
      <img src="${avatarUrl(p.player)}" alt=""/>
      <div class="player-name"><a href="/player.html?name=${encodeURIComponent(p.player)}">${p.player||'—'}</a></div>
      <div class="elo">${fmtNum(p[m])}</div>
      <span class="tier-badge">${tierCase(p.tier)}</span>
    </div>`;
  }).join('');
}
function renderTable(rows) {
  const t = lbTab();
  if (!rows.length) return '<div class="empty">No data yet</div>';
  return `<table><thead><tr><th>#</th><th>Player</th><th>${t.metricLabel}</th><th>Tier</th></tr></thead>
  <tbody>${rows.map((p,i)=>`<tr class="slide-in-left" style="animation-delay:${i*0.02}s">
    <td><strong>${p.rank ?? (i+1+(LB_STATE.page-1)*LB_STATE.perPage)}</strong></td>
    <td><img class="avatar" src="${avatarUrl(p.player)}" alt=""/><a href="/player.html?name=${encodeURIComponent(p.player)}">${p.player||'—'}</a></td>
    <td><strong>${fmtNum(p[t.metric])}</strong></td>
    <td><span class="tier-badge">${tierCase(p.tier)}</span></td>
  </tr>`).join('')}</tbody></table>`;
}
async function loadLB() {
  document.getElementById('lb-podium').innerHTML = `<div class="skeleton" style="height:240px"></div><div class="skeleton" style="height:280px"></div><div class="skeleton" style="height:200px"></div>`;
  document.getElementById('lb-table').innerHTML = skeleton(8);
  renderTabs();
  const raw = await db('/pvp/leaderboard/'+LB_STATE.tab);
  let arr = Array.isArray(raw) ? raw.filter(Boolean) : objToArr(raw);
  // sort by the active metric descending so ranks always read top-down
  const m = lbTab().metric;
  arr.sort((a,b)=>(b[m]||0)-(a[m]||0));
  // filters
  if (LB_STATE.search) arr = arr.filter(p => (p.player||'').toLowerCase().includes(LB_STATE.search.toLowerCase()));
  if (LB_STATE.tier) arr = arr.filter(p => tierCase(p.tier) === LB_STATE.tier);
  LB_STATE.data = arr;
  document.getElementById('lb-podium').innerHTML = renderPodium(arr.slice(0,3));
  const start = (LB_STATE.page-1)*LB_STATE.perPage;
  document.getElementById('lb-table').innerHTML = renderTable(arr.slice(start, start+LB_STATE.perPage));
  // pagination
  const pages = Math.max(1, Math.ceil(arr.length/LB_STATE.perPage));
  document.getElementById('lb-pagination').innerHTML = Array.from({length:Math.min(pages,10)}).map((_,i)=>`<button class="${i+1===LB_STATE.page?'active':''}" data-p="${i+1}">${i+1}</button>`).join('');
  document.querySelectorAll('#lb-pagination button').forEach(b=>b.onclick=()=>{ LB_STATE.page=+b.dataset.p; loadLB(); });
}
function initLeaderboard() {
  document.getElementById('lb-search').addEventListener('input', e => { LB_STATE.search = e.target.value; LB_STATE.page=1; loadLB(); });
  document.getElementById('lb-tier').addEventListener('change', e => { LB_STATE.tier = e.target.value; LB_STATE.page=1; loadLB(); });
  loadLB();
  setInterval(loadLB, 60000);
}
