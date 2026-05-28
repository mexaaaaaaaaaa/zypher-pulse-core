// [ZypherMC] PvP leaderboard
const LB_TABS = [
  {key:'overall',label:'Overall ELO'},
  {key:'classic_duels',label:'Classic'},
  {key:'skywars',label:'SkyWars'},
  {key:'bridge',label:'Bridge'},
  {key:'uhc_duels',label:'UHC'},
  {key:'combo_duels',label:'Combo'},
  {key:'op_duels',label:'OP'},
  {key:'sumo_duels',label:'Sumo'},
  {key:'no_debuff',label:'No Debuff'},
  {key:'boxing',label:'Boxing'},
  {key:'most_wins',label:'Most Wins'},
  {key:'best_kdr',label:'Best KDR'},
  {key:'best_streak',label:'Best Streak'},
  {key:'most_kills',label:'Most Kills'},
  {key:'arrow_accuracy',label:'Arrow Acc'},
  {key:'most_matches',label:'Most Matches'},
  {key:'best_winrate',label:'Win Rate'},
  {key:'most_damage',label:'Most Damage'},
  {key:'headshot_kings',label:'Headshots'}
];
let LB_STATE = { tab:'overall', search:'', tier:'', page:1, perPage:25, data:[] };

function renderTabs() {
  const el = document.getElementById('lb-tabs');
  el.innerHTML = LB_TABS.map(t=>`<button class="lb-tab ${t.key===LB_STATE.tab?'active':''}" data-key="${t.key}">${t.label}</button>`).join('');
  el.querySelectorAll('.lb-tab').forEach(b => b.onclick = () => { LB_STATE.tab = b.dataset.key; LB_STATE.page=1; loadLB(); });
}
function renderPodium(top3) {
  const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd visually
  return order.map((p,i) => {
    if (!p) return `<div class="podium-item rank-${i===1?1:i===0?2:3}"><div class="empty">—</div></div>`;
    const rank = i===1?1:i===0?2:3;
    return `<div class="podium-item rank-${rank}">
      <div class="rank-num">#${rank}</div>
      <img src="${avatarUrl(p.playerName)}" alt=""/>
      <div class="player-name"><a href="/player.html?name=${encodeURIComponent(p.playerName)}">${p.playerName||'—'}</a></div>
      <div class="elo">${fmtNum(p.elo)}</div>
      ${tierBadge(p.elo)}
    </div>`;
  }).join('');
}
function renderTable(rows) {
  if (!rows.length) return '<div class="empty">No data yet</div>';
  return `<table><thead><tr><th>#</th><th>Player</th><th>ELO</th><th>Tier</th><th>W</th><th>L</th><th>KDR</th><th class="hide-mobile">Win%</th><th class="hide-mobile">Streak</th></tr></thead>
  <tbody>${rows.map((p,i)=>`<tr class="slide-in-left" style="animation-delay:${i*0.02}s">
    <td><strong>${p.rank ?? (i+1+(LB_STATE.page-1)*LB_STATE.perPage)}</strong></td>
    <td><img class="avatar" src="${avatarUrl(p.playerName)}" alt=""/><a href="/player.html?name=${encodeURIComponent(p.playerName)}">${p.playerName||'—'}</a></td>
    <td><strong>${fmtNum(p.elo)}</strong></td>
    <td>${tierBadge(p.elo)}</td>
    <td>${fmtNum(p.wins)}</td>
    <td>${fmtNum(p.losses)}</td>
    <td>${p.kdr?.toFixed?.(2) ?? '—'}</td>
    <td class="hide-mobile">${fmtPercent(p.winRate)}</td>
    <td class="hide-mobile">${fmtNum(p.killStreak)}</td>
  </tr>`).join('')}</tbody></table>`;
}
async function loadLB() {
  document.getElementById('lb-podium').innerHTML = `<div class="skeleton" style="height:240px"></div><div class="skeleton" style="height:280px"></div><div class="skeleton" style="height:200px"></div>`;
  document.getElementById('lb-table').innerHTML = skeleton(8);
  renderTabs();
  const raw = await db('/pvp/leaderboard/'+LB_STATE.tab);
  let arr = Array.isArray(raw) ? raw.filter(Boolean) : objToArr(raw);
  // filters
  if (LB_STATE.search) arr = arr.filter(p => (p.playerName||'').toLowerCase().includes(LB_STATE.search.toLowerCase()));
  if (LB_STATE.tier) arr = arr.filter(p => tierFromElo(p.elo).name === LB_STATE.tier);
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
