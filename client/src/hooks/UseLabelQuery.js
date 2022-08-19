import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// if the job will take too long, returns 202 Accepted and an href to check on the job
function useLabelQuery(username, labelLimit, enabled) {
    return useQuery(
      ["labels", username, labelLimit],
      async () => {
        const res = await axios.get(`/api/labels/${username}?limit=${labelLimit}`);
        return {status: res.status, labels: res.data.labels, href: res.data.href}
      },
      {
        enabled: enabled,
        retry: false,
        refetchOnWindowFocus: false,
      }
    );
  }
  
  export default useLabelQuery;