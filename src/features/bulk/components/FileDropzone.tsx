import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Download } from 'lucide-react';
import { downloadSampleCatalog } from '../services/sampleDataGenerator';
import { Button } from '../../../components/ui/Button';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelected, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndProcessFile = (file: File) => {
    setFileError(null);
    const nameLower = file.name.toLowerCase();
    if (
      !nameLower.endsWith('.csv') &&
      !nameLower.endsWith('.xlsx') &&
      !nameLower.endsWith('.xls')
    ) {
      setFileError('Invalid file format. Upload a .CSV, .XLSX, or .XLS file.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds the 25 MB limit.');
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#14B8A6] bg-[#14B8A6]/5'
            : 'border-[#E4E7EC] hover:border-[#14B8A6] bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] text-[#14B8A6] flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#101828]">
              {isLoading
                ? 'Parsing catalog spreadsheet...'
                : 'Drag and drop your catalog file here'}
            </h3>
            <p className="text-xs text-[#667085] mt-1">
              Supports <span className="font-mono font-medium text-[#101828]">.CSV</span>,{' '}
              <span className="font-mono font-medium text-[#101828]">.XLSX</span>, and{' '}
              <span className="font-mono font-medium text-[#101828]">.XLS</span> up to 25 MB
            </p>
          </div>

          <div>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </Button>
          </div>

          {fileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sample File Strip */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] text-[#101828] flex items-center justify-center shrink-0 mt-0.5">
            <FileSpreadsheet className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#101828]">Sample Catalog Dataset</h4>
            <p className="text-xs text-[#667085] mt-0.5 max-w-xl">
              Download a 25-row sample catalog (Kurtis, Jewelry, Footwear) including valid rows and sample validation issues to test column mapping and inline fixes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={(e) => {
              e.stopPropagation();
              downloadSampleCatalog('csv');
            }}
          >
            Sample CSV
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={(e) => {
              e.stopPropagation();
              downloadSampleCatalog('xlsx');
            }}
          >
            Sample XLSX
          </Button>
        </div>
      </div>
    </div>
  );
};
