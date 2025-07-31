import React, { useState, useRef } from 'react';
import { Upload, FileAudio, X, CheckCircle, Play } from 'lucide-react';

interface AudioSource {
  id: string;
  name: string;
  type: 'noise' | 'voice' | 'music' | 'ambient' | 'unknown';
  decibel: number;
  frequency: number;
  position: { x: number; y: number; z: number };
  distance: number;
  visible: boolean;
  color: string;
}

interface AudioUploaderProps {
  onAudioAnalysis: (sources: AudioSource[]) => void;
  onDatasetSizeChange: (size: number) => void;
  onAudioFileReady: (audioUrl: string) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
  onAudioAnalysis,
  onDatasetSizeChange,
  onAudioFileReady
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)
    );
    
    setUploadedFiles(prev => [...prev, ...audioFiles]);
    
    // Calculate total size
    const totalSize = [...uploadedFiles, ...audioFiles]
      .reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    onDatasetSizeChange(totalSize);
    
    // Auto-analyze if files are added
    if (audioFiles.length > 0) {
      analyzeFiles([...uploadedFiles, ...audioFiles]);
      
      // Create URL for the first file and start monitoring
      const firstFile = audioFiles[0];
      const audioUrl = URL.createObjectURL(firstFile);
      onAudioFileReady(audioUrl);
    }
  };

  const analyzeFiles = async (files: File[]) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSources: AudioSource[] = files.flatMap((file, fileIndex) => {
      // Generate multiple sources per file based on analysis
      const numSources = 2 + Math.floor(Math.random() * 3);
      
      return Array.from({ length: numSources }, (_, sourceIndex) => ({
        id: `file-${fileIndex}-source-${sourceIndex}`,
        name: `${file.name.split('.')[0]} - Source ${sourceIndex + 1}`,
        type: ['noise', 'voice', 'music', 'ambient', 'unknown'][Math.floor(Math.random() * 5)] as any,
        decibel: 30 + Math.random() * 60,
        frequency: 100 + Math.random() * 1000,
        position: { 
          x: Math.random() * 100, 
          y: Math.random() * 100, 
          z: Math.random() * 50 
        },
        distance: 1 + Math.random() * 25,
        visible: true,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }));
    });
    
    onAudioAnalysis(mockSources);
    setIsAnalyzing(false);
  };
  const playFile = (file: File, index: number) => {
    const audioUrl = URL.createObjectURL(file);
    setPlayingFile(file.name);
    onAudioFileReady(audioUrl);
    
    // Auto-stop playing indicator after file duration (estimated)
    setTimeout(() => {
      setPlayingFile(null);
    }, 30000); // 30 seconds default
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    onDatasetSizeChange(totalSize);
    
    if (newFiles.length > 0) {
      analyzeFiles(newFiles);
    } else {
      onAudioAnalysis([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-purple-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Audio Files</h3>
            <p className="text-gray-500 mt-1">
              Drag and drop audio files here, or click to browse
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse Files
          </button>
          
          <p className="text-xs text-gray-400">
            Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Uploaded Files ({uploadedFiles.length})</h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileAudio className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900 truncate max-w-48">
                        {playingFile === file.name && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full animate-pulse">
                            Analyzing
                          </span>
                        )}
                      {file.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!isAnalyzing && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
                    <button
                      onClick={() => playFile(file, index)}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 rounded-lg transition-colors"
                      title="Analyze this file"
                    >
                      <Play className="h-4 w-4" />
                    </button>
      )}

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <div>
              <div className="font-semibold text-purple-800">Analyzing Audio Files</div>
              <div className="text-sm text-purple-600">
                Processing with CRNN and KNN algorithms...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">API Integration</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• Audd.io API: Audio identification and metadata</div>
          <div>• Web Audio API: Real-time processing and analysis</div>
          <div>• Freesound API: Sound database matching</div>
          <div>• SoundCloud API: Audio content recognition</div>
        </div>
      </div>
    </div>
  );
};

export default AudioUploader;