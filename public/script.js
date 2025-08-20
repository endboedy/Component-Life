// =========================
// FINAL script.js
// =========================

// Import Firebase SDK (dari CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAHQFyRifcuYJYGuiQaK9vvWJpYGfoDdmI",
  authDomain: "component-life.firebaseapp.com",
  projectId: "component-life",
  storageBucket: "component-life.appspot.com",
  messagingSenderId: "401190574281",
  appId: "1:401190574281:web:16c2401b5bda146779d518",
  measurementId: "G-77WF4LVS25"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase berhasil terhubung ✅");

// =========================
// Ambil Data & Render Tabel
// =========================
async function loadData() {
  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "components"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td contenteditable="true" data-field="equipment">${data.equipment || ""}</td>
      <td contenteditable="true" data-field="current_smu">${data.current_smu || ""}</td>
      <td contenteditable="true" data-field="life">${data.life || ""}</td>
      <td contenteditable="true" data-field="rating">${data.rating || ""}</td>
      <td contenteditable="true" data-field="remarks">${data.remarks || ""}</td>
      <td>
        ${data.pictureUrl ? `<img src="${data.pictureUrl}" width="50" />` : ""}
      </td>
      <td>
        <button class="save-btn" data-id="${docSnap.id}">💾 Save</button>
      </td>
    `;

    // Pewarnaan otomatis
    if (parseInt(data.current_smu) > parseInt(data.life)) {
      row.style.backgroundColor = "#ffcccc"; // merah kalau over
    } else {
      row.style.backgroundColor = "#ccffcc"; // hijau kalau masih aman
    }

    tableBody.appendChild(row);
  });

  // Tambahkan listener ke tombol Save
  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const row = e.target.closest("tr");
      const updatedData = {};

      row.querySelectorAll("[data-field]").forEach(cell => {
        updatedData[cell.dataset.field] = cell.innerText.trim();
      });

      await updateDoc(doc(db, "components", id), updatedData);
      alert("Data berhasil diupdate ✅");
      loadData(); // refresh
    });
  });
}

// =========================
// Add Data Baru
// =========================
document.querySelector("#add-new").addEventListener("click", async () => {
  const newRow = {
    equipment: "NEW",
    model: "-",
    component: "-",
    freq: 0,
    cost: 0,
    change_out: "-",
    rating: "-",
    remarks: "-",
    pictureUrl: "",
    current_smu: 0,
    next_change: "-",
    life: 0,
    life_percent: 0
  };
  await addDoc(collection(db, "components"), newRow);
  loadData();
});

// =========================
// Upload Gambar (contoh input file #upload)
// =========================
document.querySelector("#upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const storageRef = ref(storage, "images/" + file.name);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  alert("Upload berhasil ✅ URL: " + url);
});

// =========================
// Filter Data (contoh input #filter-input)
// =========================
document.querySelector("#filter-input").addEventListener("input", async (e) => {
  const filter = e.target.value.toLowerCase();
  const tableBody = document.querySelector("#data-table tbody");

  for (const row of tableBody.rows) {
    const equipment = row.querySelector("[data-field='equipment']").innerText.toLowerCase();
    row.style.display = equipment.includes(filter) ? "" : "none";
  }
});

// =========================
// Start Render
// =========================
loadData();



