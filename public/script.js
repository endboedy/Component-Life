
<script>
  const currentSMU = { "EX1001": 5000, "EX1002": 6200 }; // Contoh data dari tab Update Current SMU

  function openForm() {
    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.form-popup').style.display = 'block';
  }

  function closeForm() {
    document.querySelector('.overlay').style.display = 'none';
    document.querySelector('.form-popup').style.display = 'none';
  }

  document.getElementById('addForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const equip = form.equip.value;
    const model = form.model.value;
    const component = form.component.value;
    const freq = parseFloat(form.freq.value);
    const cost = parseFloat(form.cost.value);
    const changeOut = parseFloat(form.changeOut.value);
    const rating = form.rating.value;
    const remarks = form.remarks.value;
    const foto = form.foto.files[0]?.name || '';

    const current = currentSMU[equip] || 0;
    const nextChange = changeOut + freq;
    const life = current - changeOut;
    const lifePercent = ((life / freq) * 100).toFixed(1);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${equip}</td><td>${model}</td><td>${component}</td><td>${freq}</td><td>${cost}</td><td>${changeOut}</td>
      <td>${nextChange}</td><td>${current}</td><td>${life}</td><td>${lifePercent}%</td><td>${rating}</td><td>${remarks}</td>
      <td>${foto}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editRow(this)">Edit</button>
        <button class="btn btn-sm btn-success" onclick="saveRow(this)">Save</button>
      </td>
    `;
    document.getElementById('dataTable').appendChild(row);
    closeForm();
    form.reset();
  });

  function editRow(btn) {
    const row = btn.closest('tr');
    [...row.children].forEach((cell, i) => {
      if (i < 13) {
        const val = cell.innerText;
        cell.innerHTML = `<input class="form-control form-control-sm" value="${val.replace('%','')}" />`;
      }
    });
  }

  function saveRow(btn) {
    const row = btn.closest('tr');
    [...row.children].forEach((cell, i) => {
      if (i < 13) {
        const input = cell.querySelector('input');
        if (input) cell.innerText = i === 9 ? `${input.value}%` : input.value;
      }
    });
  }
</script>
