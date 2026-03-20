import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DIM_COLORS_HEX, bgToFg } from '../data/colors';

// TODO: need to preload all images: https://stackoverflow.com/questions/42615556/how-to-preload-images-in-react-js

// Global array of 12 desired colors (for when a face is clicked)
const brandColors = DIM_COLORS_HEX;

// TODO: clean up lots of duplicated data here

const archetypes = [
    'The Multidisciplinary',
    'The Researcher',
    'The Generalist',
    'The Director',
    'The Orchestrator',
    'The Advocate',
    'The Experimentalist',
    'The Disruptor',
    'The Connector',
    'The Idealist',
    'The Improviser',
    'The Educator'
];

const designers = [
    'Irma Boom',
    'Ruben Pater',
    'Zak Kyes',
    'Tom Hingston',
    'Min Lew',
    'Dori Tunstall',
    'Martine Syms',
    'Samuel Ross',
    'Juliette Cezzar',
    'Eike Konig', // TODO: figure out the o-umlaut
    'Julian Glander',
    'Silas Munro'
];

const bios = [
    'Originally trained as a graphic designer, Boom has expanded book design into a multidisciplinary art form, merging publishing, architecture, and sculpture.',
    'A critical designer and educator who investigates the intersection of design, geopolitics, and social issues, using research-driven design as a tool for activism.',
    'Balances roles as a graphic designer, curator, and publisher, showing how designers can move fluidly between disciplines while maintaining a strong conceptual voice.',
    'A creative director known for blending typography, motion, and music in visual storytelling, leading major branding and music industry projects.',
    'A Base Design partner who leads multidisciplinary teams across strategy, branding, and communication design, demonstrating a structured and intentional approach to building scalable design systems.',
    'A design anthropologist and former OCAD University dean, Tunstall advocates for decolonizing design and fostering inclusivity in creative industries.',
    'A designer and artist who explores the intersection of design, film, and technology, constantly pushing the boundaries of narrative and media.',
    'Founder of A-COLD-WALL*, Ross blends industrial design, fashion, and graphic design to challenge conventions in both high fashion and streetwear.',
    'An educator, writer, and designer who bridges academia and professional practice, making design knowledge more accessible and actionable.',
    'Founder of HORT, a studio that embraces experimental, non-hierarchical collaboration while promoting artistic integrity and creative independence.',
    'A 3D artist and designer whose work playfully blends surrealism, humor, and interactive storytelling across multiple media.',
    'A designer and educator who champions diversity in design history and actively works to bring underrepresented narratives into the mainstream.'
];

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

// TODO: something is wrong here, Silas should be purple but he's not
function idxToBg(faceIndex) {
    return brandColors[faceIndex % brandColors.length];
}

function Dodecahedron({ faceState, onFaceClick }) {
    const meshRef = useRef();
    const edgesRef = useRef();
    
    const dodecScale = window.outerWidth > 860 ? 1.75 : 1.4;
    const geometry = new THREE.DodecahedronGeometry(dodecScale, 0);
    
    if (geometry.groups.length === 0) {
        geometry.clearGroups();
        for (let i = 0; i < 12; i++) {
            geometry.addGroup(i * 9, 9, i);
        }
    }
    
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 'white', linewidth: 50 });
    
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
            opacity: isClicked ? 0.5 : 0.0,
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
            <lineSegments ref={edgesRef} geometry={edgesGeometry} material={wireframeMaterial} />
        </group>
    );
}

export default function MainApp() {
    const defaultState = new Array(12).fill('white');
    const [faceState, setFaceState] = React.useState(defaultState);
    const [selectedFace, setSelectedFace] = React.useState(null);
    
    const handleFaceClick = (faceIndex) => {
        if (selectedFace === faceIndex) {
            setFaceState(prev => {
                const newState = [...prev];
                newState[faceIndex] = 'white';
                return newState;
            });
            setSelectedFace(null);
            document.getElementById('designer').style.display = 'none';
        } else {
            setFaceState(() => {
                const newState = defaultState;
                newState[faceIndex] = idxToBg(faceIndex);
                return newState;
            });
            setSelectedFace(faceIndex);

            // TODO: make this a react component so its less hacky
            document.getElementById('designer').style.display = 'flex';
            const bg = idxToBg(faceIndex);
            document.getElementById('designer').style.backgroundColor = bg;
            document.getElementById('designer').style.color = bgToFg(bg);
            let name = designers[faceIndex];
            if (name === 'Eike Konig') {
                name = 'Eike König';
            }
            document.getElementById('name').innerText = name;
            document.getElementById('archetype').innerText = archetypes[faceIndex];
            document.getElementById('bio').innerText = bios[faceIndex];
            document.getElementById('headshot').setAttribute('src', `/headshots/${designers[faceIndex]}.png`);
        }
    };

    // TODO: swap IDs with classes, yeah yeah yeah its a mess
    return (
        <div id="inside">
            <div id="designer">
                <img id="headshot" height="192" width="192" />
                <div className="designer-info">
                    <h2 id="name"></h2>
                    <p id="archetype"></p>
                    <p id="bio"></p>
                </div>
            </div>
            
            {/*<Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 75 }} style={{ width: '100vw', height: '100vh' }}>*/}
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 75 }} style={{ width: '100vw', height: '100vh', "marginTop": (window.outerWidth < 860 ? "-16rem" : "inherit") }}>
                {/* Set a gray background */}
                <color attach="background" args={['#969696']} />
                {/* <pointLight position={[10, 10, 10]} /> */}
                {/*TODO: add subtle random rotation, especially once this works into mobile menu icon*/}
                {/*TODO: can also play with color variations once ready, e.g. process book intro/outros */}
                <Dodecahedron faceState={faceState} onFaceClick={handleFaceClick} />
                {/*<OrbitControls enableZoom={false} />*/}
                <OrbitControls />
            </Canvas>
        </div>
    );
}