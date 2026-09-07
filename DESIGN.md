# 🎨 Photobooth Design System

## Neomorph White + Red Style

Design system modern dengan aesthetic neomorphism putih dan aksen merah.

---

## 🎯 Design Philosophy

**Neomorphism** = Soft, minimalist UI dengan subtle shadows dan embossed effect
- Warna utama: **Putih** (#FFFFFF, #F8F8F8)
- Warna aksen: **Merah** (#FF4757, #FF3838, #E74C3C)
- Tipografi: Rounded, clean, modern

---

## 🎨 Color Palette

### Primary Colors
```css
/* Neomorph White Base */
--color-bg-primary: #F8F8F8;      /* Light bg */
--color-bg-secondary: #FFFFFF;    /* Card bg */
--color-bg-tertiary: #EFEFEF;     /* Hover bg */

/* Accent Red */
--color-accent-primary: #FF4757;  /* Action buttons */
--color-accent-hover: #FF3838;    /* Hover state */
--color-accent-dark: #E74C3C;     /* Active state */
--color-accent-light: #FFE5E5;    /* Light background */

/* Text */
--color-text-primary: #2C3E50;    /* Main text */
--color-text-secondary: #7F8C8D;  /* Secondary text */
--color-text-light: #95A5A6;      /* Disabled text */

/* Borders & Shadows */
--color-border: #E8E8E8;
--color-shadow-light: #D4D4D4;
--color-shadow-dark: #FFFFFF;
```

### Semantic Colors
```css
--color-success: #2ECC71;
--color-warning: #F39C12;
--color-error: #E74C3C;
--color-info: #3498DB;
```

---

## 🌓 Neomorph Shadow System

### Soft Shadow (Default)
```css
.neomorph-soft {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  box-shadow: 
    8px 8px 16px #D4D4D4,      /* Bottom-right shadow */
    -8px -8px 16px #FFFFFF;    /* Top-left highlight */
}
```

### Pressed/Inset Shadow (Active)
```css
.neomorph-pressed {
  background: linear-gradient(135deg, #EFEFEF 0%, #F8F8F8 100%);
  box-shadow: 
    inset 4px 4px 8px #D4D4D4,
    inset -4px -4px 8px #FFFFFF;
}
```

### Raised Shadow (Hover)
```css
.neomorph-raised {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  box-shadow: 
    12px 12px 24px #D4D4D4,
    -12px -12px 24px #FFFFFF;
}
```

### Bright/Accent (Red)
```css
.neomorph-accent {
  background: linear-gradient(135deg, #FF4757 0%, #E74C3C 100%);
  box-shadow: 
    8px 8px 16px rgba(232, 74, 87, 0.4),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
  color: #FFFFFF;
}
```

---

## 📐 Typography

### Font Family
```css
body {
  font-family: 'Segoe UI', 'Roboto', 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Font Scales
```css
/* H1 - Page Title */
h1 {
  font-size: 3rem;      /* 48px */
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

/* H2 - Section Title */
h2 {
  font-size: 2rem;      /* 32px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}

/* H3 - Subsection */
h3 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text-primary);
}

/* Body */
body {
  font-size: 1rem;      /* 16px */
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-text-primary);
}

/* Small */
small {
  font-size: 0.875rem;  /* 14px */
  font-weight: 400;
  color: var(--color-text-secondary);
}

/* Label */
label {
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
```

---

## 🔘 Component Designs

### Buttons

#### Primary Button (Red Accent)
```css
.btn-primary {
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF4757 0%, #E74C3C 100%);
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    8px 8px 16px rgba(232, 74, 87, 0.4),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.btn-primary:hover {
  box-shadow: 
    12px 12px 24px rgba(232, 74, 87, 0.5),
    -12px -12px 24px rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.btn-primary:active {
  box-shadow: 
    inset 4px 4px 8px rgba(232, 74, 87, 0.6),
    inset -4px -4px 8px rgba(255, 255, 255, 0.5);
  transform: translateY(0);
}
```

#### Secondary Button (White Neomorph)
```css
.btn-secondary {
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    8px 8px 16px #D4D4D4,
    -8px -8px 16px #FFFFFF;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  box-shadow: 
    12px 12px 24px #D4D4D4,
    -12px -12px 24px #FFFFFF;
  transform: translateY(-2px);
}

.btn-secondary:active {
  box-shadow: 
    inset 4px 4px 8px #D4D4D4,
    inset -4px -4px 8px #FFFFFF;
  transform: translateY(0);
}
```

#### Icon Button
```css
.btn-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 
    8px 8px 16px #D4D4D4,
    -8px -8px 16px #FFFFFF;
}

.btn-icon:hover {
  box-shadow: 
    12px 12px 24px #D4D4D4,
    -12px -12px 24px #FFFFFF;
  transform: scale(1.05);
}

.btn-icon.accent {
  background: linear-gradient(135deg, #FF4757 0%, #E74C3C 100%);
  color: #FFFFFF;
  box-shadow: 
    8px 8px 16px rgba(232, 74, 87, 0.4),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}
```

---

### Cards & Containers

#### Neomorph Card
```css
.card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    8px 8px 16px #D4D4D4,
    -8px -8px 16px #FFFFFF;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 
    12px 12px 24px #D4D4D4,
    -12px -12px 24px #FFFFFF;
  transform: translateY(-4px);
}
```

#### Photo Frame
```css
.photo-frame {
  aspect-ratio: 3/1;
  background: #F8F8F8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 
    8px 8px 16px #D4D4D4,
    -8px -8px 16px #FFFFFF;
  border: 2px solid #E8E8E8;
}

.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

#### Checkbox (Custom)
```css
.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  border: 2px solid #E8E8E8;
  cursor: pointer;
  box-shadow: 
    4px 4px 8px #D4D4D4,
    -4px -4px 8px #FFFFFF;
  transition: all 0.2s ease;
}

.checkbox:hover {
  box-shadow: 
    6px 6px 12px #D4D4D4,
    -6px -6px 12px #FFFFFF;
}

.checkbox.checked {
  background: linear-gradient(135deg, #FF4757 0%, #E74C3C 100%);
  border-color: #E74C3C;
  box-shadow: 
    inset 4px 4px 8px rgba(232, 74, 87, 0.5),
    inset -4px -4px 8px rgba(255, 255, 255, 0.5);
}

.checkbox.checked::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 14px;
}
```

---

### Input Fields

#### Text Input
```css
input[type="text"],
input[type="number"],
textarea {
  padding: 12px 16px;
  border: 2px solid #E8E8E8;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  font-size: 1rem;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
  box-shadow: 
    inset 2px 2px 4px #D4D4D4,
    inset -2px -2px 4px #FFFFFF;
}

input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: #FF4757;
  box-shadow: 
    inset 2px 2px 4px #D4D4D4,
    inset -2px -2px 4px #FFFFFF,
    0 0 0 3px rgba(255, 71, 87, 0.1);
}

input[type="text"]::placeholder {
  color: var(--color-text-light);
}
```

---

### Status Badges

```css
.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.success {
  background: linear-gradient(135deg, #E8F8F5 0%, #D5F4E6 100%);
  color: #27AE60;
  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.1);
}

.badge.error {
  background: linear-gradient(135deg, #FADBD8 0%, #F5B7B1 100%);
  color: #C0392B;
  box-shadow: 0 2px 4px rgba(192, 57, 43, 0.1);
}

.badge.warning {
  background: linear-gradient(135deg, #FCF3CF 0%, #F9E79F 100%);
  color: #D68910;
  box-shadow: 0 2px 4px rgba(214, 137, 16, 0.1);
}

.badge.info {
  background: linear-gradient(135deg, #D6EAF8 0%, #AED6F1 100%);
  color: #2980B9;
  box-shadow: 0 2px 4px rgba(41, 128, 185, 0.1);
}
```

---

## 🖼️ Screen Layouts

### Camera Preview Screen
```
┌─────────────────────────────────────────┐
│                                         │
│  🔴 LIVE PREVIEW                        │
│  ┌──────────────────────────────────┐   │
│  │                                  │   │
│  │    [📷 Live DSLR Feed]           │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                         │
│     [Capture] [Gallery]                 │
│                                         │
│  Status: ✓ Connected                    │
└─────────────────────────────────────────┘

CSS:
.camera-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #F8F8F8 0%, #FFFFFF 100%);
  padding: 20px;
}

.camera-feed {
  width: 100%;
  max-width: 800px;
  aspect-ratio: 4/3;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    16px 16px 32px #D4D4D4,
    -16px -16px 32px #FFFFFF;
  margin-bottom: 40px;
}

.button-group {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.status-bar {
  padding: 12px 24px;
  background: linear-gradient(135deg, #E8F8F5 0%, #D5F4E6 100%);
  border-radius: 12px;
  color: #27AE60;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 
    4px 4px 8px rgba(39, 174, 96, 0.1),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
}
```

### Photo Gallery Screen
```
┌─────────────────────────────────────────┐
│                                         │
│  📷 YOUR PHOTOS                         │
│  Showing 3 of 6                         │
│                                         │
│  ☐ [Thumb1]  ☐ [Thumb2]  ☐ [Thumb3]   │
│  ☐ [Thumb4]  ☐ [Thumb5]  ☐ [Thumb6]   │
│                                         │
│  Selected: 2/3                          │
│                                         │
│  [Edit] [Print] [Download]             │
└─────────────────────────────────────────┘

CSS:
.gallery-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px;
}

.photo-thumbnail {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    8px 8px 16px #D4D4D4,
    -8px -8px 16px #FFFFFF;
}

.photo-thumbnail:hover {
  transform: translateY(-4px);
  box-shadow: 
    12px 12px 24px #D4D4D4,
    -12px -12px 24px #FFFFFF;
}

.photo-thumbnail.selected::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #FF4757 0%, #E74C3C 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(232, 74, 87, 0.3);
}
```

### Layout Builder Screen (3x1)
```
┌─────────────────────────────────────────┐
│                                         │
│  🎨 LAYOUT BUILDER                      │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ [Photo1] │ [Photo2] │ [Photo3]   │   │
│  │  3x1     │         │             │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Drag to rearrange photos              │
│                                         │
│  [Rearrange] [Edit] [Preview]          │
│  [Print] [Download]                    │
└─────────────────────────────────────────┘

CSS:
.layout-3x1 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 1200px;
  aspect-ratio: 3/1;
  padding: 16px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  border-radius: 16px;
  box-shadow: 
    8px 8px 16px #D4D4D4,
    -8px -8px 16px #FFFFFF;
}

.layout-item {
  background: #F8F8F8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 
    inset 4px 4px 8px #D4D4D4,
    inset -4px -4px 8px #FFFFFF;
  transition: all 0.3s ease;
}

.layout-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.layout-item.dragging {
  opacity: 0.7;
  transform: scale(0.95);
}
```

---

## 🎬 Animations & Transitions

### Button Click
```css
@keyframes button-press {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
  100% {
    transform: translateY(0);
  }
}

.btn-primary:active {
  animation: button-press 0.3s ease;
}
```

### Photo Capture Flash
```css
@keyframes camera-flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.capture-flash {
  animation: camera-flash 0.6s ease-out;
}
```

### Slide In
```css
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter {
  animation: slide-in 0.3s ease-out;
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 640px) {
  h1 { font-size: 2rem; }
  .gallery-container {
    grid-template-columns: repeat(2, 1fr);
  }
  .button-group {
    flex-direction: column;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  h1 { font-size: 2.5rem; }
  .gallery-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  h1 { font-size: 3rem; }
  .gallery-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 🎯 Accessibility (A11y)

```css
/* Focus Visible */
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid #FF4757;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: more) {
  :root {
    --color-text-primary: #000000;
    --color-shadow-light: #999999;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark Mode (Optional) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1A1A1A;
    --color-bg-secondary: #2A2A2A;
    --color-text-primary: #FFFFFF;
  }
}
```

---

## 🎯 Usage Examples

### React Component Example
```jsx
// Button
<button className="btn-primary">
  📷 Capture Photo
</button>

// Card
<div className="card">
  <h3>Your Photos</h3>
  <p>Total: 6 photos</p>
</div>

// Photo Frame
<div className="photo-frame">
  <img src="photo.jpg" alt="Photo 1" />
</div>

// Layout
<div className="layout-3x1">
  <div className="layout-item"><img src="1.jpg" /></div>
  <div className="layout-item"><img src="2.jpg" /></div>
  <div className="layout-item"><img src="3.jpg" /></div>
</div>
```

### CSS Class Quick Reference
```
.btn-primary         - Red action button
.btn-secondary       - White/soft button
.btn-icon            - Circular icon button
.card                - Neomorph card container
.photo-frame         - 3/1 aspect ratio frame
.checkbox            - Custom checkbox
.badge               - Status badge
.status-bar          - Status indicator
.gallery-container   - Photo grid
.layout-3x1          - 3x1 print layout
```

---

## ✨ Best Practices

1. **Consistency**: Gunakan color variables dan shadow system yang sudah defined
2. **Spacing**: Gunakan increment 4px (4, 8, 12, 16, 20, 24, 32...)
3. **Shadows**: Jangan override shadow system, gunakan yang sudah ada
4. **Transitions**: Max 0.3s untuk UI feedback, 0.6s untuk animations
5. **Contrast**: Pastikan WCAG AA compliant (ratio 4.5:1 minimum)
6. **Rounded Corners**: 12px untuk buttons, 16px untuk cards, 20px untuk modals

---

**Last Updated**: September 2026  
**Design System v1.0**
