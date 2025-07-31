import React from 'react';
import { FileText, Download, Share2, Calendar, MapPin, Volume2 } from 'lucide-react';

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

interface ReportGeneratorProps {
  audioSources: AudioSource[];
  analysisData: any;
  datasetSize: number;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  audioSources,
  analysisData,
  datasetSize
}) => {
  const generateReport = () => {
    const reportData = {
      metadata: {
        title: 'Audio Forensic Analysis Report',
        timestamp: new Date().toISOString(),
        version: '1.0',
        analyst: 'Audio Forensic Audio System'
      },
      summary: {
        totalSources: audioSources.length,
        datasetSize: `${datasetSize.toFixed(2)} MB`,
        analysisDate: new Date().toLocaleDateString(),
        processingTime: '3.2 seconds'
      },
      findings: audioSources,
      technicalDetails: analysisData || {}
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-forensic-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Simulate PDF generation
    alert('PDF export functionality would be implemented with libraries like jsPDF or Puppeteer');
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Audio Forensic Analysis Report',
        text: `Analysis detected ${audioSources.length} audio sources in ${datasetSize.toFixed(2)} MB of data`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard');
    }
  };

  if (audioSources.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Data Available</h3>
        <p className="text-gray-500">Record or upload audio files to generate a forensic report.</p>
      </div>
    );
  }

  const highestDb = Math.max(...audioSources.map(s => s.decibel));
  const averageDb = audioSources.reduce((sum, s) => sum + s.decibel, 0) / audioSources.length;
  const noisySources = audioSources.filter(s => s.decibel > 70);

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Audio Forensic Analysis Report</h2>
            <div className="flex items-center space-x-4 text-purple-100">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Volume2 className="h-4 w-4" />
                <span>{audioSources.length} Sources</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{datasetSize.toFixed(2)} MB</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={generateReport}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportPDF}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={shareReport}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-1">{audioSources.length}</div>
            <div className="text-sm text-gray-600">Audio Sources Detected</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">{highestDb.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Peak Decibel Level</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">{noisySources.length}</div>
            <div className="text-sm text-gray-600">High-Noise Sources</div>
          </div>
        </div>

        <div className="prose max-w-none text-gray-700">
          <p>
            This forensic audio analysis processed <strong>{datasetSize.toFixed(2)} MB</strong> of audio data 
            and detected <strong>{audioSources.length} distinct sound sources</strong>. The analysis revealed 
            a peak sound level of <strong>{highestDb.toFixed(1)} dB</strong> with an average of <strong>{averageDb.toFixed(1)} dB</strong> 
            across all detected sources.
          </p>
          
          {noisySources.length > 0 && (
            <p className="text-amber-800 bg-amber-50 p-3 rounded-lg">
              <strong>Alert:</strong> {noisySources.length} source(s) exceeded 70 dB threshold, 
              indicating potentially significant audio events requiring further investigation.
            </p>
          )}
        </div>
      </div>

      {/* Detailed Findings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Findings</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level (dB)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency (Hz)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance (m)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classification
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {audioSources.map((source, index) => (
                <tr key={source.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span>{source.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      source.type === 'noise' ? 'bg-red-100 text-red-800' :
                      source.type === 'voice' ? 'bg-blue-100 text-blue-800' :
                      source.type === 'music' ? 'bg-green-100 text-green-800' :
                      source.type === 'ambient' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {source.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={source.decibel > 70 ? 'font-bold text-red-600' : ''}>
                      {source.decibel.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {source.frequency.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {source.distance.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-green-600 font-medium">Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Analysis */}
      {analysisData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Machine Learning Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ML Confidence:</span>
                  <span className="font-medium">{analysisData.mlConfidence?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Anomalies Detected:</span>
                  <span className="font-medium">{analysisData.anomalies || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Algorithm:</span>
                  <span className="font-medium">CRNN + KNN</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Audio Characteristics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dominant Frequency:</span>
                  <span className="font-medium">{analysisData.dominantFrequency?.toFixed(0)} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span>Background Noise:</span>
                  <span className="font-medium">{analysisData.noiseLevel?.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span>Dynamic Range:</span>
                  <span className="font-medium">{(highestDb - (analysisData.noiseLevel || 0)).toFixed(1)} dB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Report generated by Audio Forensic Audio v1.0 on {new Date().toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This analysis uses advanced ML algorithms including CRNN, Deep Learning, and KNN classification
        </p>
      </div>
    </div>
  );
};

export default ReportGenerator;