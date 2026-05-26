import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { Activity, ShieldCheck, Heart, Trash2, Info } from 'lucide-react';

function Treatment3DModel({ activeTreatment, crownMaterial }: { activeTreatment: string; crownMaterial: 'zirconia' | 'ceramic' | 'gold' }) {
  const groupRef = useRef<THREE.Group>(null);
  const crownRef = useRef<THREE.Group>(null);
  const implantCrownRef = useRef<THREE.Group>(null);
  const toothRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Continuous base rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }

    // Animation for Crown placement
    if (activeTreatment === 'crown' && crownRef.current) {
      crownRef.current.position.y = 0.9 + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.35;
    }

    // Animation for Implant placement
    if (activeTreatment === 'implant' && implantCrownRef.current) {
      implantCrownRef.current.position.y = 1.0 + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.35;
    }

    // Animation for Extraction
    if (activeTreatment === 'extraction' && toothRef.current) {
      toothRef.current.position.y = 0.5 + Math.sin(state.clock.getElapsedTime() * 2) * 1.2;
      toothRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      toothRef.current.rotation.z = state.clock.getElapsedTime() * 0.2;
    }
  });

  // Base components
  const renderToothBase = () => (
    <>
      {/* Roots */}
      <mesh position={[-0.4, -0.6, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.3, 0.1, 1.8, 32]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0.4, -0.6, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.3, 0.1, 1.8, 32]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
      </mesh>
    </>
  );

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* standard standard tooth or RCT */}
        {activeTreatment === 'standard' && (
          <group>
            {/* Crown */}
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[1.6, 1.2, 1.4]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} envMapIntensity={2} />
            </mesh>
            {renderToothBase()}
          </group>
        )}

        {activeTreatment === 'rct' && (
          <group>
            {/* Transparent Crown */}
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[1.6, 1.2, 1.4]} />
              <meshStandardMaterial color="#e0f7fa" roughness={0.1} metalness={0.1} transparent opacity={0.4} envMapIntensity={2} />
            </mesh>
            {/* Transparent Roots */}
            <mesh position={[-0.4, -0.6, 0]} rotation={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.3, 0.1, 1.8, 32]} />
              <meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} transparent opacity={0.3} />
            </mesh>
            <mesh position={[0.4, -0.6, 0]} rotation={[0, 0, -0.15]}>
              <cylinderGeometry args={[0.3, 0.1, 1.8, 32]} />
              <meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} transparent opacity={0.3} />
            </mesh>

            {/* Glowing Root Canals (Gutta Percha neon pink/orange) */}
            <mesh position={[-0.2, -0.3, 0]} rotation={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.08, 0.04, 1.6, 16]} />
              <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={3} />
            </mesh>
            <mesh position={[0.2, -0.3, 0]} rotation={[0, 0, -0.15]}>
              <cylinderGeometry args={[0.08, 0.04, 1.6, 16]} />
              <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={3} />
            </mesh>
            {/* Glowing pulp chamber in crown */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={3} />
            </mesh>
          </group>
        )}

        {activeTreatment === 'crown' && (
          <group>
            {/* Shaved Prepped Tooth Stump */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.6, 0.7, 0.8, 32]} />
              <meshStandardMaterial color="#f5ebe0" roughness={0.4} metalness={0.1} />
            </mesh>
            {renderToothBase()}

            {/* Capping Crown Piece (floating/animating) */}
            <group ref={crownRef}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.7, 1.3, 1.5]} />
                {crownMaterial === 'gold' && (
                  <meshStandardMaterial color="#ffd700" roughness={0.1} metalness={0.9} envMapIntensity={3} />
                )}
                {crownMaterial === 'ceramic' && (
                  <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.1} />
                )}
                {crownMaterial === 'zirconia' && (
                  <meshStandardMaterial color="#f4f5f6" roughness={0.1} metalness={0.5} envMapIntensity={2.5} />
                )}
              </mesh>
            </group>
          </group>
        )}

        {activeTreatment === 'implant' && (
          <group>
            {/* Pink Gum Base Line */}
            <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
              <meshStandardMaterial color="#ffb5a7" roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Titanium Screw Base (Bone Anchor) */}
            <mesh position={[0, -0.6, 0]}>
              <cylinderGeometry args={[0.35, 0.25, 1.2, 32]} />
              <meshStandardMaterial color="#708090" roughness={0.25} metalness={0.8} />
            </mesh>
            {/* Thread details */}
            <mesh position={[0, -0.4, 0]}>
              <torusGeometry args={[0.33, 0.05, 12, 24]} />
              <meshStandardMaterial color="#708090" roughness={0.25} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.7, 0]}>
              <torusGeometry args={[0.3, 0.05, 12, 24]} />
              <meshStandardMaterial color="#708090" roughness={0.25} metalness={0.8} />
            </mesh>
            <mesh position={[0, -1.0, 0]}>
              <torusGeometry args={[0.26, 0.05, 12, 24]} />
              <meshStandardMaterial color="#708090" roughness={0.25} metalness={0.8} />
            </mesh>

            {/* Titanium Abutment connector */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.25, 0.35, 0.4, 32]} />
              <meshStandardMaterial color="#b0c4de" roughness={0.1} metalness={0.9} />
            </mesh>

            {/* Custom Floating Zirconia/Ceramic Implant Crown */}
            <group ref={implantCrownRef}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.6, 1.2, 1.4]} />
                <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.3} envMapIntensity={2} />
              </mesh>
            </group>
          </group>
        )}

        {activeTreatment === 'extraction' && (
          <group>
            {/* Red inflamed gum socket hole representing empty space */}
            <mesh position={[0, -1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />
              <meshStandardMaterial color="#e63946" roughness={0.5} metalness={0.1} transparent opacity={0.8} />
            </mesh>

            {/* Floating extracting tooth (going up and out) */}
            <group ref={toothRef}>
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[1.6, 1.2, 1.4]} />
                <meshStandardMaterial color="#fafafa" roughness={0.1} metalness={0.2} transparent opacity={0.85} />
              </mesh>
              {renderToothBase()}
            </group>
          </group>
        )}
      </Float>
    </group>
  );
}

export default function JawVisualizer() {
  const { t } = useTranslation();
  const [activeTreatment, setActiveTreatment] = useState<string>('standard');
  const [crownMaterial, setCrownMaterial] = useState<'zirconia' | 'ceramic' | 'gold'>('zirconia');

  const treatments = [
    {
      id: 'standard',
      name: t('svc_consultation'),
      desc: t('services_desc'),
      icon: Info,
      color: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/20'
    },
    {
      id: 'rct',
      name: t('svc_root_canal'),
      desc: t('svc_root_canal_desc'),
      icon: Activity,
      color: 'border-rose-500/20 text-rose-400 bg-rose-950/20'
    },
    {
      id: 'crown',
      name: t('svc_crowns'),
      desc: t('svc_crowns_desc'),
      icon: ShieldCheck,
      color: 'border-amber-500/20 text-amber-400 bg-amber-950/20'
    },
    {
      id: 'implant',
      name: t('svc_implants'),
      desc: t('svc_implants_desc'),
      icon: Heart,
      color: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20'
    },
    {
      id: 'extraction',
      name: t('svc_extraction'),
      desc: t('svc_extraction_desc'),
      icon: Trash2,
      color: 'border-red-500/20 text-red-400 bg-red-950/20'
    }
  ];

  const selectedTreatment = treatments.find(t => t.id === activeTreatment) || treatments[0];
  const IconComponent = selectedTreatment.icon;

  return (
    <div className="w-full bg-slate-950 rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10 p-6 md:p-8 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        {/* Left Side: 3D canvas (takes 3 columns) */}
        <div className="lg:col-span-3 h-[380px] md:h-[480px] bg-slate-900 rounded-[2.5rem] relative overflow-hidden border border-white/5 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          
          <Canvas camera={{ position: [0, 0.4, 5.5], fov: 42 }} className="cursor-grab active:cursor-grabbing">
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00e5ff" />
            <pointLight position={[0, 5, 5]} intensity={1} color="#ffffff" />
            
            <Treatment3DModel activeTreatment={activeTreatment} crownMaterial={crownMaterial} />
            
            <OrbitControls 
              enableZoom={false} 
              autoRotate={false} 
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
            <Environment preset="studio" />
          </Canvas>

          {/* Mobile Overlay Instructions */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10">
            <div className="inline-block bg-slate-950/80 backdrop-blur px-5 py-2 rounded-full border border-white/10">
              <p className="text-white font-medium tracking-wide text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                {t('interactive_3d')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Control panel & Details (takes 2 columns) */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                {t('interactive_3d')}
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-3 mb-2 tracking-tight">
                {t('cinematic_detail')}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('cinematic_desc')}
              </p>
            </div>

            {/* Treatment Selector Tabs */}
            <div className="space-y-2">
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">
                {t('select_service')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2">
                {treatments.map((tr) => {
                  const TrIcon = tr.icon;
                  return (
                    <button
                      key={tr.id}
                      onClick={() => setActiveTreatment(tr.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-bold text-left transition-all duration-300 ${
                        activeTreatment === tr.id
                          ? 'bg-gradient-to-r from-primary to-cyan-500 border-primary text-white shadow-lg shadow-primary/20 scale-102'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <TrIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tr.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Treatment Detail Card */}
            <div className={`p-5 rounded-3xl border transition-all duration-500 animate-in fade-in slide-in-from-right-4 ${selectedTreatment.color}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-2xl shrink-0">
                  <IconComponent className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base leading-snug">{selectedTreatment.name}</h4>
                  <p className="text-white/70 text-xs leading-relaxed">{selectedTreatment.desc}</p>
                </div>
              </div>

              {/* Crown Material Sub-controls */}
              {activeTreatment === 'crown' && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in zoom-in-95 duration-300">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                    {t('svc_crowns_ceramic') ? t('svc_crowns') + ' ' + t('material') : 'Crown Material'}
                  </p>
                  <div className="flex gap-2">
                    {(['zirconia', 'ceramic', 'gold'] as const).map((mat) => (
                      <button
                        key={mat}
                        onClick={() => setCrownMaterial(mat)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                          crownMaterial === mat
                            ? mat === 'gold'
                              ? 'bg-yellow-500 text-slate-950 shadow-lg'
                              : 'bg-white text-slate-950 shadow-lg'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
