import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useOnlineStatus = () => {
  const queryClient = useQueryClient();

  const changeStatus = useCallback(() => {
    const onlineStatus = navigator.onLine;

    if (onlineStatus) {
      queryClient.invalidateQueries("ipLocation");
      toast.success("You Are Online");
    } else {
      toast.error("You Are Offline");
    }
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener("online", changeStatus);
    window.addEventListener("offline", changeStatus);

    return () => {
      window.removeEventListener("online", changeStatus);
      window.removeEventListener("offline", changeStatus);
    };
  }, [changeStatus]);
};

export default useOnlineStatus;