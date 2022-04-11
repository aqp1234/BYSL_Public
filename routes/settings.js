const express = require('express');
const Workspace = require('../models/workspace');
const User_Workspace = require('../models/user_workspace');
const User = require('../models/user');
const Permission = require('../models/permission');
const Group = require('../models/group');
const Group_Permission = require('../models/group_permission');
const Invite = require('../schemas/invite');
const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');

const router = express.Router();

router.get('/:id', isLoggedIn, isInWorkspace, async (req, res, next) => {
    const ex_user_workspaces = await User_Workspace.findAll({
        where: {
          workspace_id: req.params.id,
        }
    });
    const users = await User.findAll({
        where: {
            id: ex_user_workspaces.map(user => user.user_id),
        }
    });
    const user_workspaces = ex_user_workspaces.map(user_workspace => {
        return {
            user_id: user_workspace.user_id,
            group_id: user_workspace.group_id,
            user: users.find(user => user.id === user_workspace.user_id),
        }
    });
    const groups = await Group.findAll({
        where: {
            workspace_id: req.params.id,
        },
    })
    const workspace = await Workspace.findOne({
        where: {
            id: req.params.id,
        }
    });
    const invites = await Invite.find({
        workspace_id: req.params.id,
    });
    let my_permissions_id = await Group_Permission.findAll({
        where: {
            group_id: ex_user_workspaces.find(user_workspace => user_workspace.user_id === req.user.id).group_id,
        },
    });
    const permissions = await Permission.findAll();
    const my_permissions = my_permissions_id.map(permission_id => {
        return permissions.find(permission => permission.id === permission_id.permission_id);
    })
    my_permissions_id = my_permissions.map(permission_id => permission_id.id);
    res.render('settings/main.html', { user_workspaces, groups, workspace, invites, my_permissions, my_permissions_id });
});

router.post('/:id/set_group', isLoggedIn, isInWorkspace, checkPermission(25), async(req, res, next) => { // permission : 25
    const { user_id, group_id } = req.body;
    const ex_user_workspace = await User_Workspace.findOne({
        where: {
            workspace_id: req.params.id,
            user_id: user_id,
        }
    });
    if (ex_user_workspace) {
        await ex_user_workspace.update({
            group_id: group_id,
        });
    }else{
        res.error('User not in workspace');
    }
    res.send({ msg: `권한 변경 완료`, url: `/settings/${req.params.id}` });
});

router.delete('/:id/user', isLoggedIn, isInWorkspace, async(req, res, next) => {
    const { user_id } = req.body;
    if(user_id == req.user.id){
        return res.send({ msg: `워크스페이스 owner는 추방할 수 없습니다.`, url: `/settings/${req.params.id}` });
    }
    const ex_user_workspace = await User_Workspace.findOne({
        where: {
            workspace_id: req.params.id,
            user_id: user_id,
        }
    });
    if (ex_user_workspace) {
        await ex_user_workspace.destroy();
    }else{
        res.error('User not in workspace');
    }
    return res.send({ msg: `사용자 삭제 완료`, url: `/settings/${req.params.id}` });
})

router.delete('/:id/invite', isLoggedIn, isInWorkspace, checkPermission(20), async(req, res, next) => { // permission : 20
    const { invite_id } = req.body;
    const ex_invite = await Invite.findOne({
        _id: invite_id,
    });
    if (ex_invite) {
        await ex_invite.delete();
    }else{
        res.error('User not in workspace');
    }
    res.send({ msg: `초대 삭제 완료`, url: `/settings/${req.params.id}` });
})

router.get('/:id/group', isLoggedIn, isInWorkspace, checkPermission(21), async (req, res, next) => { // permission : 21
    const permissions = await Permission.findAll();
    res.render('settings/group_add.html', { permissions });
});

router.post('/:id/group', isLoggedIn, isInWorkspace, checkPermission(21), async (req, res, next) => { // permission : 21
    try{
        const { group_name, permissions } = req.body;
        const group = await Group.create({
            name: group_name,
            workspace_id: req.params.id,
        });
        permissions.forEach(async (permission) => {
            await Group_Permission.create({
                group_id: group.id,
                permission_id: permission,
            });
        });
        res.send({ url: `/settings/${req.params.id}`, msg: '그룹 추가가 완료되었습니다.'});
    }catch(err){
        res.send(err.message);
    }
});

router.get('/:id/group/:groupid', isLoggedIn, isInWorkspace, checkPermission(23), async(req, res, next) => { // permission : 23
    const group = await Group.findOne({
        where: {
            id: req.params.groupid,
        },
    });
    const permissions = await Permission.findAll();
    const permissions_chosen_id = await Group_Permission.findAll({
        attributes: ['permission_id'],
        where: {
            group_id: req.params.groupid,
        }
    });
    const permissions_chosen = permissions.filter(permission => {
        return permissions_chosen_id.some(permission_id => permission_id.permission_id === permission.id);
    })
    const permissions_available = permissions.filter(permission => !permissions_chosen.includes(permission))
    res.render('settings/group_change.html', { group, permissions_available, permissions_chosen });
});

router.post('/:id/group/:groupid', isLoggedIn, isInWorkspace, checkPermission(24), async(req, res, next) => { // permission : 24
    try{
        const { group_name, permissions } = req.body;
        await Group.update({
            name: group_name,
        }, {
            where: {
                id: req.params.groupid,
            }
        });
        await Group_Permission.destroy({
            where: {
                group_id: req.params.groupid,
            }
        });
        permissions.forEach(async (permission) => {
            await Group_Permission.create({
                group_id: req.params.groupid,
                permission_id: permission,
            });
        })
        res.send({ url: `/settings/${req.params.id}`, msg: `${group_name} 그룹의 권한 수정이 완료되었습니다.`});
    }catch(err){
        res.send(err.message);
    }
});

router.delete('/:id/group/:groupid', isLoggedIn, isInWorkspace, checkPermission(22), async(req, res, next) => { // permission : 22
    try{
        await Group.destroy({
            where: {
                id: req.params.groupid,
            }
        });
        return res.send({ url: `/settings/${req.params.id}`, msg: `그룹 삭제가 완료되었습니다.`});
    }catch(err){
        res.send(err.message);
    }
});

module.exports = router;