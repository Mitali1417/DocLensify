/* global cv */

//  Sort 4 points in clockwise order: TL, TR, BR, BL

const sortPoints = (points) => {
  // Calculate center point
  const center = {
    x: points.reduce((sum, p) => sum + p.x, 0) / 4,
    y: points.reduce((sum, p) => sum + p.y, 0) / 4,
  };

  // Sort by angle from center
  const sorted = points.sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);
    return angleA - angleB;
  });

  return sorted;
};

// Calculate Euclidean distance between two points

const distance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Calculate optimal output dimensions based on detected corners

const calculateOutputSize = (sortedPoints) => {
  // Calculate width as max of top and bottom edge lengths
  const topWidth = distance(sortedPoints[0], sortedPoints[1]);
  const bottomWidth = distance(sortedPoints[2], sortedPoints[3]);
  const width = Math.max(topWidth, bottomWidth);

  // Calculate height as max of left and right edge lengths
  const leftHeight = distance(sortedPoints[0], sortedPoints[3]);
  const rightHeight = distance(sortedPoints[1], sortedPoints[2]);
  const height = Math.max(leftHeight, rightHeight);

  return { width: Math.round(width), height: Math.round(height) };
};

// Apply perspective transformation to correct document skew

export const applyPerspectiveWarp = (
  src,
  sortedPoints,
  outputWidth,
  outputHeight,
) => {
  try {
    // Flatten sorted points to array format
    const srcArray = sortedPoints.flatMap((p) => [p.x, p.y]);

    // Define destination points (perfect rectangle)
    const dstArray = [
      0,
      0,
      outputWidth,
      0,
      outputWidth,
      outputHeight,
      0,
      outputHeight,
    ];

    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, srcArray);
    const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, dstArray);

    // Calculate transformation matrix
    const M = cv.getPerspectiveTransform(srcPts, dstPts);
    const dsize = new cv.Size(outputWidth, outputHeight);
    const dst = new cv.Mat();

    // Apply perspective warp
    cv.warpPerspective(
      src,
      dst,
      M,
      dsize,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar(255, 255, 255, 255),
    );

    M.delete();
    srcPts.delete();
    dstPts.delete();

    return dst;
  } catch (err) {
    console.error("Perspective warp error:", err);
    return null;
  }
};

// Validate if contour is likely a document

const isValidDocument = (contour, imageArea) => {
  const area = cv.contourArea(contour);
  const areaRatio = area / imageArea;

  // Document should occupy 10-95% of image
  if (areaRatio < 0.1 || areaRatio > 0.95) {
    return false;
  }

  // Check if it's roughly rectangular
  const peri = cv.arcLength(contour, true);
  const approx = new cv.Mat();
  cv.approxPolyDP(contour, approx, 0.02 * peri, true);

  const isQuadrilateral = approx.rows === 4;
  approx.delete();

  return isQuadrilateral;
};

export const processDocument = async (imageElement) => {
  return new Promise((resolve, reject) => {
    try {
      const cv = window.cv;
      if (!cv) {
        reject(new Error("OpenCV not loaded"));
        return;
      }

      const src = cv.imread(imageElement);
      const imageArea = src.rows * src.cols;

      // Create working copies
      const gray = new cv.Mat();
      const blurred = new cv.Mat();
      const edges = new cv.Mat();

      // Preprocessing pipeline
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

      // Adaptive thresholding often works better than Canny for documents
      cv.adaptiveThreshold(
        blurred,
        edges,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2,
      );

      // Also try Canny for edge detection
      const cannyEdges = new cv.Mat();
      cv.Canny(blurred, cannyEdges, 50, 150);

      // Combine both edge detection methods
      cv.bitwise_or(edges, cannyEdges, edges);

      // Morphological operations to close gaps
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);
      kernel.delete();

      // Find contours
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(
        edges,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE,
      );

      let bestContour = null;
      let maxArea = 0;

      // Find the largest valid quadrilateral
      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);

        if (isValidDocument(cnt, imageArea)) {
          const area = cv.contourArea(cnt);

          if (area > maxArea) {
            const peri = cv.arcLength(cnt, true);
            const approx = new cv.Mat();
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

            if (approx.rows === 4) {
              if (bestContour) bestContour.delete();
              bestContour = approx;
              maxArea = area;
            } else {
              approx.delete();
            }
          }
        }
        cnt.delete();
      }

      const canvas = document.createElement("canvas");
      let result = null;
      let didDetect = false;

      if (bestContour && maxArea > imageArea * 0.1) {
        // Extract corner points
        const points = [];
        for (let i = 0; i < 4; i++) {
          points.push({
            x: bestContour.data32S[i * 2],
            y: bestContour.data32S[i * 2 + 1],
          });
        }

        // Sort points in proper order
        const sortedPoints = sortPoints(points);

        // Calculate optimal output dimensions
        const { width, height } = calculateOutputSize(sortedPoints);

        // Apply perspective correction
        result = applyPerspectiveWarp(src, sortedPoints, width, height);

        if (result) {
          // Enhance the warped image
          const enhanced = new cv.Mat();

          // Convert to grayscale for better document readability
          cv.cvtColor(result, enhanced, cv.COLOR_RGBA2GRAY);

          // Apply adaptive thresholding for crisp text
          const binary = new cv.Mat();
          cv.adaptiveThreshold(
            enhanced,
            binary,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY,
            11,
            2,
          );

          // Convert back to RGBA for display
          cv.cvtColor(binary, enhanced, cv.COLOR_GRAY2RGBA);

          cv.imshow(canvas, enhanced);
          didDetect = true;

          enhanced.delete();
          binary.delete();
          result.delete();
        }

        bestContour.delete();
      }

      // return original if no document detected
      if (!didDetect) {
        console.warn("No document detected, returning original");
        cv.imshow(canvas, src);
      }

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, didDetect });
          } else {
            reject(new Error("Failed to create blob"));
          }

          // Cleanup
          src.delete();
          gray.delete();
          blurred.delete();
          edges.delete();
          cannyEdges.delete();
          contours.delete();
          hierarchy.delete();
        },
        "image/jpeg",
        0.95,
      );
    } catch (err) {
      console.error("Document processing error:", err);
      reject(err);
    }
  });
};
