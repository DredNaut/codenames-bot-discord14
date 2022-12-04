class Player {
    user: string
    team: number

    constructor(user: string, team: number) {
        this.user = user
        this.team = team
    }

    toString() {
        return this.user
    }
}