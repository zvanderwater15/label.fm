import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useLabelQuery from "../hooks/UseLabelQuery";
import useJobStatusQuery from "../hooks/UseJobStatusQuery";
import BarChart from "./BarChart";
import Loader from "./Loader";

const NOT_FOUND = 404;
const TOO_MANY_REQUESTS = 429;
const ACCEPTED = 202;
const READY = "success";
const PENDING = "pending";
const FAILURE = "failure";

function RecordLabels({ username, labelLimit }) {
  const queryClient = useQueryClient();
  const [href, setHref] = useState(null);
  const [jobStatus, setJobStatus] = useState(READY);

  const labelQuery = useLabelQuery(
    username,
    labelLimit,
    !!username && jobStatus === READY
  );
  const jobStatusQuery = useJobStatusQuery(
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
    if (
      labelQuery.data &&
      labelQuery.data.status === ACCEPTED &&
      jobStatusQuery.data &&
      jobStatusQuery.data.status === READY
    ) {
      setJobStatus(READY);
      queryClient.invalidateQueries(["labels"]);
    }
  }, [jobStatusQuery.data, labelQuery.data, setJobStatus, queryClient]);

  if (labelQuery.isFetching) {
    return (
      <div className="full-width">
        <Loader />
      </div>
    );
  } else if (!username) {
    return null;
  } else if (
    labelQuery.error &&
    labelQuery.error.response.status === NOT_FOUND
  ) {
    return <p>User not found</p>;
  } else if (
    labelQuery.error &&
    labelQuery.error.response.status === TOO_MANY_REQUESTS
  ) {
    return (
      <p>
        Sorry, Label.fm is currently experiencing too many requests. Try again
        later?
      </p>
    );
  } else if (jobStatus === FAILURE || labelQuery.error) {
    return <p>Unknown error</p>;
  } else if (
    labelQuery.data.status === ACCEPTED ||
    jobStatusQuery === PENDING
  ) {
    return (
      <div className="full-width">
        <Loader />
        <p>I haven't seen these albums before!</p>
        <p>This may take a few minutes...</p>
      </div>
    );
  } else {
    return (
      <div className="full-width">
        <div className="full-width">
          <BarChart
            chartData={labelQuery.data.labels.map((label) => ({
              y: label.name,
              x: label.albums.length,
              albums: label.albums,
            }))}
            user={username}
          />
        </div>
      </div>
    );
  }
}

export default RecordLabels;
