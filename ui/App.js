import React from 'react'
import ReactDOM from 'react-dom'
import { Toolbar } from './Toolbar'
import { SplashScreen } from './SplashScreen'


export class App extends React.Component {
    render() {
        return (
            <app>
                <Toolbar></Toolbar>
                <SplashScreen />
            </app>
        )
    }
}