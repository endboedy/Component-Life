
import initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

function showTab(tab) {
  document.getElementById("compLife").style.display = tab === "compLife" ? "block" : "none";
  document.getElementById("currentSMU").style.display = tab === "currentSMU" ? "block" : "none";
}

document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const file = form.picture.files[0];

  let imageUrl = "";
  if (file) {
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "components"), { ...data, picture: imageUrl });
  form.reset();
  document.querySelector(".btn-close").click();
  loadData();
});

async function loadData() {
  const snapshot = await getDocs(collection(db, "components"));
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.equip}</td><td>${data.model}</td><td>${data.component}</td><td>${data.freq}</td>
      <td>${data.cost}</td><td>${data.changeOut}</td><td>${data.nextChange}</td><td>${data.smu}</td>
      <td>${data.life}</td><td>${data.rating}</td><td>${data.remarks}</td>
      <td><img src="${data.picture}" style="max-width:80px;" /></td>
      <td><button class="btn btn-sm btn-warning">Edit</button></td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("smuForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const equip = form.equip.value;
  const newSMU = form.smu.value;

  const q = query(collection(db, "components"), where("equip", "==", equip));
  const snapshot = await getDocs(q);
  snapshot.forEach(async (docSnap) => {
    await updateDoc(doc(db, "components", docSnap.id), { smu: newSMU });
  });

  form.reset();
  loadData();
});

document.getElementById("filterInput").addEventListener("input", () => {
  const filter = document.getElementById("filterInput").value.toLowerCase();
  const rows = document.querySelectorAll("#dataTable tbody tr");
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
});

loadData();
