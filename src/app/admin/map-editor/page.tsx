'use client';

import React, { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  Copy,
  Check,
  Camera,
  Trash2,
  Plus,
  ArrowLeft,
  Navigation,
  Compass,
  Layers,
  MapPin,
  Eye,
} from 'lucide-react';
import { Vector3Tuple, DirectionType, ViewMode } from '@/types/navigation';
import { PathTube } from '@/components/canvas/PathTube';
import { BuildingModel } from '@/components/canvas/BuildingModel';
import { MOCK_BUILDINGS } from '@/data/mockNavigationData';

interface CameraHelperProps {
  onCaptureCamera: (pos: Vector3Tuple, target: Vector3Tuple) => void;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  triggerCapture: boolean;
  onCaptured: () => void;
}

function CameraCaptureHelper({
  onCaptureCamera,
  controlsRef,
  triggerCapture,
  onCaptured,
}: CameraHelperProps) {
  const { camera } = useThree();

  if (triggerCapture && controlsRef.current) {
    const cp: Vector3Tuple = [
      Number(camera.position.x.toFixed(2)),
      Number(camera.position.y.toFixed(2)),
      Number(camera.position.z.toFixed(2)),
    ];
    const ct: Vector3Tuple = [
      Number(controlsRef.current.target.x.toFixed(2)),
      Number(controlsRef.current.target.y.toFixed(2)),
      Number(controlsRef.current.target.z.toFixed(2)),
    ];
    onCaptureCamera(cp, ct);
    onCaptured();
  }

  return null;
}

function InteractiveFloorPlane({
  onAddPoint,
}: {
  onAddPoint: (pt: Vector3Tuple) => void;
}) {
  const handlePointerDown = (e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    e.stopPropagation();
    const newPt: Vector3Tuple = [
      Number(e.point.x.toFixed(2)),
      Number(e.point.y.toFixed(2)),
      Number(e.point.z.toFixed(2)),
    ];
    onAddPoint(newPt);
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      receiveShadow
    >
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial color="#1e293b" roughness={0.7} />
    </mesh>
  );
}

export default function MapEditorPage() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const [pathPoints, setPathPoints] = useState<Vector3Tuple[]>([]);
  const [cameraPos, setCameraPos] = useState<Vector3Tuple>([0, 20, 35]);
  const [cameraTarget, setCameraTarget] = useState<Vector3Tuple>([0, 0, 0]);
  const [triggerCapture, setTriggerCapture] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [stepOrder, setStepOrder] = useState(1);
  const [instruction, setInstruction] = useState('Từ ngã rẽ đi thẳng về sảnh');
  const [directionType, setDirectionType] = useState<DirectionType>('STRAIGHT');
  const [viewMode, setViewMode] = useState<ViewMode>('OVERALL_CAMPUS');
  const [buildingCode, setBuildingCode] = useState('toa_b');
  const [floorLevel, setFloorLevel] = useState<number>(1);
  const [selectedCampus, setSelectedCampus] = useState('cs1');

  const handleAddPoint = (pt: Vector3Tuple) => {
    setPathPoints((prev) => [...prev, pt]);
  };

  const handleRemovePoint = (index: number) => {
    setPathPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPoints = () => {
    setPathPoints([]);
  };

  const jsonConfig = JSON.stringify(
    {
      stepOrder,
      instruction,
      directionType,
      viewMode,
      buildingCode: viewMode === 'BUILDING_FLOOR' ? buildingCode : null,
      floorLevel: viewMode === 'BUILDING_FLOOR' ? floorLevel : null,
      pathPoints,
      cameraPos,
      cameraTarget,
      landmarkPhotoUrl: null,
    },
    null,
    2
  );

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(jsonConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 3D Interactive Viewport */}
      <div className="flex-1 relative h-full">
        <Canvas
          shadows
          camera={{ position: [0, 25, 40], fov: 45 }}
          className="w-full h-full"
        >
          <color attach="background" args={['#090d16']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[30, 40, 20]} intensity={1.2} />

          <OrbitControls ref={controlsRef} makeDefault dampingFactor={0.08} />

          <CameraCaptureHelper
            controlsRef={controlsRef}
            triggerCapture={triggerCapture}
            onCaptureCamera={(cp, ct) => {
              setCameraPos(cp);
              setCameraTarget(ct);
            }}
            onCaptured={() => setTriggerCapture(false)}
          />

          <Suspense fallback={null}>
            <Grid
              position={[0, 0.01, 0]}
              infiniteGrid
              cellSize={2}
              cellThickness={0.8}
              cellColor="#334155"
              sectionSize={10}
              sectionColor="#475569"
            />

            {/* Interactive Clickable Floor */}
            <InteractiveFloorPlane onAddPoint={handleAddPoint} />

            {/* Mock Buildings */}
            <BuildingModel building={MOCK_BUILDINGS[0]} position={[-15, 0, 5]} />
            <BuildingModel building={MOCK_BUILDINGS[1]} position={[12, 0, -8]} />
            <BuildingModel building={MOCK_BUILDINGS[2]} position={[0, 0, -25]} />

            {/* Path visualization */}
            {pathPoints.length >= 2 && <PathTube points={pathPoints} />}

            {/* Highlight individual points */}
            {pathPoints.map((pt, idx) => (
              <mesh key={`pt-${idx}`} position={[pt[0], pt[1] + 0.2, pt[2]]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                  color={idx === 0 ? '#10b981' : idx === pathPoints.length - 1 ? '#ef4444' : '#06b6d4'}
                  emissive={idx === 0 ? '#059669' : idx === pathPoints.length - 1 ? '#dc2626' : '#0891b2'}
                />
              </mesh>
            ))}
          </Suspense>
        </Canvas>

        {/* Top Hint Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sm font-semibold border border-slate-700/80 shadow-xl backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
            <span>Quay lại Bản đồ</span>
          </Link>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 text-xs font-medium border border-slate-700/80 shadow-xl backdrop-blur-md text-slate-300">
            💡 <strong className="text-white">Hướng dẫn:</strong> Click chuột trái lên mặt sàn để chấm tọa độ <code className="text-cyan-400">[x, y, z]</code>. Xoay góc nhìn ưng ý rồi bấm nút lấy Camera.
          </div>
        </div>
      </div>

      {/* Right Control Sidebar */}
      <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-30">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
            <h2 className="font-bold text-base text-white">Công cụ Lấy Tọa Độ 3D</h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
            Admin Map Editor
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* View mode & Campus selector */}
          <div className="space-y-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              1. Cấu hình Bước Dẫn Đường
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Chế độ xem (View Mode)</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="OVERALL_CAMPUS">OVERALL_CAMPUS (Toàn cảnh)</option>
                <option value="BUILDING_FLOOR">BUILDING_FLOOR (Cắt tầng tòa nhà)</option>
              </select>
            </div>

            {viewMode === 'BUILDING_FLOOR' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Mã Tòa</label>
                  <select
                    value={buildingCode}
                    onChange={(e) => setBuildingCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="toa_a">Tòa A</option>
                    <option value="toa_b">Tòa B</option>
                    <option value="toa_c">Tòa C</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Tầng</label>
                  <select
                    value={floorLevel}
                    onChange={(e) => setFloorLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value={1}>Tầng 1</option>
                    <option value={2}>Tầng 2</option>
                    <option value={3}>Tầng 3</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Hướng di chuyển (Icon)</label>
              <select
                value={directionType}
                onChange={(e) => setDirectionType(e.target.value as DirectionType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="STRAIGHT">STRAIGHT (Đi thẳng)</option>
                <option value="LEFT">LEFT (Rẽ trái)</option>
                <option value="RIGHT">RIGHT (Rẽ phải)</option>
                <option value="STAIRS_UP">STAIRS_UP (Lên cầu thang)</option>
                <option value="STAIRS_DOWN">STAIRS_DOWN (Xuống cầu thang)</option>
                <option value="ARRIVED">ARRIVED (Đến đích)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Câu chỉ dẫn</label>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Camera capture */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                2. Góc nhìn Camera
              </span>
              <button
                type="button"
                onClick={() => setTriggerCapture(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-colors"
              >
                <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Lấy góc Camera hiện tại</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>pos: [{cameraPos.join(', ')}]</div>
              <div>target: [{cameraTarget.join(', ')}]</div>
            </div>
          </div>

          {/* Clicked Path points list */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                3. Tọa độ đường đi ({pathPoints.length} điểm)
              </span>
              {pathPoints.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearPoints}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                  <span>Xóa hết</span>
                </button>
              )}
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-xs">
              {pathPoints.map((pt, idx) => (
                <div
                  key={`list-pt-${idx}`}
                  className="flex items-center justify-between px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]"
                >
                  <span className="text-cyan-400 font-bold">#{idx + 1}</span>
                  <span className="text-slate-300">[{pt.join(', ')}]</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(idx)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}

              {pathPoints.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-500 italic">
                  Chưa có tọa độ nào. Click chuột lên mặt sàn 3D để thêm.
                </div>
              )}
            </div>
          </div>

          {/* JSON Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                4. Dữ liệu RouteStep JSON
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" strokeWidth={2} />
                    <span>Đã Copy!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-400 max-h-48 overflow-y-auto overflow-x-auto">
              {jsonConfig}
            </pre>
          </div>
        </div>
      </aside>
    </div>
  );
}
