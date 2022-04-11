var mongoose = require('mongoose');
//여기는 회의록(=게시판) 글 생성 용 파일임!@!@!@!
var postSchema=mongoose.Schema({
    title:{type:String, required:true},
    body:{type:String, required:true},
    author:{type:mongoose.Schema.Types.ObjectId,ref:'user_id',required:true},
    createdDate:{type:Date, default:Date.now}, //만들어진 시각 받아오는거
    updateDate:{type:Date} //수정 시각인데 수정하는거 아직 안만듦
});

var Post=mongoose.model('post',postSchema);
module.exports=Post;
