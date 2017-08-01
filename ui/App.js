import React from 'react'
import ReactDOM from 'react-dom'
import { Toolbar } from './Toolbar'
import { RecordingIndicator } from './RecordingIndicator'


export class App extends React.Component {
    render() {
        return (
            <app>
                <Toolbar></Toolbar>
                <RecordingIndicator></RecordingIndicator>
            </app>
        )
    }
}