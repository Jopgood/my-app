import * as THREE from "three";

import { NBTBlock } from "@/types";
import Blocks, { BlockType } from "./blocks";

export default class Block {
  type: BlockType;
  position: [number, number, number];
  material: THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
  size: [number, number, number] = [1, 1, 1];
  state: number;
  mesh: THREE.Mesh;

  constructor(data: NBTBlock, blocks: Blocks) {
    this.type = data.nbt.id as BlockType;
    this.position = data.pos;
    this.material = blocks.get(this.type);
    this.size = [1, 1, 1];
    this.state = data.state;

    // Create the mesh
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // If material is an array, use it directly, otherwise create an array of 6 identical materials
    const materials = Array.isArray(this.material)
      ? this.material
      : Array(6).fill(this.material);

    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.position.set(...this.position);
  }

  // Method to get the mesh
  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  getMaterialProps() {
    if (Array.isArray(this.material)) {
      return this.material.map((mat) => ({
        map: mat.map,
        // other material properties you want to pass
      }));
    }
    return {
      map: (this.material as THREE.MeshStandardMaterial).map,
      // other material properties you want to pass
    };
  }
}
