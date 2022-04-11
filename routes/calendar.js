const express = require('express');

const router = express.Router();

const Workspace = require('../models/workspace');
const Calendar = require('../schemas/calendar');
const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');

const setFixDayCount = (number) => {
    let fixNum = "";
    if (number < 10) {
        fixNum = "0" + number;
    } else {
        fixNum = number;
    }
    return fixNum;
};

router.get('/:id', isLoggedIn, isInWorkspace, checkPermission(10), async(req, res, next) => { // permission : 10
    try{
        const ex_workspace = await Workspace.findOne({
            where: {
                id: req.params.id,
            }
        });
        const calendars = await Calendar.find({
            workspace_id: req.params.id,
        });
        calendars_map = calendars.map(calendar => {
            return {
                id: "" + calendar.start_date.getFullYear() + setFixDayCount(calendar.start_date.getMonth() + 1) + setFixDayCount(calendar.start_date.getDate()),
                calendar: calendar,
            };
        });
        res.render('calendar/main', { workspace: ex_workspace, calendar_sets: calendars_map });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/add', isLoggedIn, isInWorkspace, checkPermission(8), async(req, res, next) => { // permission : 8
    try{
        res.render('calendar/add');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/add', isLoggedIn, isInWorkspace, checkPermission(8), async(req, res, next) => { // permission : 8
    try{
        const { subject, content, start_date, end_date } = req.body;
        start_date_split = start_date.split('-');
        end_date_split = end_date.split('-');
        await Calendar.create({
            workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: res.locals.user_workspace.nick,
            subject,
            content,
            start_date: new Date(start_date_split[0], start_date_split[1] - 1, start_date_split[2]),
            end_date: new Date(end_date_split[0], end_date_split[1] - 1, end_date_split[2]),
        });
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end('<script>opener.location.href="/calendar/' + req.params.id + '"; window.close();</script>');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/detail/:calendarid', isLoggedIn, isInWorkspace, checkPermission(10), async(req, res, next) => { // permission : 10
    try{
        const excalendar = await Calendar.findOne({
            _id: req.params.calendarid,
        });
        res.render('calendar/detail', { calendar: excalendar });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/change/:calendarid', isLoggedIn, isInWorkspace, async(req, res, next) => { // permission : none (자신만 수정 가능)
    try{
        const excalendar = await Calendar.findOne({
            _id: req.params.calendarid,
        });
        res.render('calendar/change', { calendar: excalendar });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/change/:calendarid', isLoggedIn, isInWorkspace, async(req, res, next) => { // permission : none
    try{
        const { subject, content, start_date, end_date } = req.body;
        start_date_split = start_date.split('-');
        end_date_split = end_date.split('-');
        await Calendar.updateOne({
            _id: req.params.calendarid,
        }, {
            $set: {
                subject,
                content,
                start_date: new Date(start_date_split[0], start_date_split[1] - 1, start_date_split[2]),
                end_date: new Date(end_date_split[0], end_date_split[1] - 1, end_date_split[2]),
                updatedAt: Date.now(),
            }
        });
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end(`<script>opener.location.href="/calendar/${req.params.id}"; window.close();</script>`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/delete/:calendarid', isLoggedIn, isInWorkspace, checkPermission(9), async(req, res, next) => { // permission : 9
    try{
        await Calendar.deleteOne({
            _id: req.params.calendarid,
        });
        return res.redirect('/calendar/' + req.params.id);
    }catch(err){
        console.error(err);
        next(err);
    }
});


// 여기부터는 팀 캘린더 관련 하여 API


router.get('/:id/calendars', isLoggedIn, isInWorkspace, async(req, res, next) => { // 해당 달의 모든 캘린더 가져오기
    try{
        const calendars = await Calendar.find({
            workspace_id: req.params.id,
            $and: [
                {
                    start_date: {
                        $lte: new Date(req.query.year, req.query.month, 0),
                    }
                },
                {
                    end_date: {
                        $gte: new Date(req.query.year, req.query.month - 1, 1),
                    }
                }
            ]});
        calendars_map = calendars.map(calendar => {
            return {
                id: "" + calendar.start_date.getFullYear() + setFixDayCount(calendar.start_date.getMonth() + 1) + setFixDayCount(calendar.start_date.getDate()),
                calendar: calendar,
            };
        });
        workspace_id = req.params.id;
        res.send({calendars_map, workspace_id});
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/:id/calendar', isLoggedIn, isInWorkspace, async(req, res, next) => { // 해당 날짜의 모든 캘린더 정보 가져오기
    try{
        const YMD = req.query.YMD;
        const year = YMD.substring(0,4);
        const month = YMD.substring(4,6);
        const date = YMD.substring(6,8);
        const my_calendars = await Calendar.find({
            workspace_id: req.params.id,
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
        my_calendars_sets = my_calendars.map(calendar => {
            return {
                id: "" + calendar.start_date.getFullYear() + setFixDayCount(calendar.start_date.getMonth() + 1) + setFixDayCount(calendar.start_date.getDate()),
                calendar: calendar,
            }
        });
        res.send(my_calendars_sets);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/calendar_by_id', isLoggedIn, isInWorkspace, async(req, res, next) => { // 해당 캘린더 고유 id 값으로 캘린더 조회
    try{
        const calendar = await Calendar.findOne({ // 이부분은 DB에서 데이터 뽑아서 calendar라는 변수에 저장하는 내용
            _id: req.query._id, //이부분은 DB에서 데이터 뽑아서 calendar라는 변수에 저장하는 내용
        }); // 이부분은 DB에서 데이터 뽑아서 calendar라는 변수에 저장하는 내용
        res.send(calendar); // 가지고 온 데이터 res.send()로 보내줌
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/testapi', async(req, res, next) => {
    try{
        const calendars = await Calendar.find({
            workspace_id: req.params.id,
        });
        res.send(calendars);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;