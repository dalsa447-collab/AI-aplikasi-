
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import type { MediaFile } from './types';
import { analyzeMedia } from './services/geminiService';

type View = 'dashboard' | 'analysis';

const App: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    const newMedia: MediaFile = {
      id: `${Date.now()}-${file.name}`,
      file,
      name: file.name,
      type: file.type,
      uploadDate: new Date(),
      status: 'processing',
    };

    setMediaList(prev => [newMedia, ...prev]);
    setIsProcessing(true);

    try {
      const result = await analyzeMedia(file);
      setMediaList(prev => prev.map(m => m.id === newMedia.id ? { ...m, status: 'completed', analysisResult: result } : m));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMediaList(prev => prev.map(m => m.id === newMedia.id ? { ...m, status: 'failed', errorMessage } : m));
      console.error("Analysis failed:", error);
    } finally {
        setIsProcessing(false);
    }
  }, []);

  const handleSelectMedia = (id: string) => {
    setSelectedMediaId(id);
    setCurrentView('analysis');
  };

  const handleBackToDashboard = () => {
    setSelectedMediaId(null);
    setCurrentView('dashboard');
  };

  const selectedMedia = mediaList.find(m => m.id === selectedMediaId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {currentView === 'dashboard' && (
          <Dashboard
            mediaList={mediaList}
            onFileUpload={handleFileUpload}
            onSelectMedia={handleSelectMedia}
            isProcessing={isProcessing}
          />
        )}
        {currentView === 'analysis' && selectedMedia && (
          <AnalysisView media={selectedMedia} onBack={handleBackToDashboard} />
        )}
      </main>
    </div>
  );
};

export default App;
