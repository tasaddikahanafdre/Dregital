'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ImportReport } from '@/app/api/importer/route';

export default function AdminImporterPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState('');

  const sampleCSV = `name,price,original_price,category,sku,image_url,description
Logitech G Pro X Superlight 2,16500,18500,Computer Accessories,DRG-MSE-GPX2,https://images.unsplash.com/photo-1527864550417-7fd91fc51a46,Ultra-lightweight 60g wireless gaming mouse with HERO 2 sensor
Anker 737 Power Bank 24000mAh,12500,14500,Fast GaN Chargers,DRG-PB-ANK737,https://images.unsplash.com/photo-1609592424109-dd9892f1b177,140W ultra-fast high capacity power delivery bank with smart digital display
Keychron Q1 Pro Custom Keyboard,21500,24000,Mechanical Keyboards,DRG-KB-Q1P,https://images.unsplash.com/photo-1587829741301-dc798b83add3,CNC aluminum wireless custom mechanical keyboard with hot-swap switches`;

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dregital_product_import_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSVToJson = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith('.csv')) {
        const parsed = parseCSVToJson(text);
        setJsonInput(JSON.stringify(parsed, null, 2));
      } else {
        setJsonInput(text);
      }
    };
    reader.readAsText(file);
  };

  const handleRunImport = async () => {
    if (!jsonInput.trim()) {
      setError('Please upload a CSV or paste JSON product records');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      let items: any[] = [];
      try {
        items = JSON.parse(jsonInput);
      } catch {
        // If not valid JSON, try CSV parsing
        items = parseCSVToJson(jsonInput);
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('No valid product rows parsed. Please check format.');
      }

      const res = await fetch('/api/importer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import execution failed');
      }

      setReport(data.report);
    } catch (err: any) {
      setError(err.message || 'Import error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Catalogue & Product Migration Engine
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Import products and categories safely with automatic deduplication and validation reports
            </p>
          </div>

          <button
            onClick={downloadSampleCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        {/* Upload Box */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-neutral-400" />
              <span>Import Products (CSV or JSON)</span>
            </h2>
          </div>

          <div className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-8 text-center bg-neutral-950/60 transition-colors">
            <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
            <p className="text-xs font-bold text-white mb-1">
              Drag & Drop your CSV / JSON file or browse your device
            </p>
            <p className="text-[11px] text-neutral-500 mb-4">
              Supports product names, BDT prices, original prices, images, descriptions, and category hierarchies
            </p>
            <label className="inline-block bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 cursor-pointer transition-colors shadow-xs">
              <span>Select File</span>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Raw Text/JSON Editor */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-2">
              Or Paste Catalog Data (JSON or CSV format)
            </label>
            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON array or CSV text here..."
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-600"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleRunImport}
              disabled={loading}
              className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Import...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Execute Migration & Import</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Import Report Section */}
        {report && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Migration Execution Report</span>
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Total Scanned</span>
                <p className="text-lg font-black text-white mt-1">{report.totalFound}</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">Successfully Added</span>
                <p className="text-lg font-black text-emerald-400 mt-1">{report.successfullyImported}</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Duplicates Skipped</span>
                <p className="text-lg font-black text-neutral-300 mt-1">{report.duplicatesSkipped}</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-amber-400 uppercase font-semibold">Missing Images</span>
                <p className="text-lg font-black text-amber-400 mt-1">{report.missingImages}</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-red-400 uppercase font-semibold">Missing Prices</span>
                <p className="text-lg font-black text-red-400 mt-1">{report.missingPrices}</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Manual Review</span>
                <p className="text-lg font-black text-neutral-200 mt-1">{report.manualReviewRequired}</p>
              </div>
            </div>

            {report.errors.length > 0 && (
              <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl space-y-1.5 text-xs text-red-300">
                <h4 className="font-bold flex items-center gap-1.5 text-red-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Validation Notices:</span>
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  {report.errors.slice(0, 8).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.importedProducts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-neutral-300 mb-2">Imported Items:</h4>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {report.importedProducts.map((name, i) => (
                    <span key={i} className="text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
