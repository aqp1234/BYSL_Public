const express = require('express');

const Chat = require('../schemas/chat');
const Chatroom = require('../schemas/chatroom');
const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');

const router = express.Router();

router.get('/:id/:roomid', isLoggedIn, isInWorkspace, checkPermission(3), async (req, res, next) => { // permission : 3
    try{
        const chats = await Chat.find({
            room: req.params.roomid,
        }).sort('createdAt');
        const chatroom = await Chatroom.findOne({
            workspace_id: req.params.id,
            _id: req.params.roomid,
        });
        if(chatroom == null){ // 없는 채팅방으로 들어간 경우(DB에 없는 채팅방)
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('<script>alert("잘못된 채팅방입니다."); location.href="/";</script>');
        }
        res.render('chat', {
            user_workspace: res.locals.user_workspace,
            chats,
            chatroom,
            workspace_id: req.params.id,
        });
    } catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id/:roomid', isLoggedIn, isInWorkspace, checkPermission(2), async(req, res, next) => { // permission : 2
    try{
        await Chatroom.deleteOne({ _id: req.params.roomid });
        await Chat.deleteMany({ room: req.params.roomid });
        res.send({ workspace_id: req.params.id });
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.post('/:id/:roomid/chat', isLoggedIn, isInWorkspace, checkPermission(3), async (req, res, next) => { // permission : 3
    try{
        const exchat = await Chat.create({
            room: req.params.roomid,
            user_id: req.user.id,
            user_name: res.locals.user_workspace.nick,
            user_color: res.locals.user_workspace.color,
            chat: req.body.chat,
            file: req.body.file,
        });
        req.app.get('io').of('/chat').to(req.params.roomid).emit('chat', exchat);
        res.send('ok');
    } catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;