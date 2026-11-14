# Task 3: Temperature Converter Web Application — TempConvert

**TempConvert** is a responsive, precision temperature conversion web application engineered as **Task 3 (Level 1)** of the **Oasis Infobyte (OIBSIP) Web Development & Designing Internship**.

- **Intern Name**: Ankush Kumar
- **Role**: Web Developer
- **Organization**: [Oasis Infobyte (OIBSIP)](https://oasisinfobyte.com/)
- **Domain**: Web Development & Designing
- **Tech Stack**: Semantic HTML5, CSS3 (Modern Glassmorphic UI & Dual Theme System), Vanilla JavaScript (ES6+)
- **Repository**: [https://github.com/mr-ankush876/OIBSIP](https://github.com/mr-ankush876/OIBSIP)

---

## 🌡️ Project Overview

**TempConvert** provides accurate, real-time conversion between standard international temperature scales: **Celsius (°C)**, **Fahrenheit (°F)**, and **Kelvin (K)**. 

Built with zero external frameworks or libraries, it incorporates thermodynamic limit protection (absolute zero validation), dynamic mathematical derivation breakdowns, persistent light/dark themes, one-click clipboard copying, and session conversion history powered by `localStorage`.

---

## 🌟 Key Features

1. **Simultaneous Multi-Scale Conversion**:
   - Converts any input value across Celsius (°C), Fahrenheit (°F), and Kelvin (K) in parallel.
   - Distinct visual state differentiation for "Input" source vs. "Target" result cards.

2. **Real-Time Formula Derivation Display**:
   - Displays explicit mathematical transformation formulas for every calculation step:
     - **°C to °F**: `(°C × 9/5) + 32`
     - **°C to K**: `°C + 273.15`
     - **°F to °C**: `(°F − 32) × 5/9`
     - **°F to K**: `(°F − 32) × 5/9 + 273.15`
     - **K to °C**: `K − 273.15`
     - **K to °F**: `(K − 273.15) × 9/5 + 32`

3. **Thermodynamic Limit Enforcement (Absolute Zero)**:
   - Validates inputs against fundamental physical law ($0\text{ K}$, $-273.15\text{ }^\circ\text{C}$, $-459.67\text{ }^\circ\text{F}$).
   - Disallows physically impossible values with accessible inline error notifications.

4. **One-Click Scale Cycling**:
   - Integrated cycle/swap button that swiftly shifts the input scale through °C &rarr; °F &rarr; K with automatic badge and field updates.

5. **Integrated Light / Dark Mode System**:
   - Custom CSS custom property (variables) architecture providing seamless switching between Dark and Light modes.
   - Automatically saves and restores user preference via browser `localStorage`.

6. **Recent Conversion History**:
   - Records past conversions with relative timestamps.
   - Supports clearing history, with data persisted in `localStorage`.

7. **One-Click Clipboard Copying**:
   - Copy any converted temperature value to the system clipboard with an animated checkmark icon and feedback toast notification.

8. **Strict Code Quality Standard**:
   - 100% Vanilla JavaScript (ES6+) encapsulated inside an IIFE with `'use strict'`.
   - Zero external libraries or frameworks (no jQuery, Bootstrap, or Tailwind).
   - Zero unnecessary comments across source files for clean production code.

---

## 📐 Mathematical Formulation Reference

| From | To | Mathematical Formula |
| :--- | :--- | :--- |
| **Celsius (°C)** | **Fahrenheit (°F)** | $F = (C \times \frac{9}{5}) + 32$ |
| **Celsius (°C)** | **Kelvin (K)** | $K = C + 273.15$ |
| **Fahrenheit (°F)** | **Celsius (°C)** | $C = (F - 32) \times \frac{5}{9}$ |
| **Fahrenheit (°F)** | **Kelvin (K)** | $K = (F - 32) \times \frac{5}{9} + 273.15$ |
| **Kelvin (K)** | **Celsius (°C)** | $C = K - 273.15$ |
| **Kelvin (K)** | **Fahrenheit (°F)** | $F = (K - 273.15) \times \frac{9}{5} + 32$ |

---

## 📁 File Structure

```text
Task3_TemperatureConverter/
├── index.html       # Semantic HTML5 application structure & ARIA accessibility
├── style.css        # Responsive layout, glassmorphism UI, & dual light/dark theme system
├── script.js        # Pure vanilla JavaScript conversion engine & localStorage manager
└── README.md        # Technical task documentation
```

---

## 💻 How to Run Locally

1. Open `Task3_TemperatureConverter/index.html` directly in any web browser (Chrome, Edge, Firefox, Brave, Safari).
2. Or run via a local server:
   ```bash
   cd Task3_TemperatureConverter
   npx serve .
   ```

---

## 🌐 Live Deployment on Render / Vercel / Netlify

This task is fully static and self-contained:
- Set **Root Directory** to `Task3_TemperatureConverter`
- Set **Publish Directory** to `.`
- Click **Deploy**

---

&copy; 2026 **Ankush Kumar**. Submitted to **Oasis Infobyte (OIBSIP)** under the Web Development & Designing Internship program.
