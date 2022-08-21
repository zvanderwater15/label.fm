import {useState} from "react"
import "./SearchUser.css"

function SearchUser({search, requestLabels}) {
  const [username, setUsername] = useState("")
  const [labelLimit, setLabelLimit] = useState("10")

  const submit = (e) => {
    e.preventDefault()
    search(username)
    requestLabels(labelLimit)
  }
  
  return (
    <div className="SearchUser">
        <form onSubmit={submit}>
          <input spellCheck="false" placeholder="Last.fm username" value={username} onChange={(e) => setUsername(e.target.value)}/>
          <select name="top" id="top" value={labelLimit} onChange={(e) => setLabelLimit(e.target.value)}>
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="All">All</option>
          </select>
          <button placeholder="last.fm username" disabled={!username}>Go!</button>
        </form>
    </div>
  );
}

export default SearchUser;
