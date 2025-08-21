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

// =========================
// DOM Elements
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("dataForm");
  const componentBody = document.getElementById("component-body"); // revisi: dataList → component-body

  if (!form) {
    console.error("❌ Form dengan ID 'dataForm' tidak ditemukan di HTML.");
    return;
  }
  if (!componentBody) {
    console.error("❌ Element dengan ID 'component-body' tidak ditemukan di HTML.");
    return;
  }

  // =========================
  // Load Data dari Firestore
  // =========================
  async function loadData() {
    try {
      componentBody.innerHTML = "<tr><td colspan='14'>Loading data...</td></tr>";
      const querySnapshot = await getDocs(collection(db, "components"));
      componentBody.innerHTML = "";

      if (querySnapshot.empty) {
        componentBody.innerHTML = "<tr><td colspan='14'>Tidak ada data ditemukan</td></tr>";
      }

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${docSnap.id}</td>
          <td>${data.name || ""}</td>
          <td>${data.model || ""}</td>
          <td>${data.component || ""}</td>
          <td>${data.freq || ""}</td>
          <td>${data.cost || ""}</td>
          <td>${data.changeOut || ""}</td>
          <td>${data.rating || ""}</td>
          <td>${data.remarks || ""}</td>
          <td><a href="${data.picture || "#"}" target="_blank">View</a></td>
          <td>${data.current_smu || ""}</td>
          <td>${data.nextChange || ""}</td>
          <td>${data.life || ""}</td>
          <td>${data.lifePercent || ""}</td>
        `;

        componentBody.appendChild(tr);
      });
    } catch (error) {
      console.error("🔥 Error load data:", error);
      componentBody.innerHTML = `<tr><td colspan='14' style="color:red;">Error load data: ${error.message}</td></tr>`;
    }
  }

  // =========================
  // Submit Form → Tambah Data
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.name?.value.trim();
    const model = form.model?.value.trim();
    const component = form.component?.value.trim();
    const freq = form.freq?.value.trim();
    const cost = form.cost?.value.trim();
    const changeOut = form.changeout?.value.trim();
    const rating = form.rating?.value.trim();
    const remarks = form.remarks?.value.trim();
    const picture = form.picture?.value.trim();
    const current_smu = form.current_smu?.value.trim();

    if (!name || !component) {
      alert("⚠️ Harap isi minimal Name dan Component!");
      return;
    }

    try {
      const nextChange = current_smu && freq ? Number(current_smu) + Number(freq) : "";
      const lifePercent = current_smu && nextChange ? ((Number(current_smu)/nextChange)*100).toFixed(1) : "";

      await addDoc(collection(db, "components"), {
        name,
        model,
        component,
        freq: Number(freq) || "",
        cost: Number(cost) || "",
        changeOut,
        rating,
        remarks,
        picture,
        current_smu: Number(current_smu) || "",
        nextChange,
        life: nextChange - (Number(current_smu) || 0),
        lifePercent,
        createdAt: new Date().toISOString(),
      });

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
