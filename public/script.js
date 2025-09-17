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

// 🔹 Helper format angka ribuan
function formatNumber(value) {
  if (value === undefined || value === null || value === "") return "";
  return Number(value).toLocaleString("id-ID");
}

// 🔹 Helper format persen
function formatPercent(value) {
  if (value === undefined || value === null || value === "") return "";
  return `${Number(value).toFixed(0)} %`;
}

// 🔹 Load Data
async function loadData() {
  const body = document.getElementById("component-body");
  if (!body) return;

  body.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "componentLife"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.equipment ?? ""}</td>
        <td>${data.model ?? ""}</td>
        <td>${data.component ?? ""}</td>
        <td class="num-cell">${formatNumber(data.freq)}</td>
        <td class="num-cell">${formatNumber(data.cost)}</td>
        <td class="num-cell">${formatNumber(data.changeOut)}</td>
        <td class="num-cell">${formatNumber(data.currentSMU)}</td>
        <td class="num-cell">${formatNumber(data.nextChange)}</td>
        <td class="num-cell">${formatNumber(data.life)}</td>
        <td class="percent">${formatPercent(data.lifePercent)}</td>
        <td>${data.rating ?? ""}</td>
        <td>${data.remarks ?? ""}</td>
        <td>
          <button class="delete-btn" data-id="${docSnap.id}" title="Hapus Data">❌</button>
        </td>
      `;
      // Pastikan rata kanan
      row.querySelectorAll(".num-cell, .percent").forEach(td => td.style.textAlign = "right");

      body.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal ambil data ❌", err);
    alert("Koneksi Firestore gagal. Cek jaringan atau konfigurasi.");
  }
}

// 🔹 Tambah Data
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
      freq: 0,
      cost: 0,
      changeOut: 0,
      rating: "",
      remarks: "",
      currentSMU: 0,
      nextChange: 0,
      life: 0,
      lifePercent: 0
    });
    alert("Data berhasil ditambahkan ✅");
    await loadData();
  } catch (err) {
    console.error("Gagal tambah data ❌", err);
  }
});

// 🔹 Hapus Data
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    if (confirm("Yakin ingin hapus data ini?")) {
      try {
        await deleteDoc(doc(db, "componentLife", id));
        await loadData();
      } catch (err) {
        console.error("Gagal hapus data ❌", err);
      }
    }
  }
});

// 🔹 Upload Gambar (opsional)
document.querySelector("#upload")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar.");
    return;
  }

  try {
    const storageRef = ref(storage, "images/" + Date.now() + "-" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    alert("Upload berhasil ✅ URL: " + url);
  } catch (err) {
    console.error("Upload gagal ❌", err);
  }
});

// 🔹 Filter Data
document.querySelector("#filter-input")?.addEventListener("input", async (e) => {
  const keyword = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#component-body tr");
  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(keyword) ? "" : "none";
  });
});

// 🔹 Load saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});
