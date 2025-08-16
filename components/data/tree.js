/**
 * FFS UI - 树形组件
 * 提供基础树形、可选择树形、可搜索树形、可拖拽树形和虚拟滚动树形等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化基础树形
     * 处理树节点的展开和折叠功能
     */
    function initBasicTree() {
        // 点击树节点图标展开/折叠子节点
        $(document).on('click', '.ffs-tree-node-icon', function () {
            const $icon = $(this);
            const $node = $icon.closest('.ffs-tree-node');
            const $children = $node.children('.ffs-tree-node-children');

            // 切换图标状态
            $icon.toggleClass('expanded');

            // 切换子节点显示状态
            $children.toggleClass('show');

            // 触发展开/折叠事件
            if ($icon.hasClass('expanded')) {
                $node.trigger('tree:nodeExpand');
            } else {
                $node.trigger('tree:nodeCollapse');
            }
        });

        // 点击节点标签选中节点
        $(document).on('click', '.ffs-tree-node-label', function () {
            const $label = $(this);
            const $node = $label.closest('.ffs-tree-node');
            const $tree = $node.closest('.ffs-tree');

            // 移除其他节点的选中状态
            $tree.find('.ffs-tree-node-content.active').removeClass('active');

            // 添加当前节点的选中状态
            $node.children('.ffs-tree-node-content').addClass('active');

            // 触发节点选中事件
            $node.trigger('tree:nodeSelect');
        });
    }

    /**
     * 初始化可选择树形
     * 处理树节点的选择和级联选择功能
     */
    function initSelectTree() {
        // 点击复选框
        $(document).on('click', '.ffs-tree-select-checkbox', function (e) {
            e.stopPropagation();

            const $checkbox = $(this);
            const $node = $checkbox.closest('.ffs-tree-node');
            const $tree = $node.closest('.ffs-tree-select');

            // 切换复选框状态
            $checkbox.toggleClass('checked');
            $checkbox.removeClass('indeterminate');

            // 获取复选框状态
            const checked = $checkbox.hasClass('checked');

            // 级联选择子节点
            cascadeSelectChildren($node, checked);

            // 更新父节点状态
            updateParentCheckboxState($node);

            // 触发选择变化事件
            $tree.trigger('tree:selectionChange', [getSelectedNodes($tree)]);
        });

        // 级联选择子节点
        function cascadeSelectChildren($node, checked) {
            const $children = $node.find('.ffs-tree-node');

            $children.each(function () {
                const $child = $(this);
                const $checkbox = $child.find('> .ffs-tree-node-content .ffs-tree-select-checkbox');

                // 设置复选框状态
                if (checked) {
                    $checkbox.addClass('checked').removeClass('indeterminate');
                } else {
                    $checkbox.removeClass('checked indeterminate');
                }
            });
        }

        // 更新父节点复选框状态
        function updateParentCheckboxState($node) {
            const $parent = $node.parent().closest('.ffs-tree-node');

            if ($parent.length) {
                const $parentCheckbox = $parent.find('> .ffs-tree-node-content .ffs-tree-select-checkbox');
                const $siblings = $parent.find('> .ffs-tree-node-children > .ffs-tree-node');
                const $checkedSiblings = $siblings.filter(function () {
                    return $(this).find('> .ffs-tree-node-content .ffs-tree-select-checkbox').hasClass('checked');
                });
                const $indeterminateSiblings = $siblings.filter(function () {
                    return $(this).find('> .ffs-tree-node-content .ffs-tree-select-checkbox').hasClass('indeterminate');
                });

                // 更新父节点复选框状态
                if ($checkedSiblings.length === $siblings.length) {
                    // 所有子节点都被选中，父节点为选中状态
                    $parentCheckbox.addClass('checked').removeClass('indeterminate');
                } else if ($checkedSiblings.length > 0 || $indeterminateSiblings.length > 0) {
                    // 部分子节点被选中，父节点为半选状态
                    $parentCheckbox.removeClass('checked').addClass('indeterminate');
                } else {
                    // 没有子节点被选中，父节点为未选中状态
                    $parentCheckbox.removeClass('checked indeterminate');
                }

                // 递归更新上级父节点
                updateParentCheckboxState($parent);
            }
        }

        // 获取选中的节点
        function getSelectedNodes($tree) {
            const selectedNodes = [];

            $tree.find('.ffs-tree-select-checkbox.checked').each(function () {
                const $checkbox = $(this);
                const $node = $checkbox.closest('.ffs-tree-node');
                const nodeData = $node.data('node-data');

                selectedNodes.push({
                    element: $node[0],
                    data: nodeData,
                    id: $node.data('id') || null,
                    text: $node.find('> .ffs-tree-node-content .ffs-tree-node-label').text()
                });
            });

            return selectedNodes;
        }
    }

    /**
     * 初始化可搜索树形
     * 处理树节点的搜索和过滤功能
     */
    function initSearchTree() {
        // 搜索输入框输入事件
        $(document).on('input', '.ffs-tree-search-input', function () {
            const $input = $(this);
            const $tree = $input.closest('.ffs-tree-search').find('.ffs-tree');
            const searchText = $input.val().toLowerCase();

            // 如果搜索文本为空，显示所有节点
            if (!searchText) {
                $tree.find('.ffs-tree-node').show();
                $tree.find('.ffs-tree-node-icon').removeClass('expanded');
                $tree.find('.ffs-tree-node-children').removeClass('show');
                return;
            }

            // 隐藏所有节点
            $tree.find('.ffs-tree-node').hide();

            // 搜索匹配的节点
            $tree.find('.ffs-tree-node-label').each(function () {
                const $label = $(this);
                const nodeText = $label.text().toLowerCase();

                if (nodeText.includes(searchText)) {
                    const $node = $label.closest('.ffs-tree-node');

                    // 显示匹配的节点
                    $node.show();

                    // 显示匹配节点的所有父节点
                    showParentNodes($node);

                    // 展开匹配节点的父节点
                    expandParentNodes($node);
                }
            });

            // 触发搜索事件
            $tree.trigger('tree:search', [searchText]);
        });

        // 清除搜索按钮点击事件
        $(document).on('click', '.ffs-tree-search-clear', function () {
            const $button = $(this);
            const $input = $button.siblings('.ffs-tree-search-input');
            const $tree = $button.closest('.ffs-tree-search').find('.ffs-tree');

            // 清空输入框
            $input.val('');

            // 显示所有节点
            $tree.find('.ffs-tree-node').show();

            // 折叠所有节点
            $tree.find('.ffs-tree-node-icon').removeClass('expanded');
            $tree.find('.ffs-tree-node-children').removeClass('show');

            // 触发清除搜索事件
            $tree.trigger('tree:searchClear');
        });

        // 显示父节点
        function showParentNodes($node) {
            const $parent = $node.parent().closest('.ffs-tree-node');

            if ($parent.length) {
                $parent.show();
                showParentNodes($parent);
            }
        }

        // 展开父节点
        function expandParentNodes($node) {
            const $parent = $node.parent().closest('.ffs-tree-node');

            if ($parent.length) {
                const $icon = $parent.find('> .ffs-tree-node-content .ffs-tree-node-icon');
                const $children = $parent.children('.ffs-tree-node-children');

                $icon.addClass('expanded');
                $children.addClass('show');

                expandParentNodes($parent);
            }
        }
    }

    /**
     * 初始化可拖拽树形
     * 处理树节点的拖拽和排序功能
     */
    function initDragTree() {
        // 初始化拖拽
        $('.ffs-tree-drag').each(function () {
            const $tree = $(this);

            // 添加拖拽属性
            $tree.find('.ffs-tree-node-content').attr('draggable', 'true');

            // 拖拽开始事件
            $tree.on('dragstart', '.ffs-tree-node-content', function (e) {
                const $content = $(this);
                const $node = $content.closest('.ffs-tree-node');

                // 设置拖拽数据
                e.originalEvent.dataTransfer.setData('text/plain', $node.data('id') || $node.index());
                e.originalEvent.dataTransfer.effectAllowed = 'move';

                // 添加拖拽样式
                $content.addClass('dragging');

                // 触发拖拽开始事件
                $tree.trigger('tree:dragStart', [$node]);
            });

            // 拖拽结束事件
            $tree.on('dragend', '.ffs-tree-node-content', function () {
                const $content = $(this);

                // 移除拖拽样式
                $content.removeClass('dragging');

                // 移除所有拖拽指示器
                $tree.find('.ffs-tree-drag-placeholder').remove();
                $tree.find('.ffs-tree-node-content.drag-over').removeClass('drag-over');

                // 触发拖拽结束事件
                $tree.trigger('tree:dragEnd');
            });

            // 拖拽进入事件
            $tree.on('dragenter', '.ffs-tree-node-content', function (e) {
                e.preventDefault();
                const $content = $(this);

                // 添加拖拽指示样式
                $content.addClass('drag-over');
            });

            // 拖拽离开事件
            $tree.on('dragleave', '.ffs-tree-node-content', function () {
                const $content = $(this);

                // 移除拖拽指示样式
                $content.removeClass('drag-over');
            });

            // 拖拽悬停事件
            $tree.on('dragover', '.ffs-tree-node-content', function (e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';
            });

            // 拖拽放置事件
            $tree.on('drop', '.ffs-tree-node-content', function (e) {
                e.preventDefault();

                const $targetContent = $(this);
                const $targetNode = $targetContent.closest('.ffs-tree-node');
                const targetId = $targetNode.data('id');

                // 获取拖拽的节点ID
                const draggedId = e.originalEvent.dataTransfer.getData('text/plain');
                const $draggedNode = $tree.find(`.ffs-tree-node[data-id="${draggedId}"]`);

                // 如果找不到拖拽的节点，尝试使用索引
                if (!$draggedNode.length) {
                    const nodes = $tree.find('> .ffs-tree-node');
                    const draggedIndex = parseInt(draggedId, 10);
                    if (!isNaN(draggedIndex) && draggedIndex >= 0 && draggedIndex < nodes.length) {
                        $draggedNode = nodes.eq(draggedIndex);
                    }
                }

                // 如果还是找不到拖拽的节点，或者拖拽到自己，则返回
                if (!$draggedNode.length || $draggedNode[0] === $targetNode[0]) {
                    $targetContent.removeClass('drag-over');
                    return;
                }

                // 移除拖拽指示样式
                $targetContent.removeClass('drag-over');

                // 将拖拽的节点移动到目标节点下
                const $targetChildren = $targetNode.children('.ffs-tree-node-children');

                // 如果目标节点没有子节点容器，则创建一个
                if (!$targetChildren.length) {
                    $targetNode.append('<div class="ffs-tree-node-children show"></div>');
                    $targetNode.find('> .ffs-tree-node-content .ffs-tree-node-icon').addClass('expanded');
                }

                // 移动节点
                $draggedNode.appendTo($targetNode.children('.ffs-tree-node-children'));

                // 触发节点移动事件
                $tree.trigger('tree:nodeMoved', [$draggedNode, $targetNode]);
            });
        });
    }

    /**
     * 初始化虚拟滚动树形
     * 处理大量数据的高效渲染
     */
    function initVirtualTree() {
        $('.ffs-tree-virtual').each(function () {
            const $container = $(this);
            const $content = $container.find('.ffs-tree-virtual-content');
            const $scroll = $container.find('.ffs-tree-virtual-scroll');

            // 默认参数
            const itemHeight = parseInt($container.data('item-height') || 40, 10);
            const bufferSize = 5; // 上下缓冲区的项目数
            let allNodes = [];
            let visibleNodes = [];
            let startIndex = 0;
            let endIndex = 0;

            // 设置数据
            $container.setVirtualData = function (data) {
                allNodes = data;

                // 设置滚动区域高度
                $scroll.height(allNodes.length * itemHeight);

                // 渲染可见项
                updateVisibleNodes();

                return $container;
            };

            // 更新可见节点
            function updateVisibleNodes() {
                const scrollTop = $container.scrollTop();

                // 计算可见区域的起始和结束索引
                startIndex = Math.floor(scrollTop / itemHeight) - bufferSize;
                startIndex = Math.max(0, startIndex);

                const visibleCount = Math.ceil($container.height() / itemHeight) + bufferSize * 2;
                endIndex = startIndex + visibleCount;
                endIndex = Math.min(allNodes.length, endIndex);

                // 获取可见节点
                visibleNodes = allNodes.slice(startIndex, endIndex);

                // 渲染可见节点
                renderVisibleNodes();
            }

            // 渲染可见节点
            function renderVisibleNodes() {
                // 清空内容
                $scroll.empty();

                // 获取自定义模板
                const template = $container.data('template');

                // 渲染可见节点
                visibleNodes.forEach(function (node, index) {
                    const actualIndex = startIndex + index;
                    const top = actualIndex * itemHeight;

                    let html = '';

                    // 使用自定义模板或默认模板渲染节点
                    if (template && window[template] && typeof window[template] === 'function') {
                        html = window[template](node, actualIndex);
                    } else {
                        // 默认模板
                        const hasChildren = node.children && node.children.length > 0;
                        const iconClass = hasChildren ? 'ffs-tree-node-icon' : 'ffs-tree-node-icon-empty';
                        const expandedClass = node.expanded ? 'expanded' : '';

                        html = `
                            <div class="ffs-tree-node-content">
                                <div class="${iconClass} ${expandedClass}">
                                    <i class="fas fa-chevron-right"></i>
                                </div>
                                <div class="ffs-tree-node-label">${node.label || node.name || ''}</div>
                            </div>
                        `;
                    }

                    // 创建虚拟节点
                    const $item = $(`<div class="ffs-tree-virtual-item" data-index="${actualIndex}"></div>`);
                    $item.css({
                        height: itemHeight + 'px',
                        top: top + 'px'
                    }).html(html);

                    // 设置节点数据
                    $item.data('node-data', node);

                    // 添加到滚动区域
                    $scroll.append($item);
                });

                // 触发渲染完成事件
                $container.trigger('virtual:rendered', [visibleNodes, startIndex, endIndex]);
            }

            // 监听滚动事件
            $container.on('scroll', function () {
                updateVisibleNodes();
            });

            // 点击节点图标展开/折叠子节点
            $container.on('click', '.ffs-tree-node-icon', function () {
                const $icon = $(this);
                const $item = $icon.closest('.ffs-tree-virtual-item');
                const index = parseInt($item.data('index'), 10);
                const node = allNodes[index];

                // 切换展开状态
                node.expanded = !node.expanded;

                // 更新图标状态
                $icon.toggleClass('expanded');

                // 重新计算节点数据
                updateTreeData(allNodes);

                // 触发展开/折叠事件
                $container.trigger('tree:nodeToggle', [node, index]);
            });

            // 点击节点标签选中节点
            $container.on('click', '.ffs-tree-node-label', function () {
                const $label = $(this);
                const $item = $label.closest('.ffs-tree-virtual-item');

                // 移除其他节点的选中状态
                $scroll.find('.ffs-tree-node-content.active').removeClass('active');

                // 添加当前节点的选中状态
                $item.find('.ffs-tree-node-content').addClass('active');

                // 获取节点数据
                const index = parseInt($item.data('index'), 10);
                const node = allNodes[index];

                // 触发节点选中事件
                $container.trigger('tree:nodeSelect', [node, index]);
            });

            // 更新树形数据
            function updateTreeData(nodes) {
                // 展平树形数据
                const flattenedNodes = [];

                // 递归展平函数
                function flatten(nodeList, level = 0, visible = true) {
                    if (!nodeList || !nodeList.length) return;

                    nodeList.forEach(function (node) {
                        // 设置节点级别
                        node.level = level;

                        // 设置节点可见性
                        node.visible = visible;

                        // 添加到展平列表
                        if (visible) {
                            flattenedNodes.push(node);
                        }

                        // 如果有子节点且节点已展开，则递归展平子节点
                        if (node.children && node.children.length && node.expanded) {
                            flatten(node.children, level + 1, visible);
                        }
                    });
                }

                // 展平树形数据
                flatten(nodes);

                // 更新节点数据
                allNodes = flattenedNodes;

                // 更新滚动区域高度
                $scroll.height(allNodes.length * itemHeight);

                // 更新可见节点
                updateVisibleNodes();
            }

            // 加载树形数据
            $container.loadTreeData = function (url, params) {
                // 显示加载状态
                $container.addClass('loading');

                // 发送AJAX请求获取数据
                $.ajax({
                    url: url,
                    data: params || {},
                    success: function (response) {
                        // 解析响应数据
                        const data = typeof response === 'string' ? JSON.parse(response) : response;
                        const nodes = data.nodes || data.data || data;

                        // 设置树形数据
                        updateTreeData(nodes);

                        // 触发数据加载完成事件
                        $container.trigger('tree:dataLoaded', [nodes]);
                    },
                    error: function (xhr, status, error) {
                        console.error('Failed to load tree data:', error);

                        // 触发数据加载失败事件
                        $container.trigger('tree:dataError', [error]);
                    },
                    complete: function () {
                        // 隐藏加载状态
                        $container.removeClass('loading');
                    }
                });

                return $container;
            };

            // 如果有初始数据，设置数据
            const initialData = $container.data('nodes');
            if (initialData && Array.isArray(initialData)) {
                updateTreeData(initialData);
            }
        });
    }

    /**
     * 初始化异步加载树形
     * 处理树节点的异步加载功能
     */
    function initAsyncTree() {
        // 点击异步加载节点
        $(document).on('click', '.ffs-tree-async .ffs-tree-node-icon', function () {
            const $icon = $(this);
            const $node = $icon.closest('.ffs-tree-node');
            const $children = $node.children('.ffs-tree-node-children');

            // 如果已经加载过子节点，则直接切换显示状态
            if ($children.length) {
                $icon.toggleClass('expanded');
                $children.toggleClass('show');
                return;
            }

            // 获取节点数据
            const nodeId = $node.data('id');
            const url = $node.data('url') || $node.closest('.ffs-tree-async').data('url');

            // 如果没有URL，则返回
            if (!url) {
                console.error('No URL specified for async tree node');
                return;
            }

            // 显示加载状态
            $icon.addClass('loading');

            // 发送AJAX请求获取子节点数据
            $.ajax({
                url: url,
                data: {
                    id: nodeId
                },
                success: function (response) {
                    // 解析响应数据
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    const children = data.children || data.nodes || data.data || data;

                    // 创建子节点容器
                    if (!$children.length) {
                        $node.append('<div class="ffs-tree-node-children"></div>');
                    }

                    // 渲染子节点
                    renderChildNodes($node.children('.ffs-tree-node-children'), children);

                    // 展开子节点
                    $icon.addClass('expanded');
                    $node.children('.ffs-tree-node-children').addClass('show');

                    // 触发子节点加载完成事件
                    $node.trigger('tree:childrenLoaded', [children]);
                },
                error: function (xhr, status, error) {
                    console.error('Failed to load child nodes:', error);

                    // 触发子节点加载失败事件
                    $node.trigger('tree:childrenError', [error]);
                },
                complete: function () {
                    // 移除加载状态
                    $icon.removeClass('loading');
                }
            });
        });

        // 渲染子节点
        function renderChildNodes($container, children) {
            // 如果没有子节点，则返回
            if (!children || !children.length) {
                $container.html('<div class="ffs-tree-empty">暂无数据</div>');
                return;
            }

            // 清空容器
            $container.empty();

            // 渲染子节点
            children.forEach(function (child) {
                const hasChildren = child.hasChildren || (child.children && child.children.length > 0);
                const nodeHtml = `
                    <div class="ffs-tree-node" data-id="${child.id || ''}">
                        <div class="ffs-tree-node-content">
                            <div class="ffs-tree-node-icon ${hasChildren ? '' : 'ffs-tree-node-icon-empty'}">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                            <div class="ffs-tree-node-label">${child.label || child.name || ''}</div>
                        </div>
                    </div>
                `;

                // 添加子节点
                const $childNode = $(nodeHtml);
                $container.append($childNode);

                // 设置节点数据
                $childNode.data('node-data', child);

                // 如果有子节点，则递归渲染
                if (child.children && child.children.length) {
                    const $childContainer = $('<div class="ffs-tree-node-children"></div>');
                    $childNode.append($childContainer);
                    renderChildNodes($childContainer, child.children);
                }
            });
        }
    }

    /**
     * 初始化所有树形组件
     */
    function initAllTrees() {
        initBasicTree();
        initSelectTree();
        initSearchTree();
        initDragTree();
        initVirtualTree();
        initAsyncTree();
    }

    // 在文档加载完成后初始化
    $(document).ready(function () {
        initAllTrees();
    });

    // 导出公共API
    return {
        initBasicTree: initBasicTree,
        initSelectTree: initSelectTree,
        initSearchTree: initSearchTree,
        initDragTree: initDragTree,
        initVirtualTree: initVirtualTree,
        initAsyncTree: initAsyncTree,
        initAllTrees: initAllTrees
    };
})(jQuery);