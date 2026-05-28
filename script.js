const baseFormTemplate = `
          <div>
            <label
              for="fileInput"
              class="block text-lg font-medium text-[var(--text-color-dark)] mb-2"
              >1. Bild hochladen</label
            >
            <input
              type="file"
              id="fileInput"
              required
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-color)] file:text-[var(--text-color-light)] hover:file:brightness-90 cursor-pointer"
            />
          </div>
`;

const removeBackgroundFormTemplate = `
          <div class="removeBackgroundForm">
            <div>
              <h3
                class="text-lg font-medium text-[var(--text-color-dark)] mb-4"
              >
                2. Optionen auswählen
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    for="selectFormat"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Format</label
                  >
                  <select
                    id="selectFormat"
                    class="w-full px-4 py-2 border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:border-[var(--primary-color)]"
                  >
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center py-3 px-4 mt-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-[var(--text-color-light)] bg-[var(--primary-color)] hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
                >
                  Bild verarbeiten
                </button>
              </div>
            </div>
          </div>
`;

const upscaleImageFormTemplate = `
          <div class="removeBackgroundForm">
            <div>
              <h3
                class="text-lg font-medium text-[var(--text-color-dark)] mb-4"
              >
                2. Optionen auswählen
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    for="selectFormat"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Format</label
                  >
                  <select
                    id="selectFormat"
                    class="w-full px-4 py-2 border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:border-[var(--primary-color)]"
                  >
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
                <div>
                  <label
                    for="selectFactor"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Skalierungsfaktor</label
                  >
                  <select
                    id="selectFactor"
                    class="w-full px-4 py-2 border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:border-[var(--primary-color)]"
                  >
                    <option value="2">2x</option>
                    <option value="4">4x</option>
                    <option value="6">6x</option>
                    <option value="8">8x</option>
                  </select>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center py-3 px-4 mt-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-[var(--text-color-light)] bg-[var(--primary-color)] hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
                >
                  Bild verarbeiten
                </button>
              </div>
            </div>
          </div>
`;

const vectorizeFormTemplate = `
          <div class="removeBackgroundForm">
            <div>
              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center py-3 px-4 mt-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-[var(--text-color-light)] bg-[var(--primary-color)] hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
                >
                  Bild verarbeiten
                </button>
              </div>
            </div>
          </div>
`;


function getAPIKey() {
  return localStorage.getItem("apiKey");
}

function setAPIKey(apiKey) {
  localStorage.setItem("apiKey", apiKey);
}

async function callAPIEndpoint(mode, data) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    alert("API Key is not set. Please set it in the settings.");
    document.getElementById("settingsModal").classList.remove("hidden");
    return;
  }

  const endpoints = {
    removeBackground: "https://api.picsart.io/tools/1.0/removebg",
    upscale: "https://api.picsart.io/tools/1.0/upscale",
    vectorize: "https://api.picsart.io/tools/1.0/vectorizer",
  };

  const url = endpoints[mode];
  if (!url) {
    alert(
      "An invalid processing mode was selected. Please refresh and try again."
    );
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-Picsart-API-Key": apiKey,
      },
      body: data,
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok || !contentType?.includes("application/json")) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const resultJson = await response.json();
    const resultUrl = resultJson?.data?.url;

    if (!resultUrl) {
      throw new Error("No image URL returned in response.");
    }

    const imageRes = await fetch(resultUrl);
    const resultBlob = await imageRes.blob();
    triggerDownload(resultBlob, mode, data.get("format"));
  } catch (error) {
    console.error("Failed to call API:", error);
    alert(`An error occurred: ${error.message}`);
  } finally {
  }
}

function triggerDownload(blob, mode, format) {
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = downloadUrl;
  a.download = `result-${mode}.${format || "png"}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  a.remove();
}

function initializeSettings() {
  const settingsButton = document.getElementById("settingsButton");
  const settingsModal = document.getElementById("settingsModal");
  const settingsForm = document.getElementById("settingsForm");
  const settingsModalAbortButton = document.getElementById(
    "settingsModalAbortButton"
  );
  const settingsModalSaveButton = document.getElementById(
    "settingsModalSaveButton"
  );

  let apiKey = getAPIKey();
  if (!apiKey) {
    settingsModal.classList.remove("hidden");
  }

  settingsButton.addEventListener("click", function () {
    settingsModal.classList.contains("hidden")
      ? settingsModal.classList.remove("hidden")
      : settingsModal.classList.add("hidden");
  });

  settingsModalAbortButton.addEventListener("click", function () {
    settingsModal.classList.add("hidden");
  });

  settingsForm.addEventListener("submit", function (event) {
    event.preventDefault();
    apiKey = document.getElementById("apiKeyInput").value;
    setAPIKey(apiKey);
    settingsModal.classList.add("hidden");
  });
}

let currentSubmitHandler = null;

function functionForm(mode) {
  const fullForm = document.getElementById("apiForm");

  if (currentSubmitHandler) {
    fullForm.removeEventListener("submit", currentSubmitHandler);
  }

  currentSubmitHandler = function (event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", document.getElementById("fileInput").files[0]);
    if (mode === "removeBackground") {
      formData.append("format", document.getElementById("selectFormat").value);
    } else if (mode === "upscale") {
      formData.append("format", document.getElementById("selectFormat").value);
      formData.append(
        "upscale_factor",
        document.getElementById("selectFactor").value
      );
    } else if (mode === "vectorize") {
      // no additional data needed
    }
    callAPIEndpoint(mode, formData);
  };

  fullForm.addEventListener("submit", currentSubmitHandler);
}

function initializeForm() {
  const baseForm = document.getElementById("apiForm");
  const mode = document.getElementById("selectMode");
  mode.addEventListener("change", function () {
    switch (mode.value) {
      case "removeBackground":
        baseForm.innerHTML = baseFormTemplate + removeBackgroundFormTemplate;
        break;
      case "upscale":
        baseForm.innerHTML = baseFormTemplate + upscaleImageFormTemplate;
        break;
      case "vectorize":
        baseForm.innerHTML = baseFormTemplate + vectorizeFormTemplate;
        break;
    }
    functionForm(mode.value);
  });
  mode.dispatchEvent(new Event("change"));
}

document.addEventListener("DOMContentLoaded", function () {
  initializeSettings();
  initializeForm();
});
