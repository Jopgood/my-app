"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import NBTFileReader from "./nbt-file-reader";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { NBTData } from "@/types";
import Blocks from "@/lib/mesh/blocks";
import Block from "@/lib/mesh/block";

function MinecraftScene({ blocks }: { blocks: Block[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {blocks.map((block, index) => {
        // Add debug logging
        console.log("Block material:", block.material);

        return (
          <mesh key={index} position={new THREE.Vector3(...block.position)}>
            <boxGeometry args={block.size} />
            {Array.isArray(block.material) ? (
              block.material.map((mat, idx) => {
                console.log("Material array item:", mat);
                return (
                  <meshStandardMaterial
                    key={idx}
                    attach={`material-${idx}`}
                    map={
                      mat instanceof THREE.MeshStandardMaterial ? mat.map : mat
                    }
                  />
                );
              })
            ) : (
              <meshStandardMaterial
                color={
                  block.material instanceof THREE.MeshStandardMaterial
                    ? undefined
                    : block.material
                }
                map={
                  block.material instanceof THREE.MeshStandardMaterial
                    ? block.material.map
                    : undefined
                }
              />
            )}
          </mesh>
        );
      })}
    </group>
  );
}

export function MinecraftViewer() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleNBTData = (nbtData: NBTData) => {
    console.log("Received NBT data:", nbtData);

    const blocks = new Blocks(nbtData);

    setBlocks(blocks.getBlocks());
  };

  return (
    <div className="flex flex-col w-full">
      <NBTFileReader onDataParsed={handleNBTData} />
      <div className="w-full h-[600px]">
        <Canvas>
          <PerspectiveCamera makeDefault position={[10, 10, 10]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <MinecraftScene blocks={blocks} />
        </Canvas>
      </div>
    </div>
  );
}
