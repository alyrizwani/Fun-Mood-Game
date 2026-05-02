import { useMemo } from 'react';
import * as THREE from 'three';

interface CrateProps {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}

function Crate({ position, size, color = '#8B6914' }: CrateProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

const cratesData: { position: [number, number, number]; size: [number, number, number]; color?: string }[] = [
  { position: [6, 0.75, 6], size: [2, 1.5, 2], color: '#7a5c10' },
  { position: [-6, 0.75, 6], size: [2, 1.5, 2], color: '#7a5c10' },
  { position: [6, 0.75, -6], size: [2, 1.5, 2], color: '#7a5c10' },
  { position: [-6, 0.75, -6], size: [2, 1.5, 2], color: '#7a5c10' },
  { position: [0, 0.75, 9], size: [4, 1.5, 1.5], color: '#5a4010' },
  { position: [0, 0.75, -9], size: [4, 1.5, 1.5], color: '#5a4010' },
  { position: [9, 0.75, 0], size: [1.5, 1.5, 4], color: '#5a4010' },
  { position: [-9, 0.75, 0], size: [1.5, 1.5, 4], color: '#5a4010' },
  { position: [14, 1, 14], size: [3, 2, 1], color: '#4a3a08' },
  { position: [-14, 1, 14], size: [3, 2, 1], color: '#4a3a08' },
  { position: [14, 1, -14], size: [1, 2, 3], color: '#4a3a08' },
  { position: [-14, 1, -14], size: [3, 2, 1], color: '#4a3a08' },
];

const borderWalls: { position: [number, number, number]; size: [number, number, number] }[] = [
  { position: [0, 1.5, 25], size: [50, 3, 1] },
  { position: [0, 1.5, -25], size: [50, 3, 1] },
  { position: [25, 1.5, 0], size: [1, 3, 50] },
  { position: [-25, 1.5, 0], size: [1, 3, 50] },
];

const gridSizeData = 50;
const tileCount = 25;
const tileSize = gridSizeData / tileCount;

export default function World() {
  const gridLines = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = [];
    const half = gridSizeData / 2;
    for (let i = 0; i <= tileCount; i++) {
      const pos = -half + i * tileSize;
      lines.push({ start: [pos, 0.02, -half], end: [pos, 0.02, half] });
      lines.push({ start: [-half, 0.02, pos], end: [half, 0.02, pos] });
    }
    return lines;
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a2030" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Grid overlay */}
      {gridLines.map((line, i) => {
        const dx = line.end[0] - line.start[0];
        const dz = line.end[2] - line.start[2];
        const len = Math.sqrt(dx * dx + dz * dz);
        const cx = (line.start[0] + line.end[0]) / 2;
        const cz = (line.start[2] + line.end[2]) / 2;
        const angle = Math.atan2(dx, dz);
        return (
          <mesh key={i} position={[cx, 0.02, cz]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.03, 0.01, len]} />
            <meshBasicMaterial color="#2a3545" opacity={0.6} transparent />
          </mesh>
        );
      })}

      {/* Border walls */}
      {borderWalls.map((w, i) => (
        <mesh key={`wall-${i}`} position={w.position} castShadow receiveShadow>
          <boxGeometry args={w.size} />
          <meshStandardMaterial color="#0d1520" roughness={0.9} metalness={0.2} />
        </mesh>
      ))}

      {/* Crates / cover */}
      {cratesData.map((c, i) => (
        <Crate key={`crate-${i}`} {...c} />
      ))}

      {/* Ambient glow spots */}
      <pointLight position={[0, 4, 0]} intensity={15} distance={30} color="#1a3a6a" />
      <pointLight position={[15, 3, 15]} intensity={8} distance={20} color="#1a2a4a" />
      <pointLight position={[-15, 3, -15]} intensity={8} distance={20} color="#1a2a4a" />
      <pointLight position={[15, 3, -15]} intensity={8} distance={20} color="#2a1a1a" />
      <pointLight position={[-15, 3, 15]} intensity={8} distance={20} color="#2a1a1a" />

      {/* Floor glow strips */}
      {[-20, -10, 0, 10, 20].map((x) => (
        <mesh key={`strip-${x}`} position={[x, 0.03, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.02, 48]} />
          <meshBasicMaterial color="#1a3a6a" opacity={0.4} transparent />
        </mesh>
      ))}
    </group>
  );
}

export { cratesData };
