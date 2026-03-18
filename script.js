// ==============================
// Clinic Finder Script (Full MVP with Language Support)
// ==============================

// Global data store
let data = [];
let currentLanguage = "en";

// ==============================
// Language Translations
// ==============================

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
// Wait for DOM to fully load
// ==============================

document.addEventListener("DOMContentLoaded", function () {

  // Language selector
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) {
    langSelect.addEventListener("change", function () {
      currentLanguage = this.value;
      updateLanguageUI();
    });
  }

  // Dropdown listeners
  document.getElementById("clinicType").addEventListener("change", handleClinicTypeChange);
  document.getElementById("insurance").addEventListener("change", handleInsuranceChange);
  document.getElementById("city").addEventListener("change", handleCityChange);

  // Load Excel
  loadExcel();
});

// ==============================
// Load Excel file
// ==============================

function loadExcel() {
  fetch("Sample_Clinics.xlsx")
    .then(res => res.arrayBuffer())
    .then(ab => {
      const workbook = XLSX.read(ab, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet);

      updateLanguageUI(); // ensures correct language on load
    });
}

// ==============================
// Utility
// ==============================

function parseInsurance(str) {
  if (!str) return [];
  return str.split(";").map(i => i.trim());
}

// ==============================
// Populate Clinic Types
// ==============================

function populateClinicTypes() {
  const t = translations[currentLanguage];
  const types = [...new Set(data.map(d => d.clinic_type))];

  const select = document.getElementById("clinicType");
  select.innerHTML = `<option value="">${t.clinicType}</option>`;

  types.forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    select.appendChild(opt);
  });

  select.disabled = false;
}

// ==============================
// Event Handlers
// ==============================

function handleClinicTypeChange() {
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
}

function handleInsuranceChange() {
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
}

function handleCityChange() {
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
}

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
// Language UI Update
// ==============================

function updateLanguageUI() {
  const t = translations[currentLanguage];

  // Title
  document.querySelector("h1").textContent = t.title;

  // Reset dropdowns with translated placeholders
  resetDropdown("clinicType", t.clinicType);
  resetDropdown("insurance", t.insurance);
  resetDropdown("city", t.city);

  // RTL support
  document.body.style.direction = (currentLanguage === "ar") ? "rtl" : "ltr";

  // Clear results
  clearResults();

  // Re-populate
  if (data.length > 0) {
    populateClinicTypes();
  }
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
