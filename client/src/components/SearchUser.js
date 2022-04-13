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
        <p>
          Enter your last.fm username.
        </p>
        <form onSubmit={submit}>
          <input value={username} onChange={(e) => setUsername(e.target.value)}/>
          <button>Submit</button>
        </form>
    </div>
  );
}

export default SearchUser;
