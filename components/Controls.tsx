import React from "react";
import { RotateCw, ZoomIn, ZoomOut, Move } from "lucide-react";

export function Controls() {
  return (
    <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 rounded-lg p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2 text-white">
          <RotateCw size={20} />
          <span>Left Click + Drag to Rotate</span>
        </div>
        <div className="flex items-center space-x-2 text-white">
          <Move size={20} />
          <span>Right Click + Drag to Pan</span>
        </div>
        <div className="flex items-center space-x-2 text-white">
          <div className="flex space-x-1">
            <ZoomIn size={20} />
            <ZoomOut size={20} />
          </div>
          <span>Scroll to Zoom</span>
        </div>
      </div>
    </div>
  );
}
