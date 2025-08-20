document.addEventListener('DOMContentLoaded', () => {  
  // ===== Tabs =====  
  const tabs = document.querySelectorAll('.tab-btn');  
  const pages = document.querySelectorAll('.tab-page');  
  tabs.forEach(btn => btn.addEventListener('click', () => {  
    tabs.forEach(b => b.classList.remove('active'));  
    pages.forEach(p => p.classList.remove('active'));  
    btn.classList.add('active');  
    document.getElementById(btn.dataset.tab).classList.add('active');  
  }));  

  // ===== Firebase config =====  
  const firebaseConfig = {  
    apiKey: "YOUR_API_KEY",  
    authDomain: "component-life.firebaseapp.com",  
    projectId: "component-life",  
    storageBucket: "component-life.appspot.com",  
    messagingSenderId: "",  
    appId: ""  
  };  

  // Initialize Firebase if SDK loaded  
  let app, db, storage;  
  if (typeof firebase !== 'undefined') {  
    if (!firebase.apps || firebase.apps.length === 0) {  
      firebase.initializeApp(firebaseConfig);  
    }  
    app = firebase.app();  
    db = firebase.firestore(app);  
    storage = firebase.storage(app);  
  } else {  
    console.error('Firebase SDK not loaded. Include firebase-app.js (and firestore/storage jika diperlukan) before this script.');  
  }  

  // ===== DOM Refs =====  
  const tbody = document.getElementById('compTbody');  
  const filterEquip = document.getElementById('filterEquip');  
  const filterModel = document.getElementById('filterModel');  
  const filterComponent = document.getElementById('filterComponent');  
  const btnApplyFilter = document.getElementById('btnApplyFilter');  
  const btnClearFilter = document.getElementById('btnClearFilter');  
  const btnAddNew = document.getElementById('btnAddNew');  
  const modal = document.getElementById('modalForm');  
  const spanClose = modal.querySelector('.close');  
  const form = document.getElementById('componentForm');  
  const modalTitle = document.getElementById('modalTitle');  
  const inputs = {  
    equip: document.getElementById('formEquip'),  
    model: document.getElementById('formModel'),  
    component: document.getElementById('formComponent'),  
    freq: document.getElementById('formFreq'),  
    cost: document.getElementById('formCost'),  
    changeOut: document.getElementById('formChangeOut'),  
    smu: document.getElementById('formSMU'),  
    life: document.getElementById('formLife'),  
    pct: document.getElementById('formPct'),  
    rating: document.getElementById('formRating'),  
    remarks: document.getElementById('formRemarks'),  
    picture: document.getElementById('formPicture')  
  };  

  let editId = null;  
  let allDocs = [];  
  const col = db ? db.collection('components') : null;  

  // ===== Helpers =====
const fmtMoney = v => (v != null) ? `${Number(v).toLocaleString()}` : '-';
const esc = s => (s != null)
  ? String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  : '';

  const pctBadge = (pct) => {  
    if (pct == null || isNaN(pct)) return '-';  
    if (pct < 60) return `<span class="badge ok">${pct}%</span>`;  
    if (pct < 85) return `<span class="badge warn">${pct}%</span>`;  
    return `<span class="badge danger">${pct}%</span>`;  
  };  

  // Contoh render contoh (opsional)  
  function renderExample(data) {  
    const moneyEl = document.getElementById('money');  
    const pctEl = document.getElementById('pct');  
    if (moneyEl) moneyEl.textContent = fmtMoney(data?.value);  
    if (pctEl) pctEl.innerHTML = pctBadge(data?.pct);  
  }  

  // If firebase not ready, skip Firestore related setups  
  let colListenerActive = false;  

  // ===== Fetch Firestore =====  
  if (db && col) {  
    col.orderBy('equip').onSnapshot(snap => {  
      allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));  
      populateFilters(allDocs);  
      renderTable();  
    });  
  }  

  function populateFilters(rows) {  
    const uniq = arr => Array.from(new Set(arr.filter(Boolean)));  
    const equips = uniq(rows.map(r => r.equip));  
    const models = uniq(rows.map(r => r.model));  
    const comps = uniq(rows.map(r =>

  function applyFilter(rows) {
    const e = filterEquip.value,
          m = filterModel.value,
          c = filterComponent.value;

    return rows.filter(r =>
      (!e || r.equip === e) &&
      (!m || r.model === m) &&
      (!c || r.component === c)
    );
  }

  // ===== Table render =====
  function renderTable() {
    const rows = applyFilter(allDocs);
    tbody.innerHTML = rows.map(r => rowHtml(r)).join('');
    attachRowEvents();
  }

  function rowHtml(r) {
    const nextChange = computeNextChange(r);
    const life = computeLife(r);
    const pct = computePct(life, r.freq);
    const rating = (typeof r.rating === 'number' && r.rating > 0) ? '⭐'.repeat(r.rating) : '-';
    const pic = r.pictureUrl
      ? `<a href="${r.pictureUrl}" target="_blank"><img class="thumb" src="${r.pictureUrl}"/></a>`
      : '-';
    const remarks = r.remarks || "";

    return `<tr data-id="${r.id}">
    <td>${esc(r.equip)}</td>
    <td>${esc(r.model)}</td>
    <td>${esc(r.component)}</td>
    <td>${r.freq||''}</td>
    <td>${fmtMoney(r.cost)}</td>
    <td>${r.changeOut||''}</td>
    <td>${nextChange||''}</td>
    <td>${r.smu||''}</td>
    <td>${life||''}</td>
    <td>${pctBadge(pct)}</td>
    <td>${rating}</td>
    <td title="${esc(remarks)}">${esc(remarks).slice(0,18)}${remarks.length>18?'…':''}</td>
    <td>${pic}</td>
    <td>
      <button class="action-btn edit">✏️</button>
      <button class="action-btn del">🗑️</button>
    </td>
  </tr>`;
  }

  function attachRowEvents(){
    tbody.querySelectorAll('.edit').forEach(btn=>btn.addEventListener('click', onEdit));
    tbody.querySelectorAll('.del').forEach(btn=>btn.addEventListener('click', onDelete));
  }

  // ===== Computation =====
  function computeNextChange(r){
    if(!r.freq || !r.changeOut) return null;
    const co = new Date(r.changeOut);
    co.setDate(co.getDate() + Number(r.freq));
    return co.toISOString().slice(0,10);
  }

  function computeLife(r){
    if(!r.smu || !r.changeOut) return null;
    const daysSinceChange = Math.floor((Date.now() - new Date(r.changeOut)) / 86400000);
    return Number(r.smu) - daysSinceChange;
  }

  function computePct(life,freq){
    if(!life || !freq) return null;
    return Math.round(life/freq*100);
  }

  // ===== Add/Edit =====
  btnAddNew.addEventListener('click', () => {
    editId = null;
    modalTitle.textContent = 'Add Component';
    form.reset();
    inputs.life.value = '';
    inputs.pct.value = '';
    modal.style.display = 'block';
  });

  spanClose.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target===modal) modal.style.display='none'; });

  // ===== Live calculation =====
  [inputs.smu, inputs.freq, inputs.changeOut].forEach(i => i.addEventListener('input', updateCalc));

  function updateCalc(){
    const smu = Number(inputs.smu.value) || 0;
    const freq = Number(inputs.freq.value) || 0;
    const changeOut = inputs.changeOut.value ? new Date(inputs.changeOut.value) : null;
    let life = smu;
    if(changeOut){
      const daysSinceChange = Math.floor((Date.now() - changeOut) / 86400000);
      life = smu - daysSinceChange;
    }
    inputs.life.value = life;
    inputs.pct.value = freq>0 ? Math.round(life/freq*100) : 0;
  }

  // ===== Save form =====
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const payload = {
      equip: inputs.equip.value.trim(),
      model: inputs.model.value.trim(),
      component: inputs.component.value.trim(),
      freq: numOrNull(inputs.freq.value),
      cost: numOrNull(inputs.cost.value),
      changeOut: inputs.changeOut.value||null,
      smu: numOrNull(inputs.smu.value),
      rating: numOrNull(inputs.rating.value),
      remarks: inputs.remarks.value||null,
      pictureUrl:null,
      createdAt: Date.now()
    };
    if(!payload.equip||!payload.component){ alert('Equip & Component wajib diisi'); return; }

    if(editId){
      const docRef = doc(db,'components',editId);
      const file = inputs.picture.files[0];
      if(file){
        const r = ref(storage, `pictures/${editId}/${file.name}`);
        await uploadBytes(r,file);
        payload.pictureUrl = await getDownloadURL(r);
      }
      await updateDoc(docRef,payload);
    } else {
      const docRef = await addDoc(col,payload);
      const file = inputs.picture.files[0];
      if(file){
        const r = ref(storage, `pictures/${docRef.id}/${file.name}`);
        await uploadBytes(r,file);
        await updateDoc(doc(db,'components',docRef.id),{pictureUrl:await getDownloadURL(r)});
      }
    }
    modal.style.display='none';
  });

  // ===== Edit/Delete =====
  function onEdit(e){
    const tr = e.target.closest('tr');
    editId = tr.dataset.id;
    const row = allDocs.find(d=>d.id===editId);
    if(!row) return;
    modalTitle.innerText="Edit Component";
    inputs.equip.value=row.equip||'';
    inputs.model.value=row.model||'';
    inputs.component.value=row.component||'';
    inputs.freq.value=row.freq||'';
    inputs.cost.value=row.cost||'';
    inputs.changeOut.value=row.changeOut||'';
    inputs.smu.value=row.smu||'';
    inputs.rating.value=row.rating||'';
    inputs.remarks.value=row.remarks||'';
    inputs.life.value = computeLife(row);
    inputs.pct.value = computePct(inputs.life.value,row.freq);
    modal.style.display='block';
  }

  async function onDelete(e){
    const tr = e.target.closest('tr');
    const id = tr.dataset.id;
    if(confirm('Hapus baris ini?')){
      await updateDoc(doc(db,'components',id), {deleted:true});
    }
  }

  // ===== Bulk SMU =====
  const previewBtn = document.getElementById('btnPreviewBulk');
  const applyBtn = document.getElementById('btnApplyBulk');
  const bulkTA = document.getElementById('smuBulk');
  const bulkResult = document.getElementById('bulkResult');

  if(previewBtn){
    previewBtn.addEventListener('click', ()=>{
      const lines = bulkTA.value.split('\n').map(l=>l.trim()).filter(Boolean);
      bulkResult.innerHTML = lines.map(l=>esc(l)).join('<br/>');
    });
  }

  if(applyBtn){
    applyBtn.addEventListener('click', async ()=>{
      const lines = bulkTA.value.split('\n').map(l=>l.trim()).filter(Boolean);
      for(const line of lines){
        const [equip, smu] = line.split(',').map(s=>s.trim());
        if(!equip||!smu) continue;
        const docToUpdate = allDocs.find(d=>d.equip===equip);
        if(docToUpdate){
          await updateDoc(doc(db,'components',docToUpdate.id), {smu:Number(smu)});
        }
      }
      alert('SMU Updated!');
    });
  }

});






