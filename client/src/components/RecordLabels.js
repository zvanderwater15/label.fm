import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BarChart from "./BarChart";

const NOT_FOUND = 404;
const ACCEPTED = 202;
const READY = "success";
const PENDING = "pending";
const FAILURE = "failure";

// if the job will take too long, returns 202 Accepted and an href to check on the job
function useLabels(username, labelLimit, enabled) {
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

// returns a status as "success", "pending", or "failure" for the given job
function useJobStatus(href, enabled, retry) {
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

function RecordLabels({ username, labelLimit }) {
  const queryClient = useQueryClient()
  const [href, setHref] = useState(null);
  const [jobStatus, setJobStatus] = useState(READY);

  const labelQuery = useLabels(username, labelLimit, !!username && jobStatus === READY);
  const jobStatusQuery = useJobStatus(
    href,
    !!href && labelQuery.isFetched && labelQuery.data.status === ACCEPTED,
    jobStatus === PENDING
  );

  useEffect(() => {
    if (labelQuery.isSuccess && labelQuery.data.status === ACCEPTED) {
      setHref(labelQuery.data.href);
    }
  }, [labelQuery, setHref]);

  useEffect(() => {
    if (labelQuery.data && labelQuery.data.status === ACCEPTED && jobStatusQuery.data && jobStatusQuery.data.status === READY ) {
      setJobStatus(READY);
      queryClient.invalidateQueries(['labels']);
    }
  }, [jobStatusQuery.data, labelQuery.data, setJobStatus, queryClient]);
  
  if (labelQuery.isFetching) {
    return <p>Loading...</p>;
  } else if (!username) {
    return null;
  } else if (labelQuery.error) {
    return <p>{labelQuery.error.message}</p>;
  } else if (jobStatus === FAILURE) {
    return <p>Unknown Error</p>;
  } else if (labelQuery.data.status === ACCEPTED || jobStatusQuery === PENDING) {
    return <p>This may take a few minutes...</p>;
  } else {
    return (
      <div className="full-width">
        <div className="full-width">
          <BarChart
            chartData={labelQuery.data.labels.map((label) => ({
              y: label.name,
              x: label.albums.length,
              albums: label.albums
            }))}
          />
        </div>
      </div>
    );
  }
}

export default RecordLabels;
