import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { ScanLine, Upload, Loader } from 'lucide-react';
import classnames from 'classnames';
import style from './ocr-receipt-scanner.module.css';
import type { ExpenseFormData } from '~/routes/submit-expense';

export interface OcrReceiptScannerProps {
  className?: string;
}

interface ExtractedData {
  amount?: string;
  date?: string;
  description?: string;
}

function extractDataFromText(text: string): ExtractedData {
  const result: ExtractedData = {};

  // Extract amount: look for dollar amounts or totals
  const amountMatch = text.match(/(?:total|amount|subtotal|grand total)[^\d]*([$£€]?\s*\d+[.,]\d{2})/i)
    || text.match(/([$£€]\s*\d+[.,]\d{2})/)
    || text.match(/(\d+[.,]\d{2})/);
  if (amountMatch) {
    result.amount = amountMatch[1].replace(/[$£€\s,]/g, '').replace(',', '.');
  }

  // Extract date
  const dateMatch = text.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    const raw = dateMatch[0];
    // Try to parse and format as YYYY-MM-DD
    const parts = raw.split(/[\/-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        result.date = raw;
      } else {
        const [m, d, y] = parts;
        const year = y.length === 2 ? `20${y}` : y;
        result.date = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
  }

  // Extract description from first meaningful line
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 5);
  if (lines.length > 0) {
    result.description = lines.slice(0, 2).join(' ').slice(0, 120);
  }

  return result;
}

export function OcrReceiptScanner({ className }: OcrReceiptScannerProps) {
  const { setValue } = useFormContext<ExpenseFormData>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState('');
  const [rawText, setRawText] = useState('');
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setRawText('');
    setExtracted(null);
  };

  const handleScan = async () => {
    if (!inputRef.current?.files?.[0]) return;
    setScanning(true);
    setProgress('Loading OCR engine...');
    try {
      // Dynamic import of Tesseract.js to avoid SSR issues
      const Tesseract = await import('tesseract.js');
      setProgress('Recognizing text...');
      const result = await Tesseract.recognize(inputRef.current.files[0], 'eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(`Processing: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      const text = result.data.text;
      setRawText(text);
      const data = extractDataFromText(text);
      setExtracted(data);
      if (data.amount) setValue('amount', data.amount);
      if (data.date) setValue('date', data.date);
      if (data.description) setValue('description', data.description);
    } catch (err) {
      setProgress('OCR failed. Please fill fields manually.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className={classnames(style.scanner, className)}>
      <div className={style.title}>
        <ScanLine size={16} />
        OCR Receipt Scanner
        <span className={style.badge}>BONUS</span>
      </div>
      <p className={style.description}>
        Upload a receipt image and let AI extract the details automatically.
      </p>

      {!previewUrl ? (
        <label className={style.uploadArea}>
          <Upload size={28} className={style.uploadIcon} />
          <span className={style.uploadText}>Click to upload receipt image<br /><small>PNG, JPG, JPEG supported</small></span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className={style.uploadInput}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
        </label>
      ) : (
        <div className={style.previewWrapper}>
          <img src={previewUrl} alt="Receipt preview" className={style.preview} />
          <div className={style.scanResult}>
            {extracted ? (
              <>
                <p className={style.scanResultTitle}>✅ Extracted Data:</p>
                <div className={style.extracted}>
                  {extracted.amount && <p className={style.extractedItem}><strong>Amount:</strong> {extracted.amount}</p>}
                  {extracted.date && <p className={style.extractedItem}><strong>Date:</strong> {extracted.date}</p>}
                  {extracted.description && <p className={style.extractedItem}><strong>Description:</strong> {extracted.description}</p>}
                </div>
                {rawText && (
                  <>
                    <p className={style.scanResultTitle}>Raw text:</p>
                    <pre className={style.scanResultText}>{rawText.slice(0, 300)}</pre>
                  </>
                )}
              </>
            ) : scanning ? (
              <div className={style.progress}>
                <Loader size={14} className="spin" />
                {progress}
              </div>
            ) : (
              <p className={style.scanResultTitle}>Ready to scan</p>
            )}
            <div className={style.scanBtn}>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleScan}
                disabled={scanning}
              >
                {scanning ? 'Scanning...' : 'Scan Receipt'}
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                style={{ marginLeft: 8 }}
                onClick={() => { setPreviewUrl(null); setRawText(''); setExtracted(null); setProgress(''); }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
