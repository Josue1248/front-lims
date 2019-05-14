import React from 'react';

import ElectricityTest from './components/electricity-test.js';
import HeatTest from './components/heat-test.js';
import ChemistryTest from './components/chemistry-test.js';
import SpinnerTest from './components/spinner-test.js';
import GenerateReport from './containers/report.js';
import Home from './components/home.js';
import Tests from './containers/tests.js';
import './App.css';

function App() {
    const menu = ['Inicio', 'Prueba electricidad', 'Prueba calor', 'Prueba quimico', 'Prueba centrifugado', 'Reporte de muestra']
    const comp = [<Home/>, <ElectricityTest/>, <HeatTest/>, <ChemistryTest/>, <SpinnerTest/>, <GenerateReport/>]

    return(<div className='fullHeight'>
        <header className='container-fluid bg-color'></header>
        <Tests>
            {menu.map((t, keyT) => {
                return(<div label={t}>
                    {comp.map((c, keyC) => {
                        if(keyT === keyC) {
                            return(c)
                        } else {
                            return null
                        }
                    })}
                </div>)}
            )}
        </Tests>
    </div>)
}

export default App;
