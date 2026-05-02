import { useMemo } from 'react';
import * as THREE from 'three';

// ── Reusable materials ───────────────────────────────────────────────
const crateMat = new THREE.MeshStandardMaterial({ color: '#6a4e10', roughness: 0.9, metalness: 0.05 });
const concreteMat = new THREE.MeshStandardMaterial({ color: '#1a2030', roughness: 0.95, metalness: 0.1 });
const metalMat = new THREE.MeshStandardMaterial({ color: '#253040', roughness: 0.5, metalness: 0.7 });
const darkMetalMat = new THREE.MeshStandardMaterial({ color: '#101820', roughness: 0.6, metalness: 0.8 });
const platformMat = new THREE.MeshStandardMaterial({ color: '#1e2d3e', roughness: 0.7, metalness: 0.4 });
const neonGreenMat = new THREE.MeshBasicMaterial({ color: '#00ff88' });
const neonBlueMat = new THREE.MeshBasicMaterial({ color: '#0066ff' });
const neonRedMat = new THREE.MeshBasicMaterial({ color: '#ff2222' });
const neonOrangeMat = new THREE.MeshBasicMaterial({ color: '#ff6600' });

interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  material?: THREE.Material;
  rotation?: [number, number, number];
}

function Box({ position, size, material = concreteMat, rotation = [0, 0, 0] }: BoxProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ── Cover geometry ───────────────────────────────────────────────────
const coverObjects: BoxProps[] = [
  // Corner crates cluster NE
  { position: [7, 0.6, 7], size: [1.6, 1.2, 1.6], material: crateMat },
  { position: [8.6, 0.35, 7], size: [1.2, 0.7, 1.4], material: crateMat },
  { position: [7, 1.45, 7], size: [1.0, 0.5, 1.0], material: crateMat },
  // Corner crates cluster NW
  { position: [-7, 0.6, 7], size: [1.6, 1.2, 1.6], material: crateMat },
  { position: [-8.6, 0.35, 7], size: [1.2, 0.7, 1.4], material: crateMat },
  // Corner crates cluster SE
  { position: [7, 0.6, -7], size: [1.6, 1.2, 1.6], material: crateMat },
  { position: [8.6, 0.35, -7], size: [1.2, 0.7, 1.4], material: crateMat },
  // Corner crates cluster SW
  { position: [-7, 0.6, -7], size: [1.6, 1.2, 1.6], material: crateMat },
  { position: [-8.6, 0.35, -7], size: [1.2, 0.7, 1.4], material: crateMat },

  // Mid-axis barriers
  { position: [0, 0.7, 10], size: [5, 1.4, 0.6], material: metalMat },
  { position: [0, 0.7, -10], size: [5, 1.4, 0.6], material: metalMat },
  { position: [10, 0.7, 0], size: [0.6, 1.4, 5], material: metalMat },
  { position: [-10, 0.7, 0], size: [0.6, 1.4, 5], material: metalMat },

  // Low concrete barriers (prone cover)
  { position: [4, 0.35, 14], size: [4, 0.7, 0.5], material: concreteMat },
  { position: [-4, 0.35, 14], size: [4, 0.7, 0.5], material: concreteMat },
  { position: [4, 0.35, -14], size: [4, 0.7, 0.5], material: concreteMat },
  { position: [-4, 0.35, -14], size: [4, 0.7, 0.5], material: concreteMat },
  { position: [14, 0.35, 4], size: [0.5, 0.7, 4], material: concreteMat },
  { position: [14, 0.35, -4], size: [0.5, 0.7, 4], material: concreteMat },
  { position: [-14, 0.35, 4], size: [0.5, 0.7, 4], material: concreteMat },
  { position: [-14, 0.35, -4], size: [0.5, 0.7, 4], material: concreteMat },

  // Corner towers
  { position: [16, 1.5, 16], size: [2.4, 3, 2.4], material: darkMetalMat },
  { position: [-16, 1.5, 16], size: [2.4, 3, 2.4], material: darkMetalMat },
  { position: [16, 1.5, -16], size: [2.4, 3, 2.4], material: darkMetalMat },
  { position: [-16, 1.5, -16], size: [2.4, 3, 2.4], material: darkMetalMat },

  // Pillars near center
  { position: [4, 1.5, 4], size: [0.7, 3, 0.7], material: metalMat },
  { position: [-4, 1.5, 4], size: [0.7, 3, 0.7], material: metalMat },
  { position: [4, 1.5, -4], size: [0.7, 3, 0.7], material: metalMat },
  { position: [-4, 1.5, -4], size: [0.7, 3, 0.7], material: metalMat },

  // Diagonal scattered crates
  { position: [12, 0.4, 5], size: [1.2, 0.8, 1.2], material: crateMat },
  { position: [-12, 0.4, -5], size: [1.2, 0.8, 1.2], material: crateMat },
  { position: [5, 0.4, -12], size: [1.2, 0.8, 1.2], material: crateMat },
  { position: [-5, 0.4, 12], size: [1.2, 0.8, 1.2], material: crateMat },
];

// ── Border walls ─────────────────────────────────────────────────────
const borderWalls: BoxProps[] = [
  { position: [0, 2.5, 25], size: [50, 5, 0.8], material: darkMetalMat },
  { position: [0, 2.5, -25], size: [50, 5, 0.8], material: darkMetalMat },
  { position: [25, 2.5, 0], size: [0.8, 5, 50], material: darkMetalMat },
  { position: [-25, 2.5, 0], size: [0.8, 5, 50], material: darkMetalMat },
];

export default function World() {
  const gridLines = useMemo(() => {
    const lines: { cx: number; cz: number; angle: number; len: number }[] = [];
    const half = 25;
    const count = 25;
    const size = 50 / count;
    for (let i = 0; i <= count; i++) {
      const pos = -half + i * size;
      // vertical lines
      lines.push({ cx: pos, cz: 0, angle: 0, len: 50 });
      // horizontal lines
      lines.push({ cx: 0, cz: pos, angle: Math.PI / 2, len: 50 });
    }
    return lines;
  }, []);

  return (
    <group>
      {/* ── Floor ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#131c28" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* ── Tactical zone circles (floor markings) ──────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[5.8, 6.0, 48]} />
        <meshBasicMaterial color="#0a3060" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[11.8, 12.0, 48]} />
        <meshBasicMaterial color="#0a2040" />
      </mesh>

      {/* ── Grid overlay ─────────────────────────────────────────────── */}
      {gridLines.map((l, i) => (
        <mesh key={i} position={[l.cx, 0.01, l.cz]} rotation={[0, l.angle, 0]}>
          <boxGeometry args={[0.025, 0.01, l.len]} />
          <meshBasicMaterial color="#1a2840" opacity={0.55} transparent />
        </mesh>
      ))}

      {/* ── Neon floor strips ────────────────────────────────────────── */}
      {[-18, -9, 0, 9, 18].map((x) => (
        <mesh key={`gs-${x}`} position={[x, 0.015, 0]}>
          <boxGeometry args={[0.06, 0.01, 49]} />
          <primitive object={neonBlueMat} attach="material" />
        </mesh>
      ))}
      {[-18, -9, 0, 9, 18].map((z) => (
        <mesh key={`gz-${z}`} position={[0, 0.015, z]}>
          <boxGeometry args={[49, 0.01, 0.06]} />
          <primitive object={neonBlueMat} attach="material" />
        </mesh>
      ))}

      {/* ── Central raised platform ──────────────────────────────────── */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.5, 4.8, 0.24, 32]} />
        <primitive object={platformMat} attach="material" />
      </mesh>
      {/* Platform edge neon ring */}
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[4.65, 0.04, 8, 48]} />
        <primitive object={neonGreenMat} attach="material" />
      </mesh>

      {/* ── Border walls ─────────────────────────────────────────────── */}
      {borderWalls.map((w, i) => (
        <Box key={`wall-${i}`} {...w} />
      ))}

      {/* ── Neon strips on top of border walls ──────────────────────── */}
      {[
        { position: [0, 5.1, 25] as [number, number, number], size: [50, 0.08, 0.08] as [number, number, number] },
        { position: [0, 5.1, -25] as [number, number, number], size: [50, 0.08, 0.08] as [number, number, number] },
        { position: [25, 5.1, 0] as [number, number, number], size: [0.08, 0.08, 50] as [number, number, number] },
        { position: [-25, 5.1, 0] as [number, number, number], size: [0.08, 0.08, 50] as [number, number, number] },
      ].map((s, i) => (
        <mesh key={`ws-${i}`} position={s.position}>
          <boxGeometry args={s.size} />
          <primitive object={neonRedMat} attach="material" />
        </mesh>
      ))}

      {/* ── Corner tower neon accents ────────────────────────────────── */}
      {[
        [16, 16], [-16, 16], [16, -16], [-16, -16],
      ].map(([x, z], i) => (
        <mesh key={`ta-${i}`} position={[x, 3.1, z]}>
          <boxGeometry args={[2.45, 0.06, 2.45]} />
          <primitive object={i % 2 === 0 ? neonOrangeMat : neonRedMat} attach="material" />
        </mesh>
      ))}

      {/* ── Cover objects ────────────────────────────────────────────── */}
      {coverObjects.map((c, i) => (
        <Box key={`cover-${i}`} {...c} />
      ))}

      {/* ── Pillar cap neons ─────────────────────────────────────────── */}
      {[[4, 4], [-4, 4], [4, -4], [-4, -4]].map(([x, z], i) => (
        <mesh key={`pc-${i}`} position={[x, 3.05, z]}>
          <boxGeometry args={[0.72, 0.06, 0.72]} />
          <primitive object={neonBlueMat} attach="material" />
        </mesh>
      ))}

      {/* ── Atmospheric lighting ─────────────────────────────────────── */}
      {/* Central overhead */}
      <pointLight position={[0, 6, 0]} intensity={30} distance={35} color="#2244aa" />

      {/* Corner zone tinted lights */}
      <pointLight position={[16, 5, 16]} intensity={18} distance={22} color="#0033ff" />
      <pointLight position={[-16, 5, 16]} intensity={18} distance={22} color="#0033ff" />
      <pointLight position={[16, 5, -16]} intensity={18} distance={22} color="#330011" />
      <pointLight position={[-16, 5, -16]} intensity={18} distance={22} color="#330011" />

      {/* Mid-axis accent lights */}
      <pointLight position={[0, 3, 12]} intensity={12} distance={18} color="#002244" />
      <pointLight position={[0, 3, -12]} intensity={12} distance={18} color="#002244" />
      <pointLight position={[12, 3, 0]} intensity={12} distance={18} color="#220044" />
      <pointLight position={[-12, 3, 0]} intensity={12} distance={18} color="#220044" />

      {/* Platform glow */}
      <pointLight position={[0, 1, 0]} intensity={20} distance={10} color="#00ff88" />
    </group>
  );
}
