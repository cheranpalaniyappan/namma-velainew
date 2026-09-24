const sb = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey);

const $ = (s) => document.querySelector(s);
let jobs = [];

const WA_NUMBER = "919629807996"; // Add Namma Velai WhatsApp number later, e.g. 919876543210
const CHANNEL_URL = "https://whatsapp.com/channel/0029VbDZKEI8qIztjIeeVO22"; // Add your WhatsApp Channel URL later

function setLinks() {
  if (CHANNEL_URL) ["#channel"].forEach(id => { const el=$(id); if(el) el.href=CHANNEL_URL; });
  if (WA_NUMBER) {
    const url = `https://wa.me/${WA_NUMBER}`;
    ["#waService", "#waContact"].forEach(id => { const el=$(id); if(el) el.href=url; });
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function formatDate(v) {
  if (!v) return "Not specified";
  const d = new Date(v + (String(v).length === 10 ? "T00:00:00" : ""));
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"});
}

function render() {
  const search = ($('#search')?.value || '').toLowerCase().trim();
  const category = $('#category')?.value || 'All';
  const sort = $('#sort')?.value || 'latest';
  let filtered = jobs.filter(j => {
    const text = [j.title,j.organization,j.qualification,j.location,j.description,j.category].join(' ').toLowerCase();
    const catOk = category === 'All' || j.category === category || String(j.qualification||'').toLowerCase().includes(category.toLowerCase());
    return catOk && (!search || text.includes(search));
  });

  filtered.sort((a,b) => sort === 'deadline'
    ? String(a.last_date||'9999-12-31').localeCompare(String(b.last_date||'9999-12-31'))
    : String(b.created_at||'').localeCompare(String(a.created_at||'')));

  $('#count').textContent = jobs.length;
  $('#results').textContent = `${filtered.length} job${filtered.length === 1 ? '' : 's'}`;
  const grid = $('#grid');
  const empty = $('#empty');
  if (!filtered.length) { grid.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  grid.innerHTML = filtered.map(j => `
    <article class="jobCard">
      <div class="jobTop"><span class="tag">${escapeHtml(j.category || 'Job')}</span><span class="jobId">${escapeHtml(j.job_id)}</span></div>
      <h3>${escapeHtml(j.title)}</h3>
      <p class="org">${escapeHtml(j.organization)}</p>
      <div class="jobMeta">
        <span>🎓 ${escapeHtml(j.qualification || 'Not specified')}</span>
        <span>📍 ${escapeHtml(j.location || 'Tamil Nadu')}</span>
        <span>💰 ${escapeHtml(j.salary || 'As per notification')}</span>
        <span>📅 Last date: ${escapeHtml(formatDate(j.last_date))}</span>
      </div>
      <p>${escapeHtml(j.description || '')}</p>
      <div class="jobActions">
        <a class="btn primary" href="${escapeHtml(j.official_link || '#')}" target="_blank" rel="noopener">Official Apply ↗</a>
        <button class="btn light" data-job="${escapeHtml(j.job_id)}">View / Assistance</button>
      </div>
    </article>`).join('');

  grid.querySelectorAll('[data-job]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.job;
    const el = $('#jobHelpId');
    if (el) el.textContent = id;
    location.hash = 'contact';
  }));
}

async function loadJobs() {
  const { data, error } = await sb.from('jobs').select('*').eq('status','active').order('created_at',{ascending:false});
  if (error) {
    console.error('Supabase jobs error:', error);
    $('#grid').innerHTML = '';
    $('#empty').classList.remove('hidden');
    $('#empty h3').textContent = 'Jobs could not be loaded';
    $('#empty p').textContent = 'Please refresh the page or check the Supabase connection.';
    return;
  }
  jobs = data || [];
  render();
}

$('#search')?.addEventListener('input', render);
$('#category')?.addEventListener('change', render);
$('#sort')?.addEventListener('change', render);
document.querySelectorAll('.cats button').forEach(btn => btn.addEventListener('click', () => { $('#category').value = btn.dataset.cat; render(); location.hash='jobs'; }));
$('#menu')?.addEventListener('click', () => $('#nav')?.classList.toggle('open'));
$('#form')?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get('name');
  const jobid = fd.get('jobid');
  const message = fd.get('message');
  if (!WA_NUMBER) { alert('WhatsApp number will be added soon. Please use the email for now.'); return; }
  const text = encodeURIComponent(`Namma Velai Application Assistance\nName: ${name}\nJob ID: ${jobid}\nMessage: ${message}`);
  window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
});
$('#year').textContent = new Date().getFullYear();
setLinks();
loadJobs();
