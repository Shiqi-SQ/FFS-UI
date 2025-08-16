/**
 * FFS UI - 图标组件
 * 提供图标的交互功能，包括提示、徽标、加载状态控制等
 */
(function($) {
    'use strict';

    /**
     * 初始化图标提示
     * 增强图标提示的交互体验
     */
    function initIconTooltip() {
        // 为带有 data-tooltip 属性的图标添加提示功能
        $(document).on('mouseenter', '.ffs-icon-tooltip', function() {
            const $icon = $(this);
            const tooltip = $icon.attr('data-tooltip');
            
            if (!tooltip) return;
            
            // 如果已经有提示元素，则不重复创建
            if ($icon.data('tooltip-element')) return;
            
            // 创建提示元素
            const $tooltip = $('<div class="ffs-icon-tooltip-content"></div>');
            $tooltip.text(tooltip);
            
            // 添加到文档中
            $('body').append($tooltip);
            
            // 计算位置
            const iconRect = $icon[0].getBoundingClientRect();
            const tooltipWidth = $tooltip.outerWidth();
            const tooltipHeight = $tooltip.outerHeight();
            
            const left = iconRect.left + (iconRect.width / 2) - (tooltipWidth / 2) + window.scrollX;
            const top = iconRect.top - tooltipHeight - 8 + window.scrollY;
            
            // 设置位置
            $tooltip.css({
                position: 'absolute',
                top: top + 'px',
                left: left + 'px',
                zIndex: 1000,
                background: 'var(--tooltip-background, rgba(0, 0, 0, 0.75))',
                color: 'var(--tooltip-color, white)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.875em',
                whiteSpace: 'nowrap',
                opacity: 0,
                transition: 'opacity 0.3s'
            });
            
            // 保存提示元素引用
            $icon.data('tooltip-element', $tooltip);
            
            // 显示提示
            setTimeout(() => {
                $tooltip.css('opacity', 1);
            }, 10);
        });
        
        // 鼠标离开时移除提示
        $(document).on('mouseleave', '.ffs-icon-tooltip', function() {
            const $icon = $(this);
            const $tooltip = $icon.data('tooltip-element');
            
            if ($tooltip) {
                // 淡出并移除提示
                $tooltip.css('opacity', 0);
                setTimeout(() => {
                    $tooltip.remove();
                    $icon.removeData('tooltip-element');
                }, 300);
            }
        });
    }
    
    /**
     * 初始化图标徽标
     * 提供动态更新图标徽标的功能
     */
    function initIconBadge() {
        // 设置徽标数量
        $.fn.setIconBadge = function(count) {
            return this.each(function() {
                const $icon = $(this);
                
                // 确保是徽标图标
                if (!$icon.hasClass('ffs-icon-badge')) {
                    $icon.addClass('ffs-icon-badge');
                }
                
                // 移除现有徽标
                $icon.find('.ffs-icon-badge-count').remove();
                
                // 如果数量大于0，则显示徽标
                if (count && count > 0) {
                    // 创建徽标元素
                    const $badge = $('<span class="ffs-icon-badge-count"></span>');
                    
                    // 设置徽标文本
                    if (count > 99) {
                        $badge.text('99+');
                    } else {
                        $badge.text(count);
                    }
                    
                    // 设置徽标样式
                    $badge.css({
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        minWidth: '16px',
                        height: '16px',
                        lineHeight: '16px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        fontSize: '12px',
                        padding: '0 4px',
                        background: 'var(--error-color, #f5222d)',
                        color: 'white',
                        fontWeight: 'bold',
                        boxSizing: 'border-box',
                        zIndex: 1
                    });
                    
                    // 添加到图标
                    $icon.append($badge);
                }
            });
        };
        
        // 清除徽标
        $.fn.clearIconBadge = function() {
            return this.each(function() {
                const $icon = $(this);
                $icon.find('.ffs-icon-badge-count').remove();
            });
        };
    }
    
    /**
     * 初始化图标按钮
     * 为图标按钮添加点击效果
     */
    function initIconButton() {
        // 点击图标按钮时添加涟漪效果
        $(document).on('click', '.ffs-icon-button', function(e) {
            const $btn = $(this);
            
            // 创建涟漪元素
            const $ripple = $('<span class="ffs-icon-button-ripple"></span>');
            
            // 计算涟漪位置
            const offset = $btn.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 设置涟漪样式
            $ripple.css({
                position: 'absolute',
                top: y + 'px',
                left: x + 'px',
                width: '0',
                height: '0',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
            });
            
            // 添加到按钮
            $btn.css('position', 'relative');
            $btn.css('overflow', 'hidden');
            $btn.append($ripple);
            
            // 执行动画
            $ripple.animate({
                width: $btn.outerWidth() * 2.5,
                height: $btn.outerWidth() * 2.5,
                opacity: 0
            }, 400, function() {
                $(this).remove();
            });
        });
    }
    
    /**
     * 初始化图标加载状态
     * 控制图标的加载状态
     */
    function initIconLoading() {
        // 设置图标为加载状态
        $.fn.iconLoading = function(start = true) {
            return this.each(function() {
                const $icon = $(this);
                
                if (start) {
                    // 保存原始类名
                    if (!$icon.data('original-classes')) {
                        $icon.data('original-classes', $icon.attr('class'));
                    }
                    
                    // 添加加载状态
                    $icon.removeClass().addClass('ffs-icon ffs-icon-spin fas fa-spinner');
                } else {
                    // 恢复原始类名
                    const originalClasses = $icon.data('original-classes');
                    if (originalClasses) {
                        $icon.removeClass().addClass(originalClasses);
                        $icon.removeData('original-classes');
                    }
                }
            });
        };
    }
    
    // 在文档加载完成后初始化图标功能
    $(document).ready(function() {
        // 初始化图标提示
        initIconTooltip();
        
        // 初始化图标徽标
        initIconBadge();
        
        // 初始化图标按钮
        initIconButton();
        
        // 初始化图标加载状态
        initIconLoading();
    });
    
    // 暴露图标API
    if (!window.FFS) {
        window.FFS = {};
    }
    
    if (!window.FFS.icon) {
        window.FFS.icon = {
            setBadge: function(selector, count) {
                $(selector).setIconBadge(count);
            },
            clearBadge: function(selector) {
                $(selector).clearIconBadge();
            },
            loading: function(selector, start = true) {
                $(selector).iconLoading(start);
            }
        };
    }

})(jQuery);