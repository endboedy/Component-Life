import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ===== Firebase Config =====
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

// ===== DOM =====
const tabs = document.querySelectorAll('.tab-btn');
const pages = document.querySelectorAll('.tab-page');
tabs.forEach(btn=>btn.addEventListener('click',()=>{tabs.forEach(b=>b.classList.remove('active'));pages.forEach(p=>p.classList.remove('active'));btn.classList.add('active');document.getElementById(btn.dataset.tab).classList.add('active');}));

const tbody = document.getElementById('compTbody');
const filterEquip = document.getElementById('filterEquip');
const filterModel = document.getElementById('filterModel');
const filterComponent = document.getElementById('filterComponent');
const btnApplyFilter = document.getElementById('btnApplyFilter');
const btnClearFilter = document.getElementById('btnClearFilter');
const btnAddNew = document.getElementById('btnAddNew');

// Modal
const modal = document.getElementById('modalForm');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('componentForm');
const btnCancelModal = document.getElementById('btnCancelModal');

let editId = null; // untuk edit mode
let allDocs = [];
const col = collection(db,'components');

// ===== Helpers =====
const fmtMoney = v => v?`$${v}`:'-';
const pctBadge = p=>p==null?'<span class="badge">-</span>':p<60?'<span class="badge ok">'+p+'%</span>':p<85?'<span class="badge warn">'+p+'%</span>':'<span class="badge danger">'+p+'%</span>';
function computeNextChange(freq, changeOut){ if(!freq||!changeOut) return ''; const d = new Date(changeOut); d.setDate(d.getDate()+Number(freq)); return d.toISOString().slice(0,10); }
function computeLife(smu, changeOut){ if(smu==null||!changeOut) return null; return smu - new Date(changeOut).getDate(); }
function computePct(life, freq){ if(life==null||freq==null||freq===0) return null; return Math.round((life/freq)*100); }
function numOrNull(v){ const n=Number(v); return isNaN(n)||v===''?null:n; }
function esc(s){return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}

// ===== Firestore Live =====
onSnapshot(query(col,orderBy('equip')),(snap)=>{
  allDocs = snap.docs.map(d=>({id:d.id,...d.data()}));
  populateFilterOptions(allDocs);
  renderAll();
});

function populateFilterOptions(rows){
  const uniq=arr=>Array.from(new Set(arr.filter(Boolean)));
  const equips=uniq(rows.map(r=>r.equip));
  const models=uniq(rows.map(r=>r.model));
  const comps=uniq(rows.map(r=>r.component));
  [filterEquip,filterModel,filterComponent].forEach(s=>s.length=1);
  equips.forEach(v=>filterEquip.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
  models.forEach(v=>filterModel.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
  comps.forEach(v=>filterComponent.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
}

function applyClientFilter(rows){
  const e=filterEquip.value; const m=filterModel.value; const c=filterComponent.value;
  return rows.filter(r=>(!e||r.equip===e)&&(!m||r.model===m)&&(!c||r.component===c));
}

function renderAll(){
  const rows=applyClientFilter(allDocs);
  tbody.innerHTML = rows.map(r=>{
    const nextChange = computeNextChange(r.freq,r.changeOut);
    const life = computeLife(r.smu,r.changeOut);
    const pct = computePct(life,r.freq);
    const rating = r.rating?'⭐'.repeat(Number(r.rating)):'-';
    const pic = r.pictureUrl?`<a href="${r.pictureUrl}" target="_blank"><img class="thumb" src="${r.pictureUrl}"></a>`:'-';
    return `<tr data-id="${r.id}">
      <td>${esc(r.equip)}</td>
      <td>${esc(r.model)}</td>
      <td>${esc(r.component)}</td>
      <td>${r.freq??''}</td>
      <td>${r.changeOut??''}</td>
      <td>${nextChange}</td>
      <td>${r.smu??''}</td>
      <td>${life??''}</td>
      <td>${pctBadge(pct)}</td>
      <td>${rating}</td>
      <td title="${esc(r.remarks)}">${esc(r.remarks)}</td>
      <td>${pic}</td>
      <td>
        <button class="action-btn edit">✏️</button>
        <button class="action-btn del">🗑️</button>
      </td>
    </tr>`;
  }).join('');
  attachRowEvents();
}

function attachRowEvents(){
  tbody.querySelectorAll('.edit').forEach(btn=>btn.addEventListener('click',onEdit));
  tbody.querySelectorAll('.del').forEach(btn=>btn.addEventListener('click',onDelete));
}

// ===== Add/Edit =====
btnAddNew.addEventListener('click',()=>{editId=null; modalTitle.textContent='Add Component'; form.reset(); modal.style.display='block';});
btnCancelModal.addEventListener('click',()=>modal.style.display='none');

form.addEventListener('submit',async e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.freq = numOrNull(data.freq);
  data.smu = numOrNull(data.smu);
  data.rating = numOrNull(data.rating);
  let pictureUrl = null;

  const fileInput = form.querySelector('input[name=picture]');
  const file = fileInput.files?.[0];
  if(file && editId){
    const r = ref(storage, `pictures/${editId}/${file.name}`);
    await uploadBytes(r,file);
    pictureUrl = await getDownloadURL(r);
  } else if(file && !editId){
    const tempId = Date.now().toString();
    const r = ref(storage, `pictures/${tempId}/${file.name}`);
    await uploadBytes(r,file);
    pictureUrl = await getDownloadURL(r);
  }

  if(editId){
    if(pictureUrl) data.pictureUrl = pictureUrl;
    await updateDoc(doc(db,'components',editId),data);
  } else {
    if(pictureUrl) data.pictureUrl = pictureUrl;
    data.createdAt = Date.now();
    await addDoc(col,data);
  }
  modal.style.display='none';
});

// ===== Edit/Delete Rows =====
function onEdit(e){
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  editId = id;
  const r = allDocs.find(d=>d.id===id);
  modalTitle.textContent='Edit Component';
  form.equip.value = r.equip||'';
  form.model.value = r.model||'';
  form.component.value = r.component||'';
  form.freq.value = r.freq||'';
  form.changeOut.value = r.changeOut||'';
  form.smu.value = r.smu||'';
  form.rating.value = r.rating||'';
  form.remarks.value = r.remarks||'';
  modal.style.display='block';
}

async function onDelete(e){
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  if(confirm('Hapus baris ini?')) await updateDoc(doc(db,'components',id),{deleted:true});
}

// ===== Filters =====
btnApplyFilter.addEventListener('click',renderAll);
btnClearFilter.addEventListener('click',()=>{filterEquip.value='';filterModel.value='';filterComponent.value='';renderAll();});

// ===== Bulk SMU Update =====
const previewBtn = document.getElementById('btnPreviewBulk');
const applyBtn = document.getElementById('btnApplyBulk');
const bulkTA = document.getElementById('smuBulk');
const bulkResult = document.getElementById('bulkResult');

previewBtn.addEventListener('click',()=>{
  const rows=parseBulk();
  bulkResult.innerText=`Preview: ${rows.length} baris akan di-update.`;
});

applyBtn.addEventListener('click',async ()=>{
  const rows=parseBulk();
  if(!rows.length) return alert('Input kosong / format salah');
  let updated = 0;
  for(const {equip,smu} of rows){
    const snap = await getDocs(query(col));
    const targets = snap.docs.filter(d=>(d.data().equip||'').trim()===equip);
    for(const d of targets){await updateDoc(doc(db,'components',d.id),{smu}); updated++;}
  }
  bulkResult.innerText=`Selesai: ${updated} baris ter-update.`;
  bulkTA.value='';
});

function parseBulk(){
  return bulkTA.value.split(/\n+/).map(l=>l.trim()).filter(Boolean).map(l=>l.split(',').map(s=>s.trim())).filter(p=>p.length===2&&!isNaN(Number(p[1]))).map(([equip,smu])=>({equip,smu:Number(smu)}));
}
