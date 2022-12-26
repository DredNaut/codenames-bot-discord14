import dotenv from 'dotenv'
dotenv.config()

import { readFileSync } from 'fs'

import { Board } from './src/game/Board'
import { ClientAdapter } from './src/discord/ClientAdapter'

enum colorEnum {
    red = 0,
    blue,
    white,
    black
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

var dClient = new ClientAdapter()
var newMessage

var players: Array<string> = [];
var wordlist = initWordList()
var attachment
var colorKey: Array<number> = []
var gameWords: Array<string> = []
var gameBoard = {} as Board
var masterBoard = {} as Board
var teamStart = 0

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

dClient.client.on('messageCreate', (message) => {
    console.log(`Received Message: ${message.content} From User: ${message.author.username}`)
    gameHandler({channelId: message.channelId, content: message.content, author: message.author.username})
})

function cmdJoin(newMessage: any) {
    players.push(newMessage.author)
    dClient.sendPublicMessage({content: `${newMessage.author} Successfully Joined Game`})
}

function cmdNew(newMessage: any) {
    gameBoard = new Board()
    colorKey = getNewColorKey()
    gameWords = getNewBoard(wordlist)
    gameBoard.drawBoard(gameWords, colorKey, false)
    attachment = gameBoard.getAttachment()
    dClient.setPublicChannel(newMessage.channelId)
    dClient.sendPublicMessage({files: [attachment]})
}

function cmdKey(newMessage: any) {
    masterBoard = new Board()
    masterBoard.drawBoard(gameWords, colorKey, true)
    attachment = masterBoard.getAttachment()
    dClient.setSpyMasterChannel(newMessage.channelId)
    var teamString = "🔴 Red"
    if (teamStart == colorEnum.blue)
    {
        teamString = "🔵 Blue"
    }

    dClient.sendSpyMasterMessage({content: teamString + " Team Goes First!", files: [attachment]})
}

function cmdWipe(newMessage: any) {
    if (dClient.channelExists(dClient.spymasterChannel) &&
        dClient.channelExists(dClient.publicChannel)) {
        dClient.wipePublic()
        dClient.wipeSpymaster()
    }

    else {
        dClient.wipeChannel(dClient.getChannelById(newMessage.channelId))
    }
}

async function cmdGuess(newMessage: any) {
    var guess = newMessage.content.split(" ", 2)[1]

    if (gameBoard.colorGuess(guess)) {

        if (dClient.channelExists(dClient.spymasterChannel) &&
            dClient.channelExists(dClient.publicChannel)) {
                dClient.wipePublic()
                dClient.wipeSpymaster()
                await delay(500);
                dClient.sendPublicMessage({content: `${newMessage.author} guessed "**${guess}**"`, files: [gameBoard.getAttachment()]})

                masterBoard.hideWord(guess)
                dClient.sendSpyMasterMessage({content: `${newMessage.author} guessed "**${guess}**"`, files: [masterBoard.getAttachment()]})
        }
    }
    else {
        dClient.sendPublicMessage({content: `${newMessage.author} guess "**${guess}**" was is not a valid guess..`})
    }
}

function cmdListPlayers(newMessage: any) {
    dClient.sendPublicMessage({content: 'Players: ' + players.toString()})
}

function cmdLeave(newMessage: any) {
    if (players.includes(newMessage.author)) {

        delete players[players.indexOf(newMessage.author)]
        dClient.sendPublicMessage({content: newMessage.author + ' has left the game.'})
    }

    else {
        dClient.sendPublicMessage({content: newMessage.author + ' is not in the game.'})
    }
}

var commandRef: any = {
    '-join': cmdJoin,
    '-new': cmdNew,
    '-key': cmdKey,
    '-wipe': cmdWipe,
    '-list-players': cmdListPlayers,
    '-leave': cmdLeave
}

function gameHandler(newMessage: any) {

    if (newMessage.content) {
        var guessRegex = /-g [a-z]*/
        if (newMessage.content.match(guessRegex)) {
            cmdGuess(newMessage)
        }

        else {
            console.log(`Message recieved: ${newMessage.content}`)
            try {
                commandRef[newMessage.content](newMessage)
            }
            catch (error) {
            }
        }

    }
}