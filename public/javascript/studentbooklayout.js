
var none = `<p></p>`;
// 소논문기록
var thesis = `
<table border="1" width="100%" style="color:#373737; letter-spacing : normal; line-height: 35px; border-collapse: collapse; border-top: 0px solid #000000; border-left:0px solid #000000; border-right:0px solid #000000; border-bottom:0px solid #000000; table-layout:fixed; word-wrap:break-word;">
    <colgroup span="6">  
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
    </colgroup>

    <tr>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">연구 과제명</td>
        <td class="input_text_head">&nbsp;</td>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">참여 인원</td>
        <td class="input_text_head">&nbsp;</td>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">연구 기간</td>
        <td class="input_text_head">&nbsp;</td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">연구의 동기 및 목적  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength0">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput0">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">연구 내용  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength1">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput1">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">연구 방법  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength2">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput2">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">기대 효과  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength3">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput3">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">연구 수행 일정  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength4">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput4">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">연구 결과  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength5">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput5">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">참고 문헌  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength6">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 100px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput6">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">느낀 점(진로와 연계)  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength7">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput7">&nbsp;</span></td>
    </tr>
</table>
`;
//수상 기록
var awards = `
<table border="1" width="100%" style="color:#373737; letter-spacing : normal; line-height: 35px; border-collapse: collapse; border-top: 0px solid #000000; border-left:0px solid #000000; border-right:0px solid #000000; border-bottom:0px solid #000000; table-layout:fixed; word-wrap:break-word;">
    <colgroup span="6">  
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
        <col span="1"  width="16.6%">
    </colgroup>

    <tr>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">주최 기관</td>
        <td class="input_text_head">&nbsp;</td>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">상훈명</td>
        <td class="input_text_head">&nbsp;</td>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">수상 결과</td>
        <td class="input_text_head">&nbsp;</td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">관련 내용  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength0">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput0">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">준비 과정  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength1">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput1">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="6" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">느낀 점(진로와 연계)  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength2">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="6"><span class="textInput" id="textInput2">&nbsp;</span></td>
    </tr>

</table>
`
//독서 기록
var bookreading = ` 
<table id="table_book" border="1" width="100%" style="color:#373737; letter-spacing : normal; line-height: 35px; border-collapse: collapse; border-top: 0px solid #000000; border-left:0px solid #000000; border-right:0px solid #000000; border-bottom:0px solid #000000; table-layout:fixed; word-wrap:break-word;">
    <colgroup span="6">  
        <col span="1"  width="25%">
        <col span="1"  width="25%">
        <col span="1"  width="25%">
        <col span="1"  width="25%">
    </colgroup>

    <tr>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">책 제목</td>
        <td class="input_text_head">&nbsp;</td>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">지은이</td>
        <td class="input_text_head">&nbsp;</td>
    </tr>

    <tr>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">읽은 기간</td>
        <td class="input_text_head">&nbsp;</td>
        <td class="text" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">출판사</td>
        <td class="input_text_head">&nbsp;</td>
    </tr>

    <tr>
        <td class="text" colspan="4" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">이 책이 다루고 있는 내용 (줄거리 요약)  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength0">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="4"><span class="textInput" id="textInput0">&nbsp;</span></td>
    </tr>

    <tr>
        <td class="text" colspan="2" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">알게 된 사실(기억에 남는 내용)  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength1">0 자 / 0 Byte</span></td>
        <td class="text" colspan="2" style="font-size: 15px; text-align: center; font-weight: bolder; background-color: #ececec;">나의 생각  <span style="color: gray; font-size: 12px;" class="textlength" id="textlength2">0 자 / 0 Byte</span></td>
    </tr>

    <tr style="height: 200px;">
        <td class="input_text_body" colspan="2"><span class="textInput" id="textInput1">&nbsp;</span></td>
        <td class="input_text_body" colspan="2"><span class="textInput" id="textInput2">&nbsp;</span></td>
    </tr>

</table>
`
var layoutarray = {'none': none, 'thesis': thesis, 'awards': awards, 'bookreading': bookreading};



function byteCounter(text) {
    let byte = 0;
    for(let i=0; i<text.length;i++) {
        if (/[ㄱ-ㅎㅏ-ㅣ가-힣一-龥ぁ-ゔァ-ヴー々〆〤]/.test(text[i])) {
            byte = byte+2
        } else {
            byte++
        }
    }
    return byte
}