const React = require('react')
const Svg = require('./Svg')
const ConfigOptions = require('../../lib/Config')

class SplashScreen extends React.Component {
    handleCheckbox() {
        ConfigOptions.options.welcomeScreen = !ConfigOptions.options.welcomeScreen

        ConfigOptions.save()
        this.forceUpdate()
    }
    render() {
        return (
            <splash-screen>
                <Svg src="logo.svg" className="logo" />

                <div className="instructions">
                    <b>Welcome to HotSTube</b> <br /><br />
                    To get started:<br />
                    <ol>
                        <li>Launch Heroes of the Storm in full screen windowed or windowed mode.</li>
                        <li>Start a game to begin recording. Do not close or restart HotSTube.</li>
                        <li>After the game, stats and gameplay highlights will be available.</li>
                    </ol>
                    HotSTube must be started before a game is started in order to record highlights.
                </div>

                <br /><br />
                <label>
                    <input type="checkbox" onChange={this.handleCheckbox.bind(this)} checked={!ConfigOptions.options.welcomeScreen} /> Don't show this screen when HotSTube starts
                </label>
            </splash-screen>
        )
    }
}

module.exports = SplashScreen