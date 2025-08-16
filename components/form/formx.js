/**
 * FFS UI - 表单扩展组件
 * 提供单选框、复选框、开关、颜色选择器和动态表单等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化单选框组
     * 处理单选框的选择和禁用状态
     */
    function initRadioGroup() {
        // 单选框点击事件
        $(document).on('change', '.ffs-radio-input', function () {
            const $input = $(this);
            const $radio = $input.closest('.ffs-radio');
            const $group = $radio.closest('.ffs-radio-group');

            // 更新选中状态
            $group.find('.ffs-radio').removeClass('ffs-radio-checked');
            $radio.addClass('ffs-radio-checked');

            // 触发选择事件
            $group.trigger('radio:change', [$input.val()]);
        });

        // 初始化禁用状态
        $('.ffs-radio-input[disabled]').closest('.ffs-radio').addClass('ffs-radio-disabled');
    }

    /**
     * 初始化复选框组
     * 处理复选框的选择和禁用状态
     */
    function initCheckboxGroup() {
        // 复选框点击事件
        $(document).on('change', '.ffs-checkbox-input', function () {
            const $input = $(this);
            const $checkbox = $input.closest('.ffs-checkbox');

            // 更新选中状态
            if ($input.prop('checked')) {
                $checkbox.addClass('ffs-checkbox-checked');
            } else {
                $checkbox.removeClass('ffs-checkbox-checked');
            }

            // 触发选择事件
            const $group = $checkbox.closest('.ffs-checkbox-group');
            if ($group.length) {
                const values = [];
                $group.find('.ffs-checkbox-input:checked').each(function () {
                    values.push($(this).val());
                });
                $group.trigger('checkbox:change', [values]);
            }
        });

        // 初始化选中状态
        $('.ffs-checkbox-input:checked').closest('.ffs-checkbox').addClass('ffs-checkbox-checked');

        // 初始化禁用状态
        $('.ffs-checkbox-input[disabled]').closest('.ffs-checkbox').addClass('ffs-checkbox-disabled');
    }

    /**
     * 初始化开关
     * 处理开关的切换和禁用状态
     */
    function initSwitch() {
        // 开关点击事件
        $(document).on('change', '.ffs-switch-input', function () {
            const $input = $(this);
            const $switch = $input.closest('.ffs-switch');

            // 更新选中状态
            if ($input.prop('checked')) {
                $switch.addClass('ffs-switch-checked');
            } else {
                $switch.removeClass('ffs-switch-checked');
            }

            // 触发切换事件
            $switch.trigger('switch:change', [$input.prop('checked')]);
        });

        // 初始化选中状态
        $('.ffs-switch-input:checked').closest('.ffs-switch').addClass('ffs-switch-checked');

        // 初始化禁用状态
        $('.ffs-switch-input[disabled]').closest('.ffs-switch').addClass('ffs-switch-disabled');
    }

    /**
     * 初始化颜色选择器
     * 处理颜色选择和自定义颜色输入
     */
    function initColorPicker() {
        // 默认颜色列表
        const defaultColors = [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
            '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
            '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
            '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#000000'
        ];

        // 初始化颜色选择器
        $('.ffs-colorpicker').each(function () {
            const $picker = $(this);
            const $input = $picker.find('input[type="text"]');
            const $preview = $picker.find('.ffs-colorpicker-preview');

            // 如果没有下拉菜单，则创建
            if (!$picker.find('.ffs-colorpicker-dropdown').length) {
                const $dropdown = $('<div class="ffs-colorpicker-dropdown"></div>');
                const $palette = $('<div class="ffs-colorpicker-palette"></div>');

                // 添加预设颜色
                defaultColors.forEach(color => {
                    const $colorItem = $(`<div class="ffs-colorpicker-color-item" style="background-color: ${color}" data-color="${color}"></div>`);
                    $palette.append($colorItem);
                });

                // 添加自定义颜色输入
                const $customInput = $(`
                    <div class="ffs-colorpicker-input">
                        <input type="text" placeholder="#RRGGBB">
                        <button class="ffs-colorpicker-apply">应用</button>
                    </div>
                `);

                $dropdown.append($palette);
                $dropdown.append($customInput);
                $picker.append($dropdown);
            }
        });

        // 点击预览打开/关闭下拉菜单
        $(document).on('click', '.ffs-colorpicker-preview', function (e) {
            e.stopPropagation();
            const $picker = $(this).closest('.ffs-colorpicker');
            $picker.toggleClass('ffs-colorpicker-open');
        });

        // 选择预设颜色
        $(document).on('click', '.ffs-colorpicker-color-item', function () {
            const $item = $(this);
            const color = $item.data('color');
            const $picker = $item.closest('.ffs-colorpicker');
            const $input = $picker.find('input[type="text"]');
            const $preview = $picker.find('.ffs-colorpicker-preview');

            // 更新选中状态
            $picker.find('.ffs-colorpicker-color-item').removeClass('ffs-colorpicker-color-item-selected');
            $item.addClass('ffs-colorpicker-color-item-selected');

            // 更新预览和输入框
            $preview.css('background-color', color);
            $input.val(color);

            // 触发颜色变化事件
            $picker.trigger('color:change', [color]);

            // 关闭下拉菜单
            $picker.removeClass('ffs-colorpicker-open');
        });

        // 应用自定义颜色
        $(document).on('click', '.ffs-colorpicker-apply', function () {
            const $button = $(this);
            const $picker = $button.closest('.ffs-colorpicker');
            const $customInput = $button.prev('input');
            const $mainInput = $picker.find('input[type="text"]').first();
            const $preview = $picker.find('.ffs-colorpicker-preview');

            // 获取颜色值
            let color = $customInput.val();

            // 验证颜色格式
            if (!/^#[0-9A-F]{6}$/i.test(color)) {
                // 尝试添加#前缀
                if (/^[0-9A-F]{6}$/i.test(color)) {
                    color = '#' + color;
                } else {
                    // 无效颜色
                    $customInput.addClass('ffs-colorpicker-input-error');
                    setTimeout(() => {
                        $customInput.removeClass('ffs-colorpicker-input-error');
                    }, 1000);
                    return;
                }
            }

            // 更新预览和输入框
            $preview.css('background-color', color);
            $mainInput.val(color);

            // 触发颜色变化事件
            $picker.trigger('color:change', [color]);

            // 关闭下拉菜单
            $picker.removeClass('ffs-colorpicker-open');
        });

        // 点击外部关闭下拉菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ffs-colorpicker').length) {
                $('.ffs-colorpicker-open').removeClass('ffs-colorpicker-open');
            }
        });
    }

    /**
     * 初始化动态表单
     * 处理表单项的添加、删除和排序
     */
    function initDynamicForm() {
        // 添加表单项
        $(document).on('click', '.ffs-dynamic-form-add', function () {
            const $addBtn = $(this);
            const $form = $addBtn.closest('.ffs-dynamic-form');

            // 克隆第一个表单项或创建新表单项
            let $newItem;
            const $firstItem = $form.find('.ffs-dynamic-form-item').first();

            if ($firstItem.length) {
                $newItem = $firstItem.clone(true);
                // 清空输入值
                $newItem.find('input, select, textarea').val('');
                $newItem.find('.ffs-checkbox-input, .ffs-radio-input, .ffs-switch-input').prop('checked', false);
            } else {
                $newItem = $(`
                    <div class="ffs-dynamic-form-item">
                        <div class="ffs-dynamic-form-item-handle">
                            <i class="fas fa-grip-vertical"></i>
                        </div>
                        <div class="ffs-dynamic-form-item-content">
                            <input type="text" placeholder="请输入内容">
                        </div>
                        <div class="ffs-dynamic-form-item-actions">
                            <button class="ffs-dynamic-form-item-action">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="ffs-dynamic-form-item-action ffs-dynamic-form-item-action-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `);
            }

            // 插入新表单项
            $form.find('.ffs-dynamic-form-item').last().after($newItem);

            // 触发添加事件
            $form.trigger('dynamicform:add', [$newItem]);
        });

        // 删除表单项
        $(document).on('click', '.ffs-dynamic-form-item-action-danger', function () {
            const $deleteBtn = $(this);
            const $item = $deleteBtn.closest('.ffs-dynamic-form-item');
            const $form = $item.closest('.ffs-dynamic-form');

            // 如果只有一个表单项，则不删除
            if ($form.find('.ffs-dynamic-form-item').length <= 1) {
                return;
            }

            // 删除表单项
            $item.fadeOut(300, function () {
                $item.remove();

                // 触发删除事件
                $form.trigger('dynamicform:remove', [$item]);
            });
        });

        // 添加表单项（通过加号按钮）
        $(document).on('click', '.ffs-dynamic-form-item-action:not(.ffs-dynamic-form-item-action-danger)', function () {
            const $addBtn = $(this);
            const $item = $addBtn.closest('.ffs-dynamic-form-item');
            const $form = $item.closest('.ffs-dynamic-form');

            // 克隆当前表单项
            const $newItem = $item.clone(true);

            // 清空输入值
            $newItem.find('input, select, textarea').val('');
            $newItem.find('.ffs-checkbox-input, .ffs-radio-input, .ffs-switch-input').prop('checked', false);

            // 插入新表单项
            $item.after($newItem);

            // 触发添加事件
            $form.trigger('dynamicform:add', [$newItem]);
        });

        // 初始化拖拽排序
        if ($.fn.sortable) {
            $('.ffs-dynamic-form').sortable({
                items: '.ffs-dynamic-form-item',
                handle: '.ffs-dynamic-form-item-handle',
                placeholder: 'ffs-dynamic-form-item-placeholder',
                update: function (event, ui) {
                    $(this).trigger('dynamicform:sort');
                }
            });
        }
    }

    /**
     * 初始化表单验证
     * 处理表单项的验证和错误提示
     */
    function initFormValidation() {
        // 添加验证方法
        $.fn.validate = function (rules) {
            return this.each(function () {
                const $form = $(this);

                // 存储验证规则
                $form.data('validation-rules', rules);

                // 绑定提交事件
                $form.on('submit', function (e) {
                    // 验证表单
                    const isValid = validateForm($form);

                    // 如果验证失败，阻止提交
                    if (!isValid) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    // 触发验证事件
                    $form.trigger('form:validate', [isValid]);
                });

                // 绑定输入事件（实时验证）
                $form.on('input change', 'input, select, textarea', function () {
                    const $input = $(this);
                    const name = $input.attr('name');

                    // 如果有验证规则，则验证
                    if (rules && rules[name]) {
                        validateField($input, rules[name]);
                    }
                });
            });
        };

        // 验证表单
        function validateForm($form) {
            const rules = $form.data('validation-rules');
            let isValid = true;

            // 如果没有规则，则返回true
            if (!rules) return true;

            // 验证每个字段
            for (const name in rules) {
                const $input = $form.find(`[name="${name}"]`);
                if ($input.length) {
                    const fieldValid = validateField($input, rules[name]);
                    if (!fieldValid) {
                        isValid = false;
                    }
                }
            }

            return isValid;
        }

        // 验证字段
        function validateField($input, rules) {
            const $formItem = $input.closest('.ffs-form-item');
            const value = $input.val();
            let isValid = true;
            let errorMessage = '';

            // 验证规则
            if (rules.required && !value) {
                isValid = false;
                errorMessage = rules.message || '此字段为必填项';
            } else if (rules.pattern && value) {
                const pattern = new RegExp(rules.pattern);
                if (!pattern.test(value)) {
                    isValid = false;
                    errorMessage = rules.message || '格式不正确';
                }
            } else if (rules.min && value && parseFloat(value) < rules.min) {
                isValid = false;
                errorMessage = rules.message || `不能小于 ${rules.min}`;
            } else if (rules.max && value && parseFloat(value) > rules.max) {
                isValid = false;
                errorMessage = rules.message || `不能大于 ${rules.max}`;
            } else if (rules.minLength && value && value.length < rules.minLength) {
                isValid = false;
                errorMessage = rules.message || `长度不能小于 ${rules.minLength}`;
            } else if (rules.maxLength && value && value.length > rules.maxLength) {
                isValid = false;
                errorMessage = rules.message || `长度不能大于 ${rules.maxLength}`;
            } else if (rules.validator && typeof rules.validator === 'function') {
                // 自定义验证
                const result = rules.validator(value);
                if (result !== true) {
                    isValid = false;
                    errorMessage = result || rules.message || '验证失败';
                }
            }

            // 更新表单项状态
            if (isValid) {
                // 移除错误状态
                $formItem.removeClass('ffs-form-item-error');
                $formItem.find('.ffs-form-item-error-message').remove();

                // 如果有成功提示，则显示
                if (rules.success) {
                    $formItem.addClass('ffs-form-item-success');

                    // 添加成功提示（如果不存在）
                    if (!$formItem.find('.ffs-form-item-success').length) {
                        const $success = $(`<div class="ffs-form-item-success">${rules.success}</div>`);
                        $formItem.append($success);
                    }
                }
            } else {
                // 添加错误状态
                $formItem.addClass('ffs-form-item-error');
                $formItem.removeClass('ffs-form-item-success');

                // 移除成功提示
                $formItem.find('.ffs-form-item-success').remove();

                // 添加错误提示（如果不存在）
                if (!$formItem.find('.ffs-form-item-error-message').length) {
                    const $error = $(`<div class="ffs-form-item-error-message">${errorMessage}</div>`);
                    $formItem.append($error);
                } else {
                    // 更新错误提示
                    $formItem.find('.ffs-form-item-error-message').text(errorMessage);
                }
            }

            // 触发验证事件
            $input.trigger('field:validate', [isValid, errorMessage]);

            return isValid;
        }
    }

    /**
     * 初始化评分组件
     * 处理评分的选择和只读状态
     */
    function initRating() {
        // 鼠标悬停事件
        $(document).on('mouseover', '.ffs-rating:not(.ffs-rating-disabled) .ffs-rating-item', function () {
            const $item = $(this);
            const $rating = $item.closest('.ffs-rating');
            const index = $item.index();

            // 更新悬停状态
            $rating.find('.ffs-rating-item').each(function (i) {
                if (i <= index) {
                    $(this).addClass('ffs-rating-item-hover');
                } else {
                    $(this).removeClass('ffs-rating-item-hover');
                }
            });
        });

        // 鼠标离开事件
        $(document).on('mouseleave', '.ffs-rating', function () {
            const $rating = $(this);

            // 移除所有悬停状态
            $rating.find('.ffs-rating-item').removeClass('ffs-rating-item-hover');
        });

        // 点击事件
        $(document).on('click', '.ffs-rating:not(.ffs-rating-disabled) .ffs-rating-item', function () {
            const $item = $(this);
            const $rating = $item.closest('.ffs-rating');
            const index = $item.index();
            const value = index + 1;

            // 更新选中状态
            $rating.find('.ffs-rating-item').each(function (i) {
                if (i <= index) {
                    $(this).addClass('ffs-rating-item-active');
                } else {
                    $(this).removeClass('ffs-rating-item-active');
                }
            });

            // 更新隐藏输入值
            const $input = $rating.find('input[type="hidden"]');
            if ($input.length) {
                $input.val(value);
            }

            // 触发评分事件
            $rating.trigger('rating:change', [value]);
        });

        // 初始化评分值
        $('.ffs-rating').each(function () {
            const $rating = $(this);
            const $input = $rating.find('input[type="hidden"]');

            if ($input.length && $input.val()) {
                const value = parseInt($input.val(), 10);

                // 更新选中状态
                $rating.find('.ffs-rating-item').each(function (i) {
                    if (i < value) {
                        $(this).addClass('ffs-rating-item-active');
                    }
                });
            }
        });
    }

    /**
     * 初始化标签输入
     * 处理标签的添加、删除和限制
     */
    function initTagInput() {
        // 初始化标签输入
        $('.ffs-taginput').each(function () {
            const $container = $(this);
            const $input = $container.find('input[type="text"]');
            const $tagList = $container.find('.ffs-taginput-tags');

            // 如果没有标签列表，则创建
            if (!$tagList.length) {
                const $newTagList = $('<div class="ffs-taginput-tags"></div>');
                $container.prepend($newTagList);
            }
        });

        // 添加标签
        function addTag($container, tagText) {
            // 获取标签列表
            const $tagList = $container.find('.ffs-taginput-tags');
            const $input = $container.find('input[type="text"]');

            // 清理标签文本
            tagText = tagText.trim();

            // 如果标签为空，则不添加
            if (!tagText) return;

            // 检查是否已存在相同标签
            let isDuplicate = false;
            $tagList.find('.ffs-taginput-tag').each(function () {
                if ($(this).data('value') === tagText) {
                    isDuplicate = true;
                    return false;
                }
            });

            if (isDuplicate) {
                // 显示重复提示
                $input.addClass('ffs-taginput-input-error');
                setTimeout(() => {
                    $input.removeClass('ffs-taginput-input-error');
                }, 1000);
                return;
            }

            // 检查最大标签数量
            const maxTags = parseInt($container.data('max-tags'), 10) || 0;
            if (maxTags > 0 && $tagList.find('.ffs-taginput-tag').length >= maxTags) {
                // 显示超出限制提示
                $input.addClass('ffs-taginput-input-error');
                setTimeout(() => {
                    $input.removeClass('ffs-taginput-input-error');
                }, 1000);
                return;
            }

            // 创建标签元素
            const $tag = $(`
                <div class="ffs-taginput-tag" data-value="${tagText}">
                    <span class="ffs-taginput-tag-text">${tagText}</span>
                    <span class="ffs-taginput-tag-remove">
                        <i class="fas fa-times"></i>
                    </span>
                </div>
            `);

            // 添加到标签列表
            $tagList.append($tag);

            // 清空输入框
            $input.val('');

            // 更新隐藏输入值
            updateTagsValue($container);

            // 触发添加事件
            $container.trigger('tag:add', [tagText]);
        }

        // 删除标签
        function removeTag($tag) {
            const $container = $tag.closest('.ffs-taginput');
            const tagText = $tag.data('value');

            // 移除标签
            $tag.remove();

            // 更新隐藏输入值
            updateTagsValue($container);

            // 触发删除事件
            $container.trigger('tag:remove', [tagText]);
        }

        // 更新隐藏输入值
        function updateTagsValue($container) {
            const $hiddenInput = $container.find('input[type="hidden"]');
            if (!$hiddenInput.length) return;

            // 获取所有标签值
            const tags = [];
            $container.find('.ffs-taginput-tag').each(function () {
                tags.push($(this).data('value'));
            });

            // 更新隐藏输入值
            $hiddenInput.val(tags.join(','));
        }

        // 输入框按键事件
        $(document).on('keydown', '.ffs-taginput input[type="text"]', function (e) {
            const $input = $(this);
            const $container = $input.closest('.ffs-taginput');

            // 按回车键添加标签
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag($container, $input.val());
            }

            // 按退格键删除最后一个标签
            if (e.key === 'Backspace' && $input.val() === '') {
                const $lastTag = $container.find('.ffs-taginput-tag').last();
                if ($lastTag.length) {
                    removeTag($lastTag);
                }
            }
        });

        // 输入框失去焦点事件
        $(document).on('blur', '.ffs-taginput input[type="text"]', function () {
            const $input = $(this);
            const $container = $input.closest('.ffs-taginput');

            // 如果有输入内容，则添加标签
            if ($input.val().trim()) {
                addTag($container, $input.val());
            }
        });

        // 删除标签按钮点击事件
        $(document).on('click', '.ffs-taginput-tag-remove', function () {
            const $removeBtn = $(this);
            const $tag = $removeBtn.closest('.ffs-taginput-tag');

            removeTag($tag);
        });

        // 初始化已有标签
        $('.ffs-taginput').each(function () {
            const $container = $(this);
            const $hiddenInput = $container.find('input[type="hidden"]');

            if ($hiddenInput.length && $hiddenInput.val()) {
                const tags = $hiddenInput.val().split(',');

                // 添加已有标签
                tags.forEach(tag => {
                    if (tag.trim()) {
                        addTag($container, tag);
                    }
                });
            }
        });
    }

    /**
     * 初始化所有表单扩展组件
     */
    function initAllFormX() {
        initRadioGroup();
        initCheckboxGroup();
        initSwitch();
        initColorPicker();
        initDynamicForm();
        initFormValidation();
        initRating();
        initTagInput();
    }

    // 在文档加载完成后初始化
    $(document).ready(function () {
        initAllFormX();
    });

    // 导出公共API
    return {
        initRadioGroup: initRadioGroup,
        initCheckboxGroup: initCheckboxGroup,
        initSwitch: initSwitch,
        initColorPicker: initColorPicker,
        initDynamicForm: initDynamicForm,
        initFormValidation: initFormValidation,
        initRating: initRating,
        initTagInput: initTagInput,
        initAllFormX: initAllFormX
    };
})(jQuery);