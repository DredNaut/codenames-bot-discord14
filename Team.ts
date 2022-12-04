class Team {
    name: string
    options: number
    players: Array<Player>
    spymaster: Player

    constructor(name: string, options: number) {
        this.name = name
        this.options = options
        this.players = []
        this.spymaster = {} as Player
    }

    setSpymaster(user: Player) {
        this.spymaster = user
    }

    addPlayer(user: Player) {
        this.players.push(user)
    }

    toString() {
        return this.name
    }
}

export { Team }