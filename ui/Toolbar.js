import React from 'react'
import ReactDOM from 'react-dom'
import styles from '../style/toolbar.css'
import X from '-!svg-react-loader!../svg/times.svg'

import { remote } from 'electron'

export class Toolbar extends React.Component {
    close() {
        let window = remote.getCurrentWindow()
        window.close()
    }
    render() {
        return (
            <toolbar>
                <drag-region></drag-region>
                <close-button onClick={this.close}><X></X></close-button>
            </toolbar>
        )
    }
}
