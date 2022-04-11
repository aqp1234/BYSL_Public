const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Workspace = require('../models/workspace');
const User_Workspace = require('../models/user_workspace');
const Solo_Workspace = require('../models/solo_workspace');
const StaffInvite = require('../schemas/staffinvite');
const Calendar = require('../schemas/calendar');
const { NICE_KEY } = process.env;
const request = require('request');
const LRU = require('lru-cache');

const options = {
    max: 10,
    maxAge: 1000 * 60 * 60,
    length(n, key) { return 1 },
    dispose(key, n) { /* 데이터가 삭제된 이후 처리할 내용 */},
}

const cache = new LRU(options);
global.cache = cache;

const router = express.Router();

router.use(async (req, res, next) => { // 전역변수 설정
    try{
        console.log("test");
        res.locals.user = req.user; // user정보
        res.locals.myworkspaces = req.user ? await findmyWorkspacefunc(req.user.id) : null; // 내 workspace 정보
        res.locals.solo_workspaces = req.user ? await findmySoloWorkspacefunc(req.user.id) : null // 내 solo workspace 정보
        res.locals.staffinvites = req.user ? await findmyStaffInvitefunc(req.user.id) : null; // 내 staff invite 정보
        next();
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/', isLoggedIn, async (req, res, next) => {
    try{
        res.render('main');
    } catch(err){
        console.error(err);
        return next(err);
    }
});

router.get('/lunch_meals', isLoggedIn, async(req, res, next) => {
    try{
        const user = req.user;
        const year = req.query.year;
        const month = req.query.month;
        const data = cache.get(`${year}${month}lunch_meals`);
        if(data){
            return res.send(data);
        }else{
            const url = 'https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=' + NICE_KEY + 
                '&Type=json&ATPT_OFCDC_SC_CODE=' + user.location_code + 
                '&pindex=1&pSize=100&MMEAL_SC_CODE=2' + 
                '&SD_SCHUL_CODE=' + user.school_code + 
                `&MLSV_YMD=${year}${month}`;
            await request(url, (err, response, body) => {
                if(err){
                    console.error(err);
                    next(err);
                }else{
                    cache.set(`${year}${month}lunch_meals`, body, 1000 * 60 * 60);
                    return res.send(body);
                }
            });
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/lunch_meal', isLoggedIn, async(req, res, next) => {
    try{
        const user = req.user;
        const YMD = req.query.YMD;
        const url = 'https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=' + NICE_KEY + 
            '&Type=json&ATPT_OFCDC_SC_CODE=' + user.location_code + 
            '&pindex=1&pSize=100&MMEAL_SC_CODE=2' + 
            '&SD_SCHUL_CODE=' + user.school_code + 
            `&MLSV_YMD=${YMD}`;
        await request(url, async(err, response, body) => {
            if(err){
                console.error(err);
                next(err);
            }
            res.send(body);
        });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/schedules', isLoggedIn, async(req, res, next) => {
    try{
        const user = req.user;
        const year = req.query.year;
        const month = req.query.month;
        const url = 'https://open.neis.go.kr/hub/SchoolSchedule?KEY=' + NICE_KEY + 
        '&Type=json&ATPT_OFCDC_SC_CODE=' + user.location_code + 
        '&pindex=1&pSize=100' + 
        '&SD_SCHUL_CODE=' + user.school_code + 
        `&AA_YMD=${year}${month}`;
        await request(url, async(err, response, body) => {
            if(err){
                console.error(err);
                next(err);
            }
            cache.set(`${year}${month}schedules`, body, 1000 * 60 * 60);
            return res.send(body);
        });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/schedule', isLoggedIn, async(req, res, next) => {
    try{
        const user = req.user;
        const YMD = req.query.YMD;
        const url = 'https://open.neis.go.kr/hub/SchoolSchedule?KEY=' + NICE_KEY + 
            '&Type=json&ATPT_OFCDC_SC_CODE=' + user.location_code + 
            '&pindex=1&pSize=100' + 
            '&SD_SCHUL_CODE=' + user.school_code + 
            `&AA_YMD=${YMD}`;
        await request(url, async(err, response, body) => {
            if(err){
                console.error(err);
                next(err);
            }
            console.log(body);
            res.send(body);
        });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/my_schedules', isLoggedIn, async(req, res, next) => {
    try{
        const user = req.user;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month);
        const my_schedules = await Calendar.find({
            user_id: user.id,
            $and: [
                {
                    start_date: { 
                        $lte: new Date(year, month, 0),
                    }
                },
                {
                    end_date: {
                        $gte: new Date(year, month-1, 1),
                    }
                }
            ]});
        my_schedules_sets = my_schedules.map(schedule => {
            return {
                id: "" + schedule.start_date.getFullYear() + setFixDayCount(schedule.start_date.getMonth() + 1) + setFixDayCount(schedule.start_date.getDate()),
                schedule: schedule,
            };
        });
        cache.set(`${year}${month}my_schedules`, my_schedules_sets, 1000 * 60 * 60);
        return res.send(my_schedules_sets);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/my_schedule', isLoggedIn, async(req, res, next) => {
    try{
        const YMD = req.query.YMD;
        const year = YMD.substring(0,4);
        const month = YMD.substring(4,6);
        const date = YMD.substring(6,8);
        const my_schedules = await Calendar.find({
            user_id: req.user.id,
            $and: [
                {
                    start_date: {
                        $lte: new Date(year, month-1, date),
                    }
                },
                {
                    end_date: {
                        $gte: new Date(year, month-1, date),
                    }
                }
            ]});
        my_schedules_sets = my_schedules.map(schedule => {
            return {
                id: "" + schedule.start_date.getFullYear() + setFixDayCount(schedule.start_date.getMonth() + 1) + setFixDayCount(schedule.start_date.getDate()),
                schedule: schedule,
            }
        });
        res.send(my_schedules_sets);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/my_schedule_by_id', isLoggedIn, async(req, res, next) => {
    try{
        var my_schedule = await Calendar.findOne({
            _id: req.query._id,
        });
        var workspace = await Workspace.findOne({
            where: {
                id: my_schedule.workspace_id,
            },
        });
        my_schedule_set = {my_schedule: my_schedule, workspace: workspace};
        return res.send(my_schedule_set);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;

const findmyWorkspacefunc = async (id) => {
    try{
        const myWorkspaceid = await User_Workspace.findAll({
            where: {
                user_id: id
            }, // where문
            attributes: ['workspace_id'], // id값만 가져오기
        });
        myWorkspace = Promise.all(myWorkspaceid.map(getWorkspace)); // id값을 map함수를 이용하여 각자 따로 계산하도록 처리
        return myWorkspace;
    }catch(err){
        console.error(err);
    }
};

const findmySoloWorkspacefunc = async (id) => {
    try{
        const mySoloWorkspace = await Solo_Workspace.findAll({
            where: {
                user_id: id
            },
        });
        return mySoloWorkspace;
    }catch(err){
        console.error(err);
    }
}

const findmyStaffInvitefunc = async (id) => {
    try{
        const myStaffInvite = await StaffInvite.find({
                staff_id: id
        });
        return myStaffInvite;
    }catch(err){
        console.error(err);
    }
}

const getWorkspace = async (workspaceid) => { // id값을 가져와서 workspace 조회하여 반환
    try{
        return await Workspace.findOne({
            where: {id: workspaceid.workspace_id},
        });
    }catch(err){
        console.error(err);
    }
}

const setFixDayCount = (number) => {
    let fixNum = "";
    if (number < 10) {
        fixNum = "0" + number;
    } else {
        fixNum = number;
    }
    return fixNum;
};