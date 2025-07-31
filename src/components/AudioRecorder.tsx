import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';

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

interface AudioRecorderProps {
  onRecordingChange: (isRecording: boolean) => void;
  onAudioAnalysis: (sources: AudioSource[]) => void;
  onDecibelUpdate: (decibel: number) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingChange,
  onAudioAnalysis,
  onDecibelUpdate
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      
      analyzerRef.current.fftSize = 2048;
      
      // Start real-time analysis
      startAnalysis();
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
        
        // Analyze recorded audio
        analyzeRecordedAudio(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      onRecordingChange(true);
      
      // Start timer
      setRecordingTime(0);
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingChange(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const startAnalysis = () => {
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
      
      onDecibelUpdate(Math.max(0, decibel));
      
      if (isRecording) {
        requestAnimationFrame(analyze);
      }
    };
    
    analyze();
  };

  const analyzeRecordedAudio = async (audioBlob: Blob) => {
    // Simulate audio analysis with ML/AI processing
    const mockSources: AudioSource[] = [
      {
        id: 'source-1',
        name: 'Background Noise',
        type: 'noise',
        decibel: 45 + Math.random() * 20,
        frequency: 200 + Math.random() * 400,
        position: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 50 },
        distance: 5 + Math.random() * 15,
        visible: true,
        color: '#ff6b6b'
      },
      {
        id: 'source-2',
        name: 'Voice Activity',
        type: 'voice',
        decibel: 60 + Math.random() * 25,
        frequency: 300 + Math.random() * 500,
        position: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 50 },
        distance: 2 + Math.random() * 8,
        visible: true,
        color: '#4ecdc4'
      },
      {
        id: 'source-3',
        name: 'Ambient Sound',
        type: 'ambient',
        decibel: 35 + Math.random() * 15,
        frequency: 100 + Math.random() * 300,
        position: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 50 },
        distance: 10 + Math.random() * 20,
        visible: true,
        color: '#45b7d1'
      }
    ];
    
    onAudioAnalysis(mockSources);
  };

  const playRecording = () => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio);
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors shadow-lg"
          >
            <Mic className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full transition-colors shadow-lg animate-pulse"
          >
            <Square className="h-6 w-6" />
          </button>
        )}
        
        {recordedAudio && (
          <button
            onClick={playRecording}
            disabled={isPlaying}
            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-4 rounded-full transition-colors shadow-lg"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
        )}
      </div>

      {/* Recording Status */}
      <div className="text-center">
        {isRecording && (
          <div className="text-red-500 font-semibold text-lg">
            Recording: {formatTime(recordingTime)}
          </div>
        )}
        
        {recordedAudio && !isRecording && (
          <div className="text-green-500 font-semibold">
            Recording saved • Duration: {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Recording Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-800 mb-2">Recording Tips</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Ensure microphone access is granted</li>
          <li>• Record in a quiet environment for better analysis</li>
          <li>• Minimum 10 seconds recommended for accurate detection</li>
          <li>• Move around to capture different audio sources</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioRecorder;