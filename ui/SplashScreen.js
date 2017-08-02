import React from 'react'
import ReactDOM from 'react-dom'
import styles from '../style/splash-screen.css'
import { RecordingIndicator } from './RecordingIndicator'
import Logo from '-!svg-react-loader!../svg/logo.svg'

export class SplashScreen extends React.Component {
    render() {
        return (
            <splash-screen>
                <Logo className="logo"></Logo>
                <video-toolbar>
                    <RecordingIndicator></RecordingIndicator>
                </video-toolbar>
            </splash-screen>
        )
    }
}
