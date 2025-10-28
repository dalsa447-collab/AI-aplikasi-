import React, { useState } from 'react';
import type { MediaFile } from '../types';
import { ClipboardCopyIcon } from './icons';

interface AnalysisViewProps {
  media: MediaFile;
  onBack: () => void;
}

type Tab = 'transcription' | 'summary' | 'metadata';

const AnalysisView: React.FC<AnalysisViewProps> = ({ media, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('transcription');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!media.analysisResult) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-500">Error: Data analisis tidak ditemukan.</p>
        <button onClick={onBack} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const { transkripsi, ringkasanEksekutif, poinPenting, topik, sentimen } = media.analysisResult;
  
  const formattedTranscription = transkripsi.replace(/(\[Pembicara \d+\])/g, '<br/><br/><strong class="text-blue-600">$1</strong>');

  const downloadTxt = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadWord = (content: string, filename: string) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Analysis Report</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${filename}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  const handleExport = (format: 'txt' | 'docx') => {
    const baseFilename = media.name.split('.').slice(0, -1).join('.');
    
    if(format === 'txt') {
      const summaryContent = `Ringkasan Eksekutif:\n${ringkasanEksekutif}\n\nPoin-Poin Penting:\n- ${poinPenting.join('\n- ')}`;
      const transcriptContent = transkripsi.replace(/\[Pembicara \d+\]/g, '\n\n$1');
      const fullContent = `--- RINGKasan ---\n${summaryContent}\n\n--- TRANSKRIPSI ---\n${transcriptContent}`;
      downloadTxt(fullContent, `${baseFilename}_analisis.txt`);
    } else {
      const summaryContent = `<h2>Ringkasan Eksekutif</h2><p>${ringkasanEksekutif}</p><h2>Poin-Poin Penting</h2><ul>${poinPenting.map(p => `<li>${p}</li>`).join('')}</ul>`;
      const transcriptContent = `<h2>Transkripsi</h2><p>${transkripsi.replace(/(\[Pembicara \d+\])/g, '<br><br><strong>$1</strong>').replace(/\n/g, '<br>')}</p>`;
      const fullContent = `<h1>Analisis Media: ${media.name}</h1>${summaryContent}<br><hr><br>${transcriptContent}`;
      downloadWord(fullContent, `${baseFilename}_analisis`);
    }
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transkripsi).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  }


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="mb-6 text-blue-600 hover:underline font-semibold">
        &larr; Kembali ke Dashboard
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">{media.name}</h2>
      <p className="text-md text-gray-500 mb-6">Dianalisis pada: {media.uploadDate.toLocaleString('id-ID')}</p>

      <div className="flex justify-end space-x-2 mb-4">
        <button onClick={() => handleExport('txt')} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Ekspor .TXT</button>
        <button onClick={() => handleExport('docx')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Ekspor .DOCX</button>
      </div>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('transcription')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transcription' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Transkripsi
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'metadata' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Metadata
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'transcription' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Transkripsi Lengkap</h3>
                 <button onClick={handleCopyTranscript} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Salin Transkrip">
                    {copySuccess ? <span className="text-sm text-green-600">Disalin!</span> : <ClipboardCopyIcon className="w-5 h-5" />}
                </button>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedTranscription }} />
            </div>
          )}
          {activeTab === 'summary' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Ringkasan Eksekutif</h3>
                <p className="text-gray-700 leading-relaxed">{ringkasanEksekutif}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Poin-Poin Penting</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {poinPenting.map((point, index) => <li key={index}>{point}</li>)}
                </ul>
              </div>
            </div>
          )}
          {activeTab === 'metadata' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Topik & Kata Kunci</h3>
                    <div className="flex flex-wrap gap-2">
                    {topik.map((t, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">{t}</span>
                    ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Analisis Sentimen</h3>
                     <span className={`px-4 py-2 text-lg font-bold rounded-full ${
                        sentimen === 'Positif' ? 'bg-green-100 text-green-800' :
                        sentimen === 'Negatif' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {sentimen}
                    </span>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;