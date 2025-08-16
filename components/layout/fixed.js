/**
 * FFS UI - 固定布局组件
 * 提供固定布局的交互功能，包括固定元素控制、遮罩控制和动画效果
 */
(function($) {
    'use strict';

    /**
     * 初始化固定元素
     * 处理固定元素的显示/隐藏和定位
     */
    function initFixedElement() {
        // 显示固定元素
        $.fn.showFixed = function(options) {
            return this.each(function() {
                const $element = $(this);
                const settings = $.extend({
                    position: 'center', // center, top-left, top-right, bottom-left, bottom-right
                    animation: 'fade',  // fade, slide-left, slide-right, slide-up, slide-down
                    duration: 300,
                    mask: false,
                    zIndex: 1000
                }, options);
                
                // 设置z-index
                $element.css('z-index', settings.zIndex);
                
                // 创建遮罩（如果需要）
                if (settings.mask) {
                    const $mask = $('<div class="ffs-fixed-mask"></div>');
                    $mask.css('z-index', settings.zIndex - 1);
                    $('body').append($mask);
                    $element.data('mask', $mask);
                    
                    // 遮罩点击关闭
                    $mask.on('click', function() {
                        $element.hideFixed();
                    });
                    
                    // 显示遮罩
                    setTimeout(function() {
                        $mask.css('opacity', 1);
                    }, 10);
                }
                
                // 设置位置
                if (settings.position === 'center') {
                    $element.css({
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    });
                } else if (settings.position === 'top-left') {
                    $element.css({
                        top: '20px',
                        left: '20px'
                    });
                } else if (settings.position === 'top-right') {
                    $element.css({
                        top: '20px',
                        right: '20px'
                    });
                } else if (settings.position === 'bottom-left') {
                    $element.css({
                        bottom: '20px',
                        left: '20px'
                    });
                } else if (settings.position === 'bottom-right') {
                    $element.css({
                        bottom: '20px',
                        right: '20px'
                    });
                }
                
                // 应用动画
                if (settings.animation === 'fade') {
                    $element.css('opacity', 0).addClass('ffs-fixed-fade');
                    setTimeout(function() {
                        $element.css('opacity', 1);
                    }, 10);
                } else if (settings.animation === 'slide-left') {
                    $element.addClass('ffs-fixed-slide ffs-fixed-slide-left');
                    setTimeout(function() {
                        $element.css('transform', 'translateX(0)');
                    }, 10);
                } else if (settings.animation === 'slide-right') {
                    $element.addClass('ffs-fixed-slide ffs-fixed-slide-right');
                    setTimeout(function() {
                        $element.css('transform', 'translateX(0)');
                    }, 10);
                } else if (settings.animation === 'slide-up') {
                    $element.addClass('ffs-fixed-slide ffs-fixed-slide-up');
                    setTimeout(function() {
                        $element.css('transform', 'translateY(0)');
                    }, 10);
                } else if (settings.animation === 'slide-down') {
                    $element.addClass('ffs-fixed-slide ffs-fixed-slide-down');
                    setTimeout(function() {
                        $element.css('transform', 'translateY(0)');
                    }, 10);
                }
                
                // 标记为显示状态
                $element.data('fixed-visible', true);
                
                // 触发显示事件
                $element.trigger('fixed:show');
            });
        };
        
        // 隐藏固定元素
        $.fn.hideFixed = function(callback) {
            return this.each(function() {
                const $element = $(this);
                
                // 如果不是显示状态，则跳过
                if (!$element.data('fixed-visible')) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                    return;
                }
                
                // 获取遮罩
                const $mask = $element.data('mask');
                
                // 应用隐藏动画
                if ($element.hasClass('ffs-fixed-fade')) {
                    $element.css('opacity', 0);
                    setTimeout(function() {
                        $element.css('display', 'none');
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }, 300);
                } else if ($element.hasClass('ffs-fixed-slide-left')) {
                    $element.css('transform', 'translateX(-100%)');
                    setTimeout(function() {
                        $element.css('display', 'none');
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }, 300);
                } else if ($element.hasClass('ffs-fixed-slide-right')) {
                    $element.css('transform', 'translateX(100%)');
                    setTimeout(function() {
                        $element.css('display', 'none');
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }, 300);
                } else if ($element.hasClass('ffs-fixed-slide-up')) {
                    $element.css('transform', 'translateY(-100%)');
                    setTimeout(function() {
                        $element.css('display', 'none');
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }, 300);
                } else if ($element.hasClass('ffs-fixed-slide-down')) {
                    $element.css('transform', 'translateY(100%)');
                    setTimeout(function() {
                        $element.css('display', 'none');
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }, 300);
                } else {
                    $element.css('display', 'none');
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
                
                // 隐藏遮罩
                if ($mask) {
                    $mask.css('opacity', 0);
                    setTimeout(function() {
                        $mask.remove();
                    }, 300);
                }
                
                // 标记为隐藏状态
                $element.data('fixed-visible', false);
                
                // 触发隐藏事件
                $element.trigger('fixed:hide');
            });
        };
        
        // 切换固定元素显示/隐藏
        $.fn.toggleFixed = function(options) {
            return this.each(function() {
                const $element = $(this);
                
                if ($element.data('fixed-visible')) {
                    $element.hideFixed();
                } else {
                    $element.showFixed(options);
                }
            });
        };
    }
    
    /**
     * 初始化固定侧边栏
     * 处理固定侧边栏的显示/隐藏和响应式调整
     */
    function initFixedSidebar() {
        // 侧边栏切换按钮点击事件
        $(document).on('click', '.ffs-fixed-sidebar-toggle', function() {
            const $toggle = $(this);
            const target = $toggle.data('target') || '.ffs-fixed-sidebar';
            const $sidebar = $(target);
            
            // 切换侧边栏显示状态
            $sidebar.toggleFixed({
                animation: $sidebar.hasClass('ffs-fixed-sidebar-left') ? 'slide-left' : 'slide-right',
                mask: true
            });
            
            // 更新切换按钮状态
            $toggle.toggleClass('active', $sidebar.data('fixed-visible'));
        });
        
        // 窗口大小变化时调整侧边栏
        $(window).on('resize', function() {
            adjustFixedSidebar();
        });
        
        // 初始调整侧边栏
        adjustFixedSidebar();
        
        // 侧边栏调整函数
        function adjustFixedSidebar() {
            const windowWidth = window.innerWidth;
            
            // 移动设备视图
            if (windowWidth <= 768) {
                // 隐藏所有侧边栏
                $('.ffs-fixed-sidebar').each(function() {
                    const $sidebar = $(this);
                    if ($sidebar.data('fixed-visible')) {
                        $sidebar.hideFixed();
                    }
                });
            } else {
                // 桌面设备视图
                $('.ffs-fixed-sidebar').each(function() {
                    const $sidebar = $(this);
                    
                    // 如果侧边栏默认可见
                    if ($sidebar.data('default-visible')) {
                        $sidebar.showFixed({
                            animation: 'none',
                            mask: false
                        });
                    }
                });
            }
        }
    }
    
    /**
     * 初始化固定头部和底部
     * 处理固定头部和底部的滚动效果
     */
    function initFixedHeaderFooter() {
        // 滚动时处理头部显示/隐藏
        let lastScrollTop = 0;
        
        $(window).on('scroll', function() {
            const scrollTop = $(window).scrollTop();
            
            // 自动隐藏/显示头部
            $('.ffs-fixed-header[data-auto-hide="true"]').each(function() {
                const $header = $(this);
                
                // 向下滚动隐藏，向上滚动显示
                if (scrollTop > lastScrollTop && scrollTop > $header.outerHeight()) {
                    // 向下滚动
                    $header.css('transform', 'translateY(-100%)');
                } else {
                    // 向上滚动
                    $header.css('transform', 'translateY(0)');
                }
            });
            
            // 记录滚动位置
            lastScrollTop = scrollTop;
        });
        
        // 调整内容区域的padding，以适应固定头部和底部
        function adjustContentPadding() {
            const $header = $('.ffs-fixed-header');
            const $footer = $('.ffs-fixed-footer');
            const $content = $('.ffs-fixed-content');
            
            if ($content.length) {
                let paddingTop = 0;
                let paddingBottom = 0;
                
                if ($header.length && $header.css('position') === 'fixed') {
                    paddingTop = $header.outerHeight();
                }
                
                if ($footer.length && $footer.css('position') === 'fixed') {
                    paddingBottom = $footer.outerHeight();
                }
                
                $content.css({
                    'padding-top': paddingTop + 'px',
                    'padding-bottom': paddingBottom + 'px'
                });
            }
        }
        
        // 初始调整内容区域
        adjustContentPadding();
        
        // 窗口大小变化时重新调整
        $(window).on('resize', function() {
            adjustContentPadding();
        });
    }
    
    /**
     * 初始化固定动画
     * 处理固定元素的动画效果
     */
    function initFixedAnimation() {
        // 为带有动画类的元素添加显示/隐藏方法
        $('.ffs-fixed-fade, .ffs-fixed-slide').each(function() {
            const $element = $(this);
            
            // 如果元素默认隐藏
            if ($element.hasClass('ffs-fixed-slide-left') || 
                $element.hasClass('ffs-fixed-slide-right') || 
                $element.hasClass('ffs-fixed-slide-up') || 
                $element.hasClass('ffs-fixed-slide-down')) {
                $element.css('display', 'none');
            }
        });
        
        // 动画触发按钮点击事件
        $(document).on('click', '[data-fixed-toggle]', function() {
            const $btn = $(this);
            const target = $btn.data('fixed-toggle');
            const $target = $(target);
            
            if ($target.length) {
                $target.toggleFixed();
                $btn.toggleClass('active', $target.data('fixed-visible'));
            }
        });
    }
    
    // 在文档加载完成后初始化固定布局功能
    $(document).ready(function() {
        // 初始化固定元素
        initFixedElement();
        
        // 初始化固定侧边栏
        initFixedSidebar();
        
        // 初始化固定头部和底部
        initFixedHeaderFooter();
        
        // 初始化固定动画
        initFixedAnimation();
    });
    
    // 暴露固定布局API
    if (!window.FFS) {
        window.FFS = {};
    }
    
    if (!window.FFS.fixed) {
        window.FFS.fixed = {
            show: function(selector, options) {
                $(selector).showFixed(options);
            },
            hide: function(selector, callback) {
                $(selector).hideFixed(callback);
            },
            toggle: function(selector, options) {
                $(selector).toggleFixed(options);
            }
        };
    }

})(jQuery);