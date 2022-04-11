const today = new Date();
let nowMonth = today.getMonth() + 1;
let nowYear = today.getFullYear();
const setCalendarBase = (year, month) => {
    let calHtml = "";
    const setDate = new Date(year, month - 1, 1);
    const firstDayName = setDate.getDay();
    const lastDay = new Date(setDate.getFullYear(),setDate.getMonth() + 1,0).getDate();
    const prevLastDay = new Date(setDate.getFullYear(),setDate.getMonth(),0).getDate();
    let todayDate = `${today.getFullYear()}${setFixDayCount(today.getMonth() + 1)}${setFixDayCount(today.getDate())}`

    let startDayCount = 1;
    let lastDayCount = 1;

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 7; j++) {
            if (i == 0 && j < firstDayName) { // 이전달 표현
                calHtml +=
                `<div class='calendar-item prevmonth'><span>${(prevLastDay - (firstDayName - 1) + j)}</span></div>`;
            }else if (i >= 0 && startDayCount <= lastDay) { // 이번달 div 추가
                let ymd = `${setDate.getFullYear()}${setFixDayCount(setDate.getMonth() + 1)}${setFixDayCount(startDayCount)}`;
                calHtml +=
                `<div class='calendar-item thismonth'><span id='${ymd}' class='calendar-span'><a id='show_detail' href='#detail' onclick='setDetailData(${ymd})'>${startDayCount++}</a></span></div>`;
            }else if (startDayCount > lastDay) { // 이번달 일수 다음부터는 다음달 내용 나오도록
                calHtml +=
                `<div class='calendar-item nextmonth'><span>${lastDayCount++}</span></div>`;
            }
        }
    }
    if (startDayCount <= lastDay){
        for (let j = 0; j < 7; j++) {
            if (startDayCount <= lastDay) { // 이번달 div 추가
                let ymd = `${setDate.getFullYear()}${setFixDayCount(setDate.getMonth() + 1)}${setFixDayCount(startDayCount)}`;
                calHtml +=
                `<div class='calendar-item thismonth'><span id='${ymd}' class='calendar-span'><a id='show_detail' href='#detail' onclick='setDetailData(${ymd})'>${startDayCount++}</a></span></div>`;
            }else if (startDayCount > lastDay) { // 이번달 일수 다음부터는 다음달 내용 나오도록
                calHtml +=
                `<div class='calendar-item nextmonth'><span>${lastDayCount++}</span></div>`;
            }
        }
    }
    document.querySelector("#calendar").insertAdjacentHTML("beforeend", calHtml);
    document.querySelector('.year-month').innerHTML = `${setDate.getFullYear()}년 ${setDate.getMonth() + 1}월`;
    if(year == today.getFullYear() && month == today.getMonth() + 1){
        document.getElementById(todayDate).className += " today";
        document.getElementById(todayDate).innerHTML += " (today)";
    }
};

const setCalendarData = async (year, month) => {
    firstdate = new Date(year,month,1);
    lastdate = new Date(year,month,0);
    await fetch(location.href + "/calendars?year=" + year + "&month=" + month)
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        data.solo_calendars_map.map(solo_calendar_sets => {
            let start_date = new Date(solo_calendar_sets.solo_calendar.start_date);
            let end_date = new Date(solo_calendar_sets.solo_calendar.end_date);
            for(let i = 0; i < Math.abs(end_date - start_date) / (1000 * 3600 * 24) + 1; i++){
                let now_date = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate() + i);
                if(now_date.getMonth() + 1 != month) continue;
                let solo_calendar_id_span = document.getElementById(`${now_date.getFullYear()}${setFixDayCount(now_date.getMonth() + 1)}${setFixDayCount(now_date.getDate())}`);
                if(solo_calendar_id_span.parentNode.childElementCount < 4){
                    let calHtml = "";
                    calHtml += `<div>
                    <a class='solo_calendar' href='#solo_calendar_layer' data-solo_calendar_id=${solo_calendar_sets.solo_calendar._id} onclick=setSoloScheduleLayerData(this) style='font-size: 13px; font-weight: bolder; color: #515151; text-decoration: none; margin-top: 10px;'>
                        ${solo_calendar_sets.solo_calendar.subject} ${i + 1}일차
                    </a>
                    </div>`;
                    solo_calendar_id_span.parentNode.insertAdjacentHTML('beforeend', calHtml);
                }else if(solo_calendar_id_span.parentNode.childElementCount < 5){
                    solo_calendar_id_span.parentNode.insertAdjacentHTML('beforeend', '<div>...</div>');
                }
            }
        });
    });
    $('.solo_calendar').on('click', function(){
        var $href = $(this).attr('href');
        calendar_layer_popup($href);
    });
};

const setSoloScheduleLayerData = async (e) => {
    await fetch(`${location.pathname}/my_calendar_by_id?_id=${e.dataset.solo_calendar_id}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('solo_calendar_id').value = data._id;
        document.getElementById('solo_calendar_subject').innerText = data.subject;
        document.getElementById('solo_calendar_content').innerText = data.content;
        document.getElementById('solo_calendar_start_date').innerText = setDateFormat(data.start_date);
        document.getElementById('solo_calendar_end_date').innerText = setDateFormat(data.end_date);
    });
};

const setDateFormat = (date) => {
    if(date.length > 9){
        const new_date = new Date(date);
        var week = ['일', '월', '화', '수', '목', '금', '토'];
        return `${new_date.getFullYear()}년 ${new_date.getMonth() + 1}월 ${new_date.getDate()}일 (${week[new_date.getDay()]})`
    }
    else{
        const new_date = new Date(date.substring(0,4), date.substring(4,6) - 1, date.substring(6,8));
        var week = ['일', '월', '화', '수', '목', '금', '토'];
        return `${new_date.getFullYear()}년 ${new_date.getMonth() + 1}월 ${new_date.getDate()}일 (${week[new_date.getDay()]})`
    }
}

const setDetailData = async(YMD) => {
    let calHtml = "";
    const detail_div = document.getElementById('detail');
    const detail_tbody = document.getElementById('detail_tbody');
    const detail_h3 = document.getElementById('detail_h3');
    const year = String(YMD).substring(0,4);
    const month = String(YMD).substring(4,6);
    const day = String(YMD).substring(6,8);
    console.log(new Date(year, month - 1, day));
    deleteDetailData();
    await fetch(location.pathname + `/my_calendar?YMD=${YMD}`)
        .then((res) => res.json())
        .then((data) => {
            data.map(solo_calendar_set => {
                calHtml += `<tr>
                <td>일정</td>
                <td>${solo_calendar_set.solo_calendar.subject} ${Math.abs(new Date(year, month - 1, day) - new Date(solo_calendar_set.solo_calendar.start_date)) / (1000 * 3600 * 24) + 1}일차</td>
                <td><div><a class='solo_calendar' href='#solo_calendar_layer' data-solo_calendar_id=${solo_calendar_set.solo_calendar._id} onclick=setSoloScheduleLayerData(this)>자세히보기</a></div></td>
                </tr>`
            });
        });
    if(calHtml == ''){
        calHtml = '<td colspan="3">일정이 없습니다.<td>';
    }
    detail_div.style.display = 'block';
    detail_tbody.insertAdjacentHTML('afterbegin', calHtml);
    detail_h3.innerText = `${year}년 ${month}월 ${day}일의 일정`;
    $('.solo_calendar').on('click', function(){
        var $href = $(this).attr('href');
        calendar_layer_popup($href);
    });
    location.href = location.pathname + '#detail';
};

function calendar_layer_popup(el){
    var $el = $(el);    //레이어의 id를 $el 변수에 저장
    var isDim = $el.prev().hasClass('solo_calendar_dimBg'); //dimmed 레이어를 감지하기 위한 boolean 변수

    isDim ? $('.solo_calendar_dim-layer').fadeIn() : $el.fadeIn();

    var $elWidth = ~~($el.outerWidth()),
        $elHeight = ~~($el.outerHeight()),
        docWidth = $(document).width(),
        docHeight = $(document).height();

    // 화면의 중앙에 레이어를 띄운다.
    if ($elHeight < docHeight || $elWidth < docWidth) {
        $el.css({
            marginTop: -$elHeight /2,
            marginLeft: -$elWidth/2
        })
    } else {
        $el.css({top: 500, left: -500});
    }

    $el.find('a.btn-close').click(function(){
        isDim ? $('.solo_calendar_dim-layer').fadeOut() : $el.fadeOut(); // 닫기 버튼을 클릭하면 레이어가 닫힌다.
        return false;
    });
    $el.find('a.btn-delete').click(function(){
        isDim ? $('.solo_calendar_dim-layer').fadeOut() : $el.fadeOut(); // 닫기 버튼을 클릭하면 레이어가 닫힌다.
        return false;
    });
    $el.find('a.btn-update').click(function(){
        isDim ? $('.solo_calendar_dim-layer').fadeOut() : $el.fadeOut(); // 닫기 버튼을 클릭하면 레이어가 닫힌다.
        return false;
    });
}

const deleteCalendarData = () => {
    var calendar = document.querySelector("#calendar");
    while(calendar.hasChildNodes()){
        calendar.removeChild(calendar.firstChild);
    }
}

const deleteDetailData = () => {
    var detail_tbody = document.querySelector('#detail_tbody');
    while(detail_tbody.hasChildNodes()){
        detail_tbody.removeChild(detail_tbody.firstChild);
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

const goTodayCalendar = () => {
    deleteCalendarData();
    history.replaceState({}, null, location.pathname);
    nowYear = today.getFullYear();
    nowMonth = today.getMonth() + 1;
    setCalendarBase(nowYear, setFixDayCount(nowMonth));
    setCalendarData(nowYear, setFixDayCount(nowMonth));
}

const goNextCalendar = () => {
    deleteCalendarData();
    history.replaceState({}, null, location.pathname);
    nowMonth++;
    if(nowMonth > 12){
        nowMonth = 1;
        nowYear++;
    }
    console.log(nowYear + " " + nowMonth);
    setCalendarBase(nowYear, setFixDayCount(nowMonth));
    setCalendarData(nowYear, setFixDayCount(nowMonth));
}

const goPrevCalendar = () => {
    deleteCalendarData();
    history.replaceState({}, null, location.pathname);
    nowMonth--;
    if(nowMonth < 1){
        nowMonth = 12;
        nowYear--;
    }
    console.log(nowYear + " " + nowMonth);
    setCalendarBase(nowYear, setFixDayCount(nowMonth));
    setCalendarData(nowYear, setFixDayCount(nowMonth));
}

const showCalendar = () => {
    if (today.getMonth() + 1 < 10) {
        setCalendarBase(today.getFullYear(), "0" + (today.getMonth() + 1));
        setCalendarData(today.getFullYear(), "0" + (today.getMonth() + 1));
    } else {
        setCalendarBase(today.getFullYear(), "" + (today.getMonth() + 1));
        setCalendarData(today.getFullYear(), "" + (today.getMonth() + 1));
    }
}

showCalendar();