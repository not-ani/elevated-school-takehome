"use client";

import * as React from "react";

export function useStableQueryData<T>(liveData: T | undefined) {
  const [stableData, setStableData] = React.useState<T | undefined>(liveData);

  React.useEffect(() => {
    if (liveData !== undefined) setStableData(liveData);
  }, [liveData]);

  return stableData;
}
