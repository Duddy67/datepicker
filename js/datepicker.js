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

    console.log(dayjs().format('YYYY-MM-DD HH:mm'));

    let elem = document.getElementById('date');
    new C_Datepicker.init(elem, {
        'autoHide': true,
        'format': 'ddd D MMM YYYY',
        'timePicker': true,
    });

    //console.log(elem.datepicker.current());
    elem.datepicker.beforeHideCalendar = function() {
         console.log('beforeHideCalendar');
    };

    elem.datepicker.afterSetDate = function(timestamp) {
         console.log('afterSetDate '+dayjs(timestamp).format('ddd D MMM YYYY'));
    };
});
