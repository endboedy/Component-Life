import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// 🔥 Firebase Config (ganti sesuai project kamu)
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
const storage = getStorage(app);

const compTableBody = document.getElementById("compTableBody");

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function showAddNewForm() {
  document.getElementById("addNewForm").classList.remove("hidden");
}

function hideAddNewForm() {
  document.getElementById("addNewForm").classList.add("hidden");
}

// 🔄 Load Data
async function loadComponents() {
  compTableBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "components"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const nextChange = (parseInt(data.changeOut) || 0) + (parseInt(data.freq) || 0);
    const life = (parseInt(data.currentSMU) || 0) - (parseInt(data.changeOut) || 0);
    const lifePct = data.freq ? ((life / data.freq) * 100).toFixed(1) : 0;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.equipment}</td>
      <td>${data.component}</td>
      <td>${data.changeOut || 0}</td>
      <td>${data.freq || 0}</td>
      <td>${data.currentSMU || 0}</td>
      <td>${nextChange}</td>
      <td>${life}</td>
      <td>${lifePct}%</td>
      <td>${data.rating || ""}</td>
      <td>${data.remarks || ""}</td>
      <td>${data.pictureURL ? `<a href="${data.pictureURL}" target="_blank">View</a>` : ""}</td>
      <td><button onclick="editRow('${docSnap.id}')">Edit</button></td>
    `;

    // 🔴 Conditional formatting
    if (data.rating && data.rating.toUpperCase() === "X") tr.classList.add("red-bg");
    if (life > data.freq) tr.classList.add("red-bg");
    if (lifePct > 100) tr.classList.add("red-bg");

    compTableBody.appendChild(tr);
  });
}

// ➕ Add new
async function addNewComponent(e) {
  e.preventDefault();
  const file = document.getElementById("newPicture").files[0];
  let pictureURL = "";
  if (file) {
    const storageRef = ref(storage, "pictures/" + file.name);
    await uploadBytes(storageRef, file);
    pictureURL = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "components"), {
    equipment: document.getElementById("newEquipment").value,
    component: document.getElementById("newComponent").value,
    changeOut: parseInt(document.getElementById("newChangeOut").value),
    freq: parseInt(document.getElementById("newFreq").value),
    currentSMU: 0,
    rating: document.getElementById("newRating").value,
    remarks: document.getElementById("newRemarks").value,
    pictureURL
  });

  hideAddNewForm();
  loadComponents();
}

// ✏️ Edit row (simple alert for now)
function editRow(id) {
  alert("Edit & Save feature coming here. Row ID: " + id);
}

// 🛠 Update Current SMU (bulk)
async function updateCurrentSMU(e) {
  e.preventDefault();
  const lines = document.getElementById("bulkSMU").value.split("\n");
  for (const line of lines) {
    const [equipment, smu] = line.split(",");
    if (!equipment || !smu) continue;

    const querySnapshot = await getDocs(collection(db, "components"));
    querySnapshot.forEach(async docSnap => {
      if (docSnap.data().equipment === equipment.trim()) {
        await updateDoc(doc(db, "components", docSnap.id), {
          currentSMU: parseInt(smu.trim())
        });
      }
    });
  }
  loadComponents();
}

window.showSection = showSection;
window.showAddNewForm = showAddNewForm;
window.hideAddNewForm = hideAddNewForm;
window.addNewComponent = addNewComponent;
window.editRow = editRow;
window.updateCurrentSMU = updateCurrentSMU;

// Initial load
loadComponents();

