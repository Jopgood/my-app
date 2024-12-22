type Position = [number, number, number];
type BlockState = number;

interface BlockProperties {
  [key: string]: string;
}

interface BlockPalette {
  Name: string;
  Properties?: BlockProperties;
}

// Make the NBT type more specific
type NBTValue = string | number | boolean | NBTObject | NBTArray;
type NBTObject = { [key: string]: NBTValue; id: string };
type NBTArray = NBTValue[];

interface NBTBlock {
  pos: Position;
  state: BlockState;
  nbt: NBTObject;
}

interface Entity {
  id: string;
  pos: Position;
  [key: string]: NBTValue;
}

interface NBTDataValue {
  DataVersion: number;
  blocks: NBTBlock[];
  entities: Entity[];
  palette: BlockPalette[];
  size: Position;
}

interface NBTData {
  name: string;
  type: string;
  value: NBTDataValue;
}

export type {
  Position,
  BlockState,
  BlockProperties,
  BlockPalette,
  NBTValue,
  NBTObject,
  NBTArray,
  NBTBlock,
  Entity,
  NBTDataValue,
  NBTData,
};
