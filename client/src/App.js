import './App.css';
import SearchUser from './components/SearchUser'
import RecordLabels from './components/RecordLabels'
import Footer from './components/Footer'
import { useState } from 'react';



function App() {
  const [username, setUsername] = useState("")
  const [labelLimit, setLabelLimit] = useState("")

  return (
    <div className="App">
      <header className="App-header">
        <h1 className='App-logo'>Label.fm</h1>
        <p className="App-tagline">Find your favorite record labels based on your top 100 albums in last.fm.</p>
      </header>
      <div className='full-width'>
        <SearchUser search={setUsername} requestLabels={setLabelLimit}/>
        <RecordLabels username={username} labelLimit={labelLimit}/>
      </div>
      <div className='full-width'>
        <Footer/>
      </div>
    </div>
  );
}

export default App;
