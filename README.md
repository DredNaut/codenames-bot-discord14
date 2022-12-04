# codenames-bot-discord14

The bot currently supports discord.js v14

This is a work in progress the original implementation is written is index.ts and is a limited working POC. I am working on refactoring this into something more robust.
# Installation
- Download the latest version of node-js
- Create Application in discord developer portal
    - Create a bot with message read and bot permissions
    - Give bot administrator
    - Generate link and add bot to server
In a powershell session run the following:
```
npm install discord.js dotenv
```
In an admin powershell session run the following:
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
npm install -g ts-node
```

# Starting the Bot
Your bot is now ready to be launched with:
```
ts-node index
```

# Commands
|Command|Description|
|---|---|
|-new|Generates a new board with words randomly placed|
|-key|Generates a new board color key with colors randomly placed|