import * as THREE from 'three';
import { GestureController } from '../controllers/GestureController.js'; // 追加

export class AvatarController {
        /**
         * @param {THREE.Object3D} avatar - Ready Player Meのアバターオブジェクト
         */
    constructor(avatar) {
                this.avatar = avatar;
                this.isTalking = false;
                this.morphTargetMeshes = [];
                this.gestureController = new GestureController(avatar); // 追加

            // Find all meshes with morph targets
            this.avatar.traverse(node => {
                            if (node.isMesh && node.morphTargetInfluences) {
                                                this.morphTargetMeshes.push(node);
                            }
            });
    }

    startTalking() {
                this.isTalking = true;
    }

    stopTalking() {
                this.isTalking = false;
                // Reset mouth to closed position
            this.setExpression('mouthOpen', 0);
    }

    setExpression(expressionName, value) {
                this.morphTargetMeshes.forEach(mesh => {
                                const index = mesh.morphTargetDictionary[expressionName];
                                if (index !== undefined) {
                                                    mesh.morphTargetInfluences[index] = value;
                                }
                });
    }

    /**
         * ジェスチャーを実行
         * @param {string} gestureName - 実行するジェスチャー名
         * @returns {Promise<void>}
         */
    async executeGesture(gestureName) {
                await this.gestureController.executeGesture(gestureName);
    }

    update() {
                if (this.isTalking) {
                                // Create a simple oscillating value for the mouth opening
                    const time = Date.now() * 0.015;
                                const mouthOpenValue = (Math.sin(time) + 1) / 2; // Value between 0 and 1
                    this.setExpression('mouthOpen', mouthOpenValue * 0.7); // Scale down to avoid extreme expressions
                }
    }
}
