// ===== Tabs =====
const tabs = document.querySelectorAll('.tab-btn');
const pages = document.querySelectorAll('.tab-page');
tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b => b.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

// ===== Firebase SDK (v10 CDN) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "component-life.firebaseapp.com",
  projectId: "component-life",
  storageBucket: "component-life.appspot.com",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

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

// Form inputs
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

let editId = null; // id being edited

// ===== Helpers =====
const fmtMoney = v => v != null ? `$${Number(v).toLocaleString()}` : '-';
const pctBadge = (pct) => {
  if (pct == null || isNaN(pct)) return '-';
  if (pct < 60) return `<span class="badge ok">${pct}%</span>`;
  if (pct < 85) return `<span class="badge warn">${pct}%</span>`;
  return `<span class="badge danger">${pct}%</span>`;
};
function numOrNull(v){ const n = Number(v); return isNaN(n)||v===''?null:n; }
function esc(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// ===== Data cache =====
let allDocs = [];
const col = collection(db, 'components');

onSnapshot(query(col, orderBy('equip')), snap => {
  allDocs = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  populateFilters(allDocs);
  renderTable();
});

function populateFilters(rows){
  const uniq = arr => Array.from(new Set(arr.filter(Boolean)));
  const equips = uniq(rows.map(r=>r.equip));
  const models = uniq(rows.map(r=>r.model));
  const comps  = uniq(rows.map(r=>r.component));
  [filterEquip, filterModel, filterComponent].forEach(sel=>sel.length=1);
  equips.forEach(v=>filterEquip.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
  models.forEach(v=>filterModel.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
  comps.forEach(v=>filterComponent.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
}

function applyFilter(rows){
  const e=filterEquip.value, m=filterModel.value, c=filterComponent.value;
  return rows.filter(r => (!e||r.equip===e)&&(!m||r.model===m)&&(!c||r.component===c));
}

btnApplyFilter.addEventListener('click', renderTable);
btnClearFilter.addEventListener('click', ()=>{
  filterEquip.value=''; filterModel.value=''; filterComponent.value='';
  renderTable();
});

// ===== Table render =====
function renderTable(){
  const rows = applyFilter(allDocs);
  tbody.innerHTML = rows.map(r=>rowHtml(r)).join('');
  attachRowEvents();
}

function rowHtml(r){
  const nextChange = computeNextChange(r);
  const life = computeLife(r);
  const pct = computePct(life,r.freq);
  const rating = r.rating ? '⭐'.repeat(r.rating) : '-';
  const pic = r.pictureUrl ? `<a href="${r.pictureUrl}" target="_blank"><img class="thumb" src="${r.pictureUrl}"/></a>` : '-';
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
    <td title="${esc(r.remarks)}">${esc(r.remarks).slice(0,18)}${(r.remarks||'').length>18?'…':''}</td>
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
  return Number(r.smu) - new Date(r.changeOut).getTime()/86400000; // simple days diff
}

function computePct(life,freq){
  if(!life || !freq) return null;
  return Math.round(life/freq*100);
}

// ===== Modal Add/Edit =====
btnAddNew.addEventListener('click', ()=>{
  editId=null;
  modalTitle.innerText="Add New Component";
  form.reset();
  modal.style.display='block';
});
spanClose.addEventListener('click', ()=>modal.style.display='none');
window.addEventListener('click', e=>{if(e.target===modal) modal.style.display='none';});

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

  if(!payload.equip||!payload.component){
    alert('Equip & Component wajib diisi'); return;
  }

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

previewBtn.addEventListener('click', ()=>{
  const lines = bulkTA.value.split('\n').map(l=>l.trim()).filter(Boolean);
  bulkResult.innerHTML = lines.map(l=>esc(l)).join('<br/>');
});

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
