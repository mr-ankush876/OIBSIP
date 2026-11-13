(function () {
  'use strict';

  const tempInput = document.getElementById('tempInput');
  const fromUnit = document.getElementById('fromUnit');
  const toUnit = document.getElementById('toUnit');
  const tempSlider = document.getElementById('tempSlider');
  const sliderValuePreview = document.getElementById('sliderValuePreview');
  const sliderMinLabel = document.getElementById('sliderMinLabel');
  const sliderMidLabel = document.getElementById('sliderMidLabel');
  const sliderMaxLabel = document.getElementById('sliderMaxLabel');
  const swapBtn = document.getElementById('swapBtn');
  const resetBtn = document.getElementById('resetBtn');

  const sourceUnitBadge = document.getElementById('sourceUnitBadge');
  const inputLimitTip = document.getElementById('inputLimitTip');
  const resultValue = document.getElementById('resultValue');
  const resultUnitLabel = document.getElementById('resultUnitLabel');
  const formulaText = document.getElementById('formulaText');

  const thermalTag = document.getElementById('thermalTag');
  const thermalIcon = document.getElementById('thermalIcon');
  const thermalTitle = document.getElementById('thermalTitle');
  const thermalCelsiusEquiv = document.getElementById('thermalCelsiusEquiv');
  const gaugeNeedle = document.getElementById('gaugeNeedle');
  const dynamicGlow = document.getElementById('dynamicGlow');

  const matrixValC = document.getElementById('matrixValC');
  const matrixValF = document.getElementById('matrixValF');
  const matrixValK = document.getElementById('matrixValK');
  const matrixValR = document.getElementById('matrixValR');
  const matrixItems = {
    C: document.getElementById('matrixC'),
    F: document.getElementById('matrixF'),
    K: document.getElementById('matrixK'),
    R: document.getElementById('matrixR')
  };
  const roleTags = {
    C: document.getElementById('roleC'),
    F: document.getElementById('roleF'),
    K: document.getElementById('roleK'),
    R: document.getElementById('roleR')
  };

  const presetChips = document.querySelectorAll('.preset-chip');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  const UNIT_SYMBOLS = {
    C: '°C',
    F: '°F',
    K: 'K',
    R: '°R'
  };

  const SLIDER_BOUNDS = {
    C: { min: -100, max: 200, step: 0.5, mid: 50, tip: 'Range: −273.15 °C +' },
    F: { min: -148, max: 392, step: 1, mid: 122, tip: 'Range: −459.67 °F +' },
    K: { min: 0, max: 500, step: 1, mid: 250, tip: 'Range: 0 K +' },
    R: { min: 0, max: 900, step: 1, mid: 450, tip: 'Range: 0 °R +' }
  };

  function toKelvin(value, unit) {
    switch (unit) {
      case 'C': return value + 273.15;
      case 'F': return (value - 32) * (5 / 9) + 273.15;
      case 'K': return value;
      case 'R': return value * (5 / 9);
      default: return value;
    }
  }

  function fromKelvin(kelvin, targetUnit) {
    switch (targetUnit) {
      case 'C': return kelvin - 273.15;
      case 'F': return (kelvin - 273.15) * (9 / 5) + 32;
      case 'K': return kelvin;
      case 'R': return kelvin * (9 / 5);
      default: return kelvin;
    }
  }

  function formatPrecision(num) {
    if (!isFinite(num)) return 'Invalid';
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.001 && num !== 0)) {
      return num.toExponential(3);
    }
    const fixed = num.toFixed(2);
    return fixed.endsWith('.00') ? num.toFixed(0) : fixed;
  }

  function generateFormula(val, from, to, res) {
    if (from === to) {
      return `${val} ${UNIT_SYMBOLS[from]} = ${res} ${UNIT_SYMBOLS[to]} (Identical Unit)`;
    }

    if (from === 'C' && to === 'F') return `(${val} °C × 9/5) + 32 = ${res} °F`;
    if (from === 'F' && to === 'C') return `(${val} °F − 32) × 5/9 = ${res} °C`;
    if (from === 'C' && to === 'K') return `${val} °C + 273.15 = ${res} K`;
    if (from === 'K' && to === 'C') return `${val} K − 273.15 = ${res} °C`;
    if (from === 'F' && to === 'K') return `(${val} °F − 32) × 5/9 + 273.15 = ${res} K`;
    if (from === 'K' && to === 'F') return `(${val} K − 273.15) × 9/5 + 32 = ${res} °F`;
    if (from === 'C' && to === 'R') return `(${val} °C + 273.15) × 9/5 = ${res} °R`;
    if (from === 'R' && to === 'C') return `(${val} °R − 491.67) × 5/9 = ${res} °C`;
    if (from === 'F' && to === 'R') return `${val} °F + 459.67 = ${res} °R`;
    if (from === 'R' && to === 'F') return `${val} °R − 459.67 = ${res} °F`;
    if (from === 'K' && to === 'R') return `${val} K × 1.8 = ${res} °R`;
    if (from === 'R' && to === 'K') return `${val} °R ÷ 1.8 = ${res} K`;

    return `${val} ${UNIT_SYMBOLS[from]} → ${res} ${UNIT_SYMBOLS[to]}`;
  }

  function updateThermalVisuals(celsiusVal) {
    let accent, glow, icon, title;

    if (celsiusVal < 0) {
      accent = '#38bdf8';
      glow = 'rgba(56, 189, 248, 0.35)';
      icon = '❄️';
      title = 'Sub-Zero Freezing Condition';
    } else if (celsiusVal <= 18) {
      accent = '#2dd4bf';
      glow = 'rgba(45, 212, 191, 0.35)';
      icon = '🍃';
      title = 'Cool Ambient Range';
    } else if (celsiusVal <= 27) {
      accent = '#10b981';
      glow = 'rgba(16, 185, 129, 0.35)';
      icon = '🌿';
      title = 'Comfortable Room Environment';
    } else if (celsiusVal <= 45) {
      accent = '#f59e0b';
      glow = 'rgba(245, 158, 11, 0.35)';
      icon = '☀️';
      title = 'High Heat / Summer Range';
    } else if (celsiusVal <= 99) {
      accent = '#f97316';
      glow = 'rgba(249, 115, 22, 0.35)';
      icon = '🔥';
      title = 'Extreme Heat / Scalding Level';
    } else {
      accent = '#ef4444';
      glow = 'rgba(239, 68, 68, 0.4)';
      icon = '♨️';
      title = 'Boiling Point / Superheated Vapor';
    }

    document.documentElement.style.setProperty('--thermal-accent', accent);
    document.documentElement.style.setProperty('--thermal-glow', glow);

    thermalIcon.textContent = icon;
    thermalTitle.textContent = title;
    thermalCelsiusEquiv.textContent = `${formatPrecision(celsiusVal)} °C equivalent`;

    const gaugeMin = -50;
    const gaugeMax = 150;
    let percentage = ((celsiusVal - gaugeMin) / (gaugeMax - gaugeMin)) * 100;
    percentage = Math.max(2, Math.min(98, percentage));
    gaugeNeedle.style.left = `${percentage}%`;

    if (dynamicGlow) {
      dynamicGlow.style.background = `radial-gradient(circle, ${glow}, transparent 70%)`;
    }
  }

  function updateSliderBounds(unit) {
    const cfg = SLIDER_BOUNDS[unit] || SLIDER_BOUNDS.C;
    tempSlider.min = cfg.min;
    tempSlider.max = cfg.max;
    tempSlider.step = cfg.step;
    sliderMinLabel.textContent = `${cfg.min}°`;
    sliderMidLabel.textContent = `${cfg.mid}°`;
    sliderMaxLabel.textContent = `${cfg.max}°`;
    inputLimitTip.textContent = cfg.tip;
  }

  function calculate() {
    const rawVal = parseFloat(tempInput.value);
    const sourceUnit = fromUnit.value;
    const targetUnit = toUnit.value;

    sourceUnitBadge.textContent = UNIT_SYMBOLS[sourceUnit];
    resultUnitLabel.textContent = UNIT_SYMBOLS[targetUnit];

    if (isNaN(rawVal)) {
      resultValue.textContent = '---';
      formulaText.textContent = 'Please enter a valid numeric temperature value.';
      return;
    }

    const kelvinVal = toKelvin(rawVal, sourceUnit);

    if (kelvinVal < 0) {
      resultValue.textContent = 'Below 0 K';
      formulaText.textContent = 'Warning: Thermodynamic temperature cannot drop below Absolute Zero (0 Kelvin).';
      updateThermalVisuals(-273.15);
      return;
    }

    const convertedVal = fromKelvin(kelvinVal, targetUnit);
    const formattedResult = formatPrecision(convertedVal);
    resultValue.textContent = formattedResult;

    const formattedInput = formatPrecision(rawVal);
    formulaText.textContent = generateFormula(formattedInput, sourceUnit, targetUnit, formattedResult);

    const celsiusVal = fromKelvin(kelvinVal, 'C');
    updateThermalVisuals(celsiusVal);

    sliderValuePreview.textContent = `${formattedInput} ${UNIT_SYMBOLS[sourceUnit]}`;
    if (rawVal >= parseFloat(tempSlider.min) && rawVal <= parseFloat(tempSlider.max)) {
      tempSlider.value = rawVal;
    }

    const allScales = {
      C: fromKelvin(kelvinVal, 'C'),
      F: fromKelvin(kelvinVal, 'F'),
      K: kelvinVal,
      R: fromKelvin(kelvinVal, 'R')
    };

    matrixValC.textContent = `${formatPrecision(allScales.C)} °C`;
    matrixValF.textContent = `${formatPrecision(allScales.F)} °F`;
    matrixValK.textContent = `${formatPrecision(allScales.K)} K`;
    matrixValR.textContent = `${formatPrecision(allScales.R)} °R`;

    ['C', 'F', 'K', 'R'].forEach((u) => {
      const item = matrixItems[u];
      const role = roleTags[u];
      item.classList.remove('active-target', 'source-unit');

      if (u === sourceUnit) {
        item.classList.add('source-unit');
        role.textContent = 'Source';
      } else if (u === targetUnit) {
        item.classList.add('active-target');
        role.textContent = 'Target';
      } else {
        role.textContent = 'Output';
      }
    });
  }

  tempInput.addEventListener('input', () => {
    presetChips.forEach(c => c.classList.remove('active'));
    calculate();
  });

  tempSlider.addEventListener('input', (e) => {
    tempInput.value = e.target.value;
    presetChips.forEach(c => c.classList.remove('active'));
    calculate();
  });

  fromUnit.addEventListener('change', () => {
    updateSliderBounds(fromUnit.value);
    presetChips.forEach(c => c.classList.remove('active'));
    calculate();
  });

  toUnit.addEventListener('change', () => {
    calculate();
  });

  swapBtn.addEventListener('click', () => {
    const currentFrom = fromUnit.value;
    const currentTo = toUnit.value;

    const currentResult = parseFloat(resultValue.textContent);

    fromUnit.value = currentTo;
    toUnit.value = currentFrom;
    updateSliderBounds(toUnit.value);

    if (!isNaN(currentResult)) {
      tempInput.value = currentResult;
    }

    presetChips.forEach(c => c.classList.remove('active'));
    calculate();
  });

  resetBtn.addEventListener('click', () => {
    fromUnit.value = 'C';
    toUnit.value = 'F';
    updateSliderBounds('C');
    tempInput.value = '25';
    presetChips.forEach(c => c.classList.remove('active'));
    calculate();
    showToast('Reset to standard room temperature (25 °C / 77 °F)');
  });

  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const presetTemp = parseFloat(chip.getAttribute('data-temp'));
      fromUnit.value = 'C';
      updateSliderBounds('C');
      tempInput.value = presetTemp;
      calculate();

      showToast(`Loaded preset: ${chip.querySelector('.preset-name').textContent}`);
    });
  });

  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  copyResultBtn.addEventListener('click', async () => {
    const resText = `${resultValue.textContent} ${resultUnitLabel.textContent}`;
    try {
      await navigator.clipboard.writeText(resText);
      copyBtnText.textContent = 'Copied!';
      showToast(`Copied ${resText} to clipboard!`);
      setTimeout(() => {
        copyBtnText.textContent = 'Copy';
      }, 2000);
    } catch {
      showToast(`Result: ${resText}`);
    }
  });

  updateSliderBounds('C');
  calculate();
})();
