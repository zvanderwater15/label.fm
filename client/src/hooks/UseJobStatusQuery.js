import { useQuery } from "@tanstack/react-query";
import axios from "axios";


// returns a status as "success", "pending", or "failure" for the given job
function useJobStatusQuery(href, enabled, retry) {
    const intervalMs = 5000;
    return useQuery(
      ["longRunningJob", href],
      () => axios(href).then(res => res.data),
      {
        enabled: enabled,
        retry: retry,
        refetchOnWindowFocus: false,
        refetchInterval: intervalMs,
      }
    );
  }
  
  export default useJobStatusQuery;