'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Floating DNA-like particles
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Create a cylindrical distribution
      const theta = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 5;
      const y = (Math.random() - 0.5) * 20;

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      // Purple to indigo gradient
      const color = new THREE.Color();
      color.setHSL(0.7 + Math.random() * 0.1, 0.7, 0.5 + Math.random() * 0.2);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;

    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;

    // Gentle floating motion
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;

      // Wrap around
      if (positions[i3 + 1] > 10) positions[i3 + 1] = -10;
      if (positions[i3 + 1] < -10) positions[i3 + 1] = 10;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Pulsing brain-like core
function BrainCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.IcosahedronGeometry>(null);

  useFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return;

    const time = state.clock.elapsedTime;

    // Pulsing effect
    const scale = 1 + Math.sin(time * 0.5) * 0.15;
    meshRef.current.scale.setScalar(scale);

    // Slow rotation
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;

    // Distortion
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const originalPositions = geometryRef.current.getAttribute('position').array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];
      const z = originalPositions[i + 2];

      const noise = Math.sin(time + x * 2) * Math.cos(time + y * 2) * 0.1;
      positions[i] = x + noise;
      positions[i + 1] = y + noise;
      positions[i + 2] = z + noise;
    }

    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry ref={geometryRef} args={[1.5, 4]} />
      <meshStandardMaterial
        color="#6366f1"
        wireframe
        emissive="#8b5cf6"
        emissiveIntensity={0.4}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Energy rings
function EnergyRings() {
  const rings = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      radius: 2 + i * 1.5,
      speed: 0.3 + i * 0.2,
      offset: i * Math.PI * 0.6,
    }));
  }, []);

  return (
    <>
      {rings.map((ring, idx) => (
        <Ring key={idx} radius={ring.radius} speed={ring.speed} offset={ring.offset} />
      ))}
    </>
  );
}

function Ring({ radius, speed, offset }: { radius: number; speed: number; offset: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = state.clock.elapsedTime * speed + offset;

    // Pulsing opacity
    const opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2 + offset) * 0.1;
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Connecting lines between particles
function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const particleCount = 50;

  const { positions, particlePositions } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const particlePositions: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 3;
      const y = (Math.random() - 0.5) * 15;

      const pos = new THREE.Vector3(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius
      );
      particlePositions.push(pos);

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    }

    return { positions, particlePositions };
  }, [particleCount]);

  useFrame((state) => {
    if (!linesRef.current) return;

    const time = state.clock.elapsedTime;
    linesRef.current.rotation.y = time * 0.05;

    // Update particle positions
    const posArray = linesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArray[i3 + 1] += Math.sin(time * 0.5 + i) * 0.003;

      if (posArray[i3 + 1] > 8) posArray[i3 + 1] = -8;
      if (posArray[i3 + 1] < -8) posArray[i3 + 1] = 8;
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a78bfa"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function AnalyzeCanvas() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={['transparent']} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />

        {/* 3D Elements */}
        <BrainCore />
        <FloatingParticles />
        <EnergyRings />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
