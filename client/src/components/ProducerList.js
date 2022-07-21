import { useQuery } from "react-query";
import BarChart from './BarChart'

const NOT_FOUND = 404;
function ProducerList({ username }) {
  // get musicbrainz producer list from tracks
  const { isLoading, error, data } = useQuery(
    ["favoriteProducers", username],
    () =>
      fetch(`/api/${username}/producers`).then(
        (res) => {
          if (res.status === NOT_FOUND) {
            throw new Error("User not found");
          } else if (!res.ok) {
            throw new Error("Unknown error");
          } else {
            return res.json();
          }
        }
        // only run once a username has been entered
      ),
    { enabled: !!username, retry: false, refetchOnWindowFocus: false }
  );

  if (error) {
    return <p>{error.message}</p>;
  } else if (isLoading) {
    return <p>Loading... (can take up to two minutes)</p>;
  } else if (!username) {
    return null;
  } else {
    return (
      <BarChart chartData = {data.labels.map((label) => ({y: label.name,  x: label.albums.length}))} />
    );
  }
}

export default ProducerList;
