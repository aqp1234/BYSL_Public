const express = require('express');

const router = express.Router();
const User_Workspace = require('../models/user_workspace');
const Dashboard = require('../schemas/dashboard');
const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');

router.get('/:id', isLoggedIn, isInWorkspace, checkPermission(6), async(req, res, next) => { // permission : 6
    try{
        const dashboard_flag1 = await Dashboard.find({
            flag: 1,
            workspace_id: req.params.id,
        });
        const dashboard_flag2 = await Dashboard.find({
            flag: 2,
            workspace_id: req.params.id,
        });
        const dashboard_flag3 = await Dashboard.find({
            flag: 3,
            workspace_id: req.params.id,
        });
        res.render('dashboard/main', { dashboard_flag1, dashboard_flag2, dashboard_flag3 });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/add', isLoggedIn, isInWorkspace, checkPermission(4), async(req, res, next) => { // permission : 4
    try{
        const userlist = await User_Workspace.findAll({
            where: {
                workspace_id: req.params.id,
            },
        });
        res.render('dashboard/add', { userlist });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/add', isLoggedIn, isInWorkspace, checkPermission(4), async(req, res, next) => { // permission : 4
    try{
        const { manager_id, subject, content, start_date, end_date, flag } = req.body;
        const manager = await User_Workspace.findOne({
            where: {
                user_id: manager_id,
                workspace_id: req.params.id,
            },
        });
        const manager_name = manager.nick;
        await Dashboard.create({
            workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: res.locals.user_workspace.nick,
            user_color: res.locals.user_workspace.color,
            manager_id,
            manager_name,
            manager_color: manager.color,
            subject,
            content,
            start_date,
            end_date,
            flag,
        });
        res.redirect('/dashboard/' + req.params.id );
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/detail/:dashboardid', isLoggedIn, isInWorkspace, checkPermission(6), async(req, res, next) => { // permission : 6
    try{
        const exdashboard = await Dashboard.findOne({
            _id: req.params.dashboardid,
        });
        res.render('dashboard/detail', { dashboard: exdashboard });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/change/:dashboardid', isLoggedIn, isInWorkspace, checkPermission(7), async(req, res, next) => { // permission : 7
    try{
        const exdashboard = await Dashboard.findOne({
            _id: req.params.dashboardid,
        });
        const userlist = await User_Workspace.findAll({
            where: {
                workspace_id: req.params.id,
            },
        });
        res.render('dashboard/change', { dashboard: exdashboard, userlist });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/change/:dashboardid', isLoggedIn, isInWorkspace, checkPermission(7), async(req, res, next) => { // permission : 7
    try{
        const { manager_id, subject, content, start_date, end_date, flag } = req.body;
        const manager = await User_Workspace.findOne({
            where: {
                workspace_id: req.params.id,
                user_id: manager_id,
            },
        });
        const manager_name = manager.nick;
        await Dashboard.updateOne({
            _id: req.params.dashboardid,
        }, {
            $set: {
                manager_id,
                manager_name,
                subject,
                content,
                start_date,
                end_date,
                flag,
                updatedAt: Date.now(),
            },
        });
        res.redirect('/dashboard/' + req.params.id + '/detail/' + req.params.dashboardid );
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/delete/:dashboardid', isLoggedIn, isInWorkspace, checkPermission(5), async(req, res, next) => { // permission : 5
    try{
        await Dashboard.deleteOne({
            _id: req.params.dashboardid
        });
        res.redirect('/dashboard/' + req.params.id );
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;