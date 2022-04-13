import './App.css';
import SearchUser from './components/SearchUser'
import ProducerList from './components/ProducerList'
import { useState } from 'react';

// title
// enter name


function App() {
  const [username, setUsername] = useState("")

  return (
    <div className="App">
      <header className="App-header">
        <h1>Production Moment</h1>
        <p>Analyze your top tracks to find your favorite producers.</p>
        <SearchUser search={setUsername}/>
        <ProducerList username={username}/>
      </header>
    </div>
  );
}

export default App;
