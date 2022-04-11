const express=require('express');
const router=express.Router();

const Post=require('../models/conferense_post');

//위가 라우트로 모델 파일에 있는 포스트 파일과 연결한 부분

//게시판 리스트 필요
//router.get('/list/:page', function(req,res,next){
//    const page=req.params.page;
    
//})

// 안쓰는 js 파일!!!!!!!!!!!!!!!!!!





router.get('/', function(req,res){
    Post.find({})
        .populate('author')
        .sort('-createdDate')
        .exec(function(err,posts){
            if(err) return res.json(err);
            res.render('deul/conference', {posts:posts});
        });
});//이게디폴트 게시판 쌓이는 거 어케 표현할지 부분~
// conference.js 파일에서 router.get('/', async(req, res, next) => 부분 으로 옮김)


router.post('/',function(req,res){
    req.body.author=req.user_id;
    Post.create(req.body,function(err,post){
        if(err){
            req.flash('conference',req.body);
            req.flash('errors',util.parseError(err));
            return res.redirect('/conference/new');
        }
        res.redirect('/confernce');
    });
}); //새로 만들때
// conference.js 파일에서 router.post('/:id/add') 로 옮김


router.get('/:id',function(req,res){
    Post.findOne({_id:req.params.id})
        .populate('author')
        .exec(function(err,post){
            if(err) return res.json(err);
            res.render('posts/show',{post:post});
        });
}); //조회하는 거
// conference.js 파일에서 router.get('/:id/detail/:conferenceid) 로 옮김

router.get('/new',function(req,res){
    res.router('posts/new');
});
// 요건 뭔지 모르겠다.

module.exports=router;

// 전부 conference.js 파일로 옮겨서 이 conference_post_main.js 는 삭제 필요