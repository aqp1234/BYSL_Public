const express = require('express');

const router = express.Router();

const Solo_Calendar = require('../schemas/solo_calendar');
const { isLoggedIn, isMySoloWorkspace, checkSoloCalendar } = require('./middlewares');

router.get('/:id', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const solo_calendars = await Solo_Calendar.find({
            solo_workspace_id: req.params.id,
        });
        solo_calendars_map = solo_calendars.map(solo_calendar => {
            return {
                id: "" + solo_calendar.start_date.getFullYear() + setFixDayCount(solo_calendar.start_date.getMonth() + 1) + setFixDayCount(solo_calendar.start_date.getDate()),
                solo_calendar: solo_calendar,
            };
        });
        res.render('solo_calendar/main', { solo_calendar_sets: solo_calendars_map });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/add', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        res.render('solo_calendar/add');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/add', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const { subject, content, start_date, end_date } = req.body;
        start_date_split = start_date.split('-');
        end_date_split = end_date.split('-');
        await Solo_Calendar.create({
            solo_workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: req.user.name,
            subject,
            content,
            start_date: new Date(start_date_split[0], start_date_split[1] - 1, start_date_split[2]),
            end_date: new Date(end_date_split[0], end_date_split[1] - 1, end_date_split[2]),
        });
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end('<script>opener.location.href="/solo/calendar/' + req.params.id + '"; window.close();</script>');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/detail/:solo_calendarid', isLoggedIn, isMySoloWorkspace, checkSoloCalendar, async(req, res, next) => {
    try{
        res.render('solo_calendar/detail');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/change/:solo_calendarid', isLoggedIn, isMySoloWorkspace, checkSoloCalendar, async(req, res, next) => {
    try{
        res.render('solo_calendar/change');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/change/:solo_calendarid', isLoggedIn, isMySoloWorkspace, checkSoloCalendar, async(req, res, next) => {
    try{
        const { subject, content, start_date, end_date } = req.body;
        start_date_split = start_date.split('-');
        end_date_split = end_date.split('-');
        await res.locals.solo_calendar.updateOne({
            $set: {
                subject,
                content,
                start_date: new Date(start_date_split[0], start_date_split[1] - 1, start_date_split[2]),
                end_date: new Date(end_date_split[0], end_date_split[1] - 1, end_date_split[2]),
                updatedAt: Date.now(),
            }
        });
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end(`<script>opener.location.href="/solo/calendar/${req.params.id}"; window.close();</script>`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id/:solo_calendarid', isLoggedIn, isMySoloWorkspace, checkSoloCalendar, async(req, res, next) => {
    try{
        await res.locals.solo_calendar.delete();
        return res.status(200).json({msg: '일정을 삭제했습니다.', url: `/solo/calendar/${req.params.id}`});
    }catch(err){
        console.error(err);
        next(err);
    }
});

// 여기부터는 개인 캘린더에 필요한 API

router.get('/:id/calendars', isLoggedIn, isMySoloWorkspace, async(req, res, next) => { // 해당 달의 모든 캘린더 가져오는 API
    try{
        const solo_calendars = await Solo_Calendar.find({
            solo_workspace_id: req.params.id,
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
            ]
        });
        solo_calendars_map = solo_calendars.map(solo_calendar => {
        return {
            id: "" + solo_calendar.start_date.getFullYear() + setFixDayCount(solo_calendar.start_date.getMonth() + 1) + setFixDayCount(solo_calendar.start_date.getDate()),
            solo_calendar: solo_calendar,
            };
        });
        solo_workspace_id = req.params.id;
        return res.status(200).send({solo_calendars_map, solo_workspace_id});
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/:id/my_calendar', isLoggedIn, isMySoloWorkspace, async(req, res, next) => { // 해당 날짜의 모든 캘린더 가져오는 API
    try{
        const YMD = req.query.YMD;
        const year = YMD.substring(0,4);
        const month = YMD.substring(4,6);
        const date = YMD.substring(6,8);
        const my_solo_calendars = await Solo_Calendar.find({
            user_id: req.user.id,
            solo_workspace_id: req.params.id,
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
        my_solo_calendars_sets = my_solo_calendars.map(solo_calendar => {
            return {
                id: "" + solo_calendar.start_date.getFullYear() + setFixDayCount(solo_calendar.start_date.getMonth() + 1) + setFixDayCount(solo_calendar.start_date.getDate()),
                solo_calendar: solo_calendar,
            }
        });
        return res.status(200).send(my_solo_calendars_sets);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/my_calendar_by_id', isLoggedIn, isMySoloWorkspace, async(req, res, next) => { // 해당 캘린더의 고유 id값으로 캘린더 조회하는 API
    try{
        const my_schedule = await Solo_Calendar.findOne({
            _id: req.query._id,
        });
        return res.status(200).send(my_schedule);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;

const setFixDayCount = (number) => {
    let fixNum = "";
    if (number < 10) {
        fixNum = "0" + number;
    } else {
        fixNum = number;
    }
    return fixNum;
};