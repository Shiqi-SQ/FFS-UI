/**
 * FFS UI - 布局组件
 * 提供布局的交互功能，包括侧边栏控制、响应式调整等
 */
(function($) {
    'use strict';

    /**
     * 初始化侧边栏控制
     * 处理侧边栏的显示/隐藏
     */
    function initSidebar() {
        // 侧边栏切换按钮点击事件
        $(document).on('click', '.ffs-sidebar-toggle', function() {
            const $toggle = $(this);
            const target = $toggle.data('target') || '.ffs-layout-sidebar';
            const $sidebar = $(target);
            
            // 切换侧边栏显示状态
            $sidebar.toggleClass('show');
            
            // 触发侧边栏状态变化事件
            const isVisible = $sidebar.hasClass('show');
            $sidebar.trigger('sidebar:toggle', [isVisible]);
            
            // 更新切换按钮状态
            $toggle.toggleClass('active', isVisible);
        });
        
        // 点击侧边栏外部区域关闭侧边栏（仅在移动设备上）
        $(document).on('click', function(e) {
            // 检查是否为移动设备视图
            if (window.innerWidth <= 768) {
                const $target = $(e.target);
                
                // 如果点击的不是侧边栏内部元素且不是切换按钮
                if (!$target.closest('.ffs-layout-sidebar').length && 
                    !$target.closest('.ffs-sidebar-toggle').length) {
                    $('.ffs-layout-sidebar.show').removeClass('show');
                    $('.ffs-sidebar-toggle.active').removeClass('active');
                }
            }
        });
    }
    
    /**
     * 初始化响应式布局
     * 处理布局在不同屏幕尺寸下的调整
     */
    function initResponsiveLayout() {
        // 窗口大小变化时调整布局
        $(window).on('resize', function() {
            adjustLayout();
        });
        
        // 初始调整布局
        adjustLayout();
        
        // 布局调整函数
        function adjustLayout() {
            const windowWidth = window.innerWidth;
            
            // 移动设备视图
            if (windowWidth <= 768) {
                // 隐藏所有侧边栏
                $('.ffs-layout-sidebar').removeClass('show');
                
                // 添加移动设备类
                $('.ffs-layout').addClass('ffs-layout-mobile');
                
                // 调整内容区域
                $('.ffs-layout-content').css('margin-left', '0');
            } else {
                // 移除移动设备类
                $('.ffs-layout').removeClass('ffs-layout-mobile');
                
                // 恢复侧边栏默认状态
                $('.ffs-layout-side .ffs-layout-sidebar').each(function() {
                    const $sidebar = $(this);
                    const $main = $sidebar.siblings('.ffs-layout-main');
                    
                    // 如果侧边栏默认可见
                    if (!$sidebar.hasClass('ffs-layout-sidebar-collapsed')) {
                        $main.css('margin-left', $sidebar.outerWidth() + 'px');
                    }
                });
            }
            
            // 触发布局调整事件
            $(document).trigger('layout:adjusted', [windowWidth]);
        }
    }
    
    /**
     * 初始化布局切换
     * 处理布局类型的动态切换
     */
    function initLayoutSwitch() {
        // 布局切换按钮点击事件
        $(document).on('click', '.ffs-layout-switch', function() {
            const $switch = $(this);
            const target = $switch.data('target') || '.ffs-layout';
            const layoutType = $switch.data('layout-type');
            
            if (!layoutType) return;
            
            const $layout = $(target);
            
            // 移除所有布局类型
            $layout.removeClass(function(index, className) {
                return (className.match(/(^|\s)ffs-layout-\S+/g) || []).join(' ');
            });
            
            // 添加新布局类型
            $layout.addClass('ffs-layout-' + layoutType);
            
            // 触发布局切换事件
            $layout.trigger('layout:switch', [layoutType]);
            
            // 更新切换按钮状态
            $('.ffs-layout-switch').removeClass('active');
            $switch.addClass('active');
            
            // 调整布局
            setTimeout(function() {
                $(window).trigger('resize');
            }, 100);
        });
    }
    
    /**
     * 初始化侧边栏折叠
     * 处理侧边栏的折叠/展开
     */
    function initSidebarCollapse() {
        // 侧边栏折叠按钮点击事件
        $(document).on('click', '.ffs-sidebar-collapse', function() {
            const $collapse = $(this);
            const target = $collapse.data('target') || '.ffs-layout-sidebar';
            const $sidebar = $(target);
            const $main = $sidebar.siblings('.ffs-layout-main');
            
            // 切换侧边栏折叠状态
            $sidebar.toggleClass('ffs-layout-sidebar-collapsed');
            
            // 调整主内容区域
            if ($sidebar.hasClass('ffs-layout-sidebar-collapsed')) {
                // 记住原始宽度
                $sidebar.data('original-width', $sidebar.css('width'));
                
                // 设置折叠宽度
                $sidebar.css('width', '60px');
                $main.css('margin-left', '60px');
            } else {
                // 恢复原始宽度
                const originalWidth = $sidebar.data('original-width') || '200px';
                $sidebar.css('width', originalWidth);
                $main.css('margin-left', originalWidth);
            }
            
            // 触发侧边栏折叠事件
            const isCollapsed = $sidebar.hasClass('ffs-layout-sidebar-collapsed');
            $sidebar.trigger('sidebar:collapse', [isCollapsed]);
            
            // 更新折叠按钮状态
            $collapse.toggleClass('active', isCollapsed);
        });
    }
    
    /**
     * 初始化自适应布局
     * 处理自适应布局项的动态调整
     */
    function initAdaptiveLayout() {
        // 窗口大小变化时调整自适应布局
        $(window).on('resize', function() {
            adjustAdaptiveLayout();
        });
        
        // 初始调整自适应布局
        adjustAdaptiveLayout();
        
        // 自适应布局调整函数
        function adjustAdaptiveLayout() {
            $('.ffs-layout-adaptive').each(function() {
                const $container = $(this);
                const $items = $container.find('.ffs-layout-adaptive-item');
                const containerWidth = $container.width();
                
                // 根据容器宽度调整项目宽度
                if (containerWidth < 576) {
                    // 超小屏幕：每行1个
                    $items.css('flex-basis', '100%');
                } else if (containerWidth < 768) {
                    // 小屏幕：每行2个
                    $items.css('flex-basis', 'calc(50% - 10px)');
                } else if (containerWidth < 992) {
                    // 中屏幕：每行3个
                    $items.css('flex-basis', 'calc(33.333% - 13.333px)');
                } else {
                    // 大屏幕：每行4个或更多
                    $items.css('flex-basis', 'calc(25% - 15px)');
                }
            });
        }
    }
    
    // 在文档加载完成后初始化布局功能
    $(document).ready(function() {
        // 初始化侧边栏控制
        initSidebar();
        
        // 初始化响应式布局
        initResponsiveLayout();
        
        // 初始化布局切换
        initLayoutSwitch();
        
        // 初始化侧边栏折叠
        initSidebarCollapse();
        
        // 初始化自适应布局
        initAdaptiveLayout();
    });
    
    // 暴露布局API
    if (!window.FFS) {
        window.FFS = {};
    }
    
    if (!window.FFS.layout) {
        window.FFS.layout = {
            toggleSidebar: function(selector) {
                const $sidebar = $(selector);
                $sidebar.toggleClass('show');
                return $sidebar.hasClass('show');
            },
            collapseSidebar: function(selector, collapse = true) {
                const $sidebar = $(selector);
                if (collapse) {
                    $sidebar.addClass('ffs-layout-sidebar-collapsed');
                    $sidebar.data('original-width', $sidebar.css('width'));
                    $sidebar.css('width', '60px');
                    $sidebar.siblings('.ffs-layout-main').css('margin-left', '60px');
                } else {
                    $sidebar.removeClass('ffs-layout-sidebar-collapsed');
                    const originalWidth = $sidebar.data('original-width') || '200px';
                    $sidebar.css('width', originalWidth);
                    $sidebar.siblings('.ffs-layout-main').css('margin-left', originalWidth);
                }
                return $sidebar.hasClass('ffs-layout-sidebar-collapsed');
            },
            switchLayout: function(selector, layoutType) {
                const $layout = $(selector);
                
                // 移除所有布局类型
                $layout.removeClass(function(index, className) {
                    return (className.match(/(^|\s)ffs-layout-\S+/g) || []).join(' ');
                });
                
                // 添加新布局类型
                $layout.addClass('ffs-layout-' + layoutType);
                
                // 触发布局切换事件
                $layout.trigger('layout:switch', [layoutType]);
                
                // 调整布局
                setTimeout(function() {
                    $(window).trigger('resize');
                }, 100);
            }
        };
    }

})(jQuery);