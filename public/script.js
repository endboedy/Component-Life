// =========================
// Firebase Config & Init
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

// Konfigurasi Firebase
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
const db = getFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});
const storage = getStorage(app);

console.log("Firebase berhasil terhubung ✅");

// =========================
// Load Data dari Firestore
// =========================
async function loadData() {
  const body = document.getElementById("component-body");
  if (!body) {
    console.error("❌ Element #component-body tidak ditemukan.");
    return;
  }

  body.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "componentLife"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.equipment || ""}</td>
        <td>${data.model || ""}</td>
        <td>${data.component || ""}</td>
        <td>${data.freq || ""}</td>
        <td>${data.cost || ""}</td>
        <td>${data.changeOut || ""}</td>
        <td>${data.rating || ""}</td>
        <td>${data.remarks || ""}</td>
        <td>${data.picture ? `<img src="${data.picture}" width="50"/>` : ""}</td>
        <td>${data.currentSMU || ""}</td>
        <td>${data.nextChange || ""}</td>
        <td>${data.life || ""}</td>
        <td>${data.lifePercent || ""}</td>
        <td><button class="delete-btn" data-id="${docSnap.id}">❌</button></td>
      `;
      body.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal ambil data ❌", err);
  }
}

// =========================
// Tambah Data Baru
// =========================
document.querySelector("#add-btn")?.addEventListener("click", async () => {
  const equipment = document.getElementById("equipment").value;
  const model = document.getElementById("model").value;
  const component = document.getElementById("component").value;

  if (!equipment || !model || !component) {
    alert("Mohon isi semua field wajib ❌");
    return;
  }

  try {
    await addDoc(collection(db, "componentLife"), {
      equipment,
      model,
      component,
      freq: "",
      cost: "",
      changeOut: "",
      rating: "",
      remarks: "",
      picture: "",
      currentSMU: "",
      nextChange: "",
      life: "",
      lifePercent: ""
    });
    alert("Data berhasil ditambahkan ✅");
    loadData();
  } catch (err) {
    console.error("Gagal tambah data ❌", err);
  }
});

// =========================
// Hapus Data
// =========================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    if (confirm("Yakin ingin hapus data ini?")) {
      await deleteDoc(doc(db, "componentLife", id));
      loadData();
    }
  }
});

// =========================
// Upload Gambar
// =========================
document.querySelector("#upload")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const storageRef = ref(storage, "images/" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    alert("Upload berhasil ✅ URL: " + url);
  } catch (err) {
    console.error("Upload gagal ❌", err);
  }
});

// =========================
// Filter Data
// =========================
document.querySelector("#filter-input")?.addEventListener("input", async (e) => {
  const keyword = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#component-body tr");
  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(keyword) ? "" : "none";
  });
});

// =========================
// Jalankan loadData setelah DOM siap
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});
