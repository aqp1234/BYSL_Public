const express = require('express');
const Workspace = require('../models/workspace');
const User_Workspace = require('../models/user_workspace');
const Group = require('../models/group');
const Group_Permission = require('../models/group_permission');
const Permission = require('../models/permission');
const Chatroom = require('../schemas/chatroom');
const Invite = require('../schemas/invite');
const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');
const bcrypt = require('bcrypt');
const { smtpTransport } = require('../config/email');

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
    res.render('workspace/add');
});

router.post('/', isLoggedIn, async (req, res, next) => {
    const owner = req.user.id;
    const { workspacename, nick, color } = req.body;
    try{
        const exworkspace = await Workspace.create({
            workspacename,
            owner,
            createdAt: Date.now(),
        });
        await Chatroom.create({
            workspace_id: exworkspace.id,
            roomname: '채팅',
        });
        const ex_admin_group = await Group.create({
            name: 'admin',
            workspace_id: exworkspace.id,
            is_admin: true,
        });
        await Group.create({
            name: 'guest',
            workspace_id: exworkspace.id,
            is_guest: true,
        });
        const permissions = await Permission.findAll();
        const adminarray = new Array();
        for(let i = 0; i < permissions.length; i++){
            adminarray[i] = {permission_id: i+1};
        }
        adminarray.forEach(dict => dict['group_id'] = ex_admin_group.id)
        await Group_Permission.bulkCreate(adminarray);
        await User_Workspace.create({
            color,
            nick,
            user_id: owner,
            workspace_id: exworkspace.id,
            group_id: ex_admin_group.id,
        });
        res.redirect('/');
    } catch(err){
        console.error("error" + err);
        return next(err);
    }
});

router.get('/:id', isLoggedIn, isInWorkspace, async (req, res, next) => {
    try{
        res.redirect(`/calendar/${req.params.id}`);
        // const workspace = await Workspace.findOne({
        //     where: { id: req.params.id },
        // });
        // res.render('layout.html', { workspace });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id', isLoggedIn, isInWorkspace, async (req, res, next) => {
    try{
        await Workspace.delete({
            where: { id: req.params.id },
        });
        return res.status(200).send({ msg: "워크스페이스 삭제가 완료되었습니다." , url: '/' });
    } catch(err){
        console.error(err);
        return next(err);
    }
});

router.post('/:id/send_invite_mail', isLoggedIn, isInWorkspace, checkPermission(19), async(req, res, next) => { // permission : 19
    try{
        const { email } = req.body;
        const randomNum = Math.floor(Math.random() * 1000000);
        const key = await bcrypt.hash(String(randomNum), 12);
        const url = `http://${req.get('host')}/workspace/${req.params.id}/invite?key=${key}`;
        
        const mailOptions = {
            from: '[BYSL] <aqp0222@naver.com>',
            to: email,
            subject: '[BYSL]초대 메일입니다.',
            html: `<div>워크스페이스 입장을 위해 옆의 url을 클릭해주세요 <a href="${url}">${url}</a></div>`,
        };
        

        smtpTransport.sendMail(mailOptions, async(error, responses) => {
            if(error){
                console.error(error);
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.write(`<script>alert("이메일 전송에 실패하였습니다. 다시 시도해주세요."); location.href="/workspace/${req.params.id}"</script>`);
            }else{
                await Invite.create({
                    email: email,
                    key: key,
                    user_id: req.user.id,
                    user_name: req.user.name,
                    workspace_id: req.params.id,
                });
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                return res.write(`<script>alert("이메일 전송에 성공하였습니다."); location.href="/workspace/${req.params.id}"</script>`);
            }
        });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/invite', async(req, res, next) => {
    try{
        if(!req.isAuthenticated()){ // 초대 링크 눌렀는데 로그인 안한 경우 로그인 하도록 리다이렉션
            return res.redirect(`/auth/login?next=/workspace${req.url}`);
        }
        const is_invited = await Invite.findOne({
            key: req.query.key,
        });
        if(!is_invited){
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.write(`<script>alert('초대url이 유효하지 않습니다. 다시 시도해주세요.'); location.href='/';</script>`)
        }
        if(is_invited.email != req.user.email){
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.write(`<script>alert('초대 받은 이메일과 동일한 아이디로 로그인 해주세요.'); location.href='/';</script>`)
        }
        const exuser_workspace = await User_Workspace.findOne({
            where: {
              workspace_id: req.params.id,
            },
        });
        res.render('workspace/invite', { user_workspace: exuser_workspace });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/invite', async(req, res, next) => {
    try{
        const { nick, color } = req.body;
        const exUser = await User_Workspace.findOne({
            where: {
                nick,
                workspace_id: req.params.id,
            }
        });
        if(exUser){
            res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('<script>alert("이미 있는 닉네임입니다. 다른 닉네임을 입력해주세요."); location.href="";</script>');
        }else{
            const guest_group = await Group.findOne({
                where: {
                    workspace_id: req.params.id,
                    is_guest: true,
                }
            });
            await User_Workspace.create({
                nick,
                color,
                user_id: req.user.id,
                workspace_id: req.params.id,
                group_id: guest_group.id,
            });
            const ex_invite = await Invite.findOne({
                key: req.query.key,
            });
            if (ex_invite) {
                await ex_invite.delete();
            }
            res.redirect('/');
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;