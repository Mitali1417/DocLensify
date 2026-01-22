import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function pdfToCanvas(
  file,
  { pageNumber = 1, scale = 2 } = {}
) {
  let url;

  try {
    url = URL.createObjectURL(file);

    const pdf = await pdfjsLib.getDocument(url).promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  } catch (err) {
    console.error("PDF render failed", err);
    throw new Error("Unable to process PDF file");
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}
