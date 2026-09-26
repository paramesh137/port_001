import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Grid, Sparkles, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const INK = "#0a0618";
const RED = "#e8412f";
const BLACK = "#1c1033";
type Vec3 = [number, number, number];

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
}

/* ---------- shared textures (created once, reused everywhere) ---------- */
let gradientMap: THREE.DataTexture | null = null;
function getGradientMap() {
  if (!gradientMap) {
    // 3 bands = classic cel-shading look
    gradientMap = new THREE.DataTexture(new Uint8Array([40, 150, 255]), 3, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
}

let glowTex: THREE.CanvasTexture | null = null;
function getGlowTexture() {
  if (!glowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
  }
  return glowTex;
}

/* ---------- cel-shaded primitives with ink outlines ---------- */
function Glow({ color, scale, opacity = 0.6, position = [0, 0, 0] }: { color: string; scale: number; opacity?: number; position?: Vec3 }) {
  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial map={getGlowTexture()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </sprite>
  );
}

type ToonProps = { color: string; position?: Vec3; rotation?: Vec3; outline?: number; emissive?: string; emissiveIntensity?: number };

function ToonBox({ size, color, position = [0, 0, 0], rotation = [0, 0, 0], outline = 0.035, emissive = "#000000", emissiveIntensity = 0 }: ToonProps & { size: Vec3 }) {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshToonMaterial color={color} gradientMap={getGradientMap()} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {outline > 0 && (
        <mesh scale={[(w + 2 * outline) / w, (h + 2 * outline) / h, (d + 2 * outline) / d]}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={INK} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

function ToonCyl({ args, color, position = [0, 0, 0], rotation = [0, 0, 0], outline = 0.035, emissive = "#000000", emissiveIntensity = 0 }: ToonProps & { args: [number, number, number, number] }) {
  const [rt, rb, h] = args;
  const r = Math.max(rt, rb);
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={args} />
        <meshToonMaterial color={color} gradientMap={getGradientMap()} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {outline > 0 && (
        <mesh scale={[(r + outline) / r, (h + 2 * outline) / h, (r + outline) / r]}>
          <cylinderGeometry args={args} />
          <meshBasicMaterial color={INK} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

/* ---------- Torii gate (hero focal object) ---------- */
function Torii() {
  const g = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  useFrame((state) => {
    const p = scrollProgress();
    const t = state.clock.elapsedTime;
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, -0.4 + state.pointer.x * 0.3 + p * 1.6, 0.04);
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, -state.pointer.y * 0.1, 0.04);
    g.current.position.y = THREE.MathUtils.lerp(g.current.position.y, -0.1 + Math.sin(t * 0.7) * 0.12 - p * 1.6, 0.04);
  });
  const x = Math.min(2.6, viewport.width * 0.3);
  const s = viewport.width < 6 ? 0.65 : 1;
  return (
    <group ref={g} position={[x, -0.1, -0.6]} scale={s}>
      {/* pillars + bases */}
      <ToonCyl args={[0.13, 0.15, 3, 14]} color={RED} position={[-1.15, -0.05, 0]} />
      <ToonCyl args={[0.13, 0.15, 3, 14]} color={RED} position={[1.15, -0.05, 0]} />
      <ToonCyl args={[0.22, 0.22, 0.18, 14]} color={BLACK} position={[-1.15, -1.55, 0]} outline={0.02} />
      <ToonCyl args={[0.22, 0.22, 0.18, 14]} color={BLACK} position={[1.15, -1.55, 0]} outline={0.02} />
      {/* kasagi (top lintel) with black cap and upturned ends */}
      <ToonBox size={[3.7, 0.2, 0.3]} color={RED} position={[0, 1.6, 0]} />
      <ToonBox size={[3.8, 0.1, 0.34]} color={BLACK} position={[0, 1.75, 0]} outline={0.02} />
      <ToonBox size={[0.5, 0.2, 0.3]} color={RED} position={[-1.95, 1.64, 0]} rotation={[0, 0, -0.22]} />
      <ToonBox size={[0.5, 0.2, 0.3]} color={RED} position={[1.95, 1.64, 0]} rotation={[0, 0, 0.22]} />
      {/* shimaki + nuki beams */}
      <ToonBox size={[3.4, 0.16, 0.26]} color={RED} position={[0, 1.42, 0]} />
      <ToonBox size={[3.1, 0.16, 0.2]} color={RED} position={[0, 0.75, 0]} />
      {/* gakuzuka plaque */}
      <ToonBox size={[0.34, 0.5, 0.12]} color={BLACK} position={[0, 1.09, 0]} outline={0.02} />
      <ToonBox size={[0.22, 0.36, 0.02]} color="#ffd166" position={[0, 1.09, 0.07]} outline={0} emissive="#ffd166" emissiveIntensity={0.4} />
      <Glow color="#ff2d95" scale={7} opacity={0.35} position={[0, 0.4, -0.8]} />
    </group>
  );
}

/* ---------- giant anime moon ---------- */
function Moon() {
  const { viewport } = useThree();
  const mobile = viewport.width < 6;
  return (
    <group position={mobile ? [1.5, 3.5, -16] : [6.5, 2.5, -16]}>
      <mesh>
        <sphereGeometry args={[3.6, 48, 48]} />
        <meshToonMaterial color="#fff1c1" emissive="#ffb86b" emissiveIntensity={0.3} gradientMap={getGradientMap()} fog={false} />
      </mesh>
      <Glow color="#ff5fa2" scale={24} opacity={0.5} />
      <Glow color="#ffd166" scale={12} opacity={0.45} />
    </group>
  );
}

/* ---------- floating paper lanterns ---------- */
const lanternSpots: Vec3[] = [
  [-4.6, 1.6, -4],
  [-2.8, -2.4, -2.5],
  [4.9, -1.8, -4.5],
  [-6, -3.6, -2],
  [1.2, 3.6, -7],
  [6.5, 0.6, -8],
  [-1.5, 4.2, -5],
];

function Lanterns() {
  return (
    <>
      {lanternSpots.map((pos, i) => (
        <Float key={i} speed={0.8 + (i % 3) * 0.3} rotationIntensity={0.25} floatIntensity={1.8}>
          <group position={pos} scale={0.85}>
            <ToonCyl args={[0.24, 0.24, 0.46, 14]} color="#ffa24a" emissive="#ff5e3a" emissiveIntensity={0.8} />
            <ToonCyl args={[0.15, 0.15, 0.07, 14]} color={BLACK} position={[0, 0.265, 0]} outline={0} />
            <ToonCyl args={[0.15, 0.15, 0.07, 14]} color={BLACK} position={[0, -0.265, 0]} outline={0} />
            <ToonBox size={[0.02, 0.2, 0.02]} color="#ffd166" position={[0, 0.4, 0]} outline={0} />
            <Glow color="#ff8c42" scale={2.2} opacity={0.55} />
          </group>
        </Float>
      ))}
    </>
  );
}

/* ---------- falling sakura petals (instanced) ---------- */
function makePetalGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.55, 0.15, 0.6, 0.75, 0.15, 1);
  s.lineTo(0, 0.82);
  s.lineTo(-0.15, 1);
  s.bezierCurveTo(-0.6, 0.75, -0.55, 0.15, 0, 0);
  const g = new THREE.ShapeGeometry(s, 6);
  g.scale(0.16, 0.16, 0.16);
  g.center();
  return g;
}

function Petals({ count = 240 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const geom = useMemo(makePetalGeometry, []);
  const mat = useMemo(
    () => new THREE.MeshToonMaterial({ color: "#ffb7c5", emissive: "#ff5c9a", emissiveIntensity: 0.25, side: THREE.DoubleSide, gradientMap: getGradientMap() }),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const petals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: THREE.MathUtils.randFloatSpread(18),
        y: THREE.MathUtils.randFloat(-7, 8),
        z: THREE.MathUtils.randFloat(-9, 3),
        speed: THREE.MathUtils.randFloat(0.35, 1),
        sway: THREE.MathUtils.randFloat(0.4, 1.4),
        phase: Math.random() * Math.PI * 2,
        rx: THREE.MathUtils.randFloat(0.5, 2),
        ry: THREE.MathUtils.randFloat(0.5, 2),
        rz: THREE.MathUtils.randFloat(0.5, 2),
        scale: THREE.MathUtils.randFloat(0.6, 1.4),
      })),
    [count]
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.y -= p.speed * d;
      if (p.y < -8) {
        p.y = 8;
        p.x = THREE.MathUtils.randFloatSpread(18);
      }
      dummy.position.set(p.x + Math.sin(t * p.sway + p.phase) * 0.7, p.y, p.z);
      dummy.rotation.set(t * p.rx + p.phase, t * p.ry, t * p.rz);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geom, mat, count]} frustumCulled={false} />;
}

/* ---------- camera rig: parallax + scroll descent ---------- */
function Rig() {
  useFrame((state) => {
    const p = scrollProgress();
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, state.pointer.x * 0.5, 0.04);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, state.pointer.y * 0.3 - p * 2, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 7 - Math.sin(p * Math.PI) * 1.2, 0.04);
    cam.lookAt(0, -p * 2, 0);
  });
  return null;
}

export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={[INK]} />
        <fog attach="fog" args={[INK, 9, 26]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[-4, 6, 5]} intensity={1.6} color="#ffe4f1" />
        <pointLight position={[-6, -2, 2]} intensity={30} color="#22d3ee" />
        <pointLight position={[5, 2, 2]} intensity={30} color="#ff2d95" />
        <Moon />
        <Torii />
        <Lanterns />
        <Petals />
        <Grid
          position={[0, -3.4, 0]}
          args={[40, 40]}
          infiniteGrid
          cellSize={0.7}
          cellThickness={0.6}
          cellColor="#5b1d4e"
          sectionSize={3.5}
          sectionThickness={1.1}
          sectionColor="#ff2d95"
          fadeDistance={30}
          fadeStrength={1.6}
        />
        <Stars radius={80} depth={50} count={2000} factor={4} fade speed={0.5} />
        <Sparkles count={120} scale={[16, 12, 8]} size={3} speed={0.3} color="#ffd6e7" />
        <Rig />
      </Canvas>
    </div>
  );
}
