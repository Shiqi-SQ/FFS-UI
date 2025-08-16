/**
 * FFS UI - 高级图表组件
 * 提供漏斗图、热力图、仪表盘、K线图、水波图和树图的交互功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化漏斗图
     * 处理漏斗图的交互和数据展示
     */
    function initFunnelChart() {
        // 漏斗图项目鼠标悬停事件
        $(document).on('mouseenter', '.ffs-chart-funnel-item', function () {
            const $item = $(this);
            const $chart = $item.closest('.ffs-chart-funnel');
            const itemIndex = $item.index();
            const itemData = $item.data('item-data');

            // 触发项目悬停事件
            $chart.trigger('funnel:itemHover', [itemIndex, itemData, $item]);
        });

        // 漏斗图项目鼠标离开事件
        $(document).on('mouseleave', '.ffs-chart-funnel-item', function () {
            const $item = $(this);
            const $chart = $item.closest('.ffs-chart-funnel');
            const itemIndex = $item.index();

            // 触发项目离开事件
            $chart.trigger('funnel:itemLeave', [itemIndex, $item]);
        });

        // 漏斗图项目点击事件
        $(document).on('click', '.ffs-chart-funnel-item', function () {
            const $item = $(this);
            const $chart = $item.closest('.ffs-chart-funnel');
            const itemIndex = $item.index();
            const itemData = $item.data('item-data');

            // 触发项目点击事件
            $chart.trigger('funnel:itemClick', [itemIndex, itemData, $item]);
        });

        // 加载漏斗图数据
        $.fn.loadFunnelData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-funnel-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
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

                        // 清除现有项目
                        $content.empty();

                        // 添加新项目
                        if (Array.isArray(response)) {
                            renderFunnelItems($chart, response);
                        }

                        // 触发数据加载成功事件
                        $chart.trigger('funnel:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('funnel:dataError', [error]);
                    }
                });
            });
        };

        // 更新漏斗图数据
        $.fn.updateFunnelData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-funnel-content');

                // 检查是否有数据
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有项目
                $content.empty();

                // 添加新项目
                if (Array.isArray(data)) {
                    renderFunnelItems($chart, data);
                }

                // 触发数据更新事件
                $chart.trigger('funnel:dataUpdated', [data]);
            });
        };

        // 渲染漏斗图项目
        function renderFunnelItems($chart, data) {
            const $content = $chart.find('.ffs-chart-funnel-content');
            const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

            // 计算最大宽度百分比（顶部项目）
            const maxWidth = 100;
            const minWidth = 40;
            const widthDiff = maxWidth - minWidth;

            // 添加项目
            data.forEach((item, index) => {
                // 计算当前项目的宽度百分比
                const ratio = index / (data.length - 1);
                const width = maxWidth - (widthDiff * ratio);

                // 计算颜色（如果没有指定）
                const color = item.color || getColorByIndex(index);

                // 创建项目元素
                const $item = $(`
                    <div class="ffs-chart-funnel-item" style="width: ${width}%; background-color: ${color};">
                        <div class="ffs-chart-funnel-label">${item.label || ''}</div>
                    </div>
                `);

                // 设置项目数据
                $item.data('item-data', item);

                // 添加到内容区域
                $content.append($item);
            });
        }

        // 根据索引获取颜色
        function getColorByIndex(index) {
            const colors = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666',
                '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
            ];
            return colors[index % colors.length];
        }
    }

    /**
     * 初始化热力图
     * 处理热力图的交互和数据展示
     */
    function initHeatmapChart() {
        // 热力图单元格鼠标悬停事件
        $(document).on('mouseenter', '.ffs-chart-heatmap-cell', function (e) {
            const $cell = $(this);
            const $chart = $cell.closest('.ffs-chart-heatmap');
            const cellData = $cell.data('cell-data');

            // 显示工具提示
            if (cellData) {
                const content = `
                    <div><strong>${cellData.x || ''} - ${cellData.y || ''}</strong></div>
                    <div>值: ${cellData.value || 0}</div>
                `;

                showHeatmapTooltip($chart, content, e.pageX, e.pageY);
            }

            // 触发单元格悬停事件
            $chart.trigger('heatmap:cellHover', [cellData, $cell, e]);
        });

        // 热力图单元格鼠标移动事件
        $(document).on('mousemove', '.ffs-chart-heatmap-cell', function (e) {
            const $cell = $(this);
            const $chart = $cell.closest('.ffs-chart-heatmap');

            // 更新工具提示位置
            moveHeatmapTooltip($chart, e.pageX, e.pageY);
        });

        // 热力图单元格鼠标离开事件
        $(document).on('mouseleave', '.ffs-chart-heatmap-cell', function () {
            const $cell = $(this);
            const $chart = $cell.closest('.ffs-chart-heatmap');

            // 隐藏工具提示
            hideHeatmapTooltip($chart);

            // 触发单元格离开事件
            $chart.trigger('heatmap:cellLeave', [$cell]);
        });

        // 热力图单元格点击事件
        $(document).on('click', '.ffs-chart-heatmap-cell', function (e) {
            const $cell = $(this);
            const $chart = $cell.closest('.ffs-chart-heatmap');
            const cellData = $cell.data('cell-data');

            // 触发单元格点击事件
            $chart.trigger('heatmap:cellClick', [cellData, $cell, e]);
        });

        // 显示热力图工具提示
        function showHeatmapTooltip($chart, content, x, y) {
            // 查找或创建工具提示元素
            let $tooltip = $chart.find('.ffs-chart-heatmap-tooltip');

            if (!$tooltip.length) {
                $tooltip = $('<div class="ffs-chart-heatmap-tooltip"></div>');
                $chart.append($tooltip);
            }

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
        }

        // 移动热力图工具提示
        function moveHeatmapTooltip($chart, x, y) {
            const $tooltip = $chart.find('.ffs-chart-heatmap-tooltip');

            if ($tooltip.is(':visible')) {
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
            }
        }

        // 隐藏热力图工具提示
        function hideHeatmapTooltip($chart) {
            const $tooltip = $chart.find('.ffs-chart-heatmap-tooltip');

            if ($tooltip.length) {
                $tooltip.fadeOut(200);
            }
        }

        // 加载热力图数据
        $.fn.loadHeatmapData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-heatmap-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || !response.data || response.data.length === 0) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有单元格
                        $content.empty();

                        // 渲染热力图
                        renderHeatmap($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('heatmap:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('heatmap:dataError', [error]);
                    }
                });
            });
        };

        // 渲染热力图
        function renderHeatmap($chart, data) {
            const $content = $chart.find('.ffs-chart-heatmap-content');

            // 获取X轴和Y轴标签
            const xLabels = data.xAxis || [];
            const yLabels = data.yAxis || [];
            const cellData = data.data || [];

            // 计算最大值和最小值，用于颜色映射
            let maxValue = Number.MIN_SAFE_INTEGER;
            let minValue = Number.MAX_SAFE_INTEGER;

            cellData.forEach(cell => {
                if (cell.value > maxValue) maxValue = cell.value;
                if (cell.value < minValue) minValue = cell.value;
            });

            // 创建热力图表格
            const $table = $('<table class="ffs-chart-heatmap-table"></table>');

            // 添加表头（X轴标签）
            if (xLabels.length > 0) {
                const $thead = $('<thead></thead>');
                const $headerRow = $('<tr></tr>');

                // 添加空单元格（左上角）
                $headerRow.append('<th></th>');

                // 添加X轴标签
                xLabels.forEach(label => {
                    $headerRow.append(`<th>${label}</th>`);
                });

                $thead.append($headerRow);
                $table.append($thead);
            }

            // 添加表体（Y轴标签和数据单元格）
            const $tbody = $('<tbody></tbody>');

            // 为每个Y轴标签创建一行
            yLabels.forEach((yLabel, yIndex) => {
                const $row = $('<tr></tr>');

                // 添加Y轴标签
                $row.append(`<th>${yLabel}</th>`);

                // 为每个X轴标签创建一个单元格
                xLabels.forEach((xLabel, xIndex) => {
                    // 查找对应的数据
                    const cell = cellData.find(c => c.x === xIndex && c.y === yIndex) || {
                        x: xIndex,
                        y: yIndex,
                        value: 0
                    };

                    // 计算颜色强度（0-1之间）
                    const intensity = (cell.value - minValue) / (maxValue - minValue || 1);

                    // 生成颜色（从浅蓝到深蓝）
                    const color = getHeatmapColor(intensity);

                    // 创建单元格
                    const $cell = $(`<td class="ffs-chart-heatmap-cell" style="background-color: ${color};"></td>`);

                    // 设置单元格数据
                    $cell.data('cell-data', {
                        x: xLabel,
                        y: yLabel,
                        value: cell.value,
                        xIndex: xIndex,
                        yIndex: yIndex
                    });

                    // 添加到行
                    $row.append($cell);
                });

                // 添加行到表体
                $tbody.append($row);
            });

            // 添加表体到表格
            $table.append($tbody);

            // 添加表格到内容区域
            $content.append($table);
        }

        // 获取热力图颜色
        function getHeatmapColor(intensity) {
            // 从浅蓝到深蓝的渐变
            const r = Math.floor(255 * (1 - intensity));
            const g = Math.floor(255 * (1 - intensity));
            const b = 255;

            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    /**
     * 初始化仪表盘
     * 处理仪表盘的交互和数据展示
     */
    function initGaugeChart() {
        // 加载仪表盘数据
        $.fn.loadGaugeData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-gauge-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || typeof response.value === 'undefined') {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 更新仪表盘
                        updateGauge($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('gauge:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('gauge:dataError', [error]);
                    }
                });
            });
        };

        // 更新仪表盘数据
        $.fn.updateGaugeData = function (data) {
            return this.each(function () {
                const $chart = $(this);

                // 检查是否有数据
                if (!data || typeof data.value === 'undefined') {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 更新仪表盘
                updateGauge($chart, data);

                // 触发数据更新事件
                $chart.trigger('gauge:dataUpdated', [data]);
            });
        };

        // 更新仪表盘
        function updateGauge($chart, data) {
            const $content = $chart.find('.ffs-chart-gauge-content');

            // 清除现有内容
            $content.empty();

            // 获取数据
            const value = data.value || 0;
            const min = data.min || 0;
            const max = data.max || 100;
            const label = data.label || '';

            // 计算角度（0-180度）
            const angle = 180 * (value - min) / (max - min);

            // 创建SVG
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'ffs-chart-gauge-svg');
            svg.setAttribute('viewBox', '0 0 200 100');

            // 创建背景弧
            const bgArc = document.createElementNS(svgNS, 'path');
            bgArc.setAttribute('d', 'M 10 90 A 90 90 0 0 1 190 90');
            bgArc.setAttribute('stroke', '#e0e0e0');
            bgArc.setAttribute('stroke-width', '10');
            bgArc.setAttribute('fill', 'none');

            // 创建值弧
            const valueArc = document.createElementNS(svgNS, 'path');
            const endX = 100 - 90 * Math.cos(angle * Math.PI / 180);
            const endY = 90 - 90 * Math.sin(angle * Math.PI / 180);
            valueArc.setAttribute('d', `M 10 90 A 90 90 0 0 1 ${endX} ${endY}`);
            valueArc.setAttribute('stroke', getGaugeColor(value, min, max));
            valueArc.setAttribute('stroke-width', '10');
            valueArc.setAttribute('fill', 'none');

            // 创建指针
            const pointer = document.createElementNS(svgNS, 'line');
            pointer.setAttribute('x1', '100');
            pointer.setAttribute('y1', '90');
            pointer.setAttribute('x2', endX);
            pointer.setAttribute('y2', endY);
            pointer.setAttribute('stroke', '#333');
            pointer.setAttribute('stroke-width', '2');

            // 创建中心点
            const center = document.createElementNS(svgNS, 'circle');
            center.setAttribute('cx', '100');
            center.setAttribute('cy', '90');
            center.setAttribute('r', '5');
            center.setAttribute('fill', '#333');

            // 添加元素到SVG
            svg.appendChild(bgArc);
            svg.appendChild(valueArc);
            svg.appendChild(pointer);
            svg.appendChild(center);

            // 添加SVG到内容区域
            $content.append(svg);

            // 添加值和标签
            $content.append(`<div class="ffs-chart-gauge-value">${value}</div>`);
            $content.append(`<div class="ffs-chart-gauge-label">${label}</div>`);
        }

        // 获取仪表盘颜色
        function getGaugeColor(value, min, max) {
            // 计算百分比
            const percent = (value - min) / (max - min);

            // 根据百分比返回颜色
            if (percent < 0.3) {
                return '#5470c6'; // 蓝色
            } else if (percent < 0.7) {
                return '#91cc75'; // 绿色
            } else {
                return '#ee6666'; // 红色
            }
        }
    }

    /**
     * 初始化K线图
     * 处理K线图的交互和数据展示
     */
    function initCandlestickChart() {
        // K线图鼠标移动事件
        $(document).on('mousemove', '.ffs-chart-candlestick-content', function (e) {
            const $content = $(this);
            const $chart = $content.closest('.ffs-chart-candlestick');

            // 计算相对位置
            const offset = $content.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;

            // 查找最近的K线
            const $candle = findNearestCandle($chart, x);

            if ($candle && $candle.length) {
                const candleData = $candle.data('candle-data');

                // 显示工具提示
                if (candleData) {
                    const content = `
                        <div><strong>${candleData.date || ''}</strong></div>
                        <div>开盘: ${candleData.open}</div>
                        <div>收盘: ${candleData.close}</div>
                        <div>最高: ${candleData.high}</div>
                        <div>最低: ${candleData.low}</div>
                        <div>成交量: ${candleData.volume || 'N/A'}</div>
                    `;

                    showCandlestickTooltip($chart, content, e.pageX, e.pageY);
                }

                // 高亮当前K线
                $chart.find('.ffs-chart-candlestick-item').removeClass('active');
                $candle.addClass('active');

                // 触发K线悬停事件
                $chart.trigger('candlestick:itemHover', [candleData, $candle, e]);
            }
        });

        // K线图鼠标离开事件
        $(document).on('mouseleave', '.ffs-chart-candlestick-content', function () {
            const $content = $(this);
            const $chart = $content.closest('.ffs-chart-candlestick');

            // 隐藏工具提示
            hideCandlestickTooltip($chart);

            // 移除高亮
            $chart.find('.ffs-chart-candlestick-item').removeClass('active');

            // 触发鼠标离开事件
            $chart.trigger('candlestick:mouseLeave');
        });

        // K线图点击事件
        $(document).on('click', '.ffs-chart-candlestick-item', function (e) {
            const $candle = $(this);
            const $chart = $candle.closest('.ffs-chart-candlestick');
            const candleData = $candle.data('candle-data');

            // 触发K线点击事件
            $chart.trigger('candlestick:itemClick', [candleData, $candle, e]);
        });

        // 查找最近的K线
        function findNearestCandle($chart, x) {
            const $candles = $chart.find('.ffs-chart-candlestick-item');
            let nearest = null;
            let minDistance = Infinity;

            $candles.each(function () {
                const $candle = $(this);
                const candleX = $candle.position().left + $candle.width() / 2;
                const distance = Math.abs(candleX - x);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = $candle;
                }
            });

            return nearest;
        }

        // 显示K线图工具提示
        function showCandlestickTooltip($chart, content, x, y) {
            // 查找或创建工具提示元素
            let $tooltip = $chart.find('.ffs-chart-candlestick-tooltip');

            if (!$tooltip.length) {
                $tooltip = $('<div class="ffs-chart-candlestick-tooltip"></div>');
                $chart.append($tooltip);
            }

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
        }

        // 隐藏K线图工具提示
        function hideCandlestickTooltip($chart) {
            const $tooltip = $chart.find('.ffs-chart-candlestick-tooltip');

            if ($tooltip.length) {
                $tooltip.fadeOut(200);
            }
        }

        // 加载K线图数据
        $.fn.loadCandlestickData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-candlestick-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || !response.data || response.data.length === 0) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有K线
                        $content.empty();

                        // 渲染K线图
                        renderCandlestick($chart, response.data);

                        // 触发数据加载成功事件
                        $chart.trigger('candlestick:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('candlestick:dataError', [error]);
                    }
                });
            });
        };

        // 渲染K线图
        function renderCandlestick($chart, data) {
            const $content = $chart.find('.ffs-chart-candlestick-content');

            // 计算最高价和最低价，用于确定Y轴比例
            let maxPrice = Number.MIN_SAFE_INTEGER;
            let minPrice = Number.MAX_SAFE_INTEGER;

            data.forEach(item => {
                if (item.high > maxPrice) maxPrice = item.high;
                if (item.low < minPrice) minPrice = item.low;
            });

            // 添加一些边距
            const priceRange = maxPrice - minPrice;
            maxPrice += priceRange * 0.05;
            minPrice -= priceRange * 0.05;

            // 计算每个K线的宽度
            const candleWidth = 100 / data.length;

            // 创建K线容器
            const $candlestickContainer = $('<div class="ffs-chart-candlestick-container"></div>');

            // 添加K线
            data.forEach((item, index) => {
                // 计算K线位置和尺寸
                const left = index * candleWidth;
                const width = candleWidth * 0.8; // 留一些间距

                // 计算价格对应的高度百分比
                const highPercent = 100 - ((item.high - minPrice) / (maxPrice - minPrice) * 100);
                const lowPercent = 100 - ((item.low - minPrice) / (maxPrice - minPrice) * 100);
                const openPercent = 100 - ((item.open - minPrice) / (maxPrice - minPrice) * 100);
                const closePercent = 100 - ((item.close - minPrice) / (maxPrice - minPrice) * 100);

                // 确定K线类型（上涨或下跌）
                const isUp = item.close >= item.open;
                const candleClass = isUp ? 'ffs-chart-candlestick-up' : 'ffs-chart-candlestick-down';
                const candleColor = isUp ? '#91cc75' : '#ee6666';

                // 计算实体高度
                const bodyTop = Math.min(openPercent, closePercent);
                const bodyHeight = Math.abs(openPercent - closePercent);

                // 创建K线元素
                const $candle = $(`
                                    <div class="ffs-chart-candlestick-item ${candleClass}" 
                                         style="left: ${left}%; width: ${width}%;">
                                        <div class="ffs-chart-candlestick-line" 
                                             style="top: ${highPercent}%; height: ${lowPercent - highPercent}%;"></div>
                                        <div class="ffs-chart-candlestick-body" 
                                             style="top: ${bodyTop}%; height: ${bodyHeight}%; background-color: ${candleColor};"></div>
                                    </div>
                                `);

                // 设置K线数据
                $candle.data('candle-data', {
                    date: item.date,
                    open: item.open,
                    close: item.close,
                    high: item.high,
                    low: item.low,
                    volume: item.volume,
                    isUp: isUp
                });

                // 添加到容器
                $candlestickContainer.append($candle);
            });

            // 添加容器到内容区域
            $content.append($candlestickContainer);

            // 添加Y轴标签
            addCandlestickYAxis($chart, minPrice, maxPrice);

            // 添加X轴标签（日期）
            addCandlestickXAxis($chart, data);
        }

        // 添加K线图Y轴
        function addCandlestickYAxis($chart, minPrice, maxPrice) {
            const $content = $chart.find('.ffs-chart-candlestick-content');

            // 创建Y轴容器
            const $yAxis = $('<div class="ffs-chart-candlestick-yaxis"></div>');

            // 添加Y轴标签
            const steps = 5; // 标签数量
            for (let i = 0; i <= steps; i++) {
                const percent = i * (100 / steps);
                const price = maxPrice - (i / steps) * (maxPrice - minPrice);

                // 创建标签
                const $label = $(`
                                    <div class="ffs-chart-candlestick-yaxis-label" style="top: ${percent}%;">
                                        ${price.toFixed(2)}
                                    </div>
                                `);

                // 添加到Y轴
                $yAxis.append($label);
            }

            // 添加Y轴到内容区域
            $content.append($yAxis);
        }

        // 添加K线图X轴
        function addCandlestickXAxis($chart, data) {
            const $content = $chart.find('.ffs-chart-candlestick-content');

            // 创建X轴容器
            const $xAxis = $('<div class="ffs-chart-candlestick-xaxis"></div>');

            // 确定要显示的标签数量
            const labelCount = Math.min(data.length, 10);
            const step = Math.ceil(data.length / labelCount);

            // 添加X轴标签
            for (let i = 0; i < data.length; i += step) {
                const percent = (i / data.length) * 100;
                const date = data[i].date;

                // 创建标签
                const $label = $(`
                                    <div class="ffs-chart-candlestick-xaxis-label" style="left: ${percent}%;">
                                        ${date}
                                    </div>
                                `);

                // 添加到X轴
                $xAxis.append($label);
            }

            // 添加X轴到内容区域
            $content.append($xAxis);
        }
    }

    /**
     * 初始化水波图
     * 处理水波图的交互和数据展示
     */
    function initLiquidFillChart() {
        // 加载水波图数据
        $.fn.loadLiquidFillData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-liquidfill-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || typeof response.value === 'undefined') {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 更新水波图
                        updateLiquidFill($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('liquidfill:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('liquidfill:dataError', [error]);
                    }
                });
            });
        };

        // 更新水波图数据
        $.fn.updateLiquidFillData = function (data) {
            return this.each(function () {
                const $chart = $(this);

                // 检查是否有数据
                if (!data || typeof data.value === 'undefined') {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 更新水波图
                updateLiquidFill($chart, data);

                // 触发数据更新事件
                $chart.trigger('liquidfill:dataUpdated', [data]);
            });
        };

        // 更新水波图
        function updateLiquidFill($chart, data) {
            const $content = $chart.find('.ffs-chart-liquidfill-content');

            // 清除现有内容
            $content.empty();

            // 获取数据
            const value = Math.min(Math.max(data.value || 0, 0), 1); // 确保值在0-1之间
            const label = data.label || '';
            const color = data.color || '#5470c6';

            // 创建水波图容器
            const $liquidContainer = $('<div class="ffs-chart-liquidfill-container"></div>');

            // 创建水波图圆形容器
            const $circle = $('<div class="ffs-chart-liquidfill-circle"></div>');

            // 创建水波
            const $wave = $('<div class="ffs-chart-liquidfill-wave"></div>');
            $wave.css({
                'background-color': color,
                'height': (value * 100) + '%',
                'top': ((1 - value) * 100) + '%'
            });

            // 创建波浪动画
            const $waveAnimation = $('<div class="ffs-chart-liquidfill-wave-animation"></div>');
            $waveAnimation.css('background-color', color);

            // 添加波浪到圆形容器
            $wave.append($waveAnimation);
            $circle.append($wave);

            // 创建百分比文本
            const $percent = $(`<div class="ffs-chart-liquidfill-percent">${Math.round(value * 100)}%</div>`);

            // 添加元素到容器
            $circle.append($percent);
            $liquidContainer.append($circle);

            // 添加标签
            if (label) {
                const $label = $(`<div class="ffs-chart-liquidfill-label">${label}</div>`);
                $liquidContainer.append($label);
            }

            // 添加容器到内容区域
            $content.append($liquidContainer);

            // 设置波浪动画速度
            const animationDuration = 2 + Math.random() * 2; // 2-4秒
            $waveAnimation.css('animation-duration', animationDuration + 's');
        }
    }

    /**
     * 初始化树图
     * 处理树图的交互和数据展示
     */
    function initTreeChart() {
        // 树图节点点击事件
        $(document).on('click', '.ffs-chart-tree-node', function (e) {
            const $node = $(this);
            const $chart = $node.closest('.ffs-chart-tree');
            const nodeData = $node.data('node-data');

            // 切换节点展开/折叠状态
            toggleTreeNode($node);

            // 触发节点点击事件
            $chart.trigger('tree:nodeClick', [nodeData, $node, e]);

            // 阻止事件冒泡
            e.stopPropagation();
        });

        // 加载树图数据
        $.fn.loadTreeData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-tree-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有节点
                        $content.empty();

                        // 渲染树图
                        renderTree($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('tree:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('tree:dataError', [error]);
                    }
                });
            });
        };

        // 更新树图数据
        $.fn.updateTreeData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-tree-content');

                // 检查是否有数据
                if (!data) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有节点
                $content.empty();

                // 渲染树图
                renderTree($chart, data);

                // 触发数据更新事件
                $chart.trigger('tree:dataUpdated', [data]);
            });
        };

        // 渲染树图
        function renderTree($chart, data) {
            const $content = $chart.find('.ffs-chart-tree-content');

            // 创建根节点容器
            const $treeContainer = $('<div class="ffs-chart-tree-container"></div>');

            // 递归渲染节点
            function renderNode(node, level = 0) {
                // 创建节点元素
                const $node = $(`
                                <div class="ffs-chart-tree-node" data-level="${level}">
                                        <div class="ffs-chart-tree-node-content">
                                                <span class="ffs-chart-tree-node-icon">
                                                        ${node.children && node.children.length ? '<i class="fas fa-caret-right"></i>' : '<i class="fas fa-circle"></i>'}
                                                </span>
                                                <span class="ffs-chart-tree-node-label">${node.name || ''}</span>
                                                ${node.value ? `<span class="ffs-chart-tree-node-value">${node.value}</span>` : ''}
                                        </div>
                                </div>
                        `);

                // 设置节点数据
                $node.data('node-data', node);

                // 如果有子节点，创建子节点容器
                if (node.children && node.children.length) {
                    const $children = $('<div class="ffs-chart-tree-children"></div>');

                    // 递归渲染子节点
                    node.children.forEach(child => {
                        $children.append(renderNode(child, level + 1));
                    });

                    // 将子节点容器添加到节点
                    $node.append($children);
                }

                return $node;
            }

            // 渲染根节点
            $treeContainer.append(renderNode(data));

            // 添加容器到内容区域
            $content.append($treeContainer);
        }

        // 切换树图节点展开/折叠状态
        function toggleTreeNode($node) {
            // 获取子节点容器
            const $children = $node.children('.ffs-chart-tree-children');

            // 如果有子节点
            if ($children.length) {
                // 切换展开/折叠状态
                $children.slideToggle(200);

                // 切换图标
                const $icon = $node.find('.ffs-chart-tree-node-icon i');
                $icon.toggleClass('fa-caret-right fa-caret-down');
            }
        }
    }

    /**
     * 初始化雷达图
     * 处理雷达图的交互和数据展示
     */
    function initRadarChart() {
        // 加载雷达图数据
        $.fn.loadRadarData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-radar-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || !response.indicators || !response.series) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有内容
                        $content.empty();

                        // 渲染雷达图
                        renderRadar($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('radar:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('radar:dataError', [error]);
                    }
                });
            });
        };

        // 更新雷达图数据
        $.fn.updateRadarData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-radar-content');

                // 检查是否有数据
                if (!data || !data.indicators || !data.series) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有内容
                $content.empty();

                // 渲染雷达图
                renderRadar($chart, data);

                // 触发数据更新事件
                $chart.trigger('radar:dataUpdated', [data]);
            });
        };

        // 渲染雷达图
        function renderRadar($chart, data) {
            const $content = $chart.find('.ffs-chart-radar-content');

            // 获取指标和系列数据
            const indicators = data.indicators || [];
            const series = data.series || [];

            // 创建SVG
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'ffs-chart-radar-svg');
            svg.setAttribute('viewBox', '0 0 200 200');

            // 计算中心点和半径
            const centerX = 100;
            const centerY = 100;
            const radius = 80;

            // 计算每个指标的角度
            const angleStep = (2 * Math.PI) / indicators.length;

            // 创建背景多边形
            for (let i = 5; i > 0; i--) {
                const r = radius * (i / 5);
                const points = indicators.map((_, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);
                    return `${x},${y}`;
                }).join(' ');

                const polygon = document.createElementNS(svgNS, 'polygon');
                polygon.setAttribute('points', points);
                polygon.setAttribute('class', 'ffs-chart-radar-bg-polygon');
                svg.appendChild(polygon);
            }

            // 创建轴线
            indicators.forEach((_, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', centerX);
                line.setAttribute('y1', centerY);
                line.setAttribute('x2', x);
                line.setAttribute('y2', y);
                line.setAttribute('class', 'ffs-chart-radar-axis');
                svg.appendChild(line);
            });

            // 创建指标标签
            indicators.forEach((indicator, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const x = centerX + (radius + 15) * Math.cos(angle);
                const y = centerY + (radius + 15) * Math.sin(angle);

                const text = document.createElementNS(svgNS, 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', y);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'middle');
                text.setAttribute('class', 'ffs-chart-radar-label');
                text.textContent = indicator.name;
                svg.appendChild(text);
            });

            // 创建数据多边形
            series.forEach((serie, serieIndex) => {
                const color = serie.color || getRadarColor(serieIndex);
                const values = serie.values || [];

                // 计算数据点
                const points = values.map((value, index) => {
                    const max = indicators[index].max || 100;
                    const ratio = value / max;
                    const r = radius * ratio;
                    const angle = index * angleStep - Math.PI / 2;
                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);
                    return {
                        x,
                        y,
                        value
                    };
                });

                // 创建数据多边形
                const polygon = document.createElementNS(svgNS, 'polygon');
                polygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
                polygon.setAttribute('fill', color);
                polygon.setAttribute('fill-opacity', '0.2');
                polygon.setAttribute('stroke', color);
                polygon.setAttribute('stroke-width', '2');
                svg.appendChild(polygon);

                // 创建数据点
                points.forEach(point => {
                    const circle = document.createElementNS(svgNS, 'circle');
                    circle.setAttribute('cx', point.x);
                    circle.setAttribute('cy', point.y);
                    circle.setAttribute('r', '3');
                    circle.setAttribute('fill', color);
                    svg.appendChild(circle);
                });
            });

            // 添加SVG到内容区域
            $content.append(svg);

            // 添加图例
            if (series.length > 1) {
                const $legend = $('<div class="ffs-chart-radar-legend"></div>');

                series.forEach((serie, index) => {
                    const color = serie.color || getRadarColor(index);
                    const $item = $(`
                                        <div class="ffs-chart-radar-legend-item">
                                                <span class="ffs-chart-radar-legend-color" style="background-color: ${color};"></span>
                                                <span class="ffs-chart-radar-legend-label">${serie.name || `系列${index + 1}`}</span>
                                        </div>
                                `);

                    $legend.append($item);
                });

                $content.append($legend);
            }
        }

        // 获取雷达图颜色
        function getRadarColor(index) {
            const colors = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666',
                '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
            ];
            return colors[index % colors.length];
        }
    }

    /**
     * 初始化桑基图
     * 处理桑基图的交互和数据展示
     */
    function initSankeyChart() {
        // 加载桑基图数据
        $.fn.loadSankeyData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-sankey-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || !response.nodes || !response.links) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有内容
                        $content.empty();

                        // 渲染桑基图
                        renderSankey($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('sankey:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('sankey:dataError', [error]);
                    }
                });
            });
        };

        // 更新桑基图数据
        $.fn.updateSankeyData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-sankey-content');

                // 检查是否有数据
                if (!data || !data.nodes || !data.links) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有内容
                $content.empty();

                // 渲染桑基图
                renderSankey($chart, data);

                // 触发数据更新事件
                $chart.trigger('sankey:dataUpdated', [data]);
            });
        };

        // 渲染桑基图
        function renderSankey($chart, data) {
            const $content = $chart.find('.ffs-chart-sankey-content');

            // 获取节点和链接数据
            const nodes = data.nodes || [];
            const links = data.links || [];

            // 创建SVG
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'ffs-chart-sankey-svg');
            svg.setAttribute('viewBox', '0 0 800 500');

            // 计算节点位置
            const nodeWidth = 20;
            const nodePadding = 10;
            const width = 800;
            const height = 500;

            // 创建桑基图布局
            const sankeyLayout = createSankeyLayout(nodes, links, {
                width: width - 50,
                height: height - 50,
                nodeWidth: nodeWidth,
                nodePadding: nodePadding
            });

            // 创建链接路径
            sankeyLayout.links.forEach((link, index) => {
                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('d', getSankeyLinkPath(link));
                path.setAttribute('class', 'ffs-chart-sankey-link');
                path.setAttribute('stroke-width', Math.max(1, link.width));
                path.setAttribute('stroke-opacity', '0.4');
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', getSankeyColor(index));

                // 设置链接数据
                $(path).data('link-data', link);

                // 添加鼠标事件
                $(path).on('mouseenter', function (e) {
                    // 高亮链接
                    $(this).attr('stroke-opacity', '0.8');

                    // 显示工具提示
                    const linkData = $(this).data('link-data');
                    const content = `
                                                <div><strong>从 ${linkData.source.name} 到 ${linkData.target.name}</strong></div>
                                                <div>值: ${linkData.value}</div>
                                        `;
                    showSankeyTooltip($chart, content, e.pageX, e.pageY);
                });

                $(path).on('mouseleave', function () {
                    // 恢复链接透明度
                    $(this).attr('stroke-opacity', '0.4');

                    // 隐藏工具提示
                    hideSankeyTooltip($chart);
                });

                svg.appendChild(path);
            });

            // 创建节点
            sankeyLayout.nodes.forEach((node, index) => {
                const rect = document.createElementNS(svgNS, 'rect');
                rect.setAttribute('x', node.x);
                rect.setAttribute('y', node.y);
                rect.setAttribute('width', node.width);
                rect.setAttribute('height', node.height);
                rect.setAttribute('class', 'ffs-chart-sankey-node');
                rect.setAttribute('fill', getSankeyColor(index));

                // 设置节点数据
                $(rect).data('node-data', node);

                // 添加鼠标事件
                $(rect).on('mouseenter', function (e) {
                    // 高亮节点
                    $(this).attr('fill-opacity', '0.8');

                    // 显示工具提示
                    const nodeData = $(this).data('node-data');
                    const content = `
                                                <div><strong>${nodeData.name}</strong></div>
                                                <div>值: ${nodeData.value}</div>
                                        `;
                    showSankeyTooltip($chart, content, e.pageX, e.pageY);
                });

                $(rect).on('mouseleave', function () {
                    // 恢复节点透明度
                    $(this).attr('fill-opacity', '1');

                    // 隐藏工具提示
                    hideSankeyTooltip($chart);
                });

                svg.appendChild(rect);

                // 创建节点标签
                const text = document.createElementNS(svgNS, 'text');
                text.setAttribute('x', node.x < width / 2 ? node.x + node.width + 5 : node.x - 5);
                text.setAttribute('y', node.y + node.height / 2);
                text.setAttribute('text-anchor', node.x < width / 2 ? 'start' : 'end');
                text.setAttribute('dominant-baseline', 'middle');
                text.setAttribute('class', 'ffs-chart-sankey-label');
                text.textContent = node.name;
                svg.appendChild(text);
            });

            // 添加SVG到内容区域
            $content.append(svg);
        }

        // 创建桑基图布局
        function createSankeyLayout(nodes, links, options) {
            const width = options.width || 800;
            const height = options.height || 500;
            const nodeWidth = options.nodeWidth || 20;
            const nodePadding = options.nodePadding || 10;

            // 创建节点映射
            const nodeMap = {};
            nodes.forEach(node => {
                nodeMap[node.id] = node;
            });

            // 处理链接数据
            const sankeyLinks = links.map(link => {
                return {
                    source: nodeMap[link.source],
                    target: nodeMap[link.target],
                    value: link.value
                };
            });

            // 计算节点层级
            const nodeLevels = {};
            let maxLevel = 0;

            // 初始化源节点为第0层
            nodes.forEach(node => {
                let isSource = true;
                for (const link of sankeyLinks) {
                    if (link.target === node) {
                        isSource = false;
                        break;
                    }
                }
                if (isSource) {
                    nodeLevels[node.id] = 0;
                }
            });

            // 递归计算其他节点层级
            let changed = true;
            while (changed) {
                changed = false;
                for (const link of sankeyLinks) {
                    if (nodeLevels[link.source.id] !== undefined && nodeLevels[link.target.id] === undefined) {
                        nodeLevels[link.target.id] = nodeLevels[link.source.id] + 1;
                        maxLevel = Math.max(maxLevel, nodeLevels[link.target.id]);
                        changed = true;
                    }
                }
            }

            // 计算每层节点数量
            const levelCounts = Array(maxLevel + 1).fill(0);
            nodes.forEach(node => {
                const level = nodeLevels[node.id] || 0;
                levelCounts[level]++;
            });

            // 计算节点位置
            const levelPositions = Array(maxLevel + 1).fill(0);
            const sankeyNodes = nodes.map(node => {
                const level = nodeLevels[node.id] || 0;
                const x = (width / (maxLevel + 1)) * level;
                const levelHeight = height / levelCounts[level];
                const y = levelPositions[level] * levelHeight;
                levelPositions[level]++;

                // 计算节点值（输入或输出链接值的总和）
                let nodeValue = 0;
                for (const link of sankeyLinks) {
                    if (link.source === node || link.target === node) {
                        nodeValue += link.value;
                    }
                }

                return {
                    ...node,
                    x: x,
                    y: y,
                    width: nodeWidth,
                    height: Math.max(10, (nodeValue / 100) * 30), // 根据值调整高度
                    level: level,
                    value: nodeValue
                };
            });

            // 计算链接路径
            const sankeyLinksWithCoords = sankeyLinks.map(link => {
                const sourceNode = sankeyNodes.find(n => n.id === link.source.id);
                const targetNode = sankeyNodes.find(n => n.id === link.target.id);

                return {
                    source: sourceNode,
                    target: targetNode,
                    value: link.value,
                    width: Math.max(1, (link.value / 100) * 20) // 根据值调整宽度
                };
            });

            return {
                nodes: sankeyNodes,
                links: sankeyLinksWithCoords
            };
        }

        // 获取桑基图链接路径
        function getSankeyLinkPath(link) {
            const source = link.source;
            const target = link.target;
            const x0 = source.x + source.width;
            const y0 = source.y + source.height / 2;
            const x1 = target.x;
            const y1 = target.y + target.height / 2;
            const curvature = 0.5;

            const xi = d3.interpolateNumber(x0, x1);
            const x2 = xi(curvature);
            const x3 = xi(1 - curvature);

            return `M${x0},${y0}C${x2},${y0} ${x3},${y1} ${x1},${y1}`;
        }

        // 显示桑基图工具提示
        function showSankeyTooltip($chart, content, x, y) {
            // 查找或创建工具提示元素
            let $tooltip = $chart.find('.ffs-chart-sankey-tooltip');

            if (!$tooltip.length) {
                $tooltip = $('<div class="ffs-chart-sankey-tooltip"></div>');
                $chart.append($tooltip);
            }

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
        }

        // 隐藏桑基图工具提示
        function hideSankeyTooltip($chart) {
            const $tooltip = $chart.find('.ffs-chart-sankey-tooltip');

            if ($tooltip.length) {
                $tooltip.fadeOut(200);
            }
        }

        // 获取桑基图颜色
        function getSankeyColor(index) {
            const colors = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666',
                '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
            ];
            return colors[index % colors.length];
        }
    }

    /**
     * 初始化热力图
     * 处理热力图的交互和数据展示
     */
    function initHeatmapChart() {
        // 加载热力图数据
        $.fn.loadHeatmapData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-heatmap-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || !response.data || response.data.length === 0) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有内容
                        $content.empty();

                        // 渲染热力图
                        renderHeatmap($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('heatmap:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('heatmap:dataError', [error]);
                    }
                });
            });
        };

        // 更新热力图数据
        $.fn.updateHeatmapData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-heatmap-content');

                // 检查是否有数据
                if (!data || !data.data || data.data.length === 0) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有内容
                $content.empty();

                // 渲染热力图
                renderHeatmap($chart, data);

                // 触发数据更新事件
                $chart.trigger('heatmap:dataUpdated', [data]);
            });
        };

        // 渲染热力图
        function renderHeatmap($chart, data) {
            const $content = $chart.find('.ffs-chart-heatmap-content');

            // 获取数据
            const heatmapData = data.data || [];
            const xLabels = data.xLabels || [];
            const yLabels = data.yLabels || [];

            // 创建热力图容器
            const $heatmapContainer = $('<div class="ffs-chart-heatmap-container"></div>');

            // 计算单元格大小
            const cellWidth = 100 / (xLabels.length || 1);
            const cellHeight = 100 / (yLabels.length || 1);

            // 找出最大值和最小值，用于颜色映射
            let minValue = Number.MAX_VALUE;
            let maxValue = Number.MIN_VALUE;

            heatmapData.forEach(item => {
                minValue = Math.min(minValue, item.value);
                maxValue = Math.max(maxValue, item.value);
            });

            // 创建热力图单元格
            heatmapData.forEach(item => {
                // 计算颜色
                const normalizedValue = (item.value - minValue) / (maxValue - minValue || 1);
                const color = getHeatmapColor(normalizedValue);

                // 创建单元格
                const $cell = $(`
                                        <div class="ffs-chart-heatmap-cell" 
                                             style="left: ${item.x * cellWidth}%; 
                                                    top: ${item.y * cellHeight}%; 
                                                    width: ${cellWidth}%; 
                                                    height: ${cellHeight}%; 
                                                    background-color: ${color};">
                                                <div class="ffs-chart-heatmap-cell-value">${item.value}</div>
                                        </div>
                                `);

                // 设置单元格数据
                $cell.data('cell-data', item);

                // 添加鼠标事件
                $cell.on('mouseenter', function (e) {
                    // 高亮单元格
                    $(this).addClass('ffs-chart-heatmap-cell-hover');

                    // 显示工具提示
                    const cellData = $(this).data('cell-data');
                    const xLabel = xLabels[cellData.x] || '';
                    const yLabel = yLabels[cellData.y] || '';
                    const content = `
                                                <div><strong>${xLabel} - ${yLabel}</strong></div>
                                                <div>值: ${cellData.value}</div>
                                        `;
                    showHeatmapTooltip($chart, content, e.pageX, e.pageY);
                });

                $cell.on('mouseleave', function () {
                    // 移除高亮
                    $(this).removeClass('ffs-chart-heatmap-cell-hover');

                    // 隐藏工具提示
                    hideHeatmapTooltip($chart);
                });

                // 添加到容器
                $heatmapContainer.append($cell);
            });

            // 添加X轴标签
            if (xLabels.length) {
                const $xAxis = $('<div class="ffs-chart-heatmap-xaxis"></div>');

                xLabels.forEach((label, index) => {
                    const $label = $(`
                                                <div class="ffs-chart-heatmap-xaxis-label" 
                                                     style="left: ${index * cellWidth + cellWidth / 2}%;">
                                                        ${label}
                                                </div>
                                        `);

                    $xAxis.append($label);
                });

                $heatmapContainer.append($xAxis);
            }

            // 添加Y轴标签
            if (yLabels.length) {
                const $yAxis = $('<div class="ffs-chart-heatmap-yaxis"></div>');

                yLabels.forEach((label, index) => {
                    const $label = $(`
                                                <div class="ffs-chart-heatmap-yaxis-label" 
                                                     style="top: ${index * cellHeight + cellHeight / 2}%;">
                                                        ${label}
                                                </div>
                                        `);

                    $yAxis.append($label);
                });

                $heatmapContainer.append($yAxis);
            }

            // 添加图例
            const $legend = $('<div class="ffs-chart-heatmap-legend"></div>');
            const $legendGradient = $('<div class="ffs-chart-heatmap-legend-gradient"></div>');
            const $legendMin = $(`<div class="ffs-chart-heatmap-legend-min">${minValue}</div>`);
            const $legendMax = $(`<div class="ffs-chart-heatmap-legend-max">${maxValue}</div>`);

            $legend.append($legendMin, $legendGradient, $legendMax);
            $heatmapContainer.append($legend);

            // 添加容器到内容区域
            $content.append($heatmapContainer);
        }

        // 获取热力图颜色
        function getHeatmapColor(value) {
            // 使用从蓝色到红色的渐变
            const r = Math.floor(255 * value);
            const b = Math.floor(255 * (1 - value));
            return `rgb(${r}, 0, ${b})`;
        }

        // 显示热力图工具提示
        function showHeatmapTooltip($chart, content, x, y) {
            // 查找或创建工具提示元素
            let $tooltip = $chart.find('.ffs-chart-heatmap-tooltip');

            if (!$tooltip.length) {
                $tooltip = $('<div class="ffs-chart-heatmap-tooltip"></div>');
                $chart.append($tooltip);
            }

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
        }

        // 隐藏热力图工具提示
        function hideHeatmapTooltip($chart) {
            const $tooltip = $chart.find('.ffs-chart-heatmap-tooltip');

            if ($tooltip.length) {
                $tooltip.fadeOut(200);
            }
        }
    }

    /**
     * 初始化漏斗图
     * 处理漏斗图的交互和数据展示
     */
    function initFunnelChart() {
        // 加载漏斗图数据
        $.fn.loadFunnelData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-funnel-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || !response.data || response.data.length === 0) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有内容
                        $content.empty();

                        // 渲染漏斗图
                        renderFunnel($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('funnel:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('funnel:dataError', [error]);
                    }
                });
            });
        };

        // 更新漏斗图数据
        $.fn.updateFunnelData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-funnel-content');

                // 检查是否有数据
                if (!data || !data.data || data.data.length === 0) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有内容
                $content.empty();

                // 渲染漏斗图
                renderFunnel($chart, data);

                // 触发数据更新事件
                $chart.trigger('funnel:dataUpdated', [data]);
            });
        };

        // 渲染漏斗图
        function renderFunnel($chart, data) {
            const $content = $chart.find('.ffs-chart-funnel-content');

            // 获取数据
            const funnelData = data.data || [];

            // 创建漏斗图容器
            const $funnelContainer = $('<div class="ffs-chart-funnel-container"></div>');

            // 找出最大值，用于计算宽度比例
            let maxValue = 0;
            funnelData.forEach(item => {
                maxValue = Math.max(maxValue, item.value);
            });

            // 创建漏斗图项目
            funnelData.forEach((item, index) => {
                // 计算宽度比例
                const widthPercent = (item.value / maxValue) * 100;
                const marginLeft = (100 - widthPercent) / 2;

                // 获取颜色
                const color = item.color || getFunnelColor(index);

                // 创建漏斗项
                const $item = $(`
                                        <div class="ffs-chart-funnel-item">
                                                <div class="ffs-chart-funnel-item-bar" 
                                                     style="width: ${widthPercent}%; 
                                                            margin-left: ${marginLeft}%; 
                                                            background-color: ${color};">
                                                        <div class="ffs-chart-funnel-item-label">${item.name}</div>
                                                        <div class="ffs-chart-funnel-item-value">${item.value}</div>
                                                </div>
                                        </div>
                                `);

                // 设置项目数据
                $item.data('item-data', item);

                // 添加鼠标事件
                $item.on('mouseenter', function (e) {
                    // 高亮项目
                    $(this).find('.ffs-chart-funnel-item-bar').addClass('ffs-chart-funnel-item-hover');

                    // 显示工具提示
                    const itemData = $(this).data('item-data');
                    const content = `
                                                <div><strong>${itemData.name}</strong></div>
                                                <div>值: ${itemData.value}</div>
                                                ${itemData.percent ? `<div>占比: ${itemData.percent}%</div>` : ''}
                                        `;
                    showFunnelTooltip($chart, content, e.pageX, e.pageY);
                });

                $item.on('mouseleave', function () {
                    // 移除高亮
                    $(this).find('.ffs-chart-funnel-item-bar').removeClass('ffs-chart-funnel-item-hover');

                    // 隐藏工具提示
                    hideFunnelTooltip($chart);
                });

                // 添加到容器
                $funnelContainer.append($item);

                // 添加连接线（除了最后一项）
                if (index < funnelData.length - 1) {
                    const nextItem = funnelData[index + 1];
                    const nextWidthPercent = (nextItem.value / maxValue) * 100;
                    const nextMarginLeft = (100 - nextWidthPercent) / 2;

                    // 创建连接线
                    const $connector = $(`
                                        <div class="ffs-chart-funnel-connector" 
                                             style="width: ${Math.max(widthPercent, nextWidthPercent)}%; 
                                                    margin-left: ${Math.min(marginLeft, nextMarginLeft)}%;">
                                        </div>
                                `);

                    $funnelContainer.append($connector);
                }
            });

            // 添加容器到内容区域
            $content.append($funnelContainer);

            // 添加图例（如果有多个项目）
            if (funnelData.length > 1) {
                const $legend = $('<div class="ffs-chart-funnel-legend"></div>');

                funnelData.forEach((item, index) => {
                    const color = item.color || getFunnelColor(index);
                    const $item = $(`
                                                <div class="ffs-chart-funnel-legend-item">
                                                        <span class="ffs-chart-funnel-legend-color" style="background-color: ${color};"></span>
                                                        <span class="ffs-chart-funnel-legend-label">${item.name}</span>
                                                </div>
                                        `);

                    $legend.append($item);
                });

                $content.append($legend);
            }
        }

        // 获取漏斗图颜色
        function getFunnelColor(index) {
            const colors = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666',
                '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
            ];
            return colors[index % colors.length];
        }

        // 显示漏斗图工具提示
        function showFunnelTooltip($chart, content, x, y) {
            // 查找或创建工具提示元素
            let $tooltip = $chart.find('.ffs-chart-funnel-tooltip');

            if (!$tooltip.length) {
                $tooltip = $('<div class="ffs-chart-funnel-tooltip"></div>');
                $chart.append($tooltip);
            }

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
        }

        // 隐藏漏斗图工具提示
        function hideFunnelTooltip($chart) {
            const $tooltip = $chart.find('.ffs-chart-funnel-tooltip');

            if ($tooltip.length) {
                $tooltip.fadeOut(200);
            }
        }
    }

    /**
     * 初始化仪表盘
     * 处理仪表盘的交互和数据展示
     */
    function initGaugeChart() {
        // 加载仪表盘数据
        $.fn.loadGaugeData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-gauge-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || response.value === undefined) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有内容
                        $content.empty();

                        // 渲染仪表盘
                        renderGauge($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('gauge:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('gauge:dataError', [error]);
                    }
                });
            });
        };

        // 更新仪表盘数据
        $.fn.updateGaugeData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-gauge-content');

                // 检查是否有数据
                if (!data || data.value === undefined) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有内容
                $content.empty();

                // 渲染仪表盘
                renderGauge($chart, data);

                // 触发数据更新事件
                $chart.trigger('gauge:dataUpdated', [data]);
            });
        };

        // 渲染仪表盘
        function renderGauge($chart, data) {
            const $content = $chart.find('.ffs-chart-gauge-content');

            // 获取数据
            const value = data.value || 0;
            const min = data.min !== undefined ? data.min : 0;
            const max = data.max !== undefined ? data.max : 100;
            const title = data.title || '';
            const unit = data.unit || '';
            const color = data.color || '#5470c6';
            const thresholds = data.thresholds || [];

            // 创建SVG
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'ffs-chart-gauge-svg');
            svg.setAttribute('viewBox', '0 0 200 150');

            // 计算中心点和半径
            const centerX = 100;
            const centerY = 100;
            const radius = 80;

            // 计算角度
            const startAngle = -Math.PI * 0.75; // -135度
            const endAngle = Math.PI * 0.25; // 45度
            const totalAngle = endAngle - startAngle;
            const valueAngle = startAngle + totalAngle * ((value - min) / (max - min));

            // 创建背景弧
            const bgArc = document.createElementNS(svgNS, 'path');
            const bgArcPath = describeArc(centerX, centerY, radius, startAngle * 180 / Math.PI, endAngle * 180 / Math.PI);
            bgArc.setAttribute('d', bgArcPath);
            bgArc.setAttribute('class', 'ffs-chart-gauge-bg-arc');
            bgArc.setAttribute('fill', 'none');
            bgArc.setAttribute('stroke', '#e0e0e0');
            bgArc.setAttribute('stroke-width', '10');
            svg.appendChild(bgArc);

            // 创建阈值标记
            thresholds.forEach(threshold => {
                const thresholdValue = threshold.value;
                const thresholdColor = threshold.color || '#ff0000';
                const thresholdAngle = startAngle + totalAngle * ((thresholdValue - min) / (max - min));
                const thresholdX = centerX + (radius + 5) * Math.cos(thresholdAngle);
                const thresholdY = centerY + (radius + 5) * Math.sin(thresholdAngle);

                // 创建阈值标记
                const thresholdMarker = document.createElementNS(svgNS, 'circle');
                thresholdMarker.setAttribute('cx', thresholdX);
                thresholdMarker.setAttribute('cy', thresholdY);
                thresholdMarker.setAttribute('r', '3');
                thresholdMarker.setAttribute('fill', thresholdColor);
                svg.appendChild(thresholdMarker);
            });

            // 创建值弧
            const valueArc = document.createElementNS(svgNS, 'path');
            const valueArcPath = describeArc(centerX, centerY, radius, startAngle * 180 / Math.PI, valueAngle * 180 / Math.PI);
            valueArc.setAttribute('d', valueArcPath);
            valueArc.setAttribute('class', 'ffs-chart-gauge-value-arc');
            valueArc.setAttribute('fill', 'none');
            valueArc.setAttribute('stroke', color);
            valueArc.setAttribute('stroke-width', '10');
            svg.appendChild(valueArc);

            // 创建指针
            const pointer = document.createElementNS(svgNS, 'line');
            pointer.setAttribute('x1', centerX);
            pointer.setAttribute('y1', centerY);
            pointer.setAttribute('x2', centerX + radius * 0.8 * Math.cos(valueAngle));
            pointer.setAttribute('y2', centerY + radius * 0.8 * Math.sin(valueAngle));
            pointer.setAttribute('class', 'ffs-chart-gauge-pointer');
            pointer.setAttribute('stroke', color);
            pointer.setAttribute('stroke-width', '2');
            svg.appendChild(pointer);

            // 创建指针中心点
            const pointerCenter = document.createElementNS(svgNS, 'circle');
            pointerCenter.setAttribute('cx', centerX);
            pointerCenter.setAttribute('cy', centerY);
            pointerCenter.setAttribute('r', '5');
            pointerCenter.setAttribute('class', 'ffs-chart-gauge-pointer-center');
            pointerCenter.setAttribute('fill', color);
            svg.appendChild(pointerCenter);

            // 创建值文本
            const valueText = document.createElementNS(svgNS, 'text');
            valueText.setAttribute('x', centerX);
            valueText.setAttribute('y', centerY + 30);
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('class', 'ffs-chart-gauge-value-text');
            valueText.textContent = `${value}${unit}`;
            svg.appendChild(valueText);

            // 创建标题文本
            if (title) {
                const titleText = document.createElementNS(svgNS, 'text');
                titleText.setAttribute('x', centerX);
                titleText.setAttribute('y', centerY + 50);
                titleText.setAttribute('text-anchor', 'middle');
                titleText.setAttribute('class', 'ffs-chart-gauge-title-text');
                titleText.textContent = title;
                svg.appendChild(titleText);
            }

            // 创建刻度
            const tickCount = 5;
            for (let i = 0; i <= tickCount; i++) {
                const tickValue = min + (max - min) * (i / tickCount);
                const tickAngle = startAngle + totalAngle * (i / tickCount);
                const tickOuterX = centerX + radius * Math.cos(tickAngle);
                const tickOuterY = centerY + radius * Math.sin(tickAngle);
                const tickInnerX = centerX + (radius - 10) * Math.cos(tickAngle);
                const tickInnerY = centerY + (radius - 10) * Math.sin(tickAngle);
                const tickLabelX = centerX + (radius + 15) * Math.cos(tickAngle);
                const tickLabelY = centerY + (radius + 15) * Math.sin(tickAngle);

                // 创建刻度线
                const tick = document.createElementNS(svgNS, 'line');
                tick.setAttribute('x1', tickInnerX);
                tick.setAttribute('y1', tickInnerY);
                tick.setAttribute('x2', tickOuterX);
                tick.setAttribute('y2', tickOuterY);
                tick.setAttribute('class', 'ffs-chart-gauge-tick');
                tick.setAttribute('stroke', '#999');
                tick.setAttribute('stroke-width', '1');
                svg.appendChild(tick);

                // 创建刻度标签
                const tickLabel = document.createElementNS(svgNS, 'text');
                tickLabel.setAttribute('x', tickLabelX);
                tickLabel.setAttribute('y', tickLabelY);
                tickLabel.setAttribute('text-anchor', 'middle');
                tickLabel.setAttribute('class', 'ffs-chart-gauge-tick-label');
                tickLabel.textContent = tickValue;
                svg.appendChild(tickLabel);
            }

            // 添加SVG到内容区域
            $content.append(svg);
        }

        // 描述弧形路径
        function describeArc(x, y, radius, startAngle, endAngle) {
            const start = polarToCartesian(x, y, radius, endAngle);
            const end = polarToCartesian(x, y, radius, startAngle);
            const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
            return [
                'M', start.x, start.y,
                'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
            ].join(' ');
        }

        // 极坐标转笛卡尔坐标
        function polarToCartesian(x, y, radius, angleInDegrees) {
            const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
                x: x + (radius * Math.cos(angleInRadians)),
                y: y + (radius * Math.sin(angleInRadians))
            };
        }
    }

    /**
     * 初始化雷达图
     * 处理雷达图的交互和数据展示
     */
    function initRadarChart() {
        // 加载雷达图数据
        $.fn.loadRadarData = function (url, params) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-radar-content');

                // 显示加载状态
                showChartLoading($chart);

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function (response) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 检查是否有数据
                        if (!response || !response.indicators || !response.series || response.series.length === 0) {
                            // 显示空状态
                            showChartEmpty($chart);
                            return;
                        }

                        // 隐藏空状态
                        hideChartEmpty($chart);

                        // 清除现有内容
                        $content.empty();

                        // 渲染雷达图
                        renderRadar($chart, response);

                        // 触发数据加载成功事件
                        $chart.trigger('radar:dataLoaded', [response]);
                    },
                    error: function (xhr, status, error) {
                        // 隐藏加载状态
                        hideChartLoading($chart);

                        // 显示错误状态
                        showChartEmpty($chart, '数据加载失败');

                        // 触发数据加载失败事件
                        $chart.trigger('radar:dataError', [error]);
                    }
                });
            });
        };

        // 更新雷达图数据
        $.fn.updateRadarData = function (data) {
            return this.each(function () {
                const $chart = $(this);
                const $content = $chart.find('.ffs-chart-radar-content');

                // 检查是否有数据
                if (!data || !data.indicators || !data.series || data.series.length === 0) {
                    // 显示空状态
                    showChartEmpty($chart);
                    return;
                }

                // 隐藏空状态
                hideChartEmpty($chart);

                // 清除现有内容
                $content.empty();

                // 渲染雷达图
                renderRadar($chart, data);

                // 触发数据更新事件
                $chart.trigger('radar:dataUpdated', [data]);
            });
        };

        // 渲染雷达图
        function renderRadar($chart, data) {
            const $content = $chart.find('.ffs-chart-radar-content');

            // 获取数据
            const indicators = data.indicators || [];
            const series = data.series || [];
            const max = data.max !== undefined ? data.max : Math.max(...series.map(serie => Math.max(...serie.data)));

            // 创建SVG
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'ffs-chart-radar-svg');
            svg.setAttribute('viewBox', '0 0 300 300');

            // 计算中心点和半径
            const centerX = 150;
            const centerY = 150;
            const radius = 120;

            // 计算每个指标的角度
            const angleStep = (Math.PI * 2) / indicators.length;

            // 创建背景多边形（网格）
            const gridLevels = 5;
            for (let level = 1; level <= gridLevels; level++) {
                const gridRadius = radius * (level / gridLevels);
                let gridPoints = '';

                for (let i = 0; i < indicators.length; i++) {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = centerX + gridRadius * Math.cos(angle);
                    const y = centerY + gridRadius * Math.sin(angle);

                    if (i === 0) {
                        gridPoints += `${x},${y}`;
                    } else {
                        gridPoints += ` ${x},${y}`;
                    }
                }

                const gridPolygon = document.createElementNS(svgNS, 'polygon');
                gridPolygon.setAttribute('points', gridPoints);
                gridPolygon.setAttribute('class', 'ffs-chart-radar-grid');
                gridPolygon.setAttribute('fill', 'none');
                gridPolygon.setAttribute('stroke', '#e0e0e0');
                gridPolygon.setAttribute('stroke-width', '1');
                svg.appendChild(gridPolygon);
            }

            // 创建轴线
            for (let i = 0; i < indicators.length; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                const axisLine = document.createElementNS(svgNS, 'line');
                axisLine.setAttribute('x1', centerX);
                axisLine.setAttribute('y1', centerY);
                axisLine.setAttribute('x2', x);
                axisLine.setAttribute('y2', y);
                axisLine.setAttribute('class', 'ffs-chart-radar-axis');
                axisLine.setAttribute('stroke', '#e0e0e0');
                axisLine.setAttribute('stroke-width', '1');
                svg.appendChild(axisLine);

                // 创建指标标签
                const labelX = centerX + (radius + 20) * Math.cos(angle);
                const labelY = centerY + (radius + 20) * Math.sin(angle);

                const label = document.createElementNS(svgNS, 'text');
                label.setAttribute('x', labelX);
                label.setAttribute('y', labelY);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('class', 'ffs-chart-radar-label');
                label.textContent = indicators[i].name;
                svg.appendChild(label);
            }

            // 创建数据多边形
            series.forEach((serie, serieIndex) => {
                const color = serie.color || getRadarColor(serieIndex);
                let points = '';

                // 创建数据点
                const dataPoints = [];
                for (let i = 0; i < indicators.length; i++) {
                    const value = serie.data[i] || 0;
                    const ratio = value / max;
                    const angle = i * angleStep - Math.PI / 2;
                    const x = centerX + radius * ratio * Math.cos(angle);
                    const y = centerY + radius * ratio * Math.sin(angle);

                    dataPoints.push({
                        x,
                        y,
                        value,
                        indicator: indicators[i]
                    });

                    if (i === 0) {
                        points += `${x},${y}`;
                    } else {
                        points += ` ${x},${y}`;
                    }
                }

                // 创建数据多边形
                const polygon = document.createElementNS(svgNS, 'polygon');
                polygon.setAttribute('points', points);
                polygon.setAttribute('class', 'ffs-chart-radar-polygon');
                polygon.setAttribute('fill', color);
                polygon.setAttribute('fill-opacity', '0.2');
                polygon.setAttribute('stroke', color);
                polygon.setAttribute('stroke-width', '2');
                polygon.setAttribute('data-serie-index', serieIndex);
                svg.appendChild(polygon);

                // 创建数据点
                dataPoints.forEach((point, pointIndex) => {
                    const dataPoint = document.createElementNS(svgNS, 'circle');
                    dataPoint.setAttribute('cx', point.x);
                    dataPoint.setAttribute('cy', point.y);
                    dataPoint.setAttribute('r', '4');
                    dataPoint.setAttribute('class', 'ffs-chart-radar-point');
                    dataPoint.setAttribute('fill', color);
                    dataPoint.setAttribute('data-serie-index', serieIndex);
                    dataPoint.setAttribute('data-point-index', pointIndex);
                    dataPoint.setAttribute('data-value', point.value);
                    dataPoint.setAttribute('data-indicator', point.indicator.name);
                    svg.appendChild(dataPoint);

                    // 添加鼠标事件
                    $(dataPoint).on('mouseenter', function (e) {
                        // 高亮点
                        $(this).attr('r', '6');

                        // 显示工具提示
                        const serieIndex = $(this).data('serie-index');
                        const pointIndex = $(this).data('point-index');
                        const value = $(this).data('value');
                        const indicator = $(this).data('indicator');
                        const serieName = series[serieIndex].name;
                        const content = `
                                                    <div><strong>${serieName}</strong></div>
                                                    <div>${indicator}: ${value}</div>
                                            `;
                        showRadarTooltip($chart, content, e.pageX, e.pageY);
                    });

                    $(dataPoint).on('mouseleave', function () {
                        // 恢复点大小
                        $(this).attr('r', '4');

                        // 隐藏工具提示
                        hideRadarTooltip($chart);
                    });
                });
            });

            // 添加图例
            if (series.length > 1) {
                const $legend = $('<div class="ffs-chart-radar-legend"></div>');

                series.forEach((serie, index) => {
                    const color = serie.color || getRadarColor(index);
                    const $item = $(`
                                            <div class="ffs-chart-radar-legend-item">
                                                    <span class="ffs-chart-radar-legend-color" style="background-color: ${color};"></span>
                                                    <span class="ffs-chart-radar-legend-label">${serie.name}</span>
                                            </div>
                                    `);

                    $legend.append($item);
                });

                $content.append($legend);
            }

            // 添加SVG到内容区域
            $content.append(svg);
        }

        // 获取雷达图颜色
        function getRadarColor(index) {
            const colors = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666',
                '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
            ];
            return colors[index % colors.length];
        }

        // 显示雷达图工具提示
        function showRadarTooltip($chart, content, x, y) {
            // 查找或创建工具提示元素
            let $tooltip = $chart.find('.ffs-chart-radar-tooltip');

            if (!$tooltip.length) {
                $tooltip = $('<div class="ffs-chart-radar-tooltip"></div>');
                $chart.append($tooltip);
            }

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
        }

        // 隐藏雷达图工具提示
        function hideRadarTooltip($chart) {
            const $tooltip = $chart.find('.ffs-chart-radar-tooltip');

            if ($tooltip.length) {
                $tooltip.fadeOut(200);
            }
        }
    }

    // 显示图表加载状态
    function showChartLoading($chart) {
        // 隐藏空状态
        hideChartEmpty($chart);

        // 查找或创建加载元素
        let $loading = $chart.find('.ffs-chart-loading');

        if (!$loading.length) {
            $loading = $('<div class="ffs-chart-loading"><div class="ffs-chart-loading-spinner"></div></div>');
            $chart.append($loading);
        }

        // 显示加载元素
        $loading.show();
    }

    // 隐藏图表加载状态
    function hideChartLoading($chart) {
        const $loading = $chart.find('.ffs-chart-loading');

        if ($loading.length) {
            $loading.hide();
        }
    }

    // 显示图表空状态
    function showChartEmpty($chart, message) {
        // 隐藏加载状态
        hideChartLoading($chart);

        // 查找或创建空状态元素
        let $empty = $chart.find('.ffs-chart-empty');

        if (!$empty.length) {
            $empty = $('<div class="ffs-chart-empty"></div>');
            $chart.append($empty);
        }

        // 更新消息
        $empty.html(message || '暂无数据');

        // 显示空状态元素
        $empty.show();
    }

    // 隐藏图表空状态
    function hideChartEmpty($chart) {
        const $empty = $chart.find('.ffs-chart-empty');

        if ($empty.length) {
            $empty.hide();
        }
    }

    // 初始化所有图表组件
    function initAllCharts() {
        initHeatmapChart();
        initFunnelChart();
        initGaugeChart();
        initRadarChart();
    }

    // 在文档加载完成后初始化
    $(document).ready(function () {
        initAllCharts();
    });

    // 导出公共API
    return {
        initHeatmapChart: initHeatmapChart,
        initFunnelChart: initFunnelChart,
        initGaugeChart: initGaugeChart,
        initRadarChart: initRadarChart,
        initAllCharts: initAllCharts
    };
})();

// 将图表组件添加到FFS命名空间
FFS.Chart = FFS.Chart || {};
FFS.Chart.Pro = ProCharts;

// 将模块导出到全局FFS命名空间
(function($, FFS) {
    FFS = FFS || {};
    FFS.Chart = FFS.Chart || {};
    FFS.Chart.Pro = ProCharts;
})(jQuery, window.FFS);