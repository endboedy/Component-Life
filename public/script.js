// ----- Firebase ESM imports (v12) -----
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, getDocs, query
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// 🔥 Firebase Config (punyamu)
const firebaseConfig = {
  apiKey: "AIzaSyAHQFyRifcuYJYGuiQaK9vvWJpYGfoDdmI",
  authDomain: "component-life.firebaseapp.com",
  projectId: "component-life",
  storageBucket: "component-life.appspot.com",
  messagingSenderId: "401190574281",
  appId: "1:401190574281:web:16c2401b5bda146779d518",
  measurementId: "G-77WF4LVS25"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Collections
const COL_LIFE = collection(db, "component_life"); // data baris komponen
const COL_SMU  = collection(db, "current_smu");    // map Equip -> SMU

// State
let rowsCache = [];        // [{id, data}]
const smuMap = new Map();  // Equip -> number

// Helper DOM
const $ = (sel) => document.querySelector(sel);

// Wait DOM ready
window.addEventListener("DOMContentLoaded", () => {
  // Menu switch
  $("#menu-comp-life")?.addEventListener("click", () => switchTab("life"));
  $("#menu-update-smu")?.addEventListener("click", () => switchTab("smu"));

  // Filters
  $("#filter-equipment")?.addEventListener("input", repaint);
  $("#filter-model")?.addEventListener("input", repaint);
  $("#filter-component")?.addEventListener("input", repaint);

  // Add New
  $("#add-new")?.addEventListener("click", openAddModal);

  // Save SMU mass update
  $("#save-smu")?.addEventListener("click", saveSMUMass);

  // Live listeners
  onSnapshot(COL_SMU, (snap) => {
    smuMap.clear();
    snap.forEach(d => smuMap.set(d.id, Number(d.data().value) || 0));
    renderSMUTable();
    repaint(); // recompute derived columns using latest SMU
  });

  onSnapshot(query(COL_LIFE), (snap) => {
    rowsCache = snap.docs.map(d => ({ id: d.id, data: d.data() }));
    repaint();
  });

  // default tab
  switchTab("life");
});

// ---------- TAB SWITCH ----------
function switchTab(which) {
  const isLife = which === "life";
  $("#comp-life-section").style.display = isLife ? "block" : "none";
  $("#update-smu-section").style.display = isLife ? "none" : "block";
  if (!isLife) renderSMUTable();
}

// ---------- DERIVED ----------
function computeDerived(row) {
  const current = smuMap.get(row.equip) || 0;
  const freq = Number(row.freq) || 0;
  const changeOut = Number(row.changeOut) || 0;
  const nextChange = changeOut + freq;
  const life = current - changeOut;
  const lifePercent = freq > 0 ? Number(((life / freq) * 100).toFixed(1)) : 0;
  return { current, nextChange, life, lifePercent };
}

// ---------- FILTER ----------
function applyFilters(list) {
  const fe = ($("#filter-equipment")?.value || "").toLowerCase();
  const fm = ($("#filter-model")?.value || "").toLowerCase();
  const fc = ($("#filter-component")?.value || "").toLowerCase();

  return list.filter(({ data }) =>
    (!fe || (data.equip || "").toLowerCase().includes(fe)) &&
    (!fm || (data.model || "").toLowerCase().includes(fm)) &&
    (!fc || (data.component || "").toLowerCase().includes(fc))
  );
}

// ---------- RENDER LIFE TABLE ----------
function repaint() {
  const tbody = $("#component-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const rows = applyFilters(rowsCache);

  rows.forEach(({ id, data }) => {
    const d = { ...data };
    const derived = computeDerived(d);

    const tr = document.createElement("tr");

    // helper to make editable cells
    const cell = (key, editable = false, valueOverride = null) => {
      const td = document.createElement("td");
      const value = valueOverride !== null ? valueOverride : (d[key] ?? "");
      if (editable) {
        td.innerHTML = `<input class="inline-input" data-key="${key}" value="${value}">`;
      } else {
        td.textContent = value;
      }
      td.dataset.key = key;
      return td;
    };

    // file cell
    const fileTd = document.createElement("td");
    if (d.fileURL) {
      const a = document.createElement("a");
      a.href = d.fileURL; a.target = "_blank"; a.textContent = "View";
      fileTd.appendChild(a);
    } else fileTd.textContent = "-";

    // action cell
    const act = document.createElement("td");
    const btnEdit = document.createElement("button");
    btnEdit.className = "edit"; btnEdit.textContent = "Edit";
    btnEdit.addEventListener("click", () => makeRowEditable(tr, d));

    const btnSave = document.createElement("button");
    btnSave.className = "save"; btnSave.textContent = "Save";
    btnSave.addEventListener("click", () => saveRow(tr, id));

    const btnDel = document.createElement("button");
    btnDel.className = "edit"; btnDel.style.background = "#e74c3c";
    btnDel.textContent = "Delete";
    btnDel.addEventListener("click", async () => {
      if (confirm("Hapus data ini?")) await deleteDoc(doc(db, "component_life", id));
    });

    act.append(btnEdit, btnSave, btnDel);

    // build row
    tr.append(
      cell("equip", true),
      cell("model", true),
      cell("component", true),
      cell("freq", true),
      cell("cost", true),
      cell("changeOut", true),
      cell("rating", true),
      cell("remarks", true),
      fileTd,
      cell("current", false, Number(derived.current) || 0),
      cell("nextChange", false, Number(derived.nextChange) || 0),
      cell("life", false, Number(derived.life) || 0),
      cell("lifePercent", false, `${Number(derived.lifePercent).toFixed(1)}%`),
      act
    );

    // conditional formatting (rating X, life>freq, life%>100)
    if ((d.rating || "").toString().toUpperCase() === "X") {
      tr.children[6].classList.add("red-alert"); // rating cell
    }
    if (derived.life > (Number(d.freq) || 0)) {
      tr.children[12].classList.add("red-alert"); // life cell
    }
    if (derived.lifePercent > 100) {
      tr.children[13].classList.add("red-alert"); // life% cell
    }

    tbody.appendChild(tr);
  });
}

function makeRowEditable(tr, snapshotData) {
  tr.querySelectorAll("td").forEach((td, i) => {
    const key = td.dataset.key;
    // Editable only certain keys
    const editableKeys = ["equip", "model", "component", "freq", "cost", "changeOut", "rating", "remarks"];
    if (editableKeys.includes(key)) {
      const currentVal = td.querySelector("input") ? td.querySelector("input").value : (snapshotData[key] ?? "");
      td.innerHTML = `<input class="inline-input" data-key="${key}" value="${currentVal}">`;
    }
  });
}

async function saveRow(tr, id) {
  const payload = {};
  tr.querySelectorAll("input.inline-input").forEach(inp => {
    const k = inp.dataset.key;
    let v = inp.value;
    if (["freq", "cost", "changeOut"].includes(k)) v = Number(v || 0);
    payload[k] = v;
  });

  // recompute derived based on possibly updated equip
  const recomputed = computeDerived({ ...payload, equip: payload.equip || tr.children[0].innerText });
  Object.assign(payload, recomputed);

  if (Object.keys(payload).length) {
    await updateDoc(doc(db, "component_life", id), payload);
  }
}

// ---------- ADD NEW (modal built via JS) ----------
function openAddModal() {
  // build modal only once
  if (!document.getElementById("add-modal")) {
    const wrap = document.createElement("div");
    wrap.id = "add-modal";
    wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000";
    wrap.innerHTML = `
      <div style="background:#fff;border-radius:12px;min-width:320px;max-width:560px;padding:16px 18px;box-shadow:0 20px 40px rgba(0,0,0,.2)">
        <h3 style="margin:0 0 10px">Add Component Life</h3>
        <form id="add-form" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <input placeholder="Equip" id="a-equip" required />
          <input placeholder="Model" id="a-model" required />
          <input placeholder="Component" id="a-component" class="full" />
          <input type="number" placeholder="Freq" id="a-freq" />
          <input type="number" placeholder="Cost" id="a-cost" />
          <input type="number" placeholder="Change Out" id="a-change" />
          <input placeholder="Rating" id="a-rating" />
          <input placeholder="Remarks" id="a-remarks" class="full" />
          <input type="file" id="a-file" accept=".jpg,.jpeg,.png,.pdf" class="full" />
          <div class="full" style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
            <button type="button" id="a-cancel">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(wrap);

    wrap.querySelector("#a-cancel").addEventListener("click", () => wrap.remove());
    wrap.addEventListener("click", (e) => { if (e.target.id === "add-modal") wrap.remove(); });

    wrap.querySelector("#add-form").addEventListener("submit", saveNewFromModal);
  }
}

async function saveNewFromModal(e) {
  e.preventDefault();
  const wrap = document.getElementById("add-modal");

  const equip = $("#a-equip").value.trim();
  const model = $("#a-model").value.trim();
  const component = $("#a-component").value.trim();
  const freq = Number($("#a-freq").value || 0);
  const cost = Number($("#a-cost").value || 0);
  const changeOut = Number($("#a-change").value || 0);
  const rating = $("#a-rating").value.trim();
  const remarks = $("#a-remarks").value.trim();
  const file = $("#a-file").files[0];

  let fileURL = null;
  let fileName = null;
  if (file) {
    const safe = `${equip || "GEN"}-${Date.now()}-${file.name}`;
    const r = ref(storage, `uploads/${safe}`);
    await uploadBytes(r, file);
    fileURL = await getDownloadURL(r);
    fileName = file.name;
  }

  const base = { equip, model, component, freq, cost, changeOut, rating, remarks };
  if (fileURL) Object.assign(base, { fileURL, fileName });

  // derived fields
  Object.assign(base, computeDerived(base));

  await addDoc(COL_LIFE, { ...base, createdAt: new Date() });

  wrap.remove();
}

// ---------- SMU TABLE (menu 2) ----------
function renderSMUTable() {
  const tbody = $("#smu-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  // gabungkan daftar equip dari component_life & current_smu
  const allEquip = new Set([
    ...rowsCache.map(r => (r.data.equip || "").trim()).filter(Boolean),
    ...Array.from(smuMap.keys())
  ]);

  // buat baris input SMU per equip
  [...allEquip].sort().forEach(eq => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${eq}</td>
      <td><input type="number" class="smu-input" data-eq="${eq}" value="${smuMap.get(eq) || 0}"></td>
    `;
    tbody.appendChild(tr);
  });

  // tambah baris kosong untuk entry baru
  const trNew = document.createElement("tr");
  trNew.innerHTML = `
    <td><input placeholder="New Equip" id="smu-new-eq"></td>
    <td><input type="number" id="smu-new-val" placeholder="SMU"></td>
  `;
  tbody.appendChild(trNew);
}

async function saveSMUMass() {
  // existing rows
  const inputs = document.querySelectorAll(".smu-input");
  for (const inp of inputs) {
    const equip = inp.dataset.eq;
    const value = Number(inp.value || 0);
    await setDoc(doc(db, "current_smu", equip), { value }); // upsert
  }
  // new row
  const newEq = ($("#smu-new-eq")?.value || "").trim();
  const newVal = Number($("#smu-new-val")?.value || 0);
  if (newEq) {
    await setDoc(doc(db, "current_smu", newEq), { value: newVal });
  }
  alert("SMU updated.");
}
