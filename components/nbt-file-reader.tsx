"use client";

import React, { useState } from "react";
import pako from "pako";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// NBT Tag Types
const TAG_TYPES = {
  0: "TAG_End",
  1: "TAG_Byte",
  2: "TAG_Short",
  3: "TAG_Int",
  4: "TAG_Long",
  5: "TAG_Float",
  6: "TAG_Double",
  7: "TAG_Byte_Array",
  8: "TAG_String",
  9: "TAG_List",
  10: "TAG_Compound",
  11: "TAG_Int_Array",
  12: "TAG_Long_Array",
};

class NBTReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.offset = 0;
    this.view = new DataView(buffer);
    this.decoder = new TextDecoder("utf-8");
  }

  readByte() {
    const value = this.view.getInt8(this.offset);
    this.offset += 1;
    return value;
  }

  readShort() {
    const value = this.view.getInt16(this.offset, false); // big-endian
    this.offset += 2;
    return value;
  }

  readInt() {
    const value = this.view.getInt32(this.offset, false); // big-endian
    this.offset += 4;
    return value;
  }

  readLong() {
    const high = this.view.getInt32(this.offset, false);
    const low = this.view.getInt32(this.offset + 4, false);
    this.offset += 8;
    return (high << 32) + low;
  }

  readFloat() {
    const value = this.view.getFloat32(this.offset, false);
    this.offset += 4;
    return value;
  }

  readDouble() {
    const value = this.view.getFloat64(this.offset, false);
    this.offset += 8;
    return value;
  }

  readString() {
    const length = this.readShort();
    const value = this.decoder.decode(
      new Uint8Array(this.buffer.slice(this.offset, this.offset + length))
    );
    this.offset += length;
    return value;
  }

  readByteArray() {
    const length = this.readInt();
    const array = new Int8Array(
      this.buffer.slice(this.offset, this.offset + length)
    );
    this.offset += length;
    return array;
  }

  readIntArray() {
    const length = this.readInt();
    const array = new Int32Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = this.readInt();
    }
    return array;
  }

  readLongArray() {
    const length = this.readInt();
    const array = new BigInt64Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = BigInt(this.readLong());
    }
    return array;
  }

  readTag() {
    const type = this.readByte();
    if (type === 0) return null; // TAG_End

    if (!(type in TAG_TYPES)) {
      throw new Error(`Unknown tag type: ${type}`);
    }

    const name = this.readString();
    const value = this.readTagPayload(type);

    return {
      type: TAG_TYPES[type],
      name,
      value,
    };
  }

  readTagPayload(type) {
    switch (type) {
      case 1:
        return this.readByte();
      case 2:
        return this.readShort();
      case 3:
        return this.readInt();
      case 4:
        return this.readLong();
      case 5:
        return this.readFloat();
      case 6:
        return this.readDouble();
      case 7:
        return this.readByteArray();
      case 8:
        return this.readString();
      case 9:
        return this.readList();
      case 10:
        return this.readCompound();
      case 11:
        return this.readIntArray();
      case 12:
        return this.readLongArray();
      default:
        throw new Error(`Unknown tag type: ${type}`);
    }
  }

  readList() {
    const type = this.readByte();
    const length = this.readInt();
    const result = [];

    for (let i = 0; i < length; i++) {
      result.push(this.readTagPayload(type));
    }

    return result;
  }

  readCompound() {
    const result = {};

    while (true) {
      const tag = this.readTag();
      if (!tag) break; // TAG_End
      result[tag.name] = tag.value;
    }

    return result;
  }
}

async function parseNBTFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Log the first 20 bytes for debugging
    const firstBytes = new Uint8Array(arrayBuffer.slice(0, 20));
    console.log(
      "First 20 bytes:",
      Array.from(firstBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")
    );

    // Check if the file is GZIP compressed
    const isGzipped = firstBytes[0] === 0x1f && firstBytes[1] === 0x8b;
    console.log("Is GZIP compressed:", isGzipped);

    let buffer;
    if (isGzipped) {
      try {
        const compressed = new Uint8Array(arrayBuffer);
        const decompressed = pako.inflate(compressed);
        buffer = decompressed.buffer;
        console.log("Successfully decompressed GZIP data");
      } catch (error) {
        throw new Error(`Failed to decompress GZIP data: ${error.message}`);
      }
    } else {
      buffer = arrayBuffer;
    }

    const reader = new NBTReader(buffer);
    return reader.readTag();
  } catch (error) {
    console.error("Error parsing NBT file:", error);
    throw error;
  }
}

function NBTViewer({ data }) {
  if (!data) return null;

  const renderValue = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") {
      if (ArrayBuffer.isView(value)) {
        return `[${Array.from(value).join(", ")}]`;
      }
      if (Array.isArray(value)) {
        return (
          <div className="pl-4">
            {value.map((item, index) => (
              <div key={index}>{renderValue(item)}</div>
            ))}
          </div>
        );
      }
      return (
        <div className="pl-4">
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <strong>{key}:</strong> {renderValue(val)}
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  return (
    <div>
      <div>
        <strong>Type:</strong> {data.type}
      </div>
      <div>
        <strong>Name:</strong> {data.name}
      </div>
      <div>
        <strong>Value:</strong> {renderValue(data.value)}
      </div>
    </div>
  );
}

const NBTFileReader = ({ onDataParsed }) => {
  // Add the prop here
  const [nbtData, setNbtData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setError(null);
      const data = await parseNBTFile(file);
      setNbtData(data);
      // Add this line to pass the data up
      if (onDataParsed) {
        onDataParsed(data); // This will trigger your handleNBTData function
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>NBT File Reader</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          accept=".nbt"
          onChange={handleFileChange}
          className="mb-4"
        />

        {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      </CardContent>
    </Card>
  );
};

export default NBTFileReader;
