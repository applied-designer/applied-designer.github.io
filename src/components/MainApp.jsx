import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { bgToFg, DIM_COLORS_HEX } from '../data/colors';

const designers = {
    'Irma Boom': {
        color: DIM_COLORS_HEX[0],
        archetype: 'The Multidisciplinary',
        bio: 'Originally trained as a graphic designer, Boom has expanded book design into a multidisciplinary art form, merging publishing, architecture, and sculpture.',
    },
    'Ruben Pater': {
        color: DIM_COLORS_HEX[1],
        archetype: 'The Researcher',
        bio: 'A critical designer and educator who investigates the intersection of design, geopolitics, and social issues, using research-driven design as a tool for activism.',
    },
    'Zak Kyes': {
        color: DIM_COLORS_HEX[2],
        archetype: 'The Generalist',
        bio: 'Balances roles as a graphic designer, curator, and publisher, showing how designers can move fluidly between disciplines while maintaining a strong conceptual voice.',
    },
    'Tom Hingston': {
        color: DIM_COLORS_HEX[3],
        archetype: 'The Director',
        bio: 'A creative director known for blending typography, motion, and music in visual storytelling, leading major branding and music industry projects.',
    },
    'Min Lew': {
        color: DIM_COLORS_HEX[4],
        archetype: 'The Orchestrator',
        bio: 'A Base Design partner who leads multidisciplinary teams across strategy, branding, and communication design, demonstrating a structured and intentional approach to building scalable design systems.',
    },
    'Dori Tunstall': {
        color: DIM_COLORS_HEX[0],
        archetype: 'The Advocate',
        bio: 'A design anthropologist and former OCAD University dean, Tunstall advocates for decolonizing design and fostering inclusivity in creative industries.',
    },
    'Martine Syms': {
        color: DIM_COLORS_HEX[1],
        archetype: 'The Experimentalist',
        bio: 'A designer and artist who explores the intersection of design, film, and technology, constantly pushing the boundaries of narrative and media.',
    },
    'Samuel Ross': {
        color: DIM_COLORS_HEX[2],
        archetype: 'The Disruptor',
        bio: 'Founder of A-COLD-WALL*, Ross blends industrial design, fashion, and graphic design to challenge conventions in both high fashion and streetwear.',
    },
    'Juliette Cezzar': {
        color: DIM_COLORS_HEX[1],
        archetype: 'The Connector',
        bio: 'An educator, writer, and designer who bridges academia and professional practice, making design knowledge more accessible and actionable.',
    },
    'Eike Konig': {
        color: DIM_COLORS_HEX[3],
        archetype: 'The Idealist',
        bio: 'Founder of HORT, a studio that embraces experimental, non-hierarchical collaboration while promoting artistic integrity and creative independence.',
    },
    'Julian Glander': {
        color: DIM_COLORS_HEX[0],
        archetype: 'The Improviser',
        bio: 'A 3D artist and designer whose work playfully blends surrealism, humor, and interactive storytelling across multiple media.',
    },
    'Silas Munro': {
        color: DIM_COLORS_HEX[4],
        archetype: 'The Educator',
        bio: 'A designer and educator who champions diversity in design history and actively works to bring underrepresented narratives into the mainstream.',
    },
};

const designerNames = Object.keys(designers);

// Hard-coded adjacency list for a dodecahedron's 12 faces.
// Each face (index 0 to 11) is adjacent to the following 5 faces.
const _adjacency = [
    [1, 4, 5, 8, 10], // Face 0 adjacent to faces 1,4,5,8,10
    [0, 2, 6, 8, 11], // Face 1 adjacent to faces 0,2,6,8,11
    [1, 3, 7, 9, 11], // Face 2
    [2, 4, 7, 9, 10], // Face 3
    [0, 3, 5, 7, 10], // Face 4
    [0, 4, 6, 8, 10], // Face 5
    [1, 5, 7, 8, 11], // Face 6
    [2, 3, 4, 6, 9], // Face 7
    [0, 1, 5, 6, 11], // Face 8
    [2, 3, 7, 10, 11], // Face 9
    [0, 3, 4, 5, 9], // Face 10
    [1, 2, 6, 8, 9] // Face 11
];

function Dodecahedron({ faceState, onFaceClick }) {
    const meshRef = useRef();
    const edgesRef = useRef();
    const { size } = useThree();
    
    const dodecScale = window.outerWidth > 860 ? 1.75 : 1.4;
    const geometry = new THREE.DodecahedronGeometry(dodecScale, 0);
    
    if (geometry.groups.length === 0) {
        geometry.clearGroups();
        for (let i = 0; i < 12; i++) {
            geometry.addGroup(i * 9, 9, i);
        }
    }
    
    const edgeGeo = new THREE.EdgesGeometry(geometry);
    const lineGeo = new LineSegmentsGeometry();
    lineGeo.setPositions(edgeGeo.attributes.position.array);
    const lineMat = new LineMaterial({
        color: 'white',
        linewidth: 2,
        resolution: [size.width, size.height],
        worldUnits: false,
    });
    
    const lineSegs = new LineSegments2(lineGeo, lineMat);
    
    // NOTE: there are half the speed from Processing
    const yRotFactor = 0.5;
    const xRotFactor = yRotFactor / 2;
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * xRotFactor;
            meshRef.current.rotation.y = state.clock.elapsedTime * yRotFactor;
        }
        if (edgesRef.current) {
            edgesRef.current.rotation.x = state.clock.elapsedTime * xRotFactor;
            edgesRef.current.rotation.y = state.clock.elapsedTime * yRotFactor;
        }
    });
    
    const handleClick = (event) => {
        const intersect = event.intersections[0];
        if (!intersect) return;
        const triangleIndex = intersect.faceIndex;
        const faceIndex = Math.floor(triangleIndex / 3);
        
        if (onFaceClick) {
            onFaceClick(faceIndex);
        }
    };
    
    const materials = faceState.map((color) => {
        const isClicked = color !== 'white';
        return new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            opacity: isClicked ? 1.0 : 0.0,
            transparent: !isClicked
        });
    });
    
    return (
        <group>
            <mesh
                ref={meshRef}
                geometry={geometry}
                material={materials}
                onClick={handleClick}
                raycast={THREE.Mesh.prototype.raycast}
            />
            <primitive object={lineSegs} ref={edgesRef} />
        </group>
    );
}

function DesignerPanel({ designer }) {
    const lastDesigner = useRef(null);
    if (designer) lastDesigner.current = designer;
    const d = designer ?? lastDesigner.current;

    return (
        <div className={`designer${designer ? ' designer--visible' : ''}`} style={{ backgroundColor: d?.bg, color: d?.fg }}>
            {d && (
                <>
                    <img className="headshot" height="192" width="192" src={d.headshotSrc} />
                    <div className="designer-info">
                        <h2 className="name">{d.name}</h2>
                        <p className="archetype">{d.archetype}</p>
                        <p className="bio">{d.bio}</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default function MainApp() {
    const defaultState = new Array(12).fill('white');
    const [faceState, setFaceState] = React.useState(defaultState);

    useEffect(() => {
        designerNames.forEach(name => {
            const img = new Image();
            img.src = `/headshots/${name}.png`;
        });
    }, []);
    const [selectedFace, setSelectedFace] = React.useState(null);
    const [selectedDesigner, setSelectedDesigner] = React.useState(null);
    
    const handleFaceClick = (faceIndex) => {
        if (selectedFace === faceIndex) {
            setFaceState(prev => {
                const newState = [...prev];
                newState[faceIndex] = 'white';
                return newState;
            });
            setSelectedFace(null);
            setSelectedDesigner(null);
        } else {
            setFaceState(() => {
                const newState = defaultState;
                newState[faceIndex] = designers[designerNames[faceIndex]].color;
                return newState;
            });
            setSelectedFace(faceIndex);

            let name = designerNames[faceIndex];
            if (name === 'Eike Konig') {
                name = 'Eike König';
            }
            const d = designers[designerNames[faceIndex]];
            setSelectedDesigner({
                name,
                archetype: d.archetype,
                bio: d.bio,
                bg: d.color,
                fg: bgToFg(d.color),
                headshotSrc: `/headshots/${designerNames[faceIndex]}.png`,
            });
        }
    };

    return (
        <div className="inside">
            <DesignerPanel designer={selectedDesigner} />
            <div className="canvas-wrap">
                <Canvas dpr={[1, 2]} flat camera={{ position: [0, 0, 5], fov: 75 }}>
                    <color attach="background" args={['#969696']} />
                    {/*TODO: add subtle random rotation, especially once this works into mobile menu icon*/}
                    {/*TODO: can also play with color variations once ready, e.g. process book intro/outros */}
                    <Dodecahedron faceState={faceState} onFaceClick={handleFaceClick} />
                    <OrbitControls />
                </Canvas>
            </div>
        </div>
    );
}