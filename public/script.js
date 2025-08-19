// ===== Tabs =====
const tabs = document.querySelectorAll('.tab-btn');
const pages = document.querySelectorAll('.tab-page');
tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b => b.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

// ===== Firebase SDK =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, 
  doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// TODO: ganti sesuai Firebase config kamu
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

// ===== DOM refs =====
const tbody = document.getElementById('compTbody');
const filterEquip = document.getElementById('filterEquip');
const filterModel = document.getElementById('filterModel');
const filterComponent = document.getElementById('filterComponent');
const btnApplyFilter = document.getElementById('btnApplyFilter');
const btnClearFilter = document.getElementById('btnClearFilter');

const addInputs = {
  equip: document.getElementById('addEquip'),
  model: document.getElementById('addModel'),
  component: document.getElementById('addComponent'),
  freq: document.getElementById('addFreq'),
  cost: document.getElementById('addCost'),
  changeOut: document.getElementById('addChangeOut'),
  nextChange: document.getElementById('addNextChange'),
  smu: document.getElementById('addSMU'),
  life: document.getElementById('addLife'),
  pct: document.getElementById('addPct'),
  rating: document.getElementById('addRating'),
  remarks: document.getElementById('addRemarks'),
  picture: document.getElementById('addPicture'),
};

document.getElementById('btnAdd').addEventListener('click', addNewRow);
btnApplyFilter.addEventListener('click', renderAll);
btnClearFilter.addEventListener('click', () => {
  filterEquip.value = '';
  filterModel.value = '';
  filterComponent.value = '';
  renderAll();
});

// ===== Helpers =====
const fmt = new Intl.NumberFormat('en-US');
const fmtMoney = v => v ? `$${fmt.format(Number(v))}` : '-';
const pctBadge = (pct) => {
  if (pct == null || isNaN(pct)) return '<span class="badge">-</span>';
  const p = Number(pct);
  if (p < 60) return `<span class="badge ok">${p}%</span>`;
  if (p < 85) return `<span class="badge warn">${p}%</span>`;
  return `<span class="badge danger">${p}%</span>`;
};

function computePercent({ smu, life, pct }) {
  if (pct !== '' && pct != null) return Number(pct);
  if (!life || !smu) return null;
  const p = Math.round((Number(smu) / Number(life)) * 100);
  return isFinite(p) ? p : null;
}
function numOrNull(v){
  const n = Number(v);
  return isNaN(n) || v === '' ? null : n;
}
function esc(s){ 
  return String(s).replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;'); 
}

// ===== Data cache =====
let allDocs = [];
const col = collection(db, 'components');

onSnapshot(query(col, orderBy('equip')), (snap) => {
  allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  populateFilterOptions(allDocs);
  renderAll();
});

function populateFilterOptions(rows){
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const equips = uniq(rows.map(r => r.equip));
  const models = uniq(rows.map(r => r.model));
  const comps  = uniq(rows.map(r => r.component));

  [filterEquip, filterModel, filterComponent].forEach(sel => sel.length = 1);
  equips.forEach(v => filterEquip.insertAdjacentHTML('beforeend', `<option>${v}</option>`));
  models.forEach(v => filterModel.insertAdjacentHTML('beforeend', `<option>${v}</option>`));
  comps.forEach(v => filterComponent.insertAdjacentHTML('beforeend', `<option>${v}</option>`));
}

function applyClientFilter(rows){
  const e = filterEquip.value; const m = filterModel.value; const c = filterComponent.value;
  return rows.filter(r => (!e || r.equip === e) && (!m || r.model === m) && (!c || r.component === c));
}

function renderAll(){
  const rows = applyClientFilter(allDocs);
  tbody.innerHTML = rows.map(rowToHtml).join('');
  attachRowEvents();
}

function rowToHtml(r){
  const p = computePercent(r);
  const rating = r.rating ? '⭐'.repeat(Number(r.rating)) : '-';
  const pic = r.pictureUrl 
    ? `<a href="${r.pictureUrl}" target="_blank"><img class="thumb" src="${r.pictureUrl}" alt="pic"/></a>` 
    : '-';
  return `<tr data-id="${r.id}">
    <td>${r.equip ?? ''}</td>
    <td>${r.model ?? ''}</td>
    <td>${r.component ?? ''}</td>
    <td>${r.freq ?? ''}</td>
    <td>${fmtMoney(r.cost)}</td>
    <td>${r.changeOut ?? ''}</td>
    <td>${r.nextChange ?? ''}</td>
    <td>${r.smu ?? ''}</td>
    <td>${r.life ?? ''}</td>
    <td>${pctBadge(p)}</td>
    <td>${rating}</td>
    <td title="${esc(r.remarks ?? '')}">${(r.remarks || '').slice(0,18)}${(r.remarks||'').length>18?'…':''}</td>
    <td>${pic}</td>
    <td>
      <button class="action-btn edit">✏️ Edit</button>
      <button class="action-btn del">🗑️ Delete</button>
    </td>
  </tr>`;
}

function attachRowEvents(){
  tbody.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', onEdit));
  tbody.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', onDelete));
}

// ===== Add new row =====
async function addNewRow(){
  const payload = {
    equip: addInputs.equip.value.trim(),
    model: addInputs.model.value.trim(),
    component: addInputs.component.value.trim(),
    freq: numOrNull(addInputs.freq.value),
    cost: numOrNull(addInputs.cost.value),
    changeOut: addInputs.changeOut.value || null,
    nextChange: addInputs.nextChange.value || null,
    smu: numOrNull(addInputs.smu.value),
    life: numOrNull(addInputs.life.value),
    pct: numOrNull(addInputs.pct.value),
    rating: numOrNull(addInputs.rating.value),
    remarks: addInputs.remarks.value || null,
    pictureUrl: null,
    createdAt: Date.now(),
  };

  if(!payload.equip || !payload.component){
    alert('Equip & Component wajib diisi');
    return;
  }

  try {
    const docRef = await addDoc(col, payload);
    const file = addInputs.picture.files?.[0];
    if(file){
      const r = ref(storage, `pictures/${docRef.id}/${file.name}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      await updateDoc(doc(db, 'components', docRef.id), { pictureUrl: url });
    }
    Object.values(addInputs).forEach(i => { if(i?.value !== undefined) i.value = ''; if(i?.files) i.value = null; });
  } catch(err){
    console.error(err);
    alert("Gagal menambahkan data!");
  }
}

// ===== Edit/Delete =====
function onEdit(e){
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  const row = allDocs.find(d => d.id === id);
  if(!row) return;

  tr.innerHTML = `
    <td><input value="${esc(row.equip)}" data-k="equip"/></td>
    <td><input value="${esc(row.model||'')}" data-k="model"/></td>
    <td><input value="${esc(row.component||'')}" data-k="component"/></td>
    <td><input type="number" value="${row.freq ?? ''}" data-k="freq"/></td>
    <td><input type="number" step="0.01" value="${row.cost ?? ''}" data-k="cost"/></td>
    <td><input type="date" value="${row.changeOut ?? ''}" data-k="changeOut"/></td>
    <td><input type="date" value="${row.nextChange ?? ''}" data-k="nextChange"/></td>
    <td><input type="number" value="${row.smu ?? ''}" data-k="smu"/></td>
    <td><input type="number" value="${row.life ?? ''}" data-k="life"/></td>
    <td><input type="number" value="${computePercent(row) ?? ''}" data-k="pct"/></td>
    <td>
      <select data-k="rating">
        ${["","1","2","3","4","5"].map(v=>`<option ${String(row.rating||"")===v?"selected":""}>${v}</option>`).join("")}
      </select>
    </td>
    <td><input value="${esc(row.remarks||'')}" data-k="remarks"/></td>
    <td>
      ${row.pictureUrl ? `<a href="${row.pictureUrl}" target="_blank"><img class="thumb" src="${row.pictureUrl}"/></a>` : '-'}
      <label class="upload-btn"><input type="file" data-k="picture" accept="image/*"/>Change</label>
    </td>
    <td>
      <button class="action-btn save">✅ Save</button>
      <button class="action-btn cancel">↩️ Cancel</button>
    </td>`;

  tr.querySelector('.save').addEventListener('click', () => onSaveEdit(id, tr));
  tr.querySelector('.cancel').addEventListener('click', renderAll);
}

async function onSaveEdit(id, tr){
  const inputs = tr.querySelectorAll('[data-k]');
  const patch = {};
  let newFile = null;
  inputs.forEach(el => {
    const k = el.dataset.k;
    if(k === 'picture') { newFile = el.files?.[0] || null; return; }
    let v = el.value;
    if(['freq','cost','smu','life','pct','rating'].includes(k)) v = numOrNull(v);
    if(v === '') v = null;
    patch[k] = v;
  });

  try {
    if(newFile){
      const r = ref(storage, `pictures/${id}/${newFile.name}`);
      await uploadBytes(r, newFile);
      patch.pictureUrl = await getDownloadURL(r);
    }
    await updateDoc(doc(db, 'components', id), patch);
    renderAll();
  } catch(err){
    console.error(err);
    alert("Gagal menyimpan perubahan!");
  }
}

async function onDelete(e){
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  if(confirm('Hapus baris ini?')){
    await deleteDoc(doc(db, 'components', id));
  }
}

// ===== Bulk SMU =====
const previewBtn = document.getElementById('btnPreviewBulk');
const applyBtn = document.getElementById('btnApplyBulk');
const bulkTA = document.getElementById('smuBulk');
const bulkResult = document.getElementById('bulkResult');

previewBtn.addEventListener('click', () => {
  const rows = parseBulk();
  bulkResult.innerText = `Preview: ${rows.length} baris akan di-update.`;
});

applyBtn.addEventListener('click', async () => {
  const pairs = parseBulk();
  if(!pairs.length) return alert('Input kosong / format salah');
  try {
    const snap = await getDocs(col);
    let updated = 0;
    for (const {equip, smu} of pairs){
      const targets = snap.docs.filter(d => (d.data().equip || '').trim() === equip);
      for (const d of targets){
        await updateDoc(doc(db, 'components', d.id), { smu });
        updated++;
      }
    }
    bulkResult.innerText = `Selesai: ${updated} baris ter-update.`;
    bulkTA.value = '';
  } catch(err){
    console.error(err);
    alert("Bulk update gagal!");
  }
});

function parseBulk(){
  return bulkTA.value
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => l.split(',').map(s => s.trim()))
    .filter(parts => parts.length === 2 && !isNaN(Number(parts[1])))
    .map(([equip, smu]) => ({ equip, smu: Number(smu) }));
}
