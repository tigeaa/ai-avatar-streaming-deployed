import * as THREE from 'three';

export function setupScene() {
    // Renderer setup
    const container = document.getElementById('canvas-container');
    const canvas = document.getElementById('avatar-canvas');
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080); // Simple grey background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2;
    camera.position.y = 0.5;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Updatable objects list
    const updatables = [];

    // Handle window resize
    const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Call update on all updatable objects
        for (const object of updatables) {
            object.update();
        }

        renderer.render(scene, camera);
    };

    return { scene, camera, renderer, animate, updatables };
}
