const fileInput = document.getElementById('fileInput');
const previewImage = document.getElementById('previewImage');
const scanBtn = document.getElementById('scanBtn');
const resultsList = document.getElementById('resultsList');

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = 'block';
  }
});

scanBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an image first!');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  resultsList.innerHTML = '<li>⏳ Scanning your shelf...</li>';

  try {
    const response = await fetch('/scan', { method: 'POST', body: formData });
    const data = await response.json();

    resultsList.innerHTML = '';
    if (data.books && data.books.length > 0) {
      data.books.forEach((book, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${i + 1}.</strong> ${book}`;
        resultsList.appendChild(li);
      });
    } else {
      resultsList.innerHTML = '<li>No books detected 😕</li>';
    }
  } catch (err) {
    resultsList.innerHTML = `<li>Error: ${err.message}</li>`;
  }
});
