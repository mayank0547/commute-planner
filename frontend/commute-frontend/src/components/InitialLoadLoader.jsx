import React from "react";
import { InfinitySpin } from "react-loader-spinner";

const InitialLoadLoader = () => {
  return (
    <div className="loader">
      <InfinitySpin width="200" color="red" />
      <div>Loading Map...</div>
      <div>Please Wait...</div>
    </div>
  );
};

export default InitialLoadLoader;