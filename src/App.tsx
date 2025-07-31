import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Play, Pause, Settings, FileAudio, BarChart3, Radar, Volume2, VolumeX } from 'lucide-react';
import SonarView from './components/SonarView';
import AudioRecorder from './components/AudioRecorder';
import AudioUploader from './components/AudioUploader';
import DecibelChart from './components/DecibelChart';
import SettingsPanel from './components/SettingsPanel';
import AudioAnalyzer from './components/AudioAnalyzer';
import ReportGenerator from './components/ReportGenerator';

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

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioSources, setAudioSources] = useState<AudioSource[]>([]);
  const [currentDecibel, setCurrentDecibel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSonar, setShowSonar] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [datasetSize, setDatasetSize] = useState(0);
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'analyze'>('record');
  const [currentAudioFile, setCurrentAudioFile] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const startAudioAnalysis = (audioUrl: string) => {
    if (!audioContextRef.current) return;
    
    // Create audio element for uploaded files
    const audio = new Audio(audioUrl);
    audioElementRef.current = audio;
    
    // Set up audio analysis
    const source = audioContextRef.current.createMediaElementSource(audio);
    analyzerRef.current = audioContextRef.current.createAnalyser();
    source.connect(analyzerRef.current);
    analyzerRef.current.connect(audioContextRef.current.destination);
    
    analyzerRef.current.fftSize = 2048;
    
    // Start real-time analysis
    startRealtimeAnalysis();
    
    // Play audio
    audio.play();
    setIsPlayingAudio(true);
    
    audio.onended = () => {
      setIsPlayingAudio(false);
      setCurrentDecibel(0);
    };
  };

  const startRealtimeAnalysis = () => {
    if (!analyzerRef.current) return;
    
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const analyze = () => {
      if (!analyzerRef.current) return;
      
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      // Calculate decibel level
      const sum = dataArray.reduce((acc, val) => acc + val, 0);
      const average = sum / bufferLength;
      const decibel = 20 * Math.log10(average / 255) + 100;
      
      setCurrentDecibel(Math.max(0, decibel));
      
      if (isRecording || isPlayingAudio) {
        requestAnimationFrame(analyze);
      }
    };
    
    analyze();
  };
  const handleAudioAnalysis = (sources: AudioSource[]) => {
    setAudioSources(sources);
    
    // Calculate dataset size
    const totalSize = sources.reduce((acc, source) => acc + (source.frequency * 0.001), 0);
    setDatasetSize(totalSize);
  };

  const handleAudioFileReady = (audioUrl: string) => {
    setCurrentAudioFile(audioUrl);
    startAudioAnalysis(audioUrl);
  };
  const handleDecibelUpdate = (db: number) => {
    setCurrentDecibel(db);
  };

  const toggleSoundVisibility = (soundId: string) => {
    setAudioSources(prev => 
      prev.map(source => 
        source.id === soundId 
          ? { ...source, visible: !source.visible }
          : source
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Radar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Audio Forensic Audio</h1>
                <p className="text-purple-600 font-medium">Advanced Sound Analysis & Detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                <span className="text-purple-800 font-semibold">
                  Dataset: {datasetSize.toFixed(2)} MB
                </span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Audio Input</h2>
              
              {/* Tab Navigation */}
              <div className="flex space-x-2 mb-6">
                {[
                  { key: 'record', label: 'Record', icon: Mic },
                  { key: 'upload', label: 'Upload', icon: Upload },
                  { key: 'analyze', label: 'Analyze', icon: BarChart3 }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'record' && (
                <AudioRecorder
                  onRecordingChange={setIsRecording}
                  onAudioAnalysis={handleAudioAnalysis}
                  onDecibelUpdate={handleDecibelUpdate}
                />
              )}
              
              {activeTab === 'upload' && (
                <AudioUploader
                  onAudioAnalysis={handleAudioAnalysis}
                  onDatasetSizeChange={setDatasetSize}
                  onAudioFileReady={handleAudioFileReady}
                />
              )}
              
              {activeTab === 'analyze' && (
                <AudioAnalyzer
                  audioSources={audioSources}
                  onAnalysisComplete={setAnalysisData}
                />
              )}
            </div>

            {/* Real-time Decibel Monitor */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Audio Monitor</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {currentDecibel.toFixed(1)} dB
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-3 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min((currentDecibel / 120) * 100, 100)}%` }}
                  ></div>
                </div>
                <DecibelChart currentDecibel={currentDecibel} />
              </div>
            </div>

            {/* Sound Sources Control */}
            {audioSources.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Sounds</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {audioSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: source.color }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900">{source.name}</div>
                          <div className="text-sm text-gray-500">
                            {source.decibel.toFixed(1)} dB • {source.distance.toFixed(1)}m
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSoundVisibility(source.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          source.visible
                            ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {source.visible ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-2">
            {showSonar ? (
              <div className="bg-white rounded-xl shadow-lg p-6 h-[600px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Interactive Sonar View</h2>
                  <div className="text-sm text-purple-600 font-medium">
                    {audioSources.filter(s => s.visible).length} active sources
                  </div>
                </div>
                <SonarView
                  audioSources={audioSources.filter(source => source.visible)}
                  isRecording={isRecording}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Report</h2>
                <ReportGenerator
                  audioSources={audioSources}
                  analysisData={analysisData}
                  datasetSize={datasetSize}
                />
              </div>
            )}
            
            {/* Toggle View Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowSonar(!showSonar)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {showSonar ? 'Show Report' : 'Show Sonar View'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          audioSources={audioSources}
          onToggleSound={toggleSoundVisibility}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;