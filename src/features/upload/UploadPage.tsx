import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransporterStore } from '../../stores/transporterStore';
import { parseCSV, readFileAsText, ParseResult } from '../../lib/csvParser';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const { addRecords } = useTransporterStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setResult({
        success: false,
        records: [],
        errors: ['Only CSV files are supported. Please upload a .csv file.'],
        totalRows: 0,
        validRows: 0,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setResult({
        success: false,
        records: [],
        errors: ['File size exceeds 5MB limit.'],
        totalRows: 0,
        validRows: 0,
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await readFileAsText(file);
      const parseResult = await parseCSV(text);
      setResult(parseResult);
    } catch (error) {
      setResult({
        success: false,
        records: [],
        errors: [error instanceof Error ? error.message : 'Failed to process file'],
        totalRows: 0,
        validRows: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveData = () => {
    if (result && result.records.length > 0) {
      addRecords(result.records);
      navigate('/operations');
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `date,driverName,plateNumber,customerName,deliveryPoints,kilometer,gasolineCost,tollCost,parkingCost,overtimeCost,incentiveCost
2024-01-15,Dika Pratama,B 1234 HMD,PT Sinar Logistik Nusantara,8,120,250000,50000,15000,0,100000
2024-01-15,Irwan Saputra,B 1820 TRK,PT Global Retail Indonesia,5,85,180000,30000,10000,0,50000
2024-01-16,Yadi Firmansyah,B 4421 LOG,PT Karya Distribusi Mandiri,10,200,350000,80000,20000,150000,120000`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-transporter-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Data</h1>

      {/* Guidelines */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Upload Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>File format: CSV (.csv)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Maximum file size: 5 MB</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              Required columns: date, driverName, plateNumber, customerName,
              deliveryPoints, kilometer, gasolineCost
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              Optional columns: tollCost, parkingCost, overtimeCost, incentiveCost
            </span>
          </li>
        </ul>
        <button
          onClick={downloadSampleCSV}
          className="btn-secondary mt-4 inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Sample CSV
        </button>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`card p-12 border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 text-gray-400 rounded-full mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragging ? 'Drop file here' : 'Upload CSV File'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Select File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        </div>
      </div>

      {/* Processing */}
      {isProcessing && (
        <div className="card p-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
            <span className="text-gray-700">Processing file...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isProcessing && (
        <div className="mt-6">
          {result.success ? (
            <div className="card p-6 border-2 border-green-200 bg-green-50">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Upload Successful
                  </h3>
                  <p className="text-green-700 mb-4">
                    {result.validRows} out of {result.totalRows} rows processed successfully.
                  </p>
                  {result.errors.length > 0 && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="font-medium text-gray-900 mb-2">
                        {result.errors.length} row(s) skipped:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button onClick={handleSaveData} className="btn-primary">
                    Save {result.validRows} Records to Database
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 border-2 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Upload Failed
                  </h3>
                  <ul className="text-red-700 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
