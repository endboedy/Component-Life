unction showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}

function addRow() {
  const equip = document.getElementById('equip').value;
  const model = document.getElementById('model').value;
  const component = document.getElementById('component').value;
  const freq = parseInt(document.getElementById('freq').value) || 0;
  const cost = parseFloat(document.getElementById('cost').value) || 0;
  const changeOut = parseInt(document.getElementById('changeOut').value) || 0;
  const rating = document.getElementById('rating').value;
  const remarks = document.getElementById('remarks').value;
  const fotoInput = document.getElementById('foto');
  let fotoURL = "";

  if (fotoInput.files.length > 0) {
    fotoURL = URL.createObjectURL(fotoInput.files[0]);
  }

  const nextChange = changeOut + freq;
  const currentSMU = 0; // awalnya kosong, bisa diupdate dari menu 2
  const life = currentSMU - changeOut;
  const lifePct = freq ? ((life / freq) * 100).toFixed(2) + "%" : "";

  const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();

  newRow.innerHTML = `
    <td>${equip}</td>
    <td>${model}</td>
    <td>${component}</td>
    <td>${freq}</td>
    <td>${cost}</td>
    <td>${changeOut}</td>
    <td>${nextChange}</td>
    <td class="current-smu">${currentSMU}</td>
    <td class="life">${life}</td>
    <td class="lifePct">${lifePct}</td>
    <td>${rating}</td>
    <td>${remarks}</td>
    <td>${fotoURL ? <img src="${fotoURL}" width="50"> : ""}</td>
    <td>
      <span class="action-btn" onclick="editRow(this)">Edit</span>
      <span class="action-btn" onclick="saveRow(this)">Save</span>
      <span class="action-btn" onclick="deleteRow(this)">Delete</span>
    </td>
  `;

  // reset form
  document.querySelectorAll(".form-section input").forEach(i => i.value = "");
  document.getElementById('rating').value = "";
}

function deleteRow(btn) {
  const row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
}

function editRow(btn) {
  const row = btn.parentNode.parentNode;
  const cells = row.getElementsByTagName("td");

  document.getElementById("equip").value = cells[0].innerText;
  document.getElementById("model").value = cells[1].innerText;
  document.getElementById("component").value = cells[2].innerText;
  document.getElementById("freq").value = cells[3].innerText;
  document.getElementById("cost").value = cells[4].innerText;
  document.getElementById("changeOut").value = cells[5].innerText;
  document.getElementById("rating").value = cells[10].innerText;
  document.getElementById("remarks").value = cells[11].innerText;

  deleteRow(btn);
}

function saveRow(btn) {
  alert("Data updated (sementara masih dummy). Nanti bisa dihubungkan ke DB.");
}

function updateSMU() {
  const equipKey = document.getElementById("updateEquip").value;
  const newSMU = parseInt(document.getElementById("updateSMUValue").value) || 0;

  const rows = document.querySelectorAll("#dataTable tbody tr");
  rows.forEach(row => {
    if (row.cells[0].innerText === equipKey) {
      row.querySelector(".current-smu").innerText = newSMU;
      const changeOut = parseInt(row.cells[5].innerText) || 0;
      const freq = parseInt(row.cells[3].innerText) || 0;
      const life = newSMU - changeOut;
      const lifePct = freq ? ((life / freq) * 100).toFixed(2) + "%" : "";

      row.querySelector(".life").innerText = life;
      row.querySelector(".lifePct").innerText = lifePct;
    }
  });
}
