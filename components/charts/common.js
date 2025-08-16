/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * FFS UI - 图表基础组件
 * 提供图表的基础交互功能，包括图表操作、工具提示、加载状态和图例控制等
 */
(function($) {
    'use strict';

    /**
     * 初始化图表操作按钮
     * 处理图表的刷新、导出、全屏等操作
     */
    function initChartActions() {
        // 刷新图表
        $(document).on('click', '.ffs-chart-action-btn[data-action="refresh"]', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            
            // 显示加载状态
            showChartLoading($chart);
            
            // 触发刷新事件
            $chart.trigger('chart:refresh');
            
            // 模拟刷新完成后隐藏加载状态（实际应用中应由事件回调处理）
            setTimeout(function() {
                hideChartLoading($chart);
            }, 1000);
        });
        
        // 导出图表
        $(document).on('click', '.ffs-chart-action-btn[data-action="export"]', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const format = $btn.data('format') || 'png';
            
            // 触发导出事件
            $chart.trigger('chart:export', [format]);
        });
        
        // 全屏显示图表
        $(document).on('click', '.ffs-chart-action-btn[data-action="fullscreen"]', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            
            // 切换全屏状态
            toggleChartFullscreen($chart);
        });
        
        // 图表设置
        $(document).on('click', '.ffs-chart-action-btn[data-action="settings"]', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            
            // 触发设置事件
            $chart.trigger('chart:settings');
        });
    }
    
    /**
     * 切换图表全屏显示
     * @param {jQuery} $chart 图表容器
     */
    function toggleChartFullscreen($chart) {
        const isFullscreen = $chart.hasClass('ffs-chart-fullscreen');
        
        if (isFullscreen) {
            // 退出全屏
            $chart.removeClass('ffs-chart-fullscreen');
            $('body').removeClass('ffs-chart-body-fullscreen');
            
            // 恢复原始尺寸
            const originalWidth = $chart.data('original-width');
            const originalHeight = $chart.data('original-height');
            
            if (originalWidth) {
                $chart.css('width', originalWidth);
            }
            
            if (originalHeight) {
                $chart.css('height', originalHeight);
            }
            
            // 触发退出全屏事件
            $chart.trigger('chart:exitFullscreen');
        } else {
            // 进入全屏
            
            // 保存原始尺寸
            $chart.data('original-width', $chart.css('width'));
            $chart.data('original-height', $chart.css('height'));
            
            // 添加全屏样式
            $chart.addClass('ffs-chart-fullscreen');
            $('body').addClass('ffs-chart-body-fullscreen');
            
            // 触发进入全屏事件
            $chart.trigger('chart:enterFullscreen');
        }
        
        // 触发图表尺寸变化事件，以便图表库重新渲染
        $chart.trigger('chart:resize');
    }
    
    /**
     * 显示图表加载状态
     * @param {jQuery} $chart 图表容器
     */
    function showChartLoading($chart) {
        // 如果已有加载状态，则不重复创建
        if ($chart.find('.ffs-chart-loading').length) {
            return;
        }
        
        // 创建加载状态元素
        const $loading = $(`
            <div class="ffs-chart-loading">
                <div class="ffs-chart-loading-spinner"></div>
            </div>
        `);
        
        // 添加到图表容器
        $chart.append($loading);
        
        // 触发加载开始事件
        $chart.trigger('chart:loadingStart');
    }
    
    /**
     * 隐藏图表加载状态
     * @param {jQuery} $chart 图表容器
     */
    function hideChartLoading($chart) {
        const $loading = $chart.find('.ffs-chart-loading');
        
        // 如果有加载状态，则移除
        if ($loading.length) {
            $loading.fadeOut(300, function() {
                $loading.remove();
                
                // 触发加载结束事件
                $chart.trigger('chart:loadingEnd');
            });
        }
    }
    
    /**
     * 显示图表空状态
     * @param {jQuery} $chart 图表容器
     * @param {string} message 显示的消息
     */
    function showChartEmpty($chart, message) {
        // 如果已有空状态，则更新消息
        const $empty = $chart.find('.ffs-chart-empty');
        
        if ($empty.length) {
            $empty.find('.ffs-chart-empty-text').text(message || '暂无数据');
            return;
        }
        
        // 创建空状态元素
        const $emptyState = $(`
            <div class="ffs-chart-empty">
                <div class="ffs-chart-empty-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="ffs-chart-empty-text">${message || '暂无数据'}</div>
            </div>
        `);
        
        // 添加到图表容器
        $chart.append($emptyState);
        
        // 触发空状态事件
        $chart.trigger('chart:empty');
    }
    
    /**
     * 隐藏图表空状态
     * @param {jQuery} $chart 图表容器
     */
    function hideChartEmpty($chart) {
        const $empty = $chart.find('.ffs-chart-empty');
        
        // 如果有空状态，则移除
        if ($empty.length) {
            $empty.fadeOut(300, function() {
                $empty.remove();
                
                // 触发非空状态事件
                $chart.trigger('chart:notEmpty');
            });
        }
    }
    
    /**
     * 初始化图表工具提示
     * 处理图表中的工具提示显示和隐藏
     */
    function initChartTooltip() {
        // 创建全局工具提示元素
        const $tooltip = $('<div class="ffs-chart-tooltip" style="display: none;"></div>');
        $('body').append($tooltip);
        
        // 显示工具提示
        $.fn.showChartTooltip = function(content, x, y) {
            const $chart = $(this);
            
            // 更新工具提示内容
            $tooltip.html(content);
            
            // 计算位置，确保不超出视口
            const tooltipWidth = $tooltip.outerWidth();
            const tooltipHeight = $tooltip.outerHeight();
            const windowWidth = $(window).width();
            const windowHeight = $(window).height();
            
            // 调整X坐标，确保不超出右边界
            if (x + tooltipWidth > windowWidth) {
                x = windowWidth - tooltipWidth - 10;
            }
            
            // 调整Y坐标，确保不超出下边界
            if (y + tooltipHeight > windowHeight) {
                y = y - tooltipHeight - 10;
            }
            
            // 设置位置并显示
            $tooltip.css({
                left: x + 'px',
                top: y + 'px'
            }).fadeIn(200);
            
            // 触发工具提示显示事件
            $chart.trigger('chart:tooltipShow', [content, x, y]);
        };
        
        // 隐藏工具提示
        $.fn.hideChartTooltip = function() {
            const $chart = $(this);
            
            // 隐藏工具提示
            $tooltip.fadeOut(200);
            
            // 触发工具提示隐藏事件
            $chart.trigger('chart:tooltipHide');
        };
        
        // 更新工具提示位置
        $.fn.moveChartTooltip = function(x, y) {
            // 计算位置，确保不超出视口
            const tooltipWidth = $tooltip.outerWidth();
            const tooltipHeight = $tooltip.outerHeight();
            const windowWidth = $(window).width();
            const windowHeight = $(window).height();
            
            // 调整X坐标，确保不超出右边界
            if (x + tooltipWidth > windowWidth) {
                x = windowWidth - tooltipWidth - 10;
            }
            
            // 调整Y坐标，确保不超出下边界
            if (y + tooltipHeight > windowHeight) {
                y = y - tooltipHeight - 10;
            }
            
            // 更新位置
            $tooltip.css({
                left: x + 'px',
                top: y + 'px'
            });
        };
    }
    
    /**
     * 初始化图表图例控制
     * 处理图表图例的点击事件和显示状态
     */
    function initChartLegend() {
        // 图例项点击事件
        $(document).on('click', '.ffs-chart-legend-item', function() {
            const $legendItem = $(this);
            const $chart = $legendItem.closest('.ffs-chart');
            const series = $legendItem.data('series');
            
            // 切换图例项状态
            $legendItem.toggleClass('disabled');
            
            // 获取图例项状态
            const isDisabled = $legendItem.hasClass('disabled');
            
            // 触发图例点击事件
            $chart.trigger('chart:legendToggle', [series, isDisabled]);
        });
        
        // 初始化图例项
        $('.ffs-chart-legend-item').each(function() {
            const $legendItem = $(this);
            const color = $legendItem.data('color');
            
            // 如果有颜色属性，设置图例颜色
            if (color) {
                $legendItem.find('.ffs-chart-legend-color').css('background-color', color);
            }
        });
    }
    
    /**
     * 初始化图表响应式调整
     * 处理图表在窗口大小变化时的响应式调整
     */
    function initChartResponsive() {
        // 窗口大小变化时调整图表
        $(window).on('resize', function() {
            $('.ffs-chart').trigger('chart:resize');
        });
        
        // 为图表添加响应式调整方法
        $.fn.resizeChart = function() {
            return this.each(function() {
                const $chart = $(this);
                
                // 触发图表尺寸变化事件
                $chart.trigger('chart:resize');
            });
        };
    }
    
    /**
     * 初始化图表数据加载
     * 处理图表数据的加载和更新
     */
    function initChartDataLoad() {
        // 为图表添加数据加载方法
        $.fn.loadChartData = function(url, params) {
            return this.each(function() {
                const $chart = $(this);
                
                // 显示加载状态
                showChartLoading($chart);
                
                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function(response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);
                        
                        // 检查是否有数据
                        if (!response || (Array.isArray(response) && response.length === 0)) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }
                        
                        // 隐藏空状态
                        hideChartEmpty($chart);
                        
                        // 触发数据加载成功事件
                        $chart.trigger('chart:dataLoaded', [response]);
                    },
                    error: function(xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);
                        
                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');
                        
                        // 触发数据加载失败事件
                        $chart.trigger('chart:dataError', [error]);
                    }
                });
            });
        };
        
        // 为图表添加数据更新方法
        $.fn.updateChartData = function(data) {
            return this.each(function() {
                const $chart = $(this);
                
                // 检查是否有数据
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }
                
                // 隐藏空状态
                hideChartEmpty($chart);
                
                // 触发数据更新事件
                $chart.trigger('chart:dataUpdated', [data]);
            });
        };
    }
    
    /**
     * 初始化所有图表功能
     */
    function init() {
        initChartActions();
        initChartTooltip();
        initChartLegend();
        initChartResponsive();
        initChartDataLoad();
        
        // 添加全局样式
        $('<style>')
            .text(`
                .ffs-chart-fullscreen {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999 !important;
                    border-radius: 0 !important;
                    padding: 20px !important;
                }
                
                .ffs-chart-body-fullscreen {
                    overflow: hidden !important;
                }
            `)
            .appendTo('head');
    }
    
    /**
     * 初始化图表类型切换
     * 处理图表类型的切换功能
     */
    function initChartTypeSwitch() {
        // 图表类型切换按钮点击事件
        $(document).on('click', '.ffs-chart-type-switch', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const chartType = $btn.data('type');
            
            // 更新按钮状态
            $chart.find('.ffs-chart-type-switch').removeClass('active');
            $btn.addClass('active');
            
            // 更新图表类型
            $chart.removeClass('ffs-chart-line ffs-chart-area ffs-chart-bar ffs-chart-horizontal-bar ffs-chart-pie ffs-chart-scatter ffs-chart-radar')
                  .addClass(`ffs-chart-${chartType}`);
            
            // 触发图表类型切换事件
            $chart.trigger('chart:typeChange', [chartType]);
        });
    }
    
    /**
     * 初始化图表数据筛选
     * 处理图表数据的筛选功能
     */
    function initChartFilter() {
        // 图表筛选按钮点击事件
        $(document).on('click', '.ffs-chart-filter-btn', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const $filterPanel = $chart.find('.ffs-chart-filter-panel');
            
            // 切换筛选面板显示状态
            $filterPanel.slideToggle(300);
            $btn.toggleClass('active');
        });
        
        // 筛选条件应用按钮点击事件
        $(document).on('click', '.ffs-chart-filter-apply', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const $filterPanel = $chart.find('.ffs-chart-filter-panel');
            const $filterForm = $filterPanel.find('.ffs-chart-filter-form');
            
            // 收集筛选条件
            const filterParams = {};
            $filterForm.find('input, select').each(function() {
                const $input = $(this);
                const name = $input.attr('name');
                const value = $input.val();
                
                if (name && value) {
                    filterParams[name] = value;
                }
            });
            
            // 隐藏筛选面板
            $filterPanel.slideUp(300);
            $chart.find('.ffs-chart-filter-btn').removeClass('active');
            
            // 触发筛选应用事件
            $chart.trigger('chart:filter', [filterParams]);
            
            // 显示加载状态
            showChartLoading($chart);
            
            // 模拟筛选完成后隐藏加载状态（实际应用中应由事件回调处理）
            setTimeout(function() {
                hideChartLoading($chart);
            }, 1000);
        });
        
        // 筛选条件重置按钮点击事件
        $(document).on('click', '.ffs-chart-filter-reset', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const $filterPanel = $chart.find('.ffs-chart-filter-panel');
            const $filterForm = $filterPanel.find('.ffs-chart-filter-form');
            
            // 重置表单
            $filterForm.find('input, select').each(function() {
                const $input = $(this);
                const type = $input.attr('type');
                
                if (type === 'checkbox' || type === 'radio') {
                    $input.prop('checked', false);
                } else {
                    $input.val('');
                }
            });
            
            // 触发筛选重置事件
            $chart.trigger('chart:filterReset');
        });
    }
    
    /**
     * 初始化图表时间范围选择
     * 处理图表时间范围的选择功能
     */
    function initChartTimeRange() {
        // 时间范围选择按钮点击事件
        $(document).on('click', '.ffs-chart-time-range-btn', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const range = $btn.data('range');
            
            // 更新按钮状态
            $chart.find('.ffs-chart-time-range-btn').removeClass('active');
            $btn.addClass('active');
            
            // 触发时间范围变化事件
            $chart.trigger('chart:timeRangeChange', [range]);
            
            // 显示加载状态
            showChartLoading($chart);
            
            // 模拟加载完成后隐藏加载状态（实际应用中应由事件回调处理）
            setTimeout(function() {
                hideChartLoading($chart);
            }, 1000);
        });
        
        // 自定义时间范围选择
        $(document).on('change', '.ffs-chart-time-range-custom input', function() {
            const $input = $(this);
            const $chart = $input.closest('.ffs-chart');
            const $startDate = $chart.find('.ffs-chart-time-range-start');
            const $endDate = $chart.find('.ffs-chart-time-range-end');
            
            // 获取时间范围
            const startDate = $startDate.val();
            const endDate = $endDate.val();
            
            // 如果两个日期都已选择
            if (startDate && endDate) {
                // 更新按钮状态
                $chart.find('.ffs-chart-time-range-btn').removeClass('active');
                $chart.find('.ffs-chart-time-range-custom-btn').addClass('active');
                
                // 触发自定义时间范围变化事件
                $chart.trigger('chart:customTimeRangeChange', [startDate, endDate]);
                
                // 显示加载状态
                showChartLoading($chart);
                
                // 模拟加载完成后隐藏加载状态（实际应用中应由事件回调处理）
                setTimeout(function() {
                    hideChartLoading($chart);
                }, 1000);
            }
        });
    }
    
    /**
     * 初始化图表数据对比
     * 处理图表数据对比功能
     */
    function initChartCompare() {
        // 数据对比按钮点击事件
        $(document).on('click', '.ffs-chart-compare-btn', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            
            // 切换对比状态
            $btn.toggleClass('active');
            const isComparing = $btn.hasClass('active');
            
            // 触发数据对比事件
            $chart.trigger('chart:compare', [isComparing]);
            
            // 显示加载状态
            showChartLoading($chart);
            
            // 模拟加载完成后隐藏加载状态（实际应用中应由事件回调处理）
            setTimeout(function() {
                hideChartLoading($chart);
            }, 1000);
        });
    }
    
    /**
     * 初始化图表数据下载
     * 处理图表数据的下载功能
     */
    function initChartDataDownload() {
        // 数据下载按钮点击事件
        $(document).on('click', '.ffs-chart-action-btn[data-action="download"]', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const format = $btn.data('format') || 'csv';
            
            // 触发数据下载事件
            $chart.trigger('chart:dataDownload', [format]);
            
            // 如果有默认下载实现
            downloadChartData($chart, format);
        });
        
        // 默认数据下载实现
        function downloadChartData($chart, format) {
            // 获取图表数据
            const chartData = $chart.data('chartData');
            
            // 如果没有数据，则返回
            if (!chartData) {
                console.warn('没有可下载的图表数据');
                return;
            }
            
            // 根据格式下载
            switch (format.toLowerCase()) {
                case 'csv':
                    downloadCSV(chartData, $chart.find('.ffs-chart-title').text() || 'chart-data');
                    break;
                case 'json':
                    downloadJSON(chartData, $chart.find('.ffs-chart-title').text() || 'chart-data');
                    break;
                case 'excel':
                    downloadExcel(chartData, $chart.find('.ffs-chart-title').text() || 'chart-data');
                    break;
            }
        }
        
        // 下载为CSV
        function downloadCSV(data, filename) {
            // 如果数据是对象，转换为数组
            let csvContent = '';
            
            if (Array.isArray(data)) {
                // 如果是数组对象，提取表头
                if (data.length > 0 && typeof data[0] === 'object') {
                    const headers = Object.keys(data[0]);
                    csvContent += headers.join(',') + '\n';
                    
                    // 添加数据行
                    data.forEach(function(item) {
                        const row = headers.map(function(header) {
                            let cell = item[header] || '';
                            // 处理包含逗号、双引号或换行符的单元格
                            if (/[",\n]/.test(cell)) {
                                cell = '"' + cell.replace(/"/g, '""') + '"';
                            }
                            return cell;
                        });
                        csvContent += row.join(',') + '\n';
                    });
                } else {
                    // 简单数组
                    csvContent = data.join('\n');
                }
            } else if (typeof data === 'object') {
                // 对象转换为CSV
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        let value = data[key];
                        // 处理包含逗号、双引号或换行符的值
                        if (/[",\n]/.test(value)) {
                            value = '"' + value.replace(/"/g, '""') + '"';
                        }
                        csvContent += key + ',' + value + '\n';
                    }
                }
            }
            
            // 创建下载链接
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename + '.csv');
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        // 下载为JSON
        function downloadJSON(data, filename) {
            const jsonContent = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename + '.json');
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        // 下载为Excel（需要额外的库支持）
        function downloadExcel(data, filename) {
            // 检查是否有Excel导出库
            if (window.XLSX) {
                let worksheet;
                
                if (Array.isArray(data)) {
                    // 如果是数组对象，转换为工作表
                    if (data.length > 0 && typeof data[0] === 'object') {
                        const headers = Object.keys(data[0]);
                        const rows = data.map(function(item) {
                            return headers.map(function(header) {
                                return item[header];
                            });
                        });
                        
                        worksheet = XLSX.utils.aoa_to_sheet([headers].concat(rows));
                    } else {
                        // 简单数组
                        worksheet = XLSX.utils.aoa_to_sheet([data]);
                    }
                } else if (typeof data === 'object') {
                    // 对象转换为工作表
                    const rows = [];
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            rows.push([key, data[key]]);
                        }
                    }
                    
                    worksheet = XLSX.utils.aoa_to_sheet(rows);
                }
                
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                XLSX.writeFile(workbook, filename + '.xlsx');
            } else {
                console.warn('Excel导出需要引入XLSX库');
                // 降级为CSV导出
                downloadCSV(data, filename);
            }
        }
    }
    
    /**
     * 初始化图表交互事件
     * 处理图表的鼠标悬停、点击等交互事件
     */
    function initChartInteraction() {
        // 图表内容区域鼠标移动事件
        $(document).on('mousemove', '.ffs-chart-content', function(e) {
            const $chartContent = $(this);
            const $chart = $chartContent.closest('.ffs-chart');
            
            // 计算相对位置
            const offset = $chartContent.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 触发鼠标移动事件
            $chart.trigger('chart:mouseMove', [x, y, e]);
        });
        
        // 图表内容区域鼠标离开事件
        $(document).on('mouseleave', '.ffs-chart-content', function(e) {
            const $chartContent = $(this);
            const $chart = $chartContent.closest('.ffs-chart');
            
            // 触发鼠标离开事件
            $chart.trigger('chart:mouseLeave', [e]);
            
            // 隐藏工具提示
            $chart.hideChartTooltip();
        });
        
        // 图表内容区域点击事件
        $(document).on('click', '.ffs-chart-content', function(e) {
            const $chartContent = $(this);
            const $chart = $chartContent.closest('.ffs-chart');
            
            // 计算相对位置
            const offset = $chartContent.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 触发点击事件
            $chart.trigger('chart:click', [x, y, e]);
        });
        
        // 图表数据点点击事件
        $(document).on('click', '.ffs-chart-data-point', function(e) {
            const $point = $(this);
            const $chart = $point.closest('.ffs-chart');
            const seriesIndex = $point.data('series-index');
            const dataIndex = $point.data('data-index');
            const value = $point.data('value');
            
            // 阻止事件冒泡
            e.stopPropagation();
            
            // 触发数据点点击事件
            $chart.trigger('chart:pointClick', [seriesIndex, dataIndex, value, $point, e]);
        });
    }
    
    /**
     * 初始化图表主题切换
     * 处理图表主题的切换功能
     */
    function initChartTheme() {
        // 主题切换按钮点击事件
        $(document).on('click', '.ffs-chart-theme-switch', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const theme = $btn.data('theme');
            
            // 更新按钮状态
            $chart.find('.ffs-chart-theme-switch').removeClass('active');
            $btn.addClass('active');
            
            // 更新图表主题
            $chart.removeClass('ffs-chart-theme-light ffs-chart-theme-dark ffs-chart-theme-colorful')
                  .addClass(`ffs-chart-theme-${theme}`);
            
            // 触发主题切换事件
            $chart.trigger('chart:themeChange', [theme]);
        });
        
        // 响应系统主题变化
        if (window.matchMedia) {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // 初始检查
            if (darkModeMediaQuery.matches) {
                $('.ffs-chart.ffs-chart-theme-auto').addClass('ffs-chart-theme-dark').removeClass('ffs-chart-theme-light');
            } else {
                $('.ffs-chart.ffs-chart-theme-auto').addClass('ffs-chart-theme-light').removeClass('ffs-chart-theme-dark');
            }
            
            // 监听系统主题变化
            try {
                // Chrome & Firefox
                darkModeMediaQuery.addEventListener('change', function(e) {
                    if (e.matches) {
                        $('.ffs-chart.ffs-chart-theme-auto').addClass('ffs-chart-theme-dark').removeClass('ffs-chart-theme-light');
                    } else {
                        $('.ffs-chart.ffs-chart-theme-auto').addClass('ffs-chart-theme-light').removeClass('ffs-chart-theme-dark');
                    }
                    
                    // 触发主题变化事件
                    $('.ffs-chart.ffs-chart-theme-auto').trigger('chart:themeChange', [e.matches ? 'dark' : 'light']);
                });
            } catch (error) {
                // Safari
                darkModeMediaQuery.addListener(function(e) {
                    if (e.matches) {
                        $('.ffs-chart.ffs-chart-theme-auto').addClass('ffs-chart-theme-dark').removeClass('ffs-chart-theme-light');
                    } else {
                        $('.ffs-chart.ffs-chart-theme-auto').addClass('ffs-chart-theme-light').removeClass('ffs-chart-theme-dark');
                    }
                    
                    // 触发主题变化事件
                    $('.ffs-chart.ffs-chart-theme-auto').trigger('chart:themeChange', [e.matches ? 'dark' : 'light']);
                });
            }
        }
    }
    
    /**
     * 初始化图表动画控制
     * 处理图表动画的开启和关闭
     */
    function initChartAnimation() {
        // 动画开关按钮点击事件
        $(document).on('click', '.ffs-chart-animation-switch', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            
            // 切换动画状态
            $btn.toggleClass('active');
            const isAnimated = $btn.hasClass('active');
            
            // 更新图表动画状态
            $chart.toggleClass('ffs-chart-animated', isAnimated);
            
            // 触发动画状态变化事件
            $chart.trigger('chart:animationToggle', [isAnimated]);
        });
    }
    
    /**
     * 初始化图表缩放功能
     * 处理图表的缩放和平移功能
     */
    function initChartZoom() {
        // 缩放按钮点击事件
        $(document).on('click', '.ffs-chart-zoom-in, .ffs-chart-zoom-out, .ffs-chart-zoom-reset', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            const action = $btn.hasClass('ffs-chart-zoom-in') ? 'in' : 
                          ($btn.hasClass('ffs-chart-zoom-out') ? 'out' : 'reset');
            
            // 触发缩放事件
            $chart.trigger('chart:zoom', [action]);
        });
        
        // 图表内容区域滚轮事件
        $(document).on('wheel', '.ffs-chart-content', function(e) {
            const $chartContent = $(this);
            const $chart = $chartContent.closest('.ffs-chart');
            
            // 如果启用了滚轮缩放
            if ($chart.hasClass('ffs-chart-wheel-zoom')) {
                // 阻止默认滚动
                e.preventDefault();
                
                // 计算相对位置
                const offset = $chartContent.offset();
                const x = e.pageX - offset.left;
                const y = e.pageY - offset.top;
                
                // 判断缩放方向
                const action = e.originalEvent.deltaY < 0 ? 'in' : 'out';
                
                // 触发缩放事件
                $chart.trigger('chart:wheelZoom', [action, x, y, e]);
            }
        });
    }
    
    /**
     * 初始化图表数据刷新
     * 处理图表数据的自动刷新功能
     */
    function initChartAutoRefresh() {
        // 自动刷新开关按钮点击事件
        $(document).on('click', '.ffs-chart-auto-refresh-switch', function() {
            const $btn = $(this);
            const $chart = $btn.closest('.ffs-chart');
            
            // 切换自动刷新状态
            $btn.toggleClass('active');
            const isAutoRefresh = $btn.hasClass('active');
            
            // 更新自动刷新状态
            if (isAutoRefresh) {
                startAutoRefresh($chart);
            } else {
                stopAutoRefresh($chart);
            }
            
            // 触发自动刷新状态变化事件
            $chart.trigger('chart:autoRefreshToggle', [isAutoRefresh]);
        });
        
        // 启动自动刷新
        function startAutoRefresh($chart) {
            // 获取刷新间隔，默认为30秒
            const interval = $chart.data('refresh-interval') || 30000;
            
            // 清除现有定时器
            stopAutoRefresh($chart);
            
            // 创建新定时器
            const timer = setInterval(function() {
                // 触发刷新事件
                $chart.trigger('chart:refresh');
                
                // 显示加载状态
                showChartLoading($chart);
                
                // 模拟刷新完成后隐藏加载状态（实际应用中应由事件回调处理）
                setTimeout(function() {
                    hideChartLoading($chart);
                }, 1000);
            }, interval);
            
            // 保存定时器引用
            $chart.data('refresh-timer', timer);
        }
        
        // 停止自动刷新
        function stopAutoRefresh($chart) {
            const timer = $chart.data('refresh-timer');
            
            if (timer) {
                clearInterval(timer);
                $chart.removeData('refresh-timer');
            }
        }
        
        // 初始化自动刷新
        $('.ffs-chart[data-auto-refresh="true"]').each(function() {
            const $chart = $(this);
            const $switch = $chart.find('.ffs-chart-auto-refresh-switch');
            
            // 激活开关按钮
            $switch.addClass('active');
            
            // 启动自动刷新
            startAutoRefresh($chart);
        });
    }
    
    /**
     * 初始化所有图表功能
     */
    function init() {
        initChartActions();
        initChartTooltip();
        initChartLegend();
        initChartResponsive();
        initChartDataLoad();
        initChartTypeSwitch();
        initChartFilter();
        initChartTimeRange();
        initChartCompare();
        initChartDataDownload();
        initChartInteraction();
        initChartTheme();
        initChartAnimation();
        initChartZoom();
        initChartAutoRefresh();
        
        // 添加全局样式
        $('<style>')
            .text(`
                .ffs-chart-fullscreen {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999 !important;
                    border-radius: 0 !important;
                    padding: 20px !important;
                }
                
                .ffs-chart-body-fullscreen {
                    overflow: hidden !important;
                }
            `)
            .appendTo('head');
    }
    
    // 在文档加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.chart = {
        init: init,
        initChartActions: initChartActions,
        initChartTooltip: initChartTooltip,
        initChartLegend: initChartLegend,
        initChartResponsive: initChartResponsive,
        initChartDataLoad: initChartDataLoad,
        initChartTypeSwitch: initChartTypeSwitch,
        initChartFilter: initChartFilter,
        initChartTimeRange: initChartTimeRange,
        initChartCompare: initChartCompare,
        initChartDataDownload: initChartDataDownload,
        initChartInteraction: initChartInteraction,
        initChartTheme: initChartTheme,
        initChartAnimation: initChartAnimation,
        initChartZoom: initChartZoom,
        initChartAutoRefresh: initChartAutoRefresh,
        showChartLoading: showChartLoading,
        hideChartLoading: hideChartLoading,
        showChartEmpty: showChartEmpty,
        hideChartEmpty: hideChartEmpty,
        toggleChartFullscreen: toggleChartFullscreen
    };

})(jQuery);