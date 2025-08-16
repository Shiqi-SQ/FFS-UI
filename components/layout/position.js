/**
 * FFS UI - 定位布局组件
 * 提供定位布局的交互功能，包括动态定位控制、拖拽和响应式调整
 */
(function($) {
    'use strict';

    /**
     * 初始化定位元素
     * 处理定位元素的基本交互
     */
    function initPositionElement() {
        // 定位类型切换按钮点击事件
        $(document).on('click', '[data-position-type]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const positionType = $btn.data('position-type');
            
            if (!$item.length || !positionType) return;
            
            // 移除所有定位类型类
            $item.removeClass('ffs-position-static ffs-position-relative ffs-position-absolute ffs-position-fixed ffs-position-sticky');
            
            // 应用新定位类型
            $item.addClass('ffs-position-' + positionType);
            
            // 更新按钮状态
            $('[data-position-type]').removeClass('active');
            $btn.addClass('active');
            
            // 触发定位类型变更事件
            $item.trigger('position:type-changed', [positionType]);
        });
        
        // 定位方向切换按钮点击事件
        $(document).on('click', '[data-position-direction]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const direction = $btn.data('position-direction');
            
            if (!$item.length || !direction) return;
            
            // 获取方向类型（top, bottom, left, right）
            const directionType = direction.split('-')[0];
            
            // 移除相同方向的所有类
            $item.removeClass(function(index, className) {
                return (className.match(new RegExp('ffs-position-' + directionType + '(-[a-z]+)?', 'g')) || []).join(' ');
            });
            
            // 应用新方向
            $item.addClass('ffs-position-' + direction);
            
            // 更新按钮状态
            $('[data-position-direction]').removeClass('active');
            $btn.addClass('active');
            
            // 触发方向变更事件
            $item.trigger('position:direction-changed', [direction]);
        });
        
        // 定位尺寸切换按钮点击事件
        $(document).on('click', '[data-position-size]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const size = $btn.data('position-size');
            
            if (!$item.length || !size) return;
            
            // 解析尺寸类型和大小
            const [dimension, sizeValue] = size.split('-');
            
            // 移除相同维度的所有尺寸类
            $item.removeClass(function(index, className) {
                return (className.match(new RegExp('ffs-position-' + dimension + '-[a-z]+', 'g')) || []).join(' ');
            });
            
            // 应用新尺寸
            $item.addClass('ffs-position-' + size);
            
            // 更新按钮状态
            $('[data-position-size]').removeClass('active');
            $btn.addClass('active');
            
            // 触发尺寸变更事件
            $item.trigger('position:size-changed', [size]);
        });
        
        // 定位层级切换按钮点击事件
        $(document).on('click', '[data-position-zindex]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const zIndex = $btn.data('position-zindex');
            
            if (!$item.length || !zIndex) return;
            
            // 移除所有层级类
            $item.removeClass('ffs-position-z-1 ffs-position-z-10 ffs-position-z-100 ffs-position-z-1000');
            
            // 应用新层级
            $item.addClass('ffs-position-z-' + zIndex);
            
            // 更新按钮状态
            $('[data-position-zindex]').removeClass('active');
            $btn.addClass('active');
            
            // 触发层级变更事件
            $item.trigger('position:zindex-changed', [zIndex]);
        });
        
        // 定位显示方式切换按钮点击事件
        $(document).on('click', '[data-position-display]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const display = $btn.data('position-display');
            
            if (!$item.length || !display) return;
            
            // 移除所有显示类
            $item.removeClass('ffs-position-block ffs-position-inline ffs-position-inline-block');
            
            // 应用新显示方式
            $item.addClass('ffs-position-' + display);
            
            // 更新按钮状态
            $('[data-position-display]').removeClass('active');
            $btn.addClass('active');
            
            // 触发显示方式变更事件
            $item.trigger('position:display-changed', [display]);
        });
        
        // 定位可见性切换按钮点击事件
        $(document).on('click', '[data-position-visibility]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const visibility = $btn.data('position-visibility');
            
            if (!$item.length || !visibility) return;
            
            // 移除所有可见性类
            $item.removeClass('ffs-position-visible ffs-position-hidden');
            
            // 应用新可见性
            $item.addClass('ffs-position-' + visibility);
            
            // 更新按钮状态
            $('[data-position-visibility]').removeClass('active');
            $btn.addClass('active');
            
            // 触发可见性变更事件
            $item.trigger('position:visibility-changed', [visibility]);
        });
        
        // 定位溢出方式切换按钮点击事件
        $(document).on('click', '[data-position-overflow]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const overflow = $btn.data('position-overflow');
            
            if (!$item.length || !overflow) return;
            
            // 移除所有溢出类
            $item.removeClass('ffs-position-overflow-auto ffs-position-overflow-hidden ffs-position-overflow-scroll ffs-position-overflow-visible');
            
            // 应用新溢出方式
            $item.addClass('ffs-position-overflow-' + overflow);
            
            // 更新按钮状态
            $('[data-position-overflow]').removeClass('active');
            $btn.addClass('active');
            
            // 触发溢出方式变更事件
            $item.trigger('position:overflow-changed', [overflow]);
        });
        
        // 定位对齐方式切换按钮点击事件
        $(document).on('click', '[data-position-align]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const align = $btn.data('position-align');
            
            if (!$item.length || !align) return;
            
            // 移除所有对齐类
            $item.removeClass('ffs-position-align-left ffs-position-align-center ffs-position-align-right');
            
            // 应用新对齐方式
            $item.addClass('ffs-position-align-' + align);
            
            // 更新按钮状态
            $('[data-position-align]').removeClass('active');
            $btn.addClass('active');
            
            // 触发对齐方式变更事件
            $item.trigger('position:align-changed', [align]);
        });
        
        // 定位阴影切换按钮点击事件
        $(document).on('click', '[data-position-shadow]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const shadow = $btn.data('position-shadow');
            
            if (!$item.length || !shadow) return;
            
            // 移除所有阴影类
            $item.removeClass('ffs-position-shadow-sm ffs-position-shadow-md ffs-position-shadow-lg ffs-position-shadow-xl');
            
            // 应用新阴影
            $item.addClass('ffs-position-shadow-' + shadow);
            
            // 更新按钮状态
            $('[data-position-shadow]').removeClass('active');
            $btn.addClass('active');
            
            // 触发阴影变更事件
            $item.trigger('position:shadow-changed', [shadow]);
        });
    }

    /**
     * 初始化定位元素拖拽
     * 提供定位元素的拖拽功能
     */
    function initPositionDrag() {
        // 标记为可拖拽的元素
        $('.ffs-position-item[data-draggable="true"]').addClass('ffs-position-draggable');
        
        // 拖拽开始
        $(document).on('mousedown', '.ffs-position-draggable', function(e) {
            // 如果点击的是按钮或输入框，不启动拖拽
            if ($(e.target).is('button, input, select, textarea, a, [data-position-type], [data-position-direction], [data-position-size], [data-position-zindex], [data-position-display], [data-position-visibility], [data-position-overflow], [data-position-align], [data-position-shadow]')) {
                return;
            }
            
            const $item = $(this);
            
            // 确保元素有定位属性
            if (!$item.hasClass('ffs-position-relative') && 
                !$item.hasClass('ffs-position-absolute') && 
                !$item.hasClass('ffs-position-fixed')) {
                $item.addClass('ffs-position-relative');
            }
            
            // 记录初始位置
            const offset = $item.offset();
            const itemPosition = {
                left: parseInt($item.css('left')) || 0,
                top: parseInt($item.css('top')) || 0
            };
            
            const mousePosition = {
                left: e.pageX,
                top: e.pageY
            };
            
            // 添加拖拽中状态
            $item.addClass('ffs-position-dragging');
            
            // 触发拖拽开始事件
            $item.trigger('position:drag-start', [itemPosition]);
            
            // 拖拽移动
            $(document).on('mousemove.positionDrag', function(e) {
                // 计算新位置
                const newLeft = itemPosition.left + (e.pageX - mousePosition.left);
                const newTop = itemPosition.top + (e.pageY - mousePosition.top);
                
                // 应用新位置
                $item.css({
                    left: newLeft + 'px',
                    top: newTop + 'px'
                });
                
                // 触发拖拽移动事件
                $item.trigger('position:drag-move', [{ left: newLeft, top: newTop }]);
            });
            
            // 拖拽结束
            $(document).on('mouseup.positionDrag', function() {
                // 移除拖拽中状态
                $item.removeClass('ffs-position-dragging');
                
                // 移除事件处理程序
                $(document).off('mousemove.positionDrag mouseup.positionDrag');
                
                // 获取最终位置
                const finalPosition = {
                    left: parseInt($item.css('left')) || 0,
                    top: parseInt($item.css('top')) || 0
                };
                
                // 触发拖拽结束事件
                $item.trigger('position:drag-end', [finalPosition]);
            });
            
            // 阻止默认行为和事件冒泡
            e.preventDefault();
            e.stopPropagation();
        });
    }

    /**
     * 初始化定位动画
     * 处理定位元素的动画效果
     */
    function initPositionAnimation() {
        // 淡入淡出动画
        $('.ffs-position-fade').each(function() {
            const $item = $(this);
            const initialOpacity = $item.data('initial-opacity') || 0;
            
            // 设置初始透明度
            $item.css('opacity', initialOpacity);
        });
        
        // 滑动动画
        $('.ffs-position-slide').each(function() {
            const $item = $(this);
            const slideDirection = $item.hasClass('ffs-position-slide-left') ? 'left' :
                                  $item.hasClass('ffs-position-slide-right') ? 'right' :
                                  $item.hasClass('ffs-position-slide-up') ? 'up' :
                                  $item.hasClass('ffs-position-slide-down') ? 'down' : null;
            
            if (slideDirection) {
                // 记录原始位置
                $item.data('original-position', {
                    left: parseInt($item.css('left')) || 0,
                    top: parseInt($item.css('top')) || 0
                });
            }
        });
        
        // 动画触发按钮点击事件
        $(document).on('click', '[data-position-animate]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            const animation = $btn.data('position-animate');
            const duration = $btn.data('position-animate-duration') || 300;
            
            if (!$item.length || !animation) return;
            
            // 根据动画类型执行相应的动画
            if (animation === 'fade-in') {
                $item.css('opacity', 0)
                     .css('display', 'block')
                     .animate({ opacity: 1 }, duration);
            } else if (animation === 'fade-out') {
                $item.animate({ opacity: 0 }, duration, function() {
                    $(this).css('display', 'none');
                });
            } else if (animation === 'slide-in') {
                const slideDirection = $btn.data('position-animate-direction') || 'left';
                let animateProps = {};
                
                // 根据滑动方向设置动画属性
                if (slideDirection === 'left') {
                    $item.css('left', '-100%').css('display', 'block');
                    animateProps = { left: 0 };
                } else if (slideDirection === 'right') {
                    $item.css('left', '100%').css('display', 'block');
                    animateProps = { left: 0 };
                } else if (slideDirection === 'up') {
                    $item.css('top', '100%').css('display', 'block');
                    animateProps = { top: 0 };
                } else if (slideDirection === 'down') {
                    $item.css('top', '-100%').css('display', 'block');
                    animateProps = { top: 0 };
                }
                
                $item.animate(animateProps, duration);
            } else if (animation === 'slide-out') {
                const slideDirection = $btn.data('position-animate-direction') || 'left';
                let animateProps = {};
                
                // 根据滑动方向设置动画属性
                if (slideDirection === 'left') {
                    animateProps = { left: '-100%' };
                } else if (slideDirection === 'right') {
                    animateProps = { left: '100%' };
                } else if (slideDirection === 'up') {
                    animateProps = { top: '-100%' };
                } else if (slideDirection === 'down') {
                    animateProps = { top: '100%' };
                }
                
                $item.animate(animateProps, duration, function() {
                    $(this).css('display', 'none');
                });
            }
            
            // 触发动画事件
            $item.trigger('position:animate', [animation, duration]);
        });
    }
    
    /**
     * 初始化响应式定位
     * 处理定位元素在不同屏幕尺寸下的响应式调整
     */
    function initPositionResponsive() {
        // 窗口大小变化时调整定位元素
        $(window).on('resize', function() {
            adjustPositionResponsive();
        });
        
        // 初始调整定位元素
        adjustPositionResponsive();
        
        // 响应式调整函数
        function adjustPositionResponsive() {
            $('.ffs-position-item[data-responsive="true"]').each(function() {
                const $item = $(this);
                const windowWidth = $(window).width();
                
                // 获取响应式配置
                const responsiveConfig = $item.data('responsive-config');
                
                if (responsiveConfig) {
                    try {
                        const config = typeof responsiveConfig === 'string' ? 
                                      JSON.parse(responsiveConfig) : responsiveConfig;
                        
                        // 应用响应式配置
                        for (const breakpoint in config) {
                            if (windowWidth <= parseInt(breakpoint)) {
                                const settings = config[breakpoint];
                                
                                // 应用位置
                                if (settings.position) {
                                    $item.removeClass('ffs-position-static ffs-position-relative ffs-position-absolute ffs-position-fixed ffs-position-sticky')
                                         .addClass('ffs-position-' + settings.position);
                                }
                                
                                // 应用方向
                                if (settings.direction) {
                                    for (const dir in settings.direction) {
                                        $item.css(dir, settings.direction[dir]);
                                    }
                                }
                                
                                // 应用尺寸
                                if (settings.size) {
                                    if (settings.size.width) {
                                        $item.css('width', settings.size.width);
                                    }
                                    if (settings.size.height) {
                                        $item.css('height', settings.size.height);
                                    }
                                }
                                
                                // 应用层级
                                if (settings.zIndex) {
                                    $item.css('z-index', settings.zIndex);
                                }
                                
                                // 应用显示方式
                                if (settings.display) {
                                    $item.css('display', settings.display);
                                }
                                
                                break;
                            }
                        }
                    } catch (e) {
                        console.error('响应式配置解析错误:', e);
                    }
                }
            });
        }
    }
    
    /**
     * 初始化定位元素碰撞检测
     * 提供定位元素之间的碰撞检测功能
     */
    function initPositionCollision() {
        // 启用碰撞检测的元素
        $('.ffs-position-item[data-collision="true"]').addClass('ffs-position-collision');
        
        // 拖拽移动时检测碰撞
        $(document).on('position:drag-move', '.ffs-position-collision', function(e, position) {
            const $item = $(this);
            const itemRect = $item[0].getBoundingClientRect();
            
            // 获取所有其他启用碰撞检测的元素
            $('.ffs-position-collision').not($item).each(function() {
                const $other = $(this);
                const otherRect = $other[0].getBoundingClientRect();
                
                // 检测碰撞
                if (isColliding(itemRect, otherRect)) {
                    // 添加碰撞状态
                    $item.addClass('ffs-position-colliding');
                    $other.addClass('ffs-position-colliding');
                    
                    // 触发碰撞事件
                    $item.trigger('position:collision', [$other]);
                    $other.trigger('position:collision', [$item]);
                } else {
                    // 如果不再碰撞，移除碰撞状态
                    if ($item.data('colliding-with') === $other.attr('id')) {
                        $item.removeClass('ffs-position-colliding');
                        $item.removeData('colliding-with');
                    }
                    
                    if ($other.data('colliding-with') === $item.attr('id')) {
                        $other.removeClass('ffs-position-colliding');
                        $other.removeData('colliding-with');
                    }
                }
            });
        });
        
        // 碰撞检测函数
        function isColliding(rect1, rect2) {
            return !(
                rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom
            );
        }
    }
    
    /**
     * 初始化定位元素动态添加/删除
     * 提供定位元素的动态添加和删除功能
     */
    function initPositionDynamic() {
        // 添加定位元素按钮点击事件
        $(document).on('click', '[data-position-add]', function() {
            const $btn = $(this);
            const container = $btn.data('position-container') || '.ffs-position';
            const $container = $(container);
            const template = $btn.data('position-template');
            
            if (!$container.length) return;
            
            // 创建新定位元素
            let $newItem;
            
            if (template) {
                // 使用模板创建
                const $template = $('#' + template);
                if ($template.length) {
                    $newItem = $($template.html());
                }
            }
            
            if (!$newItem || !$newItem.length) {
                // 使用默认模板创建
                $newItem = $('<div class="ffs-position-item">新定位元素</div>');
            }
            
            // 添加到容器
            $container.append($newItem);
            
            // 触发元素添加事件
            $container.trigger('position:item-added', [$newItem]);
        });
        
        // 删除定位元素按钮点击事件
        $(document).on('click', '[data-position-remove]', function() {
            const $btn = $(this);
            const target = $btn.data('position-target') || $btn.closest('.ffs-position-item');
            const $item = $(target);
            
            if (!$item.length) return;
            
            // 获取父容器
            const $container = $item.parent('.ffs-position');
            
            // 删除定位元素
            $item.remove();
            
            // 触发元素删除事件
            if ($container.length) {
                $container.trigger('position:item-removed');
            }
        });
    }
    
    // 在文档加载完成后初始化定位布局功能
    $(document).ready(function() {
        // 初始化定位元素
        initPositionElement();
        
        // 初始化定位元素拖拽
        initPositionDrag();
        
        // 初始化定位动画
        initPositionAnimation();
        
        // 初始化响应式定位
        initPositionResponsive();
        
        // 初始化定位元素碰撞检测
        initPositionCollision();
        
        // 初始化定位元素动态添加/删除
        initPositionDynamic();
    });
    
    // 暴露定位布局API
    if (!window.FFS) {
        window.FFS = {};
    }
    
    if (!window.FFS.position) {
        window.FFS.position = {
            /**
             * 设置定位类型
             * @param {string} selector - 选择器
             * @param {string} type - 定位类型：static, relative, absolute, fixed, sticky
             */
            setType: function(selector, type) {
                const $item = $(selector);
                
                if (!$item.length || !type) return;
                
                // 移除所有定位类型类
                $item.removeClass('ffs-position-static ffs-position-relative ffs-position-absolute ffs-position-fixed ffs-position-sticky');
                
                // 应用新定位类型
                $item.addClass('ffs-position-' + type);
                
                // 触发定位类型变更事件
                $item.trigger('position:type-changed', [type]);
                
                return $item;
            },
            
            /**
             * 设置定位方向
             * @param {string} selector - 选择器
             * @param {string} direction - 方向：top, bottom, left, right 或带有尺寸的方向如 top-sm
             */
            setDirection: function(selector, direction) {
                const $item = $(selector);
                
                if (!$item.length || !direction) return;
                
                // 获取方向类型（top, bottom, left, right）
                const directionType = direction.split('-')[0];
                
                // 移除相同方向的所有类
                $item.removeClass(function(index, className) {
                    return (className.match(new RegExp('ffs-position-' + directionType + '(-[a-z]+)?', 'g')) || []).join(' ');
                });
                
                // 应用新方向
                $item.addClass('ffs-position-' + direction);
                
                // 触发方向变更事件
                $item.trigger('position:direction-changed', [direction]);
                
                return $item;
            },
            
            /**
             * 设置定位尺寸
             * @param {string} selector - 选择器
             * @param {string} dimension - 维度：width 或 height
             * @param {string} size - 尺寸：sm, md, lg, xl
             */
            setSize: function(selector, dimension, size) {
                const $item = $(selector);
                
                if (!$item.length || !dimension || !size) return;
                
                // 移除相同维度的所有尺寸类
                $item.removeClass(function(index, className) {
                    return (className.match(new RegExp('ffs-position-' + dimension + '-[a-z]+', 'g')) || []).join(' ');
                });
                
                // 应用新尺寸
                $item.addClass('ffs-position-' + dimension + '-' + size);
                
                // 触发尺寸变更事件
                $item.trigger('position:size-changed', [dimension + '-' + size]);
                
                return $item;
            },
            
            /**
             * 设置定位层级
             * @param {string} selector - 选择器
             * @param {string|number} zIndex - 层级值：1, 10, 100, 1000 或具体数值
             */
            setZIndex: function(selector, zIndex) {
                const $item = $(selector);
                
                if (!$item.length || zIndex === undefined) return;
                
                // 移除所有层级类
                $item.removeClass('ffs-position-z-1 ffs-position-z-10 ffs-position-z-100 ffs-position-z-1000');
                
                // 应用新层级
                if (typeof zIndex === 'string' && ['1', '10', '100', '1000'].includes(zIndex)) {
                    $item.addClass('ffs-position-z-' + zIndex);
                } else if (typeof zIndex === 'number' || !isNaN(parseInt(zIndex))) {
                    $item.css('z-index', zIndex);
                }
                
                // 触发层级变更事件
                $item.trigger('position:zindex-changed', [zIndex]);
                
                return $item;
            },
            
            /**
             * 设置定位显示方式
             * @param {string} selector - 选择器
             * @param {string} display - 显示方式：block, inline, inline-block
             */
            setDisplay: function(selector, display) {
                const $item = $(selector);
                
                if (!$item.length || !display) return;
                
                // 移除所有显示类
                $item.removeClass('ffs-position-block ffs-position-inline ffs-position-inline-block');
                
                // 应用新显示方式
                $item.addClass('ffs-position-' + display);
                
                // 触发显示方式变更事件
                $item.trigger('position:display-changed', [display]);
                
                return $item;
            },
            
            /**
             * 设置定位可见性
             * @param {string} selector - 选择器
             * @param {string} visibility - 可见性：visible, hidden
             */
            setVisibility: function(selector, visibility) {
                const $item = $(selector);
                
                if (!$item.length || !visibility) return;
                
                // 移除所有可见性类
                $item.removeClass('ffs-position-visible ffs-position-hidden');
                
                // 应用新可见性
                $item.addClass('ffs-position-' + visibility);
                
                // 触发可见性变更事件
                $item.trigger('position:visibility-changed', [visibility]);
                
                return $item;
            },
            
            /**
             * 设置定位溢出方式
             * @param {string} selector - 选择器
             * @param {string} overflow - 溢出方式：visible, hidden, scroll, auto
             */
            setOverflow: function(selector, overflow) {
                const $item = $(selector);
                
                if (!$item.length || !overflow) return;
                
                // 移除所有溢出类
                $item.removeClass('ffs-position-overflow-auto ffs-position-overflow-hidden ffs-position-overflow-scroll ffs-position-overflow-visible');
                
                // 应用新溢出方式
                $item.addClass('ffs-position-overflow-' + overflow);
                
                // 触发溢出方式变更事件
                $item.trigger('position:overflow-changed', [overflow]);
                
                return $item;
            },
            
            /**
             * 设置定位对齐方式
             * @param {string} selector - 选择器
             * @param {string} align - 对齐方式：left, center, right
             */
            setAlign: function(selector, align) {
                const $item = $(selector);
                
                if (!$item.length || !align) return;
                
                // 移除所有对齐类
                $item.removeClass('ffs-position-align-left ffs-position-align-center ffs-position-align-right');
                
                // 应用新对齐方式
                $item.addClass('ffs-position-align-' + align);
                
                // 触发对齐方式变更事件
                $item.trigger('position:align-changed', [align]);
                
                return $item;
            },
            
            /**
             * 设置定位阴影
             * @param {string} selector - 选择器
             * @param {string} shadow - 阴影大小：sm, md, lg, xl
             */
            setShadow: function(selector, shadow) {
                const $item = $(selector);
                
                if (!$item.length || !shadow) return;
                
                // 移除所有阴影类
                $item.removeClass('ffs-position-shadow-sm ffs-position-shadow-md ffs-position-shadow-lg ffs-position-shadow-xl');
                
                // 应用新阴影
                $item.addClass('ffs-position-shadow-' + shadow);
                
                // 触发阴影变更事件
                $item.trigger('position:shadow-changed', [shadow]);
                
                return $item;
            },
            
            /**
             * 设置定位坐标
             * @param {string} selector - 选择器
             * @param {object} coordinates - 坐标对象，包含 top, right, bottom, left 属性
             */
            setCoordinates: function(selector, coordinates) {
                const $item = $(selector);
                
                if (!$item.length || !coordinates) return;
                
                // 应用坐标
                if (coordinates.top !== undefined) {
                    $item.css('top', typeof coordinates.top === 'number' ? coordinates.top + 'px' : coordinates.top);
                }
                
                if (coordinates.right !== undefined) {
                    $item.css('right', typeof coordinates.right === 'number' ? coordinates.right + 'px' : coordinates.right);
                }
                
                if (coordinates.bottom !== undefined) {
                    $item.css('bottom', typeof coordinates.bottom === 'number' ? coordinates.bottom + 'px' : coordinates.bottom);
                }
                
                if (coordinates.left !== undefined) {
                    $item.css('left', typeof coordinates.left === 'number' ? coordinates.left + 'px' : coordinates.left);
                }
                
                // 触发坐标变更事件
                $item.trigger('position:coordinates-changed', [coordinates]);
                
                return $item;
            },
            
            /**
             * 设置定位动画
             * @param {string} selector - 选择器
             * @param {string} animation - 动画类型：fade-in, fade-out, slide-in, slide-out
             * @param {object} options - 动画选项
             */
            animate: function(selector, animation, options) {
                const $item = $(selector);
                
                if (!$item.length || !animation) return;
                
                // 默认选项
                const defaultOptions = {
                    duration: 300,
                    direction: 'left',
                    callback: null
                };
                
                // 合并选项
                const settings = $.extend({}, defaultOptions, options);
                
                // 根据动画类型执行相应的动画
                if (animation === 'fade-in') {
                    $item.css('opacity', 0)
                         .css('display', 'block')
                         .animate({ opacity: 1 }, settings.duration, settings.callback);
                } else if (animation === 'fade-out') {
                    $item.animate({ opacity: 0 }, settings.duration, function() {
                        $(this).css('display', 'none');
                        if (typeof settings.callback === 'function') {
                            settings.callback.call(this);
                        }
                    });
                } else if (animation === 'slide-in') {
                    let animateProps = {};
                    
                    // 根据滑动方向设置动画属性
                    if (settings.direction === 'left') {
                        $item.css('left', '-100%').css('display', 'block');
                        animateProps = { left: 0 };
                    } else if (settings.direction === 'right') {
                        $item.css('left', '100%').css('display', 'block');
                        animateProps = { left: 0 };
                    } else if (settings.direction === 'up') {
                        $item.css('top', '100%').css('display', 'block');
                        animateProps = { top: 0 };
                    } else if (settings.direction === 'down') {
                        $item.css('top', '-100%').css('display', 'block');
                        animateProps = { top: 0 };
                    }
                    
                    $item.animate(animateProps, settings.duration, settings.callback);
                } else if (animation === 'slide-out') {
                    let animateProps = {};
                    
                    // 根据滑动方向设置动画属性
                    if (settings.direction === 'left') {
                        animateProps = { left: '-100%' };
                    } else if (settings.direction === 'right') {
                        animateProps = { left: '100%' };
                    } else if (settings.direction === 'up') {
                        animateProps = { top: '-100%' };
                    } else if (settings.direction === 'down') {
                        animateProps = { top: '100%' };
                    }
                    
                    $item.animate(animateProps, settings.duration, function() {
                        $(this).css('display', 'none');
                        if (typeof settings.callback === 'function') {
                            settings.callback.call(this);
                        }
                    });
                }
                
                // 触发动画事件
                $item.trigger('position:animate', [animation, settings]);
                
                return $item;
            },
            
            /**
             * 设置定位元素可拖拽
             * @param {string} selector - 选择器
             * @param {boolean} draggable - 是否可拖拽
             */
            setDraggable: function(selector, draggable) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                if (draggable) {
                    // 设置为可拖拽
                    $item.attr('data-draggable', 'true');
                    $item.addClass('ffs-position-draggable');
                } else {
                    // 取消可拖拽
                    $item.removeAttr('data-draggable');
                    $item.removeClass('ffs-position-draggable');
                }
                
                return $item;
            },
            
            /**
             * 设置定位元素碰撞检测
             * @param {string} selector - 选择器
             * @param {boolean} collision - 是否启用碰撞检测
             */
            setCollision: function(selector, collision) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                if (collision) {
                    // 启用碰撞检测
                    $item.attr('data-collision', 'true');
                    $item.addClass('ffs-position-collision');
                } else {
                    // 禁用碰撞检测
                    $item.removeAttr('data-collision');
                    $item.removeClass('ffs-position-collision');
                }
                
                return $item;
            },
            
            /**
             * 设置定位元素响应式
             * @param {string} selector - 选择器
             * @param {boolean} responsive - 是否启用响应式
             * @param {object} config - 响应式配置
             */
            setResponsive: function(selector, responsive, config) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                if (responsive) {
                    // 启用响应式
                    $item.attr('data-responsive', 'true');
                    
                    // 设置响应式配置
                    if (config) {
                        $item.attr('data-responsive-config', JSON.stringify(config));
                    }
                } else {
                    // 禁用响应式
                    $item.removeAttr('data-responsive');
                    $item.removeAttr('data-responsive-config');
                }
                
                return $item;
            },
            
            /**
             * 添加定位元素
             * @param {string} container - 容器选择器
             * @param {string} content - 元素内容
             * @param {object} options - 选项
             */
            addItem: function(container, content, options) {
                const $container = $(container);
                
                if (!$container.length) return;
                
                // 创建新定位元素
                const $newItem = $('<div class="ffs-position-item"></div>');
                
                // 设置内容
                if (content) {
                    $newItem.html(content);
                }
                
                // 应用选项
                if (options) {
                    if (options.type) {
                        this.setType($newItem, options.type);
                    }
                    
                    if (options.direction) {
                        this.setDirection($newItem, options.direction);
                    }
                    
                    if (options.size) {
                        if (options.size.width) {
                            this.setSize($newItem, 'width', options.size.width);
                        }
                        if (options.size.height) {
                            this.setSize($newItem, 'height', options.size.height);
                        }
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
                    
                    if (options.align) {
                        this.setAlign($newItem, options.align);
                    }
                    
                    if (options.shadow) {
                        this.setShadow($newItem, options.shadow);
                    }
                    
                    if (options.coordinates) {
                        this.setCoordinates($newItem, options.coordinates);
                    }
                    
                    if (options.draggable) {
                        this.setDraggable($newItem, options.draggable);
                    }
                    
                    if (options.collision) {
                        this.setCollision($newItem, options.collision);
                    }
                    
                    if (options.responsive) {
                        this.setResponsive($newItem, true, options.responsiveConfig);
                    }
                    
                    if (options.class) {
                        $newItem.addClass(options.class);
                    }
                }
                
                // 添加到容器
                $container.append($newItem);
                
                // 触发元素添加事件
                $container.trigger('position:item-added', [$newItem]);
                
                return $newItem;
            },
            
            /**
             * 移除定位元素
             * @param {string} selector - 元素选择器
             */
            removeItem: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 获取父容器
                const $container = $item.parent('.ffs-position');
                
                // 删除定位元素
                $item.remove();
                
                // 触发元素删除事件
                if ($container.length) {
                    $container.trigger('position:item-removed');
                }
            },
            
            /**
             * 获取定位元素配置
             * @param {string} selector - 元素选择器
             * @returns {object} 定位元素配置
             */
            getConfig: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return null;
                
                // 获取定位类型
                let type = 'static';
                if ($item.hasClass('ffs-position-relative')) {
                    type = 'relative';
                } else if ($item.hasClass('ffs-position-absolute')) {
                    type = 'absolute';
                } else if ($item.hasClass('ffs-position-fixed')) {
                    type = 'fixed';
                } else if ($item.hasClass('ffs-position-sticky')) {
                    type = 'sticky';
                }
                
                // 获取坐标
                const coordinates = {
                    top: $item.css('top'),
                    right: $item.css('right'),
                    bottom: $item.css('bottom'),
                    left: $item.css('left')
                };
                
                // 获取尺寸
                const size = {
                    width: $item.css('width'),
                    height: $item.css('height')
                };
                
                // 获取层级
                let zIndex = $item.css('z-index');
                
                // 获取显示方式
                let display = 'block';
                if ($item.hasClass('ffs-position-inline')) {
                    display = 'inline';
                } else if ($item.hasClass('ffs-position-inline-block')) {
                    display = 'inline-block';
                }
                
                // 获取可见性
                let visibility = 'visible';
                if ($item.hasClass('ffs-position-hidden')) {
                    visibility = 'hidden';
                }
                
                // 获取溢出方式
                let overflow = 'visible';
                if ($item.hasClass('ffs-position-overflow-hidden')) {
                    overflow = 'hidden';
                } else if ($item.hasClass('ffs-position-overflow-scroll')) {
                    overflow = 'scroll';
                } else if ($item.hasClass('ffs-position-overflow-auto')) {
                    overflow = 'auto';
                }
                
                // 获取对齐方式
                let align = 'left';
                if ($item.hasClass('ffs-position-align-center')) {
                    align = 'center';
                } else if ($item.hasClass('ffs-position-align-right')) {
                    align = 'right';
                }
                
                // 获取阴影
                let shadow = null;
                if ($item.hasClass('ffs-position-shadow-sm')) {
                    shadow = 'sm';
                } else if ($item.hasClass('ffs-position-shadow-md')) {
                    shadow = 'md';
                } else if ($item.hasClass('ffs-position-shadow-lg')) {
                    shadow = 'lg';
                } else if ($item.hasClass('ffs-position-shadow-xl')) {
                    shadow = 'xl';
                }
                
                // 获取可拖拽状态
                const draggable = $item.hasClass('ffs-position-draggable');
                
                // 获取碰撞检测状态
                const collision = $item.hasClass('ffs-position-collision');
                
                // 获取响应式状态
                const responsive = $item.attr('data-responsive') === 'true';
                
                // 获取响应式配置
                let responsiveConfig = null;
                if (responsive) {
                    const configStr = $item.attr('data-responsive-config');
                    if (configStr) {
                        try {
                            responsiveConfig = JSON.parse(configStr);
                        } catch (e) {
                            console.error('响应式配置解析错误:', e);
                        }
                    }
                }
                
                // 返回配置对象
                return {
                    type: type,
                    coordinates: coordinates,
                    size: size,
                    zIndex: zIndex,
                    display: display,
                    visibility: visibility,
                    overflow: overflow,
                    align: align,
                    shadow: shadow,
                    draggable: draggable,
                    collision: collision,
                    responsive: responsive,
                    responsiveConfig: responsiveConfig
                };
            },
            
            /**
             * 重置定位元素
             * @param {string} selector - 元素选择器
             */
            reset: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 移除所有定位相关类
                $item.removeClass(function(index, className) {
                    return (className.match(/ffs-position-[a-z0-9-]+/g) || []).join(' ');
                });
                
                // 重置内联样式
                $item.css({
                    position: '',
                    top: '',
                    right: '',
                    bottom: '',
                    left: '',
                    width: '',
                    height: '',
                    'z-index': '',
                    display: '',
                    visibility: '',
                    overflow: ''
                });
                
                // 移除数据属性
                $item.removeAttr('data-draggable');
                $item.removeAttr('data-collision');
                $item.removeAttr('data-responsive');
                $item.removeAttr('data-responsive-config');
                
                // 触发重置事件
                $item.trigger('position:reset');
                
                return $item;
            },
            
            /**
             * 克隆定位元素
             * @param {string} selector - 元素选择器
             * @param {string} container - 容器选择器，默认为原元素的父容器
             */
            clone: function(selector, container) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 获取父容器
                const $container = container ? $(container) : $item.parent();
                
                if (!$container.length) return;
                
                // 克隆元素
                const $clone = $item.clone(true);
                
                // 生成唯一ID
                if ($clone.attr('id')) {
                    $clone.attr('id', $clone.attr('id') + '-clone-' + new Date().getTime());
                }
                
                // 添加到容器
                $container.append($clone);
                
                // 触发克隆事件
                $container.trigger('position:item-cloned', [$clone, $item]);
                
                return $clone;
            },
            
            /**
             * 锁定定位元素
             * @param {string} selector - 元素选择器
             */
            lock: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 添加锁定类
                $item.addClass('ffs-position-locked');
                
                // 禁用拖拽
                this.setDraggable($item, false);
                
                // 触发锁定事件
                $item.trigger('position:locked');
                
                return $item;
            },
            
            /**
             * 解锁定位元素
             * @param {string} selector - 元素选择器
             */
            unlock: function(selector) {
                const $item = $(selector);
                
                if (!$item.length) return;
                
                // 移除锁定类
                $item.removeClass('ffs-position-locked');
                
                // 触发解锁事件
                $item.trigger('position:unlocked');
                
                return $item;
            },
            
            /**
             * 保存定位元素配置
             * @param {string} selector - 元素选择器
             * @returns {object} 定位元素配置
             */
            save: function(selector) {
                // 获取配置
                const config = this.getConfig(selector);
                
                if (!config) return null;
                
                // 触发保存事件
                $(selector).trigger('position:save', [config]);
                
                return config;
            },
            
            /**
             * 加载定位元素配置
             * @param {string} selector - 元素选择器
             * @param {object} config - 定位元素配置
             */
            load: function(selector, config) {
                const $item = $(selector);
                
                if (!$item.length || !config) return;
                
                // 应用配置
                if (config.type) {
                    this.setType($item, config.type);
                }
                
                if (config.coordinates) {
                    this.setCoordinates($item, config.coordinates);
                }
                
                if (config.size) {
                    if (config.size.width) {
                        $item.css('width', config.size.width);
                    }
                    if (config.size.height) {
                        $item.css('height', config.size.height);
                    }
                }
                
                if (config.zIndex) {
                    this.setZIndex($item, config.zIndex);
                }
                
                if (config.display) {
                    this.setDisplay($item, config.display);
                }
                
                if (config.visibility) {
                    this.setVisibility($item, config.visibility);
                }
                
                if (config.overflow) {
                    this.setOverflow($item, config.overflow);
                }
                
                if (config.align) {
                    this.setAlign($item, config.align);
                }
                
                if (config.shadow) {
                    this.setShadow($item, config.shadow);
                }
                
                if (config.draggable !== undefined) {
                    this.setDraggable($item, config.draggable);
                }
                
                if (config.collision !== undefined) {
                    this.setCollision($item, config.collision);
                }
                
                if (config.responsive !== undefined) {
                    this.setResponsive($item, config.responsive, config.responsiveConfig);
                }
                
                // 触发加载事件
                $item.trigger('position:load', [config]);
                
                return $item;
            },
            
            /**
             * 导出定位元素配置为JSON
             * @param {string} selector - 元素选择器
             * @returns {string} JSON字符串
             */
            exportJSON: function(selector) {
                const config = this.getConfig(selector);
                
                if (!config) return null;
                
                return JSON.stringify(config, null, 2);
            },
            
            /**
             * 从JSON导入定位元素配置
             * @param {string} selector - 元素选择器
             * @param {string} json - JSON字符串
             */
            importJSON: function(selector, json) {
                if (!json) return;
                
                try {
                    const config = JSON.parse(json);
                    this.load(selector, config);
                } catch (e) {
                    console.error('JSON解析错误:', e);
                }
            },
            
            /**
             * 对齐定位元素
             * @param {string} selector - 元素选择器
             * @param {string} target - 目标元素选择器
             * @param {string} alignment - 对齐方式：top, bottom, left, right, center
             */
            alignTo: function(selector, target, alignment) {
                const $item = $(selector);
                const $target = $(target);
                
                if (!$item.length || !$target.length || !alignment) return;
                
                // 获取目标元素位置和尺寸
                const targetOffset = $target.offset();
                const targetWidth = $target.outerWidth();
                const targetHeight = $target.outerHeight();
                
                // 获取元素尺寸
                const itemWidth = $item.outerWidth();
                const itemHeight = $item.outerHeight();
                
                // 计算新位置
                let newLeft, newTop;
                
                switch (alignment) {
                    case 'top':
                        newLeft = targetOffset.left + (targetWidth - itemWidth) / 2;
                        newTop = targetOffset.top - itemHeight;
                        break;
                    case 'bottom':
                        newLeft = targetOffset.left + (targetWidth - itemWidth) / 2;
                        newTop = targetOffset.top + targetHeight;
                        break;
                    case 'left':
                        newLeft = targetOffset.left - itemWidth;
                        newTop = targetOffset.top + (targetHeight - itemHeight) / 2;
                        break;
                    case 'right':
                        newLeft = targetOffset.left + targetWidth;
                        newTop = targetOffset.top + (targetHeight - itemHeight) / 2;
                        break;
                    case 'center':
                        newLeft = targetOffset.left + (targetWidth - itemWidth) / 2;
                        newTop = targetOffset.top + (targetHeight - itemHeight) / 2;
                        break;
                }
                
                // 应用新位置
                $item.css({
                    left: newLeft + 'px',
                    top: newTop + 'px'
                });
                
                // 触发对齐事件
                $item.trigger('position:aligned', [alignment, $target]);
                
                return $item;
            },
            
            /**
             * 分组定位元素
             * @param {string} selector - 元素选择器
             * @param {string} groupName - 分组名称
             */
            group: function(selector, groupName) {
                const $items = $(selector);
                
                if (!$items.length || !groupName) return;
                
                // 添加分组类
                $items.addClass('ffs-position-group-' + groupName);
                
                // 添加分组数据属性
                $items.attr('data-position-group', groupName);
                
                // 触发分组事件
                $items.trigger('position:grouped', [groupName]);
                
                return $items;
            },
            
            /**
             * 取消分组定位元素
             * @param {string} selector - 元素选择器
             * @param {string} groupName - 分组名称，如果不提供则取消所有分组
             */
            ungroup: function(selector, groupName) {
                const $items = $(selector);
                
                if (!$items.length) return;
                
                if (groupName) {
                    // 移除特定分组类
                    $items.removeClass('ffs-position-group-' + groupName);
                    
                    // 如果元素没有其他分组，移除分组数据属性
                    $items.each(function() {
                        const $item = $(this);
                        const groups = $item.attr('class').match(/ffs-position-group-[a-zA-Z0-9-_]+/g) || [];
                        
                        if (groups.length === 0) {
                            $item.removeAttr('data-position-group');
                        }
                    });
                } else {
                    // 移除所有分组类
                    $items.removeClass(function(index, className) {
                        return (className.match(/ffs-position-group-[a-zA-Z0-9-_]+/g) || []).join(' ');
                    });
                    
                    // 移除分组数据属性
                    $items.removeAttr('data-position-group');
                }
                
                // 触发取消分组事件
                $items.trigger('position:ungrouped', [groupName]);
                
                return $items;
            },
            
            /**
             * 获取分组中的定位元素
             * @param {string} groupName - 分组名称
             * @returns {jQuery} 分组中的元素集合
             */
            getGroupItems: function(groupName) {
                if (!groupName) return $();
                
                // 查找具有指定分组类的元素
                return $('.ffs-position-group-' + groupName);
            },
            
            /**
             * 批量操作分组中的元素
             * @param {string} groupName - 分组名称
             * @param {function} callback - 回调函数，接收元素作为参数
             */
            batchGroup: function(groupName, callback) {
                if (!groupName || typeof callback !== 'function') return;
                
                // 获取分组中的元素
                const $items = this.getGroupItems(groupName);
                
                // 对每个元素执行回调
                $items.each(function() {
                    callback($(this));
                });
                
                return $items;
            },
            
            /**
             * 设置元素间距
             * @param {string} selector - 元素选择器
             * @param {string} spacing - 间距大小：sm, md, lg, xl
             * @param {string} direction - 方向：all, x, y, top, right, bottom, left
             */
            setSpacing: function(selector, spacing, direction) {
                const $item = $(selector);
                
                if (!$item.length || !spacing) return;
                
                // 默认方向为all
                direction = direction || 'all';
                
                // 移除相关间距类
                $item.removeClass(function(index, className) {
                    return (className.match(/ffs-position-spacing-[a-z]+-[a-z]+/g) || []).join(' ');
                });
                
                // 应用新间距
                $item.addClass('ffs-position-spacing-' + direction + '-' + spacing);
                
                // 触发间距变更事件
                $item.trigger('position:spacing-changed', [spacing, direction]);
                
                return $item;
            },
            
            /**
             * 设置元素边框
             * @param {string} selector - 元素选择器
             * @param {string} border - 边框类型：sm, md, lg, xl
             * @param {string} direction - 方向：all, x, y, top, right, bottom, left
             */
            setBorder: function(selector, border, direction) {
                const $item = $(selector);
                
                if (!$item.length || !border) return;
                
                // 默认方向为all
                direction = direction || 'all';
                
                // 移除相关边框类
                $item.removeClass(function(index, className) {
                    return (className.match(/ffs-position-border-[a-z]+-[a-z]+/g) || []).join(' ');
                });
                
                // 应用新边框
                $item.addClass('ffs-position-border-' + direction + '-' + border);
                
                // 触发边框变更事件
                $item.trigger('position:border-changed', [border, direction]);
                
                return $item;
            },
            
            /**
             * 设置元素圆角
             * @param {string} selector - 元素选择器
             * @param {string} radius - 圆角大小：sm, md, lg, xl, circle
             * @param {string} direction - 方向：all, top, bottom, left, right, top-left, top-right, bottom-left, bottom-right
             */
            setRadius: function(selector, radius, direction) {
                const $item = $(selector);
                
                if (!$item.length || !radius) return;
                
                // 默认方向为all
                direction = direction || 'all';
                
                // 移除相关圆角类
                $item.removeClass(function(index, className) {
                    return (className.match(/ffs-position-radius-[a-z-]+-[a-z]+/g) || []).join(' ');
                });
                
                // 应用新圆角
                $item.addClass('ffs-position-radius-' + direction + '-' + radius);
                
                // 触发圆角变更事件
                $item.trigger('position:radius-changed', [radius, direction]);
                
                return $item;
            },
            
            /**
             * 设置元素透明度
             * @param {string} selector - 元素选择器
             * @param {string} opacity - 透明度：0, 25, 50, 75, 100
             */
            setOpacity: function(selector, opacity) {
                const $item = $(selector);
                
                if (!$item.length || opacity === undefined) return;
                
                // 移除所有透明度类
                $item.removeClass('ffs-position-opacity-0 ffs-position-opacity-25 ffs-position-opacity-50 ffs-position-opacity-75 ffs-position-opacity-100');
                
                // 应用新透明度
                $item.addClass('ffs-position-opacity-' + opacity);
                
                // 触发透明度变更事件
                $item.trigger('position:opacity-changed', [opacity]);
                
                return $item;
            },
            
            /**
             * 设置元素旋转
             * @param {string} selector - 元素选择器
             * @param {number} degree - 旋转角度
             */
            setRotation: function(selector, degree) {
                const $item = $(selector);
                
                if (!$item.length || degree === undefined) return;
                
                // 应用旋转
                $item.css('transform', 'rotate(' + degree + 'deg)');
                
                // 触发旋转变更事件
                $item.trigger('position:rotation-changed', [degree]);
                
                return $item;
            },
            
            /**
             * 设置元素缩放
             * @param {string} selector - 元素选择器
             * @param {number} scale - 缩放比例
             */
            setScale: function(selector, scale) {
                const $item = $(selector);
                
                if (!$item.length || scale === undefined) return;
                
                // 应用缩放
                $item.css('transform', 'scale(' + scale + ')');
                
                // 触发缩放变更事件
                $item.trigger('position:scale-changed', [scale]);
                
                return $item;
            },
            
            /**
             * 设置元素变换原点
             * @param {string} selector - 元素选择器
             * @param {string} origin - 变换原点：center, top, bottom, left, right, top-left, top-right, bottom-left, bottom-right
             */
            setTransformOrigin: function(selector, origin) {
                const $item = $(selector);
                
                if (!$item.length || !origin) return;
                
                // 应用变换原点
                $item.css('transform-origin', origin);
                
                // 触发变换原点变更事件
                $item.trigger('position:transform-origin-changed', [origin]);
                
                return $item;
            },
            
            /**
             * 设置元素过渡效果
             * @param {string} selector - 元素选择器
             * @param {string} property - 过渡属性：all, transform, opacity, background, etc.
             * @param {number} duration - 过渡持续时间（毫秒）
             * @param {string} timing - 过渡时间函数：ease, linear, ease-in, ease-out, ease-in-out
             */
            setTransition: function(selector, property, duration, timing) {
                const $item = $(selector);
                
                if (!$item.length || !property || !duration) return;
                
                // 默认时间函数
                timing = timing || 'ease';
                
                // 应用过渡效果
                $item.css('transition', property + ' ' + duration + 'ms ' + timing);
                
                // 触发过渡效果变更事件
                $item.trigger('position:transition-changed', [property, duration, timing]);
                
                return $item;
            },
            
            /**
             * 设置元素背景色
             * @param {string} selector - 元素选择器
             * @param {string} color - 背景色
             */
            setBackgroundColor: function(selector, color) {
                const $item = $(selector);
                
                if (!$item.length || !color) return;
                
                // 应用背景色
                $item.css('background-color', color);
                
                // 触发背景色变更事件
                $item.trigger('position:background-color-changed', [color]);
                
                return $item;
            },
            
            /**
             * 设置元素文本颜色
             * @param {string} selector - 元素选择器
             * @param {string} color - 文本颜色
             */
            setTextColor: function(selector, color) {
                const $item = $(selector);
                
                if (!$item.length || !color) return;
                
                // 应用文本颜色
                $item.css('color', color);
                
                // 触发文本颜色变更事件
                $item.trigger('position:text-color-changed', [color]);
                
                return $item;
            },
            
            /**
             * 设置元素层叠顺序
             * @param {string} selector - 元素选择器
             * @param {number} order - 层叠顺序
             */
            setOrder: function(selector, order) {
                const $item = $(selector);
                
                if (!$item.length || order === undefined) return;
                
                // 应用层叠顺序
                $item.css('order', order);
                
                // 触发层叠顺序变更事件
                $item.trigger('position:order-changed', [order]);
                
                return $item;
            },
            
            /**
             * 设置元素弹性伸缩
             * @param {string} selector - 元素选择器
             * @param {number} grow - 弹性伸缩比例
             */
            setFlexGrow: function(selector, grow) {
                const $item = $(selector);
                
                if (!$item.length || grow === undefined) return;
                
                // 应用弹性伸缩
                $item.css('flex-grow', grow);
                
                // 触发弹性伸缩变更事件
                $item.trigger('position:flex-grow-changed', [grow]);
                
                return $item;
            },
            
            /**
             * 设置元素弹性收缩
             * @param {string} selector - 元素选择器
             * @param {number} shrink - 弹性收缩比例
             */
            setFlexShrink: function(selector, shrink) {
                const $item = $(selector);
                
                if (!$item.length || shrink === undefined) return;
                
                // 应用弹性收缩
                $item.css('flex-shrink', shrink);
                
                // 触发弹性收缩变更事件
                $item.trigger('position:flex-shrink-changed', [shrink]);
                
                return $item;
            },
            
            /**
             * 设置元素弹性基准
             * @param {string} selector - 元素选择器
             * @param {string} basis - 弹性基准
             */
            setFlexBasis: function(selector, basis) {
                const $item = $(selector);
                
                if (!$item.length || !basis) return;
                
                // 应用弹性基准
                $item.css('flex-basis', basis);
                
                // 触发弹性基准变更事件
                $item.trigger('position:flex-basis-changed', [basis]);
                
                return $item;
            },
            
            /**
             * 设置元素网格区域
             * @param {string} selector - 元素选择器
             * @param {string} area - 网格区域
             */
            setGridArea: function(selector, area) {
                const $item = $(selector);
                
                if (!$item.length || !area) return;
                
                // 应用网格区域
                $item.css('grid-area', area);
                
                // 触发网格区域变更事件
                $item.trigger('position:grid-area-changed', [area]);
                
                return $item;
            }
        };
    }
})(jQuery);