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

    // 追加: ジェスチャーを実行するメソッド
    executeGesture(gestureName) {
        this.gestureController.executeGesture(gestureName);
    }

    // 追加: アニメーションを更新するメソッド
    update(delta) {
        this.gestureController.update(delta);
    }
}
