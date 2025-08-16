/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * FFS UI - 地图图表组件
 * 提供地理地图、热力地图、点状地图和路线地图的交互功能
 */
(function($) {
    'use strict';

    /**
     * 初始化地理地图
     * 处理地理地图的交互和数据展示
     */
    function initGeoMap() {
        // 地理地图鼠标移动事件
        $(document).on('mousemove', '.ffs-chart-geomap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-geomap');
            
            // 计算相对位置
            const offset = $mapContent.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 触发鼠标移动事件
            $map.trigger('geomap:mouseMove', [x, y, e]);
        });
        
        // 地理地图鼠标离开事件
        $(document).on('mouseleave', '.ffs-chart-geomap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-geomap');
            
            // 隐藏工具提示
            hideGeoMapTooltip($map);
            
            // 触发鼠标离开事件
            $map.trigger('geomap:mouseLeave', [e]);
        });
        
        // 地理地图点击事件
        $(document).on('click', '.ffs-chart-geomap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-geomap');
            
            // 计算相对位置
            const offset = $mapContent.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 触发点击事件
            $map.trigger('geomap:click', [x, y, e]);
        });
        
        // 地理地图区域点击事件
        $(document).on('click', '.ffs-chart-geomap-region', function(e) {
            const $region = $(this);
            const $map = $region.closest('.ffs-chart-geomap');
            const regionId = $region.data('region-id');
            const regionName = $region.data('region-name');
            
            // 阻止事件冒泡
            e.stopPropagation();
            
            // 触发区域点击事件
            $map.trigger('geomap:regionClick', [regionId, regionName, $region, e]);
        });
        
        // 显示地理地图工具提示
        function showGeoMapTooltip($map, content, x, y) {
            // 查找或创建工具提示元素
            let $tooltip = $map.find('.ffs-chart-geomap-tooltip');
            
            if (!$tooltip.length) {
                $tooltip = $('<div class="ffs-chart-geomap-tooltip"></div>');
                $map.append($tooltip);
            }
            
            // 更新工具提示内容
            $tooltip.html(content);
            
            // 计算位置，确保不超出地图边界
            const tooltipWidth = $tooltip.outerWidth();
            const tooltipHeight = $tooltip.outerHeight();
            const mapWidth = $map.width();
            const mapHeight = $map.height();
            
            // 调整X坐标，确保不超出右边界
            if (x + tooltipWidth > mapWidth) {
                x = mapWidth - tooltipWidth - 10;
            }
            
            // 调整Y坐标，确保不超出下边界
            if (y + tooltipHeight > mapHeight) {
                y = y - tooltipHeight - 10;
            }
            
            // 设置位置并显示
            $tooltip.css({
                left: x + 'px',
                top: y + 'px'
            }).fadeIn(200);
        }
        
        // 隐藏地理地图工具提示
        function hideGeoMapTooltip($map) {
            const $tooltip = $map.find('.ffs-chart-geomap-tooltip');
            
            if ($tooltip.length) {
                $tooltip.fadeOut(200);
            }
        }
        
        // 为地理地图添加工具提示方法
        $.fn.showGeoMapTooltip = function(content, x, y) {
            return this.each(function() {
                const $map = $(this);
                showGeoMapTooltip($map, content, x, y);
            });
        };
        
        $.fn.hideGeoMapTooltip = function() {
            return this.each(function() {
                const $map = $(this);
                hideGeoMapTooltip($map);
            });
        };
        
        // 加载地理地图数据
        $.fn.loadGeoMapData = function(url, params) {
            return this.each(function() {
                const $map = $(this);
                const $content = $map.find('.ffs-chart-geomap-content');
                
                // 显示加载状态
                showMapLoading($map);
                
                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function(response) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 检查是否有数据
                        if (!response || (Array.isArray(response) && response.length === 0)) {
                            // 显示空状态
                            showMapEmpty($map);
                            return;
                        }
                        
                        // 隐藏空状态
                        hideMapEmpty($map);
                        
                        // 触发数据加载成功事件
                        $map.trigger('geomap:dataLoaded', [response]);
                    },
                    error: function(xhr, status, error) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 显示错误状态
                        showMapEmpty($map, '数据加载失败');
                        
                        // 触发数据加载失败事件
                        $map.trigger('geomap:dataError', [error]);
                    }
                });
            });
        };
    }
    
    /**
     * 初始化热力地图
     * 处理热力地图的交互和数据展示
     */
    function initHeatMap() {
        // 热力地图鼠标移动事件
        $(document).on('mousemove', '.ffs-chart-heatmap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-heatmap');
            
            // 计算相对位置
            const offset = $mapContent.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 触发鼠标移动事件
            $map.trigger('heatmap:mouseMove', [x, y, e]);
        });
        
        // 热力地图鼠标离开事件
        $(document).on('mouseleave', '.ffs-chart-heatmap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-heatmap');
            
            // 触发鼠标离开事件
            $map.trigger('heatmap:mouseLeave', [e]);
        });
        
        // 热力地图点击事件
        $(document).on('click', '.ffs-chart-heatmap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-heatmap');
            
            // 计算相对位置
            const offset = $mapContent.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 触发点击事件
            $map.trigger('heatmap:click', [x, y, e]);
        });
        
        // 热力地图图例项点击事件
        $(document).on('click', '.ffs-chart-heatmap-legend-item', function() {
            const $legendItem = $(this);
            const $map = $legendItem.closest('.ffs-chart-heatmap');
            const value = $legendItem.data('value');
            
            // 切换图例项状态
            $legendItem.toggleClass('disabled');
            
            // 获取图例项状态
            const isDisabled = $legendItem.hasClass('disabled');
            
            // 触发图例点击事件
            $map.trigger('heatmap:legendToggle', [value, isDisabled]);
        });
        
        // 加载热力地图数据
        $.fn.loadHeatMapData = function(url, params) {
            return this.each(function() {
                const $map = $(this);
                const $content = $map.find('.ffs-chart-heatmap-content');
                
                // 显示加载状态
                showMapLoading($map);
                
                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function(response) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 检查是否有数据
                        if (!response || (Array.isArray(response) && response.length === 0)) {
                            // 显示空状态
                            showMapEmpty($map);
                            return;
                        }
                        
                        // 隐藏空状态
                        hideMapEmpty($map);
                        
                        // 触发数据加载成功事件
                        $map.trigger('heatmap:dataLoaded', [response]);
                    },
                    error: function(xhr, status, error) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 显示错误状态
                        showMapEmpty($map, '数据加载失败');
                        
                        // 触发数据加载失败事件
                        $map.trigger('heatmap:dataError', [error]);
                    }
                });
            });
        };
        
        // 更新热力地图图例
        $.fn.updateHeatMapLegend = function(legendData) {
            return this.each(function() {
                const $map = $(this);
                let $legend = $map.find('.ffs-chart-heatmap-legend');
                
                // 如果没有图例容器，则创建
                if (!$legend.length) {
                    $legend = $('<div class="ffs-chart-heatmap-legend"></div>');
                    $map.append($legend);
                }
                
                // 清空现有图例
                $legend.empty();
                
                // 添加新图例项
                if (Array.isArray(legendData)) {
                    legendData.forEach(function(item) {
                        const $item = $(`
                            <div class="ffs-chart-heatmap-legend-item" data-value="${item.value}">
                                <div class="ffs-chart-heatmap-legend-color" style="background-color: ${item.color}"></div>
                                <div class="ffs-chart-heatmap-legend-label">${item.label}</div>
                            </div>
                        `);
                        
                        $legend.append($item);
                    });
                }
            });
        };
    }
    
    /**
     * 初始化点状地图
     * 处理点状地图的交互和数据展示
     */
    function initPointMap() {
        // 点状地图标记点击事件
        $(document).on('click', '.ffs-chart-pointmap-marker', function(e) {
            const $marker = $(this);
            const $map = $marker.closest('.ffs-chart-pointmap');
            const markerId = $marker.data('marker-id');
            const markerData = $marker.data('marker-data');
            
            // 阻止事件冒泡
            e.stopPropagation();
            
            // 显示或隐藏弹出框
            togglePointMapPopup($map, $marker);
            
            // 触发标记点击事件
            $map.trigger('pointmap:markerClick', [markerId, markerData, $marker, e]);
        });
        
        // 点状地图点击事件（关闭弹出框）
        $(document).on('click', '.ffs-chart-pointmap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-pointmap');
            
            // 隐藏所有弹出框
            hidePointMapPopups($map);
        });
        
        // 显示或隐藏点状地图弹出框
        function togglePointMapPopup($map, $marker) {
            // 获取当前弹出框
            const $currentPopup = $map.find('.ffs-chart-pointmap-popup');
            const markerId = $marker.data('marker-id');
            
            // 如果已有弹出框且属于当前标记，则隐藏
            if ($currentPopup.length && $currentPopup.data('marker-id') === markerId) {
                $currentPopup.fadeOut(200, function() {
                    $currentPopup.remove();
                });
                return;
            }
            
            // 隐藏所有弹出框
            hidePointMapPopups($map);
            
            // 获取标记数据
            const markerData = $marker.data('marker-data') || {};
            const title = markerData.title || '位置信息';
            const content = markerData.content || '';
            
            // 创建弹出框
            const $popup = $(`
                <div class="ffs-chart-pointmap-popup" data-marker-id="${markerId}">
                    <div class="ffs-chart-pointmap-popup-title">${title}</div>
                    <div class="ffs-chart-pointmap-popup-content">${content}</div>
                </div>
            `);
            
            // 添加到地图
            $map.append($popup);
            
            // 计算弹出框位置
            const markerOffset = $marker.offset();
            const mapOffset = $map.offset();
            const markerX = markerOffset.left - mapOffset.left;
            const markerY = markerOffset.top - mapOffset.top;
            
            // 设置弹出框位置（在标记点上方）
            $popup.css({
                left: markerX + 'px',
                top: (markerY - $popup.outerHeight() - 10) + 'px'
            }).fadeIn(200);
            
            // 如果弹出框超出了地图顶部，则显示在标记点下方
            if (parseInt($popup.css('top')) < 0) {
                $popup.css({
                    top: (markerY + $marker.outerHeight() + 10) + 'px'
                });
            }
        }
        
        // 隐藏所有点状地图弹出框
        function hidePointMapPopups($map) {
            const $popups = $map.find('.ffs-chart-pointmap-popup');
            
            if ($popups.length) {
                $popups.fadeOut(200, function() {
                    $popups.remove();
                });
            }
        }
        
        // 加载点状地图数据
        $.fn.loadPointMapData = function(url, params) {
            return this.each(function() {
                const $map = $(this);
                const $content = $map.find('.ffs-chart-pointmap-content');
                
                // 显示加载状态
                showMapLoading($map);
                
                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function(response) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 检查是否有数据
                        if (!response || (Array.isArray(response) && response.length === 0)) {
                            // 显示空状态
                            showMapEmpty($map);
                            return;
                        }
                        
                        // 隐藏空状态
                        hideMapEmpty($map);
                        
                        // 清除现有标记
                        $content.find('.ffs-chart-pointmap-marker').remove();
                        
                        // 添加新标记
                        if (Array.isArray(response)) {
                            response.forEach(function(point, index) {
                                addPointMapMarker($map, point, index);
                            });
                        }
                        
                        // 触发数据加载成功事件
                        $map.trigger('pointmap:dataLoaded', [response]);
                    },
                    error: function(xhr, status, error) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 显示错误状态
                        showMapEmpty($map, '数据加载失败');
                        
                        // 触发数据加载失败事件
                        $map.trigger('pointmap:dataError', [error]);
                    }
                });
            });
        };
        
        // 添加点状地图标记
        function addPointMapMarker($map, point, index) {
            const $content = $map.find('.ffs-chart-pointmap-content');
            
            // 检查点数据是否有效
            if (!point || typeof point.x === 'undefined' || typeof point.y === 'undefined') {
                console.warn('无效的点数据:', point);
                return;
            }
            
            // 创建标记元素
            const $marker = $(`
                <div class="ffs-chart-pointmap-marker" 
                     data-marker-id="${point.id || index}" 
                     style="left: ${point.x}px; top: ${point.y}px;">
                </div>
            `);
            
            // 设置标记数据
            $marker.data('marker-data', point);
            
            // 如果有自定义样式
            if (point.color) {
                $marker.css('background-color', point.color);
            }
            
            if (point.size) {
                $marker.css({
                    width: point.size + 'px',
                    height: point.size + 'px'
                });
            }
            
            // 添加到地图内容区域
            $content.append($marker);
            
            return $marker;
        }
    }
    
    /**
     * 初始化路线地图
     * 处理路线地图的交互和数据展示
     */
    function initRouteMap() {
        // 路线地图点击事件
        $(document).on('click', '.ffs-chart-routemap-content', function(e) {
            const $mapContent = $(this);
            const $map = $mapContent.closest('.ffs-chart-routemap');
            
            // 计算相对位置
            const offset = $mapContent.offset();
            const x = e.pageX - offset.left;
            const y = e.pageY - offset.top;
            
            // 触发点击事件
            $map.trigger('routemap:click', [x, y, e]);
        });
        
        // 路线地图点点击事件
        $(document).on('click', '.ffs-chart-routemap-point', function(e) {
            const $point = $(this);
            const $map = $point.closest('.ffs-chart-routemap');
            const pointId = $point.data('point-id');
            const pointData = $point.data('point-data');
            const pointType = $point.data('point-type');
            
            // 阻止事件冒泡
            e.stopPropagation();
            
            // 触发点点击事件
            $map.trigger('routemap:pointClick', [pointId, pointData, pointType, $point, e]);
        });
        
        // 加载路线地图数据
        $.fn.loadRouteMapData = function(url, params) {
            return this.each(function() {
                const $map = $(this);
                const $content = $map.find('.ffs-chart-routemap-content');
                
                // 显示加载状态
                showMapLoading($map);
                
                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    dataType: 'json',
                    success: function(response) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 检查是否有数据
                        if (!response || !response.points || response.points.length === 0) {
                            // 显示空状态
                            showMapEmpty($map);
                            return;
                        }
                        
                        // 隐藏空状态
                        hideMapEmpty($map);
                        
                        // 清除现有路线和点
                        $content.find('.ffs-chart-routemap-route, .ffs-chart-routemap-point').remove();
                        
                        // 绘制路线
                        drawRouteMapPath($map, response.points);
                        
                        // 添加路线点
                        response.points.forEach(function(point, index) {
                            addRouteMapPoint($map, point, index, response.points.length);
                        });
                        
                        // 触发数据加载成功事件
                        $map.trigger('routemap:dataLoaded', [response]);
                    },
                    error: function(xhr, status, error) {
                        // 隐藏加载状态
                        hideMapLoading($map);
                        
                        // 显示错误状态
                        showMapEmpty($map, '数据加载失败');
                        
                        // 触发数据加载失败事件
                        $map.trigger('routemap:dataError', [error]);
                    }
                });
            });
        };
        
        // 绘制路线地图路径
        function drawRouteMapPath($map, points) {
            const $content = $map.find('.ffs-chart-routemap-content');
            
            // 检查点数据是否有效
            if (!points || points.length < 2) {
                console.warn('路线点数据不足');
                return;
            }
            
            // 创建SVG路径
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'ffs-chart-routemap-route');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            
            // 创建路径元素
            const path = document.createElementNS(svgNS, 'path');
            
            // 构建路径数据
            let pathData = `M ${points[0].x} ${points[0].y}`;
            
            for (let i = 1; i < points.length; i++) {
                pathData += ` L ${points[i].x} ${points[i].y}`;
            }
            
            path.setAttribute('d', pathData);
            
            // 添加路径到SVG
            svg.appendChild(path);
            
            // 添加SVG到地图内容区域
            $content.append(svg);
        }
        
        // 添加路线地图点
        function addRouteMapPoint($map, point, index, total) {
            const $content = $map.find('.ffs-chart-routemap-content');
            
            // 检查点数据是否有效
            if (!point || typeof point.x === 'undefined' || typeof point.y === 'undefined') {
                console.warn('无效的点数据:', point);
                return;
            }
            
            // 确定点类型
            let pointType = 'mid';
            if (index === 0) {
                pointType = 'start';
            } else if (index === total - 1) {
                pointType = 'end';
            }
            
            // 创建点元素
            const $point = $(`
                <div class="ffs-chart-routemap-point ffs-chart-routemap-point-${pointType}" 
                     data-point-id="${point.id || index}" 
                     data-point-type="${pointType}"
                     style="left: ${point.x}px; top: ${point.y}px;">
                </div>
            `);
            
            // 设置点数据
            $point.data('point-data', point);
            
            // 添加到地图内容区域
            $content.append($point);
            
            return $point;
        }
    }
    
    /**
     * 显示地图加载状态
     * @param {jQuery} $map 地图容器
     */
    function showMapLoading($map) {
        // 如果已有加载状态，则不重复创建
        if ($map.find('.ffs-chart-loading').length) {
            return;
        }
        
        // 创建加载状态元素
        const $loading = $(`
            <div class="ffs-chart-loading">
                <div class="ffs-chart-loading-spinner"></div>
            </div>
        `);
        
        // 添加到地图容器
        $map.append($loading);
        
        // 触发加载开始事件
        $map.trigger('map:loadingStart');
    }
    
    /**
     * 隐藏地图加载状态
     * @param {jQuery} $map 地图容器
     */
    function hideMapLoading($map) {
        const $loading = $map.find('.ffs-chart-loading');
        
        // 如果有加载状态，则移除
        if ($loading.length) {
            $loading.fadeOut(300, function() {
                $loading.remove();
                
                // 触发加载结束事件
                $map.trigger('map:loadingEnd');
            });
        }
    }
    
    /**
     * 显示地图空状态
     * @param {jQuery} $map 地图容器
     * @param {string} message 显示的消息
     */
    function showMapEmpty($map, message) {
        // 如果已有空状态，则更新消息
        const $empty = $map.find('.ffs-chart-empty');
        
        if ($empty.length) {
            $empty.find('.ffs-chart-empty-text').text(message || '暂无数据');
            return;
        }
        
        // 创建空状态元素
        const $emptyState = $(`
            <div class="ffs-chart-empty">
                <div class="ffs-chart-empty-icon">
                    <i class="fas fa-map-marked-alt"></i>
                </div>
                <div class="ffs-chart-empty-text">${message || '暂无数据'}</div>
            </div>
        `);
        
        // 添加到地图容器
        $map.append($emptyState);
        
        // 触发空状态事件
        $map.trigger('map:empty');
    }
    
    /**
     * 隐藏地图空状态
     * @param {jQuery} $map 地图容器
     */
    function hideMapEmpty($map) {
        const $empty = $map.find('.ffs-chart-empty');
        
        // 如果有空状态，则移除
        if ($empty.length) {
            $empty.fadeOut(300, function() {
                $empty.remove();
                
                // 触发非空状态事件
                $map.trigger('map:notEmpty');
            });
        }
    }
    
    /**
     * 初始化所有地图功能
     */
    function init() {
        initGeoMap();
        initHeatMap();
        initPointMap();
        initRouteMap();
    }
    
    // 在文档加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.map = {
        init: init,
        initGeoMap: initGeoMap,
        initHeatMap: initHeatMap,
        initPointMap: initPointMap,
        initRouteMap: initRouteMap,
        showMapLoading: showMapLoading,
        hideMapLoading: hideMapLoading,
        showMapEmpty: showMapEmpty,
        hideMapEmpty: hideMapEmpty
    };

})(jQuery);