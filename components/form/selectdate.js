/**
 * FFS UI - 日期选择器组件
 * 提供日期选择、时间选择、日期时间选择、周选择、月选择、季度选择、年选择和日期范围选择等功能
 */
(function ($) {
    'use strict';

    // 日期工具函数
    const DateUtil = {
        // 获取当前日期
        now: function () {
            return new Date();
        },

        // 格式化日期
        format: function (date, format) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();

            format = format.replace(/yyyy/g, year);
            format = format.replace(/MM/g, month < 10 ? '0' + month : month);
            format = format.replace(/M/g, month);
            format = format.replace(/dd/g, day < 10 ? '0' + day : day);
            format = format.replace(/d/g, day);
            format = format.replace(/HH/g, hours < 10 ? '0' + hours : hours);
            format = format.replace(/H/g, hours);
            format = format.replace(/mm/g, minutes < 10 ? '0' + minutes : minutes);
            format = format.replace(/m/g, minutes);
            format = format.replace(/ss/g, seconds < 10 ? '0' + seconds : seconds);
            format = format.replace(/s/g, seconds);

            return format;
        },

        // 解析日期
        parse: function (dateStr, format) {
            if (!dateStr) return null;

            const now = new Date();
            let year = now.getFullYear();
            let month = now.getMonth();
            let day = now.getDate();
            let hours = 0;
            let minutes = 0;
            let seconds = 0;

            if (format.includes('yyyy')) {
                year = parseInt(dateStr.substring(format.indexOf('yyyy'), format.indexOf('yyyy') + 4));
            }

            if (format.includes('MM')) {
                month = parseInt(dateStr.substring(format.indexOf('MM'), format.indexOf('MM') + 2)) - 1;
            } else if (format.includes('M')) {
                month = parseInt(dateStr.substring(format.indexOf('M'), format.indexOf('M') + 1)) - 1;
            }

            if (format.includes('dd')) {
                day = parseInt(dateStr.substring(format.indexOf('dd'), format.indexOf('dd') + 2));
            } else if (format.includes('d')) {
                day = parseInt(dateStr.substring(format.indexOf('d'), format.indexOf('d') + 1));
            }

            if (format.includes('HH')) {
                hours = parseInt(dateStr.substring(format.indexOf('HH'), format.indexOf('HH') + 2));
            } else if (format.includes('H')) {
                hours = parseInt(dateStr.substring(format.indexOf('H'), format.indexOf('H') + 1));
            }

            if (format.includes('mm')) {
                minutes = parseInt(dateStr.substring(format.indexOf('mm'), format.indexOf('mm') + 2));
            } else if (format.includes('m')) {
                minutes = parseInt(dateStr.substring(format.indexOf('m'), format.indexOf('m') + 1));
            }

            if (format.includes('ss')) {
                seconds = parseInt(dateStr.substring(format.indexOf('ss'), format.indexOf('ss') + 2));
            } else if (format.includes('s')) {
                seconds = parseInt(dateStr.substring(format.indexOf('s'), format.indexOf('s') + 1));
            }

            return new Date(year, month, day, hours, minutes, seconds);
        },

        // 获取月份的天数
        getDaysInMonth: function (year, month) {
            return new Date(year, month + 1, 0).getDate();
        },

        // 获取月份的第一天是星期几
        getFirstDayOfMonth: function (year, month) {
            return new Date(year, month, 1).getDay();
        },

        // 获取指定日期所在周的起止日期
        getWeekRange: function (date) {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 调整星期日

            const start = new Date(date);
            start.setDate(diff);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            return {
                start,
                end
            };
        },

        // 获取指定日期所在季度
        getQuarter: function (date) {
            const month = date.getMonth();
            return Math.floor(month / 3) + 1;
        },

        // 获取指定季度的起止日期
        getQuarterRange: function (year, quarter) {
            const startMonth = (quarter - 1) * 3;
            const endMonth = startMonth + 2;

            const start = new Date(year, startMonth, 1);
            const end = new Date(year, endMonth + 1, 0);

            return {
                start,
                end
            };
        },

        // 添加天数
        addDays: function (date, days) {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },

        // 添加月份
        addMonths: function (date, months) {
            const result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        },

        // 添加年份
        addYears: function (date, years) {
            const result = new Date(date);
            result.setFullYear(result.getFullYear() + years);
            return result;
        }
    };

    /**
     * 初始化日期选择器
     * 处理日期选择器的打开/关闭和选择事件
     */
    function initDatepicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-datepicker-picker', function (e) {
            const $picker = $(this);
            const $datepicker = $picker.closest('.ffs-datepicker');

            // 切换下拉菜单显示状态
            $datepicker.toggleClass('ffs-datepicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($datepicker.hasClass('ffs-datepicker-open')) {
                $('.ffs-datepicker').not($datepicker).removeClass('ffs-datepicker-open');

                // 初始化日历
                initCalendar($datepicker);
            }
        });

        // 点击日期
        $(document).on('click', '.ffs-datepicker-day:not(.ffs-datepicker-day-disabled)', function () {
            const $day = $(this);
            const $datepicker = $day.closest('.ffs-datepicker');
            const $label = $datepicker.find('.ffs-datepicker-label');
            const $hiddenInput = $datepicker.find('input[type="hidden"]');

            // 获取选中日期
            const year = parseInt($datepicker.data('year'));
            const month = parseInt($datepicker.data('month'));
            let day = parseInt($day.text());

            // 处理上个月/下个月的日期
            let selectedMonth = month;
            let selectedYear = year;

            if ($day.hasClass('ffs-datepicker-day-other-month')) {
                if (day > 20) {
                    // 上个月
                    selectedMonth = month - 1;
                    if (selectedMonth < 0) {
                        selectedMonth = 11;
                        selectedYear = year - 1;
                    }
                } else {
                    // 下个月
                    selectedMonth = month + 1;
                    if (selectedMonth > 11) {
                        selectedMonth = 0;
                        selectedYear = year + 1;
                    }
                }
            }

            // 创建日期对象
            const date = new Date(selectedYear, selectedMonth, day);

            // 更新选中状态
            $datepicker.find('.ffs-datepicker-day').removeClass('ffs-datepicker-day-selected');
            $day.addClass('ffs-datepicker-day-selected');

            // 更新显示文本
            const format = $datepicker.data('format') || 'yyyy-MM-dd';
            const dateText = DateUtil.format(date, format);
            $label.text(dateText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(dateText);
            }

            // 关闭下拉菜单
            $datepicker.removeClass('ffs-datepicker-open');

            // 触发选择事件
            $datepicker.trigger('datepicker:change', [date]);
        });

        // 点击上个月按钮
        $(document).on('click', '.ffs-datepicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $datepicker = $btn.closest('.ffs-datepicker');

            // 获取当前年月
            let year = parseInt($datepicker.data('year'));
            let month = parseInt($datepicker.data('month'));

            // 切换到上个月
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }

            // 更新日历
            updateCalendar($datepicker, year, month);
        });

        // 点击下个月按钮
        $(document).on('click', '.ffs-datepicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $datepicker = $btn.closest('.ffs-datepicker');

            // 获取当前年月
            let year = parseInt($datepicker.data('year'));
            let month = parseInt($datepicker.data('month'));

            // 切换到下个月
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }

            // 更新日历
            updateCalendar($datepicker, year, month);
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-datepicker').length) {
                $('.ffs-datepicker').removeClass('ffs-datepicker-open');
            }
        });

        // 初始化日历
        function initCalendar($datepicker) {
            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 获取选中日期
            const $hiddenInput = $datepicker.find('input[type="hidden"]');
            let selectedDate = null;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $datepicker.data('format') || 'yyyy-MM-dd';
                selectedDate = DateUtil.parse($hiddenInput.val(), format);
            }

            // 设置年月
            const year = selectedDate ? selectedDate.getFullYear() : currentYear;
            const month = selectedDate ? selectedDate.getMonth() : currentMonth;

            // 更新日历
            updateCalendar($datepicker, year, month, selectedDate);
        }

        // 更新日历
        function updateCalendar($datepicker, year, month, selectedDate = null) {
            // 保存年月
            $datepicker.data('year', year);
            $datepicker.data('month', month);

            // 更新标题
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            $datepicker.find('.ffs-datepicker-title').text(`${year}年${monthNames[month]}`);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();

            // 获取选中日期
            if (!selectedDate && $datepicker.find('input[type="hidden"]').length) {
                const format = $datepicker.data('format') || 'yyyy-MM-dd';
                selectedDate = DateUtil.parse($datepicker.find('input[type="hidden"]').val(), format);
            }

            // 获取月份的第一天是星期几
            const firstDayOfMonth = DateUtil.getFirstDayOfMonth(year, month);

            // 获取月份的天数
            const daysInMonth = DateUtil.getDaysInMonth(year, month);

            // 获取上个月的天数
            let prevMonth = month - 1;
            let prevYear = year;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);

            // 创建日历
            const $body = $datepicker.find('.ffs-datepicker-body');

            // 如果没有日历主体，则创建
            if (!$body.length) {
                const $dropdown = $datepicker.find('.ffs-datepicker-dropdown');

                // 创建日历头部
                if (!$dropdown.find('.ffs-datepicker-header').length) {
                    const $header = $(`
                        <div class="ffs-datepicker-header">
                            <div class="ffs-datepicker-title">${year}年${monthNames[month]}</div>
                            <div class="ffs-datepicker-nav">
                                <button class="ffs-datepicker-nav-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="ffs-datepicker-nav-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    `);

                    $dropdown.append($header);
                }

                // 创建日历主体
                const $calendarBody = $(`
                    <div class="ffs-datepicker-body">
                        <div class="ffs-datepicker-weekday">日</div>
                        <div class="ffs-datepicker-weekday">一</div>
                        <div class="ffs-datepicker-weekday">二</div>
                        <div class="ffs-datepicker-weekday">三</div>
                        <div class="ffs-datepicker-weekday">四</div>
                        <div class="ffs-datepicker-weekday">五</div>
                        <div class="ffs-datepicker-weekday">六</div>
                    </div>
                `);

                $dropdown.append($calendarBody);

                // 创建日历底部
                if ($datepicker.data('show-today') !== false) {
                    const $footer = $(`
                        <div class="ffs-datepicker-footer">
                            <button class="ffs-datepicker-today-btn">今天</button>
                        </div>
                    `);

                    $dropdown.append($footer);
                }
            }

            // 获取日历主体
            const $calendarBody = $datepicker.find('.ffs-datepicker-body');

            // 移除旧的日期
            $calendarBody.find('.ffs-datepicker-day').remove();

            // 添加上个月的日期
            for (let i = 0; i < firstDayOfMonth; i++) {
                const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                const $day = $(`<div class="ffs-datepicker-day ffs-datepicker-day-other-month">${day}</div>`);
                $calendarBody.append($day);
            }

            // 添加当前月的日期
            for (let i = 1; i <= daysInMonth; i++) {
                const $day = $(`<div class="ffs-datepicker-day">${i}</div>`);

                // 标记今天
                if (year === currentYear && month === currentMonth && i === currentDay) {
                    $day.addClass('ffs-datepicker-day-today');
                }

                // 标记选中日期
                if (selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && i === selectedDate.getDate()) {
                    $day.addClass('ffs-datepicker-day-selected');
                }

                $calendarBody.append($day);
            }

            // 添加下个月的日期
            const totalDays = firstDayOfMonth + daysInMonth;
            const remainingDays = 42 - totalDays; // 6行7列 = 42

            for (let i = 1; i <= remainingDays; i++) {
                const $day = $(`<div class="ffs-datepicker-day ffs-datepicker-day-other-month">${i}</div>`);
                $calendarBody.append($day);
            }
        }

        // 点击今天按钮
        $(document).on('click', '.ffs-datepicker-today-btn', function () {
            const $btn = $(this);
            const $datepicker = $btn.closest('.ffs-datepicker');
            const $label = $datepicker.find('.ffs-datepicker-label');
            const $hiddenInput = $datepicker.find('input[type="hidden"]');

            // 获取今天的日期
            const now = DateUtil.now();

            // 更新日历
            updateCalendar($datepicker, now.getFullYear(), now.getMonth(), now);

            // 更新显示文本
            const format = $datepicker.data('format') || 'yyyy-MM-dd';
            const dateText = DateUtil.format(now, format);
            $label.text(dateText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(dateText);
            }

            // 关闭下拉菜单
            $datepicker.removeClass('ffs-datepicker-open');

            // 触发选择事件
            $datepicker.trigger('datepicker:change', [now]);
        });
    }

    /**
     * 初始化时间选择器
     * 处理时间选择器的打开/关闭和选择事件
     */
    function initTimepicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-timepicker-picker', function (e) {
            const $picker = $(this);
            const $timepicker = $picker.closest('.ffs-timepicker');

            // 切换下拉菜单显示状态
            $timepicker.toggleClass('ffs-timepicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($timepicker.hasClass('ffs-timepicker-open')) {
                $('.ffs-timepicker').not($timepicker).removeClass('ffs-timepicker-open');

                // 初始化时间列表
                initTimeList($timepicker);
            }
        });

        // 点击时间项
        $(document).on('click', '.ffs-timepicker-item', function () {
            const $item = $(this);
            const $column = $item.closest('.ffs-timepicker-column');
            const $timepicker = $item.closest('.ffs-timepicker');
            const $label = $timepicker.find('.ffs-timepicker-label');
            const $hiddenInput = $timepicker.find('input[type="hidden"]');

            // 更新选中状态
            $column.find('.ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
            $item.addClass('ffs-timepicker-item-selected');

            // 获取选中的时间
            const hours = $timepicker.find('.ffs-timepicker-column:nth-child(1) .ffs-timepicker-item-selected').text() || '00';
            const minutes = $timepicker.find('.ffs-timepicker-column:nth-child(2) .ffs-timepicker-item-selected').text() || '00';
            const seconds = $timepicker.find('.ffs-timepicker-column:nth-child(3) .ffs-timepicker-item-selected').text() || '00';

            // 更新显示文本
            const timeText = `${hours}:${minutes}:${seconds}`;
            $label.text(timeText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(timeText);
            }

            // 如果是最后一列，则关闭下拉菜单
            if ($column.is(':last-child')) {
                $timepicker.removeClass('ffs-timepicker-open');
            }

            // 触发选择事件
            $timepicker.trigger('timepicker:change', [timeText]);
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-timepicker').length) {
                $('.ffs-timepicker').removeClass('ffs-timepicker-open');
            }
        });

        // 初始化时间列表
        function initTimeList($timepicker) {
            // 获取当前时间
            const now = DateUtil.now();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentSeconds = now.getSeconds();

            // 获取选中时间
            const $hiddenInput = $timepicker.find('input[type="hidden"]');
            let selectedHours = currentHours;
            let selectedMinutes = currentMinutes;
            let selectedSeconds = currentSeconds;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const timeArr = $hiddenInput.val().split(':');
                if (timeArr.length >= 3) {
                    selectedHours = parseInt(timeArr[0]);
                    selectedMinutes = parseInt(timeArr[1]);
                    selectedSeconds = parseInt(timeArr[2]);
                }
            }

            // 创建时间列表
            const $dropdown = $timepicker.find('.ffs-timepicker-dropdown');

            // 如果没有时间列表，则创建
            if (!$dropdown.find('.ffs-timepicker-column').length) {
                // 创建小时列
                const $hoursColumn = $('<div class="ffs-timepicker-column"></div>');
                for (let i = 0; i < 24; i++) {
                    const hours = i < 10 ? '0' + i : i;
                    const $item = $(`<div class="ffs-timepicker-item">${hours}</div>`);

                    if (i === selectedHours) {
                        $item.addClass('ffs-timepicker-item-selected');
                    }

                    $hoursColumn.append($item);
                }

                // 创建分钟列
                const $minutesColumn = $('<div class="ffs-timepicker-column"></div>');
                for (let i = 0; i < 60; i++) {
                    const minutes = i < 10 ? '0' + i : i;
                    const $item = $(`<div class="ffs-timepicker-item">${minutes}</div>`);

                    if (i === selectedMinutes) {
                        $item.addClass('ffs-timepicker-item-selected');
                    }

                    $minutesColumn.append($item);
                }

                // 创建秒钟列
                const $secondsColumn = $('<div class="ffs-timepicker-column"></div>');
                for (let i = 0; i < 60; i++) {
                    const seconds = i < 10 ? '0' + i : i;
                    const $item = $(`<div class="ffs-timepicker-item">${seconds}</div>`);

                    if (i === selectedSeconds) {
                        $item.addClass('ffs-timepicker-item-selected');
                    }

                    $secondsColumn.append($item);
                }

                // 添加到下拉菜单
                $dropdown.append($hoursColumn);
                $dropdown.append($minutesColumn);
                $dropdown.append($secondsColumn);
            } else {
                // 更新选中状态
                $dropdown.find('.ffs-timepicker-column:nth-child(1) .ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
                $dropdown.find(`.ffs-timepicker-column:nth-child(1) .ffs-timepicker-item:contains("${selectedHours < 10 ? '0' + selectedHours : selectedHours}")`).addClass('ffs-timepicker-item-selected');

                $dropdown.find('.ffs-timepicker-column:nth-child(2) .ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
                $dropdown.find(`.ffs-timepicker-column:nth-child(2) .ffs-timepicker-item:contains("${selectedMinutes < 10 ? '0' + selectedMinutes : selectedMinutes}")`).addClass('ffs-timepicker-item-selected');

                $dropdown.find('.ffs-timepicker-column:nth-child(3) .ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
                $dropdown.find(`.ffs-timepicker-column:nth-child(3) .ffs-timepicker-item:contains("${selectedSeconds < 10 ? '0' + selectedSeconds : selectedSeconds}")`).addClass('ffs-timepicker-item-selected');
            }

            // 滚动到选中项
            $dropdown.find('.ffs-timepicker-column').each(function () {
                const $column = $(this);
                const $selected = $column.find('.ffs-timepicker-item-selected');

                if ($selected.length) {
                    $column.scrollTop($selected.position().top - $column.height() / 2 + $selected.height() / 2);
                }
            });
        }
    }

    /**
     * 初始化日期时间选择器
     * 处理日期时间选择器的打开/关闭和选择事件
     */
    function initDatetimepicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-datetimepicker-picker', function (e) {
            const $picker = $(this);
            const $datetimepicker = $picker.closest('.ffs-datetimepicker');

            // 切换下拉菜单显示状态
            $datetimepicker.toggleClass('ffs-datetimepicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($datetimepicker.hasClass('ffs-datetimepicker-open')) {
                $('.ffs-datetimepicker').not($datetimepicker).removeClass('ffs-datetimepicker-open');

                // 初始化日期时间选择器
                initDatetimepickerContent($datetimepicker);
            }
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-datetimepicker').length) {
                $('.ffs-datetimepicker').removeClass('ffs-datetimepicker-open');
            }
        });

        // 点击标签切换内容
        $(document).on('click', '.ffs-datetimepicker-tab', function () {
            const $tab = $(this);
            const $datetimepicker = $tab.closest('.ffs-datetimepicker');
            const tabName = $tab.data('tab');

            // 更新标签选中状态
            $datetimepicker.find('.ffs-datetimepicker-tab').removeClass('ffs-datetimepicker-tab-active');
            $tab.addClass('ffs-datetimepicker-tab-active');

            // 更新内容显示状态
            $datetimepicker.find('.ffs-datetimepicker-content').removeClass('ffs-datetimepicker-content-active');
            $datetimepicker.find(`.ffs-datetimepicker-content[data-tab="${tabName}"]`).addClass('ffs-datetimepicker-content-active');
        });

        // 初始化日期时间选择器内容
        function initDatetimepickerContent($datetimepicker) {
            // 获取当前日期时间
            const now = DateUtil.now();

            // 获取选中日期时间
            const $hiddenInput = $datetimepicker.find('input[type="hidden"]');
            let selectedDate = null;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $datetimepicker.data('format') || 'yyyy-MM-dd HH:mm:ss';
                selectedDate = DateUtil.parse($hiddenInput.val(), format);
            }

            if (!selectedDate) {
                selectedDate = now;
            }

            // 创建日期时间选择器内容
            const $dropdown = $datetimepicker.find('.ffs-datetimepicker-dropdown');

            // 如果没有内容，则创建
            if (!$dropdown.find('.ffs-datetimepicker-tabs').length) {
                // 创建标签
                const $tabs = $(`
                        <div class="ffs-datetimepicker-tabs">
                            <div class="ffs-datetimepicker-tab ffs-datetimepicker-tab-active" data-tab="date">日期</div>
                            <div class="ffs-datetimepicker-tab" data-tab="time">时间</div>
                        </div>
                    `);

                // 创建内容
                const $contents = $(`
                        <div class="ffs-datetimepicker-contents">
                            <div class="ffs-datetimepicker-content ffs-datetimepicker-content-active" data-tab="date"></div>
                            <div class="ffs-datetimepicker-content" data-tab="time"></div>
                        </div>
                    `);

                // 添加到下拉菜单
                $dropdown.append($tabs);
                $dropdown.append($contents);

                // 创建日期选择器
                const $dateContent = $dropdown.find('.ffs-datetimepicker-content[data-tab="date"]');

                // 创建日历头部
                const year = selectedDate.getFullYear();
                const month = selectedDate.getMonth();
                const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

                const $header = $(`
                        <div class="ffs-datepicker-header">
                            <div class="ffs-datepicker-title">${year}年${monthNames[month]}</div>
                            <div class="ffs-datepicker-nav">
                                <button class="ffs-datepicker-nav-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="ffs-datepicker-nav-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    `);

                // 创建日历主体
                const $calendarBody = $(`
                        <div class="ffs-datepicker-body">
                            <div class="ffs-datepicker-weekday">日</div>
                            <div class="ffs-datepicker-weekday">一</div>
                            <div class="ffs-datepicker-weekday">二</div>
                            <div class="ffs-datepicker-weekday">三</div>
                            <div class="ffs-datepicker-weekday">四</div>
                            <div class="ffs-datepicker-weekday">五</div>
                            <div class="ffs-datepicker-weekday">六</div>
                        </div>
                    `);

                // 创建日历底部
                const $footer = $(`
                        <div class="ffs-datepicker-footer">
                            <button class="ffs-datepicker-today-btn">今天</button>
                        </div>
                    `);

                // 添加到日期内容
                $dateContent.append($header);
                $dateContent.append($calendarBody);
                $dateContent.append($footer);

                // 创建时间选择器
                const $timeContent = $dropdown.find('.ffs-datetimepicker-content[data-tab="time"]');

                // 创建时间列表
                const $timeList = $(`
                        <div class="ffs-timepicker-dropdown">
                            <div class="ffs-timepicker-column"></div>
                            <div class="ffs-timepicker-column"></div>
                            <div class="ffs-timepicker-column"></div>
                        </div>
                    `);

                // 添加到时间内容
                $timeContent.append($timeList);

                // 创建确认按钮
                const $confirm = $(`
                        <div class="ffs-datetimepicker-footer">
                            <button class="ffs-datetimepicker-confirm-btn">确认</button>
                        </div>
                    `);

                // 添加到下拉菜单
                $dropdown.append($confirm);
            }

            // 更新日期选择器
            updateDatetimepickerDate($datetimepicker, selectedDate);

            // 更新时间选择器
            updateDatetimepickerTime($datetimepicker, selectedDate);
        }

        // 更新日期时间选择器的日期部分
        function updateDatetimepickerDate($datetimepicker, date) {
            // 保存年月
            $datetimepicker.data('year', date.getFullYear());
            $datetimepicker.data('month', date.getMonth());

            // 更新标题
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            $datetimepicker.find('.ffs-datepicker-title').text(`${date.getFullYear()}年${monthNames[date.getMonth()]}`);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();

            // 获取月份的第一天是星期几
            const firstDayOfMonth = DateUtil.getFirstDayOfMonth(date.getFullYear(), date.getMonth());

            // 获取月份的天数
            const daysInMonth = DateUtil.getDaysInMonth(date.getFullYear(), date.getMonth());

            // 获取上个月的天数
            let prevMonth = date.getMonth() - 1;
            let prevYear = date.getFullYear();
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);

            // 获取日历主体
            const $calendarBody = $datetimepicker.find('.ffs-datepicker-body');

            // 移除旧的日期
            $calendarBody.find('.ffs-datepicker-day').remove();

            // 添加上个月的日期
            for (let i = 0; i < firstDayOfMonth; i++) {
                const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                const $day = $(`<div class="ffs-datepicker-day ffs-datepicker-day-other-month">${day}</div>`);
                $calendarBody.append($day);
            }

            // 添加当前月的日期
            for (let i = 1; i <= daysInMonth; i++) {
                const $day = $(`<div class="ffs-datepicker-day">${i}</div>`);

                // 标记今天
                if (date.getFullYear() === currentYear && date.getMonth() === currentMonth && i === currentDay) {
                    $day.addClass('ffs-datepicker-day-today');
                }

                // 标记选中日期
                if (i === date.getDate()) {
                    $day.addClass('ffs-datepicker-day-selected');
                }

                $calendarBody.append($day);
            }

            // 添加下个月的日期
            const totalDays = firstDayOfMonth + daysInMonth;
            const remainingDays = 42 - totalDays; // 6行7列 = 42

            for (let i = 1; i <= remainingDays; i++) {
                const $day = $(`<div class="ffs-datepicker-day ffs-datepicker-day-other-month">${i}</div>`);
                $calendarBody.append($day);
            }
        }

        // 更新日期时间选择器的时间部分
        function updateDatetimepickerTime($datetimepicker, date) {
            // 获取时间列表
            const $timeList = $datetimepicker.find('.ffs-timepicker-dropdown');

            // 获取小时、分钟、秒钟
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();

            // 更新小时列
            const $hoursColumn = $timeList.find('.ffs-timepicker-column:nth-child(1)');
            if (!$hoursColumn.find('.ffs-timepicker-item').length) {
                for (let i = 0; i < 24; i++) {
                    const hoursText = i < 10 ? '0' + i : i;
                    const $item = $(`<div class="ffs-timepicker-item">${hoursText}</div>`);

                    if (i === hours) {
                        $item.addClass('ffs-timepicker-item-selected');
                    }

                    $hoursColumn.append($item);
                }
            } else {
                $hoursColumn.find('.ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
                $hoursColumn.find(`.ffs-timepicker-item:contains("${hours < 10 ? '0' + hours : hours}")`).addClass('ffs-timepicker-item-selected');
            }

            // 更新分钟列
            const $minutesColumn = $timeList.find('.ffs-timepicker-column:nth-child(2)');
            if (!$minutesColumn.find('.ffs-timepicker-item').length) {
                for (let i = 0; i < 60; i++) {
                    const minutesText = i < 10 ? '0' + i : i;
                    const $item = $(`<div class="ffs-timepicker-item">${minutesText}</div>`);

                    if (i === minutes) {
                        $item.addClass('ffs-timepicker-item-selected');
                    }

                    $minutesColumn.append($item);
                }
            } else {
                $minutesColumn.find('.ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
                $minutesColumn.find(`.ffs-timepicker-item:contains("${minutes < 10 ? '0' + minutes : minutes}")`).addClass('ffs-timepicker-item-selected');
            }

            // 更新秒钟列
            const $secondsColumn = $timeList.find('.ffs-timepicker-column:nth-child(3)');
            if (!$secondsColumn.find('.ffs-timepicker-item').length) {
                for (let i = 0; i < 60; i++) {
                    const secondsText = i < 10 ? '0' + i : i;
                    const $item = $(`<div class="ffs-timepicker-item">${secondsText}</div>`);

                    if (i === seconds) {
                        $item.addClass('ffs-timepicker-item-selected');
                    }

                    $secondsColumn.append($item);
                }
            } else {
                $secondsColumn.find('.ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
                $secondsColumn.find(`.ffs-timepicker-item:contains("${seconds < 10 ? '0' + seconds : seconds}")`).addClass('ffs-timepicker-item-selected');
            }

            // 滚动到选中项
            $timeList.find('.ffs-timepicker-column').each(function () {
                const $column = $(this);
                const $selected = $column.find('.ffs-timepicker-item-selected');

                if ($selected.length) {
                    $column.scrollTop($selected.position().top - $column.height() / 2 + $selected.height() / 2);
                }
            });
        }

        // 点击日期时间选择器的日期
        $(document).on('click', '.ffs-datetimepicker .ffs-datepicker-day:not(.ffs-datepicker-day-disabled)', function () {
            const $day = $(this);
            const $datetimepicker = $day.closest('.ffs-datetimepicker');

            // 获取选中日期
            const year = parseInt($datetimepicker.data('year'));
            const month = parseInt($datetimepicker.data('month'));
            let day = parseInt($day.text());

            // 处理上个月/下个月的日期
            let selectedMonth = month;
            let selectedYear = year;

            if ($day.hasClass('ffs-datepicker-day-other-month')) {
                if (day > 20) {
                    // 上个月
                    selectedMonth = month - 1;
                    if (selectedMonth < 0) {
                        selectedMonth = 11;
                        selectedYear = year - 1;
                    }
                } else {
                    // 下个月
                    selectedMonth = month + 1;
                    if (selectedMonth > 11) {
                        selectedMonth = 0;
                        selectedYear = year + 1;
                    }
                }
            }

            // 更新选中状态
            $datetimepicker.find('.ffs-datepicker-day').removeClass('ffs-datepicker-day-selected');
            $day.addClass('ffs-datepicker-day-selected');

            // 获取当前选中的时间
            const hours = parseInt($datetimepicker.find('.ffs-timepicker-column:nth-child(1) .ffs-timepicker-item-selected').text() || '00');
            const minutes = parseInt($datetimepicker.find('.ffs-timepicker-column:nth-child(2) .ffs-timepicker-item-selected').text() || '00');
            const seconds = parseInt($datetimepicker.find('.ffs-timepicker-column:nth-child(3) .ffs-timepicker-item-selected').text() || '00');

            // 创建日期对象
            const date = new Date(selectedYear, selectedMonth, day, hours, minutes, seconds);

            // 更新日期时间选择器
            $datetimepicker.data('date', date);
        });

        // 点击日期时间选择器的上个月按钮
        $(document).on('click', '.ffs-datetimepicker .ffs-datepicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');

            // 获取当前年月
            let year = parseInt($datetimepicker.data('year'));
            let month = parseInt($datetimepicker.data('month'));

            // 切换到上个月
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }

            // 获取当前选中的日期
            const date = $datetimepicker.data('date') || DateUtil.now();

            // 更新日期
            date.setFullYear(year);
            date.setMonth(month);

            // 更新日期选择器
            updateDatetimepickerDate($datetimepicker, date);

            // 更新日期时间选择器
            $datetimepicker.data('date', date);
        });

        // 点击日期时间选择器的下个月按钮
        $(document).on('click', '.ffs-datetimepicker .ffs-datepicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');

            // 获取当前年月
            let year = parseInt($datetimepicker.data('year'));
            let month = parseInt($datetimepicker.data('month'));

            // 切换到下个月
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }

            // 获取当前选中的日期
            const date = $datetimepicker.data('date') || DateUtil.now();

            // 更新日期
            date.setFullYear(year);
            date.setMonth(month);

            // 更新日期选择器
            updateDatetimepickerDate($datetimepicker, date);

            // 更新日期时间选择器
            $datetimepicker.data('date', date);
        });

        // 点击日期时间选择器的今天按钮
        $(document).on('click', '.ffs-datetimepicker .ffs-datepicker-today-btn', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');

            // 获取今天的日期
            const now = DateUtil.now();

            // 获取当前选中的时间
            const date = $datetimepicker.data('date') || now;

            // 更新日期
            date.setFullYear(now.getFullYear());
            date.setMonth(now.getMonth());
            date.setDate(now.getDate());

            // 更新日期选择器
            updateDatetimepickerDate($datetimepicker, date);

            // 更新日期时间选择器
            $datetimepicker.data('date', date);
        });

        // 点击日期时间选择器的时间项
        $(document).on('click', '.ffs-datetimepicker .ffs-timepicker-item', function () {
            const $item = $(this);
            const $column = $item.closest('.ffs-timepicker-column');
            const $datetimepicker = $item.closest('.ffs-datetimepicker');

            // 更新选中状态
            $column.find('.ffs-timepicker-item').removeClass('ffs-timepicker-item-selected');
            $item.addClass('ffs-timepicker-item-selected');

            // 获取当前选中的日期
            const date = $datetimepicker.data('date') || DateUtil.now();

            // 获取选中的时间
            const hours = parseInt($datetimepicker.find('.ffs-timepicker-column:nth-child(1) .ffs-timepicker-item-selected').text() || '00');
            const minutes = parseInt($datetimepicker.find('.ffs-timepicker-column:nth-child(2) .ffs-timepicker-item-selected').text() || '00');
            const seconds = parseInt($datetimepicker.find('.ffs-timepicker-column:nth-child(3) .ffs-timepicker-item-selected').text() || '00');

            // 更新时间
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(seconds);

            // 更新日期时间选择器
            $datetimepicker.data('date', date);
        });

        // 点击日期时间选择器的确认按钮
        $(document).on('click', '.ffs-datetimepicker-confirm-btn', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');
            const $label = $datetimepicker.find('.ffs-datetimepicker-label');
            const $hiddenInput = $datetimepicker.find('input[type="hidden"]');

            // 获取选中的日期时间
            const date = $datetimepicker.data('date') || DateUtil.now();

            // 更新显示文本
            const format = $datetimepicker.data('format') || 'yyyy-MM-dd HH:mm:ss';
            const dateText = DateUtil.format(date, format);
            $label.text(dateText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(dateText);
            }

            // 关闭下拉菜单
            $datetimepicker.removeClass('ffs-datetimepicker-open');

            // 触发选择事件
            $datetimepicker.trigger('datetimepicker:change', [date]);
        });
    }

    /**
     * 初始化周选择器
     * 处理周选择器的打开/关闭和选择事件
     */
    function initWeekpicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-weekpicker-picker', function (e) {
            const $picker = $(this);
            const $weekpicker = $picker.closest('.ffs-weekpicker');

            // 切换下拉菜单显示状态
            $weekpicker.toggleClass('ffs-weekpicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($weekpicker.hasClass('ffs-weekpicker-open')) {
                $('.ffs-weekpicker').not($weekpicker).removeClass('ffs-weekpicker-open');

                // 初始化日历
                initWeekCalendar($weekpicker);
            }
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-weekpicker').length) {
                $('.ffs-weekpicker').removeClass('ffs-weekpicker-open');
            }
        });

        // 初始化周日历
        function initWeekCalendar($weekpicker) {
            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 获取选中日期
            const $hiddenInput = $weekpicker.find('input[type="hidden"]');
            let selectedDate = null;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $weekpicker.data('format') || 'yyyy-MM-dd';
                selectedDate = DateUtil.parse($hiddenInput.val(), format);
            }

            // 设置年月
            const year = selectedDate ? selectedDate.getFullYear() : currentYear;
            const month = selectedDate ? selectedDate.getMonth() : currentMonth;

            // 更新日历
            updateWeekCalendar($weekpicker, year, month, selectedDate);
        }

        // 更新周日历
        function updateWeekCalendar($weekpicker, year, month, selectedDate = null) {
            // 保存年月
            $weekpicker.data('year', year);
            $weekpicker.data('month', month);

            // 更新标题
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            $weekpicker.find('.ffs-weekpicker-title').text(`${year}年${monthNames[month]}`);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();

            // 获取月份的第一天是星期几
            const firstDayOfMonth = DateUtil.getFirstDayOfMonth(year, month);

            // 获取月份的天数
            const daysInMonth = DateUtil.getDaysInMonth(year, month);

            // 获取上个月的天数
            let prevMonth = month - 1;
            let prevYear = year;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);

            // 创建日历
            const $dropdown = $weekpicker.find('.ffs-weekpicker-dropdown');

            // 如果没有日历，则创建
            if (!$dropdown.find('.ffs-weekpicker-header').length) {
                // 创建日历头部
                const $header = $(`
                        <div class="ffs-weekpicker-header">
                            <div class="ffs-weekpicker-title">${year}年${monthNames[month]}</div>
                            <div class="ffs-weekpicker-nav">
                                <button class="ffs-weekpicker-nav-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="ffs-weekpicker-nav-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    `);

                // 创建日历主体
                const $calendarBody = $(`
                        <div class="ffs-weekpicker-body">
                            <div class="ffs-weekpicker-weekday">日</div>
                            <div class="ffs-weekpicker-weekday">一</div>
                            <div class="ffs-weekpicker-weekday">二</div>
                            <div class="ffs-weekpicker-weekday">三</div>
                            <div class="ffs-weekpicker-weekday">四</div>
                            <div class="ffs-weekpicker-weekday">五</div>
                            <div class="ffs-weekpicker-weekday">六</div>
                        </div>
                    `);

                // 创建日历底部
                const $footer = $(`
                        <div class="ffs-weekpicker-footer">
                            <button class="ffs-weekpicker-this-week-btn">本周</button>
                        </div>
                    `);

                // 添加到下拉菜单
                $dropdown.append($header);
                $dropdown.append($calendarBody);
                $dropdown.append($footer);
            }

            // 获取日历主体
            const $calendarBody = $dropdown.find('.ffs-weekpicker-body');

            // 移除旧的日期
            $calendarBody.find('.ffs-weekpicker-day, .ffs-weekpicker-week').remove();

            // 添加上个月的日期
            for (let i = 0; i < firstDayOfMonth; i++) {
                const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                const $day = $(`<div class="ffs-weekpicker-day ffs-weekpicker-day-other-month">${day}</div>`);
                $calendarBody.append($day);
            }

            // 添加当前月的日期
            for (let i = 1; i <= daysInMonth; i++) {
                const $day = $(`<div class="ffs-weekpicker-day">${i}</div>`);

                // 标记今天
                if (year === currentYear && month === currentMonth && i === currentDay) {
                    $day.addClass('ffs-weekpicker-day-today');
                }

                // 标记选中日期
                if (selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && i === selectedDate.getDate()) {
                    $day.addClass('ffs-weekpicker-day-selected');
                }

                $calendarBody.append($day);
            }

            // 添加下个月的日期
            const totalDays = firstDayOfMonth + daysInMonth;
            const remainingDays = 42 - totalDays; // 6行7列 = 42

            for (let i = 1; i <= remainingDays; i++) {
                const $day = $(`<div class="ffs-weekpicker-day ffs-weekpicker-day-other-month">${i}</div>`);
                $calendarBody.append($day);
            }

            // 添加周选择器
            const $days = $calendarBody.find('.ffs-weekpicker-day');
            for (let i = 0; i < 6; i++) {
                const $week = $(`<div class="ffs-weekpicker-week" data-week="${i + 1}"></div>`);
                $week.css({
                    top: `calc(${i} * (100% / 6) + 30px)`,
                    height: `calc(100% / 6)`,
                });
                $calendarBody.append($week);
            }

            // 标记当前周
            const currentWeek = DateUtil.getWeekOfMonth(now);
            if (year === currentYear && month === currentMonth) {
                $calendarBody.find(`.ffs-weekpicker-week[data-week="${currentWeek}"]`).addClass('ffs-weekpicker-week-current');
            }

            // 标记选中周
            if (selectedDate) {
                const selectedWeek = DateUtil.getWeekOfMonth(selectedDate);
                if (year === selectedDate.getFullYear() && month === selectedDate.getMonth()) {
                    $calendarBody.find(`.ffs-weekpicker-week[data-week="${selectedWeek}"]`).addClass('ffs-weekpicker-week-selected');
                }
            }
        }

        // 点击周选择器的周
        $(document).on('click', '.ffs-weekpicker-week', function () {
            const $week = $(this);
            const $weekpicker = $week.closest('.ffs-weekpicker');
            const $label = $weekpicker.find('.ffs-weekpicker-label');
            const $hiddenInput = $weekpicker.find('input[type="hidden"]');

            // 获取选中周
            const week = parseInt($week.data('week'));

            // 获取年月
            const year = parseInt($weekpicker.data('year'));
            const month = parseInt($weekpicker.data('month'));

            // 获取该周的第一天
            const firstDayOfMonth = DateUtil.getFirstDayOfMonth(year, month);
            const firstDayOfWeek = (week - 1) * 7 - firstDayOfMonth + 1;

            // 创建日期对象
            let date;
            if (firstDayOfWeek <= 0) {
                // 上个月
                let prevMonth = month - 1;
                let prevYear = year;
                if (prevMonth < 0) {
                    prevMonth = 11;
                    prevYear--;
                }
                const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);
                date = new Date(prevYear, prevMonth, daysInPrevMonth + firstDayOfWeek);
            } else if (firstDayOfWeek > DateUtil.getDaysInMonth(year, month)) {
                // 下个月
                let nextMonth = month + 1;
                let nextYear = year;
                if (nextMonth > 11) {
                    nextMonth = 0;
                    nextYear++;
                }
                date = new Date(nextYear, nextMonth, firstDayOfWeek - DateUtil.getDaysInMonth(year, month));
            } else {
                // 当前月
                date = new Date(year, month, firstDayOfWeek);
            }

            // 更新选中状态
            $weekpicker.find('.ffs-weekpicker-week').removeClass('ffs-weekpicker-week-selected');
            $week.addClass('ffs-weekpicker-week-selected');

            // 获取周的开始和结束日期
            const startDate = DateUtil.getFirstDayOfWeek(date);
            const endDate = DateUtil.getLastDayOfWeek(date);

            // 更新显示文本
            const format = $weekpicker.data('format') || 'yyyy-MM-dd';
            const startDateText = DateUtil.format(startDate, format);
            const endDateText = DateUtil.format(endDate, format);
            $label.text(`${startDateText} ~ ${endDateText}`);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(`${startDateText},${endDateText}`);
            }

            // 关闭下拉菜单
            $weekpicker.removeClass('ffs-weekpicker-open');

            // 触发选择事件
            $weekpicker.trigger('weekpicker:change', [startDate, endDate]);
        });

        // 点击周选择器的上个月按钮
        $(document).on('click', '.ffs-weekpicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $weekpicker = $btn.closest('.ffs-weekpicker');

            // 获取当前年月
            let year = parseInt($weekpicker.data('year'));
            let month = parseInt($weekpicker.data('month'));

            // 切换到上个月
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }

            // 获取选中日期
            const $hiddenInput = $weekpicker.find('input[type="hidden"]');
            let selectedDate = null;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const dateArr = $hiddenInput.val().split(',');
                if (dateArr.length >= 1) {
                    const format = $weekpicker.data('format') || 'yyyy-MM-dd';
                    selectedDate = DateUtil.parse(dateArr[0], format);
                }
            }

            // 更新日历
            updateWeekCalendar($weekpicker, year, month, selectedDate);
        });

        // 点击周选择器的下个月按钮
        $(document).on('click', '.ffs-weekpicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $weekpicker = $btn.closest('.ffs-weekpicker');

            // 获取当前年月
            let year = parseInt($weekpicker.data('year'));
            let month = parseInt($weekpicker.data('month'));

            // 切换到下个月
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }

            // 获取选中日期
            const $hiddenInput = $weekpicker.find('input[type="hidden"]');
            let selectedDate = null;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const dateArr = $hiddenInput.val().split(',');
                if (dateArr.length >= 1) {
                    const format = $weekpicker.data('format') || 'yyyy-MM-dd';
                    selectedDate = DateUtil.parse(dateArr[0], format);
                }
            }

            // 更新日历
            updateWeekCalendar($weekpicker, year, month, selectedDate);
        });

        // 点击周选择器的本周按钮
        $(document).on('click', '.ffs-weekpicker-this-week-btn', function () {
            const $btn = $(this);
            const $weekpicker = $btn.closest('.ffs-weekpicker');
            const $label = $weekpicker.find('.ffs-weekpicker-label');
            const $hiddenInput = $weekpicker.find('input[type="hidden"]');

            // 获取当前日期
            const now = DateUtil.now();

            // 获取周的开始和结束日期
            const startDate = DateUtil.getFirstDayOfWeek(now);
            const endDate = DateUtil.getLastDayOfWeek(now);

            // 更新日历
            updateWeekCalendar($weekpicker, now.getFullYear(), now.getMonth(), now);

            // 更新显示文本
            const format = $weekpicker.data('format') || 'yyyy-MM-dd';
            const startDateText = DateUtil.format(startDate, format);
            const endDateText = DateUtil.format(endDate, format);
            $label.text(`${startDateText} ~ ${endDateText}`);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(`${startDateText},${endDateText}`);
            }

            // 关闭下拉菜单
            $weekpicker.removeClass('ffs-weekpicker-open');

            // 触发选择事件
            $weekpicker.trigger('weekpicker:change', [startDate, endDate]);
        });
    }

    /**
     * 初始化月选择器
     * 处理月选择器的打开/关闭和选择事件
     */
    function initMonthpicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-monthpicker-picker', function (e) {
            const $picker = $(this);
            const $monthpicker = $picker.closest('.ffs-monthpicker');

            // 切换下拉菜单显示状态
            $monthpicker.toggleClass('ffs-monthpicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($monthpicker.hasClass('ffs-monthpicker-open')) {
                $('.ffs-monthpicker').not($monthpicker).removeClass('ffs-monthpicker-open');

                // 初始化月份选择器
                initMonthList($monthpicker);
            }
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-monthpicker').length) {
                $('.ffs-monthpicker').removeClass('ffs-monthpicker-open');
            }
        });

        // 初始化月份列表
        function initMonthList($monthpicker) {
            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 获取选中日期
            const $hiddenInput = $monthpicker.find('input[type="hidden"]');
            let selectedYear = currentYear;
            let selectedMonth = currentMonth;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $monthpicker.data('format') || 'yyyy-MM';
                const selectedDate = DateUtil.parse($hiddenInput.val(), format);
                if (selectedDate) {
                    selectedYear = selectedDate.getFullYear();
                    selectedMonth = selectedDate.getMonth();
                }
            }

            // 创建月份列表
            const $dropdown = $monthpicker.find('.ffs-monthpicker-dropdown');

            // 如果没有月份列表，则创建
            if (!$dropdown.find('.ffs-monthpicker-header').length) {
                // 创建头部
                const $header = $(`
                        <div class="ffs-monthpicker-header">
                            <div class="ffs-monthpicker-title">${selectedYear}年</div>
                            <div class="ffs-monthpicker-nav">
                                <button class="ffs-monthpicker-nav-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="ffs-monthpicker-nav-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    `);

                // 创建月份列表
                const $monthList = $('<div class="ffs-monthpicker-months"></div>');
                const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

                for (let i = 0; i < 12; i++) {
                    const $month = $(`<div class="ffs-monthpicker-month" data-month="${i}">${monthNames[i]}</div>`);

                    // 标记当前月份
                    if (selectedYear === currentYear && i === currentMonth) {
                        $month.addClass('ffs-monthpicker-month-current');
                    }

                    // 标记选中月份
                    if (i === selectedMonth) {
                        $month.addClass('ffs-monthpicker-month-selected');
                    }

                    $monthList.append($month);
                }

                // 创建底部
                const $footer = $(`
                        <div class="ffs-monthpicker-footer">
                            <button class="ffs-monthpicker-this-month-btn">本月</button>
                        </div>
                    `);

                // 添加到下拉菜单
                $dropdown.append($header);
                $dropdown.append($monthList);
                $dropdown.append($footer);
            } else {
                // 更新标题
                $dropdown.find('.ffs-monthpicker-title').text(`${selectedYear}年`);

                // 更新月份列表
                const $months = $dropdown.find('.ffs-monthpicker-month');
                $months.removeClass('ffs-monthpicker-month-current ffs-monthpicker-month-selected');

                // 标记当前月份
                if (selectedYear === currentYear) {
                    $months.eq(currentMonth).addClass('ffs-monthpicker-month-current');
                }

                // 标记选中月份
                $months.eq(selectedMonth).addClass('ffs-monthpicker-month-selected');
            }

            // 保存年份
            $monthpicker.data('year', selectedYear);
        }

        // 点击月份
        $(document).on('click', '.ffs-monthpicker-month', function () {
            const $month = $(this);
            const $monthpicker = $month.closest('.ffs-monthpicker');
            const $label = $monthpicker.find('.ffs-monthpicker-label');
            const $hiddenInput = $monthpicker.find('input[type="hidden"]');

            // 获取选中月份
            const month = parseInt($month.data('month'));
            const year = parseInt($monthpicker.data('year'));

            // 创建日期对象
            const date = new Date(year, month, 1);

            // 更新选中状态
            $monthpicker.find('.ffs-monthpicker-month').removeClass('ffs-monthpicker-month-selected');
            $month.addClass('ffs-monthpicker-month-selected');

            // 更新显示文本
            const format = $monthpicker.data('format') || 'yyyy-MM';
            const dateText = DateUtil.format(date, format);
            $label.text(dateText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(dateText);
            }

            // 关闭下拉菜单
            $monthpicker.removeClass('ffs-monthpicker-open');

            // 触发选择事件
            $monthpicker.trigger('monthpicker:change', [date]);
        });

        // 点击月选择器的上一年按钮
        $(document).on('click', '.ffs-monthpicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $monthpicker = $btn.closest('.ffs-monthpicker');

            // 获取当前年份
            let year = parseInt($monthpicker.data('year'));

            // 切换到上一年
            year--;

            // 更新月份列表
            $monthpicker.data('year', year);
            $monthpicker.find('.ffs-monthpicker-title').text(`${year}年`);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 更新月份列表
            const $months = $monthpicker.find('.ffs-monthpicker-month');
            $months.removeClass('ffs-monthpicker-month-current');

            // 标记当前月份
            if (year === currentYear) {
                $months.eq(currentMonth).addClass('ffs-monthpicker-month-current');
            }
        });

        // 点击月选择器的下一年按钮
        $(document).on('click', '.ffs-monthpicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $monthpicker = $btn.closest('.ffs-monthpicker');

            // 获取当前年份
            let year = parseInt($monthpicker.data('year'));

            // 切换到下一年
            year++;

            // 更新月份列表
            $monthpicker.data('year', year);
            $monthpicker.find('.ffs-monthpicker-title').text(`${year}年`);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 更新月份列表
            const $months = $monthpicker.find('.ffs-monthpicker-month');
            $months.removeClass('ffs-monthpicker-month-current');

            // 标记当前月份
            if (year === currentYear) {
                $months.eq(currentMonth).addClass('ffs-monthpicker-month-current');
            }
        });

        // 点击月选择器的本月按钮
        $(document).on('click', '.ffs-monthpicker-this-month-btn', function () {
            const $btn = $(this);
            const $monthpicker = $btn.closest('.ffs-monthpicker');
            const $label = $monthpicker.find('.ffs-monthpicker-label');
            const $hiddenInput = $monthpicker.find('input[type="hidden"]');

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 创建日期对象
            const date = new Date(currentYear, currentMonth, 1);

            // 更新月份列表
            $monthpicker.data('year', currentYear);
            $monthpicker.find('.ffs-monthpicker-title').text(`${currentYear}年`);

            // 更新月份列表
            const $months = $monthpicker.find('.ffs-monthpicker-month');
            $months.removeClass('ffs-monthpicker-month-current ffs-monthpicker-month-selected');
            $months.eq(currentMonth).addClass('ffs-monthpicker-month-current ffs-monthpicker-month-selected');

            // 更新显示文本
            const format = $monthpicker.data('format') || 'yyyy-MM';
            const dateText = DateUtil.format(date, format);
            $label.text(dateText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(dateText);
            }

            // 关闭下拉菜单
            $monthpicker.removeClass('ffs-monthpicker-open');

            // 触发选择事件
            $monthpicker.trigger('monthpicker:change', [date]);
        });
    }

    /**
     * 初始化年选择器
     * 处理年选择器的打开/关闭和选择事件
     */
    function initYearpicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-yearpicker-picker', function (e) {
            const $picker = $(this);
            const $yearpicker = $picker.closest('.ffs-yearpicker');

            // 切换下拉菜单显示状态
            $yearpicker.toggleClass('ffs-yearpicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($yearpicker.hasClass('ffs-yearpicker-open')) {
                $('.ffs-yearpicker').not($yearpicker).removeClass('ffs-yearpicker-open');

                // 初始化年份选择器
                initYearList($yearpicker);
            }
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-yearpicker').length) {
                $('.ffs-yearpicker').removeClass('ffs-yearpicker-open');
            }
        });

        // 初始化年份列表
        function initYearList($yearpicker) {
            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();

            // 获取选中日期
            const $hiddenInput = $yearpicker.find('input[type="hidden"]');
            let selectedYear = currentYear;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $yearpicker.data('format') || 'yyyy';
                const selectedDate = DateUtil.parse($hiddenInput.val(), format);
                if (selectedDate) {
                    selectedYear = selectedDate.getFullYear();
                }
            }

            // 计算年份范围
            let startYear = Math.floor(selectedYear / 10) * 10;
            let endYear = startYear + 9;

            // 创建年份列表
            const $dropdown = $yearpicker.find('.ffs-yearpicker-dropdown');

            // 如果没有年份列表，则创建
            if (!$dropdown.find('.ffs-yearpicker-header').length) {
                // 创建头部
                const $header = $(`
                        <div class="ffs-yearpicker-header">
                            <div class="ffs-yearpicker-title">${startYear} - ${endYear}</div>
                            <div class="ffs-yearpicker-nav">
                                <button class="ffs-yearpicker-nav-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="ffs-yearpicker-nav-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    `);

                // 创建年份列表
                const $yearList = $('<div class="ffs-yearpicker-years"></div>');

                for (let i = startYear; i <= endYear; i++) {
                    const $year = $(`<div class="ffs-yearpicker-year" data-year="${i}">${i}</div>`);

                    // 标记当前年份
                    if (i === currentYear) {
                        $year.addClass('ffs-yearpicker-year-current');
                    }

                    // 标记选中年份
                    if (i === selectedYear) {
                        $year.addClass('ffs-yearpicker-year-selected');
                    }

                    $yearList.append($year);
                }

                // 创建底部
                const $footer = $(`
                        <div class="ffs-yearpicker-footer">
                            <button class="ffs-yearpicker-this-year-btn">今年</button>
                        </div>
                    `);

                // 添加到下拉菜单
                $dropdown.append($header);
                $dropdown.append($yearList);
                $dropdown.append($footer);
            } else {
                // 更新标题
                $dropdown.find('.ffs-yearpicker-title').text(`${startYear} - ${endYear}`);

                // 更新年份列表
                const $yearList = $dropdown.find('.ffs-yearpicker-years');
                $yearList.empty();

                for (let i = startYear; i <= endYear; i++) {
                    const $year = $(`<div class="ffs-yearpicker-year" data-year="${i}">${i}</div>`);

                    // 标记当前年份
                    if (i === currentYear) {
                        $year.addClass('ffs-yearpicker-year-current');
                    }

                    // 标记选中年份
                    if (i === selectedYear) {
                        $year.addClass('ffs-yearpicker-year-selected');
                    }

                    $yearList.append($year);
                }
            }

            // 保存年份范围
            $yearpicker.data('startYear', startYear);
            $yearpicker.data('endYear', endYear);
        }

        // 点击年份
        $(document).on('click', '.ffs-yearpicker-year', function () {
            const $year = $(this);
            const $yearpicker = $year.closest('.ffs-yearpicker');
            const $label = $yearpicker.find('.ffs-yearpicker-label');
            const $hiddenInput = $yearpicker.find('input[type="hidden"]');

            // 获取选中年份
            const year = parseInt($year.data('year'));

            // 创建日期对象
            const date = new Date(year, 0, 1);

            // 更新选中状态
            $yearpicker.find('.ffs-yearpicker-year').removeClass('ffs-yearpicker-year-selected');
            $year.addClass('ffs-yearpicker-year-selected');

            // 更新显示文本
            const format = $yearpicker.data('format') || 'yyyy';
            const dateText = DateUtil.format(date, format);
            $label.text(dateText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(dateText);
            }

            // 关闭下拉菜单
            $yearpicker.removeClass('ffs-yearpicker-open');

            // 触发选择事件
            $yearpicker.trigger('yearpicker:change', [date]);
        });

        // 点击年选择器的上一页按钮
        $(document).on('click', '.ffs-yearpicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $yearpicker = $btn.closest('.ffs-yearpicker');

            // 获取当前年份范围
            let startYear = parseInt($yearpicker.data('startYear'));
            let endYear = parseInt($yearpicker.data('endYear'));

            // 切换到上一页
            startYear -= 10;
            endYear -= 10;

            // 更新年份列表
            $yearpicker.data('startYear', startYear);
            $yearpicker.data('endYear', endYear);
            $yearpicker.find('.ffs-yearpicker-title').text(`${startYear} - ${endYear}`);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();

            // 获取选中年份
            const $hiddenInput = $yearpicker.find('input[type="hidden"]');
            let selectedYear = currentYear;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $yearpicker.data('format') || 'yyyy';
                const selectedDate = DateUtil.parse($hiddenInput.val(), format);
                if (selectedDate) {
                    selectedYear = selectedDate.getFullYear();
                }
            }

            // 更新年份列表
            const $yearList = $yearpicker.find('.ffs-yearpicker-years');
            $yearList.empty();

            for (let i = startYear; i <= endYear; i++) {
                const $year = $(`<div class="ffs-yearpicker-year" data-year="${i}">${i}</div>`);

                // 标记当前年份
                if (i === currentYear) {
                    $year.addClass('ffs-yearpicker-year-current');
                }

                // 标记选中年份
                if (i === selectedYear) {
                    $year.addClass('ffs-yearpicker-year-selected');
                }

                $yearList.append($year);
            }
        });

        // 点击年选择器的下一页按钮
        $(document).on('click', '.ffs-yearpicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $yearpicker = $btn.closest('.ffs-yearpicker');

            // 获取当前年份范围
            let startYear = parseInt($yearpicker.data('startYear'));
            let endYear = parseInt($yearpicker.data('endYear'));

            // 切换到下一页
            startYear += 10;
            endYear += 10;

            // 更新年份列表
            $yearpicker.data('startYear', startYear);
            $yearpicker.data('endYear', endYear);
            $yearpicker.find('.ffs-yearpicker-title').text(`${startYear} - ${endYear}`);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();

            // 获取选中年份
            const $hiddenInput = $yearpicker.find('input[type="hidden"]');
            let selectedYear = currentYear;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $yearpicker.data('format') || 'yyyy';
                const selectedDate = DateUtil.parse($hiddenInput.val(), format);
                if (selectedDate) {
                    selectedYear = selectedDate.getFullYear();
                }
            }

            // 更新年份列表
            const $yearList = $yearpicker.find('.ffs-yearpicker-years');
            $yearList.empty();

            for (let i = startYear; i <= endYear; i++) {
                const $year = $(`<div class="ffs-yearpicker-year" data-year="${i}">${i}</div>`);

                // 标记当前年份
                if (i === currentYear) {
                    $year.addClass('ffs-yearpicker-year-current');
                }

                // 标记选中年份
                if (i === selectedYear) {
                    $year.addClass('ffs-yearpicker-year-selected');
                }

                $yearList.append($year);
            }
        });

        // 点击年选择器的今年按钮
        $(document).on('click', '.ffs-yearpicker-this-year-btn', function () {
            const $btn = $(this);
            const $yearpicker = $btn.closest('.ffs-yearpicker');
            const $label = $yearpicker.find('.ffs-yearpicker-label');
            const $hiddenInput = $yearpicker.find('input[type="hidden"]');

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();

            // 创建日期对象
            const date = new Date(currentYear, 0, 1);

            // 计算年份范围
            let startYear = Math.floor(currentYear / 10) * 10;
            let endYear = startYear + 9;

            // 更新年份列表
            $yearpicker.data('startYear', startYear);
            $yearpicker.data('endYear', endYear);
            $yearpicker.find('.ffs-yearpicker-title').text(`${startYear} - ${endYear}`);

            // 更新年份列表
            const $yearList = $yearpicker.find('.ffs-yearpicker-years');
            $yearList.empty();

            for (let i = startYear; i <= endYear; i++) {
                const $year = $(`<div class="ffs-yearpicker-year" data-year="${i}">${i}</div>`);

                // 标记当前年份
                if (i === currentYear) {
                    $year.addClass('ffs-yearpicker-year-current ffs-yearpicker-year-selected');
                }

                $yearList.append($year);
            }

            // 更新显示文本
            const format = $yearpicker.data('format') || 'yyyy';
            const dateText = DateUtil.format(date, format);
            $label.text(dateText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(dateText);
            }

            // 关闭下拉菜单
            $yearpicker.removeClass('ffs-yearpicker-open');

            // 触发选择事件
            $yearpicker.trigger('yearpicker:change', [date]);
        });
    }

    /**
     * 初始化日期范围选择器
     * 处理日期范围选择器的打开/关闭和选择事件
     */
    function initDaterangepicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-daterangepicker-picker', function (e) {
            const $picker = $(this);
            const $daterangepicker = $picker.closest('.ffs-daterangepicker');

            // 切换下拉菜单显示状态
            $daterangepicker.toggleClass('ffs-daterangepicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($daterangepicker.hasClass('ffs-daterangepicker-open')) {
                $('.ffs-daterangepicker').not($daterangepicker).removeClass('ffs-daterangepicker-open');

                // 初始化日历
                initDaterangeCalendar($daterangepicker);
            }
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-daterangepicker').length) {
                $('.ffs-daterangepicker').removeClass('ffs-daterangepicker-open');
            }
        });

        // 初始化日期范围日历
        function initDaterangeCalendar($daterangepicker) {
            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 获取选中日期范围
            const $hiddenInput = $daterangepicker.find('input[type="hidden"]');
            let startDate = null;
            let endDate = null;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const dateArr = $hiddenInput.val().split(',');
                if (dateArr.length >= 2) {
                    const format = $daterangepicker.data('format') || 'yyyy-MM-dd';
                    startDate = DateUtil.parse(dateArr[0], format);
                    endDate = DateUtil.parse(dateArr[1], format);
                }
            }

            // 设置左侧日历的年月
            const leftYear = startDate ? startDate.getFullYear() : currentYear;
            const leftMonth = startDate ? startDate.getMonth() : currentMonth;

            // 设置右侧日历的年月
            let rightYear = leftYear;
            let rightMonth = leftMonth + 1;
            if (rightMonth > 11) {
                rightMonth = 0;
                rightYear++;
            }

            // 更新日历
            updateDaterangeCalendar($daterangepicker, leftYear, leftMonth, rightYear, rightMonth, startDate, endDate);
        }

        // 更新日期范围日历
        function updateDaterangeCalendar($daterangepicker, leftYear, leftMonth, rightYear, rightMonth, startDate = null, endDate = null) {
            // 保存年月
            $daterangepicker.data('leftYear', leftYear);
            $daterangepicker.data('leftMonth', leftMonth);
            $daterangepicker.data('rightYear', rightYear);
            $daterangepicker.data('rightMonth', rightMonth);

            // 获取当前日期
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();

            // 创建日历
            const $dropdown = $daterangepicker.find('.ffs-daterangepicker-dropdown');

            // 如果没有日历，则创建
            if (!$dropdown.find('.ffs-daterangepicker-calendars').length) {
                // 创建日历容器
                const $calendars = $('<div class="ffs-daterangepicker-calendars"></div>');

                // 创建左侧日历
                const $leftCalendar = createDaterangeCalendar('left', leftYear, leftMonth, startDate, endDate, now);

                // 创建右侧日历
                const $rightCalendar = createDaterangeCalendar('right', rightYear, rightMonth, startDate, endDate, now);

                // 添加到日历容器
                $calendars.append($leftCalendar);
                $calendars.append($rightCalendar);

                // 创建底部
                const $footer = $(`
                        <div class="ffs-daterangepicker-footer">
                            <div class="ffs-daterangepicker-shortcuts">
                                <button class="ffs-daterangepicker-shortcut" data-range="today">今天</button>
                                <button class="ffs-daterangepicker-shortcut" data-range="yesterday">昨天</button>
                                <button class="ffs-daterangepicker-shortcut" data-range="thisWeek">本周</button>
                                <button class="ffs-daterangepicker-shortcut" data-range="lastWeek">上周</button>
                                <button class="ffs-daterangepicker-shortcut" data-range="thisMonth">本月</button>
                                <button class="ffs-daterangepicker-shortcut" data-range="lastMonth">上月</button>
                                <button class="ffs-daterangepicker-shortcut" data-range="thisYear">今年</button>
                                <button class="ffs-daterangepicker-shortcut" data-range="lastYear">去年</button>
                            </div>
                            <div class="ffs-daterangepicker-buttons">
                                <button class="ffs-daterangepicker-clear-btn">清空</button>
                                <button class="ffs-daterangepicker-confirm-btn">确定</button>
                            </div>
                        </div>
                    `);

                // 添加到下拉菜单
                $dropdown.append($calendars);
                $dropdown.append($footer);
            } else {
                // 更新左侧日历
                updateSingleDaterangeCalendar($dropdown.find('.ffs-daterangepicker-calendar[data-side="left"]'), leftYear, leftMonth, startDate, endDate, now);

                // 更新右侧日历
                updateSingleDaterangeCalendar($dropdown.find('.ffs-daterangepicker-calendar[data-side="right"]'), rightYear, rightMonth, startDate, endDate, now);
            }

            // 创建单个日历
            function createDaterangeCalendar(side, year, month, startDate, endDate, now) {
                const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

                // 创建日历容器
                const $calendar = $(`<div class="ffs-daterangepicker-calendar" data-side="${side}"></div>`);

                // 创建日历头部
                const $header = $(`
                        <div class="ffs-daterangepicker-header">
                            <div class="ffs-daterangepicker-title">${year}年${monthNames[month]}</div>
                            <div class="ffs-daterangepicker-nav">
                                <button class="ffs-daterangepicker-nav-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="ffs-daterangepicker-nav-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    `);

                // 创建日历主体
                const $calendarBody = $(`
                        <div class="ffs-daterangepicker-body">
                            <div class="ffs-daterangepicker-weekday">日</div>
                            <div class="ffs-daterangepicker-weekday">一</div>
                            <div class="ffs-daterangepicker-weekday">二</div>
                            <div class="ffs-daterangepicker-weekday">三</div>
                            <div class="ffs-daterangepicker-weekday">四</div>
                            <div class="ffs-daterangepicker-weekday">五</div>
                            <div class="ffs-daterangepicker-weekday">六</div>
                        </div>
                    `);

                // 获取月份的第一天是星期几
                const firstDayOfMonth = DateUtil.getFirstDayOfMonth(year, month);

                // 获取月份的天数
                const daysInMonth = DateUtil.getDaysInMonth(year, month);

                // 获取上个月的天数
                let prevMonth = month - 1;
                let prevYear = year;
                if (prevMonth < 0) {
                    prevMonth = 11;
                    prevYear--;
                }
                const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);

                // 添加上个月的日期
                for (let i = 0; i < firstDayOfMonth; i++) {
                    const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                    const $day = $(`<div class="ffs-daterangepicker-day ffs-daterangepicker-day-other-month">${day}</div>`);
                    $calendarBody.append($day);
                }

                // 添加当前月的日期
                for (let i = 1; i <= daysInMonth; i++) {
                    const $day = $(`<div class="ffs-daterangepicker-day" data-date="${year}-${month + 1}-${i}">${i}</div>`);

                    // 标记今天
                    if (year === now.getFullYear() && month === now.getMonth() && i === now.getDate()) {
                        $day.addClass('ffs-daterangepicker-day-today');
                    }

                    // 标记选中范围
                    if (startDate && endDate) {
                        const date = new Date(year, month, i);

                        // 标记开始日期
                        if (date.getFullYear() === startDate.getFullYear() && date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate()) {
                            $day.addClass('ffs-daterangepicker-day-start');
                        }

                        // 标记结束日期
                        if (date.getFullYear() === endDate.getFullYear() && date.getMonth() === endDate.getMonth() && date.getDate() === endDate.getDate()) {
                            $day.addClass('ffs-daterangepicker-day-end');
                        }

                        // 标记范围内的日期
                        if (date >= startDate && date <= endDate) {
                            $day.addClass('ffs-daterangepicker-day-in-range');
                        }
                    }

                    $calendarBody.append($day);
                }

                // 添加下个月的日期
                const daysToAdd = 42 - firstDayOfMonth - daysInMonth;
                for (let i = 1; i <= daysToAdd; i++) {
                    const $day = $(`<div class="ffs-daterangepicker-day ffs-daterangepicker-day-other-month">${i}</div>`);
                    $calendarBody.append($day);
                }

                // 添加到日历
                $calendar.append($header);
                $calendar.append($calendarBody);

                return $calendar;
            }

            // 更新单个日历
            function updateSingleDaterangeCalendar($calendar, year, month, startDate, endDate, now) {
                const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

                // 更新标题
                $calendar.find('.ffs-daterangepicker-title').text(`${year}年${monthNames[month]}`);

                // 更新日历主体
                const $calendarBody = $calendar.find('.ffs-daterangepicker-body');
                $calendarBody.empty();

                // 添加星期标题
                $calendarBody.append(`
                        <div class="ffs-daterangepicker-weekday">日</div>
                        <div class="ffs-daterangepicker-weekday">一</div>
                        <div class="ffs-daterangepicker-weekday">二</div>
                        <div class="ffs-daterangepicker-weekday">三</div>
                        <div class="ffs-daterangepicker-weekday">四</div>
                        <div class="ffs-daterangepicker-weekday">五</div>
                        <div class="ffs-daterangepicker-weekday">六</div>
                    `);

                // 获取月份的第一天是星期几
                const firstDayOfMonth = DateUtil.getFirstDayOfMonth(year, month);

                // 获取月份的天数
                const daysInMonth = DateUtil.getDaysInMonth(year, month);

                // 获取上个月的天数
                let prevMonth = month - 1;
                let prevYear = year;
                if (prevMonth < 0) {
                    prevMonth = 11;
                    prevYear--;
                }
                const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);

                // 添加上个月的日期
                for (let i = 0; i < firstDayOfMonth; i++) {
                    const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                    const $day = $(`<div class="ffs-daterangepicker-day ffs-daterangepicker-day-other-month">${day}</div>`);
                    $calendarBody.append($day);
                }

                // 添加当前月的日期
                for (let i = 1; i <= daysInMonth; i++) {
                    const $day = $(`<div class="ffs-daterangepicker-day" data-date="${year}-${month + 1}-${i}">${i}</div>`);

                    // 标记今天
                    if (year === now.getFullYear() && month === now.getMonth() && i === now.getDate()) {
                        $day.addClass('ffs-daterangepicker-day-today');
                    }

                    // 标记选中范围
                    if (startDate && endDate) {
                        const date = new Date(year, month, i);

                        // 标记开始日期
                        if (date.getFullYear() === startDate.getFullYear() && date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate()) {
                            $day.addClass('ffs-daterangepicker-day-start');
                        }

                        // 标记结束日期
                        if (date.getFullYear() === endDate.getFullYear() && date.getMonth() === endDate.getMonth() && date.getDate() === endDate.getDate()) {
                            $day.addClass('ffs-daterangepicker-day-end');
                        }

                        // 标记范围内的日期
                        if (date >= startDate && date <= endDate) {
                            $day.addClass('ffs-daterangepicker-day-in-range');
                        }
                    }

                    $calendarBody.append($day);
                }

                // 添加下个月的日期
                const daysToAdd = 42 - firstDayOfMonth - daysInMonth;
                for (let i = 1; i <= daysToAdd; i++) {
                    const $day = $(`<div class="ffs-daterangepicker-day ffs-daterangepicker-day-other-month">${i}</div>`);
                    $calendarBody.append($day);
                }
            }
        }

        // 保存选中的日期范围
        let selectedStartDate = null;
        let selectedEndDate = null;

        // 点击日期
        $(document).on('click', '.ffs-daterangepicker-day:not(.ffs-daterangepicker-day-other-month)', function () {
            const $day = $(this);
            const $calendar = $day.closest('.ffs-daterangepicker-calendar');
            const $daterangepicker = $calendar.closest('.ffs-daterangepicker');

            // 获取选中日期
            const dateStr = $day.data('date');
            const dateParts = dateStr.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            const date = new Date(year, month, day);

            // 如果没有选中开始日期或者已经选中了结束日期，则重新开始选择
            if (!selectedStartDate || selectedEndDate) {
                // 清除之前的选择
                $daterangepicker.find('.ffs-daterangepicker-day').removeClass('ffs-daterangepicker-day-start ffs-daterangepicker-day-end ffs-daterangepicker-day-in-range');

                // 设置开始日期
                selectedStartDate = date;
                selectedEndDate = null;

                // 标记开始日期
                $day.addClass('ffs-daterangepicker-day-start');
            } else {
                // 如果选中的日期早于开始日期，则交换开始和结束日期
                if (date < selectedStartDate) {
                    selectedEndDate = selectedStartDate;
                    selectedStartDate = date;
                } else {
                    selectedEndDate = date;
                }

                // 清除之前的选择
                $daterangepicker.find('.ffs-daterangepicker-day').removeClass('ffs-daterangepicker-day-start ffs-daterangepicker-day-end ffs-daterangepicker-day-in-range');

                // 标记选中范围
                $daterangepicker.find('.ffs-daterangepicker-day').each(function () {
                    const $d = $(this);
                    if (!$d.hasClass('ffs-daterangepicker-day-other-month') && $d.data('date')) {
                        const dateStr = $d.data('date');
                        const dateParts = dateStr.split('-');
                        const y = parseInt(dateParts[0]);
                        const m = parseInt(dateParts[1]) - 1;
                        const d = parseInt(dateParts[2]);
                        const currentDate = new Date(y, m, d);

                        // 标记开始日期
                        if (currentDate.getFullYear() === selectedStartDate.getFullYear() && currentDate.getMonth() === selectedStartDate.getMonth() && currentDate.getDate() === selectedStartDate.getDate()) {
                            $d.addClass('ffs-daterangepicker-day-start');
                        }

                        // 标记结束日期
                        if (currentDate.getFullYear() === selectedEndDate.getFullYear() && currentDate.getMonth() === selectedEndDate.getMonth() && currentDate.getDate() === selectedEndDate.getDate()) {
                            $d.addClass('ffs-daterangepicker-day-end');
                        }

                        // 标记范围内的日期
                        if (currentDate >= selectedStartDate && currentDate <= selectedEndDate) {
                            $d.addClass('ffs-daterangepicker-day-in-range');
                        }
                    }
                });
            }
        });

        // 点击日期范围选择器的左侧日历上一月按钮
        $(document).on('click', '.ffs-daterangepicker-calendar[data-side="left"] .ffs-daterangepicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $daterangepicker = $btn.closest('.ffs-daterangepicker');

            // 获取当前年月
            let leftYear = parseInt($daterangepicker.data('leftYear'));
            let leftMonth = parseInt($daterangepicker.data('leftMonth'));
            let rightYear = parseInt($daterangepicker.data('rightYear'));
            let rightMonth = parseInt($daterangepicker.data('rightMonth'));

            // 切换到上个月
            leftMonth--;
            if (leftMonth < 0) {
                leftMonth = 11;
                leftYear--;
            }

            // 如果左侧日历的年月大于等于右侧日历的年月，则右侧日历也要切换
            if (leftYear > rightYear || (leftYear === rightYear && leftMonth >= rightMonth)) {
                rightMonth = leftMonth + 1;
                rightYear = leftYear;
                if (rightMonth > 11) {
                    rightMonth = 0;
                    rightYear++;
                }
            }

            // 更新日历
            updateDaterangeCalendar($daterangepicker, leftYear, leftMonth, rightYear, rightMonth, selectedStartDate, selectedEndDate);
        });

        // 点击日期范围选择器的左侧日历下一月按钮
        $(document).on('click', '.ffs-daterangepicker-calendar[data-side="left"] .ffs-daterangepicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $daterangepicker = $btn.closest('.ffs-daterangepicker');

            // 获取当前年月
            let leftYear = parseInt($daterangepicker.data('leftYear'));
            let leftMonth = parseInt($daterangepicker.data('leftMonth'));
            let rightYear = parseInt($daterangepicker.data('rightYear'));
            let rightMonth = parseInt($daterangepicker.data('rightMonth'));

            // 切换到下个月
            leftMonth++;
            if (leftMonth > 11) {
                leftMonth = 0;
                leftYear++;
            }

            // 如果左侧日历的年月大于等于右侧日历的年月，则右侧日历也要切换
            if (leftYear > rightYear || (leftYear === rightYear && leftMonth >= rightMonth)) {
                rightMonth = leftMonth + 1;
                rightYear = leftYear;
                if (rightMonth > 11) {
                    rightMonth = 0;
                    rightYear++;
                }
            }

            // 更新日历
            updateDaterangeCalendar($daterangepicker, leftYear, leftMonth, rightYear, rightMonth, selectedStartDate, selectedEndDate);
        });

        // 点击日期范围选择器的右侧日历上一月按钮
        $(document).on('click', '.ffs-daterangepicker-calendar[data-side="right"] .ffs-daterangepicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $daterangepicker = $btn.closest('.ffs-daterangepicker');

            // 获取当前年月
            let leftYear = parseInt($daterangepicker.data('leftYear'));
            let leftMonth = parseInt($daterangepicker.data('leftMonth'));
            let rightYear = parseInt($daterangepicker.data('rightYear'));
            let rightMonth = parseInt($daterangepicker.data('rightMonth'));

            // 切换到上个月
            rightMonth--;
            if (rightMonth < 0) {
                rightMonth = 11;
                rightYear--;
            }

            // 如果右侧日历的年月小于等于左侧日历的年月，则左侧日历也要切换
            if (rightYear < leftYear || (rightYear === leftYear && rightMonth <= leftMonth)) {
                leftMonth = rightMonth - 1;
                leftYear = rightYear;
                if (leftMonth < 0) {
                    leftMonth = 11;
                    leftYear--;
                }
            }

            // 更新日历
            updateDaterangeCalendar($daterangepicker, leftYear, leftMonth, rightYear, rightMonth, selectedStartDate, selectedEndDate);
        });

        // 点击日期范围选择器的右侧日历下一月按钮
        $(document).on('click', '.ffs-daterangepicker-calendar[data-side="right"] .ffs-daterangepicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $daterangepicker = $btn.closest('.ffs-daterangepicker');

            // 获取当前年月
            let leftYear = parseInt($daterangepicker.data('leftYear'));
            let leftMonth = parseInt($daterangepicker.data('leftMonth'));
            let rightYear = parseInt($daterangepicker.data('rightYear'));
            let rightMonth = parseInt($daterangepicker.data('rightMonth'));

            // 切换到下个月
            rightMonth++;
            if (rightMonth > 11) {
                rightMonth = 0;
                rightYear++;
            }

            // 更新日历
            updateDaterangeCalendar($daterangepicker, leftYear, leftMonth, rightYear, rightMonth, selectedStartDate, selectedEndDate);
        });

        // 点击日期范围选择器的快捷方式
        $(document).on('click', '.ffs-daterangepicker-shortcut', function () {
            const $shortcut = $(this);
            const $daterangepicker = $shortcut.closest('.ffs-daterangepicker');

            // 获取快捷方式类型
            const rangeType = $shortcut.data('range');

            // 获取当前日期
            const now = DateUtil.now();

            // 根据快捷方式类型设置日期
            let startDate = null;
            let endDate = null;

            switch (rangeType) {
                case 'today':
                    // 今天
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'yesterday':
                    // 昨天
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    break;
                case 'thisWeek':
                    // 本周（周一到周日）
                    const dayOfWeek = now.getDay() || 7; // 将周日的0转换为7
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek));
                    break;
                case 'lastWeek':
                    // 上周
                    const lastDayOfWeek = now.getDay() || 7;
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - lastDayOfWeek - 6);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - lastDayOfWeek);
                    break;
                case 'thisMonth':
                    // 本月
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    break;
                case 'lastMonth':
                    // 上月
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                    break;
                case 'thisYear':
                    // 今年
                    startDate = new Date(now.getFullYear(), 0, 1);
                    endDate = new Date(now.getFullYear(), 11, 31);
                    break;
                case 'lastYear':
                    // 去年
                    startDate = new Date(now.getFullYear() - 1, 0, 1);
                    endDate = new Date(now.getFullYear() - 1, 11, 31);
                    break;
            }

            // 更新选中日期
            selectedStartDate = startDate;
            selectedEndDate = endDate;

            // 更新日历
            const leftYear = startDate.getFullYear();
            const leftMonth = startDate.getMonth();

            let rightYear = leftYear;
            let rightMonth = leftMonth + 1;
            if (rightMonth > 11) {
                rightMonth = 0;
                rightYear++;
            }

            // 更新日历
            updateDaterangeCalendar($daterangepicker, leftYear, leftMonth, rightYear, rightMonth, startDate, endDate);

            // 更新显示文本
            const format = $daterangepicker.data('format') || 'yyyy-MM-dd';
            const startDateText = DateUtil.format(startDate, format);
            const endDateText = DateUtil.format(endDate, format);
            $daterangepicker.find('.ffs-daterangepicker-label').text(`${startDateText} 至 ${endDateText}`);
        });

        // 点击日期范围选择器的清空按钮
        $(document).on('click', '.ffs-daterangepicker-clear-btn', function () {
            const $btn = $(this);
            const $daterangepicker = $btn.closest('.ffs-daterangepicker');
            const $label = $daterangepicker.find('.ffs-daterangepicker-label');
            const $hiddenInput = $daterangepicker.find('input[type="hidden"]');

            // 清空选中日期
            selectedStartDate = null;
            selectedEndDate = null;

            // 清除选中状态
            $daterangepicker.find('.ffs-daterangepicker-day').removeClass('ffs-daterangepicker-day-start ffs-daterangepicker-day-end ffs-daterangepicker-day-in-range');

            // 更新显示文本
            $label.text('请选择日期范围');

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val('');
            }

            // 关闭下拉菜单
            $daterangepicker.removeClass('ffs-daterangepicker-open');

            // 触发选择事件
            $daterangepicker.trigger('daterangepicker:change', [null, null]);
        });

        // 点击日期范围选择器的确定按钮
        $(document).on('click', '.ffs-daterangepicker-confirm-btn', function () {
            const $btn = $(this);
            const $daterangepicker = $btn.closest('.ffs-daterangepicker');
            const $label = $daterangepicker.find('.ffs-daterangepicker-label');
            const $hiddenInput = $daterangepicker.find('input[type="hidden"]');

            // 如果没有选中日期，则不做任何操作
            if (!selectedStartDate || !selectedEndDate) {
                return;
            }

            // 更新显示文本
            const format = $daterangepicker.data('format') || 'yyyy-MM-dd';
            const startDateText = DateUtil.format(selectedStartDate, format);
            const endDateText = DateUtil.format(selectedEndDate, format);
            $label.text(`${startDateText} 至 ${endDateText}`);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(`${startDateText},${endDateText}`);
            }

            // 关闭下拉菜单
            $daterangepicker.removeClass('ffs-daterangepicker-open');

            // 触发选择事件
            $daterangepicker.trigger('daterangepicker:change', [selectedStartDate, selectedEndDate]);
        });
    }

    /**
     * 初始化时间选择器
     * 处理时间选择器的打开/关闭和选择事件
     */
    function initTimepicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-timepicker-picker', function (e) {
            const $picker = $(this);
            const $timepicker = $picker.closest('.ffs-timepicker');

            // 切换下拉菜单显示状态
            $timepicker.toggleClass('ffs-timepicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($timepicker.hasClass('ffs-timepicker-open')) {
                $('.ffs-timepicker').not($timepicker).removeClass('ffs-timepicker-open');

                // 初始化时间选择器
                initTimeList($timepicker);
            }
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-timepicker').length) {
                $('.ffs-timepicker').removeClass('ffs-timepicker-open');
            }
        });

        // 初始化时间列表
        function initTimeList($timepicker) {
            // 获取当前时间
            const now = DateUtil.now();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentSecond = now.getSeconds();

            // 获取选中时间
            const $hiddenInput = $timepicker.find('input[type="hidden"]');
            let selectedHour = currentHour;
            let selectedMinute = currentMinute;
            let selectedSecond = currentSecond;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $timepicker.data('format') || 'HH:mm:ss';
                const selectedTime = DateUtil.parse($hiddenInput.val(), format);
                if (selectedTime) {
                    selectedHour = selectedTime.getHours();
                    selectedMinute = selectedTime.getMinutes();
                    selectedSecond = selectedTime.getSeconds();
                }
            }

            // 创建时间列表
            const $dropdown = $timepicker.find('.ffs-timepicker-dropdown');

            // 如果没有时间列表，则创建
            if (!$dropdown.find('.ffs-timepicker-time-list').length) {
                // 创建时间列表容器
                const $timeList = $('<div class="ffs-timepicker-time-list"></div>');

                // 创建小时列表
                const $hourList = $('<div class="ffs-timepicker-hour-list"></div>');
                for (let i = 0; i < 24; i++) {
                    const hour = i < 10 ? `0${i}` : i;
                    const $hour = $(`<div class="ffs-timepicker-hour" data-hour="${i}">${hour}</div>`);

                    // 标记选中小时
                    if (i === selectedHour) {
                        $hour.addClass('ffs-timepicker-hour-selected');
                    }

                    $hourList.append($hour);
                }

                // 创建分钟列表
                const $minuteList = $('<div class="ffs-timepicker-minute-list"></div>');
                for (let i = 0; i < 60; i++) {
                    const minute = i < 10 ? `0${i}` : i;
                    const $minute = $(`<div class="ffs-timepicker-minute" data-minute="${i}">${minute}</div>`);

                    // 标记选中分钟
                    if (i === selectedMinute) {
                        $minute.addClass('ffs-timepicker-minute-selected');
                    }

                    $minuteList.append($minute);
                }

                // 创建秒列表
                const $secondList = $('<div class="ffs-timepicker-second-list"></div>');
                for (let i = 0; i < 60; i++) {
                    const second = i < 10 ? `0${i}` : i;
                    const $second = $(`<div class="ffs-timepicker-second" data-second="${i}">${second}</div>`);

                    // 标记选中秒
                    if (i === selectedSecond) {
                        $second.addClass('ffs-timepicker-second-selected');
                    }

                    $secondList.append($second);
                }

                // 添加到时间列表
                $timeList.append($hourList);
                $timeList.append($minuteList);
                $timeList.append($secondList);

                // 创建底部
                const $footer = $(`
                                                        <div class="ffs-timepicker-footer">
                                                            <button class="ffs-timepicker-now-btn">此刻</button>
                                                            <button class="ffs-timepicker-confirm-btn">确定</button>
                                                        </div>
                                                    `);

                // 添加到下拉菜单
                $dropdown.append($timeList);
                $dropdown.append($footer);

                // 滚动到选中时间
                $hourList.scrollTop(selectedHour * 30);
                $minuteList.scrollTop(selectedMinute * 30);
                $secondList.scrollTop(selectedSecond * 30);
            }
        }

        // 点击小时
        $(document).on('click', '.ffs-timepicker-hour', function () {
            const $hour = $(this);
            const $timepicker = $hour.closest('.ffs-timepicker');

            // 更新选中状态
            $timepicker.find('.ffs-timepicker-hour').removeClass('ffs-timepicker-hour-selected');
            $hour.addClass('ffs-timepicker-hour-selected');
        });

        // 点击分钟
        $(document).on('click', '.ffs-timepicker-minute', function () {
            const $minute = $(this);
            const $timepicker = $minute.closest('.ffs-timepicker');

            // 更新选中状态
            $timepicker.find('.ffs-timepicker-minute').removeClass('ffs-timepicker-minute-selected');
            $minute.addClass('ffs-timepicker-minute-selected');
        });

        // 点击秒
        $(document).on('click', '.ffs-timepicker-second', function () {
            const $second = $(this);
            const $timepicker = $second.closest('.ffs-timepicker');

            // 更新选中状态
            $timepicker.find('.ffs-timepicker-second').removeClass('ffs-timepicker-second-selected');
            $second.addClass('ffs-timepicker-second-selected');
        });

        // 点击时间选择器的此刻按钮
        $(document).on('click', '.ffs-timepicker-now-btn', function () {
            const $btn = $(this);
            const $timepicker = $btn.closest('.ffs-timepicker');
            const $label = $timepicker.find('.ffs-timepicker-label');
            const $hiddenInput = $timepicker.find('input[type="hidden"]');

            // 获取当前时间
            const now = DateUtil.now();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentSecond = now.getSeconds();

            // 创建时间对象
            const date = new Date();
            date.setHours(currentHour);
            date.setMinutes(currentMinute);
            date.setSeconds(currentSecond);

            // 更新选中状态
            const $hourList = $timepicker.find('.ffs-timepicker-hour-list');
            const $minuteList = $timepicker.find('.ffs-timepicker-minute-list');
            const $secondList = $timepicker.find('.ffs-timepicker-second-list');

            // 更新小时选中状态
            $hourList.find('.ffs-timepicker-hour').removeClass('ffs-timepicker-hour-selected');
            $hourList.find(`.ffs-timepicker-hour[data-hour="${currentHour}"]`).addClass('ffs-timepicker-hour-selected');

            // 更新分钟选中状态
            $minuteList.find('.ffs-timepicker-minute').removeClass('ffs-timepicker-minute-selected');
            $minuteList.find(`.ffs-timepicker-minute[data-minute="${currentMinute}"]`).addClass('ffs-timepicker-minute-selected');

            // 更新秒选中状态
            $secondList.find('.ffs-timepicker-second').removeClass('ffs-timepicker-second-selected');
            $secondList.find(`.ffs-timepicker-second[data-second="${currentSecond}"]`).addClass('ffs-timepicker-second-selected');

            // 滚动到选中时间
            $hourList.scrollTop(currentHour * 30);
            $minuteList.scrollTop(currentMinute * 30);
            $secondList.scrollTop(currentSecond * 30);

            // 更新显示文本
            const format = $timepicker.data('format') || 'HH:mm:ss';
            const timeText = DateUtil.format(date, format);
            $label.text(timeText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(timeText);
            }

            // 关闭下拉菜单
            $timepicker.removeClass('ffs-timepicker-open');

            // 触发选择事件
            $timepicker.trigger('timepicker:change', [date]);
        });

        // 点击时间选择器的确定按钮
        $(document).on('click', '.ffs-timepicker-confirm-btn', function () {
            const $btn = $(this);
            const $timepicker = $btn.closest('.ffs-timepicker');
            const $label = $timepicker.find('.ffs-timepicker-label');
            const $hiddenInput = $timepicker.find('input[type="hidden"]');

            // 获取选中时间
            const selectedHour = parseInt($timepicker.find('.ffs-timepicker-hour-selected').data('hour'));
            const selectedMinute = parseInt($timepicker.find('.ffs-timepicker-minute-selected').data('minute'));
            const selectedSecond = parseInt($timepicker.find('.ffs-timepicker-second-selected').data('second'));

            // 创建时间对象
            const date = new Date();
            date.setHours(selectedHour);
            date.setMinutes(selectedMinute);
            date.setSeconds(selectedSecond);

            // 更新显示文本
            const format = $timepicker.data('format') || 'HH:mm:ss';
            const timeText = DateUtil.format(date, format);
            $label.text(timeText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(timeText);
            }

            // 关闭下拉菜单
            $timepicker.removeClass('ffs-timepicker-open');

            // 触发选择事件
            $timepicker.trigger('timepicker:change', [date]);
        });
    }

    /**
     * 初始化日期时间选择器
     * 处理日期时间选择器的打开/关闭和选择事件
     */
    function initDatetimepicker() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-datetimepicker-picker', function (e) {
            const $picker = $(this);
            const $datetimepicker = $picker.closest('.ffs-datetimepicker');

            // 切换下拉菜单显示状态
            $datetimepicker.toggleClass('ffs-datetimepicker-open');

            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($datetimepicker.hasClass('ffs-datetimepicker-open')) {
                $('.ffs-datetimepicker').not($datetimepicker).removeClass('ffs-datetimepicker-open');

                // 初始化日历
                initDatetimeCalendar($datetimepicker);
            }
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-datetimepicker').length) {
                $('.ffs-datetimepicker').removeClass('ffs-datetimepicker-open');
            }
        });

        // 初始化日期时间日历
        function initDatetimeCalendar($datetimepicker) {
            // 获取当前日期时间
            const now = DateUtil.now();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentSecond = now.getSeconds();

            // 获取选中日期时间
            const $hiddenInput = $datetimepicker.find('input[type="hidden"]');
            let selectedDate = null;

            if ($hiddenInput.length && $hiddenInput.val()) {
                const format = $datetimepicker.data('format') || 'yyyy-MM-dd HH:mm:ss';
                selectedDate = DateUtil.parse($hiddenInput.val(), format);
            }

            // 如果没有选中日期时间，则使用当前日期时间
            if (!selectedDate) {
                selectedDate = new Date(currentYear, currentMonth, currentDay, currentHour, currentMinute, currentSecond);
            }

            // 创建日历
            const $dropdown = $datetimepicker.find('.ffs-datetimepicker-dropdown');

            // 如果没有日历，则创建
            if (!$dropdown.find('.ffs-datetimepicker-calendar').length) {
                // 创建日历容器
                const $calendar = $('<div class="ffs-datetimepicker-calendar"></div>');

                // 创建日历头部
                const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
                const $header = $(`
                                <div class="ffs-datetimepicker-header">
                                    <div class="ffs-datetimepicker-title">${selectedDate.getFullYear()}年${monthNames[selectedDate.getMonth()]}</div>
                                    <div class="ffs-datetimepicker-nav">
                                        <button class="ffs-datetimepicker-nav-btn">
                                            <i class="fas fa-chevron-left"></i>
                                        </button>
                                        <button class="ffs-datetimepicker-nav-btn">
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            `);

                // 创建日历主体
                const $calendarBody = $(`
                                <div class="ffs-datetimepicker-body">
                                    <div class="ffs-datetimepicker-weekday">日</div>
                                    <div class="ffs-datetimepicker-weekday">一</div>
                                    <div class="ffs-datetimepicker-weekday">二</div>
                                    <div class="ffs-datetimepicker-weekday">三</div>
                                    <div class="ffs-datetimepicker-weekday">四</div>
                                    <div class="ffs-datetimepicker-weekday">五</div>
                                    <div class="ffs-datetimepicker-weekday">六</div>
                                </div>
                            `);

                // 获取月份的第一天是星期几
                const firstDayOfMonth = DateUtil.getFirstDayOfMonth(selectedDate.getFullYear(), selectedDate.getMonth());

                // 获取月份的天数
                const daysInMonth = DateUtil.getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());

                // 获取上个月的天数
                let prevMonth = selectedDate.getMonth() - 1;
                let prevYear = selectedDate.getFullYear();
                if (prevMonth < 0) {
                    prevMonth = 11;
                    prevYear--;
                }
                const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);

                // 添加上个月的日期
                for (let i = 0; i < firstDayOfMonth; i++) {
                    const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                    const $day = $(`<div class="ffs-datetimepicker-day ffs-datetimepicker-day-other-month">${day}</div>`);
                    $calendarBody.append($day);
                }

                // 添加当前月的日期
                for (let i = 1; i <= daysInMonth; i++) {
                    const $day = $(`<div class="ffs-datetimepicker-day" data-date="${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${i}">${i}</div>`);

                    // 标记今天
                    if (selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth() && i === now.getDate()) {
                        $day.addClass('ffs-datetimepicker-day-today');
                    }

                    // 标记选中日期
                    if (i === selectedDate.getDate()) {
                        $day.addClass('ffs-datetimepicker-day-selected');
                    }

                    $calendarBody.append($day);
                }

                // 添加下个月的日期
                const daysToAdd = 42 - firstDayOfMonth - daysInMonth;
                for (let i = 1; i <= daysToAdd; i++) {
                    const $day = $(`<div class="ffs-datetimepicker-day ffs-datetimepicker-day-other-month">${i}</div>`);
                    $calendarBody.append($day);
                }

                // 创建时间选择器
                const $timeSelector = $(`
                                <div class="ffs-datetimepicker-time-selector">
                                    <div class="ffs-datetimepicker-time-label">时间：</div>
                                    <div class="ffs-datetimepicker-time-input">
                                        <input type="text" class="ffs-datetimepicker-hour-input" value="${selectedDate.getHours() < 10 ? '0' + selectedDate.getHours() : selectedDate.getHours()}" maxlength="2">
                                        <span>:</span>
                                        <input type="text" class="ffs-datetimepicker-minute-input" value="${selectedDate.getMinutes() < 10 ? '0' + selectedDate.getMinutes() : selectedDate.getMinutes()}" maxlength="2">
                                        <span>:</span>
                                        <input type="text" class="ffs-datetimepicker-second-input" value="${selectedDate.getSeconds() < 10 ? '0' + selectedDate.getSeconds() : selectedDate.getSeconds()}" maxlength="2">
                                    </div>
                                </div>
                            `);

                // 创建底部
                const $footer = $(`
                                <div class="ffs-datetimepicker-footer">
                                    <button class="ffs-datetimepicker-now-btn">此刻</button>
                                    <button class="ffs-datetimepicker-confirm-btn">确定</button>
                                </div>
                            `);

                // 添加到日历
                $calendar.append($header);
                $calendar.append($calendarBody);
                $calendar.append($timeSelector);
                $calendar.append($footer);

                // 添加到下拉菜单
                $dropdown.append($calendar);

                // 保存年月
                $datetimepicker.data('year', selectedDate.getFullYear());
                $datetimepicker.data('month', selectedDate.getMonth());
            } else {
                // 更新日历
                updateDatetimeCalendar($datetimepicker, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate);
            }
        }

        // 更新日期时间日历
        function updateDatetimeCalendar($datetimepicker, year, month, selectedDate = null) {
            // 保存年月
            $datetimepicker.data('year', year);
            $datetimepicker.data('month', month);

            // 获取当前日期时间
            const now = DateUtil.now();

            // 如果没有选中日期时间，则使用当前日期时间
            if (!selectedDate) {
                const $hiddenInput = $datetimepicker.find('input[type="hidden"]');

                if ($hiddenInput.length && $hiddenInput.val()) {
                    const format = $datetimepicker.data('format') || 'yyyy-MM-dd HH:mm:ss';
                    selectedDate = DateUtil.parse($hiddenInput.val(), format);
                }

                if (!selectedDate) {
                    selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
                }
            }

            // 获取日历容器
            const $calendar = $datetimepicker.find('.ffs-datetimepicker-calendar');

            // 更新标题
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            $calendar.find('.ffs-datetimepicker-title').text(`${year}年${monthNames[month]}`);

            // 更新日历主体
            const $calendarBody = $calendar.find('.ffs-datetimepicker-body');
            $calendarBody.empty();

            // 添加星期标题
            $calendarBody.append(`
                    <div class="ffs-datetimepicker-weekday">日</div>
                    <div class="ffs-datetimepicker-weekday">一</div>
                    <div class="ffs-datetimepicker-weekday">二</div>
                    <div class="ffs-datetimepicker-weekday">三</div>
                    <div class="ffs-datetimepicker-weekday">四</div>
                    <div class="ffs-datetimepicker-weekday">五</div>
                    <div class="ffs-datetimepicker-weekday">六</div>
                `);

            // 获取月份的第一天是星期几
            const firstDayOfMonth = DateUtil.getFirstDayOfMonth(year, month);

            // 获取月份的天数
            const daysInMonth = DateUtil.getDaysInMonth(year, month);

            // 获取上个月的天数
            let prevMonth = month - 1;
            let prevYear = year;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);

            // 添加上个月的日期
            for (let i = 0; i < firstDayOfMonth; i++) {
                const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                const $day = $(`<div class="ffs-datetimepicker-day ffs-datetimepicker-day-other-month">${day}</div>`);
                $calendarBody.append($day);
            }

            // 添加当前月的日期
            for (let i = 1; i <= daysInMonth; i++) {
                const $day = $(`<div class="ffs-datetimepicker-day" data-date="${year}-${month + 1}-${i}">${i}</div>`);

                // 标记今天
                if (year === now.getFullYear() && month === now.getMonth() && i === now.getDate()) {
                    $day.addClass('ffs-datetimepicker-day-today');
                }

                // 标记选中日期
                if (selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && i === selectedDate.getDate()) {
                    $day.addClass('ffs-datetimepicker-day-selected');
                }

                $calendarBody.append($day);
            }

            // 添加下个月的日期
            const daysToAdd = 42 - firstDayOfMonth - daysInMonth;
            for (let i = 1; i <= daysToAdd; i++) {
                const $day = $(`<div class="ffs-datetimepicker-day ffs-datetimepicker-day-other-month">${i}</div>`);
                $calendarBody.append($day);
            }

            // 更新时间选择器
            if (selectedDate) {
                $calendar.find('.ffs-datetimepicker-hour-input').val(selectedDate.getHours() < 10 ? '0' + selectedDate.getHours() : selectedDate.getHours());
                $calendar.find('.ffs-datetimepicker-minute-input').val(selectedDate.getMinutes() < 10 ? '0' + selectedDate.getMinutes() : selectedDate.getMinutes());
                $calendar.find('.ffs-datetimepicker-second-input').val(selectedDate.getSeconds() < 10 ? '0' + selectedDate.getSeconds() : selectedDate.getSeconds());
            }
        }

        // 点击日期
        $(document).on('click', '.ffs-datetimepicker-day:not(.ffs-datetimepicker-day-other-month)', function () {
            const $day = $(this);
            const $datetimepicker = $day.closest('.ffs-datetimepicker');

            // 更新选中状态
            $datetimepicker.find('.ffs-datetimepicker-day').removeClass('ffs-datetimepicker-day-selected');
            $day.addClass('ffs-datetimepicker-day-selected');
        });

        // 点击日期时间选择器的上一月按钮
        $(document).on('click', '.ffs-datetimepicker-nav-btn:first-child', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');

            // 获取当前年月
            let year = parseInt($datetimepicker.data('year'));
            let month = parseInt($datetimepicker.data('month'));

            // 切换到上个月
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }

            // 更新日历
            updateDatetimeCalendar($datetimepicker, year, month);
        });

        // 点击日期时间选择器的下一月按钮
        $(document).on('click', '.ffs-datetimepicker-nav-btn:last-child', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');

            // 获取当前年月
            let year = parseInt($datetimepicker.data('year'));
            let month = parseInt($datetimepicker.data('month'));

            // 切换到下个月
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }

            // 更新日历
            updateDatetimeCalendar($datetimepicker, year, month);
        });

        // 限制时间输入框只能输入数字
        $(document).on('input', '.ffs-datetimepicker-hour-input, .ffs-datetimepicker-minute-input, .ffs-datetimepicker-second-input', function () {
            const $input = $(this);
            const value = $input.val().replace(/[^\d]/g, '');
            $input.val(value);

            // 限制小时范围
            if ($input.hasClass('ffs-datetimepicker-hour-input')) {
                if (parseInt(value) > 23) {
                    $input.val('23');
                }
            }

            // 限制分钟和秒的范围
            if ($input.hasClass('ffs-datetimepicker-minute-input') || $input.hasClass('ffs-datetimepicker-second-input')) {
                if (parseInt(value) > 59) {
                    $input.val('59');
                }
            }
        });

        // 点击日期时间选择器的此刻按钮
        $(document).on('click', '.ffs-datetimepicker-now-btn', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');
            const $label = $datetimepicker.find('.ffs-datetimepicker-label');
            const $hiddenInput = $datetimepicker.find('input[type="hidden"]');

            // 获取当前日期时间
            const now = DateUtil.now();

            // 更新日历
            updateDatetimeCalendar($datetimepicker, now.getFullYear(), now.getMonth(), now);

            // 更新显示文本
            const format = $datetimepicker.data('format') || 'yyyy-MM-dd HH:mm:ss';
            const datetimeText = DateUtil.format(now, format);
            $label.text(datetimeText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(datetimeText);
            }

            // 关闭下拉菜单
            $datetimepicker.removeClass('ffs-datetimepicker-open');

            // 触发选择事件
            $datetimepicker.trigger('datetimepicker:change', [now]);
        });

        // 点击日期时间选择器的确定按钮
        $(document).on('click', '.ffs-datetimepicker-confirm-btn', function () {
            const $btn = $(this);
            const $datetimepicker = $btn.closest('.ffs-datetimepicker');
            const $label = $datetimepicker.find('.ffs-datetimepicker-label');
            const $hiddenInput = $datetimepicker.find('input[type="hidden"]');

            // 获取选中日期
            const $selectedDay = $datetimepicker.find('.ffs-datetimepicker-day-selected');
            if (!$selectedDay.length) {
                return;
            }

            // 获取日期
            const dateStr = $selectedDay.data('date');
            const dateParts = dateStr.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);

            // 获取时间
            const hour = parseInt($datetimepicker.find('.ffs-datetimepicker-hour-input').val()) || 0;
            const minute = parseInt($datetimepicker.find('.ffs-datetimepicker-minute-input').val()) || 0;
            const second = parseInt($datetimepicker.find('.ffs-datetimepicker-second-input').val()) || 0;

            // 创建日期时间对象
            const date = new Date(year, month, day, hour, minute, second);

            // 更新显示文本
            const format = $datetimepicker.data('format') || 'yyyy-MM-dd HH:mm:ss';
            const datetimeText = DateUtil.format(date, format);
            $label.text(datetimeText);

            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(datetimeText);
            }

            // 关闭下拉菜单
            $datetimepicker.removeClass('ffs-datetimepicker-open');

            // 触发选择事件
            $datetimepicker.trigger('datetimepicker:change', [date]);
        });
    }

    $(document).ready(function () {
        // 初始化所有日期选择器
        initDatepicker();

        // 初始化所有日期范围选择器
        initDaterangepicker();

        // 初始化所有时间选择器
        initTimepicker();

        // 初始化所有日期时间选择器
        initDatetimepicker();
    });

})(jQuery);