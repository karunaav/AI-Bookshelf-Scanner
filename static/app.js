const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const preview = document.getElementById("preview");
const resultsDiv = document.getElementById("results");
const overlay = document.getElementById("overlay");

let imgElement = null;

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  preview.innerHTML = `<img id="theImage" src="${url}" style="max-width:90vw;"/>`;
  imgElement = document.getElementById("theImage");
});

uploadBtn.addEventListener("click", async () => {
  if (!fileInput.files[0]) {
    alert("Choose an image first.");
    return;
  }
  resultsDiv.innerHTML = "Scanning...";
  const form = new FormData();
  form.append("image", fileInput.files[0]);
  const resp = await fetch("/scan", { method: "POST", body: form });
  const data = await resp.json();
  if (data.error) {
    resultsDiv.innerText = "Error: " + data.error;
    return;
  }
  showResults(data.results);
});

function showResults(results) {
  resultsDiv.innerHTML = "";
  results.forEach((r, i) => {
    const el = document.createElement("div");
    el.innerHTML = `<strong>${i + 1}</strong>: ${r.text}`;
    resultsDiv.appendChild(el);
  });
}
