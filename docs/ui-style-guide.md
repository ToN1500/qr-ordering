# UI Style Guide: "The Monocle"

## 💎 Core Concept
"The Monocle" style aims for a high-end, minimalist, and professional dining experience. It draws inspiration from luxury lifestyle magazines and boutique hotels.

## 🎨 Color Palette
- **Primary:** `#000000` (Pure Black) - Used for primary buttons, active states, and emphasis.
- **Background:** `#FFFFFF` (Pure White) - Main background for cleanliness.
- **Accents:** 
  - `Grayscale`: `#F9FAFB`, `#F3F4F6`, `#9CA3AF` - Used for borders, subtle backgrounds, and secondary text.
  - `Emerald`: `#10B981` - Used sparingly for "Live" status, "Delivered" states, or "Active" sessions.
  - `Rose`: `#E11D48` - Used for "Occupied" tables or priority alerts.
  - `Amber`: `#F59E0B` - Used for "Cooking" or "In Preparation" status.

## typography
- **Headings (Serif):** Use a classic Serif font (defaulting to Next.js font or `font-serif`) for a sophisticated feel.
  - *Usage:* Page titles, Menu item names, Category headers.
- **Metadata/Labels (Monospace):** Use Monospace (font-mono) for technical details, status labels, and tracking information.
  - *Usage:* "Table #", "Tracking ID", Status badges, "Selection" labels.
  - *Style:* Uppercase, 0.2em - 0.4em tracking (letter-spacing).
- **Body (Serif Italic):** Used for descriptions and welcome messages to add a personal, curated touch.

## 📐 Layout & Components
- **Borders:** 1px width, usually `gray-50` or `gray-100`. Avoid heavy shadows.

- **Global Header:**
  - Sticky at top, `bg-white/95` with `backdrop-blur-md`.
  - Content: Page Title (Left), Navigation Actions (Right).
  - Navigation Actions: Monospace, 10px, uppercase, tracking-widest.
  - Badges: 
    - Cart/Selection: Black circle with white number.
    - Orders/Progress: Small status dot (Amber for in-progress).

- **Buttons:** 
  - `Primary`: Solid black, white text, uppercase mono, generous padding.
  - `Outline`: 1px border, minimalist.
  - `Prominent`: For final actions (e.g., Checkout), use `scale-[1.02]`, `shadow-xl`, and `ring` effects to distinguish from standard primary buttons.

- **Interactive:** Use `backdrop-blur` for modals and headers to create depth.
- **Icons:** **NO EMOJIS.** Use SVG icons or CSS shapes (circles for status dots).
- **Imagery:** Grayscale by default, transitions to color on hover or selection to emphasize quality.

## ✨ Motion & Animation
- Use `animate-in` with `fade-in`, `slide-in-from-bottom`, or `zoom-in`.
- Durations should be elegant (500ms - 1000ms).
- Status indicators (dots) may use a subtle `animate-pulse`.

## ✍️ Copywriting Style
Avoid casual language. Use refined, hospitality-focused terminology:
- **Instead of "Cart"** → Use **"Selection"**
- **Instead of "Order History"** → Use **"Culinary Progress"**
- **Instead of "Table"** → Use **"Residence"** or **"Table Overview"**
- **Instead of "Loading"** → Use **"Curating Selections"** or **"Synchronizing"**

## 🏷️ Status & Labeling Standard

To maintain consistency between the kitchen, service staff, and guests, we use a unified set of status terms.

### 🍴 Order Status (API Entity: `orders`)
| Status Key | Display Label (EN) | Display Label (TH) | UI Treatment |
| :--- | :--- | :--- | :--- |
| `pending` | PENDING | รอรับออเดอร์ | Static Dot (Gray) |
| `cooking` | COOKING | กำลังปรุง | Pulse Dot (Amber) |
| `served` | SERVED | เสิร์ฟแล้ว | Solid Dot (Emerald) |
| `paid` | PAID | ชำระเงินแล้ว | (Hidden from active view) |
| `cancelled`| CANCELLED | ยกเลิก | Text Strikethrough (Gray) |

### 🏠 Residence/Table Status (API Entity: `table_sessions`)
| Status Key | Display Label (EN) | Display Label (TH) | UI Treatment |
| :--- | :--- | :--- | :--- |
| `available` | AVAILABLE | ว่าง | Outline Dot (Gray) |
| `active` | OCCUPIED | มีลูกค้า | Solid Dot (Rose/Emerald) |
| `calling_bill`| BILL REQUESTED | เรียกเก็บเงิน | Pulse Dot (Amber) |
| `completed` | COMPLETED | เสร็จสิ้น | Static Dot (Gray) |

**Rules:**
1. **API Keys:** Always use lower-case `snake_case` for status keys in JSON and Database.
2. **Display:** Labels should be Monospace and Uppercase as per the Metadata standard.
3. **Thai Support:** Always provide the Thai translation for customer-facing interfaces.
4. **Consistency:** Never use synonyms (e.g., "Delivered" for "Served"). Stick to the standard labels defined here.
