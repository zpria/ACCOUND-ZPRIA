
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Fix: Use ZPRIA_MAIN_LOGO instead of non-existent ZIPRA_LOGO
import { ZPRIA_MAIN_LOGO } from '../constants';
import { dataIds, colors } from '../config';
import { supabase } from '../services/supabaseService';

const DiagnosticsPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const { data, error } = await supabase
          .from('system_health_logs')
          .select('*')
          .order('checked_at', { ascending: false })
          .limit(10); // Get recent logs

        if (error) {
          throw error;
        }

        setHealthData(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch health data');
        setLoading(false);
      }
    };

    fetchHealthData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate summary metrics from the health data
  const calculateMetrics = () => {
    if (healthData.length === 0) {
      return {
        avgResponseTime: 'N/A',
        uptimePercentage: 'N/A',
        overallStatus: 'unknown'
      };
    }

    const healthyServices = healthData.filter(log => log.status === 'healthy').length;
    const avgResponseTime = healthData.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / healthData.length;
    const uptimePercentage = (healthyServices / healthData.length) * 100;
    
    let overallStatus = 'healthy';
    if (uptimePercentage < 90) {
      overallStatus = 'degraded';
    } else if (uptimePercentage < 70) {
      overallStatus = 'down';
    }

    return {
      avgResponseTime: `${Math.round(avgResponseTime)}ms`,
      uptimePercentage: `${uptimePercentage.toFixed(1)}%`,
      overallStatus
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-32 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-600">Checking system health...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-32 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to fetch diagnostics</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-32 px-6">
      <div className="max-w-[1000px] mx-auto reveal-node">
        <header className="mb-20">
          {/* Fix: Use ZPRIA_MAIN_LOGO and remove color prop */}
          <Link to="/support"><ZPRIA_MAIN_LOGO className="w-14 h-14 mb-10" /></Link>
          <h1 className="text-[54px] md:text-[72px] font-black tracking-tighter text-gray-900 leading-none">ID <span className="text-slate-500">Diagnostics</span></h1>
          <p className="text-2xl text-gray-400 font-medium mt-6">Real-time health of the ZPRIA identity network.</p>
        </header>

        <div className="space-y-6">
           <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl">
              <div>
                 <h4 className="text-xl font-black text-gray-900 uppercase">Global Resolution</h4>
                 <p className="text-gray-400 font-medium">Identity handshake latency across 14 server regions.</p>
              </div>
              <span className={`text-3xl font-black ${
                metrics.overallStatus === 'healthy' ? 'text-green-500' : 
                metrics.overallStatus === 'degraded' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {metrics.avgResponseTime}
              </span>
           </div>
           <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl">
              <div>
                 <h4 className="text-xl font-black text-gray-900 uppercase">Vault Persistence</h4>
                 <p className="text-gray-400 font-medium">Encryption layer availability and structural integrity.</p>
              </div>
              <span className={`text-3xl font-black ${
                metrics.overallStatus === 'healthy' ? 'text-green-500' : 
                metrics.overallStatus === 'degraded' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {metrics.uptimePercentage}
              </span>
           </div>
           <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl">
              <div>
                 <h4 className="text-xl font-black text-gray-900 uppercase">Node Sync Rate</h4>
                 <p className="text-gray-400 font-medium">Active device synchronization and biometric updates.</p>
              </div>
              <span className={`text-3xl font-black ${
                metrics.overallStatus === 'healthy' ? 'text-green-500' : 
                metrics.overallStatus === 'degraded' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {metrics.overallStatus.toUpperCase()}
              </span>
           </div>
        </div>

        {/* Detailed Health Logs */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent System Health Logs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 rounded-2xl">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Service</th>
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Response Time</th>
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Checked At</th>
                </tr>
              </thead>
              <tbody>
                {healthData.slice(0, 5).map((log, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-4 px-6 text-sm text-gray-900">{log.service}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.status === 'healthy' ? 'bg-green-100 text-green-800' :
                        log.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                        log.status === 'down' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">{log.response_time_ms}ms</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(log.checked_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-20 text-center">
           <Link to="/support" className="text-blue-500 font-black uppercase tracking-[0.2em] text-[12px] hover:underline">Back to Support</Link>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
