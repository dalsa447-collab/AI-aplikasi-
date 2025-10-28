import React from 'react';
import type { MediaFile } from '../types';
import FileUpload from './FileUpload';
import LiveTranscription from './LiveTranscription';
import { FileVideoIcon, FileAudioIcon } from './icons';
import Loader from './Loader';

interface DashboardProps {
  mediaList: MediaFile[];
  onFileUpload: (file: File) => void;
  onSelectMedia: (id: string) => void;
  isProcessing: boolean;
}

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ mediaList, onFileUpload, onSelectMedia, isProcessing }) => {
  const completedCount = mediaList.filter(m => m.status === 'completed').length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Media Dianalisis" value={mediaList.length.toString()} />
                <StatCard title="Selesai Diproses" value={completedCount.toString()} />
                <StatCard title="Waktu Proses Rata-rata" value={mediaList.length > 0 ? "~5 menit" : "N/A"} />
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Hasil Analisis Terbaru</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {mediaList.length > 0 ? mediaList.map(media => (
                        <div key={media.id} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onClick={() => media.status === 'completed' && onSelectMedia(media.id)}>
                            <div className="flex items-center space-x-4">
                                {media.type.startsWith('video/') 
                                    ? <FileVideoIcon className="h-8 w-8 text-blue-500" /> 
                                    : <FileAudioIcon className="h-8 w-8 text-green-500" />
                                }
                                <div>
                                    <p className="font-semibold text-gray-800">{media.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Diupload pada: {media.uploadDate.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <div>
                                {media.status === 'processing' && (
                                    <div className="flex items-center space-x-2">
                                        <Loader />
                                        <span className="text-sm font-medium text-blue-600">Processing</span>
                                    </div>
                                )}
                                {media.status === 'completed' && <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">Completed</span>}
                                {media.status === 'failed' && <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">Failed</span>}
                            </div>
                        </div>
                    )).reverse() : (
                      <div className="p-8 text-center text-gray-500">
                        Belum ada media yang dianalisis.
                      </div>
                    )}
                </div>
            </div>
        </div>
        <div>
          <FileUpload onFileUpload={onFileUpload} isProcessing={isProcessing} />
          <LiveTranscription />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;