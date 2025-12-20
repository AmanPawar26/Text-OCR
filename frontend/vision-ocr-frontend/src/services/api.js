export async function processInstantOCR({ file, prompt, category }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  formData.append("prompt", prompt);

  const response = await fetch("http://localhost:3000/api/upload-process/instant", {
    method: "POST",
    body: formData,
  });

  return response.json();
}



// ⏳ Upload + schedule for automatic OCR
export async function scheduleFileForOCR({ file, category }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const response = await fetch("http://localhost:3000/api/cron/schedule", {
    method: "POST",
    body: formData
  });

  return response.json();
}


// ⭐ Custom Prompt OCR
export async function processCustomPromptOCR({ file, prompt, category }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", prompt);
  formData.append("category", category);

  const response = await fetch("http://localhost:3000/api/custom/prompt", {
    method: "POST",
    body: formData,
  });

  return response.json();
}

