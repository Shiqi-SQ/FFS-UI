/**
 * FFS UI - 列表组件
 * 提供基础列表、卡片列表、网格列表、无限滚动和虚拟列表等功能
 */
(function($) {
    'use strict';

    /**
     * 初始化基础列表
     * 处理列表项的点击事件和交互效果
     */
    function initBasicList() {
        // 列表项点击事件
        $(document).on('click', '.ffs-list-item[data-action]', function() {
            const $item = $(this);
            const action = $item.data('action');
            
            // 触发点击事件
            $item.trigger('list:itemClick', [action]);
            
            // 如果有链接，跳转到指定链接
            if ($item.data('href')) {
                window.location.href = $item.data('href');
            }
        });
    }

    /**
     * 初始化卡片列表
     * 处理卡片列表的交互效果
     */
    function initCardList() {
        // 卡片点击事件
        $(document).on('click', '.ffs-list-card-item[data-action]', function() {
            const $card = $(this);
            const action = $card.data('action');
            
            // 触发点击事件
            $card.trigger('card:itemClick', [action]);
            
            // 如果有链接，跳转到指定链接
            if ($card.data('href')) {
                window.location.href = $card.data('href');
            }
        });
    }

    /**
     * 初始化网格列表
     * 处理网格列表的交互效果
     */
    function initGridList() {
        // 网格项点击事件
        $(document).on('click', '.ffs-list-grid-item[data-action]', function() {
            const $grid = $(this);
            const action = $grid.data('action');
            
            // 触发点击事件
            $grid.trigger('grid:itemClick', [action]);
            
            // 如果有链接，跳转到指定链接
            if ($grid.data('href')) {
                window.location.href = $grid.data('href');
            }
        });
    }

    /**
     * 初始化无限滚动列表
     * 处理列表滚动到底部时加载更多数据
     */
    function initInfiniteList() {
        $('.ffs-list-infinite').each(function() {
            const $container = $(this);
            const $list = $container.find('.ffs-list');
            const $loading = $container.find('.ffs-list-infinite-loading');
            
            // 默认参数
            let page = 1;
            let loading = false;
            let hasMore = true;
            const url = $container.data('url');
            const limit = $container.data('limit') || 10;
            
            // 如果没有设置数据URL，则不初始化无限滚动
            if (!url) return;
            
            // 加载更多数据
            function loadMore() {
                if (loading || !hasMore) return;
                
                loading = true;
                $loading.show();
                
                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: {
                        page: page,
                        limit: limit
                    },
                    success: function(response) {
                        // 解析响应数据
                        const data = typeof response === 'string' ? JSON.parse(response) : response;
                        const items = data.items || data.data || [];
                        
                        // 检查是否还有更多数据
                        hasMore = data.hasMore !== false && items.length === limit;
                        
                        // 如果没有数据，显示结束信息
                        if (items.length === 0) {
                            $loading.removeClass('ffs-list-infinite-loading').addClass('ffs-list-infinite-end').text('没有更多数据了');
                            return;
                        }
                        
                        // 渲染列表项
                        renderItems(items);
                        
                        // 增加页码
                        page++;
                        
                        // 触发数据加载完成事件
                        $container.trigger('infinite:loaded', [items]);
                    },
                    error: function(xhr, status, error) {
                        console.error('Failed to load more data:', error);
                        $loading.text('加载失败，请重试');
                        
                        // 触发数据加载失败事件
                        $container.trigger('infinite:error', [error]);
                    },
                    complete: function() {
                        loading = false;
                    }
                });
            }
            
            // 渲染列表项
            function renderItems(items) {
                // 获取自定义模板
                const template = $container.data('template');
                let html = '';
                
                // 使用自定义模板或默认模板渲染列表项
                if (template && window[template] && typeof window[template] === 'function') {
                    html = window[template](items);
                } else {
                    // 默认模板
                    html = items.map(function(item) {
                        return `
                            <div class="ffs-list-item" data-id="${item.id || ''}">
                                <div class="ffs-list-item-content">
                                    <div class="ffs-list-item-title">${item.title || item.name || ''}</div>
                                    <div class="ffs-list-item-description">${item.description || item.content || ''}</div>
                                </div>
                                ${item.extra ? `<div class="ffs-list-item-extra">${item.extra}</div>` : ''}
                            </div>
                        `;
                    }).join('');
                }
                
                // 添加到列表
                $list.append(html);
            }
            
            // 监听滚动事件
            $container.on('scroll', function() {
                const scrollTop = $container.scrollTop();
                const scrollHeight = $container.prop('scrollHeight');
                const clientHeight = $container.prop('clientHeight');
                
                // 当滚动到距离底部100px时，加载更多数据
                if (scrollTop + clientHeight >= scrollHeight - 100 && !loading && hasMore) {
                    loadMore();
                }
            });
            
            // 初始加载
            loadMore();
        });
    }

    /**
     * 初始化虚拟列表
     * 处理大量数据的高效渲染
     */
    function initVirtualList() {
        $('.ffs-list-virtual').each(function() {
            const $container = $(this);
            const $content = $container.find('.ffs-list-virtual-content');
            const $scroll = $container.find('.ffs-list-virtual-scroll');
            
            // 默认参数
            const itemHeight = $container.data('item-height') || 50;
            const bufferSize = 5; // 上下缓冲区的项目数
            let items = [];
            let visibleItems = [];
            let startIndex = 0;
            let endIndex = 0;
            
            // 设置数据
            $container.setVirtualData = function(data) {
                items = data;
                
                // 设置滚动区域高度
                $scroll.height(items.length * itemHeight);
                
                // 渲染可见项
                updateVisibleItems();
                
                return $container;
            };
            
            // 更新可见项
            function updateVisibleItems() {
                const scrollTop = $container.scrollTop();
                
                // 计算可见区域的起始和结束索引
                startIndex = Math.floor(scrollTop / itemHeight) - bufferSize;
                startIndex = Math.max(0, startIndex);
                
                const visibleCount = Math.ceil($container.height() / itemHeight) + bufferSize * 2;
                endIndex = startIndex + visibleCount;
                endIndex = Math.min(items.length, endIndex);
                
                // 获取可见项
                visibleItems = items.slice(startIndex, endIndex);
                
                // 渲染可见项
                renderVisibleItems();
            }
            
            // 渲染可见项
            function renderVisibleItems() {
                // 清空内容
                $scroll.empty();
                
                // 获取自定义模板
                const template = $container.data('template');
                
                // 渲染可见项
                visibleItems.forEach(function(item, index) {
                    const actualIndex = startIndex + index;
                    const top = actualIndex * itemHeight;
                    
                    let html = '';
                    
                    // 使用自定义模板或默认模板渲染列表项
                    if (template && window[template] && typeof window[template] === 'function') {
                        html = window[template](item, actualIndex);
                    } else {
                        // 默认模板
                        html = `
                            <div class="ffs-list-item-content">
                                <div class="ffs-list-item-title">${item.title || item.name || ''}</div>
                                <div class="ffs-list-item-description">${item.description || item.content || ''}</div>
                            </div>
                        `;
                    }
                    
                    // 创建列表项
                    const $item = $(`<div class="ffs-list-virtual-item" data-index="${actualIndex}"></div>`);
                    $item.css({
                        height: itemHeight + 'px',
                        top: top + 'px'
                    }).html(html);
                    
                    // 添加到滚动区域
                    $scroll.append($item);
                });
                
                // 触发渲染完成事件
                $container.trigger('virtual:rendered', [visibleItems, startIndex, endIndex]);
            }
            
            // 监听滚动事件
            $container.on('scroll', function() {
                updateVisibleItems();
            });
            
            // 如果有初始数据，设置数据
            const initialData = $container.data('items');
            if (initialData && Array.isArray(initialData)) {
                $container.setVirtualData(initialData);
            }
        });
    }

    /**
     * 初始化所有列表组件
     */
    function initAllLists() {
        initBasicList();
        initCardList();
        initGridList();
        initInfiniteList();
        initVirtualList();
    }

    // 在文档加载完成后初始化
    $(document).ready(function() {
        initAllLists();
    });

    // 导出公共API
    return {
        initBasicList: initBasicList,
        initCardList: initCardList,
        initGridList: initGridList,
        initInfiniteList: initInfiniteList,
        initVirtualList: initVirtualList,
        initAllLists: initAllLists
    };
})(jQuery);