import React from 'react';
import logo from './logo.svg';
import './App.css';
// import BarChart from './components/BarChart';
import ExploderWithMorph from './components/ExploderWithMorph';
import Exploder from './components/Exploder';
import Tweening from './components/Tweening';
import Morphing from './components/Morphing';

// 4 components from Maps to Charts
import BelgiumMapChart4 from './components/BelgiumMapChart4';
import GermanyMapChart4 from './components/GermanyMapChart4';
import NetherlandsMapChart4 from './components/NetherlandsMapChart4';
import AustriaMapChart4 from './components/AustriaMapChart4';

// 8 components from Maps to Charts
import BelgiumMapChart8 from './components/BelgiumMapChart8';
import GermanyMapChart8 from './components/GermanyMapChart8';
import NetherlandsMapChart8 from './components/NetherlandsMapChart8';
import AustriaMapChart8 from './components/AustriaMapChart8';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <ExploderWithMorph />
        <Exploder />
        {/* <BelgiumMapChart4 />
        <GermanyMapChart4 />
        <NetherlandsMapChart4 />
        <AustriaMapChart4 />

        <BelgiumMapChart8 />
        <GermanyMapChart8 />
        <NetherlandsMapChart8 />
        <AustriaMapChart8 /> */}

        <Tweening />
        <Morphing />
        {/* <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      </header>
    </div>
  );
}

export default App;
