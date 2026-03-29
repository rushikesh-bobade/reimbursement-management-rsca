import { NextRequest, NextResponse } from "next/server";

// POST /api/ocr — Extract text from receipt image using Tesseract.js
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic import Tesseract.js (server-side only)
    const Tesseract = await import("tesseract.js");
    const { data } = await Tesseract.recognize(buffer, "eng", {
      logger: (m: { status: string }) => {
        if (m.status === "recognizing text") {
          // progress logging
        }
      },
    });

    const text = data.text;

    // Extract structured data from OCR text
    const extracted = parseReceiptText(text);

    return NextResponse.json({
      rawText: text,
      extracted,
      confidence: data.confidence,
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "OCR processing failed" }, { status: 500 });
  }
}

// Parse receipt text to extract amount, date, description, category
function parseReceiptText(text: string): {
  amount: number | null;
  date: string | null;
  description: string | null;
  category: string | null;
} {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Extract amount — look for currency patterns
  let amount: number | null = null;
  const amountPatterns = [
    /(?:total|amount|grand\s*total|subtotal|sum)[:\s]*[$€£₹¥]?\s*([\d,]+\.?\d*)/i,
    /[$€£₹¥]\s*([\d,]+\.?\d*)/,
    /([\d,]+\.\d{2})/,
  ];
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) break;
      amount = null;
    }
  }

  // Extract date
  let date: string | null = null;
  const datePatterns = [
    /(\d{4}[-/]\d{2}[-/]\d{2})/,
    /(\d{2}[-/]\d{2}[-/]\d{4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})/i,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split("T")[0];
        break;
      }
    }
  }

  // Extract description — use the first meaningful line
  let description: string | null = null;
  for (const line of lines) {
    if (line.length > 5 && line.length < 200 && !/^[\d\s.$€£₹¥,]+$/.test(line)) {
      description = line;
      break;
    }
  }

  // Guess category from keywords
  let category: string | null = null;
  const lower = text.toLowerCase();
  if (/flight|airline|airport|travel|hotel|uber|lyft|taxi|cab/i.test(lower)) {
    category = "TRAVEL";
  } else if (/restaurant|food|lunch|dinner|breakfast|cafe|coffee|meal/i.test(lower)) {
    category = "MEALS";
  } else if (/paper|ink|staple|office|pen|pencil|supplies/i.test(lower)) {
    category = "OFFICE_SUPPLIES";
  } else if (/laptop|monitor|keyboard|mouse|hardware|computer|phone/i.test(lower)) {
    category = "EQUIPMENT";
  } else if (/software|license|subscription|saas|cloud/i.test(lower)) {
    category = "SOFTWARE";
  }

  return { amount, date, description, category };
}
