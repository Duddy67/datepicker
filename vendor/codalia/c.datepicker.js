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
                  dates.push({'text': date, 'timestamp': dayjs(dayDate).valueOf(), 'month': 'previous'});
                }
            }
        }

        // Loop through the days of the current month.
        for (let i = 0; i < nbDays; i++) {
            let date = i + 1;
            let zerofill = (date < 10) ? '0' : '';
            // Generate date for each day of the month.
            let dayDate = _currentDate.slice(0, -2) + zerofill + date;
            // Check if the date is today.
            let today = (dayDate === _today) ? true : false;
            // Store the date data.
            dates.push({'text': date, 'timestamp': dayjs(dayDate).valueOf(), 'month': 'current', 'today': today});
        }

        // Compute the number of days needed to fill the calendar grid.
        const nbDaysInNextMonth = (_nbRows * _nbColumns) - dates.length;
        let nextMonth = _getNextMonth();

        // Loop through the days of the next month.
        for (let i = 0; i < nbDaysInNextMonth; i++) {
            let date = i + 1;
            let zerofill = (date < 10) ? '0' : '';
            let dayDate = nextMonth.slice(0, -2) + zerofill + date;
            let today = (dayDate === _today) ? true : false;
            dates.push({'text': date, 'timestamp': dayjs(dayDate).valueOf(), 'month': 'next', 'today': today});

            // The calendar grid is filled.
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
        let html = `<div class="datepicker datepicker-dropdown datepicker-orient-left datepicker-orient-bottom">`+
                   `<div class="datepicker-picker">`+`<div class="datepicker-header">`+`<div class="datepicker-title" style="display: none;"></div>`+
                   `<div class="datepicker-controls">`+`<button type="button" class="button prev-button prev-btn" tabindex="-1">«</button>`+
                   `<button type="button" class="button view-switch" tabindex="-1">October 2023</button>`+
                   `<button type="button" class="button next-button next-btn" tabindex="-1">»</button>`+`</div></div>`+
                   `<div class="datepicker-main"><div class="datepicker-view"><div class="days"><div class="days-of-week">`;

        _getDaysOfWeek().forEach((day) => {
            html += `<span class="dow">`+day+`</span>`;
        });

        html += `</div><div class="datepicker-grid">`;

        const dates = _getDates();
//console.log(dates);
        dates.forEach((date) => {
            let extra = (date.month != 'current') ? date.month : ''; 
            extra += (date.today) ? ' today' : ''; 
            html += `<span data-date="`+date.timestamp+`" class="datepicker-cell day `+extra+`">`+date.text+`</span>`;
        });

        html += `</div></div></div></div>`+
                `<div class="datepicker-footer"><div class="datepicker-controls">`+
                `<button type="button" class="btn btn-success" tabindex="-1" >Today</button>`+
                `<button type="button" class="btn btn-info" tabindex="-1" >Clear</button>`+
                `<button type="button" class="btn btn-danger cancel" tabindex="-1" >Cancel</button>`+
                `</div></div></div>`;

        _calendar = document.createElement('div');
        //_calendar.setAttribute('class', 'form-control');
        _calendar.insertAdjacentHTML('afterbegin', html);
        _elem.insertAdjacentElement('afterend', _calendar);
//_calendar.style.border = 'solid';
        //_calendar.querySelector('.datepicker-grid').style.border = 'solid';
    }

    const _Datepicker = function(elem) {
        //
        dayjs.extend(window.dayjs_plugin_localeData);

        //
        _elem = elem;
        //
        elem.datepicker = this;

        elem.addEventListener('click', function() {
            this.datepicker.showCalendar(); 
        });

        _renderCalendar();
        this.hideCalendar();

        _calendar.querySelectorAll('.day').forEach((day) => { 
            day.addEventListener('click', function() {
                  console.log(this);
            });
        });

        _calendar.querySelector('.cancel').addEventListener('click', function() {
            _elem.datepicker.hideCalendar();
        });
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
            _elem.datepicker.cbFunc();
            console.log('hideCalendar');
            _calendar.style.display = 'none';
        },

        cbFunc: function() {
        } 
    };

    // Returns a init property that returns the "constructor" function.
    return {
        init: _Datepicker
    }

})();

