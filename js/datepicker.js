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
    //console.log(dayjs('2023-10-2').format('YYYY-MM-DD'));
    console.log('day: '+dayjs('2023-10-2 15:54').format('D MM YYYY hh:mm'));


    let elem = document.getElementById('date');

    elem.datepicker = new C_Datepicker.init(elem, {
        'autoHide': true,
        'format': 'ddd D MMM YYYY',
        'timePicker': true,
        'showDropdowns': true,
        //'timePicker24Hour': true,
        //'minDate': '2022-05-10',
        //'maxDate': '2022-07-30',
        'daysOfWeekDisabled': [3,4],
        'datesDisabled': ['2023-05-05', '2023-08-15'],
        'displayTodaysDate': true,
    }, afterInit);

    function afterInit(datepicker) {
         console.log(datepicker.host);
         datepicker.setParam('timePicker', false);
         datepicker.render();
         //datepicker.startDate('2023-11-27');
         //elem.value = param;
    }

    document.addEventListener('beforeSetDate', function(evt) {
        //console.log(dayjs(evt.detail).format('YYYY-MM-DD'));
        console.log('beforeSetDate');
    }, false);

    document.addEventListener('afterSetDate', function(evt) {
        //console.log(dayjs(evt.detail).format('YYYY-MM-DD'));
        console.log('afterSetDate');
    }, false);
});
