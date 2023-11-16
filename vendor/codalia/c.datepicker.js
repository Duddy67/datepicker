// Anonymous function with namespace.
const C_Datepicker = (function() {

    // Private attributes.

    const _rows = 6;
    const _columns = 7;
    const _params = {};
    const _minutes = 60;
    const _hours = 24;
    const _months = [];
    const _years = [];
    const _today = dayjs().format('YYYY-M-D');
    // The input element that hosts the datepicker.
    let _host;
    // The div element that contains the datepicker.
    let _datepicker;
    let _selectedDay = null;
    let _selectedTime = null;
    // The year to use in the datepicker (useful in case of leap-years).
    let _dpYear = dayjs().format('YYYY'); 
    // The month to use in the datepicker and that contains the days to display in the grid.
    let _dpMonth = dayjs().format('M');
    // Custom events triggered before or after some functions.
    let _beforeSetDateEvent;
    let _afterSetDateEvent;
    let _beforeClearEvent;
    let _afterClearEvent;
    let _beforeTodayEvent;
    let _afterTodayEvent;

    // Private methods.

    /*
     * Initializes the datepicker with the given parameters. 
     * Sets it to a default value when no parameter is given.
     */
    function _initParams(params) {
        _params.locale = params.locale === undefined ? 'en' : params.locale;
        _params.autoHide = params.autoHide === undefined ? false : params.autoHide;
        _params.timePicker = params.timePicker === undefined ? false : params.timePicker;
        // Set the datepicker default format.
        let format = _params.timePicker ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
        _params.format = params.format === undefined ? format : params.format;
        _params.showDropdowns = params.showDropdowns === undefined ? false : params.showDropdowns;
        _params.timePicker24Hour = params.timePicker24Hour === undefined ? false : params.timePicker24Hour;
        _params.minYear = params.minYear === undefined ? 100 : params.minYear;
        _params.maxYear = params.maxYear === undefined ? 100 : params.maxYear;
        _params.minDate = params.minDate === undefined ? null : params.minDate;
        _params.maxDate = params.maxDate === undefined ? null : params.maxDate;
        _params.daysOfWeekDisabled = params.daysOfWeekDisabled === undefined ? null : params.daysOfWeekDisabled;
        _params.datesDisabled = params.datesDisabled === undefined ? null : params.datesDisabled;
        _params.displayTodaysDate = params.displayTodaysDate === undefined ? false : params.displayTodaysDate;
        _params.today = params.today === undefined ? false : params.today;
        _params.clear = params.clear === undefined ? false : params.clear;
        _params.cancel = params.cancel === undefined ? false : params.cancel;
    }

    /*
     * Sets the month names.
     */
    function _setMonths() {
        if (_months.length === 0) {
            // 
            for (let i = 0; i < 12; i++) {
                let month = i + 1;
                // Use a year in the past and set a date to the first day of each month to get the month name. 
                _months[i] = dayjs('2001-'+month+'-1').format('MMMM');
            }
        }
    }

    /*
     * Sets the year range to use in the datepicker.
     */
    function _setYears() {
        // Check for the min and max year parameters.
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

    /*
     * Gets the days of the week used in the datepicker grid.
     */
    function _getDaysOfWeek() {
        return dayjs.weekdaysShort();
    }

    /*
     * Sets the month selected through the month drop down list.
     */
    function _changeMonth() {
        const selectedMonth = parseInt(_datepicker.querySelector('.months').value) + 1;
        // Update the month to display with the newly selected month.
        _dpMonth = selectedMonth;
    }

    /*
     * Sets the year selected through the year drop down list.
     */
    function _changeYear() {
        const selectedYear = _datepicker.querySelector('.years').value;
        // Update the month to display with the newly selected year.
        _dpYear = selectedYear;
    }

    /*
     * Computes the days contained in the datepicker grid for a given month.
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
        let day;

        // The last days of the previous month have to be displayed.
        if (firstDayOfTheMonth > 0) {

            // Set the datepicker back a month.
            datepicker = dayjs(_dpYear + '-' + _dpMonth).subtract(1, 'month').format('YYYY-M').split('-');
            // Get the numer of days contained in the previous month.
            const daysInPreviousMonth = dayjs(datepicker[0] + '-' + datepicker[1]).daysInMonth();

            // Compute the number of previous month last days to display.
            let nbLastDays = 0;
            while (nbLastDays < firstDayOfTheMonth) {
                nbLastDays++;
            }

            // Loop through the days of the previous month.
            for (let i = 0; i < daysInPreviousMonth; i++) {
                day = i + 1;

                if (day > (daysInPreviousMonth - nbLastDays)) {
                    days.push(_getDayObject(datepicker[0] + '-' + datepicker[1] + '-' + day, 'previous'));
                }
            }
        }

        // Loop through the days of the current month.
        for (let i = 0; i < nbDays; i++) {
            day = i + 1;
            days.push(_getDayObject(_dpYear + '-' + _dpMonth + '-' + day, 'current'));
        }

        // Compute the number of days needed to fill the datepicker grid.
        const nbDaysInNextMonth = (_rows * _columns) - days.length;
        // Set the datepicker forward a month.
        datepicker = dayjs(_dpYear + '-' + _dpMonth).add(1, 'month').format('YYYY-M').split('-');

        // Loop through the days of the next month.
        for (let i = 0; i < nbDaysInNextMonth; i++) {
            day = i + 1;
            days.push(_getDayObject(datepicker[0] + '-' + datepicker[1] + '-' + day, 'next'));

            // The datepicker grid is filled.
            if (i > nbDaysInNextMonth) {
                break;
            }
        }

        return days;
    }

    /*
     * Build a day object to use in the datepicker grid.
     */
    function _getDayObject(date, position) {
        // Get the day from the given date.
        let day = date.split('-')[2];

        let today = (date === _today) ? true : false;
        let selected = (date === _selectedDay) ? true : false;
        // Check for the possible min and max dates and set the disabled attribute accordingly. 
        let disabled = (_params.minDate && dayjs(date).isBefore(_params.minDate)) || (_params.maxDate && dayjs(_params.maxDate).isBefore(date)) ? true : false;
        // Check again for the disabled days of the week (if any).
        disabled = _params.daysOfWeekDisabled && _params.daysOfWeekDisabled.includes(dayjs(date).day()) ? true : disabled;
        // Check again for the disabled dates (if any).
        disabled = _params.datesDisabled && _params.datesDisabled.includes(dayjs(date).format('YYYY-MM-DD')) ? true : disabled;

        return {'text': day, 'timestamp': dayjs(date).valueOf(), 'month': position, 'today': today, 'selected': selected, 'disabled': disabled};
    }

    /*
     * Sets the datepicker year and month values according to the min and max date parameters.
     */
    function _setDates() {
        if (_params.minDate && dayjs(_dpYear + '-' + _dpMonth).isBefore(_params.minDate)) {
            let minDate = dayjs(_params.minDate).format('YYYY-M').split('-');
            _dpYear = minDate[0];
            _dpMonth = minDate[1];
        }

        if (_params.maxDate && dayjs(_params.maxDate).isBefore(_dpYear + '-' + _dpMonth)) {
            let maxDate = dayjs(_params.maxDate).format('YYYY-M').split('-');
            _dpYear = maxDate[0];
            _dpMonth = maxDate[1];
        }
    }

    /*
     * Sets the host input value to the newly selected date. 
     */
    function _setDate(timestamp) {
        // Fire the beforeSetDate event with the old selected date (if any).
        let date = _selectedDay ? dayjs(_selectedDay).format('YYYY-MM-DD') : null;
        _beforeSetDateEvent.detail.date = date;
        let time = date ? _selectedTime : null;
        _beforeSetDateEvent.detail.time = time;
        document.dispatchEvent(_beforeSetDateEvent);

        // Make sure the given timestamp is of the type number. (Note: add a plus sign to convert into number).
        timestamp = typeof timestamp != 'number' ? +timestamp : timestamp;
        // Get the selected date from the given timestamp.
        date = dayjs(timestamp).format('YYYY-MM-DD');
        // Add the time if needed.
        date = _params.timePicker ? date + ' ' + _getTime() : date;
        _host.value = dayjs(date).format(_params.format);

        // Fire the afterSetDate event with the newly selected date.
        _afterSetDateEvent.detail.date = dayjs(date).format('YYYY-MM-DD');
        time = _params.timePicker ? _getTime() : null;
        _afterSetDateEvent.detail.time = time;
        document.dispatchEvent(_afterSetDateEvent);
    }

    function _setToday() {
        // Fire the beforeToday event with the old selected date (if any).
        let date = _selectedDay ? dayjs(_selectedDay).format('YYYY-MM-DD') : null;
        _beforeTodayEvent.detail.date = date;
        let time = date ? _selectedTime : null;
        _beforeTodayEvent.detail.time = time;
        document.dispatchEvent(_beforeTodayEvent);

        // Set the datepicker to the current date.
        _selectedDay = dayjs().format('YYYY-M-D');
        _selectedTime = _params.timePicker ? dayjs().format('HH:mm') : null;

        _host.value = dayjs().format(_params.format);

        document.dispatchEvent(_afterTodayEvent);
    }

    /*
     * Returns the selected time into the HH:mm format.
     */
    function _getTime() {
        // Make sure the drop down lists of time exist.
        if (_params.timePicker) {
            let hour = _datepicker.querySelector('[name="hours"]').value;
            let minute = _datepicker.querySelector('[name="minutes"]').value;

            // Check for meridiem format (am / pm)
            if (!_params.timePicker24Hour) {
                // Convert hour into 24 hour format.
                if (_datepicker.querySelector('[name="meridiems"]').value == 'pm') {
                    hour = hour < 12 ? +hour + 12 : 0;
                }
            }

            hour = hour < 10 ? '0' + hour : hour;
            minute = minute < 10 ? '0' + minute : minute;

            return hour + ':' + minute;
        }

        return null;
    }

    /*
     * Builds and returns the datepicker.
     */
    function _renderDatepicker() {
        let html = `<div class="datepicker datepicker-dropdown datepicker-orient-left datepicker-orient-bottom">`+
                   `<div class="datepicker-picker">`+`<div class="datepicker-header">`+`<div class="datepicker-title" style="display: none;"></div>`+
                   `<div class="datepicker-controls">`;

        // Check for the min date and disable the previous button accordingly.
        let disabled = (_params.minDate && dayjs(dayjs(_dpYear + '-' + _dpMonth).subtract(1, 'month').format('YYYY-M')).isBefore(_params.minDate)) ? 'disabled' : '';
        html += `<button type="button" class="button prev-button prev-btn" `+ disabled +` tabindex="-1">«</button>`;

        // Build both the year and month drop down lists.
        if (_params.showDropdowns) {
            html += `<div class="datepicker-dropdown-date"><select name="months" class="months">`;

            for (let i = 0; i < _months.length; i++) {
                let selected = i == _dpMonth - 1 ? 'selected' : '';
                html += `<option value="` + i + `" ` + selected + `>` + _months[i] + `</option>`;
            }

            html += `</select><select name="years" class="years">`;

            for (let i = 0; i < _years.length; i++) {
                let selected = _years[i] == _dpYear ? 'selected' : '';
                html += `<option value="` + _years[i] + `" ` + selected + `>` + _years[i] + `</option>`;
            }

            html += `</select></div>`;
        }
        else {
            html += `<button type="button" class="button view-switch" tabindex="-1">`+dayjs(_dpYear + '-' + _dpMonth).format('MMMM YYYY')+`</button>`;
        }

        // Check for the max date and disable the next button accordingly.
        disabled = (_params.maxDate && dayjs(dayjs(_dpYear + '-' + _dpMonth).add(1, 'month').format('YYYY-M')).isAfter(_params.maxDate)) ? 'disabled' : '';
        html += `<button type="button" class="button next-button next-btn" `+ disabled +` tabindex="-1">»</button>`+`</div></div>`+
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

            const hours = _params.timePicker24Hour ? _hours : 13;

            for (let i = 0; i < hours; i++) {
                // No zero hour in meridiem format.
                if (i === 0 && !_params.timePicker24Hour) {
                    continue;
                }

                let selected = i == time[0] ? 'selected' : '';
                html += `<option value="`+ i +`" `+ selected +`>`+ i +`</option>`;
            }

            html += `</select><select name="minutes" class="minutes">`;

            for (let i = 0; i < _minutes; i++) {
                let selected = i == time[1] ? 'selected' : '';
                let zerofill = i < 10 ? '0' : '';
                html += `<option value="`+ i +`" `+ selected +`>`+ zerofill + i +`</option>`;
            }

            html += `</select>`;

            // Build the meridiem drop down list.
            if (!_params.timePicker24Hour) {
                html += `<select name="meridiems" class="meridiems">`;

                const meridiems = ['am', 'pm'];
                for (let i = 0; i < meridiems.length; i++) {
                    let selected = meridiems[i] == time[2] ? 'selected' : '';
                    html += `<option value="`+ meridiems[i] +`" `+ selected +`>`+ meridiems[i] +`</option>`;
                }

                html += `</select>`;
            }

            html += `</div>`;
        }

        // Build the control buttons according to the parameter setting.
        html += `<div class="datepicker-controls">`;

        if (_params.today) {
            html += `<button type="button" class="btn btn-success today" tabindex="-1" >Today</button>`;
        }

        if (_params.clear) {
            html += `<button type="button" class="btn btn-info clear" tabindex="-1" >Clear</button>`;
        }

        if (_params.cancel) {
            html += `<button type="button" class="btn btn-danger cancel" tabindex="-1" >Cancel</button>`;
        }

        html += `</div></div></div>`;

        return html;
    }

    /*
     * Updates the grid as well as some parts of the datepicker according to the recent changes.
     */
    function _updateDatepicker() {
        // Update the date drop down lists.
        if (_params.showDropdowns) {
            // Unselect the old selected month.
            _datepicker.querySelector('.months').selected = false;
            // Get the numeric value of the month to display (ie: 0 => January, 1 => February...).
            const monthNumeric = dayjs(_dpYear + '-' + _dpMonth).format('M') - 1;
            // Update the selected option.
            _datepicker.querySelector('.months option[value="'+ monthNumeric +'"]').selected = true;

            // Same with year.
            _datepicker.querySelector('.years').selected = false;
            const year = dayjs(_dpYear + '-' + _dpMonth).format('YYYY');
            _datepicker.querySelector('.years option[value="'+ year +'"]').selected = true;
        }
        // Update the text date.
        else {
            _datepicker.querySelector('.view-switch').innerHTML = dayjs(_dpYear + '-' + _dpMonth).format('MMMM YYYY');
        }

        // Update the datepicker grid.

        const days = _getDays();
        let grid = '';

        days.forEach((day) => {
            let extra = (day.month != 'current') ? day.month : ''; 
            extra += (day.today) ? ' today' : ''; 
            extra += (day.selected) ? ' selected' : ''; 
            extra += (day.disabled) ? ' disabled' : ''; 
            grid += `<span data-date="`+day.timestamp+`" class="datepicker-cell day `+extra+`">`+day.text+`</span>`;
        });

        _datepicker.querySelector('.datepicker-grid').innerHTML = grid;

        // Update both the previous and next buttons according to the month currently displayed in the datepicker. 

        _datepicker.querySelector('.prev-button').disabled = false;
        if (_params.minDate) {
            // Get the year and month of the min date to compare with the datepicker's.
            let minDate = dayjs(_params.minDate).format('YYYY-M');
            if (dayjs(dayjs(_dpYear + '-' + _dpMonth).subtract(1, 'month').format('YYYY-M')).isBefore(minDate)) {
                _datepicker.querySelector('.prev-button').disabled = true;
            }
        }

        _datepicker.querySelector('.next-button').disabled = false;
        if (_params.maxDate) {
            // Get the year and month of the min date to compare with the datepicker's.
            let maxDate = dayjs(_params.maxDate).format('YYYY-M');
            if (dayjs(dayjs(_dpYear + '-' + _dpMonth).add(1, 'month').format('YYYY-M')).isAfter(maxDate)) {
                _datepicker.querySelector('.next-button').disabled = true;
            }
        }

        // Update the time drop down lists only when it's called by the _setStartingDate function.
        if (_updateDatepicker.caller.name == '_setStartingDate' && _params.timePicker) {
            // Use a date in the past to get the time in the desired format.
            let time = dayjs('2001-01-01 ' + _selectedTime).format('H:m').split(':');
            let meridiem = 'am';

            // Convert the 24 hour time to 12 hour time.
            if (!_params.timePicker24Hour) {
                if (time[0] > 12) {
                    time[0] = +time[0] - 12;
                    meridiem = 'pm';
                }

                // Midnight 
                if (time[0] == 0) {
                    time[0] = 12;
                }
                // Noon is considered as post meridiem
                else if (time[0] == 12) {
                    meridiem = 'pm';
                }
            }

            // Unselect the old selected hour.
            _datepicker.querySelector('.hours').selected = false;
            // Update the selected option.
            _datepicker.querySelector('.hours option[value="'+ time[0] +'"]').selected = true;
            // Unselect the old selected minute.
            _datepicker.querySelector('.minutes').selected = false;
            // Update the selected option.
            _datepicker.querySelector('.minutes option[value="'+ time[1] +'"]').selected = true;

            if (_datepicker.querySelector('.meridiems')) {
                _datepicker.querySelector('.meridiems').selected = false;
                _datepicker.querySelector('.meridiems option[value="'+ meridiem +'"]').selected = true;
            }
        }
    }

    /*
     * Called just one time through the callback function.
     */
    function _setStartingDate(date) {
        _host.value = dayjs(date).format(_params.format);
        _selectedDay = dayjs(date).format('YYYY-M-D');
        _dpMonth = dayjs(date).format('M');
        _dpYear = dayjs(date).format('YYYY');
        _selectedTime = _params.timePicker ? dayjs(date).format('HH:mm') : null;
        _updateDatepicker();
    }

    /*
     * Initializes and builds the datepicker.
     */
    const _Datepicker = function(elem, params, callback) {
        _initParams(params);
        // Some DayJS functions require the locale data plugin.
        dayjs.extend(window.dayjs_plugin_localeData);
        // Set the locale for the datepicker.
        dayjs.locale(_params.locale);

        // Store the host input element.
        _host = elem;
        // Add the host element as a datepicker's property.
        this.host = elem;

        _setYears();
        _setMonths();
        _setDates();

        // Create a div container for the datepicker.
        _datepicker = document.createElement('div');
        // Insert the datepicker in the container.
        _datepicker.insertAdjacentHTML('afterbegin', _renderDatepicker());
        // Insert the div container after the given element.
        _host.insertAdjacentElement('afterend', _datepicker);

        this.hideDatepicker();

        // Delegate the click event to the datepicker element to check whenever an element is clicked.
        _datepicker.addEventListener('click', function (evt) {
            // Check the day (make sure it's not disabled)
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
                _selectedDay = dayjs(+evt.target.dataset.date).format('YYYY-M-D');

                // As well as the selected time attribute (if timePicker is active).
                if (_params.timePicker) {
                    _selectedTime = _getTime();
                }

                if (_params.autoHide) {
                    _datepicker.style.display = 'none';
                }
            }

            // Check for buttons and drop down lists.

            if (evt.target.classList.contains('prev-button')) {
                _setToPrevMonth();
                _updateDatepicker();
            }

            if (evt.target.classList.contains('next-button')) {
                _setToNextMonth();
                _updateDatepicker();
            }

            if (_params.showDropdowns && evt.target.classList.contains('months')) {
                _changeMonth();
                _updateDatepicker();
            }

            if (_params.showDropdowns && evt.target.classList.contains('years')) {
                _changeYear();
                _updateDatepicker();
            }

            if (evt.target.classList.contains('cancel')) {
                _datepicker.style.display = 'none';
            }

            if (evt.target.classList.contains('clear')) {
                // Fire the beforeClear event with the old selected date.
                let date = _selectedDay ? dayjs(_selectedDay).format('YYYY-MM-DD') : null;
                _beforeClearEvent.detail.date = date;
                let time = date ? _selectedTime : null;
                _beforeClearEvent.detail.time = time;
                document.dispatchEvent(_beforeClearEvent);

                _host.value = '';
                _selectedDay = null;
                _updateDatepicker();

                document.dispatchEvent(_afterClearEvent);
            }

            if (evt.target.classList.contains('today')) {
                _setToday();
                _updateDatepicker();
            }
        });

        // Hide or show the datepicker according to where the user clicks (outside the datepicker or inside the host input element).
        document.addEventListener('click', function (evt) {
            // The clicked target is not the input host and is not contained into the datepicker element.
            if (evt.target !== _host && !_datepicker.contains(evt.target)) {
                _datepicker.style.display = 'none';
            }

            // The user has clicked into the host input element.
            if (evt.target === _host) {
                _datepicker.style.display = 'block';
            }
        });

        // Create and initialise the custom events 
        _beforeSetDateEvent = new CustomEvent('beforeSetDate', {detail: {datepicker: this, date: null, time: null}});
        _afterSetDateEvent = new CustomEvent('afterSetDate', {detail: {datepicker: this, date: null, time: null}});
        _beforeClearEvent = new CustomEvent('beforeClear', {detail: {datepicker: this, date: null, time: null}});
        _afterClearEvent = new CustomEvent('afterClear', {detail: {datepicker: this}});
        _beforeTodayEvent = new CustomEvent('beforeToday', {detail: {datepicker: this, date: null, time: null}});
        _afterTodayEvent = new CustomEvent('afterToday', {detail: {datepicker: this}});

        if (_params.displayTodaysDate) {
            _setDate(dayjs().valueOf());
        }

        // Run the given callback function.
        if (callback !== undefined) {
            callback(this);

            // Check for a possible starting date.
            if (this.startingDate !== undefined) {
                _setStartingDate(this.startingDate);
            }
        }

        return this;
    };

    // Public methods

    _Datepicker.prototype = {
        today: function(format) {
            format = format !== undefined ? format : _params.format;
            return dayjs().format(format);
        },

        current: function() {
            return dayjs(_dpYear + '-' + _dpMonth).format('YYYY-MM-DD');
       },

        setParams: function(params) {
            for (const key in params) {
                _params[key] = params[key];
            }
        },

        // Rebuilds all the datepicker.
        render: function() {
            _datepicker.innerHTML = _renderDatepicker();
        },

        showDatepicker: function() {
            _datepicker.style.display = 'block';
        },

        hideDatepicker: function() {
            _datepicker.style.display = 'none';
        },
    };

    // Returns a init property that returns the "constructor" function.
    return {
        init: _Datepicker
    }

})();

