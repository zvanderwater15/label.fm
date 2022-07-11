import './App.css';
import SearchUser from './components/SearchUser'
import ProducerList from './components/ProducerList'
import { useState } from 'react';



function App() {
  const [username, setUsername] = useState("")

  return (
    <div className="App">
      <header className="App-header">
        <h1>Label.fm</h1>
        <p>Find your favorite record labels based on your top 50 albums in last.fm.</p>
        <SearchUser search={setUsername}/>
        <ProducerList username={username}/>
      </header>
    </div>
  );
}

export default App;
