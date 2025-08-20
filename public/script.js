// --- Firebase Import ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// === Firebase Config (ganti dengan punyamu dari console Firebase) ===
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "YOUR_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Switch Menu ---
window.showPage = function(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
};

// --- Load Data from Firestore ---
async function loadData() {
  const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ""; // clear dulu

  const snapshot = await getDocs(collection(db, "components"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${data.equip}</td>
      <td>${data.model}</td>
      <td>${data.component}</td>
      <td>${data.freq}</td>
      <td>${data.cost}</td>
      <td>${data.changeOut}</td>
      <td>${data.nextChange}</td>
      <td class="current-smu">${data.currentSMU}</td>
      <td class="life">${data.life}</td>
      <td class="lifePct">${data.lifePct}%</td>
      <td>${data.rating}</td>
      <td>${data.remarks}</td>
      <td>${data.foto ? <img src="${data.foto}" width="50"> : ""}</td>
      <td>
        <span class="action-btn" onclick="deleteRow('${docSnap.id}')">Delete</span>
      </td>
    `;
  });
}
loadData();

// --- Add New Row ---
window.addRow = async function() {
  const equip = document.getElementById('equip').value;
  const model = document.getElementById('model').value;
  const component = document.getElementById('component').value;
  const freq = parseInt(document.getElementById('freq').value) || 0;
  const cost = parseFloat(document.getElementById('cost').value) || 0;
  const changeOut = parseInt(document.getElementById('changeOut').value) || 0;
  const rating = document.getElementById('rating').value;
  const remarks = document.getElementById('remarks').value;

  const nextChange = changeOut + freq;
  const currentSMU = 0;
  const life = currentSMU - changeOut;
  const lifePct = freq ? ((life / freq) * 100).toFixed(2) : 0;

  await addDoc(collection(db, "components"), {
    equip, model, component, freq, cost, changeOut,
    nextChange, currentSMU, life, lifePct, rating, remarks
  });

  alert("Data saved!");
  loadData();
};

// --- Update Current SMU ---
window.updateSMU = async function() {
  const equipKey = document.getElementById("updateEquip").value;
  const newSMU = parseInt(document.getElementById("updateSMUValue").value) || 0;

  const q = query(collection(db, "components"), where("equip", "==", equipKey));
  const snapshot = await getDocs(q);

  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const life = newSMU - data.changeOut;
    const lifePct = data.freq ? ((life / data.freq) * 100).toFixed(2) : 0;

    await updateDoc(doc(db, "components", docSnap.id), {
      currentSMU: newSMU,
      life: life,
      lifePct: lifePct
    });
  });

  alert("SMU updated!");
  loadData();
};

// --- Delete Row ---
window.deleteRow = async function(id) {
  await deleteDoc(doc(db, "components", id));
  alert("Data deleted!");
  loadData();
};
