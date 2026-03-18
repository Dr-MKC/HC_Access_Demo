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

  const t = translations[currentLanguage];
  select.innerHTML = `<option value="">${t.clinicType}</option>`;
  
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

  const t = translations[currentLanguage];

  resetDropdown("insurance", t.insurance);
  resetDropdown("city", t.city);
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

  const t = translations[currentLanguage];

  resetDropdown("city", t.city);
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
  const t = translations[currentLanguage];

  if (results.length === 0) {
    container.innerHTML = `<p>${t.noResults}</p>`;
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
      <p><strong>${t.cityLabel}:</strong> ${c.city || ""}</p>
      <p><strong>${t.insuranceLabel}:</strong> ${c.insurance || ""}</p>
      <a href="https://www.google.com/maps?q=${c.lat},${c.lng}" target="_blank">
        ${t.viewMap}
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

// ==============================
// Language Translations
// ==============================

let currentLanguage = "en";

const translations = {
  en: {
    title: "Find a Clinic",
    clinicType: "Select clinic type",
    insurance: "Select insurance",
    city: "Select city",
    noResults: "No clinics found.",
    viewMap: "View on Map",
    cityLabel: "City",
    insuranceLabel: "Insurance"
  },
  es: {
    title: "Encontrar una clínica",
    clinicType: "Seleccione tipo de clínica",
    insurance: "Seleccione seguro",
    city: "Seleccione ciudad",
    noResults: "No se encontraron clínicas.",
    viewMap: "Ver en el mapa",
    cityLabel: "Ciudad",
    insuranceLabel: "Seguro"
  },
  ar: {
    title: "ابحث عن عيادة",
    clinicType: "اختر نوع العيادة",
    insurance: "اختر التأمين",
    city: "اختر المدينة",
    noResults: "لم يتم العثور على عيادات",
    viewMap: "عرض على الخريطة",
    cityLabel: "المدينة",
    insuranceLabel: "التأمين"
  }
};

// ==============================
// Language Switching
// ==============================

document.getElementById("languageSelect").addEventListener("change", function () {
  currentLanguage = this.value;
  updateLanguageUI();
});

function updateLanguageUI() {
  const t = translations[currentLanguage];

  // Title
  document.querySelector("h1").textContent = t.title;

  // Dropdown placeholders
  resetDropdown("clinicType", t.clinicType);
  resetDropdown("insurance", t.insurance);
  resetDropdown("city", t.city);

  // Reset results
  clearResults();

  // Handle RTL for Arabic
  if (currentLanguage === "ar") {
    document.body.style.direction = "rtl";
  } else {
    document.body.style.direction = "ltr";
  }

  // Re-populate clinic types
  populateClinicTypes();
}

