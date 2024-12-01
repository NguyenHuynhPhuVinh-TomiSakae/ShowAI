import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParallaxHeaderProps {
    onTagClick: (tag: string) => void;
    allTags: string[];
}

interface NodeVelocity {
    x: number;
    y: number;
    z: number;
}

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ onTagClick, allTags }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const frameIdRef = useRef<number>(0);

    useEffect(() => {
        if (sceneRef.current) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        if (containerRef.current) {
            containerRef.current.appendChild(renderer.domElement);
        }
        rendererRef.current = renderer;

        // Tạo grid plane cho hiệu ứng cyberpunk
        const gridHelper = new THREE.GridHelper(20, 40, 0x00ff00, 0x00ff00);
        gridHelper.position.y = -2;
        gridHelper.material.opacity = 0.1;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Tạo particles với nhiều màu sắc hơn
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;
        const posArray = new Float32Array(particlesCount * 3);
        const colorsArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            // Vị trí
            posArray[i] = (Math.random() - 0.5) * 10;
            posArray[i + 1] = (Math.random() - 0.5) * 10;
            posArray[i + 2] = (Math.random() - 0.5) * 10;

            // Màu sắc
            colorsArray[i] = Math.random() * 0.5 + 0.5; // R
            colorsArray[i + 1] = Math.random() * 0.2; // G
            colorsArray[i + 2] = Math.random() * 0.8 + 0.2; // B
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 4;
        camera.position.y = 1;

        // Thêm neural network nodes và connections
        const nodesCount = 20;
        const nodesGeometry = new THREE.BufferGeometry();
        const nodesPositions = new Float32Array(nodesCount * 3);
        const nodesVelocities: NodeVelocity[] = [];
        const connections: THREE.Line[] = [];

        // Khởi tạo nodes
        for (let i = 0; i < nodesCount * 3; i += 3) {
            nodesPositions[i] = (Math.random() - 0.5) * 8;
            nodesPositions[i + 1] = (Math.random() - 0.5) * 8;
            nodesPositions[i + 2] = (Math.random() - 0.5) * 8;

            nodesVelocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        nodesGeometry.setAttribute('position', new THREE.BufferAttribute(nodesPositions, 3));

        // Material cho nodes
        const nodesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const nodesMesh = new THREE.Points(nodesGeometry, nodesMaterial);
        scene.add(nodesMesh);

        // Tạo connections
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2
        });

        // Thêm hiệu ứng hover
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Update animation
        let frameCount = 0;
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            frameCount++;

            // Update nodes positions
            const positions = nodesGeometry.attributes.position.array;
            for (let i = 0; i < nodesCount * 3; i += 3) {
                positions[i] += nodesVelocities[i / 3].x;
                positions[i + 1] += nodesVelocities[i / 3].y;
                positions[i + 2] += nodesVelocities[i / 3].z;

                if (Math.abs(positions[i]) > 4) nodesVelocities[i / 3].x *= -1;
                if (Math.abs(positions[i + 1]) > 4) nodesVelocities[i / 3].y *= -1;
                if (Math.abs(positions[i + 2]) > 4) nodesVelocities[i / 3].z *= -1;
            }
            nodesGeometry.attributes.position.needsUpdate = true;

            // Chỉ cập nhật connections mỗi 5 frames
            if (frameCount % 5 === 0) {
                connections.forEach(conn => scene.remove(conn));
                connections.length = 0;

                for (let i = 0; i < nodesCount; i++) {
                    for (let j = i + 1; j < nodesCount; j++) {
                        const distance = Math.sqrt(
                            Math.pow(positions[i * 3] - positions[j * 3], 2) +
                            Math.pow(positions[i * 3 + 1] - positions[j * 3 + 1], 2) +
                            Math.pow(positions[i * 3 + 2] - positions[j * 3 + 2], 2)
                        );

                        if (distance < 1.2) {
                            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                                new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]),
                                new THREE.Vector3(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])
                            ]);
                            const line = new THREE.Line(lineGeometry, lineMaterial);
                            scene.add(line);
                            connections.push(line);
                        }
                    }
                }
            }

            // Xoay theo chuột
            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.001;

            // Di chuyển nhẹ theo chuột
            particlesMesh.rotation.x += mouseY * 0.0005;
            particlesMesh.rotation.y += mouseX * 0.0005;

            // Grid animation
            gridHelper.position.z = (Date.now() * 0.0003) % 1;

            renderer.render(scene, camera);
        };

        animate();

        // Xử lý resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            // Hủy animation frame
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }

            // Dọn dẹp renderer
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                rendererRef.current.domElement.remove();
                rendererRef.current = null;
            }

            // Dọn dẹp scene và các đối tượng
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        object.geometry.dispose();
                        if (object.material instanceof THREE.Material) {
                            object.material.dispose();
                        }
                    }
                });
                sceneRef.current.clear();
                sceneRef.current = null;
            }

            // Xóa event listeners
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="relative">
            <div className="relative min-h-[400px]">
                <div ref={containerRef} className="absolute inset-0 z-[1] pointer-events-none" />

                <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent to-[#0F172A] pointer-events-none opacity-80" />

                <div className="relative z-[3] text-center py-24 px-4 pointer-events-auto transform translate-z-0">
                    <div className='py-4 sm:py-8'>
                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent 
                                bg-gradient-to-r from-blue-400 to-purple-500 mb-4
                                [text-shadow:0_0_30px_rgba(96,165,250,0.2)]"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            Khám Phá Thế Giới AI
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Khám phá các công cụ AI miễn phí sử dụng được ở việt nam.
                            Các AI hỗ trợ giúp công việc của bạn trở nên đơn giản hơn bao giờ hết.
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="relative z-[9999]"
                        >
                            <SearchBar onTagClick={onTagClick} allTags={allTags} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParallaxHeader;