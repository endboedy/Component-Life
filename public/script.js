// --- Firebase Import ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// === Firebase Config (ganti sesuai project kamu) ===
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

// === DOM Element ===
const addNewBtn = document.getElementById("addNewBtn");
const formContainer = document.getElementById("formContainer");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const dataTable = document.getElementById("dataTable");

// tampilkan form
addNewBtn.addEventListener("click", () => {
  formContainer.classList.remove("hidden");
});

// cancel form
cancelBtn.addEventListener("click", () => {
  formContainer.classList.add("hidden");
});

// save data
saveBtn.addEventListener("click", async () => {
  let equip = document.getElementById("equip").value;
  let model = document.getElementById("model").value;
  let component = document.getElementById("component").value;
  let freq = parseInt(document.getElementById("freq").value) || 0;
  let cost = parseFloat(document.getElementById("cost").value) || 0;
  let changeOut = parseInt(document.getElementById("changeOut").value) || 0;
  let rating = document.getElementById("rating").value;
  let remarks = document.getElementById("remarks").value;
  let fotoFile = document.getElementById("foto").files[0];

  let currentSMU = 0; // default nanti di-update dari menu Current SMU
  let nextChange = changeOut + freq;
  let life = currentSMU - changeOut;
  let lifePercent = freq > 0 ? ((life / freq) * 100).toFixed(2) : 0;

  // simpan ke Firestore
  try {
    const docRef = await addDoc(collection(db, "component_life"), {
      equip, model, component, freq, cost, changeOut, 
      rating, remarks, fotoName: fotoFile ? fotoFile.name : "",
      currentSMU, nextChange, life, lifePercent
    });

    console.log("Data tersimpan dengan ID:", docRef.id);

    // tampilkan di tabel
    addRowToTable({ 
      id: docRef.id, equip, model, component, freq, cost, 
      changeOut, rating, remarks, fotoName: fotoFile ? fotoFile.name : "",
      currentSMU, nextChange, life, lifePercent 
    });

    // reset form
    formContainer.classList.add("hidden");
    document.querySelectorAll("#formContainer input, #formContainer select").forEach(el => el.value = "");

  } catch (e) {
    console.error("Error saat simpan:", e);
  }
});

// fungsi render row ke tabel
function addRowToTable(data) {
  let row = `
    <tr id="row-${data.id}">
      <td>${data.equip}</td>
      <td>${data.model}</td>
      <td>${data.component}</td>
      <td>${data.freq}</td>
      <td>${data.cost}</td>
      <td>${data.changeOut}</td>
      <td>${data.nextChange}</td>
      <td>${data.currentSMU}</td>
      <td>${data.life}</td>
      <td>${data.lifePercent}%</td>
      <td>${data.rating}</td>
      <td>${data.remarks}</td>
      <td>${data.fotoName}</td>
      <td>
        <button onclick="editRow('${data.id}')">Edit</button>
        <button onclick="deleteRow('${data.id}')">Delete</button>
      </td>
    </tr>
  `;
  dataTable.insertAdjacentHTML("beforeend", row);
}

// load data dari Firestore saat awal
async function loadData() {
  const querySnapshot = await getDocs(collection(db, "component_life"));
  querySnapshot.forEach((docSnap) => {
    addRowToTable({ id: docSnap.id, ...docSnap.data() });
  });
}
loadData();

// fungsi delete
window.deleteRow = async function(id) {
  if (confirm("Yakin hapus data ini?")) {
    await deleteDoc(doc(db, "component_life", id));
    document.getElementById(row-${id}).remove();
  }
};

// fungsi edit (basic, nanti bisa dikembangkan)
window.editRow = function(id) {
  alert("Edit fungsi untuk ID: " + id + " masih dalam pengembangan");
};
