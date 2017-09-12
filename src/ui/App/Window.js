const React = require('react')
const ErrorScreen = require('./ErrorScreen')
const Game = require('./Game')
const PatchNotes = require('./PatchNotes')
const ReleaseNotes = require('./ReleaseNotes')


class App extends React.Component {
    render() {
        const ContentComponents = {
            'ErrorScreen': ErrorScreen,
            'Game': Game,
            'PatchNotes': PatchNotes,
            'ReleaseNotes': ReleaseNotes
        }

        return (
            <app>
                <Sidebar />
            </app>
        )
    }
}