const SocketIO = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);
    const room = io.of('/room');
    const chat = io.of('/chat');

    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    chat.use(wrap(cookieParser(process.env.COOKIE_SECRET)));
    chat.use(wrap(sessionMiddleware));

    room.on('connection', (socket) => {
        console.log('room namespace 접속');
        socket.on('disconnect', () => {
            console.log('room namespace 접속 해지');
        });
    });

    chat.on('connection', (socket) => {
        console.log('chat namespace 접속');
        const req = socket.request;
        const { headers: { referer } } = req;
        const roomId = referer
            .split('/')[referer.split('/').length - 1]
            .replace(/\?.+/, '');
        socket.join(roomId);
        console.log("roomid = " + roomId);
        
        socket.on('disconnect', async() => {
            try{
                console.log('chat namespace 접속 해지');
                socket.leave(roomId);
            } catch(err){
                console.error(err);
            };
        });
    });
};