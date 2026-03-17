// ==============================
// Clinic Finder Script (Full MVP)
// ==============================

// Global data store
let data = [];

// Load Excel file using SheetJS
fetch("Sample_Clinics.xlsx")
  .then(res => res.arrayBuffer())
  .then(ab => {
    const workbook = XLSX.read(ab, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(sheet);

    populateClinicTypes();
  });

// Utility: parse insurance string into array
function parseInsurance(str) {
  if (!str) return [];
  return str.split(";").map(i => i.trim());
}

// ==============================
// Populate Clinic Type Dropdown
// ==============================
function populateClinicTypes() {
  const types = [...new Set(data.map(d => d.clinic_type))];
  const select = document.getElementById("clinicType");

  select.innerHTML = '<option value="">Select clinic type</option>';

  types.forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    select.appendChild(opt);
  });
}

// ==============================
// Clinic Type → Insurance
// ==============================
document.getElementById("clinicType").addEventListener("change", function () {
  const type = this.value;

  resetDropdown("insurance", "Select insurance");
  resetDropdown("city", "Select city");
  clearResults();

  if (!type) return;

  const filtered = data.filter(d => d.clinic_type === type);

  const insuranceSet = new Set();

  filtered.forEach(d => {
    parseInsurance(d.insurance).forEach(i => insuranceSet.add(i));
  });

  const insuranceSelect = document.getElementById("insurance");
  insuranceSelect.disabled = false;

  insuranceSet.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    insuranceSelect.appendChild(opt);
  });
});

// ==============================
// Insurance → City
// ==============================
document.getElementById("insurance").addEventListener("change", function () {
  const type = document.getElementById("clinicType").value;
  const insurance = this.value;

  resetDropdown("city", "Select city");
  clearResults();

  if (!insurance) return;

  const cities = new Set();

  data.forEach(d => {
    const insurances = parseInsurance(d.insurance);

    if (d.clinic_type === type && insurances.includes(insurance)) {
      cities.add(d.city);
    }
  });

  const citySelect = document.getElementById("city");
  citySelect.disabled = false;

  cities.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    citySelect.appendChild(opt);
  });
});

// ==============================
// City → Results
// ==============================
document.getElementById("city").addEventListener("change", function () {
  const type = document.getElementById("clinicType").value;
  const insurance = document.getElementById("insurance").value;
  const city = this.value;

  clearResults();

  if (!city) return;

  const results = data.filter(d => {
    const insurances = parseInsurance(d.insurance);

    return (
      d.clinic_type === type &&
      insurances.includes(insurance) &&
      d.city === city
    );
  });

  displayResults(results);
});

// ==============================
// Display Results
// ==============================
function displayResults(results) {
  const container = document.getElementById("results");

  if (results.length === 0) {
    container.innerHTML = "<p>No clinics found.</p>";
    return;
  }

  results.forEach(c => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.margin = "10px 0";

    div.innerHTML = `
      <h3>${c.clinic_name || "Unnamed Clinic"}</h3>
      <p>${c.address || ""}</p>
      <p><strong>City:</strong> ${c.city || ""}</p>
      <p><strong>Insurance:</strong> ${c.insurance || ""}</p>
      <a href="https://www.google.com/maps?q=${c.lat},${c.lng}" target="_blank">
        View on Map
      </a>
    `;

    container.appendChild(div);
  });
}

// ==============================
// Helpers
// ==============================
function resetDropdown(id, placeholder) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">${placeholder}</option>`;
  select.disabled = true;
}

function clearResults() {
  document.getElementById("results").innerHTML = "";
}