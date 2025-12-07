import * as THREE from 'three';
import { GestureController } from './GestureController.js';

export class AvatarController {
    constructor(avatar) {
        this.avatar = avatar;
        this.isTalking = false;
        this.morphTargetMeshes = [];

        // --- Animation Setup ---
        // GestureController and Lip-sync will be managed by a single AnimationMixer
        this.mixer = new THREE.AnimationMixer(this.avatar);
        this.gestureController = new GestureController(this.avatar, this.mixer);
        this.lipSyncAction = null;

        this.avatar.traverse(node => {
            if (node.isMesh && node.morphTargetInfluences) {
                this.morphTargetMeshes.push(node);
            }
        });

        // Setup the lip-sync animation action
        this.setupLipSyncAction();
    }

    /**
     * Creates and initializes a dedicated AnimationAction for lip-syncing.
     */
    setupLipSyncAction() {
        const mesh = this.morphTargetMeshes[0];
        if (!mesh) return;

        const morphTargetIndex = mesh.morphTargetDictionary['mouthOpen'];
        if (morphTargetIndex === undefined) return;

        // Create a single-track AnimationClip for the mouthOpen morph target
        const trackName = `${mesh.name}.morphTargetInfluences[${morphTargetIndex}]`;
        const times = [0, 0.5, 1]; // Keyframe times
        const values = [0, 1, 0];   // Initial values (will be updated dynamically)
        const track = new THREE.NumberKeyframeTrack(trackName, times, values);
        const clip = new THREE.AnimationClip('lip-sync', -1, [track]);

        this.lipSyncAction = this.mixer.clipAction(clip);
        this.lipSyncAction.setLoop(THREE.LoopRepeat);
    }


    startTalking() {
        this.isTalking = true;
        if (this.lipSyncAction) {
            this.lipSyncAction.play();
        }
    }

    stopTalking() {
        this.isTalking = false;
        if (this.lipSyncAction) {
            // Stop the animation and reset the morph target to 0
            this.lipSyncAction.stop();
            this.setExpression('mouthOpen', 0);
        }
    }

    /**
     * Manually sets the value of a morph target. Used to reset state.
     */
    setExpression(expressionName, value) {
        this.morphTargetMeshes.forEach(mesh => {
            const index = mesh.morphTargetDictionary[expressionName];
            if (index !== undefined) {
                mesh.morphTargetInfluences[index] = value;
            }
        });
    }

    update(deltaTime) {
        // Update the central animation mixer, which controls all animations
        this.mixer.update(deltaTime);
    }
}
