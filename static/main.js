const fileInput = document.getElementById('fileInput');
const previewImage = document.getElementById('previewImage');
const scanBtn = document.getElementById('scanBtn');
const resultsList = document.getElementById('resultsList');

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    previewImage.src = URL.createObjectURL(file);
  }
});

scanBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please upload an image first!");

  resultsList.innerHTML = "<li>Scanning... ⏳</li>";

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/scan', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

    resultsList.innerHTML = '';
    if (data.results.length === 0) {
      resultsList.innerHTML = "<li>No text detected 😕</li>";
    } else {
      data.results.forEach((res, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${res.text}`;
        resultsList.appendChild(li);
      });
    }
  } catch (err) {
    resultsList.innerHTML = `<li>Error: ${err.message}</li>`;
  }
});
