const express = require('express');

const router = express.Router();

const { Op } = require('sequelize');

const User_Workspace = require('../models/user_workspace');
const Calendar = require('../schemas/calendar');
const Chatroom = require('../schemas/chatroom');
const Chat = require('../schemas/chat');
const Conference = require('../schemas/conference');
const Dashboard = require('../schemas/dashboard');
const Share = require('../schemas/share');
const ShareComment = require('../schemas/sharecomment');
const Timeline = require('../schemas/timeline');
const { isLoggedIn, isInWorkspace } = require('./middlewares');

router.get('/:id', isLoggedIn, isInWorkspace, async (req, res, next) => {
    try{
        res.render('profile/main.html');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id', isLoggedIn, isInWorkspace, async (req, res, next) => {
    try{
        const { nick, color } = req.body;
        const exUser = await User_Workspace.findOne({
            where: {
                nick,
                user_id: {
                    [Op.ne]: req.user.id
                },
            }
        });
        if(exUser){
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('<script>alert("이미 있는 닉네임입니다. 다른 닉네임을 입력해주세요."); location.href="";</script>');
        }
        await User_Workspace.update({
            nick,
            color,
        }, {where: {
            user_id: req.user.id,
            workspace_id: req.params.id,
        }});
        await Calendar.updateMany({
            user_id: req.user.id,
            workspace_id: req.params.id,
        }, {
            $set: {
                user_name: nick,
            }
        });
        const chatrooms = await Chatroom.find({
            workspace_id: req.params.id,
        }, {
            _id: 1,
        });
        chatrooms.map(async (chatroom) => {
            await Chat.updateMany({
                user_id: req.user.id,
                room: chatroom._id,
            }, {
                $set: {
                    user_name: nick,
                    user_color: color,
                }
            });
        });
        await Conference.updateMany({
            user_id: req.user.id,
            workspace_id: req.params.id,
        }, {
            $set: {
                user_name: nick,
            }
        });
        await Dashboard.updateMany({
            user_id: req.user.id,
            workspace_id: req.params.id,
        }, {
            $set: {
                user_name: nick,
                user_color: color,
            }
        });
        await Dashboard.updateMany({
            manager_id: req.user.id,
            workspace_id: req.params.id,
        }, {
            $set: {
                manager_name: nick,
                manager_color: color,
            }
        });
        await Share.updateMany({
            user_id: req.user.id,
            workspace_id: req.params.id,
        }, {
            $set: {
                user_name: nick,
            }
        });
        const shares = await Share.find({
            workspace_id: req.params.id,
        });
        shares.map(async (share) => {
            await ShareComment.updateMany({
                user_id: req.user.id,
                share_id: share._id,
            }, {
                $set: {
                    user_name: nick,
                }
            });
        });
        await Timeline.updateMany({
            user_id: req.user.id,
            workspace_id: req.params.id,
        }, {
            $set: {
                user_name: nick,
            }
        });
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end(`<script>opener.location.href="/workspace/${req.params.id}"; window.close();</script>`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;