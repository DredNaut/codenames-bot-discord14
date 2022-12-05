import DiscordJS, { AttachmentBuilder, Client, ContextMenuCommandAssertions, GatewayIntentBits } from 'discord.js'
const Canvas = require('@napi-rs/canvas')

enum colorEnum {
    red = 0,
    blue,
    white,
    black
}

function colorConverter(color: number) : string {
    var hexColor: string = "";

    switch(color) {
        case colorEnum.red: // Red
            hexColor = "#bf3232"
            break
        case colorEnum.blue: // Blue
            hexColor = "#2f81f5"
            break
        case colorEnum.white: // White
            hexColor = "#85826e"
            break
        case colorEnum.black: // Black
            hexColor = "#212121"
    }

    return hexColor
}

class Coordinate {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

class Card {
    color: any
    coord: any
    word: any

    constructor(x: number, y: number, word: string, color: number) {
        this.coord = new Coordinate(x, y)
        this.word = word
        this.color = color
    }
}

class Board {
    canvas;
    ctx: any;
    key: any;
    cards: Array<Card>

    constructor() {
        this.canvas = Canvas.createCanvas(1200, 1200)
        this.ctx = this.canvas.getContext("2d")
        this.ctx.fillStyle = "#36393f"
        this.ctx.strokeStyle = "#000000"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.key = []
        this.cards = []
    }

    calcWordSize(word: string) {
        let fontSize = 43

        do {
            this.ctx.font = `bold ${fontSize -= 5}px`
        } while(this.ctx.measureText(word).width > 200)

        return this.ctx.font
    }

    initCards(wordlist: any, colorKey: any) {
        let i = 0
        for (let x=0; x <= 1000; x += 240) {
            for (let y=0; y <= 1000; y += 240) {
                this.cards.push(new Card(x, y, wordlist[i], colorKey[i]))
                i++
            }
        }
    }

    drawWord(x: number, y: number, word: string) {
        this.ctx.font = this.calcWordSize(word)
        this.ctx.fillStyle = "white"
        this.ctx.textAlign = "center"
        this.ctx.fillText(word, x + 120, y + 120)
        this.ctx.rect(x, y, 240, 240)
    }

    drawWordsOnBoard(wordlist: any) {
        let i = 0
        for (let x=0; x <= 1000; x += 240) {
            for (let y=0; y <= 1000; y += 240) {
                this.drawWord(x, y, wordlist[i])
                i++
            }
        }
        this.ctx.stroke()
    }

    setCardColor(color: number, x: number, y: number) {
        this.ctx.fillStyle = colorConverter(color)
        this.ctx.fillRect(x + 20, y + 20, 200, 200)
    }

    hideWord(word: string) {
        var i = this.getWordIndex(word)
        if (i >= 0) {
            var card = this.cards[i]
            this.setCardColor(card.color, card.coord.x, card.coord.y)
        }
    }

    getWordIndex(word: string) : number {
        let found: boolean = false
        let i = 0
        for (; i < this.cards.length; i++) {
            if (this.cards[i].word.toLowerCase() === word.toLowerCase()) {
                found = true
                break
            }
        }
        return found ? i : -1
    }

    colorGuess(word: string) : boolean {
        var i: number = this.getWordIndex(word)
        var found: boolean = false
        if (i >= 0) {
            this.setCardColor(this.cards[i].color, this.cards[i].coord.x, this.cards[i].coord.y)
            this.drawWord(this.cards[i].coord.x, this.cards[i].coord.y, this.cards[i].word)
            found = true
        }
        return found
    }

    drawColorsOnBoard(colorKey: Array<number>, flipColor: boolean) {
        let i = 0
        for (let x=0; x <= 1000; x += 240) {
            for (let y=0; y <= 1000; y += 240) {
                this.cards[i].color = colorKey[i]
                if (flipColor)
                {
                    this.setCardColor(colorKey[i], this.cards[i].coord.x, this.cards[i].coord.y)
                }
                i++
            }
        }
        this.ctx.stroke()
    }

    drawBoard(wordlist: any, colorKey: Array<number>, flipColor: boolean) {
        // Draw cards
        this.ctx.beginPath()
        this.ctx.moveTo(240, 0)
        this.ctx.lineTo(240, 1200)
        this.ctx.moveTo(480, 0)
        this.ctx.lineTo(480, 1200)
        this.ctx.moveTo(720, 0)
        this.ctx.lineTo(720, 1200)
        this.ctx.moveTo(960, 0)
        this.ctx.lineTo(960, 1200)
        this.ctx.stroke()

        this.initCards(wordlist, colorKey)
        if (colorKey) {
            this.drawColorsOnBoard(colorKey, flipColor)
        }
        this.drawWordsOnBoard(wordlist)
    }

    getAttachment() {
        return new AttachmentBuilder(this.canvas.toBuffer('image/png'), {name: 'gameBoard.png'});
    }


}
export { Board }