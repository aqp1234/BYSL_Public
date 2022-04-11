const User_Workspace = require("../models/user_workspace");
const Solo_Workspace = require("../models/solo_workspace");
const Group_Permission = require('../models/group_permission');
const Permission = require('../models/permission');
const Studentbook = require("../schemas/studentbook");
const Solo_Calendar = require('../schemas/solo_calendar');
const Staffinvite = require('../schemas/staffinvite');
const Coverletter = require('../schemas/coverletter');

exports.isLoggedIn = (req, res, next) => { // 로그인 됬는지 확인
    if (req.isAuthenticated()) {
        next();
    } else {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end(`<script>alert("로그인이 필요합니다."); location.href="/auth/login?next=${req.originalUrl}"</script>`);
    }
};

exports.isInWorkspace = async (req, res, next) => { // 팀 워크스페이스에 있는 사람인지 확인
    try {
        const myWorkspace = await User_Workspace.findOne({
            where: {
              user_id: req.user.id,
              workspace_id: req.params.id,
            },
        });
        if (myWorkspace) {
            res.locals.user_workspace = myWorkspace;
            next();
        } else {
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('<script>alert("본인의 워크스페이스만 접속 가능합니다."); location.href="/"</script>');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.isNotInWorkspace = async (req, res, next) => { // 팀 워크스페이스에 없을 사람인지 확인
    try {
        const myWorkspace = await User_Workspace.findOne({
            where: {
                user_id: req.user.id,
                workspace_id: req.params.id,
            },
        });
        if (myWorkspace) {
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end(`<script>alert("이미 워크스페이스에 가입된 아이디입니다."); location.href="/workspace/${req.params.id}"</script>`);
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.isMySoloWorkspace = async (req, res, next) => { // 초대받은 사람인지 또는 내 솔로 워크스페이스인지 확인
    try {
        const staff = await Staffinvite.findOne({
            url: req.originalUrl,
            staff_id: req.user.id,
        });
        if(staff){
            next();
        }else{
            const mySoloWorkspace = await Solo_Workspace.findOne({
                where: {
                    user_id: req.user.id,
                    id: req.params.id,
                },
            });
            if (mySoloWorkspace) {
                res.locals.solo_workspace = mySoloWorkspace;
                next();
            } else {
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end('<script>alert("본인의 워크스페이스만 접속 가능합니다."); location.href="/"</script>');
            }
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.checkStudentbook = async(req, res, next) => { // Studentbook 체크할때 
    try{
        if(!req.params.studentbookid.match(/^[0-9a-fA-F]{24}$/)){ // studentbookid 가 24길이의 12바이트 스트링인지 정규식으로 확인
            res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end(`<script>alert("잘못된 접근입니다."); location.href="/solo/studentbook/${req.params.id}"</script>`);
        }else{
            const studentbook = await Studentbook.findOne({
                _id: req.params.studentbookid,
            });
            if(!studentbook){ // 학생부가 없을때
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(`<script>alert("삭제된 학생부입니다."); location.href="/solo/studentbook/${req.params.id}"</script>`);
            }
            res.locals.studentbook = studentbook;
            next();
        }   
    }catch(err){
        console.error(err);
        next(err);
    }
};

exports.checkCoverletter = async(req, res, next) => {
    try{
        if(!req.params.coverletterid.match(/^[0-9a-fA-F]{24}$/)){
            res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end(`<script>alert("잘못된 접근입니다."); location.href="/solo/coverletter/${req.params.id}"</script>`);
        }else{
            const coverletter = await Coverletter.findOne({
                _id: req.params.coverletterid,
            });
            if(!coverletter){ // 학생부가 없을때
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(`<script>alert("삭제된 학생부입니다."); location.href="/solo/coverletter/${req.params.id}"</script>`);
            }
            res.locals.coverletter = coverletter;
            next();
        }   
    }catch(err){
        console.error(err);
        next(err);
    }
};

exports.checkSoloCalendar = async(req, res, next) => { // solocalendar 체크할때
    try{
        if(!req.params.solo_calendarid.match(/^[0-9a-fA-F]{24}$/)){
            res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end(`<script>alert("잘못된 접근입니다."); location.href="/solo/calendar/${req.params.id}"</script>`);
        }else{
            const solo_calendar = await Solo_Calendar.findOne({
                _id: req.params.solo_calendarid,
            });
            if(!solo_calendar){ // 학생부가 없을때
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(`<script>alert("삭제된 일정입니다."); location.href="/solo/calendar/${req.params.id}"</script>`);
            }else if(solo_calendar.user_id != req.user.id){ // 학생부는 찾았으나 본인의 학생부가 아닐때
                res.writeHead(401, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(`<script>alert("본인의 일정에만 접근 가능합니다."); location.href="/solo/calendar/${req.params.id}"</script>`);
            }else if(solo_calendar.solo_workspace_id != req.params.id){ // 본인의 학생부이지만 다른 워크스페이스일때 잘못된 접근
                res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(`<script>alert("잘못된 접근입니다."); location.href="/solo/calendar/${req.params.id}"</script>`);
            }
            res.locals.solo_calendar = solo_calendar;
            next();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
};

exports.checkPermissions = async(req, res, next) => {
    try{
        const ex_user_workspace = await User_Workspace.findOne({
            where: {
                user_id: req.user.id,
            }
        });
        const permissions = await Group_Permission.findAll({
            where: {
                group_id: ex_user_workspace.group_id,
            }
        });
        res.locals.permissions = permissions;
        next();
    }catch(err){
        console.error(err);
        next(err);
    }
}

exports.checkPermission = (permission_id) => {
    return async function(req, res, next) {
        const ex_user_workspace = await User_Workspace.findOne({
            where: {
                user_id: req.user.id,
                workspace_id: req.params.id,
            }
        });
        const permission = await Group_Permission.findOne({
            where: {
                group_id: ex_user_workspace.group_id,
                permission_id: permission_id,
            }
        });
        if(permission){
            next();
        }else{
            const err = new Error("권한이 없습니다.");
            err.status = 401;
            next(err);
        }
    }
}