import React from 'react';
import logo from './logo.svg';
import './App.css';
// import BarChart from './components/BarChart';
import Exploder from './components/Exploder';
import Tweening from './components/Tweening';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Exploder />
        <Tweening />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
