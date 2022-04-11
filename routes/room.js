const express = require('express');

const Chatroom = require('../schemas/chatroom');
const Chat = require('../schemas/chat');
const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');

const router = express.Router();

router.get('/:id', isLoggedIn, isInWorkspace, checkPermission(3), async (req, res, next) => { // permission : 3
    try{
        const chatrooms = await Chatroom.find({
            workspace_id: req.params.id,
        });
        const lastchats = {};
        for(i = 0; i < chatrooms.length; i++){
            var lastchat = await Chat.findOne({
                room: chatrooms[i]._id,
            }).sort({createdAt: -1});
            if(lastchat){
                lastchats[chatrooms[i]._id] = lastchat.chat;
            }else{
                lastchats[chatrooms[i]._id] = "아직 채팅이 없습니다. 첫 번째 채팅의 주인공이 되어보세요!";
            }
        }
        res.render('room/main', { chatrooms, lastchats });
    } catch(err){
        console.log(err);
        console.error(err);
        next(err);
    }
   
});

router.get('/:id/add', isLoggedIn, isInWorkspace, checkPermission(1), (req, res) => { // permission : 1
    res.render('room/add');
});

router.post('/:id/add', isLoggedIn, isInWorkspace, checkPermission(1), async(req, res, next) => { // permission : 1
    try{
        const exchatroom = await Chatroom.create({
            workspace_id: req.params.id,
            roomname: req.body.roomname,
        });
        const io = req.app.get('io');
        io.of('/room').emit('newRoom', exchatroom);
        res.redirect(`/chat/${req.params.id}/${exchatroom._id}`);
    } catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;