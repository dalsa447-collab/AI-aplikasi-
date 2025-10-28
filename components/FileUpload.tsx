
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedTypes = ['video/mp4', 'video/quicktime', 'audio/wav', 'audio/mpeg', 'audio/mp3'];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Format file tidak didukung. Harap unggah MP4, MOV, WAV, atau MP3.");
        setSelectedFile(null);
      }
    }
  };
  
  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0];
        const allowedTypes = ['video/mp4', 'video/quicktime', 'audio/wav', 'audio/mpeg', 'audio/mp3'];
        if (allowedTypes.includes(file.type)) {
          setSelectedFile(file);
          setError(null);
        } else {
          setError("Format file tidak didukung. Harap unggah MP4, MOV, WAV, atau MP3.");
          setSelectedFile(null);
        }
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Unggah Media Baru</h2>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-semibold text-blue-600">Klik untuk mengunggah</span> atau seret dan lepas
        </p>
        <p className="text-xs text-gray-500 mt-1">MP4, MOV, WAV, atau MP3</p>
        <input id="file-upload-input" type="file" className="hidden" accept=".mp4,.mov,.wav,.mp3" onChange={handleFileChange} />
      </div>
      {selectedFile && (
        <div className="mt-4 text-sm text-gray-700">
          File terpilih: <span className="font-medium">{selectedFile.name}</span>
        </div>
      )}
      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isProcessing}
        className="w-full mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Memproses...' : 'Mulai Analisis'}
      </button>
    </div>
  );
};

export default FileUpload;
