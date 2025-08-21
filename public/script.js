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
  measurementId: "G-77WF4LVS25",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase terhubung");
console.log("🔍 Project ID:", firebaseConfig.projectId);

// =========================
// DOM Ready Wrapper
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // Ambil elemen menu & section
  const menuCompLife = document.getElementById("menu-comp-life");
  const menuUpdateSMU = document.getElementById("menu-update-smu");
  const compLifeSection = document.getElementById("comp-life-section");
  const updateSMUSection = document.getElementById("update-smu-section");
  const addNewButton = document.getElementById("add-new");
  const componentBody = document.getElementById("component-body");
  const smuBody = document.getElementById("smu-body");
  const saveSMUButton = document.getElementById("save-smu");

  // =========================
  // Fungsi Load Component Life
  // =========================
  async function loadComponents() {
    try {
      const querySnapshot = await getDocs(collection(db, "components"));
      componentBody.innerHTML = "";

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${data.equipment || ""}</td>
          <td>${data.model || ""}</td>
          <td>${data.component || ""}</td>
          <td>${data.smu || 0}</td>
          <td>${data.life || 0}</td>
          <td>${data.remaining || 0}</td>
          <td>${data.lifePercent || 0}%</td>
          <td><img src="${data.file || ""}" width="50"></td>
          <td><button class="edit-btn" data-id="${docSnap.id}">Edit</button></td>
        `;

        componentBody.appendChild(row);
      });

      // Event listener untuk Edit button
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          window.editComponent(id);
        });
      });
    } catch (err) {
      console.error("❌ Error loadComponents:", err);
    }
  }

  // =========================
  // Fungsi Load SMU Table
  // =========================
  async function loadSMUTable() {
    try {
      const querySnapshot = await getDocs(collection(db, "components"));
      smuBody.innerHTML = "";

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${data.equipment || ""}</td>
          <td>${data.model || ""}</td>
          <td>${data.smu || 0}</td>
          <td><input type="number" id="smu-${docSnap.id}" value="${data.smu || 0}"></td>
        `;

        smuBody.appendChild(row);
      });
    } catch (err) {
      console.error("❌ Error loadSMUTable:", err);
    }
  }

  // =========================
  // Fungsi Edit Component
  // =========================
  window.editComponent = async function (id) {
    try {
      const newSMU = prompt("Masukkan SMU baru:");
      if (!newSMU) return;

      await updateDoc(doc(db, "components", id), {
        smu: parseInt(newSMU),
      });

      alert("✅ SMU berhasil diperbarui!");
      loadComponents();
    } catch (err) {
      console.error("❌ Error editComponent:", err);
    }
  };

  // =========================
  // Event Listeners Aman
  // =========================
  if (menuCompLife) {
    menuCompLife.addEventListener("click", () => {
      compLifeSection.style.display = "block";
      updateSMUSection.style.display = "none";
      loadComponents();
    });
  }

  if (menuUpdateSMU) {
    menuUpdateSMU.addEventListener("click", () => {
      compLifeSection.style.display = "none";
      updateSMUSection.style.display = "block";
      loadSMUTable();
    });
  }

  if (addNewButton) {
    addNewButton.addEventListener("click", async () => {
      try {
        await addDoc(collection(db, "components"), {
          equipment: "New Equipment",
          model: "Model X",
          component: "Engine",
          smu: 0,
          life: 10000,
          remaining: 10000,
          lifePercent: 100,
          file: "",
        });

        alert("✅ Data baru berhasil ditambahkan!");
        loadComponents();
      } catch (err) {
        console.error("❌ Error addNew:", err);
      }
    });
  }

  if (saveSMUButton) {
    saveSMUButton.addEventListener("click", async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "components"));

        for (const docSnap of querySnapshot.docs) {
          const input = document.getElementById(`smu-${docSnap.id}`);
          if (input) {
            await updateDoc(doc(db, "components", docSnap.id), {
              smu: parseInt(input.value),
            });
          }
        }

        alert("✅ Semua SMU berhasil diperbarui!");
        loadSMUTable();
      } catch (err) {
        console.error("❌ Error saveSMU:", err);
      }
    });
  }

  // =========================
  // Load Awal (Component Life)
  // =========================
  loadComponents();
});
