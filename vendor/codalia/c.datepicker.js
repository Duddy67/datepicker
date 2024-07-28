
class C_Datepicker {

    #params;
    #rows;
    #columns;
    #minutes;
    #hours;
    #months;
    #years;
    #today;
    #host;
    #datepicker;
    #selectedDay;
    #selectedTime;
    #dpYear;
    #dpMonth;
    // Custom events triggered before or after some functions.
    #beforeSetDateEvent;
    #afterSetDateEvent;
    #beforeClearEvent;
    #afterClearEvent;
    #beforeTodayEvent;
    #afterTodayEvent;

    // The datepicker constructor.
    constructor(element, params, callback) {
        // Initialize both private properties and parameters.
        this.#initProperties(element);
        this.#initParams(params);

        // Some DayJS functions require the locale data plugin.
        dayjs.extend(window.dayjs_plugin_localeData);
        // Set the locale for the datepicker.
        dayjs.locale(this.#params.locale);

        this.#setYears();
        this.#setMonths();
        this.#setDates();

        // Create a div container for the datepicker.
        this.#datepicker = document.createElement('div');
        this.#datepicker.classList.add('datepicker-container');
        // Insert the datepicker in the container.
        this.#datepicker.insertAdjacentHTML('afterbegin', this.#renderDatepicker());
        // Insert the div container after the given element.
        this.#getHostElement().insertAdjacentElement('afterend', this.#datepicker);

        // Hide the datepicker.
        this.hide();

        // Delegate the click event to the datepicker element to check whenever an element is clicked.
        this.#datepicker.addEventListener('click', this, false);

        this.handleEvent = function(evt) {
            // Check the day (make sure it's not disabled)
            if (evt.target.classList.contains('day') && !evt.target.classList.contains('disabled')) {
                this.#setDate(evt.target.dataset.date);

                if (this.#params.autoHide) {
                    this.#datepicker.style.display = 'none';
                }
            }

            // Check for button.

            if (evt.target.classList.contains('prev-button')) {
                this.#setToPrevMonth();
                this.#updateDatepicker();
            }

            if (evt.target.classList.contains('next-button')) {
                this.#setToNextMonth();
                this.#updateDatepicker();
            }

            if (evt.target.classList.contains('cancel')) {
                this.#datepicker.style.display = 'none';
            }

            if (evt.target.classList.contains('clear')) {
                this.#clearDate();

                if (this.#params.autoHide) {
                    this.#datepicker.style.display = 'none';
                }
            }

            if (evt.target.classList.contains('today')) {
                this.#setToday();
                this.#updateDatepicker();

                if (this.#params.autoHide) {
                    this.#datepicker.style.display = 'none';
                }
            }
        }

        // Show or hide the datepicker according to where the user clicks (outside the datepicker or inside the host input element).
        function showHide(evt) {
            // The clicked target is not the input host and is not contained into the datepicker element.
            if (evt.target !== this.#getHostElement() && !this.#datepicker.contains(evt.target)) {
                this.#datepicker.style.display = 'none';
            }

            // The user has clicked into the host input element.
            if (evt.target === this.#getHostElement()) {
                this.#datepicker.style.display = 'block';
            }
        }

        document.addEventListener('click', showHide.bind(this), false);

        // Set the month and year attributes of the datepicker whenever the month and year drop down lists change.
        function setMonthYear(evt) {
            if (this.#params.showDropdowns && evt.target.classList.contains('months')) {
                this.#changeMonth();
                this.#updateDatepicker();
            }

            if (this.#params.showDropdowns && evt.target.classList.contains('years')) {
                this.#changeYear();
                this.#updateDatepicker();
            }
        }

        document.addEventListener('change', setMonthYear.bind(this), false);

        // Create and initialise the custom events
        this.#beforeSetDateEvent = new CustomEvent('beforeSetDate', {detail: {datepicker: this, date: null, time: null}});
        this.#afterSetDateEvent = new CustomEvent('afterSetDate', {detail: {datepicker: this, date: null, time: null}});
        this.#beforeClearEvent = new CustomEvent('beforeClear', {detail: {datepicker: this, date: null, time: null}});
        this.#afterClearEvent = new CustomEvent('afterClear', {detail: {datepicker: this}});
        this.#beforeTodayEvent = new CustomEvent('beforeToday', {detail: {datepicker: this, date: null, time: null}});
        this.#afterTodayEvent = new CustomEvent('afterToday', {detail: {datepicker: this}});

        // Run the given callback function.
        if (callback !== undefined) {
            callback(this);

            // Check for a possible starting date.
            if (this.startingDate !== undefined) {
                this.#setStartingDate(this.startingDate);
            }
        }
    }


    // Private functions.

    #initProperties(element) {
        this.#rows = 6;
        this.#columns = 7;
        this.#params = {};
        this.#minutes = 60;
        this.#hours = 24;
        this.#months = [];
        this.#years = [];
        this.#today = dayjs().format('YYYY-M-D');

        // Get the host element main attributes. 
        const host = {'name': null, 'id': null, 'classes': null};
        host.name = element.getAttribute('name');
        host.id = element.getAttribute('id');
        host.classes = element.classList.value;
        this.#host = host;
        // The div element that contains the datepicker.
        this.#datepicker;
        this.#selectedDay = null;
        this.#selectedTime = null;
        // The year to use in the datepicker (useful in case of leap-years).
        this.#dpYear = dayjs().format('YYYY');
        // The month to use in the datepicker and that contains the days to display in the grid.
        this.#dpMonth = dayjs().format('M');
    }

    /*
     * Initializes the datepicker with the given parameters.
     * Sets it to a default value when no parameter is given.
     */
    #initParams(params) {
        this.#params.locale = params.locale === undefined ? 'en' : params.locale;
        this.#params.autoHide = params.autoHide === undefined ? false : params.autoHide;
        this.#params.timePicker = params.timePicker === undefined ? false : params.timePicker;
        // Set the datepicker default format.
        let format = this.#params.timePicker ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
        this.#params.format = params.format === undefined ? format : params.format;
        this.#params.showDropdowns = params.showDropdowns === undefined ? false : params.showDropdowns;
        this.#params.timePicker24Hour = params.timePicker24Hour === undefined ? false : params.timePicker24Hour;
        this.#params.minYear = params.minYear === undefined ? 100 : params.minYear;
        this.#params.maxYear = params.maxYear === undefined ? 100 : params.maxYear;
        this.#params.minDate = params.minDate === undefined ? null : params.minDate;
        this.#params.maxDate = params.maxDate === undefined ? null : params.maxDate;
        this.#params.daysOfWeekDisabled = params.daysOfWeekDisabled === undefined ? null : params.daysOfWeekDisabled;
        this.#params.datesDisabled = params.datesDisabled === undefined ? null : params.datesDisabled;
        this.#params.displayStartingDate = params.displayStartingDate === undefined ? false : params.displayStartingDate;
        this.#params.today = params.today === undefined ? false : params.today;
        this.#params.clear = params.clear === undefined ? false : params.clear;
        this.#params.cancel = params.cancel === undefined ? false : params.cancel;
    }

    /*
     * Utility function that returns the name of the caller.
     */
    #getCallerName() {
        const stack = new Error().stack;
        const stackLines = stack.split('\n');
        const callerLine = stackLines[3]; // The caller is usually on the 3rd line

        const match = callerLine.match(/at (\S+) \(/);
        if (match) {
            return match[1];
        }

        return null;
    }

    /*
     * Returns the host input element.
     */
    #getHostElement() {
        // Try first to get the host element by its id.
        if (this.#host.id) {
            return document.getElementById(this.#host.id);
        }

        // Next, try by its name.
        if (this.#host.name) {
            return document.getElementsByName(this.#host.name)[0];
        }

        // The host element can't be find.
        return null;
    }

    /*
     * Sets the month names.
     */
    #setMonths() {
        if (this.#months.length === 0) {
            //
            for (let i = 0; i < 12; i++) {
                let month = i + 1;
                // Use a year in the past and set a date to the first day of each month to get the month name.
                this.#months[i] = dayjs('2001-' + month + '-1').format('MMMM');
            }
        }
    }

    /*
     * Sets the year range to use in the datepicker.
     */
    #setYears() {
        // Check for the min and max year parameters.
        let minYear = dayjs().subtract(this.#params.minYear, 'year').format('YYYY');
        const maxYear = dayjs().add(this.#params.maxYear, 'year').format('YYYY');

        while (minYear <= maxYear) {
            this.#years.push(minYear++);
        }
    }

    #setToNextMonth() {
        this.#dpMonth = Number(this.#dpMonth) + 1;

        // Check for the next year.
        if (this.#dpMonth > 12) {
            this.#dpMonth = 1;
            this.#dpYear = Number(this.#dpYear) + 1;
        }
    }

    #setToPrevMonth() {
        this.#dpMonth = Number(this.#dpMonth) - 1;

        // Check for the previous year.
        if (this.#dpMonth < 1) {
            this.#dpMonth = 12;
            this.#dpYear = Number(this.#dpYear) - 1;
        }
    }

    /*
     * Gets the days of the week used in the datepicker grid.
     */
    #getDaysOfWeek() {
        return dayjs.weekdaysShort();
    }

    /*
     * Sets the month selected through the month drop down list.
     */
    #changeMonth() {
        const selectedMonth = parseInt(this.#datepicker.querySelector('.months').value) + 1;
        // Update the month to display with the newly selected month.
        this.#dpMonth = selectedMonth;
    }

    /*
     * Sets the year selected through the year drop down list.
     */
    #changeYear() {
        const selectedYear = this.#datepicker.querySelector('.years').value;
        // Update the month to display with the newly selected year.
        this.#dpYear = selectedYear;
    }

    /*
     * Computes the days contained in the datepicker grid for a given month.
     */
    #getDays() {
        const days = [];
        // Get the number of days in the month to display.
        const nbDays = dayjs(this.#dpYear + '-' + this.#dpMonth).daysInMonth();

        // Figure out what is the first day of the month to display.
        // Returns the day as a number ie: 0 => sunday, 1 => monday ... 6 => saturday.
        const firstDayOfTheMonth = dayjs(this.#dpYear + '-' + this.#dpMonth + '-1').day();

        // Generate date for each day in the grid.
        let datepicker;
        let day;

        // The last days of the previous month have to be displayed.
        if (firstDayOfTheMonth > 0) {

            // Set the datepicker back a month.
            datepicker = dayjs(this.#dpYear + '-' + this.#dpMonth).subtract(1, 'month').format('YYYY-M').split('-');
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
                    days.push(this.#getDayObject(datepicker[0] + '-' + datepicker[1] + '-' + day, 'previous'));
                }
            }
        }

        // Loop through the days of the current month.
        for (let i = 0; i < nbDays; i++) {
            day = i + 1;
            days.push(this.#getDayObject(this.#dpYear + '-' + this.#dpMonth + '-' + day, 'current'));
        }

        // Compute the number of days needed to fill the datepicker grid.
        const nbDaysInNextMonth = (this.#rows * this.#columns) - days.length;
        // Set the datepicker forward a month.
        datepicker = dayjs(this.#dpYear + '-' + this.#dpMonth).add(1, 'month').format('YYYY-M').split('-');

        // Loop through the days of the next month.
        for (let i = 0; i < nbDaysInNextMonth; i++) {
            day = i + 1;
            days.push(this.#getDayObject(datepicker[0] + '-' + datepicker[1] + '-' + day, 'next'));

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
    #getDayObject(date, position) {
        // Get the day from the given date.
        let day = date.split('-')[2];

        let today = (date === this.#today) ? true : false;
        let selected = (date === this.#selectedDay) ? true : false;
        // Check for the possible min and max dates and set the disabled attribute accordingly.
        let disabled = (this.#params.minDate && dayjs(date).isBefore(this.#params.minDate)) || (this.#params.maxDate && dayjs(this.#params.maxDate).isBefore(date)) ? true : false;
        // Check again for the disabled days of the week (if any).
        disabled = this.#params.daysOfWeekDisabled && this.#params.daysOfWeekDisabled.includes(dayjs(date).day()) ? true : disabled;
        // Check again for the disabled dates (if any).
        disabled = this.#params.datesDisabled && this.#params.datesDisabled.includes(dayjs(date).format('YYYY-MM-DD')) ? true : disabled;

        return {'text': day, 'timestamp': dayjs(date).valueOf(), 'month': position, 'today': today, 'selected': selected, 'disabled': disabled};
    }

    /*
     * Sets the datepicker year and month values according to the min and max date parameters.
     */
    #setDates() {
        if (this.#params.minDate && dayjs(this.#dpYear + '-' + this.#dpMonth).isBefore(this.#params.minDate)) {
            let minDate = dayjs(this.#params.minDate).format('YYYY-M').split('-');
            this.#dpYear = minDate[0];
            this.#dpMonth = minDate[1];
        }

        if (this.#params.maxDate && dayjs(this.#params.maxDate).isBefore(this.#dpYear + '-' + this.#dpMonth)) {
            let maxDate = dayjs(this.#params.maxDate).format('YYYY-M').split('-');
            this.#dpYear = maxDate[0];
            this.#dpMonth = maxDate[1];
        }
    }

    /*
     * Sets the host input value to the newly selected date.
     */
    #setDate(timestamp) {
        // Fire the beforeSetDate event with the old selected date (if any).
        let date = this.#selectedDay ? dayjs(this.#selectedDay).format('YYYY-MM-DD') : null;
        this.#beforeSetDateEvent.detail.date = date;
        let time = date ? this.#selectedTime : null;
        this.#beforeSetDateEvent.detail.time = time;
        document.dispatchEvent(this.#beforeSetDateEvent);

        // Make sure the given timestamp is of the type number. (Note: add a plus sign to convert into number).
        timestamp = typeof timestamp != 'number' ? +timestamp : timestamp;
        // Get the selected date from the given timestamp.
        date = dayjs(timestamp).format('YYYY-MM-DD');
        // Add the time if needed.
        date = this.#params.timePicker ? date + ' ' + this.#getTime() : date;
        this.#getHostElement().value = dayjs(date).format(this.#params.format);

        // Unselect the old selected day in the datepicker grid.
        let oldDay = this.#datepicker.querySelector('.datepicker-grid .selected');

        if (oldDay) {
           oldDay.classList.remove('selected');
        }

        // Add the class to the newly selected day.
        let newDay = this.#datepicker.querySelector('[data-date="' + timestamp + '"]');

        if (newDay){
            newDay.classList.add('selected');
        } 

        // Update the selected day attribute.
        this.#selectedDay = dayjs(date).format('YYYY-M-D');

        // As well as the selected time attribute (if timePicker is active).
        if (this.#params.timePicker) {
            this.#selectedTime = this.#getTime();
        }

        // Fire the afterSetDate event with the newly selected date.
        this.#afterSetDateEvent.detail.date = dayjs(date).format('YYYY-MM-DD');
        time = this.#params.timePicker ? this.#getTime() : null;
        this.#afterSetDateEvent.detail.time = time;
        document.dispatchEvent(this.#afterSetDateEvent);
    }

    #clearDate() {
        // Fire the beforeClear event with the old selected date.
        let date = this.#selectedDay ? dayjs(this.#selectedDay).format('YYYY-MM-DD') : null;
        this.#beforeClearEvent.detail.date = date;
        let time = date ? this.#selectedTime : null;
        this.#beforeClearEvent.detail.time = time;
        document.dispatchEvent(this.#beforeClearEvent);

        this.#getHostElement().value = '';
        this.#selectedDay = null;
        this.#updateDatepicker();

        document.dispatchEvent(this.#afterClearEvent);
    }

    #setToday() {
        // Fire the beforeToday event with the old selected date (if any).
        let date = this.#selectedDay ? dayjs(this.#selectedDay).format('YYYY-MM-DD') : null;
        this.#beforeTodayEvent.detail.date = date;
        let time = date ? this.#selectedTime : null;
        this.#beforeTodayEvent.detail.time = time;
        document.dispatchEvent(this.#beforeTodayEvent);

        const today = dayjs().format("YYYY-MM-DD");
        const timestamp = dayjs(today).valueOf();
        this.#setDate(timestamp);

        document.dispatchEvent(this.#afterTodayEvent);
    }

    /*
     * Returns the selected time into the HH:mm format.
     */
    #getTime() {
        // Make sure the drop down lists of time exist.
        if (this.#params.timePicker) {
            let hour = this.#datepicker.querySelector('[name="hours"]').value;
            let minute = this.#datepicker.querySelector('[name="minutes"]').value;
            const TwelveHourClock = this.#params.timePicker24Hour ? false : true;

            // Check for meridiem format (am / pm)
            if (TwelveHourClock) {
                // Convert hour into 24 hour format.
                if (this.#datepicker.querySelector('[name="meridiems"]').value == 'pm') {
                    hour = hour < 12 ? +hour + 12 : 12;
                }
                // am
                else {
                    // 12 am is midnight in 12 hour clock. Thus zero in 24 hour clock. 
                    hour = hour < 12 ? hour : 0;

                }
            }

            // Check for zerofill.
            hour = hour < 10 ? '0' + hour : hour;
            minute = minute < 10 ? '0' + minute : minute;

            return hour + ':' + minute;
        }

        return null;
    }

    /*
     * Builds and returns the datepicker.
     */
    #renderDatepicker() {
        let html = `<div class="datepicker datepicker-dropdown datepicker-orient-left datepicker-orient-bottom">`+
                   `<div class="datepicker-picker">`+`<div class="datepicker-header">`+`<div class="datepicker-title" style="display: none;"></div>`+
                   `<div class="datepicker-controls">`;

        // Check for the min date and disable the previous button accordingly.
        let disabled = (this.#params.minDate && dayjs(dayjs(this.#dpYear + '-' + this.#dpMonth).subtract(1, 'month').format('YYYY-M')).isBefore(this.#params.minDate)) ? 'disabled' : '';
        html += `<button type="button" class="button prev-button prev-btn" `+ disabled +` tabindex="-1">«</button>`;

        // Build both the year and month drop down lists.
        if (this.#params.showDropdowns) {
            html += `<div class="datepicker-dropdown-date"><select name="months" class="months">`;

            for (let i = 0; i < this.#months.length; i++) {
                let selected = i == this.#dpMonth - 1 ? 'selected' : '';
                html += `<option value="` + i + `" ` + selected + `>` + this.#months[i] + `</option>`;
            }

            html += `</select><select name="years" class="years">`;

            for (let i = 0; i < this.#years.length; i++) {
                let selected = this.#years[i] == this.#dpYear ? 'selected' : '';
                html += `<option value="` + this.#years[i] + `" ` + selected + `>` + this.#years[i] + `</option>`;
            }

            html += `</select></div>`;
        }
        else {
            html += `<button type="button" class="button view-switch" tabindex="-1">`+dayjs(this.#dpYear + '-' + this.#dpMonth).format('MMMM YYYY')+`</button>`;
        }

        // Check for the max date and disable the next button accordingly.
        disabled = (this.#params.maxDate && dayjs(dayjs(this.#dpYear + '-' + this.#dpMonth).add(1, 'month').format('YYYY-M')).isAfter(this.#params.maxDate)) ? 'disabled' : '';
        html += `<button type="button" class="button next-button next-btn" `+ disabled +` tabindex="-1">»</button>`+`</div></div>`+
                `<div class="datepicker-main"><div class="datepicker-view"><div class="days"><div class="days-of-week">`;

        this.#getDaysOfWeek().forEach((day) => {
            html += `<span class="dow">`+day+`</span>`;
        });

        html += `</div><div class="datepicker-grid">`;

        const days = this.#getDays();
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
        if (this.#params.timePicker) {
            // Set the time units to explode according to the timePicker24Hour parameter.
            let format = this.#params.timePicker24Hour ? 'H:m' : 'h:m:a';
            let time = dayjs().format(format);
            // Explode the time units into an array.
            time = time.split(':');

            html += `<div class="datepicker-time"><select name="hours" class="hours">`;

            const hours = this.#params.timePicker24Hour ? this.#hours : 13;

            for (let i = 0; i < hours; i++) {
                // No zero hour in meridiem format.
                if (i === 0 && !this.#params.timePicker24Hour) {
                    continue;
                }

                let selected = i == time[0] ? 'selected' : '';
                html += `<option value="`+ i +`" `+ selected +`>`+ i +`</option>`;
            }

            html += `</select><select name="minutes" class="minutes">`;

            for (let i = 0; i < this.#minutes; i++) {
                let selected = i == time[1] ? 'selected' : '';
                let zerofill = i < 10 ? '0' : '';
                html += `<option value="`+ i +`" `+ selected +`>`+ zerofill + i +`</option>`;
            }

            html += `</select>`;

            // Build the meridiem drop down list.
            if (!this.#params.timePicker24Hour) {
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

        if (this.#params.today) {
            html += `<button type="button" class="ctrl-button today" tabindex="-1" >`+ CodaliaLang.datepicker['today'] +`</button>`;
        }

        if (this.#params.clear) {
            html += `<button type="button" class="ctrl-button clear" tabindex="-1" >`+ CodaliaLang.datepicker['clear'] +`</button>`;
        }

        if (this.#params.cancel) {
            html += `<button type="button" class="ctrl-button cancel" tabindex="-1" >`+ CodaliaLang.datepicker['cancel'] +`</button>`;
        }

        html += `</div></div></div>`;

        return html;
    }

    /*
     * Updates the grid as well as some parts of the datepicker according to the recent changes.
     */
    #updateDatepicker() {
        // Update the date drop down lists.
        if (this.#params.showDropdowns) {
            // Unselect the old selected month.
            this.#datepicker.querySelector('.months').selected = false;
            // Get the numeric value of the month to display (ie: 0 => January, 1 => February...).
            const monthNumeric = dayjs(this.#dpYear + '-' + this.#dpMonth).format('M') - 1;
            // Update the selected option.
            this.#datepicker.querySelector('.months option[value="'+ monthNumeric +'"]').selected = true;

            // Same with year.
            this.#datepicker.querySelector('.years').selected = false;
            const year = dayjs(this.#dpYear + '-' + this.#dpMonth).format('YYYY');
            this.#datepicker.querySelector('.years option[value="'+ year +'"]').selected = true;
        }
        // Update the text date.
        else {
            this.#datepicker.querySelector('.view-switch').innerHTML = dayjs(this.#dpYear + '-' + this.#dpMonth).format('MMMM YYYY');
        }

        // Update the datepicker grid.

        const days = this.#getDays();
        let grid = '';

        days.forEach((day) => {
            let extra = (day.month != 'current') ? day.month : '';
            extra += (day.today) ? ' today' : '';
            extra += (day.selected) ? ' selected' : '';
            extra += (day.disabled) ? ' disabled' : '';
            grid += `<span data-date="` + day.timestamp + `" class="datepicker-cell day ` + extra + `">` + day.text + `</span>`;
        });

        this.#datepicker.querySelector('.datepicker-grid').innerHTML = grid;

        // Update both the previous and next buttons according to the month currently displayed in the datepicker.

        this.#datepicker.querySelector('.prev-button').disabled = false;
        if (this.#params.minDate) {
            // Get the year and month of the min date to compare with the datepicker's.
            let minDate = dayjs(this.#params.minDate).format('YYYY-M');
            if (dayjs(dayjs(this.#dpYear + '-' + this.#dpMonth).subtract(1, 'month').format('YYYY-M')).isBefore(minDate)) {
                this.#datepicker.querySelector('.prev-button').disabled = true;
            }
        }

        this.#datepicker.querySelector('.next-button').disabled = false;
        if (this.#params.maxDate) {
            // Get the year and month of the min date to compare with the datepicker's.
            let maxDate = dayjs(this.#params.maxDate).format('YYYY-M');
            if (dayjs(dayjs(this.#dpYear + '-' + this.#dpMonth).add(1, 'month').format('YYYY-M')).isAfter(maxDate)) {
                this.#datepicker.querySelector('.next-button').disabled = true;
            }
        }

        // Update the time drop down lists only when it's called by the #setStartingDate function.
        if (this.#getCallerName() == '#setStartingDate' && this.#params.timePicker) {
            // Use a date in the past to get the time in the desired format.
            let time = dayjs('2001-01-01 ' + this.#selectedTime).format('H:m').split(':');
            let meridiem = 'am';

            // Convert the 24 hour time to 12 hour time.
            if (!this.#params.timePicker24Hour) {
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
            this.#datepicker.querySelector('.hours').selected = false;
            // Update the selected option.
            this.#datepicker.querySelector('.hours option[value="'+ time[0] +'"]').selected = true;
            // Unselect the old selected minute.
            this.#datepicker.querySelector('.minutes').selected = false;
            // Update the selected option.
            this.#datepicker.querySelector('.minutes option[value="'+ time[1] +'"]').selected = true;

            if (this.#datepicker.querySelector('.meridiems')) {
                this.#datepicker.querySelector('.meridiems').selected = false;
                this.#datepicker.querySelector('.meridiems option[value="'+ meridiem +'"]').selected = true;
            }
        }
    }

    /*
     * Called just one time through the callback function.
     */
    #setStartingDate(date) {
        if (this.#params.displayStartingDate) {
            this.#getHostElement().value = dayjs(date).format(this.#params.format);
        }

        this.#selectedDay = dayjs(date).format('YYYY-M-D');
        this.#dpMonth = dayjs(date).format('M');
        this.#dpYear = dayjs(date).format('YYYY');
        this.#selectedTime = this.#params.timePicker ? dayjs(date).format('HH:mm') : null;
        this.#updateDatepicker();
    }



    // Public methods.

    today(format) {
        format = format !== undefined ? format : this.#params.format;
        return dayjs().format(format);
    }

    current() {
        return dayjs(this.#dpYear + '-' + this.#dpMonth).format('YYYY-MM-DD');
    }

    setParams(params) {
        for (const key in params) {
            this.#params[key] = params[key];
        }
    }

    getParams(name) {
        return name === undefined ? this.#params : this.#params[name];
    }

    // Rebuilds all the datepicker.
    render() {
        this.#datepicker.innerHTML = this.#renderDatepicker();
    }

    clear() {
        this.#clearDate();
    }

    show() {
        this.#datepicker.style.display = 'block';
    }

    hide() {
        this.#datepicker.style.display = 'none';
    }

    getHostElement() {
        return this.#getHostElement();
    }

    getHostAttributes(name) {
        return name === undefined ? this.#host : this.#host[name];
    }
}

