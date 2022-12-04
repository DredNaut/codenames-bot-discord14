import DiscordJS, {Client, GatewayIntentBits, TextChannel } from 'discord.js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { Board } from './src/game/Board'
import "./src/game/Board.ts"
dotenv.config()

enum colorEnum {
    red = 0,
    blue,
    white,
    black
}

var teamStart = 0

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
    teamStart = getRandomInt(0, 1)
    var color
    var maxArr: Array<number> = [0, 0, 7, 1]
    var countArr: Array<number> = [0, 0, 0, 0]
    var i = 0

    if (colorEnum.red == teamStart) {
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
var attachment
var colorKey: Array<number> = []
var gameWords: Array<string> = []
var gameBoard = {} as Board
var masterBoard = {} as Board
var spymasterChannel: string
var publicChannel: string

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
        colorKey = getNewColorKey()
        gameWords = getNewBoard(wordlist)
        gameBoard = new Board()
        gameWords = getNewBoard(wordlist)
        gameBoard.drawBoard(gameWords, colorKey, false)
        attachment = gameBoard.getAttachment()
        console.log(`${message.channel} id: ${message.channelId}`)
        publicChannel = message.channelId

        message.reply({
            files: [attachment]
        })
    }

    if (message.content === '-key') {
        masterBoard = new Board()
        masterBoard.drawBoard(gameWords, colorKey, true)
        attachment = masterBoard.getAttachment()
        var teamString = "🔴 Red"
        console.log(`${message.channel} id: ${message.channelId}`)
        spymasterChannel = message.channelId

        if (teamStart == colorEnum.blue)
        {
            teamString = "🔵 Blue"
        }

        message.reply({
            content: teamString + " Team Goes First!",
            files: [attachment]
        })
    }

    var guessRegex = /-g [a-z]*/
    if (message.content.match(guessRegex)) {
        var guess = message.content.split(" ", 2)[1]
        console.log("Received Guess: " + guess)

        if (gameBoard.colorGuess(guess)) {
            console.log("valid guess")
            masterBoard.hideWord(guess)

            message.reply({
                content: `${author} guessed "**${guess}**"`,
                files: [gameBoard.getAttachment()]
            })

            // to spymasters
            const channel = client.channels.cache.get(spymasterChannel);
            if (channel) {
                (channel as TextChannel).send({
                    content: `${author} guessed "**${guess}**"`,
                    files: [masterBoard.getAttachment()]
                });
            }
        }
        else {
            message.reply({
                content: `${author} guess "**${guess}**" was is not a valid guess..`,
            })
        }
    }


    if (message.content === '-wipe') {
        const channel = client.channels.cache.get(spymasterChannel);
        if (channel) {
            (channel as TextChannel).bulkDelete(50);
        }
        const other = client.channels.cache.get(publicChannel);
        if (other) {
            (other as TextChannel).bulkDelete(50);
        }
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