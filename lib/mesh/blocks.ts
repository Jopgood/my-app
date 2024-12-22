import { NBTBlock, NBTData } from "@/types";
import * as THREE from "three";
import Block from "./block";

const loader = new THREE.TextureLoader();

export enum BlockType {
  grass = "minecraft:grass",
  dirt = "minecraft:dirt",
  stone = "minecraft:stone",
  cobblestone = "minecraft:cobblestone",
}

// Textures
const cobblestone = loader.load("/textures/block/cobblestone.png");
const grass = loader.load("/textures/block/grass.png");
const grassTop = loader.load("/textures/block/grass_top_green.png");
const stone = loader.load("/textures/block/stone.png");
const dirt = loader.load("/textures/block/dirt.png");

// Pixelate textures
cobblestone.magFilter = THREE.NearestFilter;
grass.magFilter = THREE.NearestFilter;
grassTop.magFilter = THREE.NearestFilter;
stone.magFilter = THREE.NearestFilter;
dirt.magFilter = THREE.NearestFilter;

export default class Blocks {
  // Define the blocks object using the full enum values as keys
  materials: {
    [key in BlockType]:
      | THREE.MeshStandardMaterial
      | THREE.MeshStandardMaterial[];
  } = {
    [BlockType.grass]: [
      new THREE.MeshStandardMaterial({ map: grass }),
      new THREE.MeshStandardMaterial({ map: grass }),
      new THREE.MeshStandardMaterial({ map: grassTop }),
      new THREE.MeshStandardMaterial({ map: dirt }),
      new THREE.MeshStandardMaterial({ map: dirt }),
      new THREE.MeshStandardMaterial({ map: dirt }),
    ],
    [BlockType.dirt]: new THREE.MeshStandardMaterial({ map: dirt }),
    [BlockType.stone]: new THREE.MeshStandardMaterial({ map: stone }),
    [BlockType.cobblestone]: new THREE.MeshStandardMaterial({
      map: cobblestone,
    }),
  };

  blocks: Block[] = [];
  size: [number, number, number] = [0, 0, 0];

  constructor(nbtData: NBTData) {
    console.log("Received NBT data:", nbtData);
    this.size = nbtData.value.size || [0, 0, 0];
    const [width, , length] = this.size;
    const palette = nbtData.value.palette || [];

    // Process each block in the blocks array
    this.blocks = nbtData.value.blocks
      .filter((block: NBTBlock) => {
        const blockType = palette[block.state]?.Name;
        return blockType !== "minecraft:air";
      })
      .map((block: NBTBlock) => {
        // Process the data into a more usable format
        const processedBlock: NBTBlock = {
          ...block,
          nbt: {
            ...block.nbt,
            id: palette[block.state]?.Name,
          },
          pos: [
            block.pos[0] - width / 2, // Center the structure
            block.pos[1],
            block.pos[2] - length / 2,
          ],
        };

        return new Block(processedBlock, this);
      });
  }

  get(
    type: BlockType
  ): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {
    return this.materials[type];
  }

  getBlocks(): Block[] {
    return this.blocks;
  }
}
