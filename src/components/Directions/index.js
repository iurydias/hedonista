import React from "react";
import MapViewDirections from "react-native-maps-directions";

const Directions = ({ destination, origin, onReady }) => (
  <MapViewDirections 
  destination={ destination }
  origin={origin}
  onReady={onReady} 
  apikey="AIzaSyA-H7zGSuNzyCZDW5pPeegOgykilPgmMug"
  strokeWidth={3}
  strokeColor="#623CEA"
  />
);

export default Directions;
