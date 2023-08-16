import HomeContext from "@/pages/home/home.context";
import React, { useContext, useEffect, useState } from "react";
import Tour, { Step } from "reactour";
import { tourConfig } from "./tourConfig";

const OnboardingGuide: React.FC = () => {
  const {
    state: { showOnboardingGuide, theme },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const closeTour = () => {
    homeDispatch({ field: "showOnboardingGuide", value: false });
  };

  const accentColor = theme.primaryColor;

  return (
    <Tour
      isOpen={showOnboardingGuide}
      onRequestClose={closeTour}
      steps={tourConfig}
      rounded={5}
      accentColor={accentColor}
      disableInteraction={true}
      lastStepNextButton={
        <span className={`text-[${theme.primaryColor}]`}>Finish</span>
      }
    />
  );
};

export default OnboardingGuide;
