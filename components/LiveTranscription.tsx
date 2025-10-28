import React, { useState, useRef } from 'react';
import { MicrophoneIcon, StopCircleIcon, ClipboardCopyIcon, DownloadIcon, SparklesIcon } from './icons';
import Loader from './Loader';
import { transcribeAudio, summarizeText } from '../services/geminiService';

const LiveTranscription: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [summaryCopySuccess, setSummaryCopySuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    setError(null);
    setTranscript('');
    setSummary('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        try {
          const result = await transcribeAudio(audioBlob);
          setTranscript(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
        } finally {
          setIsTranscribing(false);
          // Stop all media tracks to turn off the microphone indicator
          stream.getTracks().forEach(track => track.stop());
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Tidak dapat mengakses mikrofon. Pastikan Anda telah memberikan izin.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSummarize = async () => {
    if(!transcript) return;
    setError(null);
    setSummary('');
    setIsSummarizing(true);
    try {
        const result = await summarizeText(transcript);
        setSummary(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui saat meringkas.');
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleCopy = (text: string, setSuccess: (s: boolean) => void) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      });
    }
  };
  
  const downloadWord = (title: string, content: string, filename: string) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Media Insight Hub Export</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + `<h2>${title}</h2><p>${content.replace(/\n/g, '<br>')}</p>` + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${filename}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Transkripsi Langsung</h2>
      <div className="flex justify-center mb-4">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={isTranscribing || isSummarizing}
            className="flex items-center space-x-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <MicrophoneIcon className="h-5 w-5" />
            <span>Mulai Merekam</span>
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="flex items-center space-x-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            <StopCircleIcon className="h-5 w-5" />
            <span>Berhenti Merekam</span>
          </button>
        )}
      </div>
       {isRecording && (
        <div className="flex items-center justify-center text-red-500 font-medium animate-pulse mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            Merekam...
        </div>
      )}
      {isTranscribing && (
        <div className="text-center py-4">
            <Loader />
            <p className="text-sm text-gray-600 mt-2">Sedang mentranskripsi, mohon tunggu...</p>
        </div>
      )}
      {error && <div className="mt-4 text-sm text-center text-red-600">{error}</div>}
      
      {transcript && !isTranscribing &&(
        <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Hasil Transkripsi:</h3>
            <div className="relative p-4 bg-gray-50 rounded-md border border-gray-200 min-h-[150px] max-h-64 overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
                <button onClick={() => handleCopy(transcript, setCopySuccess)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Salin Transkrip">
                    {copySuccess ? <span className="text-sm text-green-600">Disalin!</span> : <ClipboardCopyIcon className="w-5 h-5" />}
                </button>
                <button onClick={() => downloadWord('Transkrip Langsung', transcript, `transkrip_langsung_${new Date().toISOString().slice(0,10)}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Unduh Transkrip sebagai Word">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="mt-4 border-t pt-4">
                <button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex items-center justify-center w-full space-x-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                    <SparklesIcon className="w-5 h-5" />
                    <span>{isSummarizing ? 'Membuat Ringkasan...' : 'Buat Ringkasan'}</span>
                </button>
            </div>
        </div>
      )}

      {isSummarizing && (
        <div className="text-center py-4">
            <Loader />
            <p className="text-sm text-gray-600 mt-2">Sedang meringkas, mohon tunggu...</p>
        </div>
      )}

      {summary && !isSummarizing && (
         <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Ringkasan:</h3>
            <div className="relative p-4 bg-blue-50 rounded-md border border-blue-200 max-h-64 overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
                <button onClick={() => handleCopy(summary, setSummaryCopySuccess)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Salin Ringkasan">
                    {summaryCopySuccess ? <span className="text-sm text-green-600">Disalin!</span> : <ClipboardCopyIcon className="w-5 h-5" />}
                </button>
                <button onClick={() => downloadWord('Ringkasan', summary, `ringkasan_${new Date().toISOString().slice(0,10)}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Unduh Ringkasan sebagai Word">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default LiveTranscription;