import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadAvatar(scene) {
    const loader = new GLTFLoader();
    const avatarUrl = 'https://models.readyplayer.me/6911776237697c47c8fb2cee.glb';

    return new Promise((resolve, reject) => {
        loader.load(
            avatarUrl,
            (gltf) => {
                const avatar = gltf.scene;
                avatar.position.y = -0.9; // Adjust position to stand on the "ground"
                scene.add(avatar);
                console.log('Avatar loaded successfully');
                resolve(avatar);
            },
            undefined, // onProgress callback (optional)
            (error) => {
                console.error('An error happened while loading the avatar:', error);
                reject(error);
            }
        );
    });
}
