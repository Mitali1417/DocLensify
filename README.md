## DocLensify

**DocLensify** is a React-based web application that allows users to upload images or PDFs and automatically detects, crops, and perspective-corrects documents. The app provides a clean before/after comparison, securely persists uploads per user, and maintains a personal document gallery.

The project is built **strictly using open-source libraries** and follows the constraints and expectations of the Full-Stack Intern Assignment.

**Live App:** https://doclensify.vercel.app/  
**GitHub Repo:** https://github.com/Mitali1417/DocLensify

---

## Architecture Overview

### High-Level Flow

User
└── Upload (Image / PDF)
├── PDF → Canvas (pdf.js)
├── Image / Canvas → OpenCV.js
│ ├── Edge detection
│ ├── Contour detection
│ ├── Quadrilateral selection
│ └── Perspective warp
├── Original & processed images
├── Cloud upload
└── Metadata saved (Firestore)

### Key Design Decisions

- **Client-side document detection** using OpenCV.js (no paid APIs)
- **Service-based architecture** for PDF, Cloud upload, and CV logic
- Firebase used only for **Auth + Firestore** (no paid Storage / Functions)

---

## How Auto-Crop Works (Algorithm)

1. **Input Preparation**
   - Image: loaded directly
   - PDF: first page rendered to canvas via `pdf.js`

2. **Pre-processing**
   - Convert to grayscale
   - Gaussian blur to reduce noise
   - Adaptive thresholding

3. **Edge Detection**
   - Canny edge detection
   - Morphological closing to strengthen edges

4. **Contour Detection**
   - Find external contours
   - Filter by area threshold
   - Approximate polygons

5. **Document Selection**
   - Select the largest valid quadrilateral
   - Sort points clockwise

6. **Perspective Warp**
   - Compute transformation matrix
   - Warp image into a rectangular output

7. **Fail-Safe Handling**
   - If detection confidence is low:
     - Fall back to best rectangle
     - Warn the user

---

## 🖼 Features

### Authentication

- Email & password sign-in / Google Authentication
- Per-user data isolation

### Upload

- Supports **PNG, JPEG, PDF**
- PDF first page rendered automatically

### Auto Document Scanner

- Perspective-corrected output
- Tight crop with minimal background
- Handles rotated images & mild clutter

### Before / After Preview

- Clear visual comparison
- Zoom-friendly UI

### Gallery

- Lists all user uploads
- Click to view before/after
- Persistent across sessions

### UX & Reliability

- Loading indicators
- Progress messages
- Error states with retry prompts

---

## Testing

- **Unit tests** for:
  - Geometry utilities
  - Document validation
  - Perspective transform logic
- **Integration tests** for:
  - Upload → process → persist flow
  - Auth flows
  - Gallery rendering

Testing setup uses **Vitest + React Testing Library** with mocked services.

---

## Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- shadcn/ui
- OpenCV.js
- pdf.js
- Axios

### Backend / Platform

- Firebase Authentication
- Firebase Firestore

### Testing

- Vitest
- @testing-library/react

---

## Open-Source Libraries Used

| Library      | License    |
| ------------ | ---------- |
| React        | MIT        |
| OpenCV.js    | Apache 2.0 |
| pdf.js       | Apache 2.0 |
| Firebase SDK | Apache 2.0 |
| Tailwind CSS | MIT        |
| Vitest       | MIT        |

✅ No closed-source or commercial AI/CV APIs used.

---

## Security Considerations

- User-scoped Firestore queries
- Auth-based access control
- Client-side validation for file types
- No cross-user data exposure

---

## Setup Instructions

### 1️⃣ Clone the Repo

```bash

git clone https://github.com/Mitali1417/DocLensify.git
cd DocLensify

```

2️⃣ Install Dependencies

```bash
npm install

```

3️⃣ Environment Variables

Create .env in root:

```bash

VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_CLOUDINARY_CLOUD_NAME=your_cloud
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

```

4️⃣ Run Locally

```bash

npm run dev

```

5️⃣ Run Tests

````bash

npm run test

```bash

### Test Credentials
Email: testuser@example.com
Password: test@123
(Or create a new account directly in the app)
````
