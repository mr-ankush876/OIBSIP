# Task 3: Temperature Converter Website — ThermoFlow

**ThermoFlow** is a modern, high-precision thermodynamic conversion web application engineered as **Task 3 (Level 1)** of the **Oasis Infobyte (OIBSIP) Web Development & Designing Internship**.

- **Intern Name**: Ankush Kumar
- **Role**: Web Developer
- **Organization**: [Oasis Infobyte (OIBSIP)](https://oasisinfobyte.com/)
- **Domain**: Web Development & Designing
- **Tech Stack**: HTML5, CSS3 (Custom Properties & Glassmorphism), Vanilla JavaScript (ES6+)

---

## 🌟 Key Features

1. **4-Scale Simultaneous Conversion**:
   - Converts seamlessly between **Celsius (°C)**, **Fahrenheit (°F)**, **Kelvin (K)**, and **Rankine (°R)**.
   - Live synchronization across all four scales in the side Matrix panel.

2. **Dynamic Thermal Aura & Visualizer**:
   - Reactive gauge and background aura shifts color dynamically based on thermodynamic state:
     - ❄️ **< 0°C**: Sub-Zero Freezing (`#38bdf8` Cyan Frost)
     - 🍃 **0°C to 18°C**: Cool Climate (`#2dd4bf` Aqua)
     - 🌿 **19°C to 27°C**: Room Comfort (`#10b981` Emerald)
     - ☀️ **28°C to 45°C**: High Heat (`#f59e0b` Amber Gold)
     - 🔥 **46°C to 99°C**: Extreme Heat (`#f97316` Orange)
     - ♨️ **≥ 100°C**: Boiling Vapor (`#ef4444` Crimson)

3. **Step-by-Step Dynamic Formula Derivations**:
   - Shows live calculation equation tailored to the chosen units (e.g., `(25 °C × 9/5) + 32 = 77.00 °F`).

4. **Tactile Range Slider**:
   - Dual-input control syncing standard numerical text field with an interactive thermal range slider.

5. **Quick Physical Benchmark Presets**:
   - One-click presets for physical standards:
     - Absolute Zero (−273.15 °C)
     - Water Freezing Point (0 °C)
     - Standard Room Climate (22 °C)
     - Human Body Temperature (37 °C)
     - Water Boiling Point (100 °C)
     - Sun Surface Photosphere (5,505 °C)

6. **Thermodynamic Limit Protection**:
   - Protects against impossible temperatures below Absolute Zero (0 K / −273.15 °C).

7. **One-Click Clipboard Copy with Toast Notifications**:
   - Copies converted output with instant visual feedback.

8. **Zero External Dependencies**:
   - Built purely with vanilla JavaScript and CSS3 custom properties for maximum performance and zero load latency.

---

## 📐 Mathematical Formulas

| Conversion | Mathematical Formula |
| :--- | :--- |
| **Celsius to Fahrenheit** | $^\circ\text{F} = (^\circ\text{C} \times 9/5) + 32$ |
| **Fahrenheit to Celsius** | $^\circ\text{C} = (^\circ\text{F} - 32) \times 5/9$ |
| **Celsius to Kelvin** | $\text{K} = ^\circ\text{C} + 273.15$ |
| **Kelvin to Celsius** | $^\circ\text{C} = \text{K} - 273.15$ |
| **Fahrenheit to Kelvin** | $\text{K} = (^\circ\text{F} - 32) \times 5/9 + 273.15$ |
| **Kelvin to Fahrenheit** | $^\circ\text{F} = (\text{K} - 273.15) \times 9/5 + 32$ |
| **Celsius to Rankine** | $^\circ\text{R} = (^\circ\text{C} + 273.15) \times 9/5$ |
| **Rankine to Celsius** | $^\circ\text{C} = (^\circ\text{R} - 491.67) \times 5/9$ |

---

## 📁 File Structure

```text
Task3_TemperatureConverter/
├── index.html       # Semantic HTML5 structure & accessibility attributes
├── style.css        # Modern glassmorphism stylesheet & responsive queries
├── script.js        # Vanilla JS conversion engine, visualizer & event handlers
└── README.md        # Technical documentation & formulas reference
```

---

## 💻 How to Run Locally

1. Open `Task3_TemperatureConverter/index.html` in any modern web browser (Google Chrome, Edge, Firefox, Brave).
2. Or use a local server:
   ```bash
   cd Task3_TemperatureConverter
   npx serve .
   ```
