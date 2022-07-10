
import {
  useQuery
} from 'react-query'


function ProducerList({username}) {
    // get musicbrainz producer list from tracks
  const { isLoading, error, data } = useQuery(['favoriteProducers', username], () =>
    fetch(`/api/${username}/producers`).then(res =>
      res.json()
    ), {enabled: !!username, refetchOnWindowFocus: false }
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
          data.labels.map(label =>          
             <Label name={label.name} albumCount={label.albums.length}/>
        )}
        </ol>
      </div>
    );
  }
  
  }
  
  function Label({name, albumCount}) {
    return (
      <li key={name}>
          <p>{name} ({albumCount})</p>
      </li>
    );
  }

  export default ProducerList;
  