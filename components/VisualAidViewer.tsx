import React, { useRef, useEffect } from 'react';
import { ChartData } from '../types';

interface VisualAidViewerProps {
  data: ChartData;
}

export const VisualAidViewer: React.FC<VisualAidViewerProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null); // To hold the chart instance

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    // Destroy the previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#e2e8f0' : '#334155'; // slate-200 or slate-700

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: 'rgba(16, 185, 129, 0.6)', // emerald-500 with opacity
            borderColor: 'rgba(16, 185, 129, 1)', // emerald-500
            borderWidth: 1,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            tooltip: {
                titleColor: '#ffffff',
                bodyColor: '#ffffff'
            }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
                color: gridColor
            },
            ticks: {
                color: textColor
            }
          },
          x: {
            grid: {
                color: gridColor
            },
            ticks: {
                color: textColor
            }
          }
        }
      }
    });

    // Cleanup function to destroy the chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };

  }, [data]); // Rerender chart if data changes

  if (!data || !data.labels || !data.datasets) {
    return <p>Could not generate a visual aid for this document.</p>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-4">Visual Aid</h3>
      <div className="relative w-full h-96 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};
