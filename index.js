const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxV0RHWY0gKAGbIW4gjFcBhbgXKjVt-gdlTyVDa3cpcTMf8d87zZMY03aCaxcMvIrmq/exec";
const formulario = document.querySelector("#miFormulario");
const nombreInput = document.querySelector("#nombre");
const submitBtn = formulario.querySelector('input[type="submit"]');
let enviando = false;

function setFechaActualPorDefecto() {
  const fechaInput = document.querySelector("#fecha");
  if (!fechaInput.value) {
    fechaInput.value = new Date().toISOString().split("T")[0];
  }
}

function setSwitchesPorDefectoFalse() {
  document.querySelector("#lavanderia").checked = false;
  document.querySelector("#tintoreria").checked = false;
  document.querySelector("#planchado").checked = false;
}

function toggleCampoDetalle(switchId, inputId) {
  const switchEl = document.querySelector(switchId);
  const inputEl = document.querySelector(inputId);

  const actualizarEstado = () => {
    inputEl.disabled = !switchEl.checked;
    inputEl.required = switchEl.checked;
    if (!switchEl.checked) {
      inputEl.value = "";
    }
  };

  switchEl.addEventListener("change", actualizarEstado);
  actualizarEstado();
}

toggleCampoDetalle("#lavanderia", "#kilos");
toggleCampoDetalle("#tintoreria", "#piezasTintoreria");
toggleCampoDetalle("#planchado", "#piezasPlanchado");
setSwitchesPorDefectoFalse();
setFechaActualPorDefecto();
nombreInput.addEventListener("input", () => {
  nombreInput.value = nombreInput.value.toUpperCase();
});

function isNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return false;
  return Number.isFinite(Number(valor));
}

function validarCamposNumericos() {
  const validaciones = [
    {
      activo: document.querySelector("#lavanderia").checked,
      campo: document.querySelector("#kilos"),
      nombre: "Kilos"
    },
    {
      activo: document.querySelector("#tintoreria").checked,
      campo: document.querySelector("#piezasTintoreria"),
      nombre: "Piezas Tintoreria"
    },
    {
      activo: document.querySelector("#planchado").checked,
      campo: document.querySelector("#piezasPlanchado"),
      nombre: "Piezas Planchado"
    }
  ];

  for (const item of validaciones) {
    if (!item.activo) continue;
    const valor = item.campo.value.trim();

    if (!valor) {
      throw new Error(`Debes capturar '${item.nombre}' cuando el switch esta habilitado.`);
    }

    if (!isNumero(valor)) {
      throw new Error(`El campo '${item.nombre}' debe ser numerico.`);
    }
  }
}

async function enviarAGoogleSheets(payload) {
  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error al guardar");
  return data;
}

function limpiarFormulario() {
  formulario.reset();
  setSwitchesPorDefectoFalse();
  setFechaActualPorDefecto();
  document.querySelector("#lavanderia").dispatchEvent(new Event("change"));
  document.querySelector("#tintoreria").dispatchEvent(new Event("change"));
  document.querySelector("#planchado").dispatchEvent(new Event("change"));
}

// Ejemplo al enviar formulario
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (enviando) return;

  try {
    validarCamposNumericos();
  } catch (err) {
    alert(err.message);
    return;
  }

  enviando = true;
  submitBtn.disabled = true;
  const submitTextOriginal = submitBtn.value;
  submitBtn.value = "Guardando...";

  const payload = {
    nombre: document.querySelector("#nombre").value.toUpperCase(),
    fecha: document.querySelector("#fecha").value,
    fechaCompromiso: document.querySelector("#fechaCompromiso").value,
    lavanderia: document.querySelector("#lavanderia").checked,
    kilos: document.querySelector("#kilos").value,
    tintoreria: document.querySelector("#tintoreria").checked,
    piezasTintoreria: document.querySelector("#piezasTintoreria").value,
    planchado: document.querySelector("#planchado").checked,
    piezasPlanchado: document.querySelector("#piezasPlanchado").value,
    adicionales: document.querySelector("#adicionales").value,
    contenedores: document.querySelector("#contenedores").value,
    comentarios: document.querySelector("#comentarios").value,
    aDomicilio: document.querySelector("#aDomicilio").value
  };

  try {
    await enviarAGoogleSheets(payload);
    alert("Guardado en Google Sheets");
    limpiarFormulario();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar");
  } finally {
    enviando = false;
    submitBtn.disabled = false;
    submitBtn.value = submitTextOriginal;
  }
});