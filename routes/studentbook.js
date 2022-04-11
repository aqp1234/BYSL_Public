const express = require('express');

const Studentbook = require('../schemas/studentbook');
const StudentbookComment = require('../schemas/studentbookcomment');
const { isLoggedIn, isMySoloWorkspace, checkStudentbook } = require('./middlewares');

const router = express.Router();

router.get('/:id', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const studentbooks = await Studentbook.find({
            solo_workspace_id: req.params.id,
            user_id: req.user.id,
        });
        return res.render('studentbook/main', { studentbooks });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/add', isLoggedIn, isMySoloWorkspace, async(req, res, next) =>{
    try{
        return res.render('studentbook/add');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/add', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const { subject, content } = req.body;
        const studentbook = await Studentbook.create({
            solo_workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: req.user.name,
            subject,
            content,
        });
        return res.redirect(`/solo/studentbook/${req.params.id}/${studentbook._id}`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/:studentbookid', isLoggedIn, isMySoloWorkspace, checkStudentbook, async(req, res, next) => {
    try{
        const comments = await StudentbookComment.find({
            studentbook_id: req.params.studentbookid,
            solo_workspace_id: req.params.id,
        });
        return res.render('studentbook/detail', { comments });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id/:studentbookid', isLoggedIn, isMySoloWorkspace, checkStudentbook, async(req, res, next) => {
    try{
        res.locals.studentbook.delete();
        return res.status(200).send({ msg: '삭제가 완료되었습니다.' });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post("/:id/:studentbookid/comment", isLoggedIn, async(req, res, next) => {
    try{
        await StudentbookComment.create({
            solo_workspace_id: req.params.id,
            studentbook_id: req.params.studentbookid,
            user_id: req.user.id,
            user_name: req.user.name,
            comment: req.body.comment,
            is_deleted: false,
        });
        res.redirect(`/solo/studentbook/${req.params.id}/${req.params.studentbookid}`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.put("/:id/:studentbookid/comment/:commentid", isLoggedIn, async(req, res, next) => {
    try{
        const { comment } = req.body;
        console.log(req.body);
        await StudentbookComment.updateOne({
            _id: req.params.commentid,
        }, {
            $set: {
                comment,
                updatedAt: Date.now(),
            }
        });
        res.status(200).send({ msg: '정상적으로 댓글이 수정되었습니다.', url: "" });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete("/:id/:studentbookid/comment/:commentid", isLoggedIn, async(req, res, next) => {
    try{
        await StudentbookComment.deleteOne({
            _id: req.params.commentid,
        });
        res.status(200).send({ msg: '정상적으로 삭제되었습니다.', url: "" });
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/:id/change/:studentbookid', isLoggedIn, isMySoloWorkspace, checkStudentbook, async(req, res, next) => {
    try{
        return res.render('studentbook/change');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post("/:id/change/:studentbookid", isLoggedIn, isMySoloWorkspace, checkStudentbook, async(req, res, next) => {
    try{
        const { subject, content } = req.body;
        await res.locals.studentbook.updateOne({
            $set: {
                subject,
                content,
                updatedAt: Date.now(),
            }
        }).exec();
        return res.redirect(`/solo/studentbook/${req.params.id}/${req.params.studentbookid}`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;