// Anonymous function with namespace.
const C_Datepicker = (function() {

    const _nbRows = 6;
    const _nbColumns = 7;
    const _params = {};
    const _minutes = 59;
    const _hours = 23;
    let _elem = null;
    let _calendar = null;
    let _selectedDate = null;
    let _currentDate = dayjs().format('YYYY-MM-DD');
    let _today = dayjs().format('YYYY-MM-DD');

    function _setParams(params) {
        _params.autoHide = params.autoHide === undefined ? false : params.autoHide;
        _params.timePicker = params.timePicker === undefined ? false : params.timePicker;
        // Set the default format.
        let format = _params.timePicker ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
        _params.format = params.format === undefined ? format : params.format;
        _params.showDropdowns = params.showDropdowns === undefined ? false : params.showDropdowns;
    }

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
            let today = dayDate === _today ? true : false;
            dates.push({'text': date, 'timestamp': dayjs(dayDate).valueOf(), 'month': 'next', 'today': today});

            // The calendar grid is filled.
            if (i > nbDaysInNextMonth) {
                break;
            }
        }

        return dates;
    }

    function _setDate(timestamp) {
        // Make sure the given timestamp is of the type number. (Note: add a plus sign to convert into number).
        timestamp = typeof timestamp != 'number' ? +timestamp : timestamp;
    console.log('_setDate '+dayjs(timestamp).format('YYYY-MM-DD'));
        _elem.value = dayjs(timestamp).format(_params.format);
        _elem.datepicker.afterSetDate(timestamp);
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
console.log(_currentDate);
    }

    function _toPreviousMonth() {
        _currentDate = _getPreviousMonth();
console.log(_currentDate);
    }

    function _renderCalendar() {
        let html = `<div class="datepicker datepicker-dropdown datepicker-orient-left datepicker-orient-bottom">`+
                   `<div class="datepicker-picker">`+`<div class="datepicker-header">`+`<div class="datepicker-title" style="display: none;"></div>`+
                   `<div class="datepicker-controls">`+`<button type="button" class="button prev-button prev-btn" tabindex="-1">«</button>`+
                   `<button type="button" class="button view-switch" tabindex="-1">`+dayjs(_currentDate).format('MMMM YYYY')+`</button>`+
                   `<button type="button" class="button next-button next-btn" tabindex="-1">»</button>`+`</div></div>`+
                   `<div class="datepicker-main"><div class="datepicker-view"><div class="days"><div class="days-of-week">`;

        _getDaysOfWeek().forEach((day) => {
            html += `<span class="dow">`+day+`</span>`;
        });

        html += `</div><div class="datepicker-grid">`;

        const dates = _getDates();
        dates.forEach((date) => {
            let extra = (date.month != 'current') ? date.month : ''; 
            extra += (date.today) ? ' today' : ''; 
            html += `<span data-date="`+date.timestamp+`" class="datepicker-cell date `+extra+`">`+date.text+`</span>`;
        });

        html += `</div></div></div></div>`+
                `<div class="datepicker-footer">`;

        // Build the time drop down lists.
        if (_params.timePicker) {
            let time = dayjs().format('H:m');
            time = time.split(':');

            html += `<div class="datepicker-time"><select name="hours" class="hours">`;

            for (let i = 0; i < _hours; i++) {
                let selected = i == time[0] ? 'selected' : '';
                html += `<option value="`+i+`" `+selected+`>`+i+`</option>`;
            }

            html += `</select><select name="minutes" class="minutes">`;

            for (let i = 0; i < _minutes; i++) {
                let selected = i == time[1] ? 'selected' : '';
                html += `<option value="`+i+`" `+selected+`>`+i+`</option>`;
            }

            html += `</select></div>`;

        }

        html += `<div class="datepicker-controls">`+
                `<button type="button" class="btn btn-success" tabindex="-1" >Today</button>`+
                `<button type="button" class="btn btn-info" tabindex="-1" >Clear</button>`+
                `<button type="button" class="btn btn-danger cancel" tabindex="-1" >Cancel</button>`+
                `</div></div></div>`;

        return html;
    }

    function _updateCalendar() {
        _calendar.querySelector('.view-switch').innerHTML = dayjs(_currentDate).format('MMMM YYYY');

        const dates = _getDates();
        let grid = '';

        dates.forEach((date) => {
            let extra = (date.month != 'current') ? date.month : ''; 
            extra += (date.today) ? ' today' : ''; 
            grid += `<span data-date="`+date.timestamp+`" class="datepicker-cell date `+extra+`">`+date.text+`</span>`;
        });

        _calendar.querySelector('.datepicker-grid').innerHTML = grid;
    }

    const _Datepicker = function(elem, params) {
        _setParams(params);
        //
        dayjs.extend(window.dayjs_plugin_localeData);

        //
        _elem = elem;
        //
        elem.datepicker = this;


        elem.addEventListener('click', function() {
            this.datepicker.showCalendar(); 
        });

        // Create a div container for the calendar.
        _calendar = document.createElement('div');
        // Insert the calendar in the container.
        _calendar.insertAdjacentHTML('afterbegin', _renderCalendar());
        // Insert the div container after the given element.
        _elem.insertAdjacentElement('afterend', _calendar);

        this.hideCalendar();

        // Use event delegation to check whenever a date in the calendar grid is clicked.
        document.body.addEventListener('click', function (evt) {
            if (evt.target.classList.contains('date')) {
                _setDate(evt.target.dataset.date);

                if (_params.autoHide) {
                    _elem.datepicker.hideCalendar();
                }
            }

        });

        _calendar.querySelector('.cancel').addEventListener('click', function() {
            _elem.datepicker.hideCalendar();
        });

        _calendar.querySelector('.prev-button').addEventListener('click', function() {
            _toPreviousMonth();
            _updateCalendar();
        });

        _calendar.querySelector('.next-button').addEventListener('click', function() {
            console.log('next month');
            _toNextMonth();
            _updateCalendar();
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
            _elem.datepicker.beforeHideCalendar();
            _calendar.style.display = 'none';
        },

        afterSetDate: function(timestamp) {
            // To be overriden.
        }, 

        beforeHideCalendar: function() {
            // To be overriden.
        } 
    };

    // Returns a init property that returns the "constructor" function.
    return {
        init: _Datepicker
    }

})();

