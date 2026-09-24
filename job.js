const sb = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey);
const id = new URLSearchParams(location.search).get("id");
const root = document.querySelector("#job");
const WA_NUMBER = "919629807996";
function e(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function expired(d){return d && new Date(d+"T23:59:59") < new Date();}
async function run(){
  if(!id){root.innerHTML="<div class='empty'><h3>வேலை விவரம் கிடைக்கவில்லை</h3><a class='view' href='index.html'>முகப்புக்கு செல்லுங்கள்</a></div>";return;}
  const {data:j,error}=await sb.from("jobs").select("*").eq("id",id).eq("status","active").maybeSingle();
  if(error||!j){root.innerHTML="<div class='empty'><h3>வேலை அறிவிப்பு கிடைக்கவில்லை</h3><a class='view' href='index.html'>முகப்புக்கு செல்லுங்கள்</a></div>";return;}
  const ex=expired(j.last_date);
  const date=j.last_date?new Date(j.last_date).toLocaleDateString("ta-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"குறிப்பிடப்படவில்லை";
  const msg=encodeURIComponent(`வணக்கம், ${j.job_id||""} - ${j.title||"வேலை"} விண்ணப்பம் தொடர்பாக உதவி தேவை.`);
  root.innerHTML=`
    <div class="poster-top ${String(j.category||"").toLowerCase().includes("government")?"govt":"other"}" style="border-radius:20px;margin-bottom:18px">
      <span class="poster-label">${j.category==="Government"?"அரசு வேலை":e(j.category||"வேலைவாய்ப்பு")}</span>
      <div class="poster-title">${e(j.title)}</div><div class="poster-org">${e(j.organization)}</div>
    </div>
    <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px">
      <div class="facts">
        <div class="fact">📚 கல்வித் தகுதி<strong>${e(j.qualification||"குறிப்பிடப்படவில்லை")}</strong></div>
        <div class="fact">🎂 வயது<strong>${e(j.age||"அறிவிப்பைப் பார்க்கவும்")}</strong></div>
        <div class="fact">💰 சம்பளம்<strong>${e(j.salary||"அறிவிப்பைப் பார்க்கவும்")}</strong></div>
        <div class="fact">📍 இடம்<strong>${e(j.location||"தமிழ்நாடு")}</strong></div>
        <div class="fact">📅 கடைசி நாள்<strong>${date}</strong></div>
        <div class="fact">📝 விண்ணப்பக் கட்டணம்<strong>${e(j.application_fee||"அறிவிப்பைப் பார்க்கவும்")}</strong></div>
      </div>
      <hr style="border:0;border-top:1px solid var(--line);margin:22px 0">
      <h3>வேலை பற்றிய விவரம்</h3><p style="white-space:pre-line;line-height:1.8;color:#475569">${e(j.description||"விவரம் குறிப்பிடப்படவில்லை")}</p>
      <h3>தேர்வு / தேர்வு முறை</h3><p style="white-space:pre-line;line-height:1.8;color:#475569">${e(j.selection_process||"அறிவிப்பைப் பார்க்கவும்")}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:25px">
        ${!ex && j.official_link ? `<a href="${e(j.official_link)}" target="_blank" rel="noopener" style="background:#0f766e;color:#fff;padding:13px 18px;border-radius:12px;font-weight:800">🟢 அதிகாரப்பூர்வமாக விண்ணப்பிக்க</a>` : `<span style="background:#e5e7eb;color:#64748b;padding:13px 18px;border-radius:12px;font-weight:700">விண்ணப்ப காலம் முடிந்தது</span>`}
        <a href="https://wa.me/${WA_NUMBER}?text=${msg}" target="_blank" rel="noopener" style="background:#166534;color:#fff;padding:13px 18px;border-radius:12px;font-weight:800">💬 விண்ணப்ப உதவி</a>
        <button onclick="shareJob('${encodeURIComponent(j.title||"வேலை")}')" style="border:1px solid var(--line);background:#fff;padding:13px 18px;border-radius:12px;font-family:inherit;font-weight:700;cursor:pointer">📤 பகிர்</button>
      </div>
      <p style="font-size:11px;color:#94a3b8;margin-top:20px">வேலை ID: ${e(j.job_id||"")}. விண்ணப்பிக்கும் முன் அதிகாரப்பூர்வ அறிவிப்பில் உள்ள தகுதி, வயது, தேதி மற்றும் விதிமுறைகளை சரிபார்க்கவும்.</p>
    </div>`;
}
function shareJob(title){
 const text=`நம்ம வேலை - ${decodeURIComponent(title)}
${location.href}`;
 if(navigator.share) navigator.share({title:"நம்ம வேலை",text,url:location.href}).catch(()=>{});
 else navigator.clipboard?.writeText(text).then(()=>alert("இணைப்பு நகலெடுக்கப்பட்டது"));
}
run();
