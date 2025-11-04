
import React, { useRef, useEffect } from 'react';
import { MindMapNode } from '../types';

interface MindMapViewerProps {
  data: MindMapNode;
}

export const MindMapViewer: React.FC<MindMapViewerProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const d3 = window.d3;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 800;
    const height = 600;

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([height, width - 200]);
    treeLayout(root);

    // This is the group that will be transformed by zoom/pan
    const g = svg.append('g');

    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any)
      .style('fill', 'none')
      .style('stroke', '#94a3b8') // slate-400
      .style('stroke-width', 2);

    // Nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 8)
      .style('fill', '#10b981'); // emerald-500
      
    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -12 : 12)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.name)
      .style('fill', document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b') // slate-200 or slate-800
      .style('font-size', '14px')
      .style('font-family', 'Poppins, sans-serif');

    // Setup zoom and pan
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3]) // Set min and max zoom levels
        .on('zoom', (event: any) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Set initial transform (pan and scale)
    // We translate by 100 to give the root node some space from the left edge
    const initialTransform = d3.zoomIdentity.translate(100, 0);
    svg.call(zoom.transform, initialTransform);


  }, [data]);

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-4">Mind Map</h3>
      <div className="w-full overflow-hidden bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-grab">
          <svg ref={svgRef} width="800" height="600"></svg>
      </div>
    </div>
  );
};
