/**
 * FFS UI - 面包屑导航组件
 * 提供面包屑导航的交互功能，包括下拉菜单和响应式处理
 */
(function($) {
    'use strict';

    /**
     * 初始化面包屑下拉菜单
     * 处理下拉菜单的显示和隐藏
     */
    function initBreadcrumbDropdown() {
        // 点击下拉菜单触发器
        $(document).on('click', '.ffs-breadcrumb-dropdown .ffs-breadcrumb-item', function(e) {
            e.preventDefault();
            const $dropdown = $(this).closest('.ffs-breadcrumb-dropdown');
            const $content = $dropdown.find('.ffs-breadcrumb-dropdown-content');
            
            // 切换下拉菜单显示状态
            $content.toggle();
            
            // 阻止事件冒泡
            e.stopPropagation();
        });
        
        // 点击下拉菜单项
        $(document).on('click', '.ffs-breadcrumb-dropdown-item', function(e) {
            e.preventDefault();
            const $item = $(this);
            const $dropdown = $item.closest('.ffs-breadcrumb-dropdown');
            const $trigger = $dropdown.find('.ffs-breadcrumb-item').first();
            
            // 更新触发器文本
            const text = $item.text();
            const $icon = $trigger.find('i.ffs-breadcrumb-item-icon');
            
            if ($icon.length) {
                // 如果有图标，保留图标
                $trigger.html('').append($icon).append(' ' + text);
            } else {
                $trigger.text(text);
            }
            
            // 隐藏下拉菜单
            $dropdown.find('.ffs-breadcrumb-dropdown-content').hide();
            
            // 触发选择事件
            $dropdown.trigger('breadcrumb:select', [text, $item.attr('href')]);
        });
        
        // 点击页面其他区域关闭下拉菜单
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.ffs-breadcrumb-dropdown').length) {
                $('.ffs-breadcrumb-dropdown-content').hide();
            }
        });
    }
    
    /**
     * 初始化响应式面包屑
     * 在移动设备上优化面包屑显示
     */
    function initResponsiveBreadcrumb() {
        // 检查窗口大小并调整面包屑
        function checkResponsive() {
            $('.ffs-breadcrumb').each(function() {
                const $breadcrumb = $(this);
                const $items = $breadcrumb.find('.ffs-breadcrumb-item');
                
                // 如果是移动设备且项目数量大于3
                if (window.innerWidth <= 768 && $items.length > 3) {
                    // 如果没有创建折叠菜单
                    if (!$breadcrumb.find('.ffs-breadcrumb-collapse').length) {
                        // 保留第一项和最后一项，其他项放入折叠菜单
                        const $firstItem = $items.first();
                        const $lastItem = $items.last();
                        
                        // 创建折叠菜单
                        const $collapse = $('<div class="ffs-breadcrumb-dropdown ffs-breadcrumb-collapse"></div>');
                        const $collapseItem = $('<a href="#" class="ffs-breadcrumb-item">...</a>');
                        const $collapseContent = $('<div class="ffs-breadcrumb-dropdown-content"></div>');
                        
                        $collapse.append($collapseItem).append($collapseContent);
                        
                        // 添加中间项到折叠菜单
                        $items.each(function(index) {
                            if (index > 0 && index < $items.length - 1) {
                                const $item = $(this);
                                const $clone = $item.clone();
                                
                                // 转换为下拉菜单项
                                $clone.removeClass('ffs-breadcrumb-item').addClass('ffs-breadcrumb-dropdown-item');
                                $collapseContent.append($clone);
                                
                                // 隐藏原始项
                                $item.hide();
                                // 隐藏相邻的分隔符
                                $item.next('.ffs-breadcrumb-separator').hide();
                                if (index === 1) {
                                    $item.prev('.ffs-breadcrumb-separator').hide();
                                }
                            }
                        });
                        
                        // 插入折叠菜单
                        $firstItem.after($collapse);
                        $collapse.after('<span class="ffs-breadcrumb-separator">/</span>');
                    }
                } else {
                    // 如果是桌面设备或项目数量少于等于3，恢复正常显示
                    if ($breadcrumb.find('.ffs-breadcrumb-collapse').length) {
                        // 移除折叠菜单
                        $breadcrumb.find('.ffs-breadcrumb-collapse').next('.ffs-breadcrumb-separator').remove();
                        $breadcrumb.find('.ffs-breadcrumb-collapse').remove();
                        
                        // 显示所有项和分隔符
                        $breadcrumb.find('.ffs-breadcrumb-item, .ffs-breadcrumb-separator').show();
                    }
                }
            });
        }
        
        // 初始检查
        checkResponsive();
        
        // 窗口大小变化时重新检查
        $(window).on('resize', checkResponsive);
    }
    
    /**
     * 面包屑导航API
     * 提供操作面包屑的公共方法
     */
    $.ffsBreadcrumb = {
        /**
         * 创建面包屑导航
         * @param {string} selector - 容器选择器
         * @param {Array} items - 面包屑项数组，格式：[{text, link, icon, active}]
         */
        create: function(selector, items = []) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 创建面包屑导航
            const $breadcrumb = $('<nav class="ffs-breadcrumb"></nav>');
            
            // 添加面包屑项
            items.forEach((item, index) => {
                // 创建面包屑项
                let $item;
                
                if (item.active) {
                    // 活动项（当前页面）
                    $item = $('<span class="ffs-breadcrumb-item active"></span>');
                } else {
                    // 链接项
                    $item = $(`<a href="${item.link || '#'}" class="ffs-breadcrumb-item"></a>`);
                }
                
                // 添加图标
                if (item.icon) {
                    $item.append(`<i class="${item.icon} ffs-breadcrumb-item-icon"></i> `);
                }
                
                // 添加文本
                $item.append(item.text);
                
                // 添加到面包屑
                $breadcrumb.append($item);
                
                // 添加分隔符（最后一项不需要）
                if (index < items.length - 1) {
                    $breadcrumb.append('<span class="ffs-breadcrumb-separator">/</span>');
                }
            });
            
            // 添加到容器
            $container.append($breadcrumb);
            
            return $breadcrumb;
        },
        
        /**
         * 添加面包屑项
         * @param {string} selector - 面包屑选择器
         * @param {object} item - 面包屑项，格式：{text, link, icon, active}
         * @param {number} position - 插入位置，默认为最后
         */
        addItem: function(selector, item, position) {
            const $breadcrumb = $(selector);
            
            if (!$breadcrumb.length) return;
            
            // 创建面包屑项
            let $item;
            
            if (item.active) {
                // 活动项（当前页面）
                $item = $('<span class="ffs-breadcrumb-item active"></span>');
            } else {
                // 链接项
                $item = $(`<a href="${item.link || '#'}" class="ffs-breadcrumb-item"></a>`);
            }
            
            // 添加图标
            if (item.icon) {
                $item.append(`<i class="${item.icon} ffs-breadcrumb-item-icon"></i> `);
            }
            
            // 添加文本
            $item.append(item.text);
            
            // 获取所有项（不包括分隔符）
            const $items = $breadcrumb.find('.ffs-breadcrumb-item');
            
            // 如果指定了位置
            if (position !== undefined && position >= 0 && position <= $items.length) {
                if (position === $items.length) {
                    // 添加到最后
                    $breadcrumb.append('<span class="ffs-breadcrumb-separator">/</span>');
                    $breadcrumb.append($item);
                } else {
                    // 插入到指定位置
                    const $target = $items.eq(position);
                    $item.insertBefore($target);
                    $('<span class="ffs-breadcrumb-separator">/</span>').insertAfter($item);
                }
            } else {
                // 添加到最后
                if ($items.length > 0) {
                    $breadcrumb.append('<span class="ffs-breadcrumb-separator">/</span>');
                }
                $breadcrumb.append($item);
            }
            
            return $breadcrumb;
        },
        
        /**
         * 移除面包屑项
         * @param {string} selector - 面包屑选择器
         * @param {number} position - 移除位置
         */
        removeItem: function(selector, position) {
            const $breadcrumb = $(selector);
            
            if (!$breadcrumb.length) return;
            
            // 获取所有项（不包括分隔符）
            const $items = $breadcrumb.find('.ffs-breadcrumb-item');
            
            // 检查位置是否有效
            if (position < 0 || position >= $items.length) return;
            
            // 获取要移除的项
            const $item = $items.eq(position);
            
            // 移除项和相邻的分隔符
            if (position === $items.length - 1) {
                // 如果是最后一项，移除前面的分隔符
                $item.prev('.ffs-breadcrumb-separator').remove();
            } else {
                // 否则移除后面的分隔符
                $item.next('.ffs-breadcrumb-separator').remove();
            }
            
            // 移除项
            $item.remove();
            
            return $breadcrumb;
        },
        
        /**
         * 设置自定义分隔符
         * @param {string} selector - 面包屑选择器
         * @param {string} separator - 分隔符
         */
        setSeparator: function(selector, separator) {
            const $breadcrumb = $(selector);
            
            if (!$breadcrumb.length) return;
            
            // 添加自定义分隔符类
            $breadcrumb.addClass('ffs-breadcrumb-custom-separator');
            
            // 更新所有分隔符
            $breadcrumb.find('.ffs-breadcrumb-separator').text(separator);
            
            return $breadcrumb;
        },
        
        /**
         * 创建下拉菜单
         * @param {string} selector - 面包屑选择器
         * @param {number} position - 位置
         * @param {Array} items - 下拉菜单项数组，格式：[{text, link, active}]
         */
        createDropdown: function(selector, position, items = []) {
            const $breadcrumb = $(selector);
            
            if (!$breadcrumb.length) return;
            
            // 获取所有项（不包括分隔符）
            const $items = $breadcrumb.find('.ffs-breadcrumb-item');
            
            // 检查位置是否有效
            if (position < 0 || position >= $items.length) return;
            
            // 获取要转换的项
            const $item = $items.eq(position);
            
            // 创建下拉菜单
            const $dropdown = $('<div class="ffs-breadcrumb-dropdown"></div>');
            const $trigger = $item.clone();
            const $content = $('<div class="ffs-breadcrumb-dropdown-content"></div>');
            
            // 添加下拉图标
            $trigger.append(' <i class="fas fa-chevron-down" style="margin-left: 4px; font-size: 12px;"></i>');
            
            // 添加下拉菜单项
            items.forEach(item => {
                const $dropdownItem = $(`<a href="${item.link || '#'}" class="ffs-breadcrumb-dropdown-item">${item.text}</a>`);
                
                if (item.active) {
                    $dropdownItem.addClass('active');
                }
                
                $content.append($dropdownItem);
            });
            
            // 组装下拉菜单
            $dropdown.append($trigger).append($content);
            
            // 替换原始项
            $item.replaceWith($dropdown);
            
            return $breadcrumb;
        }
    };
    
    // 初始化面包屑组件
    $(function() {
        initBreadcrumbDropdown();
        initResponsiveBreadcrumb();
    });

})(jQuery);