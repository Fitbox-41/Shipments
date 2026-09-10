# FitBox Shipments Management System

A unified, enterprise-grade dispatch and shipment control dashboard for **FitBox Sports**, matching the authentication security and design language of the FitBox Admin panel.

---

## 🚀 Key Features

1. **Shared Single Sign-On (JWT) & Database**:
   - Uses the same MongoDB database (`admin_users` and `fitbox_shipments`) and `.env` credentials as FitBox Admin.
   - Any administrator account configured in Admin can sign in seamlessly.

2. **Column Structure & Live Controls**:
   - **RO / PO**: Text format with quick inline edit and upper-case standardizing.
   - **Company**: Dropdown supporting `Amazon`, `BlinkIT`, `Swiggy` with brand styling pills.
   - **Status**: Interactive status toggle/dropdown (`Packing`, `Picked Up`, `Delivered`).
   - **Waybill / CN**: Numeric input with 1-click clipboard copy.
   - **Pickup Date**: Interactive calendar picker.
   - **Delivery Date**: Interactive calendar picker with real-time countdown badge.
   - **Warehouse Name**: Text input for destination fulfillment center.
   - **Boxes**: Numeric counter and volume calculator.
   - **Units**: Numeric counter for item quantities.
   - **Save & Delete**: Individual row save buttons (with modification indicator), bulk save, and safe delete modals.

3. **⚡ Tomorrow's Delivery Spotlight**:
   - Automatically identifies shipments scheduled for tomorrow's delivery.
   - Distinctive warm amber/gold glowing border, badge (`⚡ Tomorrow's Delivery`), and background styling.
   - Pinned to the top of the table (toggleable in toolbar).
   - Dedicated Tomorrow's Deliveries spotlight metric card with live counts, boxes, and units.

4. **Excel Export (`.xlsx`)**:
   - Professional Excel file generation with customized column widths and header themes.
   - **Tomorrow's delivery rows are highlighted** with custom amber-yellow background fill and bold typography.
   - Summary statistics row included at the bottom.

5. **Search & Smart Filters**:
   - Instant search across RO/PO, Waybill, Warehouse, and Company.
   - Fast filter tabs by Company (`Amazon`, `BlinkIT`, `Swiggy`) and Status (`Packing`, `Picked Up`, `Delivered`).

---

## 🛠️ Quick Start

### 1. Backend Server (Port `5002`)
```bash
cd Backend
npm install
npm run start
# Server runs on http://localhost:5002
```

### 2. Frontend Application (Port `5175`)
```bash
cd Frontend
npm install
npm run dev
# Vite dev server runs on http://localhost:5175
```

---

## 📁 Project Architecture

```
d:\PROJECTS\Shipments\
├── Backend\
│   ├── .env                      # Database & JWT secrets (Shared with Admin)
│   ├── package.json              # Express, Mongoose, JWT, Helmet, CORS
│   ├── server.js                 # API server entry & sample seeding
│   ├── models\
│   │   ├── User.js               # Admin authentication model (admin_users collection)
│   │   └── Shipment.js           # Fitbox shipment schema (fitbox_shipments collection)
│   ├── middleware\
│   │   └── auth.js               # JWT Bearer token protection
│   └── routes\
│       ├── auth.js               # Login & verify endpoints
│       └── shipments.js          # Full CRUD, bulk operations, and metrics
└── Frontend\
    ├── package.json              # React 19, Tailwind v4, Lucide, SheetJS
    ├── vite.config.js            # Vite + Tailwind v4 plugin
    ├── index.html                # Google Fonts & SEO metadata
    └── src\
        ├── index.css             # FitBox design tokens, glassmorphism & animations
        ├── contexts\
        │   └── AuthContext.jsx   # Shared JWT state & token verification
        ├── components\
        │   ├── Login.jsx         # FitBox Admin branded login
        │   ├── Topbar.jsx        # Header with refresh & admin profile
        │   ├── StatsRibbon.jsx   # Tomorrow spotlight & summary metrics
        │   ├── ShipmentsTable.jsx# Interactive table with all requested columns
        │   ├── AddShipmentModal.jsx # Add new shipment modal
        │   └── DeleteConfirmModal.jsx # Delete confirmation modal
        ├── utils\
        │   └── excelExport.js    # Styled Excel builder with highlighted tomorrow rows
        └── App.jsx               # Main orchestration shell
```
