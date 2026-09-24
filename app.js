const sb = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey);
const $ = s => document.querySelector(s);
let allJobs = [];

function isExpired(job){
  if(!job.last_date) return false;
  const d = new Date(job.last_date + "T23:59:59");
  return d < new Date();
}
function monthMatch(job){
  if(!job.last_date) return true;
  const d = new Date(job.last_date + "T23:59:59");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
function categoryClass(c){
  return String(c||"").toLowerCase().includes("government") || String(c||"").toLowerCase().includes("அரசு") ? "govt" :
         String(c||"").toLowerCase().includes("private") ? "private" : "other";
}
function poster(job){
  const c = categoryClass(job.category);
  const date = job.last_date ? new Date(job.last_date).toLocaleDateString("ta-IN",{day:"2-digit",month:"2-digit",year:"numeric"}) : "குறிப்பிடப்படவில்லை";
  const loc = job.location || "தமிழ்நாடு";
  return `<article class="poster" onclick="location.href='job.html?id=${encodeURIComponent(job.id)}'">
    <div class="poster-top ${c}">
      <span class="poster-label">${job.category === "Government" ? "அரசு வேலை" : (job.category || "வேலைவாய்ப்பு")}</span>
      <div class="poster-title">${escapeHtml(job.title || "வேலைவாய்ப்பு")}</div>
      <div class="poster-org">${escapeHtml(job.organization || "")}</div>
    </div>
    <div class="poster-body">
      <div class="facts">
        <div class="fact">📚 தகுதி<strong>${escapeHtml(job.qualification || "குறிப்பிடப்படவில்லை")}</strong></div>
        <div class="fact">📍 இடம்<strong>${escapeHtml(loc)}</strong></div>
        <div class="fact">💰 சம்பளம்<strong>${escapeHtml(job.salary || "அறிவிப்பைப் பார்க்கவும்")}</strong></div>
        <div class="fact">📅 கடைசி நாள்<strong>${date}</strong></div>
      </div>
      <div class="poster-footer"><span class="deadline">கடைசி நாள்: ${date}</span><span class="view">முழு விவரம் →</span></div>
    </div>
  </article>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#039;"}[m]));}

function render(){
  const q = ($("#search").value||"").trim().toLowerCase();
  const cat = $("#category").value;
  const filtered = allJobs.filter(j=>{
    const text = [j.title,j.organization,j.location,j.qualification,j.category].join(" ").toLowerCase();
    return (!q || text.includes(q)) && (!cat || j.category===cat);
  });
  const active = filtered.filter(j=>!isExpired(j));
  const fresh = active.slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,9);
  const month = active.filter(monthMatch).sort((a,b)=>new Date(a.last_date||"2999-12-31")-new Date(b.last_date||"2999-12-31"));
  const govt = active.filter(j=>String(j.category||"").toLowerCase().includes("government"));

  $("#newJobs").innerHTML = fresh.length ? fresh.map(poster).join("") : "";
  $("#monthJobs").innerHTML = month.length ? month.map(poster).join("") : "";
  $("#govtJobs").innerHTML = govt.length ? govt.map(poster).join("") : "";
  $("#newCount").textContent = fresh.length ? `${fresh.length} அறிவிப்புகள்` : "";
  $("#monthCount").textContent = month.length ? `${month.length} வேலைகள்` : "";
  $("#empty").classList.toggle("hidden", !!(fresh.length||month.length||govt.length));
}
async function loadJobs(){
  const {data,error} = await sb.from("jobs").select("*").eq("status","active").order("created_at",{ascending:false});
  if(error){ console.error(error); allJobs=[]; } else allJobs=data||[];
  render();
}
$("#search").addEventListener("input",render);
$("#category").addEventListener("change",render);
loadJobs();
