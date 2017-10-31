const {remote} = require('electron')

const renderCrash = () => {
    document.body.innerHTML =
    `
        <div class="crash">
            Woops. Looks like we've experienced a crash. <br>
            We're going to restart HotSTube now to resume normal functionality.
        </div>
    `

    setTimeout(() => {
        remote.getCurrentWindow().reload()
    },4000)
}

module.exports = renderCrash