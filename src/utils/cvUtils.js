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

export async function processDocument(sourceElement) {
  const src = cv.imread(sourceElement);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
  cv.Canny(blurred, edges, 75, 200);

  // Try detecting contours
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
    edges,
    contours,
    hierarchy,
    cv.RETR_LIST,
    cv.CHAIN_APPROX_SIMPLE,
  );

  let didDetect = false;
  let output = new cv.Mat();

  if (contours.size() > 0) {
    // Take the largest contour
    let maxArea = 0;
    let maxContour = null;

    for (let i = 0; i < contours.size(); i++) {
      const area = cv.contourArea(contours.get(i));
      if (area > maxArea) {
        maxArea = area;
        maxContour = contours.get(i);
      }
    }

    if (maxContour) {
      didDetect = true;
      cv.drawContours(src, contours, -1, new cv.Scalar(0, 255, 0), 2);
      output = src.clone();
    }
  }

  // Fallback: grayscale transform (still a transformation!)
  if (!didDetect) {
    cv.resize(gray, gray, new cv.Size(0, 0), 1.2, 1.2);
    cv.adaptiveThreshold(
      gray,
      output,
      255,
      cv.ADAPTIVE_THRESH_MEAN_C,
      cv.THRESH_BINARY,
      15,
      5,
    );
  }

  const canvas = document.createElement("canvas");
  cv.imshow(canvas, output);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );

  // Cleanup
  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();
  output.delete();

  return { blob, didDetect };
}
