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
                `<div class='calendar-item thismonth'><span id='${ymd}' 
                class='calendar-span'><a id='show_detail' href='#detail' onclick='setDetailData(${ymd})'>${startDayCount++}</a></span></div>`;
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
                `<div class='calendar-item thismonth'><span id='${ymd}' 
                class='calendar-span'><a id='show_detail' href='#detail' onclick='setDetailData(${ymd})'>${startDayCount++}</a></span></div>`;
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
        document.getElementById(todayDate).innerHTML += " TODAY";
    }
};

const setCalendarData = () => {
    switch(document.querySelector('.selected').id){
        case 'meal_schedule':
            setMealData(nowYear, setFixDayCount(nowMonth));
            setScheduleData(nowYear, setFixDayCount(nowMonth));
            break;
        case 'all_schedule':
            setMyScheduleData(nowYear, setFixDayCount(nowMonth));
            break;
    }
}

const setMealData = async(year, month) => {
    await fetch(location.pathname + `lunch_meals?year=${year}&month=${month}`)
        .then((res) => res.json())
        .then((data) => {
            if(data.hasOwnProperty('RESULT')){
                return;
            }
            switch(data.mealServiceDietInfo[0].head[1].RESULT.CODE){
                case 'INFO-000':
                    const meal_sets = data.mealServiceDietInfo[1].row;
                    meal_sets.map(meal_set => {
                        let calHtml = "";
                        calHtml += `<div><a class='meal' href='#meal_layer' style='font-size: 13px; font-weight: bolder; color: #515151; text-decoration: none; margin-top: 10px;' onclick=setLunchMealLayerData(${meal_set.MLSV_YMD})>중식</a></div>`;
                        document.getElementById(`${meal_set.MLSV_YMD}`).parentNode.insertAdjacentHTML('beforeend', calHtml);
                    });
                    break;
            }
        });
    $('.meal').on('click', function(){
        var $href = $(this).attr('href');
        meal_layer_popup($href);
    });
};

const setLunchMealLayerData = async(YMD) => {
    await fetch(location.pathname + `lunch_meal?YMD=${YMD}`)
        .then((res) => res.json())
        .then((data) => {
            if(data.hasOwnProperty('RESULT')){
                return;
            }
            switch(data.mealServiceDietInfo[0].head[1].RESULT.CODE){
                case 'INFO-000':
                    data = data.mealServiceDietInfo[1].row[0];
                    document.getElementById('meal_type').innerText = data.MMEAL_SC_NM;
                    document.getElementById('meal_ymd').innerText = setDateFormat(data.MLSV_YMD);
                    document.getElementById('meal_diet').innerText = data.DDISH_NM.replace(/<br\/>/ig, '\n');
                    document.getElementById('meal_cal').innerText = data.CAL_INFO;
                    document.getElementById('meal_origin').innerText = data.ORPLC_INFO.replace(/<br\/>/ig, '\t');;
                    document.getElementById('meal_ntr').innerText = data.NTR_INFO.replace(/<br\/>/ig, '\t');;
                    break;
            };
        });
}

const setScheduleData = async(year, month) => {
    await fetch(location.pathname + `schedules?year=${year}&month=${month}`)
        .then((res) => res.json())
        .then((data) => {
            if(data.hasOwnProperty('RESULT')){
                return;
            }
            switch(data.SchoolSchedule[0].head[1].RESULT.CODE){
                case 'INFO-000':
                    let lastYMD = "";
                    const schedule_sets = data.SchoolSchedule[1].row;
                    schedule_sets.map((schedule_set) => {
                        let calHtml = "";
                        if(lastYMD != `${schedule_set.AA_YMD}`){
                            lastYMD = `${schedule_set.AA_YMD}`;
                            calHtml += `<div><a class='schedule' href='#schedule_layer' style='font-size: 13px; font-weight: bolder; color: #515151; text-decoration: none; margin-top: 10px;' onclick=setScheduleLayerData(${schedule_set.AA_YMD})>학사일정</a></div>`;
                            document.getElementById(`${schedule_set.AA_YMD}`).parentNode.insertAdjacentHTML('beforeend', calHtml);
                        }
                    });
                    break;
            }
        });
    $('.schedule').on('click', function(){
        var $href = $(this).attr('href');
        schedule_layer_popup($href);
    });
};

const setScheduleLayerData = async(YMD) => {
    await fetch(location.pathname + `schedule?YMD=${YMD}`)
    .then((res) => res.json())
    .then((data) => {
        if(data.hasOwnProperty('RESULT')){
            return;
        }
        switch(data.SchoolSchedule[0].head[1].RESULT.CODE){
            case 'INFO-000':
                var ay = "";
                var ymd = "";
                var event_nm = "";
                var sbtr = "";
                data.SchoolSchedule[1].row.map(data => {
                    if(data.ONE_GRADE_EVENT_YN != '*') ay += '1,';
                    if(data.TW_GRADE_EVENT_YN != '*') ay += '2,';
                    if(data.THREE_GRADE_EVENT_YN != '*') ay += '3';
                    ay += '\n';
                    ymd = data.AA_YMD;
                    event_nm += data.EVENT_NM;
                    event_nm += '\n'
                    sbtr += data.SBTR_DD_SC_NM;
                    sbtr += '\n';
                });
                document.getElementById('schedule_ay').innerText = ay;
                document.getElementById('schedule_ymd').innerText = setDateFormat(ymd);
                document.getElementById('schedule_nm').innerText = event_nm;
                document.getElementById('schedule_sbtr').innerText = sbtr;
                break;
        }
    });
}

const setMyScheduleData = async(year, month) => {
    await fetch(location.pathname + `my_schedules?year=${year}&month=${month}`)
    .then((res) => res.json())
    .then((data) => {
        data.map((my_schedule) => {
            let start_date = new Date(my_schedule.schedule.start_date);
            let end_date = new Date(my_schedule.schedule.end_date);
            for(let i = 0; i < Math.abs(end_date - start_date) / (1000 * 3600 * 24) + 1; i++){
                let now_date = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate() + i);
                if(now_date.getMonth() + 1 != month) continue;
                let schedule_id_span = document.getElementById(`${now_date.getFullYear()}${setFixDayCount(now_date.getMonth() + 1)}${setFixDayCount(now_date.getDate())}`);
                if(schedule_id_span.parentNode.childElementCount < 4){
                    let calHtml = "";
                    // calHtml += `<div>
                    // <a class='my_schedule' href='/calendar/${my_schedule.schedule.workspace_id}/detail/${my_schedule.schedule._id}' style='font-size: 5px'>
                    //     ${my_schedule.schedule.subject} ${i + 1}일차
                    // </a>
                    // </div>`;
                    calHtml += `<div>
                    <a class='my_schedule' href='#my_schedule_layer' style='font-size: 13px; font-weight: bolder; color: #515151; text-decoration: none; margin-top: 10px;' data-schedule_id=${my_schedule.schedule._id} onclick="setMyScheduleLayerData(this)">
                        ${my_schedule.schedule.subject} ${i + 1}일차
                    </a>
                    </div>`;
                    schedule_id_span.parentNode.insertAdjacentHTML('beforeend', calHtml);
                }else if(schedule_id_span.parentNode.childElementCount < 5){
                    schedule_id_span.parentNode.insertAdjacentHTML('beforeend', '<div>...</div>');
                }
            }
        })
    });
    $('.my_schedule').on('click', function(){
        var $href = $(this).attr('href');
        my_schedule_layer_popup($href);
    });
};

const setMyScheduleLayerData = async(e) => {
    await fetch(location.pathname + `my_schedule_by_id?_id=${e.dataset.schedule_id}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('my_schedule_workspacename').innerText = data.workspace.workspacename;
        document.getElementById('my_schedule_subject').innerText = data.my_schedule.subject;
        document.getElementById('my_schedule_content').innerText = data.my_schedule.content;
        document.getElementById('my_schedule_start_date').innerText = setDateFormat(data.my_schedule.start_date);
        document.getElementById('my_schedule_end_date').innerText = setDateFormat(data.my_schedule.end_date);
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
    deleteDetailData();
    switch(document.querySelector('.selected').id){
        case 'meal_schedule':
            await fetch(location.pathname + `lunch_meal?YMD=${YMD}`)
                .then((res) => res.json())
                .then((data) => {
                    if(data.hasOwnProperty('RESULT')){
                        return;
                    }
                    switch(data.mealServiceDietInfo[0].head[1].RESULT.CODE){
                        case 'INFO-000':
                            data = data.mealServiceDietInfo[1].row[0];
                            calHtml += `<tr>
                            <td>중식</td>
                            <td>${data.DDISH_NM.replace(/<br\/>/ig, '\n')}</td>
                            <td>
                            <div><a class='meal' href='#meal_layer' onclick=setLunchMealLayerData(${YMD})>자세히보기</a></div>
                            </td>
                            </tr>`;
                            break;
                    }
                });
            await fetch(location.pathname + `schedule?YMD=${YMD}`)
                .then((res) => res.json())
                .then((data) => {
                    if(data.hasOwnProperty('RESULT')){
                        return;
                    }
                    switch(data.SchoolSchedule[0].head[1].RESULT.CODE){
                        case 'INFO-000':
                            let event_nm = "";
                            data.SchoolSchedule[1].row.map(data => {
                                event_nm += data.EVENT_NM;
                                event_nm += '  '
                            });
                            calHtml += `<tr>
                            <td>학사일정</td>
                            <td>${event_nm}</td>
                            <td>
                            <div><a class='schedule' href='#schedule_layer' onclick=setScheduleLayerData(${YMD})>자세히보기</a></div>
                            </td>
                            </tr>`;
                            break;
                    } 
                });
            break;
        case 'all_schedule':
            await fetch(location.pathname + `my_schedule?YMD=${YMD}`)
                .then((res) => res.json())
                .then((data) => {
                    data.map(schedule_set => {
                        calHtml += `<tr>
                        <td>일정</td>
                        <td>${schedule_set.schedule.subject} ${Math.abs(new Date(year, month - 1, day) - new Date(schedule_set.schedule.start_date)) / (1000 * 3600 * 24) + 1}일차</td>
                        <td><div><a class='my_schedule' href='#my_schedule_layer' data-schedule_id=${schedule_set.schedule._id} onclick=setMyScheduleLayerData(this)>자세히보기</a></div></td>
                        </tr>`
                    });
                });
            break;
    }
    if(calHtml == ''){
        calHtml = '<td colspan="3">일정이 없습니다.<td>';
    }
    detail_div.style.display = 'block';
    detail_tbody.insertAdjacentHTML('afterbegin', calHtml);
    detail_h3.innerText = `${year}년 ${month}월 ${day}일의 일정`;
    $('.meal').on('click', function(){
        var $href = $(this).attr('href');
        meal_layer_popup($href);
    });
    $('.schedule').on('click', function(){
        var $href = $(this).attr('href');
        schedule_layer_popup($href);
    });
    $('.my_schedule').on('click', function(){
        var $href = $(this).attr('href');
        my_schedule_layer_popup($href);
    });
    location.href = location.pathname + '#detail';
};

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
    setCalendarData();
}

const goNextCalendar = () => {
    deleteCalendarData();
    history.replaceState({}, null, location.pathname);
    nowMonth++;
    if(nowMonth > 12){
        nowMonth = 1;
        nowYear++;
    }
    setCalendarBase(nowYear, setFixDayCount(nowMonth));
    setCalendarData();
}

const goPrevCalendar = () => {
    deleteCalendarData();
    history.replaceState({}, null, location.pathname);
    nowMonth--;
    if(nowMonth < 1){
        nowMonth = 12;
        nowYear--;
    }
    setCalendarBase(nowYear, setFixDayCount(nowMonth));
    setCalendarData();
}

function meal_layer_popup(el){
    var $el = $(el);    //레이어의 id를 $el 변수에 저장
    var isDim = $el.prev().hasClass('meal_dimBg'); //dimmed 레이어를 감지하기 위한 boolean 변수

    isDim ? $('.meal_dim-layer').fadeIn() : $el.fadeIn();

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
        isDim ? $('.meal_dim-layer').fadeOut() : $el.fadeOut(); // 닫기 버튼을 클릭하면 레이어가 닫힌다.
        return false;
    });
}

function schedule_layer_popup(el){
    var $el = $(el);    //레이어의 id를 $el 변수에 저장
    var isDim = $el.prev().hasClass('schedule_dimBg'); //dimmed 레이어를 감지하기 위한 boolean 변수

    isDim ? $('.schedule_dim-layer').fadeIn() : $el.fadeIn();

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
        isDim ? $('.schedule_dim-layer').fadeOut() : $el.fadeOut(); // 닫기 버튼을 클릭하면 레이어가 닫힌다.
        return false;
    });
}

function my_schedule_layer_popup(el){
    var $el = $(el);    //레이어의 id를 $el 변수에 저장
    var isDim = $el.prev().hasClass('my_schedule_dimBg'); //dimmed 레이어를 감지하기 위한 boolean 변수

    isDim ? $('.my_schedule_dim-layer').fadeIn() : $el.fadeIn();

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
        isDim ? $('.my_schedule_dim-layer').fadeOut() : $el.fadeOut(); // 닫기 버튼을 클릭하면 레이어가 닫힌다.
        return false;
    });
}

const btn_MealSchedule = (e) => {
    document.querySelector('.selected').classList.remove('selected')
    e.classList.add('selected');
    deleteCalendarData();
    setCalendarBase(nowYear, setFixDayCount(nowMonth));
    setCalendarData();
}

const btn_AllSchedule = (e) => {
    document.querySelector('.selected').classList.remove('selected')
    e.classList.add('selected');
    deleteCalendarData();
    setCalendarBase(nowYear, setFixDayCount(nowMonth));
    setCalendarData();
}

const showCalendar = () => {
    if (today.getMonth() + 1 < 10) {
        setCalendarBase(today.getFullYear(), "0" + (today.getMonth() + 1));
        setCalendarData();
    } else {
        setCalendarBase(today.getFullYear(), "" + (today.getMonth() + 1));
        setCalendarData();
    }
}

history.replaceState({}, null, location.pathname);
showCalendar();