// =========================
// Firebase Config & Init
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHQFyRifcuYJYGuiQaK9vvWJpYGfoDdmI",
  authDomain: "component-life.firebaseapp.com",
  projectId: "component-life",
  storageBucket: "component-life.appspot.com",
  messagingSenderId: "401190574281",
  appId: "1:401190574281:web:16c2401b5bda146779d518",
  measurementId: "G-77WF4LVS25"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================
// UI Elements
// =========================
const menuCompLife = document.getElementById("menu-comp-life");
const menuUpdateSMU = document.getElementById("menu-update-smu");

const compLifeSection = document.getElementById("comp-life-section");
const updateSMUSection = document.getElementById("update-smu-section");

const addNewBtn = document.getElementById("add-new");
const componentBody = document.getElementById("component-body");
const smuBody = document.getElementById("smu-body");
const saveSMUBtn = document.getElementById("save-smu");

// =========================
// Navigation
// =========================
menuCompLife.addEventListener("click", () => {
  compLifeSection.style.display = "block";
  updateSMUSection.style.display = "none";
  loadComponents();
});

menuUpdateSMU.addEventListener("click", () => {
  compLifeSection.style.display = "none";
  updateSMUSection.style.display = "block";
  loadSMUTable();
});

// =========================
// Load Component Life
// =========================
async function loadComponents() {
  componentBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "components"));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    componentBody.innerHTML += `
      <tr>
        <td>${data.equipment || ""}</td>
        <td>${data.model || ""}</td>
        <td>${data.component || ""}</td>
        <td>${data.freq || ""}</td>
        <td>${data.cost || ""}</td>
        <td>${data.changeOut || ""}</td>
        <td>${data.rating || ""}</td>
        <td>${data.remarks || ""}</td>
        <td>${data.file || ""}</td>
        <td>${data.currentSMU || 0}</td>
        <td>${data.nextChange || ""}</td>
        <td>${data.life || ""}</td>
        <td>${data.lifePercent || ""}</td>
        <td><button onclick="editComponent('${docSnap.id}')">Edit</button></td>
      </tr>
    `;
  });
}

// =========================
// Add New Component
// =========================
addNewBtn.addEventListener("click", async () => {
  const equipment = prompt("Equipment ID:");
  const model = prompt("Model:");
  const component = prompt("Component:");
  if (!equipment || !model || !component) return;

  await addDoc(collection(db, "components"), {
    equipment,
    model,
    component,
    currentSMU: 0
  });
  loadComponents();
});

// =========================
// Edit Component
// =========================
window.editComponent = async function (id) {
  const ref = doc(db, "components", id);
  const newSMU = prompt("Update Current SMU:");
  if (!newSMU) return;
  await updateDoc(ref, { currentSMU: parseInt(newSMU) });
  loadComponents();
};

// =========================
// Load SMU Table
// =========================
async function loadSMUTable() {
  smuBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "components"));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    smuBody.innerHTML += `
      <tr>
        <td>${data.equipment}</td>
        <td><input type="number" value="${data.currentSMU || 0}" data-id="${docSnap.id}" /></td>
      </tr>
    `;
  });
}

// =========================
// Save SMU Updates
// =========================
saveSMUBtn.addEventListener("click", async () => {
  const inputs = smuBody.querySelectorAll("input");
  for (let input of inputs) {
    const id = input.getAttribute("data-id");
    const ref = doc(db, "components", id);
    await updateDoc(ref, { currentSMU: parseInt(input.value) });
  }
  loadComponents();
  alert("SMU updates saved!");
});

// =========================
// Load awal
// =========================
loadComponents();
