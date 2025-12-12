import React, { useEffect, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MarkerType,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

const MindMapVisualization = ({ mindMapData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Generate nodes and edges from mind map data
  useEffect(() => {
    if (!mindMapData || !mindMapData.mainTopic) return;

    const newNodes = [];
    const newEdges = [];

    // Central node
    newNodes.push({
      id: 'main',
      data: { 
        label: (
          <div className="px-6 py-4 text-center">
            <div className="font-bold text-lg text-white">{mindMapData.mainTopic}</div>
          </div>
        )
      },
      position: { x: 400, y: 200 },
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: '3px solid #fff',
        borderRadius: '20px',
        padding: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
        minWidth: '200px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      type: 'default'
    });

    // Branch nodes (key concepts)
    const branches = mindMapData.branches || [];
    const angleStep = (2 * Math.PI) / branches.length;
    const radius = 300;

    branches.forEach((branch, branchIndex) => {
      const angle = angleStep * branchIndex;
      const branchX = 400 + radius * Math.cos(angle);
      const branchY = 200 + radius * Math.sin(angle);
      const branchId = `branch-${branchIndex}`;

      // Branch node
      newNodes.push({
        id: branchId,
        data: {
          label: (
            <div className="px-4 py-3 text-center">
              <div className="font-semibold text-white">{branch.concept}</div>
            </div>
          )
        },
        position: { x: branchX, y: branchY },
        style: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          border: '2px solid #fff',
          borderRadius: '15px',
          padding: '8px',
          fontSize: '14px',
          boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
          minWidth: '150px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        type: 'default'
      });

      // Edge from main to branch
      newEdges.push({
        id: `main-${branchId}`,
        source: 'main',
        target: branchId,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: '#a78bfa', 
          strokeWidth: 3 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#a78bfa',
        }
      });

      // Detail nodes
      const details = branch.details || [];
      const detailAngleOffset = angleStep / 2;
      const detailRadius = 150;

      details.forEach((detail, detailIndex) => {
        const detailAngle = angle + (detailIndex - (details.length - 1) / 2) * (detailAngleOffset / details.length);
        const detailX = branchX + detailRadius * Math.cos(detailAngle);
        const detailY = branchY + detailRadius * Math.sin(detailAngle);
        const detailId = `detail-${branchIndex}-${detailIndex}`;

        // Detail node
        newNodes.push({
          id: detailId,
          data: {
            label: (
              <div className="px-3 py-2 text-center">
                <div className="text-sm text-white">{detail}</div>
              </div>
            )
          },
          position: { x: detailX, y: detailY },
          style: {
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            border: '2px solid #fff',
            borderRadius: '12px',
            padding: '6px',
            fontSize: '12px',
            boxShadow: '0 6px 15px rgba(79, 172, 254, 0.3)',
            minWidth: '120px',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          type: 'default'
        });

        // Edge from branch to detail
        newEdges.push({
          id: `${branchId}-${detailId}`,
          source: branchId,
          target: detailId,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#60a5fa', 
            strokeWidth: 2 
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#60a5fa',
          }
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [mindMapData, setNodes, setEdges]);

  if (!mindMapData || !mindMapData.mainTopic || mindMapData.mainTopic === 'No content') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-gray-400">No mind map data yet. Keep recording...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-800 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        className="rounded-lg"
      >
        <Background color="#4B5563" gap={16} />
        <Controls className="bg-gray-800/80 border border-gray-700" />
      </ReactFlow>
    </div>
  );
};

export default MindMapVisualization;
