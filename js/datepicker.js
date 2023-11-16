document.addEventListener('DOMContentLoaded', () => {

    /*console.log(dayjs().format('YYYY-MM'));
    console.log(dayjs('2019-02-15').daysInMonth());
    console.log('month: '+dayjs().month());
    console.log('day: '+dayjs('2023-10-24').day());
    console.log(dayjs.weekdaysShort());
    let timestamp = dayjs('2023-10-01').valueOf();
    console.log(timestamp);
    console.log(dayjs(timestamp).format("YYYY-MM-DD"));
    const a = dayjs('2019-01-31');
    const b = a.subtract(1, 'month');
    console.log(b.format('YYYY-MM-DD'));
    console.log(dayjs('2023-09-21').format('YYYY-MM')+'-01');*/

    //console.log(dayjs('2010-01-01').isBefore(dayjs('2011-01-01')));
    //console.log(dayjs('2023-01').subtract(1, 'month').format('YYYY-MM'));
    //console.log(dayjs('2019-02').daysInMonth());
    let num = '01';
    let next = Number(num) + 1;
    next = next < 10 ? '0' + next : next;
    let previous = dayjs('2023-5').subtract(1, 'month').format('YYYY-MM');
    //console.log(dayjs('2011-1-1').isSame(dayjs('2011-01-01', 'day')));
    console.log(dayjs(1694556000000).format('YYYY-MM-DD'));
    //console.log('day: '+dayjs('2023-10-2 15:54').format('D MM YYYY hh:mm'));


    //let elem = document.getElementById('date');
    let elems = document.querySelectorAll('.date');

    for (let i = 0; i < elems.length; i++) {
        elems[i].datepicker = new C_Datepicker.init(elems[i], {
            'ID': i,
            'autoHide': true,
            'format': 'ddd D MMM YYYY HH:mm',
            //'timePicker': true,
            'showDropdowns': true,
            'timePicker24Hour': true,
            //'minDate': '2022-05-10',
            //'maxDate': '2022-07-30',
            //'daysOfWeekDisabled': [3,4],
            //'datesDisabled': ['2023-05-05', '2023-08-15'],
            'displayTodaysDate': true,
            'today': true,
            'clear': true,
            'cancel': true,
            'locale': 'fr',
        }, afterInit);
    }

    function afterInit(datepicker, startDate) {
         //console.log(datepicker.host);
         //datepicker.setParams({'timePicker': false, 'showDropdowns': false});
         //datepicker.render();
         //datepicker.startDate('2023-09-27 15:22');
         //datepicker.startingDate = '2023-09-27 00:42';
         //elem.value = param;
    }

    console.log(elems[0]);
    //console.log(elems[1].getHost());
    document.addEventListener('beforeSetDate', function(evt) {
        //console.log(dayjs(evt.detail).format('YYYY-MM-DD'));
        console.log(evt.detail);
    }, false);

    document.addEventListener('afterSetDate', function(evt) {
        //console.log(dayjs(evt.detail).format('YYYY-MM-DD'));
        //console.log('afterSetDate');
        console.log(evt.detail);
    }, false);

    document.addEventListener('beforeClear', function(evt) {
        console.log(evt.detail);
    }, false);

    document.addEventListener('afterClear', function(evt) {
        console.log(evt.detail);
    }, false);

    document.addEventListener('beforeToday', function(evt) {
        console.log(evt.detail);
    }, false);

    document.addEventListener('afterToday', function(evt) {
        console.log(evt.detail);
    }, false);
});
