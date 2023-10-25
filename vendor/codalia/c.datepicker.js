// Anonymous function with namespace.
const C_Datepicker = (function() {

    let _elem = null;
    let _calendar = null;
    let _currentDate = dayjs().format('YYYY-MM-DD');
    let _today = dayjs().format('YYYY-MM-DD');
    const _nbRows = 6;
    const _nbColumns = 7;

    function _getDaysOfWeek() {
        return dayjs.weekdaysShort();
    }

    function _getDates() {
        const dates = [];
        // Get the number of days in the current month.
        const nbDays = dayjs(_currentDate).daysInMonth();

        // Figure out what is the first day of the current month.
         const firstDateOfTheMonth = _currentDate.slice(0, -2) + '01';
        // Returns the day as a number ie: 0 => sunday, 1 => monday ... 6 => saturday. 
        const firstDayOfTheMonth = dayjs(firstDateOfTheMonth).day();

        // The last days of the previous month have to be displayed.
        if (firstDayOfTheMonth > 0) {

            let nbLastDays = 0;
            while (nbLastDays < firstDayOfTheMonth) {
                nbLastDays++;
            }

            let previousMonth = _getPreviousMonth();
            const daysInPreviousMonth = dayjs(previousMonth).daysInMonth();

            // Loop through the days of the previous month.
            for (let i = 0; i < daysInPreviousMonth; i++) {
                let date = i + 1;

                if (i > (daysInPreviousMonth - nbLastDays)) {
                  let dayDate = previousMonth.slice(0, -2) + date;
                  dates.push({'date': date, 'timestamp': dayjs(dayDate).valueOf(), 'month': 'previous'});
                }
            }
        }

        // Loop through the days of the current month.
        for (let i = 0; i < nbDays; i++) {
            let date = i + 1;
            let zerofill = (date < 10) ? '0' : '';
            // 
            let dayDate = _currentDate.slice(0, -2) + zerofill + date;
            let today = (dayDate === _today) ? true : false;
            dates.push({'date': date, 'timestamp': dayjs(dayDate).valueOf(), 'month': 'current', 'today': today});
        }

        const nbDaysInNextMonth = (_nbRows * _nbColumns) - dates.length;
        let nextMonth = _getNextMonth();

        // Loop through the days of the next month.
        for (let i = 0; i < nbDaysInNextMonth; i++) {
            let date = i + 1;
            let zerofill = (date < 10) ? '0' : '';
            let dayDate = nextMonth.slice(0, -2) + zerofill + date;
            dates.push({'date': date, 'timestamp': dayjs(dayDate).valueOf(), 'month': 'next'});

            if (i > nbDaysInNextMonth) {
                break;
            }
        }

        return dates;
    }

    function _getNextMonth() {
        const currentDate = dayjs(_currentDate);
        const nextMonth = currentDate.add(1, 'month');

        return nextMonth.format('YYYY-MM-DD');
    }

    function _getPreviousMonth() {
        const currentDate = dayjs(_currentDate);
        const previousMonth = currentDate.subtract(1, 'month');

        return previousMonth.format('YYYY-MM-DD');
    }

    function _toNextMonth() {
        _currentDate = _getNextMonth();
    }

    function _toPreviousMonth() {
        _currentDate = _getPreviousMonth();
    }

    function _renderCalendar() {
        let html = `<div class="datepicker datepicker-dropdown datepicker-orient-left datepicker-orient-bottom" style="left: 0px; top: 40px;">`+
                   `<div class="datepicker-picker">`+`<div class="datepicker-header">`+`<div class="datepicker-title" style="display: none;"></div>`+
                   `<div class="datepicker-controls">`+`<button type="button" class="button prev-button prev-btn" tabindex="-1">«</button>`+
                   `<button type="button" class="button view-switch" tabindex="-1">October 2023</button>`+
                   `<button type="button" class="button next-button next-btn" tabindex="-1">»</button>`+`</div></div>`+
                   `<div class="datepicker-main"><div class="datepicker-view"><div class="days"><div class="days-of-week">`;
//console.log(Array.isArray(_getDaysOfWeek()));
        _getDaysOfWeek().forEach((day) => {
            html += `<span class="dow">`+day+`</span>`;
        });

        html += `</div><div class="datepicker-grid">`;

        const dates = _getDates();
        console.log(dates);

        _calendar = document.createElement('div');
        _calendar.setAttribute('class', 'form-control');
        const message = document.createTextNode('CALENDAR');
        _calendar.appendChild(message);
        _elem.insertAdjacentElement('afterend', _calendar);
    }

    const _Datepicker = function(elem) {
        _elem = elem;
        elem.datepicker = this;
        elem.addEventListener('click', function() {
            this.datepicker.showCalendar(); 
        });

        _renderCalendar();
        this.hideCalendar();
    };

    _Datepicker.prototype = {
        current: function() {
            return dayjs().format();
        },

        showCalendar: function() {
            console.log('showCalendar');
            _calendar.style.display = 'block';
        },

        hideCalendar: function() {
            console.log('hideCalendar');
            _calendar.style.display = 'none';
        }
    };

    // Returns a init property that returns the "constructor" function.
    return {
        init: _Datepicker
    }

})();

