import DiscordJS, {Client, Channel, Message, GatewayIntentBits, TextChannel } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()

class ClientAdapter {
    client: Client
    publicChannel: any
    spymasterChannel: any

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessages
            ]
        })

        this.publicChannel = {} as Channel
        this.spymasterChannel = {} as Channel

        this.client.on('ready', () => {
            console.log('The bot is ready')
        })
        this.client.login(process.env.TOKEN)
    }

    sendPublicMessage(message: any) {
        if (this.publicChannel) {
            (this.publicChannel as TextChannel).send(message)
        }
    }
    sendSpyMasterMessage(message: any) {
        if (this.spymasterChannel) {
            (this.spymasterChannel as TextChannel).send(message)
        }
    }

    setSpyMasterChannel(channelId: string) {
        var tmp: any
        tmp = this.client.channels.cache.get(channelId);
        if (tmp) {
            this.spymasterChannel = tmp as TextChannel
        }
    }

    channelExists(channel: any) {
        return (Object.keys(channel).length > 0)
    }

    wipeSpymaster() {
        if (this.channelExists(this.spymasterChannel)) {
            (this.spymasterChannel as TextChannel).bulkDelete(100);
        }
    }

    wipePublic() {
        if (this.channelExists(this.publicChannel)) {
            (this.publicChannel as TextChannel).bulkDelete(100);
        }
    }
    
    wipeChannel(channel: any) {
        if (this.channelExists(channel)) {
            (channel as TextChannel).bulkDelete(100)
        }
    }

    getChannelById(channelId: string) {
        return this.client.channels.cache.get(channelId)
    }

    setPublicChannel(channelId: string) {
        var tmp: any
        tmp = this.client.channels.cache.get(channelId);
        if (tmp) {
            this.publicChannel = tmp as TextChannel
        }
    }
}

export { ClientAdapter }