import DiscordJS, { AttachmentBuilder, Client, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { Board } from './src/game/Board'
const Canvas = require('@napi-rs/canvas')
import "./src/game/Board.ts"
dotenv.config()

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

function addColorsToBoardKeyImage(colorKey: Array<number>, ctx: any) {
    let i = 0
    for (let x=0; x <= 1000; x += 240) {
        for (let y=0; y <= 1000; y += 240) {
            ctx.fillStyle = colorConverter(colorKey[i])
            ctx.fillRect(x + 20, y + 20, 200, 200)
            i++
        }
    }
    ctx.stroke()
}

function createColorKeyImage(colorKey: Array<number>) {
    // Board background
    const canvas = Canvas.createCanvas(1200, 1200)
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = '#36393f'
    ctx.strokeStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw cards
    ctx.beginPath()
    ctx.moveTo(240, 0)
    ctx.lineTo(240, 1200)
    ctx.moveTo(480, 0)
    ctx.lineTo(480, 1200)
    ctx.moveTo(720, 0)
    ctx.lineTo(720, 1200)
    ctx.moveTo(960, 0)
    ctx.lineTo(960, 1200)
    ctx.stroke()

    addColorsToBoardKeyImage(colorKey, ctx)

    return new AttachmentBuilder(canvas.toBuffer('image/png'), {name: 'gameBoard.png'});
}

function initWordList() {

    var wordlist: Array<string> = [];

    const data = readFileSync('./wordlist.txt', 'utf-8')

    const lines = data.split(/\r?\n/)

    lines.forEach(line => {
        wordlist.push(line)
    })
    return wordlist
}

function getRandomInt(min: number, max: number) : number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomWord(wordlist: Array<string>) : string {
    return wordlist[getRandomInt(0, wordlist.length - 1)]
}

function getNewColorKey() : Array<number> {
    var colorKey: Array<number> = []
    var firstGuess = getRandomInt(0, 1)
    var color
    var maxArr: Array<number> = [0, 0, 7, 1]
    var countArr: Array<number> = [0, 0, 0, 0]
    var i = 0

    if (colorEnum.red == firstGuess) {
        maxArr[colorEnum.red] = 9
        maxArr[colorEnum.blue] = 8
    }

    else {
        maxArr[colorEnum.red] = 8
        maxArr[colorEnum.blue] = 9
    }

    while (i < 25) {
        color = getRandomInt(0,4)

        if (countArr[color] < maxArr[color]) {
            colorKey[i] = color
            countArr[color]++
            i++
        }
    }

    return colorKey
}

function getNewBoard(wordlist: Array<string>) : Array<string> {
    var newBoard: Array<string> = []
    while (newBoard.length < 25) {
        var word = getRandomWord(wordlist)

        if (!newBoard.includes(word)) {
            newBoard.push(word)
        }
    }

    return newBoard
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
})

client.on('ready', () => {
    console.log('The bot is ready')
})

var players: Array<string> = [];
var wordlist = initWordList()
var currentBoard = getNewBoard(wordlist)
var attachment

client.on('messageCreate', (message) => {

    var author = message.author.username;
    console.log(`Received Message: ${message.content} From User: ${author}`)

    if (message.content === '-join') {
        players.push(author)

        message.reply({
            content: author + ' Successfully Joined Game',
        })
    }

    if (message.content === '-new') {
        var gameBoard = new Board()
        var gameWords = getNewBoard(wordlist)
        gameBoard.drawBoard(gameWords)
        attachment = gameBoard.getAttachment()

        message.reply({
            files: [attachment]
        })
    }

    if (message.content === '-key') {
        var colorKey = getNewColorKey()
        var attachment = createColorKeyImage(colorKey)

        message.reply({
            files: [attachment]
        })
    }

    if (message.content === '-list-players') {

        message.reply({
            content: 'Players: ' + players.toString(),
        })
    }

    if (message.content === '-leave') {

        if (players.includes(author)) {

            delete players[players.indexOf(author)]
            message.reply({
                content: author + ' has left the game.',
            })
        }
        else {

            message.reply({
                content: author + ' is not in the game.',
            })
        }
    }

})

client.login(process.env.TOKEN)