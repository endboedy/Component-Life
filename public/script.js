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

// Firebase Config (cek di Firebase Console -> Project Settings -> Config)
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

// =========================
// DOM Elements
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("dataForm");
  const dataList = document.getElementById("dataList");

  if (!form) {
    console.error("❌ Form dengan ID 'dataForm' tidak ditemukan di HTML.");
    return;
  }
  if (!dataList) {
    console.error("❌ Element dengan ID 'dataList' tidak ditemukan di HTML.");
    return;
  }

  // =========================
  // Load Data dari Firestore
  // =========================
  async function loadData() {
    try {
      dataList.innerHTML = "<li>Loading data...</li>";
      const querySnapshot = await getDocs(collection(db, "components"));
      dataList.innerHTML = "";
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const li = document.createElement("li");
        li.textContent = `${docSnap.id} → ${JSON.stringify(data)}`;
        dataList.appendChild(li);
      });
      if (querySnapshot.empty) {
        dataList.innerHTML = "<li>Tidak ada data ditemukan</li>";
      }
    } catch (error) {
      console.error("🔥 Error load data:", error);
      dataList.innerHTML = `<li style="color:red;">Error load data: ${error.message}</li>`;
    }
  }

  // =========================
  // Submit Form → Tambah Data
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.name?.value.trim();
    const life = form.life?.value.trim();

    if (!name || !life) {
      alert("⚠️ Harap isi semua field!");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "components"), {
        name: name,
        life: Number(life),
        createdAt: new Date().toISOString(),
      });
      console.log("✅ Data berhasil ditambahkan dengan ID:", docRef.id);
      form.reset();
      loadData();
    } catch (error) {
      console.error("🔥 Error tambah data:", error);
      alert("Gagal menambahkan data: " + error.message);
    }
  });

  // =========================
  // Initial Load
  // =========================
  loadData();
});
