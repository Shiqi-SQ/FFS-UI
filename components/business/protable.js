/**
 * FFS UI - 高级表格组件
 * 提供查询表格、高级列表、卡片列表和树形表格等交互功能
 */
(function($) {
    'use strict';

    /**
     * 初始化查询表格
     * 处理表格的搜索、排序、分页和选择等功能
     */
    function initProTable() {
        // 表格搜索
        $(document).on('click', '.ffs-pro-table-search-btn', function() {
            const $btn = $(this);
            const $table = $btn.closest('.ffs-pro-table');
            const $searchForm = $table.find('.ffs-pro-table-search');
            
            // 收集搜索参数
            const searchParams = {};
            $searchForm.find('input, select, textarea').each(function() {
                const $input = $(this);
                const name = $input.attr('name');
                const value = $input.val();
                
                if (name && value) {
                    searchParams[name] = value;
                }
            });
            
            // 触发搜索事件
            $table.trigger('table:search', [searchParams]);
            
            // 重置分页到第一页
            const $pagination = $table.find('.ffs-pro-table-pagination');
            if ($pagination.length) {
                $pagination.find('.ffs-pagination-item:first').click();
            }
        });
        
        // 表格重置
        $(document).on('click', '.ffs-pro-table-reset-btn', function() {
            const $btn = $(this);
            const $table = $btn.closest('.ffs-pro-table');
            const $searchForm = $table.find('.ffs-pro-table-search');
            
            // 重置表单
            $searchForm.find('input, select, textarea').each(function() {
                const $input = $(this);
                const type = $input.attr('type');
                
                if (type === 'checkbox' || type === 'radio') {
                    $input.prop('checked', false);
                } else {
                    $input.val('');
                }
            });
            
            // 触发重置事件
            $table.trigger('table:reset');
            
            // 自动触发搜索
            $table.find('.ffs-pro-table-search-btn').click();
        });
        
        // 表格排序
        $(document).on('click', '.ffs-pro-table-th.sortable', function() {
            const $th = $(this);
            const $table = $th.closest('.ffs-pro-table');
            const field = $th.data('field');
            
            // 获取当前排序方向
            let direction = 'asc';
            if ($th.hasClass('asc')) {
                direction = 'desc';
            } else if ($th.hasClass('desc')) {
                direction = '';
            }
            
            // 更新排序状态
            $table.find('.ffs-pro-table-th').removeClass('asc desc');
            if (direction) {
                $th.addClass(direction);
            }
            
            // 触发排序事件
            $table.trigger('table:sort', [field, direction]);
        });
        
        // 表格选择
        $(document).on('change', '.ffs-pro-table-checkbox-all', function() {
            const $checkbox = $(this);
            const $table = $checkbox.closest('.ffs-pro-table');
            const checked = $checkbox.prop('checked');
            
            // 选择/取消选择所有行
            $table.find('.ffs-pro-table-checkbox-row').prop('checked', checked);
            
            // 更新行选中状态
            $table.find('.ffs-pro-table-row').toggleClass('selected', checked);
            
            // 触发全选/取消全选事件
            $table.trigger('table:selectAll', [checked]);
        });
        
        $(document).on('change', '.ffs-pro-table-checkbox-row', function() {
            const $checkbox = $(this);
            const $table = $checkbox.closest('.ffs-pro-table');
            const $row = $checkbox.closest('.ffs-pro-table-row');
            const checked = $checkbox.prop('checked');
            
            // 更新行选中状态
            $row.toggleClass('selected', checked);
            
            // 检查是否全部选中
            const totalRows = $table.find('.ffs-pro-table-checkbox-row').length;
            const selectedRows = $table.find('.ffs-pro-table-checkbox-row:checked').length;
            
            // 更新全选框状态
            $table.find('.ffs-pro-table-checkbox-all').prop('checked', totalRows === selectedRows);
            
            // 触发行选择事件
            $table.trigger('table:selectRow', [$row, checked]);
        });
        
        // 表格分页
        $(document).on('click', '.ffs-pro-table-pagination .ffs-pagination-item', function() {
            const $item = $(this);
            
            // 如果已经是当前页或禁用状态，则不处理
            if ($item.hasClass('active') || $item.hasClass('disabled')) {
                return;
            }
            
            const $pagination = $item.closest('.ffs-pagination');
            const $table = $item.closest('.ffs-pro-table');
            
            // 获取页码
            let page = 1;
            if ($item.hasClass('ffs-pagination-prev')) {
                const currentPage = parseInt($pagination.find('.ffs-pagination-item.active').text());
                page = Math.max(1, currentPage - 1);
            } else if ($item.hasClass('ffs-pagination-next')) {
                const currentPage = parseInt($pagination.find('.ffs-pagination-item.active').text());
                const totalPages = $pagination.data('total-pages') || 1;
                page = Math.min(totalPages, currentPage + 1);
            } else {
                page = parseInt($item.text());
            }
            
            // 更新分页状态
            $pagination.find('.ffs-pagination-item').removeClass('active');
            $pagination.find(`.ffs-pagination-item:contains(${page})`).addClass('active');
            
            // 更新上一页/下一页按钮状态
            $pagination.find('.ffs-pagination-prev').toggleClass('disabled', page === 1);
            $pagination.find('.ffs-pagination-next').toggleClass('disabled', page === ($pagination.data('total-pages') || 1));
            
            // 触发分页事件
            $table.trigger('table:page', [page]);
        });
        
        // 表格每页显示数量变化
        $(document).on('change', '.ffs-pro-table-pagination-size', function() {
            const $select = $(this);
            const $table = $select.closest('.ffs-pro-table');
            const pageSize = parseInt($select.val());
            
            // 触发页面大小变化事件
            $table.trigger('table:pageSize', [pageSize]);
            
            // 重置到第一页
            const $pagination = $table.find('.ffs-pro-table-pagination');
            if ($pagination.length) {
                $pagination.find('.ffs-pagination-item:contains(1)').click();
            }
        });
        
        // 表格行操作
        $(document).on('click', '.ffs-pro-table-row-action', function() {
            const $action = $(this);
            const $row = $action.closest('.ffs-pro-table-row');
            const $table = $action.closest('.ffs-pro-table');
            const actionType = $action.data('action');
            
            // 触发行操作事件
            $table.trigger('table:rowAction', [$row, actionType]);
        });
    }
    
    /**
     * 初始化高级列表
     * 处理列表的搜索、筛选和操作等功能
     */
    function initProList() {
        // 列表搜索
        $(document).on('click', '.ffs-pro-search-list-search-btn', function() {
            const $btn = $(this);
            const $list = $btn.closest('.ffs-pro-search-list');
            const $searchForm = $list.find('.ffs-pro-search-list-search');
            
            // 收集搜索参数
            const searchParams = {};
            $searchForm.find('input, select, textarea').each(function() {
                const $input = $(this);
                const name = $input.attr('name');
                const value = $input.val();
                
                if (name && value) {
                    searchParams[name] = value;
                }
            });
            
            // 触发搜索事件
            $list.trigger('list:search', [searchParams]);
        });
        
        // 列表重置
        $(document).on('click', '.ffs-pro-search-list-reset-btn', function() {
            const $btn = $(this);
            const $list = $btn.closest('.ffs-pro-search-list');
            const $searchForm = $list.find('.ffs-pro-search-list-search');
            
            // 重置表单
            $searchForm.find('input, select, textarea').each(function() {
                const $input = $(this);
                const type = $input.attr('type');
                
                if (type === 'checkbox' || type === 'radio') {
                    $input.prop('checked', false);
                } else {
                    $input.val('');
                }
            });
            
            // 触发重置事件
            $list.trigger('list:reset');
            
            // 自动触发搜索
            $list.find('.ffs-pro-search-list-search-btn').click();
        });
        
        // 列表项操作
        $(document).on('click', '.ffs-pro-search-list-item-action', function() {
            const $action = $(this);
            const $item = $action.closest('.ffs-pro-search-list-item');
            const $list = $action.closest('.ffs-pro-search-list');
            const actionType = $action.data('action');
            
            // 触发项操作事件
            $list.trigger('list:itemAction', [$item, actionType]);
        });
    }
    
    /**
     * 初始化卡片列表
     * 处理卡片的选择、操作和布局等功能
     */
    function initCardList() {
        // 卡片选择
        $(document).on('click', '.ffs-pro-card-list-card', function(e) {
            // 如果点击的是操作按钮，则不处理选择
            if ($(e.target).closest('.ffs-pro-card-list-card-actions').length) {
                return;
            }
            
            const $card = $(this);
            const $list = $card.closest('.ffs-pro-card-list');
            const selectable = $list.hasClass('selectable');
            
            // 如果列表支持选择
            if (selectable) {
                const multiSelect = $list.hasClass('multi-select');
                
                // 多选模式
                if (multiSelect) {
                    $card.toggleClass('selected');
                } else {
                    // 单选模式
                    $list.find('.ffs-pro-card-list-card').removeClass('selected');
                    $card.addClass('selected');
                }
                
                // 触发选择事件
                $list.trigger('card:select', [$card, $card.hasClass('selected')]);
            }
        });
        
        // 卡片操作
        $(document).on('click', '.ffs-pro-card-list-card-action', function() {
            const $action = $(this);
            const $card = $action.closest('.ffs-pro-card-list-card');
            const $list = $action.closest('.ffs-pro-card-list');
            const actionType = $action.data('action');
            
            // 触发卡片操作事件
            $list.trigger('card:action', [$card, actionType]);
        });
        
        // 布局切换
        $(document).on('click', '.ffs-pro-card-list-layout-switch', function() {
            const $switch = $(this);
            const $list = $switch.closest('.ffs-pro-card-list-container').find('.ffs-pro-card-list');
            const layout = $switch.data('layout');
            
            // 更新布局切换按钮状态
            $switch.siblings('.ffs-pro-card-list-layout-switch').removeClass('active');
            $switch.addClass('active');
            
            // 更新列表布局
            $list.removeClass('grid-layout list-layout').addClass(`${layout}-layout`);
            
            // 触发布局切换事件
            $list.trigger('card:layoutChange', [layout]);
        });
    }
    
    /**
     * 初始化树形表格
     * 处理树形表格的展开/折叠和选择等功能
     */
    function initTreeTable() {
        // 展开/折叠节点
        $(document).on('click', '.ffs-pro-tree-table-cell-expand', function() {
            const $expander = $(this);
            const $row = $expander.closest('.ffs-pro-tree-table-row');
            const $table = $expander.closest('.ffs-pro-tree-table');
            const expanded = $row.hasClass('expanded');
            const rowId = $row.data('id');
            
            // 切换展开状态
            $row.toggleClass('expanded');
            
            // 查找并切换子节点显示状态
            const $childRows = $table.find(`.ffs-pro-tree-table-row[data-parent="${rowId}"]`);
            
            if (expanded) {
                // 折叠：隐藏所有子节点及其子节点
                hideChildRows($table, rowId);
            } else {
                // 展开：仅显示直接子节点
                $childRows.show();
            }
            
            // 触发展开/折叠事件
            $table.trigger('tree:toggle', [$row, !expanded]);
        });
        
        // 递归隐藏子节点
        function hideChildRows($table, parentId) {
            const $childRows = $table.find(`.ffs-pro-tree-table-row[data-parent="${parentId}"]`);
            
            $childRows.each(function() {
                const $childRow = $(this);
                const childId = $childRow.data('id');
                
                // 隐藏当前子节点
                $childRow.hide();
                
                // 移除展开状态
                $childRow.removeClass('expanded');
                
                // 递归隐藏其子节点
                hideChildRows($table, childId);
            });
        }
        
        // 全部展开
        $(document).on('click', '.ffs-pro-tree-table-expand-all', function() {
            const $btn = $(this);
            const $table = $btn.closest('.ffs-pro-tree-table');
            
            // 展开所有节点
            $table.find('.ffs-pro-tree-table-row').addClass('expanded');
            $table.find('.ffs-pro-tree-table-row').show();
            
            // 触发全部展开事件
            $table.trigger('tree:expandAll');
        });
        
        // 全部折叠
        $(document).on('click', '.ffs-pro-tree-table-collapse-all', function() {
            const $btn = $(this);
            const $table = $btn.closest('.ffs-pro-tree-table');
            
            // 折叠所有节点
            $table.find('.ffs-pro-tree-table-row').removeClass('expanded');
            
            // 只显示顶级节点
            $table.find('.ffs-pro-tree-table-row[data-parent]').hide();
            $table.find('.ffs-pro-tree-table-row:not([data-parent])').show();
            
            // 触发全部折叠事件
            $table.trigger('tree:collapseAll');
        });
        
        // 树形表格选择
        $(document).on('change', '.ffs-pro-tree-table-checkbox', function() {
            const $checkbox = $(this);
            const $row = $checkbox.closest('.ffs-pro-tree-table-row');
            const $table = $checkbox.closest('.ffs-pro-tree-table');
            const checked = $checkbox.prop('checked');
            const rowId = $row.data('id');
            
            // 更新行选中状态
            $row.toggleClass('selected', checked);
            
            // 如果启用了级联选择
            if ($table.hasClass('cascade-select')) {
                // 向下级联：选择所有子节点
                if (checked) {
                    selectChildRows($table, rowId, true);
                } else {
                    selectChildRows($table, rowId, false);
                }
                
                // 向上级联：检查父节点状态
                updateParentCheckboxState($table, $row);
            }
            
            // 触发选择事件
            $table.trigger('tree:select', [$row, checked]);
        });
        
        // 递归选择子节点
        function selectChildRows($table, parentId, checked) {
            const $childRows = $table.find(`.ffs-pro-tree-table-row[data-parent="${parentId}"]`);
            
            $childRows.each(function() {
                const $childRow = $(this);
                const childId = $childRow.data('id');
                const $checkbox = $childRow.find('.ffs-pro-tree-table-checkbox');
                
                // 更新复选框状态
                $checkbox.prop('checked', checked);
                
                // 更新行选中状态
                $childRow.toggleClass('selected', checked);
                
                // 递归处理子节点
                selectChildRows($table, childId, checked);
            });
        }
        
        // 更新父节点复选框状态
        function updateParentCheckboxState($table, $row) {
            const parentId = $row.data('parent');
            
            // 如果没有父节点，则返回
            if (!parentId) {
                return;
            }
            
            const $parentRow = $table.find(`.ffs-pro-tree-table-row[data-id="${parentId}"]`);
            const $parentCheckbox = $parentRow.find('.ffs-pro-tree-table-checkbox');
            
            // 获取所有同级节点
            const $siblingRows = $table.find(`.ffs-pro-tree-table-row[data-parent="${parentId}"]`);
            const totalSiblings = $siblingRows.length;
            const checkedSiblings = $siblingRows.filter(function() {
                return $(this).find('.ffs-pro-tree-table-checkbox').prop('checked');
            }).length;
            
            // 更新父节点复选框状态
            if (checkedSiblings === 0) {
                // 没有选中的子节点，取消选中父节点
                $parentCheckbox.prop('checked', false);
                $parentRow.removeClass('selected');
            } else if (checkedSiblings === totalSiblings) {
                // 所有子节点都选中，选中父节点
                $parentCheckbox.prop('checked', true);
                $parentRow.addClass('selected');
            } else {
                // 部分子节点选中，设置父节点为不确定状态
                $parentCheckbox.prop('checked', false);
                $parentCheckbox.prop('indeterminate', true);
                $parentRow.removeClass('selected');
            }
            
            // 递归更新上级父节点
            updateParentCheckboxState($table, $parentRow);
        }
        
        // 初始化树形表格
        $('.ffs-pro-tree-table').each(function() {
            const $table = $(this);
            
            // 默认只显示顶级节点
            $table.find('.ffs-pro-tree-table-row[data-parent]').hide();
            
            // 如果有默认展开的节点
            $table.find('.ffs-pro-tree-table-row.expanded').each(function() {
                const $row = $(this);
                const rowId = $row.data('id');
                
                // 显示其直接子节点
                $table.find(`.ffs-pro-tree-table-row[data-parent="${rowId}"]`).show();
            });
        });
    }
    
    /**
     * 初始化表格拖拽功能
     * 处理表格列宽调整和行拖拽排序
     */
    function initTableDrag() {
        // 列宽调整
        $('.ffs-pro-table-resizable').each(function() {
            const $table = $(this);
            const $headers = $table.find('.ffs-pro-table-th');
            
            $headers.each(function() {
                const $header = $(this);
                const $resizer = $('<div class="ffs-pro-table-resizer"></div>');
                
                $header.append($resizer);
                
                $resizer.on('mousedown', function(e) {
                    e.preventDefault();
                    
                    const startX = e.pageX;
                    const startWidth = $header.width();
                    
                    // 添加调整中的样式
                    $table.addClass('resizing');
                    
                    // 监听鼠标移动
                    $(document).on('mousemove.resize', function(e) {
                        const width = startWidth + (e.pageX - startX);
                        
                        // 设置最小宽度
                        if (width >= 50) {
                            $header.width(width);
                        }
                    });
                    
                    // 监听鼠标松开
                    $(document).on('mouseup.resize', function() {
                        // 移除调整中的样式
                        $table.removeClass('resizing');
                        
                        // 移除事件监听
                        $(document).off('mousemove.resize mouseup.resize');
                        
                        // 触发列宽调整事件
                        $table.trigger('table:resize', [$header, $header.width()]);
                    });
                });
            });
        });
        
        // 行拖拽排序
        $('.ffs-pro-table-sortable').each(function() {
            const $table = $(this);
            const $tbody = $table.find('.ffs-pro-table-body');
            
            // 使用 jQuery UI sortable 插件（如果可用）
            if ($.fn.sortable) {
                $tbody.sortable({
                    items: '.ffs-pro-table-row',
                    handle: '.ffs-pro-table-drag-handle',
                    axis: 'y',
                    helper: function(e, $row) {
                        // 创建拖拽时的辅助元素
                        const $helper = $row.clone();
                        $helper.width($row.width());
                        
                        // 设置单元格宽度
                        $row.children().each(function(index) {
                            $helper.children().eq(index).width($(this).width());
                        });
                        
                        return $helper;
                    },
                    start: function(e, ui) {
                        // 添加拖拽中的样式
                        ui.item.addClass('dragging');
                    },
                    stop: function(e, ui) {
                        // 移除拖拽中的样式
                        ui.item.removeClass('dragging');
                        
                        // 获取新的排序
                        const newOrder = [];
                        $tbody.find('.ffs-pro-table-row').each(function() {
                            newOrder.push($(this).data('id'));
                        });
                        
                        // 触发排序事件
                        $table.trigger('table:reorder', [newOrder]);
                    }
                });
            }
        });
    }
    
    /**
     * 初始化表格导出功能
     */
    function initTableExport() {
        // 导出按钮点击事件
        $(document).on('click', '.ffs-pro-table-export-btn', function() {
            const $btn = $(this);
            const $table = $btn.closest('.ffs-pro-table');
            const format = $btn.data('format') || 'csv';
            
            // 触发导出事件
            $table.trigger('table:export', [format]);
            
            // 如果有默认导出实现
            exportTable($table, format);
        });
        
        // 默认导出实现
        function exportTable($table, format) {
            // 获取表格数据
            const headers = [];
            const data = [];
            
            // 获取表头
            $table.find('.ffs-pro-table-th').each(function() {
                const $th = $(this);
                // 跳过操作列和选择列
                if (!$th.hasClass('ffs-pro-table-th-action') && !$th.hasClass('ffs-pro-table-th-checkbox')) {
                    headers.push($th.text().trim());
                }
            });
            
            // 获取数据行
            $table.find('.ffs-pro-table-row').each(function() {
                const $row = $(this);
                const rowData = [];
                
                $row.find('.ffs-pro-table-td').each(function() {
                    const $td = $(this);
                    // 跳过操作列和选择列
                    if (!$td.hasClass('ffs-pro-table-td-action') && !$td.hasClass('ffs-pro-table-td-checkbox')) {
                        rowData.push($td.text().trim());
                    }
                });
                
                if (rowData.length) {
                    data.push(rowData);
                }
            });
            
            // 根据格式导出
            switch (format.toLowerCase()) {
                case 'csv':
                    exportCSV(headers, data, $table.data('title') || 'table-export');
                    break;
                case 'excel':
                    exportExcel(headers, data, $table.data('title') || 'table-export');
                    break;
                case 'pdf':
                    exportPDF(headers, data, $table.data('title') || 'table-export');
                    break;
            }
        }
        
        // 导出为CSV
        function exportCSV(headers, data, filename) {
            let csvContent = headers.join(',') + '\n';
            
            data.forEach(function(row) {
                // 处理单元格中的逗号
                const processedRow = row.map(function(cell) {
                    // 如果单元格包含逗号、双引号或换行符，则用双引号包裹
                    if (/[",\n]/.test(cell)) {
                        return '"' + cell.replace(/"/g, '""') + '"';
                    }
                    return cell;
                });
                
                csvContent += processedRow.join(',') + '\n';
            });
            
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
        
        // 导出为Excel（需要额外的库支持）
        function exportExcel(headers, data, filename) {
            // 检查是否有Excel导出库
            if (window.XLSX) {
                const worksheet = XLSX.utils.aoa_to_sheet([headers].concat(data));
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                XLSX.writeFile(workbook, filename + '.xlsx');
            } else {
                console.warn('Excel导出需要引入XLSX库');
                // 降级为CSV导出
                exportCSV(headers, data, filename);
            }
        }
        
        // 导出为PDF（需要额外的库支持）
        function exportPDF(headers, data, filename) {
            // 检查是否有PDF导出库
            if (window.jsPDF && window.jsPDF.autoTable) {
                const doc = new jsPDF();
                
                doc.autoTable({
                    head: [headers],
                    body: data
                });
                
                doc.save(filename + '.pdf');
            } else {
                console.warn('PDF导出需要引入jsPDF和jsPDF-AutoTable库');
                // 降级为CSV导出
                exportCSV(headers, data, filename);
            }
        }
    }
    
    /**
     * 初始化所有高级表格功能
     */
    function init() {
        initProTable();
        initProList();
        initCardList();
        initTreeTable();
        initTableDrag();
        initTableExport();
    }
    
    // 在文档加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.proTable = {
        init: init,
        initProTable: initProTable,
        initProList: initProList,
        initCardList: initCardList,
        initTreeTable: initTreeTable,
        initTableDrag: initTableDrag,
        initTableExport: initTableExport
    };

})(jQuery);