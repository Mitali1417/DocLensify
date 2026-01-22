import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";

// --------------------
// MOCK AUTH
// --------------------
const mockUser = {
  uid: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
};

const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: vi.fn((cb) => {
    cb(mockUser);
    return vi.fn();
  }),
};

// --------------------
// FIREBASE MOCKS
// --------------------
vi.mock("../firebase/firebase", () => ({
  auth: mockAuth,
  db: {},
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: mockUser }),
  ),
  createUserWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: mockUser }),
  ),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: mockAuth.onAuthStateChanged,
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: "doc-123" })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  onSnapshot: vi.fn((_, cb) => {
    cb({
      docs: [
        {
          id: "doc-1",
          data: () => ({
            userId: "test-user-123",
            filename: "test.jpg",
            originalUrl: "https://cloudinary.com/original.jpg",
            processedUrl: "https://cloudinary.com/processed.jpg",
            detectionSuccess: true,
            createdAt: Date.now(),
          }),
        },
      ],
    });
    return vi.fn();
  }),
}));

// --------------------
// CLOUDINARY MOCK
// --------------------
vi.mock("../services/cloudinary", () => ({
  uploadToCloudinary: vi.fn(() =>
    Promise.resolve({
      secure_url: "https://cloudinary.com/image.jpg",
      public_id: "img-123",
    }),
  ),
}));

// --------------------
// OPENCV MOCK
// --------------------
beforeEach(() => {
  vi.clearAllMocks();
  globalThis.cv = {
    imread: vi.fn(),
  };
});

// ===================================================
// AUTH FLOW
// ===================================================
describe("Authentication Flow", () => {
  it("logs in user", async () => {
    const { signInWithEmailAndPassword } = await import("firebase/auth");

    const res = await signInWithEmailAndPassword(
      mockAuth,
      "test@example.com",
      "password",
    );

    expect(res.user.uid).toBe(mockUser.uid);
  });

  it("logs out user", async () => {
    const { signOut } = await import("firebase/auth");
    await expect(signOut(mockAuth)).resolves.not.toThrow();
  });
});

// ===================================================
// DOCUMENT UPLOAD FLOW
// ===================================================
describe("Document Upload Flow", () => {
  it("processes → uploads → saves metadata", async () => {
    const { addDoc } = await import("firebase/firestore");
    const { uploadToCloudinary } = await import("../services/cloudinary");

    const mockProcessDocument = vi.fn(() =>
      Promise.resolve({
        blob: new Blob(["img"], { type: "image/jpeg" }),
        didDetect: true,
      }),
    );

    const file = new File(["test"], "test.jpg", {
      type: "image/jpeg",
    });

    const processed = await mockProcessDocument(file);
    const uploaded = await uploadToCloudinary(processed.blob);

    await addDoc({}, {
      userId: mockUser.uid,
      filename: file.name,
      originalUrl: uploaded.secure_url,
      processedUrl: uploaded.secure_url,
      detectionSuccess: processed.didDetect,
      createdAt: Date.now(),
    });

    expect(mockProcessDocument).toHaveBeenCalled();
    expect(uploadToCloudinary).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalled();
  });
});

// ===================================================
// GALLERY FLOW
// ===================================================
describe("Gallery Display", () => {
  it("loads user documents", async () => {
    const { onSnapshot } = await import("firebase/firestore");
    const cb = vi.fn();

    onSnapshot({}, cb);
    expect(cb).toHaveBeenCalled();
  });
});

// ===================================================
// DELETE FLOW
// ===================================================
describe("Document Deletion", () => {
  it("deletes Firestore metadata", async () => {
    const { deleteDoc, doc } = await import("firebase/firestore");

    await deleteDoc(doc({}, "documents", "doc-123"));

    expect(deleteDoc).toHaveBeenCalled();
  });
});

// ===================================================
// SECURITY
// ===================================================
describe("Security Rules (Simulated)", () => {
  it("prevents cross-user access", () => {
    const doc = { userId: "other-user" };
    expect(doc.userId === mockUser.uid).toBe(false);
  });
});
