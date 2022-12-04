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
            hexColor = "#deddd1"
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

class Board {
    canvas;
    ctx: any;
    key: any;

    constructor() {
        this.canvas = Canvas.createCanvas(1200, 1200)
        this.ctx = this.canvas.getContext("2d")
        this.ctx.fillStyle = "#36393f"
        this.ctx.strokeStyle = "#000000"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.key = []
    }

    calcWordSize(word: string) {
        let fontSize = 43

        do {
            this.ctx.font = `bold ${fontSize -= 5}px`
        } while(this.ctx.measureText(word).width > 240)

        return this.ctx.font
    }

    drawWordsOnBoard(wordlist: any) {
        let i = 0
        for (let x=0; x <= 1000; x += 240) {
            for (let y=0; y <= 1000; y += 240) {
                this.ctx.font = this.calcWordSize(wordlist[i])
                this.ctx.fillStyle = "white"
                this.ctx.textAlign = "center"
                this.ctx.fillText(wordlist[i], x + 120, y + 120)
                this.ctx.rect(x, y, 240, 240)
                i++
            }
        }
        this.ctx.stroke()
    }

    drawColorsOnBoard(colorKey: Array<number>) {
        let i = 0
        for (let x=0; x <= 1000; x += 240) {
            for (let y=0; y <= 1000; y += 240) {
                this.ctx.fillStyle = colorConverter(colorKey[i])
                this.ctx.fillRect(x + 20, y + 20, 200, 200)
                i++
            }
        }
        this.ctx.stroke()
    }

    drawBoard(wordlist: any, colorKey?: Array<number>) {
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

        if (colorKey) {
            this.drawColorsOnBoard(colorKey)
        }
        this.drawWordsOnBoard(wordlist)
    }

    getAttachment() {
        return new AttachmentBuilder(this.canvas.toBuffer('image/png'), {name: 'gameBoard.png'});
    }


}
export { Board }