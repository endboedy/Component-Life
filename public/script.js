// =========================
// Firebase Config & Init
// =========================
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Konfigurasi Firebase (ISI sesuai project Firebase kamu)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("✅ Firebase terhubung");
console.log("🔍 Project ID:", firebaseConfig.projectId);

// =========================
// Global
// =========================
const tableBody = document.getElementById("component-body");
const collRef = collection(db, "componentLife");

// =========================
// Load Data
// =========================
async function loadData() {
  try {
    tableBody.innerHTML = "";
    const querySnapshot = await getDocs(collRef);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      // Hitung rumus (misalnya life & lifePercent)
      const life = (data.changeOut || 0) - (data.currentSMU || 0);
      const lifePercent = data.changeOut ? ((data.currentSMU / data.changeOut) * 100).toFixed(1) : 0;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td contenteditable="true" data-field="equipment">${data.equipment || ""}</td>
        <td contenteditable="true" data-field="component">${data.component || ""}</td>
        <td contenteditable="true" data-field="currentSMU">${data.currentSMU || ""}</td>
        <td contenteditable="true" data-field="changeOut">${data.changeOut || ""}</td>
        <td>${life}</td>
        <td>${lifePercent}%</td>
        <td>
          <button class="save-btn" data-id="${id}">💾 Save</button>
          <button class="delete-btn" data-id="${id}">🗑️ Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    addRowActions();
  } catch (err) {
    console.error("❌ Error load data:", err);
  }
}

// =========================
// Add New
// =========================
document.getElementById("addNewBtn").addEventListener("click", async () => {
  try {
    const newData = {
      equipment: "New Unit",
      component: "New Component",
      currentSMU: 0,
      changeOut: 0
    };
    await addDoc(collRef, newData);
    console.log("✅ Data baru ditambahkan");
    loadData();
  } catch (err) {
    console.error("❌ Error add new:", err);
  }
});

// =========================
// Save (Update)
// =========================
async function saveData(id, row) {
  const cells = row.querySelectorAll("[contenteditable=true]");
  const updatedData = {};

  cells.forEach((cell) => {
    const field = cell.getAttribute("data-field");
    let value = cell.innerText.trim();
    if (field === "currentSMU" || field === "changeOut") value = parseFloat(value) || 0;
    updatedData[field] = value;
  });

  try {
    await updateDoc(doc(db, "componentLife", id), updatedData);
    console.log("✅ Data berhasil diupdate:", id);
    loadData();
  } catch (err) {
    console.error("❌ Error update:", err);
  }
}

// =========================
// Delete
// =========================
async function deleteData(id) {
  try {
    await deleteDoc(doc(db, "componentLife", id));
    console.log("✅ Data terhapus:", id);
    loadData();
  } catch (err) {
    console.error("❌ Error delete:", err);
  }
}

// =========================
// Tambah Action Buttons
// =========================
function addRowActions() {
  document.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const row = btn.closest("tr");
      saveData(id, row);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      deleteData(id);
    });
  });
}

// =========================
// Filter
// =========================
document.getElementById("filterInput").addEventListener("keyup", () => {
  const filterValue = document.getElementById("filterInput").value.toLowerCase();
  const rows = tableBody.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i].getElementsByTagName("td")[0];
    if (firstCell) {
      const textValue = firstCell.textContent || firstCell.innerText;
      rows[i].style.display = textValue.toLowerCase().indexOf(filterValue) > -1 ? "" : "none";
    }
  }
});

// =========================
// Init
// =========================
loadData();
