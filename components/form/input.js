/**
 * * * * * FFS UI - 输入框组件
 * 提供搜索框、数字输入框、密码输入框和自动完成等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化搜索框
     * 处理搜索框的清空按钮和搜索事件
     */
    function initSearchInput() {
        // 添加清空按钮
        $('.ffs-input-search').each(function () {
            const $input = $(this);

            // 如果没有清空按钮，则添加
            if (!$input.siblings('.ffs-input-search-clear').length) {
                const $clearBtn = $('<span class="ffs-input-search-clear"><i class="fas fa-times"></i></span>');
                $input.after($clearBtn);

                // 根据输入框内容显示/隐藏清空按钮
                if ($input.val()) {
                    $clearBtn.show();
                } else {
                    $clearBtn.hide();
                }
            }
        });

        // 输入事件 - 显示/隐藏清空按钮
        $(document).on('input', '.ffs-input-search', function () {
            const $input = $(this);
            const $clearBtn = $input.siblings('.ffs-input-search-clear');

            if ($input.val()) {
                $clearBtn.show();
            } else {
                $clearBtn.hide();
            }
        });

        // 清空按钮点击事件
        $(document).on('click', '.ffs-input-search-clear', function () {
            const $clearBtn = $(this);
            const $input = $clearBtn.siblings('.ffs-input-search');

            // 清空输入框
            $input.val('').focus();
            $clearBtn.hide();

            // 触发搜索事件
            $input.trigger('search:clear');
        });

        // 搜索按钮点击事件
        $(document).on('click', '.ffs-input-search-button', function () {
            const $searchBtn = $(this);
            const $input = $searchBtn.siblings('.ffs-input-search');

            // 触发搜索事件
            $input.trigger('search:submit', [$input.val()]);
        });

        // 回车键搜索
        $(document).on('keydown', '.ffs-input-search', function (e) {
            if (e.key === 'Enter') {
                const $input = $(this);

                // 触发搜索事件
                $input.trigger('search:submit', [$input.val()]);
            }
        });
    }

    /**
     * 初始化数字输入框
     * 处理数字输入框的加减按钮和输入限制
     */
    function initNumberInput() {
        // 添加加减按钮
        $('.ffs-input-number').each(function () {
            const $container = $(this);
            const $input = $container.find('input');

            // 如果没有加减按钮，则添加
            if (!$container.find('.ffs-input-number-handler').length) {
                const $handlers = $(`
                    <div class="ffs-input-number-handler-wrap">
                        <span class="ffs-input-number-handler ffs-input-number-handler-up">
                            <i class="fas fa-chevron-up"></i>
                        </span>
                        <span class="ffs-input-number-handler ffs-input-number-handler-down">
                            <i class="fas fa-chevron-down"></i>
                        </span>
                    </div>
                `);
                $container.append($handlers);
            }

            // 设置初始禁用状态
            updateNumberInputState($container);
        });

        // 增加按钮点击事件
        $(document).on('click', '.ffs-input-number-handler-up', function () {
            const $upBtn = $(this);
            const $container = $upBtn.closest('.ffs-input-number');
            const $input = $container.find('input');

            // 获取当前值和步长
            let value = parseFloat($input.val()) || 0;
            const step = parseFloat($input.attr('step')) || 1;
            const max = parseFloat($input.attr('max'));

            // 计算新值
            value += step;

            // 检查最大值
            if (!isNaN(max) && value > max) {
                value = max;
            }

            // 更新输入框值
            $input.val(value).trigger('change');

            // 更新按钮状态
            updateNumberInputState($container);
        });

        // 减少按钮点击事件
        $(document).on('click', '.ffs-input-number-handler-down', function () {
            const $downBtn = $(this);
            const $container = $downBtn.closest('.ffs-input-number');
            const $input = $container.find('input');

            // 获取当前值和步长
            let value = parseFloat($input.val()) || 0;
            const step = parseFloat($input.attr('step')) || 1;
            const min = parseFloat($input.attr('min'));

            // 计算新值
            value -= step;

            // 检查最小值
            if (!isNaN(min) && value < min) {
                value = min;
            }

            // 更新输入框值
            $input.val(value).trigger('change');

            // 更新按钮状态
            updateNumberInputState($container);
        });

        // 输入事件 - 限制只能输入数字
        $(document).on('input', '.ffs-input-number input', function () {
            const $input = $(this);
            const $container = $input.closest('.ffs-input-number');

            // 获取输入值
            let value = $input.val();

            // 移除非数字字符（保留负号和小数点）
            value = value.replace(/[^\d.-]/g, '');

            // 确保只有一个小数点和一个负号
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }

            // 处理负号
            if (value.indexOf('-') !== -1 && value.indexOf('-') !== 0) {
                value = value.replace(/-/g, '');
                if (value.charAt(0) !== '-') {
                    value = '-' + value;
                }
            }

            // 更新输入框值
            $input.val(value);

            // 更新按钮状态
            updateNumberInputState($container);
        });

        // 失去焦点事件 - 检查最大最小值
        $(document).on('blur', '.ffs-input-number input', function () {
            const $input = $(this);
            const $container = $input.closest('.ffs-input-number');

            // 获取输入值
            let value = parseFloat($input.val());

            // 如果不是数字，设为最小值或0
            if (isNaN(value)) {
                const min = parseFloat($input.attr('min'));
                value = !isNaN(min) ? min : 0;
            }

            // 检查最大最小值
            const min = parseFloat($input.attr('min'));
            const max = parseFloat($input.attr('max'));

            if (!isNaN(min) && value < min) {
                value = min;
            }

            if (!isNaN(max) && value > max) {
                value = max;
            }

            // 更新输入框值
            $input.val(value);

            // 更新按钮状态
            updateNumberInputState($container);
        });

        // 更新数字输入框状态
        function updateNumberInputState($container) {
            const $input = $container.find('input');
            const $upBtn = $container.find('.ffs-input-number-handler-up');
            const $downBtn = $container.find('.ffs-input-number-handler-down');

            // 获取当前值和最大最小值
            const value = parseFloat($input.val()) || 0;
            const min = parseFloat($input.attr('min'));
            const max = parseFloat($input.attr('max'));

            // 禁用/启用增加按钮
            if (!isNaN(max) && value >= max) {
                $upBtn.addClass('ffs-input-number-handler-disabled');
            } else {
                $upBtn.removeClass('ffs-input-number-handler-disabled');
            }

            // 禁用/启用减少按钮
            if (!isNaN(min) && value <= min) {
                $downBtn.addClass('ffs-input-number-handler-disabled');
            } else {
                $downBtn.removeClass('ffs-input-number-handler-disabled');
            }
        }
    }

    /**
     * 初始化密码输入框
     * 处理密码输入框的显示/隐藏密码功能
     */
    function initPasswordInput() {
        // 添加显示/隐藏密码按钮
        $('.ffs-input-password').each(function () {
            const $input = $(this);

            // 如果没有显示/隐藏按钮，则添加
            if (!$input.siblings('.ffs-input-password-icon').length) {
                const $icon = $('<span class="ffs-input-password-icon"><i class="fas fa-eye"></i></span>');
                $input.after($icon);
            }
        });

        // 显示/隐藏密码按钮点击事件
        $(document).on('click', '.ffs-input-password-icon', function () {
            const $icon = $(this);
            const $input = $icon.siblings('.ffs-input-password');
            const $i = $icon.find('i');

            // 切换密码显示状态
            if ($input.attr('type') === 'password') {
                $input.attr('type', 'text');
                $i.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                $input.attr('type', 'password');
                $i.removeClass('fa-eye-slash').addClass('fa-eye');
            }

            // 触发密码显示状态变化事件
            $input.trigger('password:toggle', [$input.attr('type') === 'text']);
        });
    }

    /**
     * 初始化自动完成
     * 处理输入框的自动完成功能
     */
    function initAutocomplete() {
        // 初始化自动完成
        $('.ffs-input-autocomplete').each(function () {
            const $container = $(this);
            const $input = $container.find('input');

            // 如果没有下拉菜单，则添加
            if (!$container.find('.ffs-input-suggestions').length) {
                const $suggestions = $('<div class="ffs-input-suggestions"></div>');
                $container.append($suggestions);
            }
        });

        // 输入事件 - 显示建议
        $(document).on('input', '.ffs-input-autocomplete input', function () {
            const $input = $(this);
            const $container = $input.closest('.ffs-input-autocomplete');
            const $suggestions = $container.find('.ffs-input-suggestions');

            // 获取输入值
            const value = $input.val().trim();

            // 如果输入为空，隐藏建议
            if (!value) {
                $suggestions.removeClass('show');
                return;
            }

            // 获取数据源
            const dataSource = $container.data('source');

            // 如果有数据源函数，则调用
            if (typeof window[$container.data('source-fn')] === 'function') {
                const sourceFn = window[$container.data('source-fn')];

                // 调用数据源函数获取建议
                sourceFn(value, function (suggestions) {
                    updateSuggestions($container, suggestions);
                });
            }
            // 如果有静态数据源，则过滤
            else if (Array.isArray(dataSource)) {
                const suggestions = dataSource.filter(item =>
                    item.toLowerCase().includes(value.toLowerCase())
                );
                updateSuggestions($container, suggestions);
            }
        });

        // 建议项点击事件
        $(document).on('click', '.ffs-input-suggestion-item', function () {
            const $item = $(this);
            const $container = $item.closest('.ffs-input-autocomplete');
            const $input = $container.find('input');
            const $suggestions = $container.find('.ffs-input-suggestions');

            // 更新输入框值
            $input.val($item.text());

            // 隐藏建议
            $suggestions.removeClass('show');

            // 触发选择事件
            $input.trigger('autocomplete:select', [$item.text()]);
        });

        // 键盘导航
        $(document).on('keydown', '.ffs-input-autocomplete input', function (e) {
            const $input = $(this);
            const $container = $input.closest('.ffs-input-autocomplete');
            const $suggestions = $container.find('.ffs-input-suggestions');

            // 如果建议不可见，则不处理
            if (!$suggestions.hasClass('show')) {
                return;
            }

            const $items = $suggestions.find('.ffs-input-suggestion-item');
            const $active = $items.filter('.active');

            // 向下键
            if (e.key === 'ArrowDown') {
                e.preventDefault();

                if ($active.length) {
                    const $next = $active.next('.ffs-input-suggestion-item');
                    if ($next.length) {
                        $active.removeClass('active');
                        $next.addClass('active');
                    }
                } else {
                    $items.first().addClass('active');
                }
            }
            // 向上键
            else if (e.key === 'ArrowUp') {
                e.preventDefault();

                if ($active.length) {
                    const $prev = $active.prev('.ffs-input-suggestion-item');
                    if ($prev.length) {
                        $active.removeClass('active');
                        $prev.addClass('active');
                    }
                } else {
                    $items.last().addClass('active');
                }
            }
            // 回车键
            else if (e.key === 'Enter') {
                e.preventDefault();

                if ($active.length) {
                    // 选择当前高亮项
                    $input.val($active.text());
                    $suggestions.removeClass('show');

                    // 触发选择事件
                    $input.trigger('autocomplete:select', [$active.text()]);
                }
            }
            // Esc键
            else if (e.key === 'Escape') {
                e.preventDefault();

                // 隐藏建议
                $suggestions.removeClass('show');
            }
        });

        // 点击外部关闭建议
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-input-autocomplete').length) {
                $('.ffs-input-suggestions').removeClass('show');
            }
        });

        // 更新建议列表
        function updateSuggestions($container, suggestions) {
            const $suggestions = $container.find('.ffs-input-suggestions');
            const $input = $container.find('input');

            // 清空建议列表
            $suggestions.empty();

            // 如果没有建议，隐藏列表
            if (!suggestions || !suggestions.length) {
                $suggestions.removeClass('show');
                return;
            }

            // 添加建议项
            suggestions.forEach(item => {
                const $item = $(`<div class="ffs-input-suggestion-item">${item}</div>`);
                $suggestions.append($item);
            });

            // 显示建议列表
            $suggestions.addClass('show');
        }
    }

    /**
     * 初始化输入框组
     * 处理输入框组的前缀和后缀
     */
    function initInputGroup() {
        // 初始化输入框组
        $('.ffs-input-group').each(function () {
            const $group = $(this);
            const $input = $group.find('.ffs-input');

            // 添加前缀和后缀的点击事件
            $group.find('.ffs-input-prefix, .ffs-input-suffix').on('click', function () {
                $input.focus();
            });
        });
    }

    /**
     * 初始化文本域
     * 处理文本域的自动调整高度
     */
    function initTextarea() {
        // 初始化自动调整高度的文本域
        $('.ffs-textarea[data-auto-height]').each(function () {
            const $textarea = $(this);

            // 设置初始高度
            adjustTextareaHeight($textarea);

            // 输入事件 - 调整高度
            $textarea.on('input', function () {
                adjustTextareaHeight($textarea);
            });
        });

        // 调整文本域高度
        function adjustTextareaHeight($textarea) {
            // 保存原始高度
            const originalHeight = $textarea.height();

            // 重置高度
            $textarea.css('height', 'auto');

            // 获取新高度
            const newHeight = $textarea.prop('scrollHeight');

            // 设置新高度
            $textarea.css('height', newHeight + 'px');

            // 触发高度变化事件
            if (originalHeight !== newHeight) {
                $textarea.trigger('textarea:resize', [newHeight]);
            }
        }
    }

    /**
     * 初始化输入框状态
     * 处理输入框的禁用、只读和错误状态
     */
    function initInputState() {
        // 禁用输入框
        $.fn.disable = function () {
            return this.each(function () {
                const $input = $(this);
                $input.prop('disabled', true);
                $input.addClass('ffs-input-disabled');
            });
        };

        // 启用输入框
        $.fn.enable = function () {
            return this.each(function () {
                const $input = $(this);
                $input.prop('disabled', false);
                $input.removeClass('ffs-input-disabled');
            });
        };

        // 设置只读状态
        $.fn.readonly = function (readonly = true) {
            return this.each(function () {
                const $input = $(this);
                $input.prop('readonly', readonly);

                if (readonly) {
                    $input.addClass('ffs-input-readonly');
                } else {
                    $input.removeClass('ffs-input-readonly');
                }
            });
        };

        // 设置错误状态
        $.fn.setError = function (error = true, message = '') {
            return this.each(function () {
                const $input = $(this);
                const $formItem = $input.closest('.ffs-form-item');

                if (error) {
                    $input.addClass('ffs-input-error');

                    // 如果有表单项，则添加错误消息
                    if ($formItem.length && message) {
                        // 移除旧的错误消息
                        $formItem.find('.ffs-form-item-error-message').remove();

                        // 添加新的错误消息
                        const $error = $(`<div class="ffs-form-item-error-message">${message}</div>`);
                        $formItem.append($error);
                    }
                } else {
                    $input.removeClass('ffs-input-error');

                    // 如果有表单项，则移除错误消息
                    if ($formItem.length) {
                        $formItem.find('.ffs-form-item-error-message').remove();
                    }
                }
            });
        };
    }

    /**
     * 初始化所有输入框组件
     */
    function initAllInput() {
        initSearchInput();
        initNumberInput();
        initPasswordInput();
        initAutocomplete();
        initInputGroup();
        initTextarea();
        initInputState();
    }

    // 在文档加载完成后初始化
    $(document).ready(function () {
        initAllInput();
    });

    // 导出公共API
    return {
        initSearchInput: initSearchInput,
        initNumberInput: initNumberInput,
        initPasswordInput: initPasswordInput,
        initAutocomplete: initAutocomplete,
        initInputGroup: initInputGroup,
        initTextarea: initTextarea,
        initInputState: initInputState,
        initAllInput: initAllInput
    };
})(jQuery);