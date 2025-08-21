// =========================
// Firebase Config & Init
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase terhubung");
console.log("🔍 Project ID:", firebaseConfig.projectId); // ✅ pakai firebaseConfig langsung

// =========================
// DOM References
// =========================
const compLifeSection = document.getElementById("comp-life-section");
const updateSmuSection = document.getElementById("update-smu-section");

const menuCompLife = document.getElementById("menu-comp-life");
const menuUpdateSmu = document.getElementById("menu-update-smu");

const addNewBtn = document.getElementById("add-new");
const saveSmuBtn = document.getElementById("save-smu");

const componentBody = document.getElementById("component-body");
const smuBody = document.getElementById("smu-body");

// =========================
// Menu Navigation
// =========================
if (menuCompLife) {
  menuCompLife.addEventListener("click", () => {
    compLifeSection.style.display = "block";
    updateSmuSection.style.display = "none";
    loadComponentLife();
  });
}

if (menuUpdateSmu) {
  menuUpdateSmu.addEventListener("click", () => {
    compLifeSection.style.display = "none";
    updateSmuSection.style.display = "block";
    loadUpdateSmu();
  });
}

// =========================
// Load Component Life (Menu 1)
// =========================
async function loadComponentLife() {
  componentBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "componentLife"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.Equipment || ""}</td>
      <td>${data.Model || ""}</td>
      <td>${data.Component || ""}</td>
      <td>${data.Freq || ""}</td>
      <td>${data.Cost || ""}</td>
      <td>${data.ChangeOut || ""}</td>
      <td>${data.Rating || ""}</td>
      <td>${data.Remarks || ""}</td>
      <td>${data.Picture || ""}</td>
      <td>${data.CurrentSMU || ""}</td>
      <td>${data.NextChange || ""}</td>
      <td>${data.Life || ""}</td>
      <td>${data.LifePercent || ""}</td>
      <td>
        <button class="edit-btn" data-id="${docSnap.id}">✏️ Edit</button>
        <button class="delete-btn" data-id="${docSnap.id}">🗑️ Delete</button>
      </td>
    `;

    componentBody.appendChild(tr);
  });

  attachActionButtons();
}

// =========================
// Add New Component
// =========================
if (addNewBtn) {
  addNewBtn.addEventListener("click", async () => {
    const newData = {
      Equipment: "NewEq",
      Model: "NewModel",
      Component: "NewComponent",
      Freq: 0,
      Cost: 0,
      ChangeOut: "",
      Rating: "",
      Remarks: "",
      Picture: "",
      CurrentSMU: 0,
      NextChange: 0,
      Life: 0,
      LifePercent: "0%",
    };
    await addDoc(collection(db, "componentLife"), newData);
    loadComponentLife();
  });
}

// =========================
// Edit & Delete
// =========================
function attachActionButtons() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const ref = doc(db, "componentLife", id);
      await updateDoc(ref, { Remarks: "Updated via UI" });
      loadComponentLife();
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await deleteDoc(doc(db, "componentLife", id));
      loadComponentLife();
    });
  });
}

// =========================
// Load Update SMU (Menu 2)
// =========================
async function loadUpdateSmu() {
  smuBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "componentLife"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.Equipment || ""}</td>
      <td><input type="number" value="${data.CurrentSMU || 0}" data-id="${docSnap.id}" class="smu-input"></td>
    `;

    smuBody.appendChild(tr);
  });
}

// =========================
// Save SMU Updates
// =========================
if (saveSmuBtn) {
  saveSmuBtn.addEventListener("click", async () => {
    const inputs = document.querySelectorAll(".smu-input");
    for (let input of inputs) {
      const id = input.dataset.id;
      const value = parseInt(input.value);
      await updateDoc(doc(db, "componentLife", id), { CurrentSMU: value });
    }
    loadUpdateSmu();
  });
}

// =========================
// Default load Menu 1
// =========================
loadComponentLife();

