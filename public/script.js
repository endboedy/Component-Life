
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Component Life EM</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.minnt { margin-top: 20px; }
    .table th, .table td { vertical-align: middle; }
    .form-popup { display: none; position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #fff; padding: 20px; border: 1px solid #ccc; z-index: 1000; width: 90%; max-width: 600px; }
    .overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; }
  </style>
</head>
<body class="container py-4">
  <h2>Component Life EM</h2>

  <!-- Tabs -->
  <ul class="nav nav-tabs" id="mainTabs">
    <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#compLife">Comp-Life</a></li>
    <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#updateSMU">Update Current SMU</a></li>
  </ul>

  <div class="tab-content">
    <!-- Comp-Life Tab -->
    <div class="tab-pane fade show active" id="compLife">
      <button class="btn btn-primary my-3" onclick="openForm()">Add New</button>
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Equip</th><th>Model</th><th>Component</th><th>Freq</th><th>Cost</th><th>Change Out</th>
            <th>Next Change</th><th>Current SMU</th><th>Life</th><th>Life %</th><th>Rating</th><th>Remarks</th><th>Foto</th><th>Action</th>
          </tr>
        </thead>
        <tbody id="dataTable"></tbody>
      </table>
    </div>

    <!-- Update Current SMU Tab -->
    <div class="tab-pane fade" id="updateSMU">
      <p>Form untuk update Current SMU akan ditambahkan di sini.</p>
    </div>
  </div>

  <!-- Overlay & Form Popup -->
  <div class="overlay" onclick="closeForm()"></div>
  <div class="form-popup" id="formPopup">
    <h5>Add New Component</h5>
    <form id="addForm">
      <div class="row">
        <div class="col-md-6"><input class="form-control mb-2" name="equip" placeholder="Equip" required /></div>
        <div class="col-md-6"><input class="form-control mb-2" name="model" placeholder="Model" required /></div>
        <div class="col-md-6"><input class="form-control mb-2" name="component" placeholder="Component" required /></div>
        <div class="col-md-6"><input class="form-control mb-2" name="freq" type="number" placeholder="Freq" required /></div>
        <div class="col-md-6"><input class="form-control mb-2" name="cost" type="number" placeholder="Cost" required /></div>
        <div class="col-md-6"><input class="form-control mb-2" name="changeOut" type="number" placeholder="Change Out" required /></div>
        <div class="col-md-6"><input class="form-control mb-2" name="rating" placeholder="Rating" /></div>
        <div class="col-md-6"><input class="form-control mb-2" name="remarks" placeholder="Remarks" /></div>
        <div class="col-md-12"><input class="form-control mb-2" name="foto" type="file" accept="image/*" /></div>
      </div>
      <button type="submit" class="btn btn-success">Save</button>
      <button type="button" class="btn btn-secondary" onclick="closeForm()">Cancel</button>
    </form>
  </div>

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

      const row = `<tr>
        <td>${equip}</td><td>${model}</td><td>${component}</td><td>${freq}</td><td>${cost}</td><td>${changeOut}</td>
        <td>${nextChange}</td><td>${current}</td><td>${life}</td><td>${lifePercent}%</td><td>${rating}</td><td>${remarks}</td>
        <td>${foto}</td><td><button class="btn btn-sm btn-warning">Edit</button> <button class="btn btn-sm btn-success">Save</button></td>
      </tr>`;
      document.getElementById('dataTable').insertAdjacentHTML('beforeend', row);
      closeForm();
      form.reset();
    });
  </script>
</body>
</html>
