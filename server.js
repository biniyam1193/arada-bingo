const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '8507897804:AAEup4FnA02AhOpeaoLxXYE3-LOFhXnKMKg';
const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// የቢንጎ ጨዋታ ሁኔታ (Game State)
let gameState = {
    roomCode: '06YD5W',
    currentNumber: '-',
    status: 'WAITING',
    calledNumbers: [],
    autoCall: false
};

// ከ 1 እስከ 75 ያሉ የቢንጎ ቁጥሮች ዝርዝር ማዘጋጀት
let availableNumbers = [];
function resetBingoNumbers() {
    availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
}
resetBingoNumbers();

let autoCallInterval = null;

// አውቶማቲክ ቁጥር የሚጠራበት ሎጂክ
function startAutoCalling() {
    if (autoCallInterval) clearInterval(autoCallInterval);
    
    gameState.status = 'PLAYING';
    gameState.autoCall = true;

    autoCallInterval = setInterval(() => {
        if (availableNumbers.length === 0) {
            // ቁጥሮች አልቀዋል
            gameState.status = 'FINISHED';
            clearInterval(autoCallInterval);
            io.emit('game-state', gameState);
            return;
        }

        // ከቀሩት ቁጥሮች ውስጥ በዘፈቀደ አንድ ቁጥር መምረጥ
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const nextNum = availableNumbers.splice(randomIndex, 1)[0];

        // የቢንጎ ፊደል መወሰን (B, I, N, G, O)
        let letter = 'B';
        if (nextNum > 15 && nextNum <= 30) letter = 'I';
        else if (nextNum > 30 && nextNum <= 45) letter = 'N';
        else if (nextNum > 45 && nextNum <= 60) letter = 'G';
        else if (nextNum > 60 && nextNum <= 75) letter = 'O';

        const formattedCall = `${letter}-${nextNum}`;

        // የጥሪ ታሪክ ውስጥ መጨመር (በስተግራ ወይም በቀኝ በኩል እንዲታዩ)
        gameState.currentNumber = formattedCall;
        gameState.calledNumbers.unshift(formattedCall); // አዲሱን ቁጥር ከፊት እናስገባዋለን

        // ለሁሉም ተገናኝተው ያሉ ተጫዋቾች መላክ
        io.emit('game-state', gameState);
        console.log('የተጠራ ቁጥር:', formattedCall);

    }, 5000); // በየ 5 ሰኮንዱ አንድ ቁጥር ይጠራል (ከፈለጉ ማሳጠር ወይም ማረዘም ይችላሉ)
}

// የቴሌግራም ትዕዛዞች
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "እንኳን ወደ Smart Bingo ደህና መጡ! 🎮 ጨዋታውን ለመጀመር /play የሚለውን ይጠቀሙ።");
});

bot.onText(/\/play/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "አራዳ ቢንጎ ለመጫወት ዝግጁ ነዎት! ካርቴላ ለመምረጥ እና ጨዋታውን ለመቀላቀል ዌብ አፕሊኬሽኑን ይክፈቱ።");
});

// ዌብሶኬት ግንኙነት
io.on('connection', (socket) => {
    console.log('አዲስ ተጠቃሚ ተገናኝቷል:', socket.id);
    socket.emit('game-state', gameState);

    // ተጠቃሚው 'toggle-auto' ሲልክ አውቶማቲክ ጥሪውን ማስጀመር/ማቆም ከፈለጉ
    socket.on('toggle-auto', (enabled) => {
        if (enabled) {
            startAutoCalling();
        } else {
            if (autoCallInterval) clearInterval(autoCallInterval);
            gameState.autoCall = false;
            io.emit('game-state', gameState);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Smart Bingo Server running on port ${PORT}`);
});

