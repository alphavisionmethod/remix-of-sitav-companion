import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { TOTAL_FRAMES, FPS } from "./tokens";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);