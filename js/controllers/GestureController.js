import * as THREE from 'three';

/**
 * アバターのアニメーションを制御するクラス
 * 常に両手を振るアニメーションを再生します。
 */
export class GestureController {
    /**
     * @param {THREE.Object3D} avatar - Ready Player Meのアバターオブジェクト
     * @param {THREE.AnimationMixer} mixer - A shared AnimationMixer instance
     */
    constructor(avatar, mixer) {
        this.avatar = avatar;
        this.mixer = mixer; // Use the shared mixer
        this.bones = {};

        // Find and store all bones
        avatar.traverse(object => {
            if (object.isBone) {
                this.bones[object.name] = object;
            }
        });

        // Create and play the continuous waving animation
        this.createAndPlayWavingAnimation();
    }

    /**
     * 両手を常に振り続けるAnimationClipを生成し、再生します。
     */
    createAndPlayWavingAnimation() {
        const rightArm = this.bones['RightArm'];
        const leftArm = this.bones['LeftArm'];

        if (!rightArm || !leftArm) {
            console.error('RightArm or LeftArm bone not found. Cannot create waving animation.');
            return;
        }

        const waveDuration = 4; // seconds

        // --- Keyframe Tracks ---

        // 1. 腕を上げる (Z軸回転)
        const rightArmZTrack = new THREE.NumberKeyframeTrack(
            'RightArm.rotation[z]',
            [0, 1],       // time (seconds)
            [0, -2.0]     // value (radians)
        );
        const leftArmZTrack = new THREE.NumberKeyframeTrack(
            'LeftArm.rotation[z]',
            [0, 1],
            [0, 2.0]
        );

        // 2. 腕を振る (X軸回転)
        const rightArmXTrack = new THREE.NumberKeyframeTrack(
            'RightArm.rotation[x]',
            [1, 2, 3, 4], // time
            [0, -0.5, 0.5, 0] // value
        );
         const leftArmXTrack = new THREE.NumberKeyframeTrack(
            'LeftArm.rotation[x]',
            [1, 2, 3, 4],
            [0, -0.5, 0.5, 0]
        );

        const clip = new THREE.AnimationClip('waving-loop', -1, [
            rightArmZTrack,
            leftArmZTrack,
            rightArmXTrack,
            leftArmXTrack
        ]);

        const action = this.mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat);
        action.play();
    }

}
