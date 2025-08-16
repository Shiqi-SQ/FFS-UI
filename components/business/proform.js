/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * FFS UI - 高级表单组件
 * 提供分步表单、高级认证表单、分组表单和动态表单等交互功能
 */
(function($) {
    'use strict';

    /**
     * 初始化分步表单
     * 处理分步表单的步骤切换和表单验证
     */
    function initStepForm() {
        // 下一步按钮点击事件
        $(document).on('click', '.ffs-pro-step-form-next', function() {
            const $btn = $(this);
            const $form = $btn.closest('.ffs-pro-step-form');
            const $steps = $form.find('.ffs-pro-step-form-step');
            const $contents = $form.find('.ffs-pro-step-form-content');
            
            // 获取当前步骤
            const currentIndex = $steps.filter('.active').index();
            const $currentContent = $contents.eq(currentIndex);
            
            // 验证当前步骤表单
            if (!validateStepContent($currentContent)) {
                return;
            }
            
            // 标记当前步骤为已完成
            $steps.eq(currentIndex).removeClass('active').addClass('completed');
            
            // 激活下一步
            $steps.eq(currentIndex + 1).addClass('active');
            
            // 切换内容区域
            $contents.removeClass('active');
            $contents.eq(currentIndex + 1).addClass('active');
            
            // 更新按钮状态
            updateStepFormButtons($form);
            
            // 触发步骤切换事件
            $form.trigger('step:change', [currentIndex + 1]);
        });
        
        // 上一步按钮点击事件
        $(document).on('click', '.ffs-pro-step-form-prev', function() {
            const $btn = $(this);
            const $form = $btn.closest('.ffs-pro-step-form');
            const $steps = $form.find('.ffs-pro-step-form-step');
            const $contents = $form.find('.ffs-pro-step-form-content');
            
            // 获取当前步骤
            const currentIndex = $steps.filter('.active').index();
            
            // 取消当前步骤的激活状态
            $steps.eq(currentIndex).removeClass('active');
            
            // 激活上一步
            $steps.eq(currentIndex - 1).removeClass('completed').addClass('active');
            
            // 切换内容区域
            $contents.removeClass('active');
            $contents.eq(currentIndex - 1).addClass('active');
            
            // 更新按钮状态
            updateStepFormButtons($form);
            
            // 触发步骤切换事件
            $form.trigger('step:change', [currentIndex - 1]);
        });
        
        // 提交按钮点击事件
        $(document).on('click', '.ffs-pro-step-form-submit', function() {
            const $btn = $(this);
            const $form = $btn.closest('.ffs-pro-step-form');
            const $steps = $form.find('.ffs-pro-step-form-step');
            const $contents = $form.find('.ffs-pro-step-form-content');
            
            // 获取当前步骤
            const currentIndex = $steps.filter('.active').index();
            const $currentContent = $contents.eq(currentIndex);
            
            // 验证当前步骤表单
            if (!validateStepContent($currentContent)) {
                return;
            }
            
            // 标记当前步骤为已完成
            $steps.eq(currentIndex).removeClass('active').addClass('completed');
            
            // 触发表单提交事件
            $form.trigger('form:submit');
            
            // 如果表单有原生提交行为，则提交
            if ($form.is('form')) {
                $form.submit();
            }
        });
        
        // 步骤标题点击事件（允许直接跳转到已完成的步骤）
        $(document).on('click', '.ffs-pro-step-form-step-title', function() {
            const $title = $(this);
            const $step = $title.closest('.ffs-pro-step-form-step');
            const $form = $step.closest('.ffs-pro-step-form');
            
            // 如果点击的是当前步骤或未完成的后续步骤，则不处理
            if ($step.hasClass('active') || (!$step.hasClass('completed') && $step.index() > $form.find('.ffs-pro-step-form-step.active').index())) {
                return;
            }
            
            // 获取目标步骤索引
            const targetIndex = $step.index();
            const $steps = $form.find('.ffs-pro-step-form-step');
            const $contents = $form.find('.ffs-pro-step-form-content');
            
            // 更新步骤状态
            $steps.removeClass('active');
            $step.removeClass('completed').addClass('active');
            
            // 切换内容区域
            $contents.removeClass('active');
            $contents.eq(targetIndex).addClass('active');
            
            // 更新按钮状态
            updateStepFormButtons($form);
            
            // 触发步骤切换事件
            $form.trigger('step:change', [targetIndex]);
        });
        
        // 初始化分步表单
        $('.ffs-pro-step-form').each(function() {
            const $form = $(this);
            const $steps = $form.find('.ffs-pro-step-form-step');
            const $contents = $form.find('.ffs-pro-step-form-content');
            
            // 如果没有活动步骤，默认第一个为活动
            if (!$steps.filter('.active').length) {
                $steps.first().addClass('active');
                $contents.first().addClass('active');
            }
            
            // 更新按钮状态
            updateStepFormButtons($form);
        });
        
        // 更新分步表单按钮状态
        function updateStepFormButtons($form) {
            const $steps = $form.find('.ffs-pro-step-form-step');
            const $prevBtn = $form.find('.ffs-pro-step-form-prev');
            const $nextBtn = $form.find('.ffs-pro-step-form-next');
            const $submitBtn = $form.find('.ffs-pro-step-form-submit');
            
            // 获取当前步骤
            const currentIndex = $steps.filter('.active').index();
            const isFirstStep = currentIndex === 0;
            const isLastStep = currentIndex === $steps.length - 1;
            
            // 更新上一步按钮
            if ($prevBtn.length) {
                $prevBtn.prop('disabled', isFirstStep);
                $prevBtn.toggleClass('disabled', isFirstStep);
            }
            
            // 更新下一步按钮
            if ($nextBtn.length) {
                $nextBtn.toggle(!isLastStep);
            }
            
            // 更新提交按钮
            if ($submitBtn.length) {
                $submitBtn.toggle(isLastStep);
            }
        }
        
        // 验证步骤内容
        function validateStepContent($content) {
            let isValid = true;
            
            // 查找所有必填输入框
            $content.find('input[required], select[required], textarea[required]').each(function() {
                const $input = $(this);
                const value = $input.val().trim();
                
                if (!value) {
                    isValid = false;
                    
                    // 添加错误提示
                    const $formItem = $input.closest('.ffs-form-item');
                    if ($formItem.length) {
                        if (!$formItem.find('.ffs-form-error').length) {
                            $formItem.append('<div class="ffs-form-error">此字段为必填项</div>');
                        }
                    } else {
                        // 如果不在表单项容器内，直接在输入框后添加错误提示
                        if (!$input.next('.ffs-form-error').length) {
                            $input.after('<div class="ffs-form-error">此字段为必填项</div>');
                        }
                    }
                    
                    // 添加错误样式
                    $input.addClass('error');
                } else {
                    // 移除错误提示和样式
                    const $formItem = $input.closest('.ffs-form-item');
                    if ($formItem.length) {
                        $formItem.find('.ffs-form-error').remove();
                    } else {
                        $input.next('.ffs-form-error').remove();
                    }
                    $input.removeClass('error');
                }
            });
            
            return isValid;
        }
    }
    
    /**
     * 初始化高级认证表单
     * 处理登录、注册和找回密码等表单的交互
     */
    function initAuthForm() {
        // 表单切换
        $(document).on('click', '.ffs-pro-auth-form-switch', function() {
            const $switch = $(this);
            const targetForm = $switch.data('target');
            
            // 隐藏当前表单
            const $currentForm = $switch.closest('.ffs-pro-auth-form');
            $currentForm.fadeOut(300, function() {
                // 显示目标表单
                $(targetForm).fadeIn(300);
            });
        });
        
        // 表单提交验证
        $(document).on('submit', '.ffs-pro-auth-form form', function(e) {
            const $form = $(this);
            let isValid = true;
            
            // 验证所有必填字段
            $form.find('input[required], select[required], textarea[required]').each(function() {
                const $input = $(this);
                const value = $input.val().trim();
                
                if (!value) {
                    isValid = false;
                    
                    // 添加错误提示
                    const $formItem = $input.closest('.ffs-form-item');
                    if ($formItem.length) {
                        if (!$formItem.find('.ffs-form-error').length) {
                            $formItem.append('<div class="ffs-form-error">此字段为必填项</div>');
                        }
                    } else {
                        // 如果不在表单项容器内，直接在输入框后添加错误提示
                        if (!$input.next('.ffs-form-error').length) {
                            $input.after('<div class="ffs-form-error">此字段为必填项</div>');
                        }
                    }
                    
                    // 添加错误样式
                    $input.addClass('error');
                } else {
                    // 移除错误提示和样式
                    const $formItem = $input.closest('.ffs-form-item');
                    if ($formItem.length) {
                        $formItem.find('.ffs-form-error').remove();
                    } else {
                        $input.next('.ffs-form-error').remove();
                    }
                    $input.removeClass('error');
                }
            });
            
            // 验证密码确认
            const $password = $form.find('input[type="password"][name="password"]');
            const $confirmPassword = $form.find('input[type="password"][name="confirmPassword"]');
            
            if ($password.length && $confirmPassword.length) {
                if ($password.val() !== $confirmPassword.val()) {
                    isValid = false;
                    
                    // 添加错误提示
                    const $formItem = $confirmPassword.closest('.ffs-form-item');
                    if ($formItem.length) {
                        if (!$formItem.find('.ffs-form-error').length) {
                            $formItem.append('<div class="ffs-form-error">两次输入的密码不一致</div>');
                        }
                    } else {
                        // 如果不在表单项容器内，直接在输入框后添加错误提示
                        if (!$confirmPassword.next('.ffs-form-error').length) {
                            $confirmPassword.after('<div class="ffs-form-error">两次输入的密码不一致</div>');
                        }
                    }
                    
                    // 添加错误样式
                    $confirmPassword.addClass('error');
                }
            }
            
            // 如果验证不通过，阻止表单提交
            if (!isValid) {
                e.preventDefault();
                return false;
            }
            
            // 触发表单提交事件
            $form.trigger('auth:submit');
        });
        
        // 验证码发送
        $(document).on('click', '.ffs-pro-auth-form-captcha-btn', function() {
            const $btn = $(this);
            const $input = $btn.closest('.ffs-form-item').find('input[type="text"]');
            const phone = $input.val().trim();
            
            // 验证手机号
            if (!phone || !/^1\d{10}$/.test(phone)) {
                // 添加错误提示
                const $formItem = $input.closest('.ffs-form-item');
                if ($formItem.length) {
                    if (!$formItem.find('.ffs-form-error').length) {
                        $formItem.append('<div class="ffs-form-error">请输入有效的手机号码</div>');
                    }
                } else {
                    // 如果不在表单项容器内，直接在输入框后添加错误提示
                    if (!$input.next('.ffs-form-error').length) {
                        $input.after('<div class="ffs-form-error">请输入有效的手机号码</div>');
                    }
                }
                
                // 添加错误样式
                $input.addClass('error');
                return;
            }
            
            // 移除错误提示和样式
            const $formItem = $input.closest('.ffs-form-item');
            if ($formItem.length) {
                $formItem.find('.ffs-form-error').remove();
            } else {
                $input.next('.ffs-form-error').remove();
            }
            $input.removeClass('error');
            
            // 禁用按钮并开始倒计时
            $btn.prop('disabled', true);
            let countdown = 60;
            const originalText = $btn.text();
            
            $btn.text(`${countdown}秒后重新获取`);
            
            const timer = setInterval(function() {
                countdown--;
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    $btn.prop('disabled', false);
                    $btn.text(originalText);
                } else {
                    $btn.text(`${countdown}秒后重新获取`);
                }
            }, 1000);
            
            // 触发验证码发送事件
            $btn.trigger('captcha:send', [phone]);
        });
        
        // 第三方登录
        $(document).on('click', '.ffs-pro-auth-form-third-party-item', function() {
            const $item = $(this);
            const platform = $item.data('platform');
            
            // 触发第三方登录事件
            $item.trigger('third-party:login', [platform]);
        });
    }
    
    /**
     * 初始化分组表单
     * 处理分组表单的折叠和展开
     */
    function initGroupForm() {
        // 分组标题点击事件
        $(document).on('click', '.ffs-pro-group-form-group-title', function() {
            const $title = $(this);
            const $group = $title.closest('.ffs-pro-group-form-group');
            const $content = $group.find('.ffs-pro-group-form-group-content');
            
            // 切换折叠状态
            $group.toggleClass('collapsed');
            
            // 展开/收起内容
            if ($group.hasClass('collapsed')) {
                $content.slideUp(300);
            } else {
                $content.slideDown(300);
            }
            
            // 触发折叠状态变化事件
            $group.trigger('group:toggle', [$group.hasClass('collapsed')]);
        });
        
        // 初始化分组表单
        $('.ffs-pro-group-form-group').each(function() {
            const $group = $(this);
            const $content = $group.find('.ffs-pro-group-form-group-content');
            
            // 如果分组默认折叠
            if ($group.hasClass('collapsed')) {
                $content.hide();
            }
        });
    }
    
    /**
     * 初始化动态表单
     * 处理动态表单项的添加和删除
     */
    function initDynamicForm() {
        // 添加表单项
        $(document).on('click', '.ffs-pro-dynamic-form-add', function() {
            const $btn = $(this);
            const $form = $btn.closest('.ffs-pro-dynamic-form');
            const $container = $form.find('.ffs-pro-dynamic-form-items');
            const $template = $form.find('.ffs-pro-dynamic-form-template');
            
            // 如果有模板，使用模板创建新项
            if ($template.length) {
                const $newItem = $($template.html());
                $container.append($newItem);
                
                // 清空新项中的输入值
                $newItem.find('input, select, textarea').val('');
                
                // 更新索引
                updateDynamicFormIndices($form);
                
                // 触发项目添加事件
                $form.trigger('item:add', [$newItem]);
            }
        });
        
        // 删除表单项
        $(document).on('click', '.ffs-pro-dynamic-form-item-remove', function() {
            const $btn = $(this);
            const $item = $btn.closest('.ffs-pro-dynamic-form-item');
            const $form = $btn.closest('.ffs-pro-dynamic-form');
            
            // 如果只剩一个项目且设置了最小项目数为1，则不删除
            const $items = $form.find('.ffs-pro-dynamic-form-item');
            const minItems = $form.data('min-items') || 0;
            
            if ($items.length <= minItems) {
                // 显示提示
                const $error = $('<div class="ffs-pro-dynamic-form-error">至少需要保留' + minItems + '个项目</div>');
                $error.insertAfter($btn);
                
                setTimeout(function() {
                    $error.fadeOut(300, function() {
                        $error.remove();
                    });
                }, 2000);
                
                return;
            }
            
            // 删除项目
            $item.fadeOut(300, function() {
                $item.remove();
                
                // 更新索引
                updateDynamicFormIndices($form);
                
                // 触发项目删除事件
                $form.trigger('item:remove');
            });
        });
        
        // 上移表单项
        $(document).on('click', '.ffs-pro-dynamic-form-item-up', function() {
            const $btn = $(this);
            const $item = $btn.closest('.ffs-pro-dynamic-form-item');
            const $prev = $item.prev('.ffs-pro-dynamic-form-item');
            
            // 如果有前一个项目，则交换位置
            if ($prev.length) {
                $item.insertBefore($prev);
                
                // 更新索引
                const $form = $btn.closest('.ffs-pro-dynamic-form');
                updateDynamicFormIndices($form);
                
                // 触发项目移动事件
                $form.trigger('item:move', [$item, 'up']);
            }
        });
        
        // 下移表单项
        $(document).on('click', '.ffs-pro-dynamic-form-item-down', function() {
            const $btn = $(this);
            const $item = $btn.closest('.ffs-pro-dynamic-form-item');
            const $next = $item.next('.ffs-pro-dynamic-form-item');
            
            // 如果有后一个项目，则交换位置
            if ($next.length) {
                $item.insertAfter($next);
                
                // 更新索引
                const $form = $btn.closest('.ffs-pro-dynamic-form');
                updateDynamicFormIndices($form);
                
                // 触发项目移动事件
                $form.trigger('item:move', [$item, 'down']);
            }
        });
        
        // 初始化动态表单
        $('.ffs-pro-dynamic-form').each(function() {
            const $form = $(this);
            const minItems = $form.data('min-items') || 1;
            const $container = $form.find('.ffs-pro-dynamic-form-items');
            const $template = $form.find('.ffs-pro-dynamic-form-template');
            
            // 确保至少有最小数量的项目
            const $items = $container.find('.ffs-pro-dynamic-form-item');
            
            if ($items.length < minItems && $template.length) {
                // 添加缺少的项目
                for (let i = $items.length; i < minItems; i++) {
                    const $newItem = $($template.html());
                    $container.append($newItem);
                    
                    // 清空新项中的输入值
                    $newItem.find('input, select, textarea').val('');
                }
            }
            
            // 更新索引
            updateDynamicFormIndices($form);
        });
        
        // 更新动态表单项索引
        function updateDynamicFormIndices($form) {
            const $items = $form.find('.ffs-pro-dynamic-form-item');
            
            $items.each(function(index) {
                const $item = $(this);
                
                // 更新索引标签
                const $index = $item.find('.ffs-pro-dynamic-form-item-index');
                if ($index.length) {
                    $index.text(index + 1);
                }
                
                // 更新输入字段名称中的索引
                $item.find('input, select, textarea').each(function() {
                    const $input = $(this);
                    const name = $input.attr('name');
                    
                    if (name) {
                        // 替换名称中的索引部分
                        const newName = name.replace(/\[\d+\]/, `[${index}]`);
                        $input.attr('name', newName);
                    }
                });
            });
            
            // 更新上下移动按钮状态
            $items.each(function(index) {
                const $item = $(this);
                const $upBtn = $item.find('.ffs-pro-dynamic-form-item-up');
                const $downBtn = $item.find('.ffs-pro-dynamic-form-item-down');
                
                // 第一项禁用上移
                if ($upBtn.length) {
                    $upBtn.prop('disabled', index === 0);
                    $upBtn.toggleClass('disabled', index === 0);
                }
                
                // 最后一项禁用下移
                if ($downBtn.length) {
                    $downBtn.prop('disabled', index === $items.length - 1);
                    $downBtn.toggleClass('disabled', index === $items.length - 1);
                }
            });
        }
    }
    
    /**
     * 初始化所有高级表单功能
     */
    function init() {
        initStepForm();
        initAuthForm();
        initGroupForm();
        initDynamicForm();
    }
    
    // 在文档加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.proForm = {
        init: init,
        initStepForm: initStepForm,
        initAuthForm: initAuthForm,
        initGroupForm: initGroupForm,
        initDynamicForm: initDynamicForm
    };

})(jQuery);