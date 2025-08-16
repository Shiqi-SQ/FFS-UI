/**
 * FFS UI - 弹性布局组件
 * 提供弹性布局的交互功能，包括动态调整、排序和布局切换
 */
(function ($) {
    'use strict';

    /**
     * 初始化弹性布局
     * 处理弹性布局的响应式调整
     */
    function initFlexLayout() {
        // 窗口大小变化时调整弹性布局
        $(window).on('resize', function () {
            adjustFlexLayout();
        });

        // 初始调整弹性布局
        adjustFlexLayout();

        // 弹性布局调整函数
        function adjustFlexLayout() {
            const windowWidth = window.innerWidth;

            // 根据窗口宽度调整弹性布局
            if (windowWidth <= 768) {
                // 移动设备视图
                $('.ffs-flex[data-mobile-direction]').each(function () {
                    const $flex = $(this);
                    const mobileDirection = $flex.data('mobile-direction');

                    // 保存原始方向
                    if (!$flex.data('original-direction')) {
                        const originalDirection = $flex.hasClass('ffs-flex-col') ? 'column' :
                            $flex.hasClass('ffs-flex-row-reverse') ? 'row-reverse' :
                            $flex.hasClass('ffs-flex-col-reverse') ? 'column-reverse' : 'row';
                        $flex.data('original-direction', originalDirection);
                    }

                    // 应用移动设备方向
                    $flex.removeClass('ffs-flex-row ffs-flex-col ffs-flex-row-reverse ffs-flex-col-reverse');

                    if (mobileDirection === 'column') {
                        $flex.addClass('ffs-flex-col');
                    } else if (mobileDirection === 'row') {
                        $flex.addClass('ffs-flex-row');
                    } else if (mobileDirection === 'column-reverse') {
                        $flex.addClass('ffs-flex-col-reverse');
                    } else if (mobileDirection === 'row-reverse') {
                        $flex.addClass('ffs-flex-row-reverse');
                    }
                });

                // 处理移动设备下的弹性项
                $('.ffs-flex-item[data-mobile-order]').each(function () {
                    const $item = $(this);
                    const mobileOrder = $item.data('mobile-order');

                    // 保存原始顺序
                    if (!$item.data('original-order')) {
                        let originalOrder = 0;
                        for (let i = 1; i <= 6; i++) {
                            if ($item.hasClass('ffs-order-' + i)) {
                                originalOrder = i;
                                break;
                            }
                        }
                        $item.data('original-order', originalOrder);
                    }

                    // 应用移动设备顺序
                    for (let i = 1; i <= 6; i++) {
                        $item.removeClass('ffs-order-' + i);
                    }

                    if (mobileOrder > 0) {
                        $item.addClass('ffs-order-' + mobileOrder);
                    }
                });
            } else {
                // 桌面设备视图
                $('.ffs-flex[data-mobile-direction]').each(function () {
                    const $flex = $(this);
                    const originalDirection = $flex.data('original-direction');

                    if (originalDirection) {
                        // 恢复原始方向
                        $flex.removeClass('ffs-flex-row ffs-flex-col ffs-flex-row-reverse ffs-flex-col-reverse');

                        if (originalDirection === 'column') {
                            $flex.addClass('ffs-flex-col');
                        } else if (originalDirection === 'row') {
                            $flex.addClass('ffs-flex-row');
                        } else if (originalDirection === 'column-reverse') {
                            $flex.addClass('ffs-flex-col-reverse');
                        } else if (originalDirection === 'row-reverse') {
                            $flex.addClass('ffs-flex-row-reverse');
                        }
                    }
                });

                // 恢复弹性项原始顺序
                $('.ffs-flex-item[data-mobile-order]').each(function () {
                    const $item = $(this);
                    const originalOrder = $item.data('original-order');

                    // 移除所有顺序类
                    for (let i = 1; i <= 6; i++) {
                        $item.removeClass('ffs-order-' + i);
                    }

                    // 应用原始顺序
                    if (originalOrder > 0) {
                        $item.addClass('ffs-order-' + originalOrder);
                    }
                });
            }
        }
    }

    /**
     * 初始化弹性项排序
     * 提供弹性项的动态排序功能
     */
    function initFlexItemOrder() {
        // 排序按钮点击事件
        $(document).on('click', '[data-flex-sort]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-target') || $btn.closest('.ffs-flex');
            const $flex = $(target);
            const sortBy = $btn.data('flex-sort');

            if (!$flex.length || !sortBy) return;

            // 获取所有弹性项
            const $items = $flex.children('.ffs-flex-item');

            // 根据排序方式排序
            if (sortBy === 'asc' || sortBy === 'desc') {
                // 按照文本内容排序
                const items = $items.get();
                items.sort(function (a, b) {
                    const textA = $(a).text().trim().toLowerCase();
                    const textB = $(b).text().trim().toLowerCase();

                    if (sortBy === 'asc') {
                        return textA.localeCompare(textB);
                    } else {
                        return textB.localeCompare(textA);
                    }
                });

                // 重新添加排序后的项
                $.each(items, function (index, item) {
                    $flex.append(item);
                });
            } else if (sortBy === 'order') {
                // 按照 order 属性排序
                const items = $items.get();
                items.sort(function (a, b) {
                    const orderA = parseInt($(a).css('order')) || 0;
                    const orderB = parseInt($(b).css('order')) || 0;

                    return orderA - orderB;
                });

                // 重新添加排序后的项
                $.each(items, function (index, item) {
                    $flex.append(item);
                });
            } else if (sortBy === 'random') {
                // 随机排序
                const items = $items.get();
                items.sort(function () {
                    return 0.5 - Math.random();
                });

                // 重新添加排序后的项
                $.each(items, function (index, item) {
                    $flex.append(item);
                });
            }

            // 触发排序完成事件
            $flex.trigger('flex:sorted', [sortBy]);
        });
    }

    /**
     * 初始化弹性布局切换
     * 提供弹性布局的动态切换功能
     */
    function initFlexLayoutSwitch() {
        // 布局切换按钮点击事件
        $(document).on('click', '[data-flex-layout]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-target') || $btn.closest('.ffs-flex');
            const $flex = $(target);
            const layout = $btn.data('flex-layout');

            if (!$flex.length || !layout) return;

            // 移除所有方向类
            $flex.removeClass('ffs-flex-row ffs-flex-col ffs-flex-row-reverse ffs-flex-col-reverse');

            // 应用新布局
            if (layout === 'row') {
                $flex.addClass('ffs-flex-row');
            } else if (layout === 'column') {
                $flex.addClass('ffs-flex-col');
            } else if (layout === 'row-reverse') {
                $flex.addClass('ffs-flex-row-reverse');
            } else if (layout === 'column-reverse') {
                $flex.addClass('ffs-flex-col-reverse');
            }

            // 更新按钮状态
            $('[data-flex-layout]').removeClass('active');
            $btn.addClass('active');

            // 触发布局切换事件
            $flex.trigger('flex:layout-changed', [layout]);
        });

        // 对齐方式切换按钮点击事件
        $(document).on('click', '[data-flex-justify]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-target') || $btn.closest('.ffs-flex');
            const $flex = $(target);
            const justify = $btn.data('flex-justify');

            if (!$flex.length || !justify) return;

            // 移除所有主轴对齐类
            $flex.removeClass('ffs-justify-start ffs-justify-end ffs-justify-center ffs-justify-between ffs-justify-around ffs-justify-evenly');

            // 应用新对齐方式
            $flex.addClass('ffs-justify-' + justify);

            // 更新按钮状态
            $('[data-flex-justify]').removeClass('active');
            $btn.addClass('active');

            // 触发对齐方式切换事件
            $flex.trigger('flex:justify-changed', [justify]);
        });

        // 交叉轴对齐方式切换按钮点击事件
        $(document).on('click', '[data-flex-items]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-target') || $btn.closest('.ffs-flex');
            const $flex = $(target);
            const items = $btn.data('flex-items');

            if (!$flex.length || !items) return;

            // 移除所有交叉轴对齐类
            $flex.removeClass('ffs-items-start ffs-items-end ffs-items-center ffs-items-baseline ffs-items-stretch');

            // 应用新对齐方式
            $flex.addClass('ffs-items-' + items);

            // 更新按钮状态
            $('[data-flex-items]').removeClass('active');
            $btn.addClass('active');

            // 触发交叉轴对齐方式切换事件
            $flex.trigger('flex:items-changed', [items]);
        });

        // 换行方式切换按钮点击事件
        $(document).on('click', '[data-flex-wrap]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-target') || $btn.closest('.ffs-flex');
            const $flex = $(target);
            const wrap = $btn.data('flex-wrap');

            if (!$flex.length) return;

            // 移除所有换行类
            $flex.removeClass('ffs-flex-wrap ffs-flex-nowrap ffs-flex-wrap-reverse');

            // 应用新换行方式
            if (wrap) {
                $flex.addClass('ffs-flex-' + wrap);
            }

            // 更新按钮状态
            $('[data-flex-wrap]').removeClass('active');
            $btn.addClass('active');

            // 触发换行方式切换事件
            $flex.trigger('flex:wrap-changed', [wrap]);
        });
    }

    /**
     * 初始化弹性项动态添加/删除
     * 提供弹性项的动态添加和删除功能
     */
    function initFlexItemDynamic() {
        // 添加弹性项按钮点击事件
        $(document).on('click', '[data-flex-add]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-target') || $btn.closest('.ffs-flex');
            const $flex = $(target);

            if (!$flex.length) return;

            // 创建新弹性项
            const $newItem = $('<div class="ffs-flex-item">新项目</div>');

            // 添加到弹性容器
            $flex.append($newItem);

            // 触发项目添加事件
            $flex.trigger('flex:item-added', [$newItem]);
        });

        // 删除弹性项按钮点击事件
        $(document).on('click', '[data-flex-remove]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-item') || $btn.closest('.ffs-flex-item');
            const $item = $(target);

            if (!$item.length) return;

            // 获取父容器
            const $flex = $item.parent('.ffs-flex');

            // 删除弹性项
            $item.remove();

            // 触发项目删除事件
            if ($flex.length) {
                $flex.trigger('flex:item-removed');
            }
        });
    }

    /**
     * 初始化弹性间距控制
     * 提供弹性布局间距的动态调整功能
     */
    function initFlexGap() {
        // 间距调整按钮点击事件
        $(document).on('click', '[data-flex-gap]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-target') || $btn.closest('.ffs-flex');
            const $flex = $(target);
            const gap = $btn.data('flex-gap');

            if (!$flex.length || gap === undefined) return;

            // 移除所有间距类
            $flex.removeClass(function (index, className) {
                return (className.match(/(^|\s)ffs-gap-\S+/g) || []).join(' ');
            });

            // 应用新间距
            if (gap !== 'none' && gap !== '0') {
                $flex.addClass('ffs-gap-' + gap);
            }

            // 更新按钮状态
            $('[data-flex-gap]').removeClass('active');
            $btn.addClass('active');

            // 触发间距变更事件
            $flex.trigger('flex:gap-changed', [gap]);
        });

        // 间距滑块变化事件
        $(document).on('input', '[data-flex-gap-slider]', function () {
            const $slider = $(this);
            const target = $slider.data('flex-target') || $slider.closest('.ffs-flex');
            const $flex = $(target);
            const gap = $slider.val();

            if (!$flex.length) return;

            // 移除所有间距类
            $flex.removeClass(function (index, className) {
                return (className.match(/(^|\s)ffs-gap-\S+/g) || []).join(' ');
            });

            // 应用新间距
            if (gap > 0) {
                // 找到最接近的预定义间距
                let gapClass = '';
                if (gap <= 1) gapClass = '1';
                else if (gap <= 2) gapClass = '2';
                else if (gap <= 3) gapClass = '3';
                else if (gap <= 4) gapClass = '4';
                else if (gap <= 5) gapClass = '5';
                else if (gap <= 6) gapClass = '6';
                else if (gap <= 8) gapClass = '8';
                else if (gap <= 10) gapClass = '10';
                else if (gap <= 12) gapClass = '12';
                else gapClass = '16';

                $flex.addClass('ffs-gap-' + gapClass);
            }

            // 触发间距变更事件
            $flex.trigger('flex:gap-changed', [gap]);
        });
    }

    /**
     * 初始化弹性项对齐控制
     * 提供弹性项对齐方式的动态调整功能
     */
    function initFlexItemAlign() {
        // 弹性项对齐按钮点击事件
        $(document).on('click', '[data-flex-self]', function () {
            const $btn = $(this);
            const target = $btn.data('flex-item') || $btn.closest('.ffs-flex-item');
            const $item = $(target);
            const align = $btn.data('flex-self');

            if (!$item.length || !align) return;

            // 移除所有自对齐类
            $item.removeClass('ffs-self-auto ffs-self-start ffs-self-end ffs-self-center ffs-self-baseline ffs-self-stretch');

            // 应用新对齐方式
            $item.addClass('ffs-self-' + align);

            // 更新按钮状态
            $('[data-flex-self]').removeClass('active');
            $btn.addClass('active');

            // 触发对齐方式变更事件
            $item.trigger('flex:self-changed', [align]);
        });
    }

    /**
     * 初始化弹性布局响应式控制
     * 提供弹性布局在不同断点下的响应式控制
     */
    function initFlexResponsive() {
        // 响应式断点切换按钮点击事件
        $(document).on('click', '[data-flex-breakpoint]', function () {
            const $btn = $(this);
            const breakpoint = $btn.data('flex-breakpoint');

            if (!breakpoint) return;

            // 模拟不同断点的视口宽度
            let viewportWidth = 0;

            if (breakpoint === 'xs') {
                viewportWidth = 480;
            } else if (breakpoint === 'sm') {
                viewportWidth = 576;
            } else if (breakpoint === 'md') {
                viewportWidth = 768;
            } else if (breakpoint === 'lg') {
                viewportWidth = 992;
            } else if (breakpoint === 'xl') {
                viewportWidth = 1200;
            } else if (breakpoint === 'xxl') {
                viewportWidth = 1400;
            } else if (breakpoint === 'auto') {
                // 使用实际视口宽度
                viewportWidth = window.innerWidth;
            }

            // 更新按钮状态
            $('[data-flex-breakpoint]').removeClass('active');
            $btn.addClass('active');

            // 触发断点变更事件
            $(document).trigger('flex:breakpoint-changed', [breakpoint, viewportWidth]);

            // 如果不是自动模式，则模拟视口宽度
            if (breakpoint !== 'auto') {
                // 添加视口模拟类
                $('body').addClass('ffs-viewport-simulation');
                $('body').attr('data-simulated-width', viewportWidth);

                // 触发调整事件
                setTimeout(function () {
                    $(window).trigger('resize');
                }, 100);
            } else {
                // 移除视口模拟
                $('body').removeClass('ffs-viewport-simulation');
                $('body').removeAttr('data-simulated-width');

                // 触发调整事件
                setTimeout(function () {
                    $(window).trigger('resize');
                }, 100);
            }
        });
    }

    // 在文档加载完成后初始化弹性布局功能
    $(document).ready(function () {
        // 初始化弹性布局
        initFlexLayout();

        // 初始化弹性项排序
        initFlexItemOrder();

        // 初始化弹性布局切换
        initFlexLayoutSwitch();

        // 初始化弹性项动态添加/删除
        initFlexItemDynamic();

        // 初始化弹性间距控制
        initFlexGap();

        // 初始化弹性项对齐控制
        initFlexItemAlign();

        // 初始化弹性布局响应式控制
        initFlexResponsive();
    });

    // 暴露弹性布局API
    if (!window.FFS) {
        window.FFS = {};
    }

    if (!window.FFS.flex) {
        window.FFS.flex = {
            /**
             * 设置弹性布局方向
             * @param {string} selector - 选择器
             * @param {string} direction - 方向：row, column, row-reverse, column-reverse
             */
            setDirection: function (selector, direction) {
                const $flex = $(selector);

                if (!$flex.length || !direction) return;

                // 移除所有方向类
                $flex.removeClass('ffs-flex-row ffs-flex-col ffs-flex-row-reverse ffs-flex-col-reverse');

                // 应用新方向
                if (direction === 'row') {
                    $flex.addClass('ffs-flex-row');
                } else if (direction === 'column') {
                    $flex.addClass('ffs-flex-col');
                } else if (direction === 'row-reverse') {
                    $flex.addClass('ffs-flex-row-reverse');
                } else if (direction === 'column-reverse') {
                    $flex.addClass('ffs-flex-col-reverse');
                }

                // 触发方向变更事件
                $flex.trigger('flex:direction-changed', [direction]);

                return $flex;
            },

            /**
             * 设置弹性布局主轴对齐方式
             * @param {string} selector - 选择器
             * @param {string} justify - 对齐方式：start, end, center, between, around, evenly
             */
            setJustify: function (selector, justify) {
                const $flex = $(selector);

                if (!$flex.length || !justify) return;

                // 移除所有主轴对齐类
                $flex.removeClass('ffs-justify-start ffs-justify-end ffs-justify-center ffs-justify-between ffs-justify-around ffs-justify-evenly');

                // 应用新对齐方式
                $flex.addClass('ffs-justify-' + justify);

                // 触发对齐方式变更事件
                $flex.trigger('flex:justify-changed', [justify]);

                return $flex;
            },

            /**
             * 设置弹性布局交叉轴对齐方式
             * @param {string} selector - 选择器
             * @param {string} items - 对齐方式：start, end, center, baseline, stretch
             */
            setItems: function (selector, items) {
                const $flex = $(selector);

                if (!$flex.length || !items) return;

                // 移除所有交叉轴对齐类
                $flex.removeClass('ffs-items-start ffs-items-end ffs-items-center ffs-items-baseline ffs-items-stretch');

                // 应用新对齐方式
                $flex.addClass('ffs-items-' + items);

                // 触发对齐方式变更事件
                $flex.trigger('flex:items-changed', [items]);

                return $flex;
            },

            /**
             * 设置弹性布局换行方式
             * @param {string} selector - 选择器
             * @param {string} wrap - 换行方式：wrap, nowrap, wrap-reverse
             */
            setWrap: function (selector, wrap) {
                const $flex = $(selector);

                if (!$flex.length || !wrap) return;

                // 移除所有换行类
                $flex.removeClass('ffs-flex-wrap ffs-flex-nowrap ffs-flex-wrap-reverse');

                // 应用新换行方式
                $flex.addClass('ffs-flex-' + wrap);

                // 触发换行方式变更事件
                $flex.trigger('flex:wrap-changed', [wrap]);

                return $flex;
            },

            /**
             * 设置弹性布局间距
             * @param {string} selector - 选择器
             * @param {string|number} gap - 间距大小：1, 2, 3, 4, 5, 6, 8, 10, 12, 16
             */
            setGap: function (selector, gap) {
                const $flex = $(selector);

                if (!$flex.length) return;

                // 移除所有间距类
                $flex.removeClass(function (index, className) {
                    return (className.match(/(^|\s)ffs-gap-\S+/g) || []).join(' ');
                });

                // 应用新间距
                if (gap && gap !== 'none' && gap !== '0') {
                    $flex.addClass('ffs-gap-' + gap);
                }

                // 触发间距变更事件
                $flex.trigger('flex:gap-changed', [gap]);

                return $flex;
            },

            /**
             * 设置弹性项顺序
             * @param {string} selector - 选择器
             * @param {number} order - 顺序：1-6
             */
            setOrder: function (selector, order) {
                const $item = $(selector);

                if (!$item.length || order < 1 || order > 6) return;

                // 移除所有顺序类
                for (let i = 1; i <= 6; i++) {
                    $item.removeClass('ffs-order-' + i);
                }

                // 应用新顺序
                $item.addClass('ffs-order-' + order);

                // 触发顺序变更事件
                $item.trigger('flex:order-changed', [order]);

                return $item;
            },

            /**
             * 设置弹性项自对齐方式
             * @param {string} selector - 选择器
             * @param {string} align - 对齐方式：auto, start, end, center, baseline, stretch
             */
            setSelf: function (selector, align) {
                const $item = $(selector);

                if (!$item.length || !align) return;

                // 移除所有自对齐类
                $item.removeClass('ffs-self-auto ffs-self-start ffs-self-end ffs-self-center ffs-self-baseline ffs-self-stretch');

                // 应用新对齐方式
                $item.addClass('ffs-self-' + align);

                // 触发对齐方式变更事件
                $item.trigger('flex:self-changed', [align]);

                return $item;
            },

            /**
             * 添加弹性项
             * @param {string} selector - 容器选择器
             * @param {string} content - 项目内容
             * @param {object} options - 选项
             */
            addItem: function (selector, content, options) {
                const $flex = $(selector);

                if (!$flex.length) return;

                // 创建新弹性项
                const $newItem = $('<div class="ffs-flex-item"></div>');

                // 设置内容
                if (content) {
                    $newItem.html(content);
                }

                // 应用选项
                if (options) {
                    if (options.order && options.order >= 1 && options.order <= 6) {
                        $newItem.addClass('ffs-order-' + options.order);
                    }

                    if (options.self) {
                        $newItem.addClass('ffs-self-' + options.self);
                    }

                    if (options.flex) {
                        $newItem.css('flex', options.flex);
                    }

                    if (options.grow !== undefined) {
                        $newItem.css('flex-grow', options.grow);
                    }

                    if (options.shrink !== undefined) {
                        $newItem.css('flex-shrink', options.shrink);
                    }

                    if (options.basis !== undefined) {
                        $newItem.css('flex-basis', options.basis);
                    }

                    if (options.class) {
                        $newItem.addClass(options.class);
                    }
                }

                // 添加到弹性容器
                $flex.append($newItem);

                // 触发项目添加事件
                $flex.trigger('flex:item-added', [$newItem]);

                return $newItem;
            },

            /**
             * 移除弹性项
             * @param {string} selector - 项目选择器
             */
            removeItem: function (selector) {
                const $item = $(selector);

                if (!$item.length) return;

                // 获取父容器
                const $flex = $item.parent('.ffs-flex');

                // 删除弹性项
                $item.remove();

                // 触发项目删除事件
                if ($flex.length) {
                    $flex.trigger('flex:item-removed');
                }
            },

            /**
             * 排序弹性项
             * @param {string} selector - 容器选择器
             * @param {string} sortBy - 排序方式：asc, desc, order, random
             */
            sortItems: function (selector, sortBy) {
                const $flex = $(selector);

                if (!$flex.length || !sortBy) return;

                // 获取所有弹性项
                const $items = $flex.children('.ffs-flex-item');

                // 根据排序方式排序
                if (sortBy === 'asc' || sortBy === 'desc') {
                    // 按照文本内容排序
                    const items = $items.get();
                    items.sort(function (a, b) {
                        const textA = $(a).text().trim().toLowerCase();
                        const textB = $(b).text().trim().toLowerCase();

                        if (sortBy === 'asc') {
                            return textA.localeCompare(textB);
                        } else {
                            return textB.localeCompare(textA);
                        }
                    });

                    // 重新添加排序后的项
                    $.each(items, function (index, item) {
                        $flex.append(item);
                    });
                } else if (sortBy === 'order') {
                    // 按照 order 属性排序
                    const items = $items.get();
                    items.sort(function (a, b) {
                        const orderA = parseInt($(a).css('order')) || 0;
                        const orderB = parseInt($(b).css('order')) || 0;

                        return orderA - orderB;
                    });

                    // 重新添加排序后的项
                    $.each(items, function (index, item) {
                        $flex.append(item);
                    });
                } else if (sortBy === 'random') {
                    // 随机排序
                    const items = $items.get();
                    items.sort(function () {
                        return 0.5 - Math.random();
                    });

                    // 重新添加排序后的项
                    $.each(items, function (index, item) {
                        $flex.append(item);
                    });
                }

                // 触发排序完成事件
                $flex.trigger('flex:sorted', [sortBy]);

                return $flex;
            },

            /**
             * 获取弹性布局配置
             * @param {string} selector - 选择器
             * @returns {object} 弹性布局配置
             */
            getConfig: function (selector) {
                const $flex = $(selector);

                if (!$flex.length) return null;

                // 获取方向
                let direction = 'row';
                if ($flex.hasClass('ffs-flex-col')) {
                    direction = 'column';
                } else if ($flex.hasClass('ffs-flex-row-reverse')) {
                    direction = 'row-reverse';
                } else if ($flex.hasClass('ffs-flex-col-reverse')) {
                    direction = 'column-reverse';
                }

                // 获取主轴对齐方式
                let justify = 'start';
                if ($flex.hasClass('ffs-justify-end')) {
                    justify = 'end';
                } else if ($flex.hasClass('ffs-justify-center')) {
                    justify = 'center';
                } else if ($flex.hasClass('ffs-justify-between')) {
                    justify = 'between';
                } else if ($flex.hasClass('ffs-justify-around')) {
                    justify = 'around';
                } else if ($flex.hasClass('ffs-justify-evenly')) {
                    justify = 'evenly';
                }

                // 获取交叉轴对齐方式
                let items = 'stretch';
                if ($flex.hasClass('ffs-items-start')) {
                    items = 'start';
                } else if ($flex.hasClass('ffs-items-end')) {
                    items = 'end';
                } else if ($flex.hasClass('ffs-items-center')) {
                    items = 'center';
                } else if ($flex.hasClass('ffs-items-baseline')) {
                    items = 'baseline';
                }

                // 获取换行方式
                let wrap = 'nowrap';
                if ($flex.hasClass('ffs-flex-wrap')) {
                    wrap = 'wrap';
                } else if ($flex.hasClass('ffs-flex-wrap-reverse')) {
                    wrap = 'wrap-reverse';
                }

                // 获取间距
                let gap = '0';
                const gapMatch = $flex.attr('class').match(/ffs-gap-(\S+)/);
                if (gapMatch) {
                    gap = gapMatch[1];
                }

                // 返回配置
                return {
                    direction: direction,
                    justify: justify,
                    items: items,
                    wrap: wrap,
                    gap: gap,
                    itemCount: $flex.children('.ffs-flex-item').length
                };
            },

            /**
             * 应用弹性布局配置
             * @param {string} selector - 选择器
             * @param {object} config - 弹性布局配置
             */
            applyConfig: function (selector, config) {
                if (!config) return;

                const $flex = $(selector);

                if (!$flex.length) return;

                // 应用方向
                if (config.direction) {
                    this.setDirection(selector, config.direction);
                }

                // 应用主轴对齐方式
                if (config.justify) {
                    this.setJustify(selector, config.justify);
                }

                // 应用交叉轴对齐方式
                if (config.items) {
                    this.setItems(selector, config.items);
                }

                // 应用换行方式
                if (config.wrap) {
                    this.setWrap(selector, config.wrap);
                }

                // 应用间距
                if (config.gap) {
                    this.setGap(selector, config.gap);
                }

                return $flex;
            },

            /**
             * 创建弹性布局
             * @param {string} selector - 容器选择器
             * @param {object} config - 弹性布局配置
             * @param {array} items - 弹性项数组
             */
            create: function (selector, config, items) {
                const $container = $(selector);

                if (!$container.length) return;

                // 创建弹性容器
                const $flex = $('<div class="ffs-flex"></div>');

                // 应用配置
                if (config) {
                    this.applyConfig($flex, config);
                }

                // 添加弹性项
                if (items && items.length) {
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        const $item = this.addItem($flex, item.content, item.options);
                    }
                }

                // 添加到容器
                $container.append($flex);

                return $flex;
            }
        };
    }

})(jQuery);