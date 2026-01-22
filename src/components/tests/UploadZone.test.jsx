import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadZone from "../UploadZone";

// --------------------
// MOCKS
// --------------------

// Mock Cloudinary upload service
vi.mock("@/services/cloudinary", () => ({
  uploadToCloudinary: vi.fn(),
}));

// Mock Firestore metadata save
vi.mock("@/services/firestore", () => ({
  saveImageMetadata: vi.fn(),
}));

import { uploadToCloudinary } from "@/services/cloudinary";
import { saveImageMetadata } from "@/services/firestore";

// --------------------
// HELPERS
// --------------------

const createFile = (
  name = "test.jpg",
  type = "image/jpeg",
) => {
  return new File(["dummy"], name, { type });
};

// --------------------
// TESTS
// --------------------

describe("UploadZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render upload instructions", () => {
    render(<UploadZone />);

    expect(
      screen.getByText(/drag and drop/i),
    ).toBeInTheDocument();
  });

  it("should accept image file upload", async () => {
    render(<UploadZone />);

    const file = createFile();
    const input = screen.getByTestId("file-input");

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(input.files?.[0]).toBe(file);
  });

  it("should upload image to Cloudinary and store metadata", async () => {
    const mockCloudinaryResponse = {
      secure_url: "https://cloudinary.com/image.jpg",
      public_id: "doc-scan-123",
      width: 800,
      height: 1000,
    };

    uploadToCloudinary.mockResolvedValue(mockCloudinaryResponse);
    saveImageMetadata.mockResolvedValue(true);

    render(<UploadZone />);

    const file = createFile();
    const input = screen.getByTestId("file-input");

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(uploadToCloudinary).toHaveBeenCalledWith(file);
    });

    expect(saveImageMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        url: mockCloudinaryResponse.secure_url,
        publicId: mockCloudinaryResponse.public_id,
      }),
    );
  });

  it("should show error if Cloudinary upload fails", async () => {
    uploadToCloudinary.mockRejectedValue(
      new Error("Cloudinary failed"),
    );

    render(<UploadZone />);

    const file = createFile();
    const input = screen.getByTestId("file-input");

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/upload failed/i),
      ).toBeInTheDocument();
    });
  });

  it("should disable upload button while uploading", async () => {
    uploadToCloudinary.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<UploadZone />);

    const file = createFile();
    const input = screen.getByTestId("file-input");

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(
      screen.getByRole("button", { name: /uploading/i }),
    ).toBeDisabled();
  });

  it("should reject non-image files", async () => {
    render(<UploadZone />);

    const file = new File(["text"], "test.txt", {
      type: "text/plain",
    });

    const input = screen.getByTestId("file-input");

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(
      screen.getByText(/only image files are allowed/i),
    ).toBeInTheDocument();

    expect(uploadToCloudinary).not.toHaveBeenCalled();
  });
});
