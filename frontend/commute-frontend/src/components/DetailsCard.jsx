import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useState } from "react";
import { Divider } from "@mui/material";

const commutesPerYear = 260 * 2;
const litresPerKM = 10 / 100;
const gasLitreCost = 1.5;
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;

export default function DetailsCard({ pathInfo }) {
  if (!pathInfo || !pathInfo.distance || !pathInfo.duration) return null;

  const days = Math.floor(
    (commutesPerYear * pathInfo.duration) / secondsPerDay
  );
  const cost = Math.floor(
    (pathInfo.distance / 1000) * litreCostKM * commutesPerYear
  );

  const secondsToHMS = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes} min`;
    return `${hours} hr ${minutes} min`;
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Accordion
      sx={{
        position: "absolute",
        bottom: 0,
        zIndex: 1000,
        left: "50%",
        transform: "translate(-50%)",
        width: "40%",
      }}
      expanded={isOpen}
      onClick={() => setIsOpen(!isOpen)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="body2">
          See Your Commute Details Here -{" "}
        </Typography>
      </AccordionSummary>
      <Divider light />
      <AccordionDetails>
        <Typography variant="body1">
          This house is{" "}
          <span style={{ fontStyle: "italic", fontWeight: "bold" }}>
            {pathInfo.distance / 1000}
            {"  "}
          </span>
          km away from your office. That would take{" "}
          <span style={{ fontStyle: "italic", fontWeight: "bold" }}>
            {secondsToHMS(pathInfo.duration)} each day.
          </span>
        </Typography>

        <Typography variant="body1">
          That's {days} days in your car each year at a cost of $
          <span style={{ fontStyle: "italic", fontWeight: "bold" }}>
            {new Intl.NumberFormat().format(cost)}
          </span>
          .
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}