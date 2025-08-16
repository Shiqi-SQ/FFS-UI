/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * FFS UI - 表格组件
 * 提供可选择、可展开、可编辑、树形、排序、筛选、分页和虚拟滚动等表格功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化可选择表格
     * 处理表格行的选择和全选功能
     */
    function initSelectTable() {
        // 全选/取消全选
        $(document).on('change', '.ffs-table-select thead input[type="checkbox"]', function () {
            const $headerCheckbox = $(this);
            const $table = $headerCheckbox.closest('.ffs-table-select');
            const $bodyCheckboxes = $table.find('tbody input[type="checkbox"]');

            // 设置所有复选框状态与头部复选框一致
            $bodyCheckboxes.prop('checked', $headerCheckbox.prop('checked'));

            // 触发选择变化事件
            $table.trigger('table:selectionChange', [getSelectedRows($table)]);
        });

        // 单个复选框变化
        $(document).on('change', '.ffs-table-select tbody input[type="checkbox"]', function () {
            const $checkbox = $(this);
            const $table = $checkbox.closest('.ffs-table-select');
            const $headerCheckbox = $table.find('thead input[type="checkbox"]');
            const $bodyCheckboxes = $table.find('tbody input[type="checkbox"]');

            // 检查是否所有复选框都被选中
            const allChecked = $bodyCheckboxes.length === $bodyCheckboxes.filter(':checked').length;

            // 更新头部复选框状态
            $headerCheckbox.prop('checked', allChecked);

            // 触发选择变化事件
            $table.trigger('table:selectionChange', [getSelectedRows($table)]);
        });

        // 获取选中的行
        function getSelectedRows($table) {
            const selectedRows = [];

            $table.find('tbody input[type="checkbox"]:checked').each(function () {
                const $checkbox = $(this);
                const $row = $checkbox.closest('tr');
                const rowData = $row.data('row-data');
                const rowIndex = $row.index();

                selectedRows.push({
                    element: $row[0],
                    data: rowData,
                    index: rowIndex
                });
            });

            return selectedRows;
        }
    }

    /**
     * 初始化可展开表格
     * 处理表格行的展开和折叠功能
     */
    function initExpandTable() {
        // 展开/折叠行
        $(document).on('click', '.ffs-table-expand-icon', function () {
            const $icon = $(this);
            const $row = $icon.closest('tr');
            const $table = $row.closest('.ffs-table-expand');
            const rowIndex = $row.index();

            // 获取或创建展开内容容器
            let $content = $row.next('.ffs-table-expand-content');

            if (!$content.length) {
                // 如果不存在展开内容，则创建一个
                const colSpan = $row.find('td').length;
                $content = $(`<tr class="ffs-table-expand-content"><td colspan="${colSpan}"></td></tr>`);
                $row.after($content);

                // 获取自定义内容
                const template = $table.data('expand-template');
                const rowData = $row.data('row-data');

                // 使用自定义模板或默认模板渲染展开内容
                if (template && window[template] && typeof window[template] === 'function') {
                    $content.find('td').html(window[template](rowData, rowIndex));
                } else {
                    // 默认展开内容
                    let defaultContent = '<div class="ffs-table-expand-default">';

                    // 如果有行数据，显示数据
                    if (rowData) {
                        defaultContent += '<ul>';
                        for (const key in rowData) {
                            if (Object.prototype.hasOwnProperty.call(rowData, key)) {
                                defaultContent += `<li><strong>${key}:</strong> ${rowData[key]}</li>`;
                            }
                        }
                        defaultContent += '</ul>';
                    } else {
                        defaultContent += '暂无详细信息';
                    }

                    defaultContent += '</div>';
                    $content.find('td').html(defaultContent);
                }
            }

            // 切换展开状态
            $icon.toggleClass('expanded');
            $content.toggleClass('show');

            // 触发展开/折叠事件
            if ($content.hasClass('show')) {
                $table.trigger('table:rowExpand', [$row, $content]);
            } else {
                $table.trigger('table:rowCollapse', [$row, $content]);
            }
        });
    }

    /**
     * 初始化可编辑表格
     * 处理表格单元格的编辑功能
     */
    function initEditTable() {
        // 单元格编辑开始
        $(document).on('focus', '.ffs-table-edit td[contenteditable="true"]', function () {
            const $cell = $(this);
            const originalValue = $cell.text();

            // 保存原始值
            $cell.data('original-value', originalValue);
        });

        // 单元格编辑结束
        $(document).on('blur', '.ffs-table-edit td[contenteditable="true"]', function () {
            const $cell = $(this);
            const $row = $cell.closest('tr');
            const $table = $row.closest('.ffs-table-edit');
            const originalValue = $cell.data('original-value');
            const newValue = $cell.text().trim();

            // 如果值发生变化，触发编辑事件
            if (originalValue !== newValue) {
                const columnIndex = $cell.index();
                const rowIndex = $row.index();
                const columnName = $table.find('thead th').eq(columnIndex).text();

                // 触发单元格编辑事件
                $table.trigger('table:cellEdit', [{
                    row: $row,
                    cell: $cell,
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    columnName: columnName,
                    oldValue: originalValue,
                    newValue: newValue
                }]);
            }
        });

        // 按下回车键完成编辑
        $(document).on('keydown', '.ffs-table-edit td[contenteditable="true"]', function (e) {
            if (e.keyCode === 13) { // Enter键
                e.preventDefault();
                $(this).blur();
            }
        });
    }

    /**
     * 初始化树形表格
     * 处理表格行的层级展示和展开/折叠功能
     */
    function initTreeTable() {
        // 展开/折叠树节点
        $(document).on('click', '.ffs-table-tree-icon', function () {
            const $icon = $(this);
            const $row = $icon.closest('tr');
            const $table = $row.closest('.ffs-table-tree');
            const level = parseInt($row.data('level') || 0, 10);
            const expanded = $icon.hasClass('expanded');

            // 切换图标状态
            $icon.toggleClass('expanded');

            // 查找并切换子节点的可见性
            let $nextRow = $row.next('tr');
            while ($nextRow.length && parseInt($nextRow.data('level') || 0, 10) > level) {
                if (expanded) {
                    // 折叠
                    $nextRow.hide();

                    // 如果子节点是展开的，也需要将其折叠
                    if ($nextRow.find('.ffs-table-tree-icon').hasClass('expanded')) {
                        $nextRow.find('.ffs-table-tree-icon').removeClass('expanded');
                    }
                } else {
                    // 展开
                    if (parseInt($nextRow.data('level') || 0, 10) === level + 1) {
                        $nextRow.show();
                    }
                }

                $nextRow = $nextRow.next('tr');
            }

            // 触发展开/折叠事件
            if (expanded) {
                $table.trigger('tree:collapse', [$row, level]);
            } else {
                $table.trigger('tree:expand', [$row, level]);
            }
        });

        // 初始化树形表格
        $('.ffs-table-tree').each(function () {
            const $table = $(this);

            // 隐藏所有非顶级节点
            $table.find('tr[data-level]').each(function () {
                const $row = $(this);
                const level = parseInt($row.data('level') || 0, 10);

                if (level > 0) {
                    $row.hide();
                }
            });
        });
    }

    /**
     * 初始化排序表格
     * 处理表格列的排序功能
     */
    function initSortTable() {
        // 点击表头排序
        $(document).on('click', '.ffs-table-sort th', function () {
            const $th = $(this);
            const $table = $th.closest('.ffs-table-sort');
            const $tbody = $table.find('tbody');
            const $rows = $tbody.find('tr').toArray();
            const columnIndex = $th.index();

            // 如果表头不可排序，则返回
            if ($th.hasClass('no-sort')) {
                return;
            }

            // 获取当前排序方向
            let sortDirection = 'asc';
            if ($th.find('.ffs-table-sort-icon').hasClass('asc')) {
                sortDirection = 'desc';
            } else if ($th.find('.ffs-table-sort-icon').hasClass('desc')) {
                sortDirection = '';
            }

            // 清除所有排序图标
            $table.find('.ffs-table-sort-icon').removeClass('asc desc');

            // 设置当前列的排序图标
            if (sortDirection) {
                let $icon = $th.find('.ffs-table-sort-icon');
                if (!$icon.length) {
                    $icon = $('<span class="ffs-table-sort-icon"></span>');
                    $th.append($icon);
                }
                $icon.addClass(sortDirection);
            }

            // 如果没有排序方向，恢复原始顺序
            if (!sortDirection) {
                const originalRows = $table.data('original-rows');
                if (originalRows) {
                    $tbody.append(originalRows);
                }
                return;
            }

            // 保存原始行顺序
            if (!$table.data('original-rows')) {
                $table.data('original-rows', $rows);
            }

            // 排序行
            $rows.sort(function (a, b) {
                const $a = $(a).find('td').eq(columnIndex);
                const $b = $(b).find('td').eq(columnIndex);

                // 获取单元格值
                let aValue = $a.text().trim();
                let bValue = $b.text().trim();

                // 尝试转换为数字
                const aNum = parseFloat(aValue);
                const bNum = parseFloat(bValue);

                if (!isNaN(aNum) && !isNaN(bNum)) {
                    aValue = aNum;
                    bValue = bNum;
                }

                // 比较值
                if (aValue < bValue) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });

            // 更新表格
            $tbody.empty();
            $tbody.append($rows);

            // 触发排序事件
            $table.trigger('table:sort', [columnIndex, sortDirection]);
        });
    }

    /**
     * 初始化筛选表格
     * 处理表格列的筛选功能
     */
    function initFilterTable() {
        // 点击筛选图标
        $(document).on('click', '.ffs-table-filter-icon', function (e) {
            e.stopPropagation();

            const $icon = $(this);
            const $th = $icon.closest('th');
            const $dropdown = $th.find('.ffs-table-filter-dropdown');

            // 隐藏其他筛选下拉框
            $('.ffs-table-filter-dropdown').not($dropdown).hide();

            // 切换当前筛选下拉框
            $dropdown.toggle();
        });

        // 点击筛选按钮
        $(document).on('click', '.ffs-table-filter-apply', function (e) {
            e.stopPropagation();

            const $btn = $(this);
            const $dropdown = $btn.closest('.ffs-table-filter-dropdown');
            const $th = $dropdown.closest('th');
            const $table = $th.closest('.ffs-table-filter');
            const columnIndex = $th.index();

            // 获取筛选值
            const filterValues = [];
            $dropdown.find('input[type="checkbox"]:checked').each(function () {
                filterValues.push($(this).val());
            });

            // 筛选行
            const $rows = $table.find('tbody tr');
            $rows.each(function () {
                const $row = $(this);
                const $cell = $row.find('td').eq(columnIndex);
                const cellValue = $cell.text().trim();

                if (filterValues.length === 0 || filterValues.includes(cellValue)) {
                    $row.show();
                } else {
                    $row.hide();
                }
            });

            // 隐藏下拉框
            $dropdown.hide();

            // 标记筛选状态
            if (filterValues.length > 0) {
                $th.addClass('filtered');
            } else {
                $th.removeClass('filtered');
            }

            // 触发筛选事件
            $table.trigger('table:filter', [columnIndex, filterValues]);
        });

        // 点击重置按钮
        $(document).on('click', '.ffs-table-filter-reset', function (e) {
            e.stopPropagation();

            const $btn = $(this);
            const $dropdown = $btn.closest('.ffs-table-filter-dropdown');
            const $th = $dropdown.closest('th');
            const $table = $th.closest('.ffs-table-filter');

            // 重置复选框
            $dropdown.find('input[type="checkbox"]').prop('checked', false);

            // 显示所有行
            $table.find('tbody tr').show();

            // 隐藏下拉框
            $dropdown.hide();

            // 移除筛选状态
            $th.removeClass('filtered');

            // 触发重置事件
            $table.trigger('table:filterReset');
        });

        // 点击文档其他地方关闭下拉框
        $(document).on('click', function () {
            $('.ffs-table-filter-dropdown').hide();
        });

        // 初始化筛选下拉框
        $('.ffs-table-filter').each(function () {
            const $table = $(this);

            // 为每个可筛选的表头添加筛选图标和下拉框
            $table.find('th[data-filter]').each(function () {
                const $th = $(this);
                const columnIndex = $th.index();

                // 如果已经有筛选图标，则跳过
                if ($th.find('.ffs-table-filter-icon').length) {
                    return;
                }

                // 添加筛选图标
                const $icon = $('<span class="ffs-table-filter-icon"></span>');
                $th.append($icon);

                // 创建筛选下拉框
                const $dropdown = $('<div class="ffs-table-filter-dropdown"></div>');
                $th.append($dropdown);

                // 获取列中的唯一值
                const uniqueValues = [];
                $table.find('tbody tr').each(function () {
                    const $cell = $(this).find('td').eq(columnIndex);
                    const value = $cell.text().trim();

                    if (value && !uniqueValues.includes(value)) {
                        uniqueValues.push(value);
                    }
                });

                // 创建筛选选项
                let filterContent = '<div class="ffs-table-filter-options">';
                uniqueValues.sort().forEach(function (value) {
                    filterContent += `
                        <div class="ffs-table-filter-option">
                            <label>
                                <input type="checkbox" value="${value}">
                                <span>${value}</span>
                            </label>
                        </div>
                    `;
                });
                filterContent += '</div>';

                // 添加按钮
                filterContent += `
                    <div class="ffs-table-filter-actions">
                        <button class="ffs-table-filter-reset">重置</button>
                        <button class="ffs-table-filter-apply">确定</button>
                    </div>
                `;

                // 设置下拉框内容
                $dropdown.html(filterContent);
            });
        });
    }

    /**
     * 初始化分页表格
     * 处理表格的分页功能
     */
    function initPaginationTable() {
        $('.ffs-table-pagination').each(function () {
            const $table = $(this);
            const $tbody = $table.find('tbody');
            const $pagination = $table.find('.ffs-table-pagination-container');

            // 如果没有分页容器，则创建一个
            if (!$pagination.length) {
                $table.after('<div class="ffs-table-pagination-container"></div>');
            }

            // 默认参数
            const pageSize = parseInt($table.data('page-size') || 10, 10);
            let currentPage = 1;
            let totalPages = 1;
            let allRows = [];

            // 初始化分页
            function initPagination() {
                // 获取所有行
                allRows = $tbody.find('tr').toArray();

                // 计算总页数
                totalPages = Math.ceil(allRows.length / pageSize);

                // 渲染分页控件
                renderPagination();

                // 显示第一页
                showPage(1);
            }

            // 显示指定页
            function showPage(page) {
                // 验证页码
                if (page < 1) {
                    page = 1;
                } else if (page > totalPages) {
                    page = totalPages;
                }

                // 更新当前页
                currentPage = page;

                // 计算显示的行范围
                const startIndex = (page - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, allRows.length);

                // 清空表格
                $tbody.empty();

                // 添加当前页的行
                for (let i = startIndex; i < endIndex; i++) {
                    $tbody.append(allRows[i]);
                }

                // 更新分页控件
                updatePagination();

                // 触发分页事件
                $table.trigger('table:page', [currentPage, totalPages]);
            }

            // 渲染分页控件
            function renderPagination() {
                const $container = $table.next('.ffs-table-pagination-container');

                // 创建分页控件
                let html = `
                    <div class="ffs-table-pagination-info">
                        共 ${allRows.length} 条记录，每页 ${pageSize} 条，共 ${totalPages} 页
                    </div>
                    <div class="ffs-table-pagination-buttons">
                        <button class="ffs-table-pagination-button first" title="首页">&laquo;</button>
                        <button class="ffs-table-pagination-button prev" title="上一页">&lsaquo;</button>
                        <span class="ffs-table-pagination-pages"></span>
                        <button class="ffs-table-pagination-button next" title="下一页">&rsaquo;</button>
                        <button class="ffs-table-pagination-button last" title="末页">&raquo;</button>
                    </div>
                `;

                // 设置分页控件内容
                $container.html(html);

                // 绑定分页按钮事件
                $container.find('.first').on('click', function () {
                    showPage(1);
                });

                $container.find('.prev').on('click', function () {
                    showPage(currentPage - 1);
                });

                $container.find('.next').on('click', function () {
                    showPage(currentPage + 1);
                });

                $container.find('.last').on('click', function () {
                    showPage(totalPages);
                });
            }

            // 更新分页控件
            function updatePagination() {
                const $container = $table.next('.ffs-table-pagination-container');
                const $pages = $container.find('.ffs-table-pagination-pages');

                // 更新页码按钮
                let pagesHtml = '';

                // 计算显示的页码范围
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);

                // 调整起始页码
                if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                }

                // 生成页码按钮
                for (let i = startPage; i <= endPage; i++) {
                    const activeClass = i === currentPage ? 'active' : '';
                    pagesHtml += `<button class="ffs-table-pagination-button page ${activeClass}" data-page="${i}">${i}</button>`;
                }

                // 设置页码按钮
                $pages.html(pagesHtml);

                // 绑定页码按钮事件
                $pages.find('.page').on('click', function () {
                    const page = parseInt($(this).data('page'), 10);
                    showPage(page);
                });

                // 更新按钮状态
                $container.find('.first, .prev').toggleClass('disabled', currentPage === 1);
                $container.find('.last, .next').toggleClass('disabled', currentPage === totalPages);

                // 更新信息
                $container.find('.ffs-table-pagination-info').text(`共 ${allRows.length} 条记录，每页 ${pageSize} 条，共 ${totalPages} 页`);
            }

            // 初始化分页
            initPagination();

            // 提供公共API
            $table.showPage = showPage;
            $table.refresh = initPagination;
        });
    }

    /**
     * 初始化虚拟滚动表格
     * 处理大量数据的高效渲染
     */
    function initVirtualTable() {
        $('.ffs-table-virtual').each(function () {
            const $container = $(this);
            const $content = $container.find('.ffs-table-virtual-content');
            const $table = $container.find('.ffs-table');
            const $thead = $table.find('thead');
            const $tbody = $table.find('tbody');

            // 默认参数
            const rowHeight = parseInt($container.data('row-height') || 40, 10);
            const bufferSize = 5; // 上下缓冲区的行数
            let allRows = [];
            let visibleRows = [];
            let startIndex = 0;
            let endIndex = 0;

            // 设置数据
            $container.setVirtualData = function (data) {
                allRows = data;

                // 设置内容高度
                $content.height(allRows.length * rowHeight);

                // 渲染可见行
                updateVisibleRows();

                return $container;
            };

            // 更新可见行
            function updateVisibleRows() {
                const scrollTop = $container.scrollTop();

                // 计算可见区域的起始和结束索引
                startIndex = Math.floor(scrollTop / rowHeight) - bufferSize;
                startIndex = Math.max(0, startIndex);

                const visibleCount = Math.ceil($container.height() / rowHeight) + bufferSize * 2;
                endIndex = startIndex + visibleCount;
                endIndex = Math.min(allRows.length, endIndex);

                // 获取可见行
                visibleRows = allRows.slice(startIndex, endIndex);

                // 渲染可见行
                renderVisibleRows();
            }

            // 渲染可见行
            function renderVisibleRows() {
                // 清空表格体
                $tbody.empty();

                // 设置表格体的位置
                $tbody.css('transform', `translateY(${startIndex * rowHeight}px)`);

                // 渲染可见行
                visibleRows.forEach(function (rowData) {
                    const $row = $('<tr></tr>');

                    // 设置行高
                    $row.height(rowHeight);

                    // 设置行数据
                    $row.data('row-data', rowData);

                    // 渲染单元格
                    $thead.find('th').each(function (index) {
                        const $th = $(this);
                        const field = $th.data('field');
                        const $td = $('<td></td>');

                        // 设置单元格内容
                        if (field && rowData[field] !== undefined) {
                            $td.text(rowData[field]);
                        } else if (rowData[index] !== undefined) {
                            $td.text(rowData[index]);
                        }

                        // 添加单元格
                        $row.append($td);
                    });

                    // 添加行
                    $tbody.append($row);
                });

                // 触发渲染完成事件
                $container.trigger('virtual:rendered', [visibleRows, startIndex, endIndex]);
            }

            // 监听滚动事件
            $container.on('scroll', function () {
                updateVisibleRows();
            });

            // 如果有初始数据，设置数据
            const initialData = $container.data('items');
            if (initialData && Array.isArray(initialData)) {
                $container.setVirtualData(initialData);
            }
        });
    }

    /**
     * 初始化所有表格组件
     */
    function initAllTables() {
        initSelectTable();
        initExpandTable();
        initEditTable();
        initTreeTable();
        initSortTable();
        initFilterTable();
        initPaginationTable();
        initVirtualTable();
    }

    // 在文档加载完成后初始化
    $(document).ready(function () {
        initAllTables();
    });

    // 导出公共API
    return {
        initSelectTable: initSelectTable,
        initExpandTable: initExpandTable,
        initEditTable: initEditTable,
        initTreeTable: initTreeTable,
        initSortTable: initSortTable,
        initFilterTable: initFilterTable,
        initPaginationTable: initPaginationTable,
        initVirtualTable: initVirtualTable,
        initAllTables: initAllTables
    };
})(jQuery);