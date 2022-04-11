const express = require('express');
const Solo_Workspace = require('../models/solo_workspace');
const { isLoggedIn, isMySoloWorkspace } = require('./middlewares');

const router = express.Router();

router.post('/add', isLoggedIn, async (req, res, next) => {
    const user_id = req.user.id;
    const { solo_workspacename } = req.body;
    try{
        await Solo_Workspace.create({
            solo_workspacename,
            user_id,
            createdAt: Date.now(),
        });
        res.redirect('/');
    } catch(err){
        console.error("error" + err);
        return next(err);
    }
});

router.get('/:id', isLoggedIn, isMySoloWorkspace, async (req, res, next) => {
    try{
        return res.redirect(`/solo/calendar/${req.params.id}`);
    } catch(err){
        console.error(err);
        return next(err);
    }
});

router.get('/:id/settings', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        res.render('solo_workspace/settings');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id/settings', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        await Solo_Workspace.destroy({
            where: {
                id: req.params.id,
                user_id: req.user.id,
            },
        });
        res.send({msg: `워크스페이스 삭제가 완료되었습니다.`, url: '/'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;