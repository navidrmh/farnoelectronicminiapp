const tg = window.Telegram?.WebApp;
const API = "https://nvd2rmh.pythonanywhere.com";

if (tg) {
  tg.ready();
  tg.expand();
  try { tg.setHeaderColor("#050914"); tg.setBackgroundColor("#030711"); } catch {}
}

const levels = [
  {n:"STARTER",next:"RISING",xp:1000}, {n:"RISING",next:"BUILDER",xp:5000},
  {n:"BUILDER",next:"PRO",xp:15000}, {n:"PRO",next:"ELITE",xp:40000},
  {n:"ELITE",next:"MASTER",xp:100000}, {n:"MASTER",next:"LEGEND",xp:250000},
  {n:"LEGEND",next:"MAX",xp:500000}, {n:"MAX",next:"MAX",xp:Infinity}
];
const maxEnergy = 100;
const $ = id => document.getElementById(id);
let state = {balance:0, energy:100, xp:0, level:1};
let lastSync = Date.now();
let tapQueue = Promise.resolve();

function levelInfo(){ return levels[Math.min(state.level - 1, levels.length - 1)]; }
function saveServerState(data){
  state = {balance:data.fcoin, energy:Number(data.energy), xp:data.xp, level:data.level};
  lastSync = Date.now();
  render();
}
function estimatedEnergy(){
  const elapsed = Math.max(0, (Date.now() - lastSync) / 1000);
  return Math.min(maxEnergy, state.energy + elapsed * (100 / 180));
}
function render(){
  const l = levelInfo(), prev = state.level === 1 ? 0 : levels[state.level - 2].xp;
  const energy = estimatedEnergy();
  $("balance").textContent = state.balance.toLocaleString();
  $("energy").textContent = Math.floor(energy);
  $("tapPower").textContent = state.level;
  $("level").textContent = state.level;
  $("rank").textContent = l.n;
  $("levelName").textContent = l.n;
  $("nextName").textContent = l.next;
  $("xp").textContent = state.xp.toLocaleString();
  $("xpNext").textContent = Number.isFinite(l.xp) ? l.xp.toLocaleString() : "MAX";
  const pct = Number.isFinite(l.xp) ? Math.max(0, Math.min(100, ((state.xp-prev)/(l.xp-prev))*100)) : 100;
  $("xpBar").style.width = pct + "%";
  $("energyBar").style.width = Math.max(0, Math.min(100, energy)) + "%";
}
function toast(t){
  $("toast").textContent = t;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1500);
}
function headers(){
  const initData = tg?.initData || "";
  return {"Content-Type":"application/json", "X-Telegram-Init-Data":initData};
}
async function api(path, options={}){
  const res = await fetch(API + path, {...options, headers:{...headers(), ...(options.headers||{})}});
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(data.error || "request_failed");
  return data;
}
async function sync(){
  if(!tg?.initData){ toast("Open F Coin inside Telegram"); return; }
  try { saveServerState(await api("/api/fcoin/me")); }
  catch(e){ toast(e.message === "invalid_telegram_auth" ? "Telegram authentication failed" : "Connection error"); }
}
function popup(e, text){
  const el=document.createElement("div"); el.className="tap"; el.textContent=text;
  const r=$("coin").getBoundingClientRect();
  el.style.left=(e.clientX-r.left-10)+"px"; el.style.top=(e.clientY-r.top-10)+"px";
  $("popups").appendChild(el); setTimeout(()=>el.remove(),650);
}
$("coin").addEventListener("click", e => {
  tapQueue = tapQueue.then(async () => {
    if(estimatedEnergy() < state.level){ toast("⚡ Not enough energy"); return; }
    try {
      const before = state.level;
      const data = await api("/api/fcoin/tap", {method:"POST", body:"{}"});
      saveServerState(data);
      popup(e, "+" + data.gain);
      if(tg?.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
      if(data.level > before && tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
    } catch(e){ toast(e.message === "not_enough_energy" ? "⚡ Not enough energy" : "Connection error"); }
  });
});
$("bonus").onclick = async () => {
  try {
    const data = await api("/api/fcoin/daily", {method:"POST", body:"{}"});
    saveServerState(data); toast("🎁 +1,000 F Coin");
  } catch(e){ toast(e.message === "already_claimed" ? "🎁 Already claimed today" : "Connection error"); }
};
$("convert").onclick = async () => {
  try {
    const data = await api("/api/fcoin/convert", {method:"POST", body:"{}"});
    saveServerState(data); toast("⇄ +" + data.coinGain + " Bot Coin");
  } catch(e){ toast(e.message === "not_enough_fcoin" ? "Need 1,000 F Coins" : "Conversion failed"); }
};
setInterval(render, 1000);
sync();
