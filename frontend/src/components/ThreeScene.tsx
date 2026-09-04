import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/** Generates a sphere of random points */
function generateSpherePoints(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.8 + Math.random() * 0.2);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function ParticleSphere() {
  const ref = useRef<THREE.Points>(null!);
  const positions = React.useMemo(() => generateSpherePoints(2500, 1.8), []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.06;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.15;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8B5CF6"
        size={0.025}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

function InnerOrb() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
      ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial
        color="#6366F1"
        transparent
        opacity={0.15}
        wireframe={true}
      />
    </mesh>
  );
}

/** Lightweight Three.js particle sphere for the hero section */
export const ThreeScene: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className ?? 'w-full h-full'} aria-hidden="true">
    <Canvas
      camera={{ position: [0, 0, 4], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} color="#6366F1" intensity={1} />
      <pointLight position={[-5, -5, 5]} color="#22D3EE" intensity={0.5} />
      <Suspense fallback={null}>
        <ParticleSphere />
        <InnerOrb />
      </Suspense>
    </Canvas>
  </div>
);
