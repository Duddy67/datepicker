// Anonymous function with namespace.
const C_Datepicker = (function() {

    // Private attributes.

    const _rows = 6;
    const _columns = 7;
    const _params = {};
    const _minutes = 59;
    const _hours = 23;
    const _months = [];
    const _years = [];
    const _today = dayjs().format('YYYY-M-D');
    // The input element that hosts the datepicker.
    let _host = null;
    let _calendar = null;
    let _selectedDay = null;
    // The year to use in the datepicker (used in case of leap-years).
    let _dpYear = dayjs().format('YYYY'); // _dpYear  _dpMonth  _datepickerYear  _datepickerMonth
    // The month to use in the datepicker and that contains the days to display in the grid.
    let _dpMonth = dayjs().format('M');

    function _setParams(params) {
        _params.autoHide = params.autoHide === undefined ? false : params.autoHide;
        _params.timePicker = params.timePicker === undefined ? false : params.timePicker;
        // Set the default format.
        let format = _params.timePicker ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
        _params.format = params.format === undefined ? format : params.format;
        _params.showDropdowns = params.showDropdowns === undefined ? false : params.showDropdowns;
        _params.timePicker24Hour = params.timePicker24Hour === undefined ? false : params.timePicker24Hour;
        _params.minYear = params.minYear === undefined ? 100 : params.minYear;
        _params.maxYear = params.maxYear === undefined ? 100 : params.maxYear;
        _params.minDate = params.minDate === undefined ? null : params.minDate;
        _params.maxDate = params.maxDate === undefined ? null : params.maxDate;
    }

    // Private methods.

    function _setMonths() {
        if (_months.length === 0) {
            // 
            for (let i = 0; i < 12; i++) {
                let month = i + 1;
                _months[i] = dayjs('2001-'+month+'-1').format('MMMM');
            }
        }
    }

    function _setYears() {
        let minYear = dayjs().subtract(_params.minYear, 'year').format('YYYY');
        const maxYear = dayjs().add(_params.maxYear, 'year').format('YYYY');

        while (minYear <= maxYear) {
            _years.push(minYear++);
        }
    }

    function _setToNextMonth() {
        _dpMonth = Number(_dpMonth) + 1;

        // Check for the next year.
        if (_dpMonth > 12) {
            _dpMonth = 1;
            _dpYear = Number(_dpYear) + 1;
        }
    }

    function _setToPrevMonth() {
        _dpMonth = Number(_dpMonth) - 1;

        // Check for the previous year.
        if (_dpMonth < 1) {
            _dpMonth = 12;
            _dpYear = Number(_dpYear) - 1;
        }
    }

    function _getDaysOfWeek() {
        return dayjs.weekdaysShort();
    }

    function _changeMonth() {
        let selectedMonth = parseInt(_calendar.querySelector('.months').value) + 1;
        selectedMonth = selectedMonth < 10 ? '0'+selectedMonth : selectedMonth;
        // Update the month to display with the newly selected month.
        _dpMonth = selectedMonth;
    }

    function _changeYear() {
        const selectedYear = _calendar.querySelector('.years').value;
        // Update the month to display with the newly selected year.
        _dpYear = selectedYear;
    }

    /*
     * Computes the days contained in the grid for a given month.
     */
    function _getDays() {
        const days = [];
        // Get the number of days in the month to display.
        const nbDays = dayjs(_dpYear + '-' + _dpMonth).daysInMonth();

        // Figure out what is the first day of the month to display.
        // Returns the day as a number ie: 0 => sunday, 1 => monday ... 6 => saturday. 
        const firstDayOfTheMonth = dayjs(_dpYear + '-' + _dpMonth + '-1').day();

        // Generate date for each day in the grid.
        let datepicker;

        // The last days of the previous month have to be displayed.
        if (firstDayOfTheMonth > 0) {

            let nbLastDays = 0;
            while (nbLastDays < firstDayOfTheMonth) {
                nbLastDays++;
            }

            // Set the datepicker back a month.
            datepicker = dayjs(_dpYear + '-' + _dpMonth).subtract(1, 'month').format('YYYY-M').split('-');
            const daysInPreviousMonth = dayjs(datepicker[0] + '-' + datepicker[1]).daysInMonth();

            // Loop through the days of the previous month.
            for (let i = 0; i < daysInPreviousMonth; i++) {
                let dayNumber = i + 1;

                if (dayNumber > (daysInPreviousMonth - nbLastDays)) {
                    days.push(_getDayObject(datepicker[0] + '-' + datepicker[1] + '-' + dayNumber, 'previous'));
                }
            }
        }

        // Loop through the days of the current month.
        for (let i = 0; i < nbDays; i++) {
            let dayNumber = i + 1;
            days.push(_getDayObject(_dpYear + '-' + _dpMonth + '-' + dayNumber, 'current'));
        }

        // Compute the number of days needed to fill the calendar grid.
        const nbDaysInNextMonth = (_rows * _columns) - days.length;
        // Set the datepicker forward a month.
        datepicker = dayjs(_dpYear + '-' + _dpMonth).add(1, 'month').format('YYYY-M').split('-');

        // Loop through the days of the next month.
        for (let i = 0; i < nbDaysInNextMonth; i++) {
            let dayNumber = i + 1;
            days.push(_getDayObject(datepicker[0] + '-' + datepicker[1] + '-' + dayNumber, 'next'));

            // The calendar grid is filled.
            if (i > nbDaysInNextMonth) {
                break;
            }
        }

        return days;
    }

    function _getDayObject(date, position) {
        // Get the day from the given date.
        let day = date.split('-')[2];

        // Check if the date is today.
        let today = (date === _today) ? true : false;
        let selected = (date === _selectedDay) ? true : false;
        // Check for the possible min and max dates and set the disabled attribute accordingly. 
        let disabled = (_params.minDate && dayjs(date).isBefore(_params.minDate)) || (_params.maxDate && dayjs(_params.maxDate).isBefore(date)) ? true : false;

        return {'text': day, 'timestamp': dayjs(date).valueOf(), 'month': position, 'today': today, 'selected': selected, 'disabled': disabled};
    }

    function _setDates() {
        if (_params.minDate && days(_currentDate).isBefore(_params.minDate)) {
            //_currentDate = _params.minDate;
        }

        if (_params.maxDate && days(_params.maxDate).isBefore(_currentDate)) {
            //_currentDate = _params.maxDate;
        }

    }

    function _setDate(timestamp) {
        // Make sure the given timestamp is of the type number. (Note: add a plus sign to convert into number).
        timestamp = typeof timestamp != 'number' ? + timestamp : timestamp;
        _host.value = dayjs(timestamp).format(_params.format);
        // 
        _host.datepicker.afterSetDate(timestamp);
    }

    function _renderCalendar() {
        let html = `<div class="datepicker datepicker-dropdown datepicker-orient-left datepicker-orient-bottom">`+
                   `<div class="datepicker-picker">`+`<div class="datepicker-header">`+`<div class="datepicker-title" style="display: none;"></div>`+
                   `<div class="datepicker-controls">`+`<button type="button" class="button prev-button prev-btn" tabindex="-1">«</button>`;

        // Build the date drop down lists.
        if (_params.showDropdowns) {
            html += `<div class="datepicker-dropdown-date"><select name="months" class="months">`;
            const currentMonth = dayjs().month();

            for (let i = 0; i < _months.length; i++) {
                let selected = i == currentMonth ? 'selected' : '';
                html += `<option value="` + i + `" ` + selected + `>` + _months[i] + `</option>`;
            }

            html += `</select><select name="years" class="years">`;
            const currentYear = dayjs().year();

            for (let i = 0; i < _years.length; i++) {
                let selected = _years[i] == currentYear ? 'selected' : '';
                html += `<option value="` + _years[i] + `" ` + selected + `>` + _years[i] + `</option>`;
            }

            html += `</select></div>`;
        }
        else {
            html += `<button type="button" class="button view-switch" tabindex="-1">`+dayjs(_dpYear + '-' + _dpMonth).format('MMMM YYYY')+`</button>`;
        }

        html += `<button type="button" class="button next-button next-btn" tabindex="-1">»</button>`+`</div></div>`+
                `<div class="datepicker-main"><div class="datepicker-view"><div class="days"><div class="days-of-week">`;

        _getDaysOfWeek().forEach((day) => {
            html += `<span class="dow">`+day+`</span>`;
        });

        html += `</div><div class="datepicker-grid">`;

        const days = _getDays();
        days.forEach((day) => {
            let extra = (day.month != 'current') ? day.month : ''; 
            extra += (day.today) ? ' today' : ''; 
            extra += (day.selected) ? ' selected' : ''; 
            extra += (day.disabled) ? ' disabled' : ''; 
            html += `<span data-date="`+day.timestamp+`" class="datepicker-cell day `+extra+`">`+day.text+`</span>`;
        });

        html += `</div></div></div></div>`+
                `<div class="datepicker-footer">`;

        // Build the time drop down lists.
        if (_params.timePicker) {
            // Set the time units to explode according to the timePicker24Hour parameter.
            let format = _params.timePicker24Hour ? 'H:m' : 'h:m:a';
            let time = dayjs().format(format);
            // Explode the time units into an array.
            time = time.split(':');

            html += `<div class="datepicker-time"><select name="hours" class="hours">`;

            const hours = _params.timePicker24Hour ? _hours : 12;

            for (let i = 0; i < hours; i++) {
                let selected = i == time[0] ? 'selected' : '';
                html += `<option value="`+i+`" `+selected+`>`+i+`</option>`;
            }

            html += `</select><select name="minutes" class="minutes">`;

            for (let i = 0; i < _minutes; i++) {
                let selected = i == time[1] ? 'selected' : '';
                let zerofill = i < 10 ? '0' : '';
                html += `<option value="`+i+`" `+selected+`>`+zerofill+i+`</option>`;
            }

            html += `</select>`;

            // Build the meridiem drop down list.
            if (!_params.timePicker24Hour) {
                html += `<select name="meridiems" class="meridiems">`;

                const meridiems = ['am', 'pm'];
                for (let i = 0; i < meridiems.length; i++) {
                    let selected = meridiems[i] == time[2] ? 'selected' : '';
                    html += `<option value="`+meridiems[i]+`" `+selected+`>`+meridiems[i]+`</option>`;
                }

                html += `</select>`;
            }

            html += `</div>`;

        }

        html += `<div class="datepicker-controls">`+
                `<button type="button" class="btn btn-success" tabindex="-1" >Today</button>`+
                `<button type="button" class="btn btn-info" tabindex="-1" >Clear</button>`+
                `<button type="button" class="btn btn-danger cancel" tabindex="-1" >Cancel</button>`+
                `</div></div></div>`;

        return html;
    }

    function _updateCalendar() {
        // Update the date drop down lists.
        if (_params.showDropdowns) {
            // Unselect the old selected month.
            _calendar.querySelector('.months').selected = false;
            // Get the numeric value of the month to display (ie: 0 => January, 1 => February...).
            const monthNumeric = dayjs(_dpYear + '-' + _dpMonth).format('M') - 1;
            // Update the selected option.
            _calendar.querySelector('.months option[value="'+ monthNumeric +'"]').selected = true;

            // Same with year.
            _calendar.querySelector('.years').selected = false;
            const year = dayjs(_dpYear + '-' + _dpMonth).format('YYYY');
            _calendar.querySelector('.years option[value="'+ year +'"]').selected = true;
        }
        // Update the text date.
        else {
            _calendar.querySelector('.view-switch').innerHTML = dayjs(_dpYear + '-' + _dpMonth).format('MMMM YYYY');
        }

        // Update the calendar grid.

        const days = _getDays();
        let grid = '';

        days.forEach((day) => {
            let extra = (day.month != 'current') ? day.month : ''; 
            extra += (day.today) ? ' today' : ''; 
            extra += (day.selected) ? ' selected' : ''; 
            extra += (day.disabled) ? ' disabled' : ''; 
            grid += `<span data-date="`+day.timestamp+`" class="datepicker-cell day `+extra+`">`+day.text+`</span>`;
        });

        _calendar.querySelector('.datepicker-grid').innerHTML = grid;
    }

    const _Datepicker = function(elem, params) {
        _setParams(params);
        //
        dayjs.extend(window.dayjs_plugin_localeData);

        //
        _host = elem;
        //
        elem.datepicker = this;

        elem.addEventListener('click', function() {
            this.datepicker.showCalendar(); 
        });

        _setYears();
        _setMonths();

        // Create a div container for the calendar.
        _calendar = document.createElement('div');
        // Insert the calendar in the container.
        _calendar.insertAdjacentHTML('afterbegin', _renderCalendar());
        // Insert the div container after the given element.
        _host.insertAdjacentElement('afterend', _calendar);

        this.hideCalendar();

        // Delegate the click event to the calendar element to check whenever a day in the grid is clicked.
        _calendar.addEventListener('click', function (evt) {
            // Check the day is not disabled
            if (evt.target.classList.contains('day') && !evt.target.classList.contains('disabled')) {
                _setDate(evt.target.dataset.date);

                // unselect the old selected day.
                let old = document.querySelector('.selected');

                if (old) {
                   old.classList.remove('selected');
                }

                // Add the class to the newly selected day.
                evt.target.classList.add('selected');
                // Update the selected day attribute.
                _selectedDay = dayjs(+evt.target.dataset.date).format("YYYY-M-D");

                if (_params.autoHide) {
                    _host.datepicker.hideCalendar();
                }
            }
        });

        // Hide the datepicker when the user clicks outside the calendar.
        document.addEventListener('click', function (evt) {
            // The clicked target is not the input host and is not contained into the calendar element.
            if (evt.target !== _host && !_calendar.contains(evt.target)) {
                _host.datepicker.hideCalendar();
            }
        });

        if (_params.showDropdowns) {
            _calendar.querySelector('.months').addEventListener('click', function() {
                _changeMonth();
                _updateCalendar();
            });

            _calendar.querySelector('.years').addEventListener('click', function() {
                _changeYear();
                _updateCalendar();
            });
        }

        _calendar.querySelector('.cancel').addEventListener('click', function() {
            _host.datepicker.hideCalendar();
        });

        _calendar.querySelector('.prev-button').addEventListener('click', function() {
            //_monthToDisplay = dayjs(_monthToDisplay).subtract(1, 'month').format('YYYY-MM');
            _setToPrevMonth();
            _updateCalendar();
        });

        _calendar.querySelector('.next-button').addEventListener('click', function() {
            //_monthToDisplay = dayjs(_monthToDisplay).add(1, 'month').format('YYYY-MM');
            _setToNextMonth();
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
            _host.datepicker.beforeHideCalendar();
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

