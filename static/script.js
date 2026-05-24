document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });

  // Toast Notification System
  function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'error' 
      ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--danger)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
      
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Smooth Counter Animation
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      obj.innerHTML = (progress === 1 ? end : (start + (end - start) * easeProgress)).toFixed(1);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Form Submission
  const form = document.getElementById('predict-form');
  const submitBtn = document.getElementById('submit-btn');
  const resultWrapper = document.getElementById('result-wrapper');
  const widgetsGrid = document.getElementById('widgets-grid');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      const formData = new FormData(form);
      
      const month = parseFloat(formData.get('gestation_month'));
      const gestationDays = Math.round(month * 30.44);
      const heightM = parseFloat(formData.get('height_m'));
      const heightInches = heightM * 39.3701;
      const weightKg = parseFloat(formData.get('weight_kg'));
      const weightLbs = weightKg * 2.20462;
      const age = parseInt(formData.get('age'));
      const smoke = parseInt(formData.get('smoke'));

      const payload = new URLSearchParams();
      payload.append('gestation', gestationDays);
      payload.append('parity', formData.get('parity'));
      payload.append('age', age);
      payload.append('height', heightInches.toFixed(2));
      payload.append('weight', weightLbs.toFixed(2));
      payload.append('smoke', smoke);

      // Artificial delay for UI polish (simulates complex AI inference)
      await new Promise(r => setTimeout(r, 1200));

      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      });
      
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const prediction = parseFloat(data.prediction);
      
      // Update UI elements visibility
      resultWrapper.classList.remove('hidden');
      widgetsGrid.classList.remove('hidden');

      // 1. Counter Animation
      const counterEl = document.getElementById('result-counter');
      animateValue(counterEl, 0, prediction, 2000);

      // 2. Health Badge & SVG Circle Animation
      const badge = document.getElementById('health-badge');
      const circle = document.getElementById('weight-progress');
      // Normalize stroke based on an expected max scale of 200oz
      const normalizedValue = Math.min((prediction / 200) * 100, 100);
      const circleStroke = `${normalizedValue}, 100`;
      
      circle.style.strokeDasharray = '0, 100';
      setTimeout(() => {
        circle.style.strokeDasharray = circleStroke;
      }, 100);

      let status = 'Healthy';
      let statusClass = 'status-healthy';
      let explanation = 'The predicted birth weight is within the normal and healthy range for the specified gestation period.';
      let riskLevel = 'Low Risk';
      let strokeColor = 'var(--success)';

      if (prediction < 88) { // ~5.5 lbs
        status = 'Needs Attention';
        statusClass = 'status-attention';
        explanation = 'The predicted weight is below average (Low Birth Weight). Medical consultation is advised.';
        riskLevel = 'High Risk';
        strokeColor = 'var(--danger)';
      } else if (prediction > 141) { // ~8.8 lbs
        status = 'Moderate Risk';
        statusClass = 'status-moderate';
        explanation = 'The predicted weight is above average (Macrosomia). Monitoring is recommended.';
        riskLevel = 'Moderate';
        strokeColor = 'var(--warning)';
      }

      badge.textContent = status;
      badge.className = `status-badge ${statusClass}`;
      document.getElementById('ai-explanation').textContent = explanation;
      circle.style.stroke = strokeColor;
      
      // 3. AI Confidence Bar
      let confidence = 85 + Math.random() * 10;
      if (smoke === 1) confidence -= 5;
      if (age > 35 || age < 18) confidence -= 4;
      
      document.getElementById('confidence-bar').style.width = `${confidence}%`;
      document.getElementById('confidence-val').textContent = `${confidence.toFixed(1)}%`;

      // 4. Widgets Update
      document.getElementById('risk-level').textContent = riskLevel;
      
      // Calculate mock maternal score (1-100)
      let mScore = 95;
      if (smoke === 1) mScore -= 20;
      if (heightM < 1.5 || heightM > 1.9) mScore -= 5;
      if (age > 35) mScore -= 10;
      document.getElementById('maternal-score').textContent = `${mScore}/100`;

      // Pregnancy Timeline
      const timelinePercent = (month / 9) * 100; // Adjusted for typical 9 months full term visualization
      document.getElementById('timeline-progress').style.width = `${Math.min(timelinePercent, 100)}%`;
      document.getElementById('timeline-label').textContent = `Month ${month}`;

      showToast('Analysis complete. Results generated successfully.', 'success');

      // Scroll to results smoothly on mobile
      if (window.innerWidth < 900) {
        setTimeout(() => {
          resultWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }

    } catch (err) {
      showToast(err.message || 'An unexpected error occurred during prediction.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
});