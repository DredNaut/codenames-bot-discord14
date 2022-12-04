class Word {
    word: string
    type: number
    guessedBy: Player

    constructor(word: string, type: number, guessedBy: Player) {
        this.word = word.toLowerCase()
        this.type = type
        this.guessedBy = guessedBy
    }

    setType(type: number) {
        this.type = type
    }
    
    toString() {
        return this.word
    }
}

export { Word }