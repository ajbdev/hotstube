const React = require('react')
const path = require('path')
const moment = require('moment')
const HeroPortrait = require('./HeroPortrait')

class SidebarRow extends React.Component {
    constructor() {
        super()
    }

    css() {
        const css = []
        if (this.props.selectedGame && this.props.selectedGame.name == this.props.item.name) {
            css.push('selected')
        }

        if (this.props.item.patch) {
            css.push('patch')
        }

        return css.join(' ')
    }
    displayDate(time) {

        let date = moment(time)
        let now = moment()
        let dateDisplay = date.fromNow()

        if (now.diff(date,'days') > 2) {
            dateDisplay = date.format('l')
        }   

        return dateDisplay
    }

    render() {
        const item = this.props.item;

        if (item.patch) {
            return this.renderPatch(item)
        }

        return this.renderReplay(item)
    }

    renderPatch(patch) {
        let dateDisplay = this.displayDate(patch.time)
        return (
            <sidebar-row onClick={() => this.props.selectItem(patch)}  class={this.css()}>
                <div className="summary">{patch.summary}</div>
                <div className="date">{dateDisplay}</div>
            </sidebar-row>
        )
    }

    renderReplay(replay) {
        let name = path.basename(replay.name,'.StormReplay')
        let nameParts = name.match(/(.*)\(\d+\)/)

        if (nameParts && nameParts.length > 0) {
            name = nameParts[1]
        }

        let dateDisplay = this.displayDate(replay.time)

        let attrs = {}

        if (replay.game) {
            let player = replay.game.players.filter((p) => p.id == replay.heroId)[0]

            attrs.hero = player.hero;
        }

        return (
            <sidebar-row onClick={() => this.props.selectItem(replay)} class={this.css()}>
                <HeroPortrait {...attrs} />
                <a>{name}</a>
                <div className="date">{dateDisplay}</div>
            </sidebar-row>
        )
    }
}

module.exports.SidebarRow = SidebarRow