// =========================
// Firebase Config & Init
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);

console.log("✅ Firebase terhubung");
console.log("🔍 Project ID:", firebaseConfig.projectId);

// =========================
// Firestore Functions
// =========================

// Ambil semua data dari koleksi
export async function getAllData(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Tambah data baru
export async function addData(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), data);
  console.log("✅ Data ditambahkan:", docRef.id);
  return docRef.id;
}

// Update data
export async function updateData(collectionName, id, data) {
  await updateDoc(doc(db, collectionName, id), data);
  console.log("✅ Data diupdate:", id);
}

// Hapus data
export async function deleteData(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
  console.log("🗑️ Data dihapus:", id);
}

// =========================
// Storage Functions
// =========================

// Upload file
export async function uploadFile(path, file) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  console.log("📤 File diupload:", path);
  return await getDownloadURL(storageRef);
}

// Hapus file
export async function deleteFile(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
  console.log("🗑️ File dihapus:", path);
}

// =========================
// Export
// =========================
export { db, storage };
