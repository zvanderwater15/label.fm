
import {
  useQuery
} from 'react-query'

const NOT_FOUND = 404
function ProducerList({username}) {
    // get musicbrainz producer list from tracks
  const { isLoading, error, data } = useQuery(['favoriteProducers', username], () =>
    fetch(`/api/${username}/producers`).then(res => {
      if (res.status === NOT_FOUND) {
        throw new Error("User not found")
      } else if (!res.ok) {
        throw new Error("Unknown error")
      } else {
        return res.json()
      }
    }
    // only run once a username has been entered
    ), {enabled: !!username, retry: false, refetchOnWindowFocus: false } 
  )
  
  if (error) {
    return <p>{error.message}</p>
  }
  else if(isLoading) {
    return <p>Loading</p>
  }
  else if(!username) {
    return null
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
  