import { NBTReader } from "./nbt-reader";

interface Block {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  type?: string;
}

interface SchematicData {
  width: number;
  height: number;
  length: number;
  blocks: Block[];
}

// Basic color mapping for common block types
const blockColors: Record<string, string> = {
  "minecraft:dirt": "#8B4513",
  "minecraft:grass_block": "#228B22",
  "minecraft:stone": "#808080",
  "minecraft:oak_log": "#4A3C2C",
  "minecraft:oak_planks": "#BA8C63",
  // Add more block types as needed
  default: "#CCCCCC",
};

export async function convertNBTToThreeJS(file: File): Promise<SchematicData> {
  const arrayBuffer = await file.arrayBuffer();
  const reader = new NBTReader(arrayBuffer);
  const nbtData = reader.readTag();

  // Initialize our output format
  const schematic: SchematicData = {
    width: 0,
    height: 0,
    length: 0,
    blocks: [],
  };

  // Handle different NBT schematic formats
  if (nbtData.value.Schematic) {
    // Handle newer format (.schem)
    const { Schematic } = nbtData.value;
    schematic.width = Schematic.Width;
    schematic.height = Schematic.Height;
    schematic.length = Schematic.Length;

    // Get block data
    const palette = Schematic.Palette;
    const blockData = Schematic.BlockData;
    const blocks = [];

    // Convert block data to positions
    for (let y = 0; y < schematic.height; y++) {
      for (let z = 0; z < schematic.length; z++) {
        for (let x = 0; x < schematic.width; x++) {
          const index =
            y * schematic.width * schematic.length + z * schematic.width + x;
          const blockId = blockData[index];

          if (blockId !== 0) {
            // Skip air blocks
            const blockType = palette[blockId] || "default";
            blocks.push({
              position: [x, y, z],
              size: [1, 1, 1],
              color: blockColors[blockType] || blockColors.default,
              type: blockType,
            });
          }
        }
      }
    }

    schematic.blocks = blocks;
  } else if (nbtData.value.Blocks) {
    // Handle older format (.schematic)
    schematic.width = nbtData.value.Width;
    schematic.height = nbtData.value.Height;
    schematic.length = nbtData.value.Length;

    const blocks = [];
    const blockIds = nbtData.value.Blocks;
    const blockData = nbtData.value.Data;

    for (let y = 0; y < schematic.height; y++) {
      for (let z = 0; z < schematic.length; z++) {
        for (let x = 0; x < schematic.width; x++) {
          const index =
            y * schematic.width * schematic.length + z * schematic.width + x;
          const blockId = blockIds[index];

          if (blockId !== 0) {
            // Skip air blocks
            // Convert legacy block ID to modern format
            const blockType = getLegacyBlockType(blockId, blockData[index]);
            blocks.push({
              position: [x, y, z],
              size: [1, 1, 1],
              color: blockColors[blockType] || blockColors.default,
              type: blockType,
            });
          }
        }
      }
    }

    schematic.blocks = blocks;
  }

  return schematic;
}

// Helper function to convert legacy block IDs to modern format
function getLegacyBlockType(blockId: number, blockData: number): string {
  // This would need a complete mapping of legacy block IDs
  // Here's a basic example:
  const legacyBlocks: Record<number, string> = {
    1: "minecraft:stone",
    2: "minecraft:grass_block",
    3: "minecraft:dirt",
    17: "minecraft:oak_log",
    // Add more mappings as needed
  };

  return legacyBlocks[blockId] || "default";
}
