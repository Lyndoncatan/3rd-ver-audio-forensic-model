import React from 'react';
import { X, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

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

interface SettingsPanelProps {
  audioSources: AudioSource[];
  onToggleSound: (soundId: string) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  audioSources,
  onToggleSound,
  onClose
}) => {
  const soundTypeColors = {
    noise: '#ff6b6b',
    voice: '#4ecdc4',
    music: '#45b7d1',
    ambient: '#96ceb4',
    unknown: '#feca57'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Audio Analysis Settings</h2>
          <button
            onClick={onClose}
            className="hover:bg-purple-700 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Sound Sources Management */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sound Sources ({audioSources.length})
            </h3>
            
            {audioSources.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No audio sources detected. Record or upload audio to begin analysis.
              </div>
            ) : (
              <div className="space-y-3">
                {audioSources.map((source) => (
                  <div
                    key={source.id}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: source.color }}
                      />
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{source.name}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-4">
                          <span className="capitalize bg-gray-200 px-2 py-1 rounded text-xs">
                            {source.type}
                          </span>
                          <span>{source.decibel.toFixed(1)} dB</span>
                          <span>{source.distance.toFixed(1)}m</span>
                          <span>{source.frequency.toFixed(0)} Hz</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleSound(source.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          source.visible
                            ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                        title={source.visible ? 'Hide source' : 'Show source'}
                      >
                        {source.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => onToggleSound(source.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          source.visible
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={source.visible ? 'Mute source' : 'Unmute source'}
                      >
                        {source.visible ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter Controls */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Decibel Level
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    defaultValue="30"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-xs text-gray-500 mt-1">30 dB</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Distance
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    defaultValue="25"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-xs text-gray-500 mt-1">25 meters</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min Hz"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                      defaultValue="20"
                    />
                    <input
                      type="number"
                      placeholder="Max Hz"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                      defaultValue="20000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Sensitivity
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                    <option value="low">Low (Basic detection)</option>
                    <option value="medium" selected>Medium (Balanced)</option>
                    <option value="high">High (Sensitive)</option>
                    <option value="forensic">Forensic (Maximum detail)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Type Filters */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sound Type Filters</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(soundTypeColors).map(([type, color]) => {
                const count = audioSources.filter(s => s.type === type).length;
                return (
                  <label key={type} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm">Enable real-time noise suppression</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm">Show distance calculations in sonar view</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm">Export analysis data automatically</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm">Enable machine learning predictions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;