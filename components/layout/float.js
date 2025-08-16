/**
 * * * * * * * * * * * * * * * * * * FFS UI - 浮动布局组件
 * 提供浮动布局的交互功能，包括动态浮动控制、拖拽和响应式调整
 */
(function($) {
    'use strict';

    /**
     * 初始化浮动元素
     * 处理浮动元素的基本交互
     */
    function initFloatElement() {
        // 自动添加清除浮动
        $('.ffs-float').each(function() {
            const $float = $(this);
            
            // 如果没有清除浮动类，添加清除浮动
            if (!$float.hasClass('ffs-clearfix')) {
                $float.addClass('ffs-clearfix');
            }
        });
        
        // 浮动方向切换按钮点击事件
        $(document).on('click', '[data-float-direction]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const direction = $btn.data('float-direction');
            
            if (!$item.length || !direction) return;
            
            // 移除所有浮动方向类
            $item.removeClass('ffs-float-left ffs-float-right ffs-float-none');
            
            // 应用新浮动方向
            if (direction !== 'none') {
                $item.addClass('ffs-float-' + direction);
            }
            
            // 更新按钮状态
            $('[data-float-direction]').removeClass('active');
            $btn.addClass('active');
            
            // 触发浮动方向变更事件
            $item.trigger('float:direction-changed', [direction]);
        });
        
        // 浮动清除切换按钮点击事件
        $(document).on('click', '[data-float-clear]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const clear = $btn.data('float-clear');
            
            if (!$item.length || !clear) return;
            
            // 移除所有清除类
            $item.removeClass('ffs-clear-left ffs-clear-right ffs-clear-both');
            
            // 应用新清除方式
            if (clear !== 'none') {
                $item.addClass('ffs-clear-' + clear);
            }
            
            // 更新按钮状态
            $('[data-float-clear]').removeClass('active');
            $btn.addClass('active');
            
            // 触发浮动清除变更事件
            $item.trigger('float:clear-changed', [clear]);
        });
    }
    
    /**
     * 初始化浮动元素拖拽
     * 提供浮动元素的拖拽功能
     */
    function initFloatDrag() {
        // 使浮动元素可拖拽
        $('.ffs-float-item[data-draggable="true"]').each(function() {
            const $item = $(this);
            
            // 添加拖拽样式
            $item.addClass('ffs-float-draggable');
            
            // 初始位置
            let startX, startY, startLeft, startTop;
            let isDragging = false;
            
            // 鼠标按下事件
            $item.on('mousedown', function(e) {
                // 只响应鼠标左键
                if (e.which !== 1) return;
                
                // 阻止冒泡和默认行为
                e.stopPropagation();
                e.preventDefault();
                
                // 记录初始位置
                startX = e.pageX;
                startY = e.pageY;
                startLeft = parseInt($item.css('left')) || 0;
                startTop = parseInt($item.css('top')) || 0;
                
                // 设置拖拽状态
                isDragging = true;
                $item.addClass('ffs-float-dragging');
                
                // 触发拖拽开始事件
                $item.trigger('float:drag-start', [startLeft, startTop]);
                
                // 鼠标移动事件
                $(document).on('mousemove.floatDrag', function(e) {
                    if (!isDragging) return;
                    
                    // 计算新位置
                    const newLeft = startLeft + (e.pageX - startX);
                    const newTop = startTop + (e.pageY - startY);
                    
                    // 应用新位置
                    $item.css({
                        'position': 'absolute',
                        'left': newLeft + 'px',
                        'top': newTop + 'px'
                    });
                    
                    // 触发拖拽移动事件
                    $item.trigger('float:drag-move', [newLeft, newTop]);
                });
                
                // 鼠标释放事件
                $(document).on('mouseup.floatDrag', function() {
                    if (!isDragging) return;
                    
                    // 清除拖拽状态
                    isDragging = false;
                    $item.removeClass('ffs-float-dragging');
                    
                    // 移除临时事件
                    $(document).off('mousemove.floatDrag mouseup.floatDrag');
                    
                    // 触发拖拽结束事件
                    const finalLeft = parseInt($item.css('left')) || 0;
                    const finalTop = parseInt($item.css('top')) || 0;
                    $item.trigger('float:drag-end', [finalLeft, finalTop]);
                });
            });
        });
    }
    
    /**
     * 初始化浮动元素碰撞检测
     * 检测浮动元素之间的碰撞
     */
    function initFloatCollision() {
        // 检测两个元素是否碰撞
        function isColliding($el1, $el2) {
            const rect1 = $el1[0].getBoundingClientRect();
            const rect2 = $el2[0].getBoundingClientRect();
            
            return !(
                rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom
            );
        }
        
        // 为可拖拽元素添加碰撞检测
        $('.ffs-float-item[data-collision="true"]').each(function() {
            const $item = $(this);
            
            // 拖拽移动时检测碰撞
            $item.on('float:drag-move', function() {
                // 获取所有其他浮动元素
                const $otherItems = $('.ffs-float-item').not(this);
                
                // 检测碰撞
                $otherItems.each(function() {
                    const $other = $(this);
                    
                    if (isColliding($item, $other)) {
                        // 添加碰撞样式
                        $item.addClass('ffs-float-collision');
                        $other.addClass('ffs-float-collision');
                        
                        // 触发碰撞事件
                        $item.trigger('float:collision', [$other]);
                    } else {
                        // 移除碰撞样式
                        $other.removeClass('ffs-float-collision');
                    }
                });
                
                // 如果没有任何碰撞，移除碰撞样式
                if (!$('.ffs-float-collision').not($item).length) {
                    $item.removeClass('ffs-float-collision');
                }
            });
            
            // 拖拽结束时处理碰撞
            $item.on('float:drag-end', function() {
                // 移除所有碰撞样式
                $('.ffs-float-collision').removeClass('ffs-float-collision');
            });
        });
    }
    
    /**
     * 初始化浮动响应式调整
     * 处理浮动布局的响应式调整
     */
    function initFloatResponsive() {
        // 窗口大小变化时调整浮动布局
        $(window).on('resize', function() {
            adjustFloatLayout();
        });
        
        // 初始调整浮动布局
        adjustFloatLayout();
        
        // 浮动布局调整函数
        function adjustFloatLayout() {
            const windowWidth = window.innerWidth;
            
            // 根据窗口宽度调整浮动布局
            if (windowWidth <= 576) {
                // 小屏幕设备
                $('.ffs-float-item[data-mobile-float]').each(function() {
                    const $item = $(this);
                    const mobileFloat = $item.data('mobile-float');
                    
                    // 保存原始浮动方向
                    if (!$item.data('original-float')) {
                        let originalFloat = 'none';
                        if ($item.hasClass('ffs-float-left')) {
                            originalFloat = 'left';
                        } else if ($item.hasClass('ffs-float-right')) {
                            originalFloat = 'right';
                        }
                        $item.data('original-float', originalFloat);
                    }
                    
                    // 应用移动设备浮动方向
                    $item.removeClass('ffs-float-left ffs-float-right ffs-float-none');
                    
                    if (mobileFloat && mobileFloat !== 'none') {
                        $item.addClass('ffs-float-' + mobileFloat);
                    }
                });
                
                // 处理移动设备下的宽度
                $('.ffs-float-item[data-mobile-width]').each(function() {
                    const $item = $(this);
                    const mobileWidth = $item.data('mobile-width');
                    
                    // 保存原始宽度
                    if (!$item.data('original-width')) {
                        const originalWidth = $item.width();
                        $item.data('original-width', originalWidth);
                    }
                    
                    // 应用移动设备宽度
                    if (mobileWidth) {
                        $item.width(mobileWidth);
                    }
                });
            } else if (windowWidth <= 768) {
                // 中屏幕设备
                // 类似的逻辑...
            } else {
                // 大屏幕设备，恢复原始设置
                $('.ffs-float-item[data-mobile-float]').each(function() {
                    const $item = $(this);
                    const originalFloat = $item.data('original-float');
                    
                    if (originalFloat) {
                        // 恢复原始浮动方向
                        $item.removeClass('ffs-float-left ffs-float-right ffs-float-none');
                        
                        if (originalFloat !== 'none') {
                            $item.addClass('ffs-float-' + originalFloat);
                        }
                    }
                });
                
                // 恢复原始宽度
                $('.ffs-float-item[data-mobile-width]').each(function() {
                    const $item = $(this);
                    const originalWidth = $item.data('original-width');
                    
                    if (originalWidth) {
                        $item.width(originalWidth);
                    }
                });
            }
        }
    }
    
    /**
     * 初始化浮动元素动态添加/删除
     * 提供浮动元素的动态添加和删除功能
     */
    function initFloatDynamic() {
        // 添加浮动元素按钮点击事件
        $(document).on('click', '[data-float-add]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || '.ffs-float';
            const $container = $(target);
            
            if (!$container.length) return;
            
            // 创建新浮动元素
            const $newItem = $('<div class="ffs-float-item">新浮动元素</div>');
            
            // 添加到浮动容器
            $container.append($newItem);
            
            // 触发元素添加事件
            $container.trigger('float:item-added', [$newItem]);
        });
        
        // 删除浮动元素按钮点击事件
        $(document).on('click', '[data-float-remove]', function() {
            const $btn = $(this);
            const target = $btn.data('float-item') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            
            if (!$item.length) return;
            
            // 获取父容器
            const $container = $item.parent('.ffs-float');
            
            // 删除浮动元素
            $item.remove();
            
            // 触发元素删除事件
            if ($container.length) {
                $container.trigger('float:item-removed');
            }
        });
    }
    
    /**
     * 初始化浮动定位控制
     * 提供浮动元素定位的动态调整功能
     */
    function initFloatPosition() {
        // 定位方式切换按钮点击事件
        $(document).on('click', '[data-float-position]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const position = $btn.data('float-position');
            
            if (!$item.length || !position) return;
            
            // 移除所有定位类
            $item.removeClass('ffs-float-static ffs-float-relative ffs-float-absolute ffs-float-fixed ffs-float-sticky');
            
            // 应用新定位方式
            $item.addClass('ffs-float-' + position);
            
            // 更新按钮状态
            $('[data-float-position]').removeClass('active');
            $btn.addClass('active');
            
            // 触发定位方式变更事件
            $item.trigger('float:position-changed', [position]);
        });
        
        // 定位坐标调整按钮点击事件
        $(document).on('click', '[data-float-coordinate]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const coordinate = $btn.data('float-coordinate');
            const value = $btn.data('float-value') || 0;
            
            if (!$item.length || !coordinate) return;
            
            // 确保元素有定位属性
            if (!$item.hasClass('ffs-float-relative') && 
                !$item.hasClass('ffs-float-absolute') && 
                !$item.hasClass('ffs-float-fixed') && 
                !$item.hasClass('ffs-float-sticky')) {
                $item.addClass('ffs-float-relative');
            }
            
            // 应用新坐标
            $item.css(coordinate, value + 'px');
            
            // 触发坐标变更事件
            $item.trigger('float:coordinate-changed', [coordinate, value]);
        });
    }
    
    /**
     * 初始化浮动层级控制
     * 提供浮动元素层级的动态调整功能
     */
    function initFloatZIndex() {
        // 层级调整按钮点击事件
        $(document).on('click', '[data-float-zindex]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const zIndex = $btn.data('float-zindex');
            
            if (!$item.length || zIndex === undefined) return;
            
            // 移除所有层级类
            $item.removeClass('ffs-float-z-1 ffs-float-z-10 ffs-float-z-100 ffs-float-z-1000');
            
            // 应用新层级
            if (zIndex !== 'auto') {
                $item.addClass('ffs-float-z-' + zIndex);
            }
            
            // 更新按钮状态
            $('[data-float-zindex]').removeClass('active');
            $btn.addClass('active');
            
            // 触发层级变更事件
            $item.trigger('float:zindex-changed', [zIndex]);
        });
        
        // 层级增减按钮点击事件
        $(document).on('click', '[data-float-zindex-action]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const action = $btn.data('float-zindex-action');
            
            if (!$item.length || !action) return;
            
            // 获取当前层级
            let currentZIndex = parseInt($item.css('z-index')) || 0;
            
            // 根据操作调整层级
            if (action === 'increase') {
                currentZIndex += 1;
            } else if (action === 'decrease') {
                currentZIndex = Math.max(0, currentZIndex - 1);
            } else if (action === 'top') {
                // 获取所有浮动元素的最大层级
                let maxZIndex = 0;
                $('.ffs-float-item').each(function() {
                    const zIndex = parseInt($(this).css('z-index')) || 0;
                    maxZIndex = Math.max(maxZIndex, zIndex);
                });
                currentZIndex = maxZIndex + 1;
            } else if (action === 'bottom') {
                currentZIndex = 0;
            }
            
            // 应用新层级
            $item.css('z-index', currentZIndex);
            
            // 触发层级变更事件
            $item.trigger('float:zindex-changed', [currentZIndex]);
        });
    }
    
    /**
     * 初始化浮动显示控制
     * 提供浮动元素显示方式的动态调整功能
     */
    function initFloatDisplay() {
        // 显示方式切换按钮点击事件
        $(document).on('click', '[data-float-display]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const display = $btn.data('float-display');
            
            if (!$item.length || !display) return;
            
            // 移除所有显示类
            $item.removeClass('ffs-float-block ffs-float-inline ffs-float-inline-block ffs-float-flex ffs-float-none');
            
            // 应用新显示方式
            if (display !== 'default') {
                $item.addClass('ffs-float-' + display);
            }
            
            // 更新按钮状态
            $('[data-float-display]').removeClass('active');
            $btn.addClass('active');
            
            // 触发显示方式变更事件
            $item.trigger('float:display-changed', [display]);
        });
        
        // 可见性切换按钮点击事件
        $(document).on('click', '[data-float-visibility]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const visibility = $btn.data('float-visibility');
            
            if (!$item.length || !visibility) return;
            
            // 移除所有可见性类
            $item.removeClass('ffs-float-visible ffs-float-invisible ffs-float-hidden');
            
            // 应用新可见性
            if (visibility !== 'default') {
                $item.addClass('ffs-float-' + visibility);
            }
            
            // 更新按钮状态
            $('[data-float-visibility]').removeClass('active');
            $btn.addClass('active');
            
            // 触发可见性变更事件
            $item.trigger('float:visibility-changed', [visibility]);
        });
    }
    
    /**
     * 初始化浮动溢出控制
     * 提供浮动元素溢出处理的动态调整功能
     */
    function initFloatOverflow() {
        // 溢出方式切换按钮点击事件
        $(document).on('click', '[data-float-overflow]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const overflow = $btn.data('float-overflow');
            
            if (!$item.length || !overflow) return;
            
            // 移除所有溢出类
            $item.removeClass('ffs-float-overflow-visible ffs-float-overflow-hidden ffs-float-overflow-scroll ffs-float-overflow-auto');
            
            // 应用新溢出方式
            if (overflow !== 'default') {
                $item.addClass('ffs-float-overflow-' + overflow);
            }
            
            // 更新按钮状态
            $('[data-float-overflow]').removeClass('active');
            $btn.addClass('active');
            
            // 触发溢出方式变更事件
            $item.trigger('float:overflow-changed', [overflow]);
        });
    }
    
    /**
     * 初始化浮动对齐控制
     * 提供浮动元素对齐方式的动态调整功能
     */
    function initFloatAlign() {
        // 文本对齐方式切换按钮点击事件
        $(document).on('click', '[data-float-text-align]', function() {
            const $btn = $(this);
            const target = $btn.data('float-target') || $btn.closest('.ffs-float-item');
            const $item = $(target);
            const align = $btn.data('float-text-align');
            
            if (!$item.length || !align) return;
            
            // 移除所有文本对齐类
            $item.removeClass('ffs-float-text-left ffs-float-text-center ffs-float-text-right ffs-float-text-justify');
            
            // 应用新文本对齐方式
            if (align !== 'default') {
                $item.addClass('ffs-float-text-' + align);
            }
            
            // 更新按钮状态
            $('[data-float-text-align]').removeClass('active');
            $btn.addClass('active');
            
            // 触发文本对齐方式变更事件
            $item.trigger('float:text-align-changed', [align]);
        });
    }
    
    // 在文档加载完成后初始化浮动布局功能
    $(document).ready(function() {
        // 初始化浮动元素
        initFloatElement();
        
        // 初始化浮动元素拖拽
        initFloatDrag();
        
        // 初始化浮动元素碰撞检测
        initFloatCollision();
        
        // 初始化浮动响应式调整
        initFloatResponsive();
        
        // 初始化浮动元素动态添加/删除
        initFloatDynamic();
        
        // 初始化浮动定位控制
        initFloatPosition();
        
        // 初始化浮动层级控制
        initFloatZIndex();
        
        // 初始化浮动显示控制
        initFloatDisplay();
        
        // 初始化浮动溢出控制
        initFloatOverflow();
        
        // 初始化浮动对齐控制
        initFloatAlign();
    });
    
    // 暴露浮动布局API
    if (!window.FFS) {
        window.FFS = {};
    }
    
    if (!window.FFS.float) {
        window.FFS.float = {
            /**
             * 设置浮动方向
             * @param {string} selector - 选择器
             * @param {string} direction - 方向：left, right, none
             */
            setDirection: function(selector, direction) {
                const $item = $(selector);
                
                if (!$item.length || !direction) return;
                
                // 移除所有浮动方向类
                $item.removeClass('ffs-float-left ffs-float-right ffs-float-none');
                
                // 应用新浮动方向
                if (direction !== 'none') {
                    $item.addClass('ffs-float-' + direction);
                }
                
                // 触发浮动方向变更事件
                $item.trigger('float:direction-changed', [direction]);
                
                return $item;
            },
            
            /**
             * 设置浮动清除方式
             * @param {string} selector - 选择器
             * @param {string} clear - 清除方式：left, right, both, none
             */
            setClear: function(selector, clear) {
                const $item = $(selector);
                
                if (!$item.length || !clear) return;
                
                // 移除所有清除类
                $item.removeClass('ffs-clear-left ffs-clear-right ffs-clear-both');
                
                // 应用新清除方式
                if (clear !== 'none') {
                    $item.addClass('ffs-clear-' + clear);
                }
                
                // 触发浮动清除变更事件
                $item.trigger('float:clear-changed', [clear]);
                
                return $item;
            },
            
            /**
             * 设置浮动定位方式
             * @param {string} selector - 选择器
             * @param {string} position - 定位方式：static, relative, absolute, fixed, sticky
             */
            setPosition: function(selector, position) {
                const $item = $(selector);
                
                if (!$item.length || !position) return;
                
                // 移除所有定位类
                $item.removeClass('ffs-float-static ffs-float-relative ffs-float-absolute ffs-float-fixed ffs-float-sticky');
                
                // 应用新定位方式
                $item.addClass('ffs-float-' + position);
                
                // 触发定位方式变更事件
                $item.trigger('float:position-changed', [position]);
                
                return $item;
            },
            
            /**
             * 设置浮动元素坐标
             * @param {string} selector - 选择器
             * @param {object} coordinates - 坐标对象，如 {top: 10, left: 20}
             */
            setCoordinates: function(selector, coordinates) {
                const $item = $(selector);
                
                if (!$item.length || !coordinates) return;
                
                // 确保元素有定位属性
                if (!$item.hasClass('ffs-float-relative') && 
                    !$item.hasClass('ffs-float-absolute') && 
                    !$item.hasClass('ffs-float-fixed') && 
                    !$item.hasClass('ffs-float-sticky')) {
                    $item.addClass('ffs-float-relative');
                }
                
                // 应用坐标
                for (const coordinate in coordinates) {
                    if (coordinates.hasOwnProperty(coordinate)) {
                        $item.css(coordinate, coordinates[coordinate] + 'px');
                    }
                }
                
                // 触发坐标变更事件
                $item.trigger('float:coordinates-changed', [coordinates]);
                
                return $item;
            },
            
            /**
             * 设置浮动元素层级
             * @param {string} selector - 选择器
             * @param {string|number} zIndex - 层级值：1, 10, 100, 1000 或具体数值
             */
            setZIndex: function(selector, zIndex) {
                const $item = $(selector);
                
                if (!$item.length || zIndex === undefined) return;
                
                // 移除所有层级类
                $item.removeClass('ffs-float-z-1 ffs-float-z-10 ffs-float-z-100 ffs-float-z-1000');
                
                // 应用新层级
                if (typeof zIndex === 'string' && ['1', '10', '100', '1000'].includes(zIndex)) {
                    $item.addClass('ffs-float-z-' + zIndex);
                } else if (typeof zIndex === 'number' || !isNaN(parseInt(zIndex))) {
                    $item.css('z-index', zIndex);
                }
                
                // 触发层级变更事件
                $item.trigger('float:zindex-changed', [zIndex]);
                
                return $item;
            },
            
            /**
             * 设置浮动元素显示方式
             * @param {string} selector - 选择器
             * @param {string} display - 显示方式：block, inline, inline-block, flex, none
             */
            setDisplay: function(selector, display) {
                const $item = $(selector);
                
                if (!$item.length || !display) return;
                
                // 移除所有显示类
                $item.removeClass('ffs-float-block ffs-float-inline ffs-float-inline-block ffs-float-flex ffs-float-none');
                
                // 应用新显示方式
                if (display !== 'default') {
                    $item.addClass('ffs-float-' + display);
                }
                
                // 触发显示方式变更事件
                $item.trigger('float:display-changed', [display]);
                
                return $item;
            },
            
            /**
             * 设置浮动元素可见性
             * @param {string} selector - 选择器
             * @param {string} visibility - 可见性：visible, invisible, hidden
             */
            setVisibility: function(selector, visibility) {
                const $item = $(selector);
                
                if (!$item.length || !visibility) return;
                
                // 移除所有可见性类
                $item.removeClass('ffs-float-visible ffs-float-invisible ffs-float-hidden');
                
                // 应用新可见性
                if (visibility !== 'default') {
                    $item.addClass('ffs-float-' + visibility);
                }
                
                // 触发可见性变更事件
                $item.trigger('float:visibility-changed', [visibility]);
                
                return $item;
            },
            
            /**
             * 设置浮动元素溢出方式
             * @param {string} selector - 选择器
             * @param {string} overflow - 溢出方式：visible, hidden, scroll, auto
             */
            setOverflow: function(selector, overflow) {
                const $item = $(selector);
                
                if (!$item.length || !overflow) return;
                
                // 移除所有溢出类
                $item.removeClass('ffs-float-overflow-visible ffs-float-overflow-hidden ffs-float-overflow-scroll ffs-float-overflow-auto');
                
                // 应用新溢出方式
                if (overflow !== 'default') {
                    $item.addClass('ffs-float-overflow-' + overflow);
                }
                
                // 触发溢出方式变更事件
                $item.trigger('float:overflow-changed', [overflow]);
                
                return $item;
            },
            
            /**
             * 设置浮动元素文本对齐方式
             * @param {string} selector - 选择器
             * @param {string} align - 对齐方式：left, center, right, justify
             */
            setTextAlign: function(selector, align) {
                const $item = $(selector);
                
                if (!$item.length || !align) return;
                
                // 移除所有文本对齐类
                $item.removeClass('ffs-float-text-left ffs-float-text-center ffs-float-text-right ffs-float-text-justify');
                
                // 应用新文本对齐方式
                if (align !== 'default') {
                    $item.addClass('ffs-float-text-' + align);
                }
                
                // 触发文本对齐方式变更事件
                $item.trigger('float:text-align-changed', [align]);
                
                return $item;
            },
            
            /**
             * 添加浮动元素
             * @param {string} selector - 容器选择器
             * @param {string} content - 元素内容
             * @param {object} options - 选项
             */
            addItem: function(selector, content, options) {
                const $container = $(selector);
                
                if (!$container.length) return;
                
                // 创建新浮动元素
                const $newItem = $('<div class="ffs-float-item"></div>');
                
                // 设置内容
                if (content) {
                    $newItem.html(content);
                }
                
                // 应用选项
                if (options) {
                    if (options.direction) {
                        this.setDirection($newItem, options.direction);
                    }
                    
                    if (options.clear) {
                        this.setClear($newItem, options.clear);
                    }
                    
                    if (options.position) {
                        this.setPosition($newItem, options.position);
                    }
                    
                    if (options.coordinates) {
                        this.setCoordinates($newItem, options.coordinates);
                    }
                    
                    if (options.zIndex) {
                        this.setZIndex($newItem, options.zIndex);
                    }
                    
                    if (options.display) {
                        this.setDisplay($newItem, options.display);
                    }
                    
                    if (options.visibility) {
                        this.setVisibility($newItem, options.visibility);
                    }
                    
                    if (options.overflow) {
                        this.setOverflow($newItem, options.overflow);
                    }
                    
                    if (options.textAlign) {
                        this.setTextAlign($newItem, options.textAlign);
                    }
                    
                    if (options.width) {
                        $newItem.width(options.width);
                    }
                    
                    if (options.height) {
                        $newItem.height(options.height);
                    }
                    
                    if (options.class) {
                        $newItem.addClass(options.class);
                    }
                    
                    if (options.draggable) {
                        $newItem.attr('data-draggable', 'true');
                        $newItem.addClass('ffs-float-draggable');
                    }
                    
                    if (options.collision) {
                        $newItem.attr('data-collision', 'true');
                    }
                }
                
                // 添加到容器
                $container.append($newItem);
                
                // 触发元素添加事件
                $container.trigger('float:item-added', [$newItem]);
                
                return $newItem;
            },
            
            /**
             * 移除浮动元素
             * @param {string} selector - 元素选择器
             */
            removeItem: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 获取父容器
                const $container = $item.parent('.ffs-float');
                
                // 删除浮动元素
                $item.remove();
                
                // 触发元素删除事件
                if ($container.length) {
                    $container.trigger('float:item-removed');
                }
            },
            
            /**
             * 使浮动元素可拖拽
             * @param {string} selector - 元素选择器
             * @param {boolean} draggable - 是否可拖拽
             */
            setDraggable: function(selector, draggable) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                if (draggable) {
                    // 设置为可拖拽
                    $item.attr('data-draggable', 'true');
                    $item.addClass('ffs-float-draggable');
                    
                    // 重新初始化拖拽功能
                    initFloatDrag();
                } else {
                    // 取消可拖拽
                    $item.removeAttr('data-draggable');
                    $item.removeClass('ffs-float-draggable');
                    
                    // 移除拖拽事件
                    $item.off('mousedown');
                }
                
                return $item;
            },
            
            /**
             * 获取浮动元素配置
             * @param {string} selector - 元素选择器
             * @returns {object} 浮动元素配置
             */
            getConfig: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return null;
                
                // 获取浮动方向
                let direction = 'none';
                if ($item.hasClass('ffs-float-left')) {
                    direction = 'left';
                } else if ($item.hasClass('ffs-float-right')) {
                    direction = 'right';
                }
                
                // 获取清除方式
                let clear = 'none';
                if ($item.hasClass('ffs-clear-left')) {
                    clear = 'left';
                } else if ($item.hasClass('ffs-clear-right')) {
                    clear = 'right';
                } else if ($item.hasClass('ffs-clear-both')) {
                    clear = 'both';
                }
                
                // 获取定位方式
                let position = 'static';
                if ($item.hasClass('ffs-float-relative')) {
                    position = 'relative';
                } else if ($item.hasClass('ffs-float-absolute')) {
                    position = 'absolute';
                } else if ($item.hasClass('ffs-float-fixed')) {
                    position = 'fixed';
                } else if ($item.hasClass('ffs-float-sticky')) {
                    position = 'sticky';
                }
                
                // 获取坐标
                const coordinates = {
                    top: parseInt($item.css('top')) || 0,
                    right: parseInt($item.css('right')) || 0,
                    bottom: parseInt($item.css('bottom')) || 0,
                    left: parseInt($item.css('left')) || 0
                };
                
                // 获取层级
                let zIndex = parseInt($item.css('z-index')) || 'auto';
                
                // 获取显示方式
                let display = 'default';
                if ($item.hasClass('ffs-float-block')) {
                    display = 'block';
                } else if ($item.hasClass('ffs-float-inline')) {
                    display = 'inline';
                } else if ($item.hasClass('ffs-float-inline-block')) {
                    display = 'inline-block';
                } else if ($item.hasClass('ffs-float-flex')) {
                    display = 'flex';
                } else if ($item.hasClass('ffs-float-none')) {
                    display = 'none';
                }
                
                // 获取可见性
                let visibility = 'default';
                if ($item.hasClass('ffs-float-visible')) {
                    visibility = 'visible';
                } else if ($item.hasClass('ffs-float-invisible')) {
                    visibility = 'invisible';
                } else if ($item.hasClass('ffs-float-hidden')) {
                    visibility = 'hidden';
                }
                
                // 获取溢出方式
                let overflow = 'default';
                if ($item.hasClass('ffs-float-overflow-visible')) {
                    overflow = 'visible';
                } else if ($item.hasClass('ffs-float-overflow-hidden')) {
                    overflow = 'hidden';
                } else if ($item.hasClass('ffs-float-overflow-scroll')) {
                    overflow = 'scroll';
                } else if ($item.hasClass('ffs-float-overflow-auto')) {
                    overflow = 'auto';
                }
                
                // 获取文本对齐方式
                let textAlign = 'default';
                if ($item.hasClass('ffs-float-text-left')) {
                    textAlign = 'left';
                } else if ($item.hasClass('ffs-float-text-center')) {
                    textAlign = 'center';
                } else if ($item.hasClass('ffs-float-text-right')) {
                    textAlign = 'right';
                } else if ($item.hasClass('ffs-float-text-justify')) {
                    textAlign = 'justify';
                }
                
                // 获取尺寸
                const width = $item.width();
                const height = $item.height();
                
                // 获取拖拽状态
                const draggable = $item.attr('data-draggable') === 'true';
                
                // 获取碰撞检测状态
                const collision = $item.attr('data-collision') === 'true';
                
                // 返回配置
                return {
                    direction: direction,
                    clear: clear,
                    position: position,
                    coordinates: coordinates,
                    zIndex: zIndex,
                    display: display,
                    visibility: visibility,
                    overflow: overflow,
                    textAlign: textAlign,
                    width: width,
                    height: height,
                    draggable: draggable,
                    collision: collision
                };
            },
            
            /**
             * 应用浮动元素配置
             * @param {string} selector - 元素选择器
             * @param {object} config - 浮动元素配置
             */
            applyConfig: function(selector, config) {
                if (!config) return;
                
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 应用浮动方向
                if (config.direction) {
                    this.setDirection($item, config.direction);
                }
                
                // 应用清除方式
                if (config.clear) {
                    this.setClear($item, config.clear);
                }
                
                // 应用定位方式
                if (config.position) {
                    this.setPosition($item, config.position);
                }
                
                // 应用坐标
                if (config.coordinates) {
                    this.setCoordinates($item, config.coordinates);
                }
                
                // 应用层级
                if (config.zIndex) {
                    this.setZIndex($item, config.zIndex);
                }
                
                // 应用显示方式
                if (config.display) {
                    this.setDisplay($item, config.display);
                }
                
                // 应用可见性
                if (config.visibility) {
                    this.setVisibility($item, config.visibility);
                }
                
                // 应用溢出方式
                if (config.overflow) {
                    this.setOverflow($item, config.overflow);
                }
                
                // 应用文本对齐方式
                if (config.textAlign) {
                    this.setTextAlign($item, config.textAlign);
                }
                
                // 应用尺寸
                if (config.width) {
                    $item.width(config.width);
                }
                
                if (config.height) {
                    $item.height(config.height);
                }
                
                // 应用拖拽状态
                if (config.draggable !== undefined) {
                    this.setDraggable($item, config.draggable);
                }
                
                // 应用碰撞检测状态
                if (config.collision !== undefined) {
                    $item.attr('data-collision', config.collision ? 'true' : 'false');
                    
                    // 重新初始化碰撞检测
                    if (config.collision) {
                        initFloatCollision();
                    }
                }
                
                return $item;
            },
            
            /**
             * 保存浮动元素配置
             * @param {string} selector - 元素选择器
             * @param {string} key - 存储键名
             */
            saveConfig: function(selector, key) {
                const $item = $(selector);
                
                if (!$item.length || !key) return;
                
                // 获取配置
                const config = this.getConfig($item);
                
                // 保存到本地存储
                if (config && window.localStorage) {
                    localStorage.setItem('ffs-float-' + key, JSON.stringify(config));
                }
            },
            
            /**
             * 加载浮动元素配置
             * @param {string} selector - 元素选择器
             * @param {string} key - 存储键名
             */
            loadConfig: function(selector, key) {
                const $item = $(selector);
                
                if (!$item.length || !key || !window.localStorage) return;
                
                // 从本地存储获取配置
                const configStr = localStorage.getItem('ffs-float-' + key);
                
                if (configStr) {
                    try {
                        // 解析配置
                        const config = JSON.parse(configStr);
                        
                        // 应用配置
                        this.applyConfig($item, config);
                    } catch (e) {
                        console.error('加载浮动元素配置失败:', e);
                    }
                }
                
                return $item;
            },
            
            /**
             * 重置浮动元素
             * @param {string} selector - 元素选择器
             */
            reset: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 移除所有浮动相关类
                $item.removeClass(
                    'ffs-float-left ffs-float-right ffs-float-none ' +
                    'ffs-clear-left ffs-clear-right ffs-clear-both ' +
                    'ffs-float-static ffs-float-relative ffs-float-absolute ffs-float-fixed ffs-float-sticky ' +
                    'ffs-float-z-1 ffs-float-z-10 ffs-float-z-100 ffs-float-z-1000 ' +
                    'ffs-float-block ffs-float-inline ffs-float-inline-block ffs-float-flex ffs-float-none ' +
                    'ffs-float-visible ffs-float-invisible ffs-float-hidden ' +
                    'ffs-float-overflow-visible ffs-float-overflow-hidden ffs-float-overflow-scroll ffs-float-overflow-auto ' +
                    'ffs-float-text-left ffs-float-text-center ffs-float-text-right ffs-float-text-justify ' +
                    'ffs-float-draggable ffs-float-dragging ffs-float-collision'
                );
                
                // 移除内联样式
                $item.css({
                    'position': '',
                    'top': '',
                    'right': '',
                    'bottom': '',
                    'left': '',
                    'z-index': '',
                    'width': '',
                    'height': ''
                });
                
                // 移除数据属性
                $item.removeAttr('data-draggable');
                $item.removeAttr('data-collision');
                $item.removeData('original-float');
                $item.removeData('original-width');
                
                // 移除事件处理程序
                $item.off('mousedown');
                $item.off('float:drag-move');
                $item.off('float:drag-end');
                
                // 触发重置事件
                $item.trigger('float:reset');
                
                return $item;
            },
            
            /**
             * 初始化浮动布局
             * 手动初始化或重新初始化浮动布局功能
             */
            init: function() {
                // 初始化浮动元素
                initFloatElement();
                
                // 初始化浮动元素拖拽
                initFloatDrag();
                
                // 初始化浮动元素碰撞检测
                initFloatCollision();
                
                // 初始化浮动响应式调整
                initFloatResponsive();
                
                // 初始化浮动元素动态添加/删除
                initFloatDynamic();
                
                // 初始化浮动定位控制
                initFloatPosition();
                
                // 初始化浮动层级控制
                initFloatZIndex();
                
                // 初始化浮动显示控制
                initFloatDisplay();
                
                // 初始化浮动溢出控制
                initFloatOverflow();
                
                // 初始化浮动对齐控制
                initFloatAlign();
            }
        };
    }
})(jQuery);