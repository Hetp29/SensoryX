'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Float } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Floating DNA Helix Strands
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 40;

  const helixPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const radius = 1.5;

      // First strand
      points.push({
        position: [
          Math.cos(t) * radius,
          (i / count) * 8 - 4,
          Math.sin(t) * radius,
        ] as [number, number, number],
        scale: 0.1 + Math.sin(t) * 0.05,
      });

      // Second strand (opposite)
      points.push({
        position: [
          Math.cos(t + Math.PI) * radius,
          (i / count) * 8 - 4,
          Math.sin(t + Math.PI) * radius,
        ] as [number, number, number],
        scale: 0.1 + Math.cos(t) * 0.05,
      });
    }
    return points;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.5;
  });

  return (
    <group ref={groupRef}>
      {helixPoints.map((point, i) => (
        <mesh key={i} position={point.position}>
          <sphereGeometry args={[point.scale, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#6366f1' : '#a855f7'}
            emissive={i % 2 === 0 ? '#4f46e5' : '#9333ea'}
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Pulsating Neural Core
function NeuralCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
    meshRef.current.scale.setScalar(pulse);
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 4]} />
      <MeshDistortMaterial
        color="#6366f1"
        emissive="#4f46e5"
        emissiveIntensity={0.8}
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

// Orbiting Energy Particles
function EnergyParticle({ radius, speed, offset, color }: {
  radius: number;
  speed: number;
  offset: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(50 * 3), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime() * speed + offset;
    const x = Math.cos(time) * radius;
    const z = Math.sin(time) * radius;
    const y = Math.sin(time * 2) * 1.5;

    meshRef.current.position.set(x, y, z);

    // Update trail
    if (trailRef.current) {
      for (let i = positions.length - 3; i >= 3; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
      }
      positions[0] = x;
      positions[1] = y;
      positions[2] = z;
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={color}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </>
  );
}

// Floating Neural Nodes with Connections
function NeuralNetwork() {
  const nodesRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const nodes = useMemo(() => {
    const temp = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 1.5;

      temp.push({
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ] as [number, number, number],
        speed: 0.3 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  const connections = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
          Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
        );

        if (dist < 2.5) {
          points.push(...nodes[i].position, ...nodes[j].position);
        }
      }
    }

    return new Float32Array(points);
  }, [nodes]);

  useFrame((state) => {
    if (nodesRef.current) {
      nodesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }

    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <>
      <group ref={nodesRef}>
        {nodes.map((node, i) => (
          <Float
            key={i}
            speed={node.speed}
            rotationIntensity={0.5}
            floatIntensity={0.5}
          >
            <mesh position={node.position}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color="#a855f7"
                emissive="#9333ea"
                emissiveIntensity={0.8}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </Float>
        ))}
      </group>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.15}
          linewidth={1}
        />
      </lineSegments>
    </>
  );
}

// Ambient Floating Particles
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      const color = new THREE.Color(Math.random() > 0.5 ? '#6366f1' : '#a855f7');
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      positions[i + 1] = y + Math.sin(state.clock.getElapsedTime() + i) * 0.002;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Energy Rings
function EnergyRing({ radius, axis = 'x' }: { radius: number; axis?: 'x' | 'y' | 'z' }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;

    if (axis === 'x') ringRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
    if (axis === 'y') ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    if (axis === 'z') ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.5;

    const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    ringRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial
        color="#6366f1"
        emissive="#4f46e5"
        emissiveIntensity={0.8}
        transparent
        opacity={0.6}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

export default function SensoryCanvas() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        className="bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
        <pointLight position={[0, 0, 0]} intensity={2} color="#8b5cf6" />
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          color="#6366f1"
        />

        {/* Main Elements */}
        <NeuralCore />
        <DNAHelix />
        <NeuralNetwork />

        {/* Energy Rings */}
        <EnergyRing radius={2.5} axis="x" />
        <EnergyRing radius={2.8} axis="y" />
        <EnergyRing radius={3.1} axis="z" />

        {/* Orbiting Particles */}
        <EnergyParticle radius={3.5} speed={0.5} offset={0} color="#6366f1" />
        <EnergyParticle radius={3.8} speed={0.6} offset={Math.PI / 3} color="#a855f7" />
        <EnergyParticle radius={4.1} speed={0.7} offset={Math.PI * 2 / 3} color="#8b5cf6" />
        <EnergyParticle radius={4.4} speed={0.4} offset={Math.PI} color="#7c3aed" />

        {/* Ambient Particles */}
        <AmbientParticles />

        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
