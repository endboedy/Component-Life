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
  deleteDoc,
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
const menu1Btn = document.getElementById("menu1");
const menu2Btn = document.getElementById("menu2");
const content = document.getElementById("content");

// =========================
// Render Functions
// =========================
async function renderMenu1() {
  content.innerHTML = `
    <h2>📋 Equipment Data</h2>
    <button id="addNew">➕ Add New</button>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Equipment</th>
          <th>SMU Last PM</th>
          <th>Last PM Date</th>
          <th>Current SMU</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="equipmentTable"></tbody>
    </table>
  `;

  loadEquipment();

  document.getElementById("addNew").addEventListener("click", () => {
    renderAddForm();
  });
}

function renderAddForm() {
  content.innerHTML = `
    <h2>➕ Add New Equipment</h2>
    <form id="addForm">
      <label>Equipment:</label><br/>
      <input type="text" id="equipmentId" required/><br/>
      <label>SMU Last PM:</label><br/>
      <input type="number" id="smuLastPM" required/><br/>
      <label>Last PM Date:</label><br/>
      <input type="date" id="lastPMDate" required/><br/>
      <button type="submit">Save</button>
      <button type="button" id="cancelAdd">Cancel</button>
    </form>
  `;

  document.getElementById("cancelAdd").addEventListener("click", renderMenu1);

  document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newData = {
      equipmentId: document.getElementById("equipmentId").value,
      smuLastPM: parseInt(document.getElementById("smuLastPM").value),
      lastPMDate: document.getElementById("lastPMDate").value,
      currentSMU: 0
    };

    await addDoc(collection(db, "equipment"), newData);
    renderMenu1();
  });
}

async function loadEquipment() {
  const table = document.getElementById("equipmentTable");
  table.innerHTML = "";

  const snapshot = await getDocs(collection(db, "equipment"));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    table.innerHTML += `
      <tr>
        <td>${data.equipmentId}</td>
        <td>${data.smuLastPM}</td>
        <td>${data.lastPMDate}</td>
        <td>${data.currentSMU}</td>
        <td>
          <button onclick="editEquipment('${docSnap.id}')">Edit</button>
        </td>
      </tr>
    `;
  });
}

async function editEquipment(id) {
  const docRef = doc(db, "equipment", id);
  const docSnap = await getDocs(collection(db, "equipment"));
  let data;
  docSnap.forEach((d) => { if (d.id === id) data = d.data(); });

  content.innerHTML = `
    <h2>✏️ Edit Equipment</h2>
    <form id="editForm">
      <label>Equipment:</label><br/>
      <input type="text" id="equipmentId" value="${data.equipmentId}" disabled/><br/>
      <label>SMU Last PM:</label><br/>
      <input type="number" id="smuLastPM" value="${data.smuLastPM}" required/><br/>
      <label>Last PM Date:</label><br/>
      <input type="date" id="lastPMDate" value="${data.lastPMDate}" required/><br/>
      <label>Current SMU:</label><br/>
      <input type="number" id="currentSMU" value="${data.currentSMU}" required/><br/>
      <button type="submit">Save</button>
      <button type="button" id="cancelEdit">Cancel</button>
    </form>
  `;

  document.getElementById("cancelEdit").addEventListener("click", renderMenu1);

  document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateDoc(docRef, {
      smuLastPM: parseInt(document.getElementById("smuLastPM").value),
      lastPMDate: document.getElementById("lastPMDate").value,
      currentSMU: parseInt(document.getElementById("currentSMU").value)
    });
    renderMenu1();
  });
}

// =========================
// Menu 2: Update Current SMU
// =========================
async function renderMenu2() {
  content.innerHTML = `
    <h2>⚡ Update Current SMU</h2>
    <form id="updateForm">
      <label>Equipment:</label><br/>
      <input type="text" id="equipmentId" required/><br/>
      <label>New Current SMU:</label><br/>
      <input type="number" id="currentSMU" required/><br/>
      <button type="submit">Update</button>
    </form>
  `;

  document.getElementById("updateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const equipmentId = document.getElementById("equipmentId").value;
    const currentSMU = parseInt(document.getElementById("currentSMU").value);

    const snapshot = await getDocs(collection(db, "equipment"));
    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      if (data.equipmentId === equipmentId) {
        const ref = doc(db, "equipment", docSnap.id);
        await updateDoc(ref, { currentSMU });
      }
    });

    renderMenu1();
  });
}

// =========================
// Navigation
// =========================
menu1Btn.addEventListener("click", renderMenu1);
menu2Btn.addEventListener("click", renderMenu2);

// Load awal
renderMenu1();
