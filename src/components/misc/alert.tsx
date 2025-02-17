import { useState, useEffect, ReactNode } from "react";
import React from "react";
import { ReactComponentLike } from "prop-types";
import { triggerRelayout } from "../../utils/index";
import { Alert as MuiAlert, AlertColor, AlertTitle, Fade, AlertProps } from "@mui/material";

export function Alert({
  type = "info" as AlertColor,
  container = React.Fragment as ReactComponentLike,
  stateName = "",
  closable = true,
  title = "",
  children = undefined as ReactNode,
  sx = { mb: 2 } as AlertProps["sx"],
}) {
  const stateKey = `alertState_${stateName}`;
  const [closed, setClosed] = useState(() => stateName && !!localStorage.getItem(stateKey));
  useEffect(() => {
    if (stateName && closed) {
      localStorage.setItem(stateKey, "true");
    }
  }, [closed, stateName, stateKey]);
  if (closed && closable) {
    return null;
  }
  const Cont = container;
  return (
    <Cont>
      <Fade in={!closed} onEntering={() => triggerRelayout()} onExited={() => triggerRelayout()}>
        <MuiAlert severity={type} onClose={closable ? () => setClosed(true) : undefined} sx={sx}>
          {title && <AlertTitle>{title} </AlertTitle>}
          {children}
        </MuiAlert>
      </Fade>
    </Cont>
  );
}
