"use client";

import dynamic from "next/dynamic";

const CarScene = dynamic(() => import("@/components/three/car-scene"), { ssr: false });

export function TurntableCapture() {
  return (
    <div className="fixed inset-0 z-[200] bg-bg" data-testid="turntable-capture">
      <CarScene capture />
    </div>
  );
}
