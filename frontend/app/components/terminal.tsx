import { useEffect, useState } from 'react';

import { showToast } from '../utils/toast';

interface TerminalProps {
  containerId: string | null;
}

export default function Terminal({ containerId }: TerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!containerId) return;

    const fetchLogs = () => {
      fetch(
        `http://0.0.0.0:8000/api/orchestrator/containers/${containerId}/logs`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          if (data.status === 'success') {
            setLogs(data.logs);
          } else {
            throw new Error(data.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching logs:', error);
          showToast(`Failed to fetch logs: ${error.message}`);
        });
    };

    // Initial fetch
    fetchLogs();

    // Set up interval for subsequent fetches
    const intervalId = setInterval(fetchLogs, 200);

    // Cleanup function
    return () => clearInterval(intervalId);
  }, [containerId]);

  return (
    <div className="flex-1 bg-gray-900 text-white p-4 font-mono overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-clip">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <span
              key={index}
              className="text-gray-400 text-sm block break-words p-1"
            >
              {log}
            </span>
          ))
        ) : (
          <p className="text-gray-400">
            $ {containerId ? 'Loading logs...' : 'No container selected'}
          </p>
        )}
      </div>
    </div>
  );
}
