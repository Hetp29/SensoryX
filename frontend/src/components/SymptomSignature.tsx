'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface SymptomSignatureProps {
  similarity?: number;
  compact?: boolean;
}

function SignatureWaveform({ similarity = 95 }: { similarity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const waveData = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const particlePositions: number[] = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      const x = (i / count) * 8 - 4;
      const y = Math.sin(i * 0.3) * (similarity / 100) + Math.cos(i * 0.15) * 0.5;
      const z = 0;

      points.push(new THREE.Vector3(x, y, z));

      if (i % 3 === 0) {
        particlePositions.push(x, y, z);
      }
    }

    return { points, particlePositions: new Float32Array(particlePositions) };
  }, [similarity]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <>
      {/* Main waveform line */}
      <line ref={meshRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(waveData.points.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#6366f1" linewidth={2} />
      </line>

      {/* Particle overlay */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[waveData.particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#a855f7"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </>
  );
}

export default function SymptomSignature({ similarity = 95, compact = false }: SymptomSignatureProps) {
  return (
    <div className={compact ? "h-32 w-full" : "h-64 w-full"}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="bg-transparent"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />

        <SignatureWaveform similarity={similarity} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
