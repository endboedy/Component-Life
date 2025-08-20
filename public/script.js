// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔹 Ganti config sesuai project Firebase-mu
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load Data
async function loadData() {
  const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ""; // bersihkan isi tabel

  try {
    const snapshot = await getDocs(collection(db, "components"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td>${data.equip || ""}</td>
        <td>${data.model || ""}</td>
        <td>${data.component || ""}</td>
        <td>${data.freq || ""}</td>
        <td>${data.cost || ""}</td>
        <td>${data.changeOut || ""}</td>
        <td>${data.nextChange || ""}</td>
        <td>${data.currentSMU || ""}</td>
        <td>${data.life || ""}</td>
        <td>${data.lifePct ? data.lifePct + "%" : ""}</td>
        <td>${data.rating || ""}</td>
        <td>${data.remarks || ""}</td>
        <td>${data.foto ? <img src="${data.foto}" width="50"> : ""}</td>
        <td>
          <span class="action-btn" onclick="deleteRow('${docSnap.id}')">Delete</span>
        </td>
      `;
    });
  } catch (err) {
    console.error("Error load data:", err);
  }
}

// Delete Row
window.deleteRow = async function(id) {
  if (confirm("Yakin mau hapus data ini?")) {
    await deleteDoc(doc(db, "components", id));
    loadData();
  }
};

// Open & Close Modal
window.openForm = function() {
  document.getElementById("myModal").style.display = "block";
}
window.closeForm = function() {
  document.getElementById("myModal").style.display = "none";
  document.getElementById("addForm").reset();
}

// Add New Data
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "components"), {
      equip: document.getElementById("equip").value,
      model: document.getElementById("model").value,
      component: document.getElementById("component").value,
      freq: document.getElementById("freq").value,
      cost: parseFloat(document.getElementById("cost").value) || 0,
      changeOut: document.getElementById("changeOut").value,
      nextChange: document.getElementById("nextChange").value,
      currentSMU: parseInt(document.getElementById("currentSMU").value) || 0,
      life: parseInt(document.getElementById("life").value) || 0,
      lifePct: parseInt(document.getElementById("lifePct").value) || 0,
      rating: document.getElementById("rating").value,
      remarks: document.getElementById("remarks").value,
      foto: document.getElementById("foto").value
    });
    closeForm();
    loadData();
  } catch (err) {
    console.error("Error add data:", err);
  }
});

// Initial Load
loadData();
