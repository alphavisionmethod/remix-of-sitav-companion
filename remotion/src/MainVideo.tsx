import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { Background } from "./components/Background";
import { Scene1Title } from "./scenes/Scene1Title";
import { Scene2Shell } from "./scenes/Scene2Shell";
import { Scene3Domains } from "./scenes/Scene3Domains";
import { Scene4Boardroom } from "./scenes/Scene4Boardroom";
import { Scene5Metrics } from "./scenes/Scene5Metrics";
import { Scene6Close } from "./scenes/Scene6Close";

// Scene durations (pre-transition overlap)
const S1 = 130;
const S2 = 150;
const S3 = 160;
const S4 = 150;
const S5 = 140;
const S6 = 120;
const T = 25; // transition duration

export const MainVideo: React.FC = () => {
  const transitionConfig = springTiming({
    config: { damping: 200 },
    durationInFrames: T,
  });

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S1}>
          <Scene1Title />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={transitionConfig}
        />
        <TransitionSeries.Sequence durationInFrames={S2}>
          <Scene2Shell />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionConfig}
        />
        <TransitionSeries.Sequence durationInFrames={S3}>
          <Scene3Domains />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={transitionConfig}
        />
        <TransitionSeries.Sequence durationInFrames={S4}>
          <Scene4Boardroom />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionConfig}
        />
        <TransitionSeries.Sequence durationInFrames={S5}>
          <Scene5Metrics />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionConfig}
        />
        <TransitionSeries.Sequence durationInFrames={S6}>
          <Scene6Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};