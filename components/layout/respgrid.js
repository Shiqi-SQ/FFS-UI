/**
 * FFS UI - 响应式栅格组件
 * 提供响应式栅格布局的交互功能，包括动态调整、布局切换和栅格操作
 */
(function ($) {
    'use strict';

    /**
     * 初始化响应式栅格
     * 处理栅格布局的响应式调整
     */
    function initResponsiveGrid() {
        // 窗口大小变化时调整栅格布局
        $(window).on('resize', function () {
            adjustGridLayout();
        });

        // 初始调整栅格布局
        adjustGridLayout();

        // 栅格布局调整函数
        function adjustGridLayout() {
            const windowWidth = window.innerWidth;

            // 自定义断点处理
            $('.ffs-grid[data-breakpoints]').each(function () {
                const $grid = $(this);
                try {
                    const breakpoints = JSON.parse($grid.attr('data-breakpoints'));

                    // 移除所有列数类
                    $grid.removeClass(function (index, className) {
                        return (className.match(/ffs-grid-cols-\d+/g) || []).join(' ');
                    });

                    // 应用对应断点的列数
                    let appliedClass = '';
                    for (const breakpoint in breakpoints) {
                        if (windowWidth <= parseInt(breakpoint)) {
                            appliedClass = `ffs-grid-cols-${breakpoints[breakpoint]}`;
                            break;
                        }
                    }

                    // 如果没有匹配的断点，使用默认值
                    if (!appliedClass && breakpoints.default) {
                        appliedClass = `ffs-grid-cols-${breakpoints.default}`;
                    }

                    if (appliedClass) {
                        $grid.addClass(appliedClass);
                    }
                } catch (e) {
                    console.error('栅格断点配置解析错误:', e);
                }
            });
        }
    }

    /**
     * 栅格布局API
     * 提供操作栅格布局的方法
     */
    $.ffsGrid = {
        /**
         * 设置栅格列数
         * @param {string} selector - 栅格选择器
         * @param {number} columns - 列数
         */
        setColumns: function (selector, columns) {
            const $grid = $(selector);

            if (!$grid.length || !columns) return;

            // 移除所有列数类
            $grid.removeClass(function (index, className) {
                return (className.match(/ffs-grid-cols-\d+/g) || []).join(' ');
            });

            // 应用新列数
            $grid.addClass(`ffs-grid-cols-${columns}`);

            // 触发列数变更事件
            $grid.trigger('grid:columns-changed', [columns]);

            return $grid;
        },

        /**
         * 设置栅格行数
         * @param {string} selector - 栅格选择器
         * @param {number} rows - 行数
         */
        setRows: function (selector, rows) {
            const $grid = $(selector);

            if (!$grid.length || !rows) return;

            // 移除所有行数类
            $grid.removeClass(function (index, className) {
                return (className.match(/ffs-grid-rows-\d+/g) || []).join(' ');
            });

            // 应用新行数
            $grid.addClass(`ffs-grid-rows-${rows}`);

            // 触发行数变更事件
            $grid.trigger('grid:rows-changed', [rows]);

            return $grid;
        },

        /**
         * 设置栅格间距
         * @param {string} selector - 栅格选择器
         * @param {number} gap - 间距大小
         */
        setGap: function (selector, gap) {
            const $grid = $(selector);

            if (!$grid.length || gap === undefined) return;

            // 移除所有间距类
            $grid.removeClass(function (index, className) {
                return (className.match(/ffs-gap-\d+/g) || []).join(' ');
            });

            // 应用新间距
            $grid.addClass(`ffs-gap-${gap}`);

            // 触发间距变更事件
            $grid.trigger('grid:gap-changed', [gap]);

            return $grid;
        },

        /**
         * 设置栅格项跨列
         * @param {string} selector - 栅格项选择器
         * @param {number} span - 跨列数
         */
        setColSpan: function (selector, span) {
            const $item = $(selector);

            if (!$item.length || !span) return;

            // 移除所有跨列类
            $item.removeClass(function (index, className) {
                return (className.match(/ffs-col-span-\d+/g) || []).join(' ');
            });

            // 应用新跨列数
            $item.addClass(`ffs-col-span-${span}`);

            // 触发跨列变更事件
            $item.trigger('grid:col-span-changed', [span]);

            return $item;
        },

        /**
         * 设置栅格项跨行
         * @param {string} selector - 栅格项选择器
         * @param {number} span - 跨行数
         */
        setRowSpan: function (selector, span) {
            const $item = $(selector);

            if (!$item.length || !span) return;

            // 移除所有跨行类
            $item.removeClass(function (index, className) {
                return (className.match(/ffs-row-span-\d+/g) || []).join(' ');
            });

            // 应用新跨行数
            $item.addClass(`ffs-row-span-${span}`);

            // 触发跨行变更事件
            $item.trigger('grid:row-span-changed', [span]);

            return $item;
        },

        /**
         * 设置栅格项起始位置
         * @param {string} selector - 栅格项选择器
         * @param {number} start - 起始位置
         * @param {string} direction - 方向：col, row
         */
        setStart: function (selector, start, direction) {
            const $item = $(selector);

            if (!$item.length || !start || !direction) return;

            // 移除相关起始位置类
            const pattern = direction === 'col' ? /ffs-col-start-\d+/g : /ffs-row-start-\d+/g;
            $item.removeClass(function (index, className) {
                return (className.match(pattern) || []).join(' ');
            });

            // 应用新起始位置
            $item.addClass(`ffs-${direction}-start-${start}`);

            // 触发起始位置变更事件
            $item.trigger(`grid:${direction}-start-changed`, [start]);

            return $item;
        },

        /**
         * 设置栅格对齐方式
         * @param {string} selector - 栅格选择器
         * @param {string} alignment - 对齐方式：start, center, end, stretch
         */
        setAlignment: function (selector, alignment) {
            const $grid = $(selector);

            if (!$grid.length || !alignment) return;

            // 移除所有对齐类
            $grid.removeClass('ffs-grid-start ffs-grid-center ffs-grid-end ffs-grid-stretch');

            // 应用新对齐方式
            $grid.addClass(`ffs-grid-${alignment}`);

            // 触发对齐方式变更事件
            $grid.trigger('grid:alignment-changed', [alignment]);

            return $grid;
        },

        /**
         * 设置栅格项对齐方式
         * @param {string} selector - 栅格选择器
         * @param {string} alignment - 对齐方式：start, center, end, stretch
         */
        setItemsAlignment: function (selector, alignment) {
            const $grid = $(selector);

            if (!$grid.length || !alignment) return;

            // 移除所有项对齐类
            $grid.removeClass('ffs-grid-items-start ffs-grid-items-center ffs-grid-items-end ffs-grid-items-stretch');

            // 应用新项对齐方式
            $grid.addClass(`ffs-grid-items-${alignment}`);

            // 触发项对齐方式变更事件
            $grid.trigger('grid:items-alignment-changed', [alignment]);

            return $grid;
        },

        /**
         * 设置栅格内容对齐方式
         * @param {string} selector - 栅格选择器
         * @param {string} alignment - 对齐方式：start, center, end, between, around, evenly
         */
        setContentAlignment: function (selector, alignment) {
            const $grid = $(selector);

            if (!$grid.length || !alignment) return;

            // 移除所有内容对齐类
            $grid.removeClass('ffs-grid-content-start ffs-grid-content-center ffs-grid-content-end ffs-grid-content-between ffs-grid-content-around ffs-grid-content-evenly');

            // 应用新内容对齐方式
            $grid.addClass(`ffs-grid-content-${alignment}`);

            // 触发内容对齐方式变更事件
            $grid.trigger('grid:content-alignment-changed', [alignment]);

            return $grid;
        },

        /**
         * 切换自动填充/自动适应模式
         * @param {string} selector - 栅格选择器
         * @param {string} mode - 模式：auto-fill, auto-fit
         * @param {number} minWidth - 最小宽度（像素）
         */
        setAutoMode: function (selector, mode, minWidth) {
            const $grid = $(selector);

            if (!$grid.length || !mode) return;

            // 移除自动模式类
            $grid.removeClass('ffs-grid-auto-fill ffs-grid-auto-fit');

            // 移除列数类
            $grid.removeClass(function (index, className) {
                return (className.match(/ffs-grid-cols-\d+/g) || []).join(' ');
            });

            // 应用新自动模式
            $grid.addClass(`ffs-grid-${mode}`);

            // 如果提供了最小宽度，设置自定义样式
            if (minWidth) {
                $grid.css('grid-template-columns', `repeat(${mode}, minmax(${minWidth}px, 1fr))`);
            }

            // 触发自动模式变更事件
            $grid.trigger('grid:auto-mode-changed', [mode, minWidth]);

            return $grid;
        },

        /**
         * 设置自定义断点
         * @param {string} selector - 栅格选择器
         * @param {object} breakpoints - 断点配置，如 {768: 2, 992: 3, default: 4}
         */
        setBreakpoints: function (selector, breakpoints) {
            const $grid = $(selector);

            if (!$grid.length || !breakpoints) return;

            // 设置断点数据属性
            $grid.attr('data-breakpoints', JSON.stringify(breakpoints));

            // 立即应用断点
            const windowWidth = window.innerWidth;

            // 移除所有列数类
            $grid.removeClass(function (index, className) {
                return (className.match(/ffs-grid-cols-\d+/g) || []).join(' ');
            });

            // 应用对应断点的列数
            let appliedClass = '';
            for (const breakpoint in breakpoints) {
                if (breakpoint !== 'default' && windowWidth <= parseInt(breakpoint)) {
                    appliedClass = `ffs-grid-cols-${breakpoints[breakpoint]}`;
                    break;
                }
            }

            // 如果没有匹配的断点，使用默认值
            if (!appliedClass && breakpoints.default) {
                appliedClass = `ffs-grid-cols-${breakpoints.default}`;
            }

            if (appliedClass) {
                $grid.addClass(appliedClass);
            }

            // 触发断点变更事件
            $grid.trigger('grid:breakpoints-changed', [breakpoints]);

            return $grid;
        },

        /**
         * 添加栅格项
         * @param {string} selector - 栅格选择器
         * @param {string|jQuery} content - 栅格项内容
         * @param {object} options - 配置选项
         */
        addItem: function (selector, content, options = {}) {
            const $grid = $(selector);

            if (!$grid.length || !content) return;

            // 创建栅格项
            const $item = $('<div class="ffs-grid-item"></div>');

            // 添加内容
            if (typeof content === 'string') {
                $item.html(content);
            } else {
                $item.append(content);
            }

            // 应用配置选项
            if (options.colSpan) {
                $item.addClass(`ffs-col-span-${options.colSpan}`);
            }

            if (options.rowSpan) {
                $item.addClass(`ffs-row-span-${options.rowSpan}`);
            }

            if (options.colStart) {
                $item.addClass(`ffs-col-start-${options.colStart}`);
            }

            if (options.rowStart) {
                $item.addClass(`ffs-row-start-${options.rowStart}`);
            }

            if (options.className) {
                $item.addClass(options.className);
            }

            // 添加到栅格
            $grid.append($item);

            // 触发项添加事件
            $grid.trigger('grid:item-added', [$item, options]);

            return $item;
        },

        /**
         * 移除栅格项
         * @param {string} selector - 栅格项选择器
         */
        removeItem: function (selector) {
            const $item = $(selector);

            if (!$item.length) return;

            // 获取父栅格
            const $grid = $item.closest('.ffs-grid');

            // 触发项移除事件
            $grid.trigger('grid:item-removing', [$item]);

            // 移除项
            $item.remove();

            // 触发项已移除事件
            $grid.trigger('grid:item-removed');

            return $grid;
        },

        /**
         * 清空栅格
         * @param {string} selector - 栅格选择器
         */
        clear: function (selector) {
            const $grid = $(selector);

            if (!$grid.length) return;

            // 触发清空事件
            $grid.trigger('grid:clearing');

            // 移除所有栅格项
            $grid.find('.ffs-grid-item').remove();

            // 触发已清空事件
            $grid.trigger('grid:cleared');

            return $grid;
        },

        /**
         * 获取栅格配置
         * @param {string} selector - 栅格选择器
         * @returns {object} 栅格配置
         */
        getConfig: function (selector) {
            const $grid = $(selector);

            if (!$grid.length) return null;

            // 获取列数
            let columns = null;
            const colsClass = $grid.attr('class').match(/ffs-grid-cols-(\d+)/);
            if (colsClass) {
                columns = parseInt(colsClass[1]);
            }

            // 获取行数
            let rows = null;
            const rowsClass = $grid.attr('class').match(/ffs-grid-rows-(\d+)/);
            if (rowsClass) {
                rows = parseInt(rowsClass[1]);
            }

            // 获取间距
            let gap = null;
            const gapClass = $grid.attr('class').match(/ffs-gap-(\d+)/);
            if (gapClass) {
                gap = parseInt(gapClass[1]);
            }

            // 获取对齐方式
            let alignment = null;
            if ($grid.hasClass('ffs-grid-start')) {
                alignment = 'start';
            } else if ($grid.hasClass('ffs-grid-center')) {
                alignment = 'center';
            } else if ($grid.hasClass('ffs-grid-end')) {
                alignment = 'end';
            } else if ($grid.hasClass('ffs-grid-stretch')) {
                alignment = 'stretch';
            }

            // 获取项对齐方式
            let itemsAlignment = null;
            if ($grid.hasClass('ffs-grid-items-start')) {
                itemsAlignment = 'start';
            } else if ($grid.hasClass('ffs-grid-items-center')) {
                itemsAlignment = 'center';
            } else if ($grid.hasClass('ffs-grid-items-end')) {
                itemsAlignment = 'end';
            } else if ($grid.hasClass('ffs-grid-items-stretch')) {
                itemsAlignment = 'stretch';
            }

            // 获取内容对齐方式
            let contentAlignment = null;
            if ($grid.hasClass('ffs-grid-content-start')) {
                contentAlignment = 'start';
            } else if ($grid.hasClass('ffs-grid-content-center')) {
                contentAlignment = 'center';
            } else if ($grid.hasClass('ffs-grid-content-end')) {
                contentAlignment = 'end';
            } else if ($grid.hasClass('ffs-grid-content-between')) {
                contentAlignment = 'between';
            } else if ($grid.hasClass('ffs-grid-content-around')) {
                contentAlignment = 'around';
            } else if ($grid.hasClass('ffs-grid-content-evenly')) {
                contentAlignment = 'evenly';
            }

            // 获取自动模式
            let autoMode = null;
            if ($grid.hasClass('ffs-grid-auto-fill')) {
                autoMode = 'auto-fill';
            } else if ($grid.hasClass('ffs-grid-auto-fit')) {
                autoMode = 'auto-fit';
            }

            // 获取断点配置
            let breakpoints = null;
            const breakpointsAttr = $grid.attr('data-breakpoints');
            if (breakpointsAttr) {
                try {
                    breakpoints = JSON.parse(breakpointsAttr);
                } catch (e) {
                    console.error('断点配置解析错误:', e);
                }
            }

            // 返回配置对象
            return {
                columns: columns,
                rows: rows,
                gap: gap,
                alignment: alignment,
                itemsAlignment: itemsAlignment,
                contentAlignment: contentAlignment,
                autoMode: autoMode,
                breakpoints: breakpoints
            };
        },

        /**
         * 应用栅格配置
         * @param {string} selector - 栅格选择器
         * @param {object} config - 栅格配置
         */
        applyConfig: function (selector, config) {
            const $grid = $(selector);

            if (!$grid.length || !config) return;

            // 应用列数
            if (config.columns) {
                this.setColumns(selector, config.columns);
            }

            // 应用行数
            if (config.rows) {
                this.setRows(selector, config.rows);
            }

            // 应用间距
            if (config.gap !== undefined) {
                this.setGap(selector, config.gap);
            }

            // 应用对齐方式
            if (config.alignment) {
                this.setAlignment(selector, config.alignment);
            }

            // 应用项对齐方式
            if (config.itemsAlignment) {
                this.setItemsAlignment(selector, config.itemsAlignment);
            }

            // 应用内容对齐方式
            if (config.contentAlignment) {
                this.setContentAlignment(selector, config.contentAlignment);
            }

            // 应用自动模式
            if (config.autoMode) {
                this.setAutoMode(selector, config.autoMode);
            }

            // 应用断点配置
            if (config.breakpoints) {
                this.setBreakpoints(selector, config.breakpoints);
            }

            // 触发配置应用事件
            $grid.trigger('grid:config-applied', [config]);

            return $grid;
        },

        /**
         * 导出栅格配置为JSON
         * @param {string} selector - 栅格选择器
         * @returns {string} JSON字符串
         */
        exportConfig: function (selector) {
            const config = this.getConfig(selector);

            if (!config) return null;

            return JSON.stringify(config, null, 2);
        },

        /**
         * 导入栅格配置
         * @param {string} selector - 栅格选择器
         * @param {string} json - JSON字符串
         */
        importConfig: function (selector, json) {
            if (!json) return;

            try {
                const config = JSON.parse(json);
                this.applyConfig(selector, config);
            } catch (e) {
                console.error('配置导入错误:', e);
            }
        },

        /**
         * 创建响应式栅格
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        create: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 创建栅格容器
            const $grid = $('<div class="ffs-grid"></div>');

            // 应用配置选项
            if (options.columns) {
                $grid.addClass(`ffs-grid-cols-${options.columns}`);
            }

            if (options.rows) {
                $grid.addClass(`ffs-grid-rows-${options.rows}`);
            }

            if (options.gap !== undefined) {
                $grid.addClass(`ffs-gap-${options.gap}`);
            }

            if (options.alignment) {
                $grid.addClass(`ffs-grid-${options.alignment}`);
            }

            if (options.itemsAlignment) {
                $grid.addClass(`ffs-grid-items-${options.itemsAlignment}`);
            }

            if (options.contentAlignment) {
                $grid.addClass(`ffs-grid-content-${options.contentAlignment}`);
            }

            if (options.autoMode) {
                $grid.addClass(`ffs-grid-${options.autoMode}`);
            }

            if (options.breakpoints) {
                $grid.attr('data-breakpoints', JSON.stringify(options.breakpoints));
            }

            if (options.className) {
                $grid.addClass(options.className);
            }

            // 添加到容器
            $container.append($grid);

            // 添加栅格项
            if (options.items && Array.isArray(options.items)) {
                options.items.forEach(item => {
                    this.addItem($grid, item.content, item.options || {});
                });
            }

            // 触发创建事件
            $container.trigger('grid:created', [$grid, options]);

            return $grid;
        }
    };

    // 初始化响应式栅格
    $(function () {
        initResponsiveGrid();
    });

})(jQuery);