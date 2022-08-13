import {useState} from "react"

function SearchUser({search}) {
  const [username, setUsername] = useState("")

  // get top tracks for user
  const submit = (e) => {
    e.preventDefault()
    search(username)
  }
  
  return (
    <div>
        <form onSubmit={submit}>
          <input spellCheck="false" value={username} onChange={(e) => setUsername(e.target.value)}/>
          <button placeholder="last.fm username" disabled={!username}>Submit</button>
        </form>
    </div>
  );
}

export default SearchUser;
