'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { CADBuildingModel } from './CADBuildingModel';

// ============================================================================
// 1. MATERIAL PALETTE (Zero Z-Fighting, Mathematical Precision)
// ============================================================================
const useSitePlanMaterials = () => {
  return useMemo(() => {
    return {
      // Plot Foundation Pad (Clean concrete plinth)
      plotBase: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.85,
      }),
      // Marked Plot Fill Surface (Soft Blueprint Sky-Cyan Tint)
      plotFill: new THREE.MeshStandardMaterial({
        color: '#e0f2fe',
        roughness: 0.8,
      }),
      // Plot Boundary Outline Lines (Crisp Cyan Accent)
      plotBorderCyan: new THREE.MeshBasicMaterial({
        color: '#0284c7',
        depthWrite: true,
      }),
      // Road surface (Dark Asphalt)
      darkAsphalt: new THREE.MeshStandardMaterial({
        color: '#242c38',
        roughness: 0.85,
        metalness: 0.05,
      }),
      // Road painted markings (with depth offset to prevent any flickering)
      whiteRoadLine: new THREE.MeshBasicMaterial({
        color: '#ffffff',
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      // Football Turf Stripes
      turfStripeA: new THREE.MeshStandardMaterial({
        color: '#16a34a',
        roughness: 0.9,
      }),
      turfStripeB: new THREE.MeshStandardMaterial({
        color: '#15803d',
        roughness: 0.9,
      }),
      // Green lawns & landscape buffers
      lawnGreen: new THREE.MeshStandardMaterial({
        color: '#86efac',
        roughness: 0.85,
      }),
      pavedGround: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.92,
      }),
      boundaryWall: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.8,
      }),
      crispWhite: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.7,
      }),
    };
  }, []);
};

// ============================================================================
// 2. COURTYARD SQUARE PLANTER BED (Architecture only, no trees)
// ============================================================================
function CourtyardPlanterBed({ position }: { position: [number, number, number] }) {
  const mats = useSitePlanMaterials();
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow material={mats.crispWhite}>
        <boxGeometry args={[1.5, 0.28, 1.5]} />
      </mesh>
      <mesh position={[0, 0.28, 0]} receiveShadow material={mats.lawnGreen}>
        <boxGeometry args={[1.25, 0.06, 1.25]} />
      </mesh>
    </group>
  );
}

// ============================================================================
// 3. MARKED BUILDING PLOT COMPONENT (Exact Proportions & Clean Outlines)
// ============================================================================
interface MarkedBuildingPlotProps {
  position: [number, number, number];
  size: [number, number]; // [widthX, depthZ]
  label: string;
  subLabel?: string;
  badgeHeight?: number;
  badgeColor?: string;
  children?: React.ReactNode;
}

function MarkedBuildingPlot({
  position,
  size,
  label,
  subLabel = 'KHU ĐẤT QUY HOẠCH',
  badgeHeight = 1.8,
  badgeColor = 'bg-slate-900/90',
  children,
}: MarkedBuildingPlotProps) {
  const mats = useSitePlanMaterials();
  const [w, d] = size;
  const borderThick = 0.12;

  return (
    <group position={position}>
      {/* Floating Interactive Badge */}
      <Html position={[0, badgeHeight, 0]} center distanceFactor={36} zIndexRange={[100, 0]}>
        <div
          className={`px-3 py-1 rounded-full ${badgeColor} text-white text-[11px] font-bold shadow-lg border border-sky-400/40 whitespace-nowrap text-center select-none pointer-events-none transition-transform hover:scale-105`}
        >
          <div>{label}</div>
          {subLabel && (
            <div className="text-[9px] font-semibold text-sky-300 tracking-wider uppercase">
              {subLabel}
            </div>
          )}
        </div>
      </Html>

      {/* Layer 1: Raised Concrete Base Foundation */}
      <mesh position={[0, 0.05, 0]} receiveShadow material={mats.plotBase}>
        <boxGeometry args={[w + 0.4, 0.1, d + 0.4]} />
      </mesh>

      {/* Layer 2: Inset Plot Surface Fill */}
      <mesh position={[0, 0.12, 0]} receiveShadow material={mats.plotFill}>
        <boxGeometry args={[w, 0.04, d]} />
      </mesh>

      {/* Layer 3: Cyan Boundary Outlines */}
      <mesh position={[0, 0.145, -d / 2]} material={mats.plotBorderCyan}>
        <boxGeometry args={[w, 0.01, borderThick]} />
      </mesh>
      <mesh position={[0, 0.145, d / 2]} material={mats.plotBorderCyan}>
        <boxGeometry args={[w, 0.01, borderThick]} />
      </mesh>
      <mesh position={[-w / 2, 0.145, 0]} material={mats.plotBorderCyan}>
        <boxGeometry args={[borderThick, 0.01, d]} />
      </mesh>
      <mesh position={[w / 2, 0.145, 0]} material={mats.plotBorderCyan}>
        <boxGeometry args={[borderThick, 0.01, d]} />
      </mesh>

      {/* 4 Architectural Corner L-Brackets */}
      {[
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [-w / 2, d / 2],
        [w / 2, d / 2],
      ].map(([cx, cz], i) => (
        <group key={`corner-${i}`} position={[cx, 0.15, cz]}>
          <mesh material={mats.plotBorderCyan}>
            <boxGeometry args={[1.0, 0.01, 0.18]} />
          </mesh>
          <mesh material={mats.plotBorderCyan}>
            <boxGeometry args={[0.18, 0.01, 1.0]} />
          </mesh>
        </group>
      ))}

      {children}
    </group>
  );
}

// ============================================================================
// 4. KHU NHÀ H: EXACT U-SHAPED PLOT OPENING EAST TOWARDS ROAD
// ============================================================================
function BuildingHPlot() {
  const mats = useSitePlanMaterials();

  // Blueprint exact coordinates: Center at [-8.0, 0, 3.5], Span X: 19.0, Span Z: 14.0
  // West edge: -17.5, East edge: +1.5 (Buffer to vertical road: 2.5m)
  // North edge: -3.5, South edge: +10.5 (Buffer to horizontal road: 3.9m)
  // Distance from road arc center [-1.4, -2.0] to corner [1.5, -3.5]: 3.26m
  // Inner road curb radius = 5.4m => Clearance to road = 2.14m (ZERO CLIPPING)
  const totalW = 19.0;
  const totalD = 14.0;
  const wingThick = 4.2;

  return (
    <group position={[-8.0, 0, 3.5]}>
      {/* Floating Badge above courtyard */}
      <Html position={[0, 2.2, 0]} center distanceFactor={36} zIndexRange={[100, 0]}>
        <div className="px-3.5 py-1.2 rounded-full bg-slate-900/95 text-white text-[12px] font-bold shadow-xl border border-sky-400/50 whitespace-nowrap text-center select-none pointer-events-none">
          <div>KHU NHÀ H (6 TẦNG)</div>
          <div className="text-[9px] font-semibold text-sky-300 tracking-wider">
            [ KHU ĐẤT QUY HOẠCH HÌNH CHỮ U - HƯỚNG ĐÔNG ]
          </div>
        </div>
      </Html>

      {/* Courtyard Concrete Base Ground */}
      <mesh position={[0, 0.04, 0]} receiveShadow material={mats.plotBase}>
        <boxGeometry args={[totalW + 0.4, 0.08, totalD + 0.4]} />
      </mesh>

      {/* 1. WEST CONNECTING WING (Đáy chữ U ở phía Tây, giáp Xưởng Ô Tô) */}
      <group position={[-totalW / 2 + wingThick / 2, 0, 0]}>
        <mesh position={[0, 0.1, 0]} receiveShadow material={mats.plotFill}>
          <boxGeometry args={[wingThick, 0.04, totalD]} />
        </mesh>
        <mesh position={[-wingThick / 2, 0.125, 0]} material={mats.plotBorderCyan}>
          <boxGeometry args={[0.12, 0.01, totalD]} />
        </mesh>
        <mesh position={[wingThick / 2, 0.125, 0]} material={mats.plotBorderCyan}>
          <boxGeometry args={[0.12, 0.01, totalD]} />
        </mesh>
        {/* Protruding Central Staircase Core into Courtyard towards East */}
        <mesh position={[wingThick / 2 + 1.0, 0.1, 0]} receiveShadow material={mats.plotFill}>
          <boxGeometry args={[2.0, 0.04, 3.0]} />
        </mesh>
        <mesh position={[wingThick / 2 + 2.0, 0.125, 0]} material={mats.plotBorderCyan}>
          <boxGeometry args={[0.12, 0.01, 3.0]} />
        </mesh>
      </group>

      {/* 2. NORTH WING (Cánh trên chạy từ Tây sang Đông) */}
      <group position={[wingThick / 2, 0, -totalD / 2 + wingThick / 2]}>
        <mesh position={[0, 0.1, 0]} receiveShadow material={mats.plotFill}>
          <boxGeometry args={[totalW - wingThick, 0.04, wingThick]} />
        </mesh>
        <mesh position={[0, 0.125, -wingThick / 2]} material={mats.plotBorderCyan}>
          <boxGeometry args={[totalW - wingThick, 0.01, 0.12]} />
        </mesh>
        <mesh position={[0, 0.125, wingThick / 2]} material={mats.plotBorderCyan}>
          <boxGeometry args={[totalW - wingThick, 0.01, 0.12]} />
        </mesh>
        <mesh position={[(totalW - wingThick) / 2, 0.125, 0]} material={mats.plotBorderCyan}>
          <boxGeometry args={[0.12, 0.01, wingThick]} />
        </mesh>
      </group>

      {/* 3. SOUTH WING (Cánh dưới chạy từ Tây sang Đông) */}
      <group position={[wingThick / 2, 0, totalD / 2 - wingThick / 2]}>
        <mesh position={[0, 0.1, 0]} receiveShadow material={mats.plotFill}>
          <boxGeometry args={[totalW - wingThick, 0.04, wingThick]} />
        </mesh>
        <mesh position={[0, 0.125, -wingThick / 2]} material={mats.plotBorderCyan}>
          <boxGeometry args={[totalW - wingThick, 0.01, 0.12]} />
        </mesh>
        <mesh position={[0, 0.125, wingThick / 2]} material={mats.plotBorderCyan}>
          <boxGeometry args={[totalW - wingThick, 0.01, 0.12]} />
        </mesh>
        <mesh position={[(totalW - wingThick) / 2, 0.125, 0]} material={mats.plotBorderCyan}>
          <boxGeometry args={[0.12, 0.01, wingThick]} />
        </mesh>
      </group>

      {/* 4. THE 4 SQUARE GREEN PLANTER BEDS IN THE COURTYARD (Exact 2x2 grid from blueprint) */}
      <CourtyardPlanterBed position={[-1.5, 0, -1.8]} />
      <CourtyardPlanterBed position={[-1.5, 0, 1.8]} />
      <CourtyardPlanterBed position={[5.5, 0, -1.8]} />
      <CourtyardPlanterBed position={[5.5, 0, 1.8]} />

      {/* Exterior Planter Strip Hugging Outer Perimeter of Tòa H */}
      <mesh position={[0, 0.06, -totalD / 2 - 0.4]} receiveShadow material={mats.lawnGreen}>
        <boxGeometry args={[totalW, 0.04, 0.6]} />
      </mesh>
      <mesh position={[0, 0.06, totalD / 2 + 0.4]} receiveShadow material={mats.lawnGreen}>
        <boxGeometry args={[totalW, 0.04, 0.6]} />
      </mesh>
      <mesh position={[-totalW / 2 - 0.4, 0.06, 0]} receiveShadow material={mats.lawnGreen}>
        <boxGeometry args={[0.6, 0.04, totalD]} />
      </mesh>
    </group>
  );
}

// ============================================================================
// 5. ROAD CIRCULATION (Exact Alignment from Blueprint Coordinates)
// ============================================================================
function CirculationRoad({ mats }: { mats: ReturnType<typeof useSitePlanMaterials> }) {
  // Blueprint exact coordinates:
  // Vertical Road Centerline: X = 5.8, Width = 3.6 (Spans X: 4.0 -> 7.6)
  // Horizontal Road Centerline: Z = -9.2, Width = 3.6 (Spans Z: -7.4 -> -11.0)
  // Arc Center: [-1.4, -2.0], Radius R = 7.2
  // Inner Radius = 7.2 - 1.8 = 5.4, Outer Radius = 7.2 + 1.8 = 9.0
  // Connection at Theta = 0: X = -1.4 + 7.2 = 5.8, Z = -2.0 (Joins vertical road seamlessly)
  // Connection at Theta = PI/2: X = -1.4, Z = -2.0 - 7.2 = -9.2 (Joins horizontal road seamlessly)
  // Khu Nhà H top-right corner is at [1.5, -3.5], distance to arc center = 3.26m < r_in (5.4m)
  // Net clearance to road = 2.14m (Generous landscaped lawn, completely clear!)

  const arcCenter: [number, number] = [-1.4, -2.0];
  const arcRadius = 7.2;
  const roadWidth = 3.6;
  const innerRadius = arcRadius - roadWidth / 2; // 5.4
  const outerRadius = arcRadius + roadWidth / 2; // 9.0

  // Dashed center line along curve
  const curveDashes = useMemo(() => {
    const dashes = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = 0.16 + (i * (Math.PI / 2 - 0.32)) / (count - 1);
      const x = arcCenter[0] + arcRadius * Math.cos(angle);
      const z = arcCenter[1] - arcRadius * Math.sin(angle);
      dashes.push({ x, z, angle });
    }
    return dashes;
  }, [arcCenter, arcRadius]);

  // Zebra Pedestrian Crossing stripes on top-right curve facing Sân Bóng Đá & Khu J
  // Angles 52° to 72°: perfectly positioned in front of Sân Bóng Đá
  // Each stripe oriented radially across the road: args={[roadWidth - 0.2, h, 0.28]} with rotation={[0, angle, 0]}
  const zebraStripes = useMemo(() => {
    const stripes = [];
    const count = 9;
    const startAngle = (52 * Math.PI) / 180;
    const endAngle = (72 * Math.PI) / 180;
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i * (endAngle - startAngle)) / (count - 1);
      const x = arcCenter[0] + arcRadius * Math.cos(angle);
      const z = arcCenter[1] - arcRadius * Math.sin(angle);
      stripes.push({ x, z, angle });
    }
    return stripes;
  }, [arcCenter, arcRadius]);

  return (
    <group>
      {/* 1. Straight South-to-North Road Section */}
      {/* Runs from South Gate (Z = 18.5) up to curve junction (Z = -2.0) (Length = 20.5) */}
      <mesh position={[5.8, 0.035, 8.25]} receiveShadow material={mats.darkAsphalt}>
        <boxGeometry args={[roadWidth, 0.07, 20.5]} />
      </mesh>

      {/* Dashed Center White Line on Vertical Section */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`dash-vert-${i}`}
          position={[5.8, 0.078, 16.5 - i * 3.3]}
          material={mats.whiteRoadLine}
        >
          <boxGeometry args={[0.14, 0.005, 1.8]} />
        </mesh>
      ))}

      {/* 2. Seamless Curved Road Elbow (Annular Ring Sector) */}
      <group position={[arcCenter[0], 0.07, arcCenter[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh receiveShadow material={mats.darkAsphalt}>
          <ringGeometry args={[innerRadius, outerRadius, 48, 1, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* Dashed Center White Line along Curve */}
      {curveDashes.map((d, i) => (
        <mesh
          key={`dash-curve-${i}`}
          position={[d.x, 0.078, d.z]}
          rotation={[0, d.angle + Math.PI / 2, 0]}
          material={mats.whiteRoadLine}
        >
          <boxGeometry args={[1.5, 0.005, 0.14]} />
        </mesh>
      ))}

      {/* Zebra Pedestrian Crosswalk on Curve (Crossing from Sân Bóng Đá to Khu J) */}
      {zebraStripes.map((s, i) => (
        <mesh
          key={`zebra-${i}`}
          position={[s.x, 0.082, s.z]}
          rotation={[0, s.angle, 0]}
          material={mats.whiteRoadLine}
        >
          <boxGeometry args={[roadWidth - 0.2, 0.005, 0.28]} />
        </mesh>
      ))}

      {/* 3. Straight Horizontal Westbound Road Section */}
      {/* Runs from curve junction (X = -1.4) down to West Wall (X = -27.0) at Z = -9.2 */}
      <mesh position={[-14.2, 0.035, -9.2]} receiveShadow material={mats.darkAsphalt}>
        <boxGeometry args={[25.6, 0.07, roadWidth]} />
      </mesh>

      {/* Dashed Center White Line on Horizontal Section */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={`dash-horiz-${i}`}
          position={[-3.2 - i * 3.4, 0.078, -9.2]}
          material={mats.whiteRoadLine}
        >
          <boxGeometry args={[1.8, 0.005, 0.14]} />
        </mesh>
      ))}

      {/* 4. Landscaped Inner Curve Green Garden Island */}
      {/* Circular green sector following inner road curb */}
      <group position={[arcCenter[0], 0.045, arcCenter[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh receiveShadow material={mats.lawnGreen}>
          <circleGeometry args={[innerRadius - 0.05, 48, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* Green Lawn Park Buffer North of Khu Nhà H (Between H and Horizontal Road) */}
      <mesh position={[-8.0, 0.042, -5.45]} receiveShadow material={mats.lawnGreen}>
        <boxGeometry args={[19.0, 0.02, 3.9]} />
      </mesh>

      {/* Green Lawn Strip East of Khu Nhà H (Between H and Vertical Road) */}
      <mesh position={[2.75, 0.042, 3.5]} receiveShadow material={mats.lawnGreen}>
        <boxGeometry args={[2.5, 0.02, 14.0]} />
      </mesh>
    </group>
  );
}

// Football Pitch Component (Exact Blueprint Coordinates: Center [-1.0, -15.4])
function FootballPitch({ mats }: { mats: ReturnType<typeof useSitePlanMaterials> }) {
  const pitchWidth = 13.5;
  const pitchHeight = 6.2;
  const stripesCount = 8;
  const stripeW = pitchWidth / stripesCount;

  return (
    <group position={[-1.0, 0, -15.4]}>
      <Html position={[0, 1.8, 0]} center distanceFactor={36} zIndexRange={[100, 0]}>
        <div className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold shadow-md border border-white/30 whitespace-nowrap">
          SÂN BÓNG ĐÁ
        </div>
      </Html>

      {/* Outer Green Turf Border (Depth 6.8: South edge at Z = -12.0, exactly 1.0m from road) */}
      <mesh position={[0, 0.03, 0]} receiveShadow material={mats.lawnGreen}>
        <boxGeometry args={[pitchWidth + 1.0, 0.06, 6.8]} />
      </mesh>

      {/* Alternating Mowing Stripes */}
      {Array.from({ length: stripesCount }).map((_, i) => {
        const sx = -pitchWidth / 2 + (i + 0.5) * stripeW;
        const mat = i % 2 === 0 ? mats.turfStripeA : mats.turfStripeB;
        return (
          <mesh key={`stripe-${i}`} position={[sx, 0.07, 0]} receiveShadow material={mat}>
            <boxGeometry args={[stripeW, 0.02, pitchHeight]} />
          </mesh>
        );
      })}

      {/* White Field Lines */}
      <mesh position={[0, 0.085, -pitchHeight / 2]} material={mats.whiteRoadLine}>
        <boxGeometry args={[pitchWidth, 0.005, 0.08]} />
      </mesh>
      <mesh position={[0, 0.085, pitchHeight / 2]} material={mats.whiteRoadLine}>
        <boxGeometry args={[pitchWidth, 0.005, 0.08]} />
      </mesh>
      <mesh position={[-pitchWidth / 2, 0.085, 0]} material={mats.whiteRoadLine}>
        <boxGeometry args={[0.08, 0.005, pitchHeight]} />
      </mesh>
      <mesh position={[pitchWidth / 2, 0.085, 0]} material={mats.whiteRoadLine}>
        <boxGeometry args={[0.08, 0.005, pitchHeight]} />
      </mesh>
      <mesh position={[0, 0.085, 0]} material={mats.whiteRoadLine}>
        <boxGeometry args={[0.08, 0.005, pitchHeight]} />
      </mesh>
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.28, 32]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Campus Boundary Walls & Gates (Aligned with Site Dimensions)
function CampusBoundaryAndGates({ mats }: { mats: ReturnType<typeof useSitePlanMaterials> }) {
  const wallH = 1.2;
  const wallThick = 0.28;

  return (
    <group>
      {/* North Perimeter Wall */}
      <mesh position={[0, wallH / 2, -19.5]} castShadow material={mats.boundaryWall}>
        <boxGeometry args={[56, wallH, wallThick]} />
      </mesh>
      {/* West Perimeter Wall */}
      <mesh position={[-28.0, wallH / 2, -0.5]} castShadow material={mats.boundaryWall}>
        <boxGeometry args={[wallThick, wallH, 38.0]} />
      </mesh>
      {/* East Perimeter Wall */}
      <mesh position={[28.0, wallH / 2, -0.5]} castShadow material={mats.boundaryWall}>
        <boxGeometry args={[wallThick, wallH, 38.0]} />
      </mesh>

      {/* South Wall Segments with Gate Openings */}
      {/* Segment West of Main Gate: from X = -28.0 to X = 3.6 */}
      <mesh position={[-12.2, wallH / 2, 18.5]} castShadow material={mats.boundaryWall}>
        <boxGeometry args={[31.6, wallH, wallThick]} />
      </mesh>
      {/* Segment between Main Gate and Secondary Gate: from X = 8.0 to X = 16.5 */}
      <mesh position={[12.25, wallH / 2, 18.5]} castShadow material={mats.boundaryWall}>
        <boxGeometry args={[8.5, wallH, wallThick]} />
      </mesh>
      {/* Segment East of Secondary Gate: from X = 20.2 to X = 28.0 */}
      <mesh position={[24.1, wallH / 2, 18.5]} castShadow material={mats.boundaryWall}>
        <boxGeometry args={[7.8, wallH, wallThick]} />
      </mesh>

      {/* Main South Gate Pillars & Badge at X = 5.8 (Aligned with vertical road) */}
      <group position={[5.8, 0, 18.5]}>
        <mesh position={[-2.1, 1.1, 0]} castShadow material={mats.crispWhite}>
          <boxGeometry args={[0.6, 2.2, 0.6]} />
        </mesh>
        <mesh position={[2.1, 1.1, 0]} castShadow material={mats.crispWhite}>
          <boxGeometry args={[0.6, 2.2, 0.6]} />
        </mesh>
        <Html position={[0, 2.8, 0]} center distanceFactor={36} zIndexRange={[100, 0]}>
          <div className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold shadow-lg border border-amber-300/40 whitespace-nowrap">
            CỔNG RA VÀO (CHÍNH)
          </div>
        </Html>
      </group>

      {/* Secondary South Gate at X = 18.5 */}
      <group position={[18.5, 0, 18.5]}>
        <mesh position={[-1.7, 1.1, 0]} castShadow material={mats.crispWhite}>
          <boxGeometry args={[0.55, 2.2, 0.55]} />
        </mesh>
        <mesh position={[1.7, 1.1, 0]} castShadow material={mats.crispWhite}>
          <boxGeometry args={[0.55, 2.2, 0.55]} />
        </mesh>
        <Html position={[0, 2.8, 0]} center distanceFactor={36} zIndexRange={[100, 0]}>
          <div className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[9px] font-semibold shadow-md whitespace-nowrap">
            CỔNG RA VÀO (PHỤ)
          </div>
        </Html>
      </group>
    </group>
  );
}

// ============================================================================
// 6. MAIN SCENE: PRECISE POSITIONS BASED STRICTLY ON MASTERPLAN BLUEPRINT
// ============================================================================
export function CampusCS3Scene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const mats = useSitePlanMaterials();

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        performance={{ min: 0.6 }}
        camera={{
          position: [32, 42, 34],
          fov: 34,
          near: 0.5,
          far: 280,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        {/* Studio Background */}
        <color attach="background" args={['#eef2f6']} />

        {/* Ambient & Daylight Sunlight */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <hemisphereLight args={['#ffffff', '#dbeafe', 0.65]} />
        <directionalLight
          position={[38, 55, 32]}
          intensity={1.25}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={160}
          shadow-camera-left={-42}
          shadow-camera-right={42}
          shadow-camera-top={42}
          shadow-camera-bottom={-42}
          shadow-bias={-0.0004}
        />

        {/* Smooth Orbit Camera Rig */}
        <CameraRig controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={15}
          maxDistance={140}
        />

        {/* SINGLE SOLID GROUND PLANE */}
        <mesh position={[0, -0.01, -0.5]} receiveShadow material={mats.pavedGround}>
          <boxGeometry args={[140, 0.02, 140]} />
        </mesh>

        {/* Boundary Walls & Gate Entrances */}
        <CampusBoundaryAndGates mats={mats} />

        {/* Main Road Circulation System */}
        <CirculationRoad mats={mats} />

        {/* Top-Center Football Pitch */}
        <FootballPitch mats={mats} />

        {/* ================================================================== */}
        {/* 1. KHU NHÀ H: 3D MODEL AT EXACT BLUEPRINT POS (OPENING EAST)       */}
        {/* ================================================================== */}
        <CADBuildingModel
          modelUrl="/models/cs3/toa_h.glb"
          position={[-8.0, 2.8, 3.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[7.4, 8.5, 11.2]}
          buildingCode="toa_h"
          buildingName="KHU NHÀ H (6 TẦNG)"
          heightOffset={4.5}
          fallback={<BuildingHPlot />}
        />

        {/* ================================================================== */}
        {/* 2. KHU NHÀ L: RETAINED 3D BUILDING MODEL AT EXACT BLUEPRINT POS    */}
        {/* ================================================================== */}
        <CADBuildingModel
          modelUrl="/models/cs3/toa_l.glb"
          position={[13.2, 1.45, 14.8]}
          rotation={[0, Math.PI, 0]}
          scale={[4.8, 6.5, 4.8]}
          buildingCode="toa_l"
          buildingName="KHU NHÀ L"
          heightOffset={3.6}
          fallback={
            <MarkedBuildingPlot
              position={[13.2, 0, 14.8]}
              size={[9.6, 4.6]}
              label="KHU NHÀ L"
              subLabel="Phòng GTVT & Y Tế"
            />
          }
        />

        {/* ================================================================== */}
        {/* 3. XƯỞNG Ô TÔ (3D Model - Khoa Cơ Khí Động Lực)                    */}
        {/* ================================================================== */}
        <CADBuildingModel
          modelUrl="/models/cs3/xuong_oto.glb"
          position={[-24.0, 1.93, 3.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5.5, 6.0, 8.8]}
          buildingCode="xuong_oto"
          buildingName="XƯỞNG Ô TÔ"
          heightOffset={3.2}
          fallback={
            <MarkedBuildingPlot
              position={[-24.0, 0, 3.5]}
              size={[4.8, 16.5]}
              label="XƯỞNG Ô TÔ"
              subLabel="Khoa Cơ Khí Động Lực"
            />
          }
        />

        {/* ================================================================== */}
        {/* 4. KHU NHÀ I (ĐƯỜNG) - 3D Model Khu Đất Phụ Trợ                   */}
        {/* ================================================================== */}
        <CADBuildingModel
          modelUrl="/models/cs3/toa_i_duong.glb"
          position={[-21.5, 1.06, -15.4]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5.0, 5.5, 3.6]}
          buildingCode="toa_i_duong"
          buildingName="KHU NHÀ I (ĐƯỜNG)"
          heightOffset={2.5}
          fallback={
            <MarkedBuildingPlot
              position={[-21.5, 0, -15.4]}
              size={[4.0, 6.8]}
              label="KHU NHÀ I (ĐƯỜNG)"
              subLabel="Khu Đất Phụ Trợ"
            />
          }
        />

        {/* ================================================================== */}
        {/* 5. KHU NHÀ I (6 TẦNG) KHU GIẢNG ĐƯỜNG - Northwest Main Lecture Lot */}
        {/* ================================================================== */}
        <MarkedBuildingPlot
          position={[-13.5, 0, -15.4]}
          size={[7.2, 6.8]}
          label="KHU NHÀ I (6 TẦNG)"
          subLabel="KHU GIẢNG ĐƯỜNG"
        />

        {/* ================================================================== */}
        {/* 6. KHU NHÀ J (6 TẦNG) - 3D Model Ký Túc Xá Sinh Viên               */}
        {/* ================================================================== */}
        <CADBuildingModel
          modelUrl="/models/cs3/toa_j.glb"
          position={[13.5, 3.21, -15.4]}
          rotation={[0, 0, 0]}
          scale={[5.0, 4.2, 4.0]}
          buildingCode="toa_j"
          buildingName="KHU NHÀ J (6 TẦNG)"
          heightOffset={4.0}
          fallback={
            <MarkedBuildingPlot
              position={[13.5, 0, -15.4]}
              size={[9.5, 6.8]}
              label="KHU NHÀ J (6 TẦNG)"
              subLabel="KÝ TÚC XÁ SINH VIÊN"
            />
          }
        />

        {/* ================================================================== */}
        {/* 7. KHU NHÀ K (7 TẦNG) - Center-East Dominant Tower Lot             */}
        {/* ================================================================== */}
        <MarkedBuildingPlot
          position={[15.0, 0, 4.2]}
          size={[8.6, 11.2]}
          label="KHU NHÀ K (7 TẦNG)"
          subLabel="Viện Đào Tạo & Khoa Chuyên Ngành"
        />

        {/* ================================================================== */}
        {/* 8. KHU NHÀ M (HỮU THỰC HÀNH) - Bottom-Left Workshop Lot            */}
        {/* ================================================================== */}
        <MarkedBuildingPlot
          position={[-11.5, 0, 15.0]}
          size={[24.8, 5.0]}
          label="KHU NHÀ M"
          subLabel="HỮU THỰC HÀNH"
        />

        {/* ================================================================== */}
        {/* 9. NHÀ ĐA NĂNG (2 TẦNG) - 3D Model Southeast Sports & Events       */}
        {/* ================================================================== */}
        <CADBuildingModel
          modelUrl="/models/cs3/nha_da_nang.glb"
          position={[22.8, 1.9, 14.6]}
          rotation={[0, 0, 0]}
          scale={[4.0, 4.5, 3.3]}
          buildingCode="nha_da_nang"
          buildingName="NHÀ ĐA NĂNG (2 TẦNG)"
          heightOffset={3.0}
          fallback={
            <MarkedBuildingPlot
              position={[22.8, 0, 14.6]}
              size={[7.6, 5.6]}
              label="NHÀ ĐA NĂNG"
              subLabel="(2 TẦNG)"
            />
          }
        />
      </Canvas>
    </div>
  );
}
