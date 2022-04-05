import {useState} from "react"

function SearchUser() {
  const [username, setUsername] = useState("")
  const getUser = () => alert(username)
  return (
    <div>
        <p>
          Enter your last.fm username.
        </p>
        <form onSubmit={getUser}>
          <input value={username} onChange={(e) => setUsername(e.target.value)}/>
          <button>Submit</button>
        </form>
    </div>
  );
}

export default SearchUser;
