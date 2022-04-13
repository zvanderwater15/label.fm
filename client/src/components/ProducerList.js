
import {
  useQuery
} from 'react-query'


function ProducerList({username}) {
    // get musicbrainz producer list from tracks
  const { isLoading, error, data } = useQuery(['userTracks', username], () =>
    fetch(`/api/${username}/tracks`).then(res =>
      res.json()
    ), {enabled: !!username}
  )
  
  if (error) {
    return <p>Error</p>
  }
  else if(isLoading) {
    return <p>Loading</p>
  }
  else if(!username) {
    return <p></p>
  }
  else {
    return (
      <div>
        <ol>
        {
          data.tracks.map(track =>          
             <Producer name={track.name}/>
        )}
        </ol>
      </div>
    );
  }
  
  }
  
  function Producer({name}) {
    return (
      <li key={name}>
          <p>{name}</p>
      </li>
    );
  }

  export default ProducerList;
  