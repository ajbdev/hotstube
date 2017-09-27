const React = require('react')
const Streamable = require('../../lib/Streamable')
const Svg = require('../App/Svg')
const { shell } = require('electron')
const request = require('request')
const Config = require('../../lib/Config')

class SharingCredentials extends React.Component {
    constructor() {
        super()


        this.state = {
            email: '',
            password: '',
            rememberMe: false
        }
    }
    componentDidMount() {
        Config.load()

        this.setState({ 
            email: Config.options.streamableEmail || '',
            password: Config.options.streamablePassword ? atob(Config.options.streamablePassword) : '',
            rememberMe: this.props.autoRememberMe ? this.props.autoRememberMe : false 
        })
    }
    save() {
        Streamable.credentials.email = this.state.email
        Streamable.credentials.pass = this.state.password
        
        if (this.state.rememberMe) {
            Config.options.streamableEmail = this.state.email
            Config.options.streamablePassword = btoa(this.state.password)
            Config.save()
        }

        this.props.close()
    }
    createStreamableAccount() {
        shell.openExternal('https://streamable.com/signup')
    }
    render() {
        return (
            <sharing-credentials>
                <img src="./assets/png/streamable.png" className="streamable" />
                {this.props.credentialsError ? <span className="error">There was a problem with your email or password. Please try again.</span> : null}
                <label>E-mail</label>
                <div className="input-field">
                    <input type="email" value={this.state.email}  onChange={(evt) => { this.setState({ email: evt.target.value }) }} />
                </div>
                <label>Password</label>
                <div className="input-field">
                    <input type="password" value={this.state.password} onChange={(evt) => { this.setState({ password: evt.target.value }) }} />
                </div>
                {!this.props.autoRememberMe ? 
                <label>
                    <input type="checkbox" checked={this.state.rememberMe} onChange={() => this.setState({ rememberMe: !this.state.rememberMe })} /> Remember password
                </label> : null}
                <div className="buttons">
                    <button className="button" onClick={this.save.bind(this)}>Save</button>
                    <button className="button-link" onClick={this.props.cancel}>Cancel</button>
                    <a className="float-right" onClick={this.createStreamableAccount}>Create a Streamable Account</a>
                </div>
            </sharing-credentials>
        )
    }
}

module.exports = SharingCredentials