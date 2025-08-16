/**
 * FFS UI - 个人中心组件
 * 提供个人中心页面的交互功能，包括菜单切换、内容区域切换、表单处理等
 */
(function($) {
    'use strict';

    /**
     * 初始化侧边栏菜单
     * 处理菜单项的点击事件和活动状态
     */
    function initSidebarMenu() {
        // 菜单项点击事件
        $(document).on('click', '.ffs-person-menu-item', function() {
            const $menuItem = $(this);
            const $sidebar = $menuItem.closest('.ffs-person-sidebar');
            const $personPage = $sidebar.closest('.ffs-person-page');
            const $content = $personPage.find('.ffs-person-content');
            
            // 获取菜单项索引
            const index = $sidebar.find('.ffs-person-menu-item').index($menuItem);
            
            // 更新活动菜单项
            $sidebar.find('.ffs-person-menu-item').removeClass('active');
            $menuItem.addClass('active');
            
            // 如果有对应的内容区域，显示对应内容
            if ($content.length) {
                // 获取菜单项文本（去除图标）
                const menuText = $menuItem.text().trim();
                
                // 更新内容区域标题
                $content.find('.ffs-person-content-title').text(menuText);
                
                // 如果有多个内容区域，切换显示
                const $contentSections = $personPage.find('.ffs-person-content-section');
                if ($contentSections.length > 1) {
                    $contentSections.hide();
                    $contentSections.eq(index).fadeIn(300);
                }
                
                // 触发内容切换事件
                $personPage.trigger('content:change', [index, menuText]);
            }
        });
        
        // 初始化默认活动菜单项
        $('.ffs-person-page').each(function() {
            const $personPage = $(this);
            const $activeMenuItem = $personPage.find('.ffs-person-menu-item.active');
            
            // 如果没有活动菜单项，默认第一个为活动
            if (!$activeMenuItem.length) {
                $personPage.find('.ffs-person-menu-item').first().addClass('active');
            }
            
            // 初始化内容区域
            const $contentSections = $personPage.find('.ffs-person-content-section');
            if ($contentSections.length > 1) {
                $contentSections.hide();
                const activeIndex = $personPage.find('.ffs-person-menu-item.active').index();
                $contentSections.eq(activeIndex >= 0 ? activeIndex : 0).show();
            }
        });
    }
    
    /**
     * 初始化个人设置表单
     * 处理表单验证和提交
     */
    function initPersonSettings() {
        // 表单验证
        $('.ffs-person-settings-form').on('submit', function(e) {
            const $form = $(this);
            let isValid = true;
            
            // 简单验证必填字段
            $form.find('[required]').each(function() {
                const $field = $(this);
                if (!$field.val().trim()) {
                    isValid = false;
                    $field.addClass('ffs-input-error');
                    
                    // 添加错误提示
                    if (!$field.next('.ffs-input-error-message').length) {
                        $field.after('<div class="ffs-input-error-message">此字段不能为空</div>');
                    }
                } else {
                    $field.removeClass('ffs-input-error');
                    $field.next('.ffs-input-error-message').remove();
                }
            });
            
            // 如果验证不通过，阻止提交
            if (!isValid) {
                e.preventDefault();
                return false;
            }
            
            // 触发表单提交事件
            $form.trigger('settings:submit', [$form.serializeArray()]);
        });
        
        // 字段变化时移除错误状态
        $(document).on('input', '.ffs-person-settings-form [required]', function() {
            const $field = $(this);
            if ($field.val().trim()) {
                $field.removeClass('ffs-input-error');
                $field.next('.ffs-input-error-message').remove();
            }
        });
        
        // 头像上传预览
        $(document).on('change', '.ffs-person-avatar-upload input[type="file"]', function() {
            const $input = $(this);
            const $preview = $input.closest('.ffs-person-settings-item').find('.ffs-person-settings-avatar');
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    $preview.attr('src', e.target.result);
                    $preview.trigger('avatar:change', [e.target.result]);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    /**
     * 初始化安全设置
     * 处理安全相关的交互
     */
    function initSecuritySettings() {
        // 修改密码表单验证
        $(document).on('submit', '.ffs-person-security-form', function(e) {
            const $form = $(this);
            const $newPassword = $form.find('[name="newPassword"]');
            const $confirmPassword = $form.find('[name="confirmPassword"]');
            
            // 验证新密码和确认密码是否一致
            if ($newPassword.length && $confirmPassword.length) {
                if ($newPassword.val() !== $confirmPassword.val()) {
                    e.preventDefault();
                    $confirmPassword.addClass('ffs-input-error');
                    
                    // 添加错误提示
                    if (!$confirmPassword.next('.ffs-input-error-message').length) {
                        $confirmPassword.after('<div class="ffs-input-error-message">两次输入的密码不一致</div>');
                    }
                    
                    return false;
                } else {
                    $confirmPassword.removeClass('ffs-input-error');
                    $confirmPassword.next('.ffs-input-error-message').remove();
                }
            }
        });
        
        // 发送验证码
        $(document).on('click', '.ffs-send-code-btn', function() {
            const $btn = $(this);
            const $input = $btn.closest('.ffs-person-security-item').find('input[type="text"]');
            const target = $btn.data('target') || 'phone';
            
            // 禁用按钮并开始倒计时
            if (!$btn.prop('disabled')) {
                let countdown = 60;
                const originalText = $btn.text();
                
                $btn.prop('disabled', true);
                $btn.text(`${countdown}秒后重新发送`);
                
                const timer = setInterval(function() {
                    countdown--;
                    $btn.text(`${countdown}秒后重新发送`);
                    
                    if (countdown <= 0) {
                        clearInterval(timer);
                        $btn.prop('disabled', false);
                        $btn.text(originalText);
                    }
                }, 1000);
                
                // 触发发送验证码事件
                $btn.trigger('code:send', [target, $input.val()]);
            }
        });
    }
    
    /**
     * 初始化消息通知
     */
    function initNotifications() {
        // 消息标记为已读
        $(document).on('click', '.ffs-person-notification-item', function() {
            const $notification = $(this);
            
            if (!$notification.hasClass('read')) {
                $notification.addClass('read');
                
                // 更新未读消息数量
                const $badge = $('.ffs-person-notification-badge');
                if ($badge.length) {
                    const count = parseInt($badge.text(), 10) - 1;
                    if (count > 0) {
                        $badge.text(count);
                    } else {
                        $badge.hide();
                    }
                }
                
                // 触发已读事件
                $notification.trigger('notification:read', [$notification.data('id')]);
            }
        });
        
        // 全部标记为已读
        $(document).on('click', '.ffs-person-notification-read-all', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-person-notification-container');
            
            $container.find('.ffs-person-notification-item').addClass('read');
            
            // 更新未读消息数量
            const $badge = $('.ffs-person-notification-badge');
            if ($badge.length) {
                $badge.hide();
            }
            
            // 触发全部已读事件
            $container.trigger('notification:readAll');
        });
    }
    
    /**
     * 初始化操作记录
     */
    function initActivityLog() {
        // 加载更多记录
        $(document).on('click', '.ffs-person-activity-load-more', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-person-activity-container');
            const page = $btn.data('page') || 1;
            
            // 显示加载状态
            $btn.addClass('loading');
            $btn.prop('disabled', true);
            
            // 触发加载更多事件
            $container.trigger('activity:loadMore', [page + 1]);
            
            // 模拟加载完成后更新页码
            // 实际应用中应该在数据加载完成后执行
            setTimeout(function() {
                $btn.removeClass('loading');
                $btn.prop('disabled', false);
                $btn.data('page', page + 1);
            }, 1000);
        });
    }
    
    /**
     * 初始化响应式行为
     */
    function initResponsiveBehavior() {
        // 移动端侧边栏切换
        $(document).on('click', '.ffs-person-sidebar-toggle', function() {
            const $toggle = $(this);
            const $personPage = $toggle.closest('.ffs-person-page');
            const $sidebar = $personPage.find('.ffs-person-sidebar');
            
            $sidebar.toggleClass('active');
            $toggle.toggleClass('active');
            
            // 添加遮罩层
            if ($sidebar.hasClass('active')) {
                if (!$personPage.find('.ffs-person-sidebar-mask').length) {
                    $personPage.append('<div class="ffs-person-sidebar-mask"></div>');
                    
                    // 点击遮罩层关闭侧边栏
                    $personPage.find('.ffs-person-sidebar-mask').on('click', function() {
                        $sidebar.removeClass('active');
                        $toggle.removeClass('active');
                        $(this).remove();
                    });
                }
            } else {
                $personPage.find('.ffs-person-sidebar-mask').remove();
            }
        });
        
        // 窗口大小变化时处理
        $(window).on('resize', function() {
            if ($(window).width() > 768) {
                $('.ffs-person-sidebar').removeClass('active');
                $('.ffs-person-sidebar-toggle').removeClass('active');
                $('.ffs-person-sidebar-mask').remove();
            }
        });
    }
    
    /**
     * 初始化所有个人中心功能
     */
    function init() {
        initSidebarMenu();
        initPersonSettings();
        initSecuritySettings();
        initNotifications();
        initActivityLog();
        initResponsiveBehavior();
    }
    
    // 在文档加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.personPage = {
        init: init,
        initSidebarMenu: initSidebarMenu,
        initPersonSettings: initPersonSettings,
        initSecuritySettings: initSecuritySettings,
        initNotifications: initNotifications,
        initActivityLog: initActivityLog
    };

})(jQuery);