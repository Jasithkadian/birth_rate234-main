const form = document.querySelector('form');
const errorMsg = document.getElementById('error-msg');
const resultCard = document.getElementById('result-card');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // On new submission, hide both first
  errorMsg.style.display = 'none';
  resultCard.style.display = 'none';

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      body: new FormData(form)
    });
    const data = await res.json();

    if (data.error) {
      errorMsg.style.display = 'block';
      errorMsg.textContent = data.error;
    } else {
      errorMsg.style.display = 'none';
      document.getElementById('result').textContent = data.prediction + ' oz';
      resultCard.style.display = 'block';
    }
  } catch (err) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = 'An unexpected error occurred.';
  }
});
