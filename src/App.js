import logo from './logo.svg';
import './App.css';
import SearchUser from './components/SearchUser'
// title
// enter name

function App() {

  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Production Moment</h1>
        <p>Analyze your top tracks to find your favorite producers.</p>
        <SearchUser/>

      </header>
    </div>
  );
}

export default App;
