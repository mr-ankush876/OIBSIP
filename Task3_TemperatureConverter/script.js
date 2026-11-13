'use strict';

(function () {
  const form = document.getElementById('converterForm');
  const tempInput = document.getElementById('tempInput');
  const fromUnit = document.getElementById('fromUnit');
  const swapUnitBtn = document.getElementById('swapUnitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const activeUnitBadge = document.getElementById('activeUnitBadge');
  const errorBanner = document.getElementById('errorBanner');
  const themeToggle = document.getElementById('themeToggle');

  const celsiusCard = document.getElementById('celsiusCard');
  const fahrenheitCard = document.getElementById('fahrenheitCard');
  const kelvinCard = document.getElementById('kelvinCard');

  const celsiusValue = document.getElementById('celsiusValue');
  const fahrenheitValue = document.getElementById('fahrenheitValue');
  const kelvinValue = document.getElementById('kelvinValue');

  const celsiusFormula = document.getElementById('celsiusFormula');
  const fahrenheitFormula = document.getElementById('fahrenheitFormula');
  const kelvinFormula = document.getElementById('kelvinFormula');

  const celsiusBadge = document.getElementById('celsiusBadge');
  const fahrenheitBadge = document.getElementById('fahrenheitBadge');
  const kelvinBadge = document.getElementById('kelvinBadge');

  const copyCelsiusBtn = document.getElementById('copyCelsiusBtn');
  const copyFahrenheitBtn = document.getElementById('copyFahrenheitBtn');
  const copyKelvinBtn = document.getElementById('copyKelvinBtn');

  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const toast = document.getElementById('toast');

  let toastTimeout = null;
  const HISTORY_STORAGE_KEY = 'tempconvert_history';
  const THEME_STORAGE_KEY = 'tempconvert_theme';

  const UNIT_SYMBOLS = {
    C: '°C',
    F: '°F',
    K: 'K'
  };

  const ABSOLUTE_ZERO = {
    C: -273.15,
    F: -459.67,
    K: 0
  };

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function updateActiveBadge() {
    activeUnitBadge.innerHTML = UNIT_SYMBOLS[fromUnit.value] || '&deg;C';
  }

  function showError(msg) {
    errorBanner.textContent = msg;
    errorBanner.classList.add('show');
    tempInput.classList.add('is-invalid');
  }

  function clearError() {
    errorBanner.textContent = '';
    errorBanner.classList.remove('show');
    tempInput.classList.remove('is-invalid');
  }

  function formatDisplay(num) {
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function validateInput(rawStr, unit) {
    if (!rawStr || rawStr.trim() === '') {
      return { valid: false, error: 'Please enter a temperature value to convert.' };
    }

    const val = Number(rawStr);
    if (!isFinite(val) || isNaN(val)) {
      return { valid: false, error: 'Please enter a valid numerical temperature.' };
    }

    const minAllowed = ABSOLUTE_ZERO[unit];
    if (val < minAllowed) {
      const symbol = UNIT_SYMBOLS[unit];
      return {
        valid: false,
        error: `Value cannot drop below Absolute Zero (${minAllowed} ${symbol} / 0 K).`
      };
    }

    return { valid: true, value: val };
  }

  function convertTemperatures(val, unit) {
    let c, f, k;

    if (unit === 'C') {
      c = val;
      f = (val * 9) / 5 + 32;
      k = val + 273.15;
    } else if (unit === 'F') {
      c = ((val - 32) * 5) / 9;
      f = val;
      k = ((val - 32) * 5) / 9 + 273.15;
    } else if (unit === 'K') {
      c = val - 273.15;
      f = ((val - 273.15) * 9) / 5 + 32;
      k = val;
    }

    return { c, f, k };
  }

  function generateFormulas(val, unit, c, f, k) {
    const vStr = formatDisplay(val);
    const cStr = formatDisplay(c);
    const fStr = formatDisplay(f);
    const kStr = formatDisplay(k);

    if (unit === 'C') {
      return {
        c: `Original input (${vStr} °C)`,
        f: `(${vStr} × 9/5) + 32 = ${fStr} °F`,
        k: `${vStr} + 273.15 = ${kStr} K`
      };
    }
    if (unit === 'F') {
      return {
        c: `(${vStr} − 32) × 5/9 = ${cStr} °C`,
        f: `Original input (${vStr} °F)`,
        k: `(${vStr} − 32) × 5/9 + 273.15 = ${kStr} K`
      };
    }
    return {
      c: `${vStr} − 273.15 = ${cStr} °C`,
      f: `(${vStr} − 273.15) × 9/5 + 32 = ${fStr} °F`,
      k: `Original input (${vStr} K)`
    };
  }

  function renderResults(val, unit, results, formulas) {
    const cText = `${formatDisplay(results.c)} °C`;
    const fText = `${formatDisplay(results.f)} °F`;
    const kText = `${formatDisplay(results.k)} K`;

    celsiusValue.textContent = cText;
    fahrenheitValue.textContent = fText;
    kelvinValue.textContent = kText;

    celsiusFormula.textContent = formulas.c;
    fahrenheitFormula.textContent = formulas.f;
    kelvinFormula.textContent = formulas.k;

    celsiusCard.classList.remove('is-source');
    fahrenheitCard.classList.remove('is-source');
    kelvinCard.classList.remove('is-source');

    celsiusBadge.textContent = 'Converted';
    fahrenheitBadge.textContent = 'Converted';
    kelvinBadge.textContent = 'Converted';

    if (unit === 'C') {
      celsiusCard.classList.add('is-source');
      celsiusBadge.textContent = 'Input';
    } else if (unit === 'F') {
      fahrenheitCard.classList.add('is-source');
      fahrenheitBadge.textContent = 'Input';
    } else if (unit === 'K') {
      kelvinCard.classList.add('is-source');
      kelvinBadge.textContent = 'Input';
    }
  }

  function resetResults() {
    celsiusValue.textContent = '---';
    fahrenheitValue.textContent = '---';
    kelvinValue.textContent = '---';

    celsiusFormula.textContent = 'Awaiting conversion input';
    fahrenheitFormula.textContent = 'Awaiting conversion input';
    kelvinFormula.textContent = 'Awaiting conversion input';

    celsiusCard.classList.remove('is-source');
    fahrenheitCard.classList.remove('is-source');
    kelvinCard.classList.remove('is-source');

    celsiusBadge.textContent = 'Target';
    fahrenheitBadge.textContent = 'Target';
    kelvinBadge.textContent = 'Target';
  }

  function loadHistory() {
    try {
      const data = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveHistory(list) {
    try {
      sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 5)));
    } catch {}
  }

  function renderHistory() {
    const list = loadHistory();
    historyList.innerHTML = '';

    if (!list || list.length === 0) {
      historyEmpty.style.display = 'block';
      clearHistoryBtn.style.display = 'none';
      return;
    }

    historyEmpty.style.display = 'none';
    clearHistoryBtn.style.display = 'inline-block';

    list.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-label', `Reload ${item.inputStr} ${UNIT_SYMBOLS[item.unit]}`);

      const left = document.createElement('div');
      left.className = 'history-expression';
      left.innerHTML = `<span>${item.inputStr} ${UNIT_SYMBOLS[item.unit]}</span> <span class="history-arrow">&rarr;</span> <span class="history-outputs">${item.cStr} &bull; ${item.fStr} &bull; ${item.kStr}</span>`;

      const right = document.createElement('span');
      right.className = 'history-meta';
      right.textContent = item.time;

      row.appendChild(left);
      row.appendChild(right);

      const reload = () => {
        tempInput.value = item.inputStr;
        fromUnit.value = item.unit;
        updateActiveBadge();
        clearError();
        performConversion();
        showToast(`Loaded ${item.inputStr} ${UNIT_SYMBOLS[item.unit]}`);
      };

      row.addEventListener('click', reload);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reload();
        }
      });

      historyList.appendChild(row);
    });
  }

  function addHistoryItem(val, unit, results) {
    const list = loadHistory();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const item = {
      inputStr: formatDisplay(val),
      unit: unit,
      cStr: `${formatDisplay(results.c)} °C`,
      fStr: `${formatDisplay(results.f)} °F`,
      kStr: `${formatDisplay(results.k)} K`,
      time: timeStr
    };

    list.unshift(item);
    saveHistory(list);
    renderHistory();
  }

  function performConversion() {
    clearError();
    const raw = tempInput.value;
    const unit = fromUnit.value;

    const validation = validateInput(raw, unit);
    if (!validation.valid) {
      showError(validation.error);
      resetResults();
      return false;
    }

    const val = validation.value;
    const results = convertTemperatures(val, unit);
    const formulas = generateFormulas(val, unit, results.c, results.f, results.k);

    renderResults(val, unit, results, formulas);
    addHistoryItem(val, unit, results);
    return true;
  }

  function cycleUnit() {
    const current = fromUnit.value;
    if (current === 'C') {
      fromUnit.value = 'F';
    } else if (current === 'F') {
      fromUnit.value = 'K';
    } else {
      fromUnit.value = 'C';
    }
    updateActiveBadge();
    clearError();
    if (tempInput.value.trim() !== '') {
      performConversion();
    }
  }

  function handleReset() {
    tempInput.value = '';
    fromUnit.value = 'C';
    updateActiveBadge();
    clearError();
    resetResults();
    tempInput.focus();
    showToast('Reset converter to empty state');
  }

  function handleCopy(button, valueElement) {
    const textToCopy = valueElement.textContent.trim();
    if (!textToCopy || textToCopy === '---') {
      showToast('No converted value to copy');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        button.classList.add('copied');
        const label = button.querySelector('.copy-label');
        if (label) label.textContent = 'Copied!';
        showToast(`Copied ${textToCopy} to clipboard`);
        setTimeout(() => {
          button.classList.remove('copied');
          if (label) label.textContent = 'Copy';
        }, 1800);
      }).catch(() => {
        fallbackCopy(textToCopy, button);
      });
    } else {
      fallbackCopy(textToCopy, button);
    }
  }

  function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      button.classList.add('copied');
      const label = button.querySelector('.copy-label');
      if (label) label.textContent = 'Copied!';
      showToast(`Copied ${text} to clipboard`);
      setTimeout(() => {
        button.classList.remove('copied');
        if (label) label.textContent = 'Copy';
      }, 1800);
    } catch {
      showToast(`Value: ${text}`);
    }
    document.body.removeChild(textArea);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    performConversion();
  });

  tempInput.addEventListener('input', () => {
    if (errorBanner.classList.contains('show')) {
      const validation = validateInput(tempInput.value, fromUnit.value);
      if (validation.valid) {
        clearError();
      }
    }
  });

  fromUnit.addEventListener('change', () => {
    updateActiveBadge();
    clearError();
    if (tempInput.value.trim() !== '') {
      performConversion();
    }
  });

  swapUnitBtn.addEventListener('click', cycleUnit);
  resetBtn.addEventListener('click', handleReset);
  themeToggle.addEventListener('click', toggleTheme);

  clearHistoryBtn.addEventListener('click', () => {
    sessionStorage.removeItem(HISTORY_STORAGE_KEY);
    renderHistory();
    showToast('Conversion history cleared');
  });

  copyCelsiusBtn.addEventListener('click', () => handleCopy(copyCelsiusBtn, celsiusValue));
  copyFahrenheitBtn.addEventListener('click', () => handleCopy(copyFahrenheitBtn, fahrenheitValue));
  copyKelvinBtn.addEventListener('click', () => handleCopy(copyKelvinBtn, kelvinValue));

  initTheme();
  updateActiveBadge();
  renderHistory();
})();
