import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Text } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from "gsap";
import './App.css';

function MugModel() {
  const { scene } = useGLTF("/pomug/applemug.glb");
  const mugRef = useRef();
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material.envMapIntensity = 0.5;
      }
    });

    if (mugRef.current) {
      mugRef.current.rotation.set(0, 90, 0);
    }
  }, [clonedScene]);

  useEffect(() => {
    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => {
      setIsDragging(false);
      gsap.to(mugRef.current.rotation, {
        x: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    const handleMouseMove = (event) => {
      if (!isDragging || !mugRef.current) return;

      const deltaX = event.movementX * 0.01;
      const deltaY = event.movementY * 0.01;

      mugRef.current.rotation.y += deltaX; 
      mugRef.current.rotation.x += deltaY; 

      setRotation({ x: mugRef.current.rotation.x, y: mugRef.current.rotation.y });
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  useFrame(() => {
    if (mugRef.current && !isDragging) {
      mugRef.current.rotation.y += 0.003; 
    }
  });

  return <primitive ref={mugRef} object={clonedScene} position={[0, 0, 0]} scale={0.9} />;
}

function DecomposedMug() {
  const { scene } = useGLTF("/pomug/applemug.glb");
  const mugRef = useRef();
  const decomposedScene = useMemo(() => scene.clone(), [scene]);
  const [disk, setDisk] = useState(null);
  const [coil, setCoil] = useState(null);
  const [heatingElement, setHeatingElement] = useState(null);

  useEffect(() => {
    decomposedScene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.envMapIntensity = 0.5;
        if (child.name.includes("plate")) setDisk(child);
        if (child.name.includes("magnet")) setCoil(child);
        if (child.name.includes("thingy")) setHeatingElement(child);
      }
    });
  }, [decomposedScene]);

  useEffect(() => {
    if (!disk || !coil || !heatingElement) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(Math.max(scrollY / window.innerHeight, 0), 1);

      gsap.to(disk.position, { y: progress * 3.3, overwrite: true, duration: 0.5 });
      gsap.to(coil.position, { y: progress * -1.7, ease: "elastic.out(1, 0.9)", duration: 0.8 });
      gsap.to(heatingElement.position, { y: progress * -1.9, ease: "elastic.out(1, 0.9)", duration: 1 });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [disk, coil, heatingElement]);

  useFrame(() => {
    if (mugRef.current) {
      mugRef.current.rotation.y += 0.002;
    }
  });

  return (
    <primitive
      ref={mugRef}
      object={decomposedScene}
      position={[0, -1, 0]}
      rotation={[0.4, Math.PI / 2, 0]}
      scale={1.4}
    />
  );
}

function ScrollingText() {
  const textRef = useRef();
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY / window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame(() => {
    if (textRef.current) {
      textRef.current.position.y = 2 - scrollY * 5;
    }
  });

  return (
    <Text ref={textRef} position={[0, 2, -3]} fontSize={1.5} color="black">
      {isMobile ? "pMug" : "POMEGRANATE MUG"}
    </Text>
  );
}

function ChargingMug() {
  const { scene } = useGLTF("/pomug/applemug.glb");
  const MugScene = useMemo(() => scene.clone(), [scene]);
  const mugRef = useRef();

  useEffect(() => {
    if (mugRef.current) {
      mugRef.current.rotation.y = 51.5 * (Math.PI / 180); 
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / (window.innerHeight * 1.5), 1);
      const targetXRotation = -progress * (Math.PI / 1.8); 
      gsap.to(mugRef.current.rotation, {
        x: targetXRotation,
        duration: 1.5,
        overwrite: "auto",
        ease: "power2.out"
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <primitive
      ref={mugRef}
      object={MugScene}
      position={[-0.01, -3, 0]}
      scale={2.7}
    />
  );
}


function HandleMug() {
  const { scene } = useGLTF("/pomug/applemug.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const mugRef = useRef();
  const handleMeshes = useRef([]);
  const initialPositions = useRef([]);

  useEffect(() => {
    handleMeshes.current = [];
    initialPositions.current = [];
    clonedScene.traverse((child) => {
      if (child.isMesh && child.name.includes("Plane")) {
        handleMeshes.current.push(child);
        initialPositions.current.push(child.position.clone());
      }
    });
    if (mugRef.current) {
      mugRef.current.rotation.y = -0.3;
      mugRef.current.rotation.z = -0.3;
    }
  }, [clonedScene]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(Math.max(scrollY / (window.innerHeight * 3.2), 0), 1);
      handleMeshes.current.forEach((mesh, index) => {
        gsap.to(mesh.position, {
          y: initialPositions.current[index].y + progress * 7, 
          ease: "power2.out",
          duration: 2.0,
          overwrite: "auto"
        });
        gsap.to(mesh.rotation, {
          z: progress * (Math.PI / 6), 
          ease: "power2.out",
          duration: 2.0,
          overwrite: "auto"
        });
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <primitive ref={mugRef} object={clonedScene} position={[2.4, 0, 0]} scale={1.4} />
  );
}


export default function App() {
  const sectionsRef = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => [...prev, entry.target]);
            observer.unobserve(entry.target); 
          }
        });
      },
      { threshold: 0.2 } 
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    
    <div className="container">
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={5} color="#ffffff" />
          <Environment background>
            <color attach="background" args={['#f5f5f5']} />
          </Environment>
          <ScrollingText />
          <MugModel />
        </Canvas>
      </div>

      <div
        ref={(el) => (sectionsRef.current[0] = el)}
        className={`headi fade-in ${visibleSections.includes(sectionsRef.current[0]) ? 'visible' : ''}`}
      >
        <h1>It has features.</h1>
      </div>

      {/* heating */}
      <div
        ref={(el) => (sectionsRef.current[1] = el)}
        className={`text-section fade-in ${visibleSections.includes(sectionsRef.current[1]) ? 'visible' : ''}`}
      >
        <div className="text-box">
          <h2>Heating Element</h2>
          <p>
          Experience our cutting-edge, state-of-the-art heating technology featuring built-in 
          "AI" that monitors your drink’s temperature and adjusts it on the fly. 
          Equpped With an advanced tracking system, your mug is practically impossible to lose or steal.
          </p>
        </div>
        <div className="canvas-small">
          <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
            <Environment background>
              <color attach="background" args={['#f5f5f5']} />
            </Environment>
            <DecomposedMug />
          </Canvas>
        </div>
      </div>

      {/* Charging */}

          <div
      ref={(el) => (sectionsRef.current[2] = el)}
      className={`text-section reverse fade-in ${visibleSections.includes(sectionsRef.current[2]) ? 'visible' : ''}`}>
      <div className="canvas-small">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
          <Environment background>
            <color attach="background" args={['#f5f5f5']} />
          </Environment>
          <ChargingMug />
        </Canvas>
      </div>
      <div className="text-box">
        <h2>USB-C Charging</h2>
        <p>
          Because we care about your convenience, our mug sports a geniously hidden USB‑C charging port 
          located neatly underneath, preserving its sleek aesthetic.<br></br> It comes equipped with a long lasting*
          battery to ensure that you can enjoy your drinks on the go!
        </p>
        <p>
          <small>
            (Minimum 2 hours of battery life.)
          </small>
        </p>
      </div>
    </div>

       {/* Handles */}
      <div
        ref={(el) => (sectionsRef.current[3] = el)}
        className={`text-section fade-in ${visibleSections.includes(sectionsRef.current[3]) ? 'visible' : ''}`}
      >
        <div className="text-box">
          <h2>Detachable Handles</h2>
          <p>
            The Pomegranate Mug comes with detachable handles* that you can easily remove or attach, 
            making it perfect for any drinking experience or for easy storage.
          </p>
          <p>
            <small>
              (Handle is sold separately)
            </small>
          </p>
        </div>
        <div className="canvas-small">
          <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
            <Environment background>
              <color attach="background" args={['#f5f5f5']} />
            </Environment>
            <HandleMug />
          </Canvas>
        </div>
      </div>
    </div>  
  );
}

useGLTF.preload("/pomug/applemug.glb");