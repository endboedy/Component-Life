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
    measurementId: "G-77WF4LVS25
  appId: "..."
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const compRef = collection(db, "components");
const smuRef = collection(db, "current_smu");

const tbody = document.querySelector("#compTable tbody");
const addNewBtn = document.getElementById("addNewBtn");
const modal = document.getElementById("modal");
const addForm = document.getElementById("addForm");
const closeModal = document.getElementById("closeModal");
const smuForm = document.getElementById("smuForm");
const smuList = document.getElementById("smuList");

// Tab switching
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(c=>c.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Modal open/close
addNewBtn.onclick = ()=> modal.classList.remove("hidden");
closeModal.onclick = ()=> modal.classList.add("hidden");

// Add new component
addForm.onsubmit = async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(addForm));
  let fileUrl = "";
  if(data.file && data.file.size > 0){
    const storageRef = ref(storage, "uploads/"+data.file.name);
    await uploadBytes(storageRef, data.file);
    fileUrl = await getDownloadURL(storageRef);
  }
  await addDoc(compRef, {
    equipment: data.equipment,
    model: data.model,
    component: data.component,
    freq: Number(data.freq),
    cost: Number(data.cost),
    changeOut: Number(data.changeOut),
    rating: data.rating || "",
    remarks: data.remarks || "",
    file: fileUrl
  });
  addForm.reset();
  modal.classList.add("hidden");
};

// Live table
onSnapshot(compRef, (snapshot)=>{
  tbody.innerHTML = "";
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td contenteditable>${d.equipment}</td>
      <td contenteditable>${d.model}</td>
      <td contenteditable>${d.component}</td>
      <td contenteditable>${d.freq}</td>
      <td contenteditable>${d.cost}</td>
      <td contenteditable>${d.changeOut}</td>
      <td contenteditable>${d.rating}</td>
      <td contenteditable>${d.remarks}</td>
      <td>${d.file ? `<a href="${d.file}" target="_blank">View</a>` : ""}</td>
      <td></td><td></td><td></td><td></td>
    `;
    tbody.appendChild(tr);
  });
});

// Update SMU
smuForm.onsubmit = async (e)=>{
  e.preventDefault();
  const eq = document.getElementById("smuEquip").value;
  const val = Number(document.getElementById("smuValue").value);
  await addDoc(smuRef, { equipment: eq, smu: val, updated: Date.now() });
  smuForm.reset();
};
onSnapshot(smuRef, (snap)=>{
  smuList.innerHTML = "";
  snap.forEach(docSnap=>{
    const d = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${d.equipment}: ${d.smu}`;
    smuList.appendChild(li);
  });
});

