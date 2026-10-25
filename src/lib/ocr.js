// On-device OCR gamit ang Tesseract.js (v5).
// Lazy import para hindi bumigat ang initial load.

let workerPromise = null;
// Kasalukuyang progress callback (ina-update bago mag-recognize).
let progressCb = null;

// Gumawa (o gamitin ulit) ang worker. Hinahayaan ang error na umakyat
// para makita sa UI — HINDI itinatago.
async function getWorker() {
  if (!workerPromise) {
    workerPromise = import("tesseract.js").then(async ({ createWorker }) => {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (progressCb && m.status === "recognizing text") {
            progressCb(m.progress);
          }
        },
      });
      // Mga parameter na bagay sa packaging/label (sparse na malalaking text).
      await worker.setParameters({
        tessedit_pageseg_mode: "11", // PSM 11: sparse text, hanapin kahit saan
        preserve_interword_spaces: "1",
      });
      return worker;
    });
    // Kung nabigo, i-reset para masubukang muli sa susunod.
    workerPromise.catch(() => {
      workerPromise = null;
    });
  }
  return workerPromise;
}

// Preprocess: upscale, grayscale, at i-boost ang contrast.
// Malaking tulong ito sa accuracy ng Tesseract.
function preprocess(dataUrl, targetWidth = 1200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width < targetWidth ? targetWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;
      // Grayscale + simpleng contrast stretch.
      const contrast = 1.4;
      const intercept = 128 * (1 - contrast);
      for (let i = 0; i < d.length; i += 4) {
        let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        gray = gray * contrast + intercept;
        gray = Math.max(0, Math.min(255, gray));
        d[i] = d[i + 1] = d[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Linisin ang isang linya ng text.
function cleanLine(line) {
  return line
    .replace(/[^A-Za-z0-9&'.\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreLine(line) {
  const letters = (line.match(/[A-Za-z]/g) || []).length;
  const digits = (line.match(/[0-9]/g) || []).length;
  const words = line.split(" ").filter(Boolean);

  let score = letters;
  score -= digits * 2;
  if (letters < 3) score -= 50;
  if (words.length > 6) score -= 10;
  if (/^[A-Z0-9 &'.\-]+$/.test(line) && letters >= 3) score += 8;
  return score;
}

function toTitleCase(s) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function guessProductName(rawText) {
  const lines = (rawText || "")
    .split("\n")
    .map(cleanLine)
    .filter((l) => l.length >= 3);

  if (!lines.length) return "";

  const ranked = lines
    .map((l) => ({ line: l, score: scoreLine(l) }))
    .sort((a, b) => b.score - a.score);

  let best = ranked[0].line;
  if (/^[A-Z0-9 &'.\-]+$/.test(best)) best = toTitleCase(best);
  return best.slice(0, 40).trim();
}

// Pangunahing entry. onProgress(0..1) tuwing nagre-recognize.
export async function readProductName(image, onProgress) {
  progressCb = onProgress || null;
  const worker = await getWorker();

  let processed = image;
  try {
    processed = await preprocess(image);
  } catch (e) {
    // Kung bigo ang preprocess, gamitin ang orihinal.
    processed = image;
  }

  try {
    const result = await worker.recognize(processed);
    const text = (result && result.data && result.data.text) || "";
    if (onProgress) onProgress(1);
    return { name: guessProductName(text), text };
  } finally {
    progressCb = null;
  }
}
