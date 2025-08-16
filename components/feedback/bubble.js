/**
 * FFS UI - 气泡提示组件
 * 提供文字提示、气泡确认框、操作反馈和上下文菜单等功能
 */
(function($) {
    'use strict';

    /**
     * 初始化文字提示
     * 处理 ffs-tooltip 的显示和隐藏
     */
    function initTooltip() {
        // 对于移动设备，点击显示提示
        if ('ontouchstart' in document.documentElement) {
            $(document).on('click', '.ffs-tooltip', function(e) {
                e.preventDefault();
                const $tooltip = $(this);
                const $content = $tooltip.find('.ffs-tooltip-content');
                
                // 隐藏其他提示
                $('.ffs-tooltip').not($tooltip).find('.ffs-tooltip-content').css('opacity', 0);
                
                // 切换当前提示
                const isVisible = $content.css('opacity') > 0;
                $content.css('opacity', isVisible ? 0 : 1);
                
                // 点击其他地方关闭提示
                if (!isVisible) {
                    const closeTooltip = function(event) {
                        if (!$tooltip.is(event.target) && $tooltip.has(event.target).length === 0) {
                            $content.css('opacity', 0);
                            $(document).off('click', closeTooltip);
                        }
                    };
                    
                    setTimeout(function() {
                        $(document).on('click', closeTooltip);
                    }, 10);
                }
            });
        }
        
        // 自动调整提示位置，避免超出视口
        $('.ffs-tooltip').each(function() {
            const $tooltip = $(this);
            const $content = $tooltip.find('.ffs-tooltip-content');
            
            $tooltip.on('mouseenter', function() {
                // 获取提示内容的位置和尺寸
                const contentRect = $content[0].getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // 检查是否超出视口
                if (contentRect.right > viewportWidth) {
                    // 如果右侧超出，改为左侧显示
                    $tooltip.removeClass('ffs-tooltip-right').addClass('ffs-tooltip-left');
                } else if (contentRect.left < 0) {
                    // 如果左侧超出，改为右侧显示
                    $tooltip.removeClass('ffs-tooltip-left').addClass('ffs-tooltip-right');
                }
                
                if (contentRect.bottom > viewportHeight) {
                    // 如果底部超出，改为顶部显示
                    $tooltip.removeClass('ffs-tooltip-bottom').addClass('ffs-tooltip-top');
                } else if (contentRect.top < 0) {
                    // 如果顶部超出，改为底部显示
                    $tooltip.removeClass('ffs-tooltip-top').addClass('ffs-tooltip-bottom');
                }
            });
        });
    }

    /**
     * 初始化气泡确认框
     * 处理 ffs-popconfirm 的显示、隐藏和确认/取消操作
     */
    function initPopconfirm() {
        // 点击触发元素显示/隐藏确认框
        $(document).on('click', '.ffs-popconfirm > *:first-child', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const $trigger = $(this);
            const $popconfirm = $trigger.closest('.ffs-popconfirm');
            const $content = $popconfirm.find('.ffs-popconfirm-content');
            
            // 隐藏其他确认框
            $('.ffs-popconfirm-content.show').not($content).removeClass('show');
            
            // 切换当前确认框
            $content.toggleClass('show');
            
            // 如果显示了确认框，绑定点击其他地方关闭
            if ($content.hasClass('show')) {
                const closePopconfirm = function(event) {
                    if (!$popconfirm.is(event.target) && $popconfirm.has(event.target).length === 0) {
                        $content.removeClass('show');
                        $(document).off('click', closePopconfirm);
                    }
                };
                
                setTimeout(function() {
                    $(document).on('click', closePopconfirm);
                }, 10);
            }
        });
        
        // 点击确认按钮
        $(document).on('click', '.ffs-popconfirm-buttons .ffs-button:first-child', function() {
            const $button = $(this);
            const $content = $button.closest('.ffs-popconfirm-content');
            const $popconfirm = $content.closest('.ffs-popconfirm');
            
            // 隐藏确认框
            $content.removeClass('show');
            
            // 触发确认事件
            $popconfirm.trigger('popconfirm:confirm');
        });
        
        // 点击取消按钮
        $(document).on('click', '.ffs-popconfirm-buttons .ffs-button:last-child', function() {
            const $button = $(this);
            const $content = $button.closest('.ffs-popconfirm-content');
            const $popconfirm = $content.closest('.ffs-popconfirm');
            
            // 隐藏确认框
            $content.removeClass('show');
            
            // 触发取消事件
            $popconfirm.trigger('popconfirm:cancel');
        });
    }

    /**
     * 初始化操作反馈
     * 处理 ffs-feedback 的显示和自动隐藏
     */
    function initFeedback() {
        // 显示反馈
        $.fn.showFeedback = function(duration = 2000) {
            return this.each(function() {
                const $feedback = $(this);
                
                // 如果不是 .ffs-feedback 元素，查找最近的
                const $target = $feedback.hasClass('ffs-feedback') ? 
                                $feedback : $feedback.closest('.ffs-feedback');
                
                if (!$target.length) return;
                
                // 显示反馈
                $target.addClass('show');
                
                // 设置自动隐藏
                clearTimeout($target.data('feedbackTimer'));
                const timer = setTimeout(function() {
                    $target.removeClass('show');
                }, duration);
                
                // 存储定时器ID
                $target.data('feedbackTimer', timer);
            });
        };
        
        // 隐藏反馈
        $.fn.hideFeedback = function() {
            return this.each(function() {
                const $feedback = $(this);
                
                // 如果不是 .ffs-feedback 元素，查找最近的
                const $target = $feedback.hasClass('ffs-feedback') ? 
                                $feedback : $feedback.closest('.ffs-feedback');
                
                if (!$target.length) return;
                
                // 清除定时器
                clearTimeout($target.data('feedbackTimer'));
                
                // 隐藏反馈
                $target.removeClass('show');
            });
        };
        
        // 点击触发元素显示反馈
        $(document).on('click', '.ffs-feedback > *:first-child', function(e) {
            e.preventDefault();
            
            const $trigger = $(this);
            const $feedback = $trigger.closest('.ffs-feedback');
            
            // 显示反馈
            $feedback.showFeedback();
        });
    }

    /**
     * 初始化上下文菜单
     * 处理 ffs-contextmenu 的显示、定位和交互
     */
    function initContextMenu() {
        // 右键菜单
        $(document).on('contextmenu', '[data-contextmenu]', function(e) {
            e.preventDefault();
            
            const $trigger = $(this);
            const menuId = $trigger.data('contextmenu');
            const $menu = $('#' + menuId);
            
            if (!$menu.length) return;
            
            // 隐藏其他上下文菜单
            $('.ffs-contextmenu.show').not($menu).removeClass('show');
            
            // 设置菜单位置
            $menu.css({
                left: e.pageX + 'px',
                top: e.pageY + 'px'
            });
            
            // 显示菜单
            $menu.addClass('show');
            
            // 检查菜单是否超出视口
            const menuRect = $menu[0].getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // 调整水平位置
            if (menuRect.right > viewportWidth) {
                $menu.css('left', (e.pageX - menuRect.width) + 'px');
            }
            
            // 调整垂直位置
            if (menuRect.bottom > viewportHeight) {
                $menu.css('top', (e.pageY - menuRect.height) + 'px');
            }
            
            // 点击其他地方关闭菜单
            const closeMenu = function(event) {
                if (!$menu.is(event.target) && $menu.has(event.target).length === 0) {
                    $menu.removeClass('show');
                    $(document).off('click', closeMenu);
                }
            };
            
            setTimeout(function() {
                $(document).on('click', closeMenu);
            }, 10);
            
            // 触发菜单显示事件
            $trigger.trigger('contextmenu:show', [$menu]);
        });
        
        // 点击菜单项
        $(document).on('click', '.ffs-contextmenu-item:not(.disabled)', function() {
            const $item = $(this);
            const $menu = $item.closest('.ffs-contextmenu');
            const itemText = $item.find('span').text();
            const itemIndex = $item.index();
            
            // 隐藏菜单
            $menu.removeClass('show');
            
            // 触发菜单项点击事件
            $menu.trigger('contextmenu:select', [$item, itemText, itemIndex]);
        });
        
        // 手动显示上下文菜单
        $.fn.showContextMenu = function(x, y) {
            return this.each(function() {
                const $menu = $(this);
                
                if (!$menu.hasClass('ffs-contextmenu')) return;
                
                // 隐藏其他上下文菜单
                $('.ffs-contextmenu.show').not($menu).removeClass('show');
                
                // 设置菜单位置
                $menu.css({
                    left: x + 'px',
                    top: y + 'px'
                });
                
                // 显示菜单
                $menu.addClass('show');
                
                // 检查菜单是否超出视口
                const menuRect = $menu[0].getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // 调整水平位置
                if (menuRect.right > viewportWidth) {
                    $menu.css('left', (x - menuRect.width) + 'px');
                }
                
                // 调整垂直位置
                if (menuRect.bottom > viewportHeight) {
                    $menu.css('top', (y - menuRect.height) + 'px');
                }
                
                // 点击其他地方关闭菜单
                const closeMenu = function(event) {
                    if (!$menu.is(event.target) && $menu.has(event.target).length === 0) {
                        $menu.removeClass('show');
                        $(document).off('click', closeMenu);
                    }
                };
                
                setTimeout(function() {
                    $(document).on('click', closeMenu);
                }, 10);
            });
        };
        
        // 手动隐藏上下文菜单
        $.fn.hideContextMenu = function() {
            return this.each(function() {
                const $menu = $(this);
                
                if (!$menu.hasClass('ffs-contextmenu')) return;
                
                // 隐藏菜单
                $menu.removeClass('show');
            });
        };
    }

    /**
     * 初始化所有气泡提示组件
     */
    function initAllBubbles() {
        initTooltip();
        initPopconfirm();
        initFeedback();
        initContextMenu();
    }

    // 在文档加载完成后初始化
    $(document).ready(function() {
        initAllBubbles();
    });

    // 导出公共API
    return {
        initTooltip: initTooltip,
        initPopconfirm: initPopconfirm,
        initFeedback: initFeedback,
        initContextMenu: initContextMenu,
        initAllBubbles: initAllBubbles
    };
})(jQuery);