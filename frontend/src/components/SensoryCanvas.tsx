'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface ParticleProps {
  position: [number, number, number];
  speed: number;
}

function Particle({ position, speed }: ParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRef = useRef(new THREE.Vector3(...position));
  const velocityRef = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const mesh = meshRef.current;

    // Smooth floating animation
    targetRef.current.x = position[0] + Math.sin(time * speed + position[0]) * 0.3;
    targetRef.current.y = position[1] + Math.cos(time * speed + position[1]) * 0.3;
    targetRef.current.z = position[2] + Math.sin(time * speed * 0.5) * 0.2;

    // Smooth interpolation
    velocityRef.current.lerp(
      targetRef.current.clone().sub(mesh.position),
      0.05
    );
    mesh.position.add(velocityRef.current);

    // Pulse effect
    const scale = 1 + Math.sin(time * speed * 2) * 0.1;
    mesh.scale.setScalar(scale);
  });

  return (
    <Sphere ref={meshRef} args={[0.05, 16, 16]} position={position}>
      <meshStandardMaterial
        color="#6366f1"
        emissive="#4f46e5"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.getElapsedTime();
    linesRef.current.rotation.y = time * 0.05;
    linesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const radius = 2 + Math.random() * 1;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * radius,
          (Math.random() - 0.5) * 2,
          Math.sin(theta) * radius
        )
      );
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return lineGeometry;
  }, []);

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#4f46e5" transparent opacity={0.15} />
    </lineSegments>
  );
}

function ParticleField() {
  const particles = useMemo(() => {
    const temp: ParticleProps[] = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 2;

      temp.push({
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ],
        speed: 0.2 + Math.random() * 0.3,
      });
    }

    return temp;
  }, []);

  return (
    <>
      {particles.map((particle, i) => (
        <Particle key={i} {...particle} />
      ))}
    </>
  );
}

export default function SensoryCanvas() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />

        <ParticleField />
        <ConnectionLines />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
