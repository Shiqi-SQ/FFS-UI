/**
 * FFS UI - 分页组件
 * 提供分页的交互功能，包括页码切换、跳转页码和自定义分页等
 */
(function($) {
    'use strict';

    /**
     * 初始化分页组件
     * 处理分页项点击和页码跳转
     */
    function initPagination() {
        // 分页项点击事件
        $(document).on('click', '.ffs-pagination-item', function(e) {
            const $item = $(this);
            
            // 如果是禁用状态或当前页，不执行操作
            if ($item.hasClass('disabled') || $item.hasClass('active')) {
                e.preventDefault();
                return;
            }
            
            // 如果不是外部链接，阻止默认行为
            if (!$item.attr('href') || $item.attr('href') === '#') {
                e.preventDefault();
            }
            
            const $pagination = $item.closest('.ffs-pagination');
            
            // 获取当前页码和总页数
            let currentPage = parseInt($pagination.data('current-page')) || 1;
            const totalPages = parseInt($pagination.data('total-pages')) || 1;
            
            // 根据点击的项确定目标页码
            let targetPage = currentPage;
            
            // 如果是数字页码
            if ($item.text().trim().match(/^\d+$/)) {
                targetPage = parseInt($item.text().trim());
            } 
            // 如果是上一页
            else if ($item.find('.fa-chevron-left').length || $item.text().includes('上一页')) {
                targetPage = Math.max(1, currentPage - 1);
            } 
            // 如果是下一页
            else if ($item.find('.fa-chevron-right').length || $item.text().includes('下一页')) {
                targetPage = Math.min(totalPages, currentPage + 1);
            }
            // 如果是首页
            else if ($item.find('.fa-angle-double-left').length || $item.text().includes('首页')) {
                targetPage = 1;
            }
            // 如果是末页
            else if ($item.find('.fa-angle-double-right').length || $item.text().includes('末页')) {
                targetPage = totalPages;
            }
            
            // 如果目标页码与当前页码不同，触发页码变更
            if (targetPage !== currentPage) {
                changePage($pagination, targetPage, totalPages);
            }
        });
        
        // 跳转输入框变更事件
        $(document).on('change', '.ffs-pagination-jump-input', function() {
            const $input = $(this);
            const $pagination = $input.closest('.ffs-pagination');
            
            // 获取输入值
            let value = parseInt($input.val());
            const totalPages = parseInt($pagination.data('total-pages')) || 1;
            
            // 确保值在有效范围内
            if (isNaN(value)) {
                value = 1;
            } else if (value < 1) {
                value = 1;
            } else if (value > totalPages) {
                value = totalPages;
            }
            
            // 更新输入框值
            $input.val(value);
            
            // 触发页码变更
            changePage($pagination, value, totalPages);
        });
        
        // 初始化带有data属性的分页组件
        $('.ffs-pagination[data-total-pages]').each(function() {
            const $pagination = $(this);
            const currentPage = parseInt($pagination.data('current-page')) || 1;
            const totalPages = parseInt($pagination.data('total-pages')) || 1;
            
            // 初始化分页状态
            updatePaginationState($pagination, currentPage, totalPages);
        });
    }
    
    /**
     * 更改页码
     * @param {jQuery} $pagination - 分页容器
     * @param {number} page - 目标页码
     * @param {number} totalPages - 总页数
     */
    function changePage($pagination, page, totalPages) {
        // 更新数据属性
        $pagination.data('current-page', page);
        
        // 更新分页状态
        updatePaginationState($pagination, page, totalPages);
        
        // 触发页码变更事件
        $pagination.trigger('pagination:change', [page, totalPages]);
        
        // 如果设置了回调函数，执行回调
        const callback = $pagination.data('callback');
        if (typeof callback === 'function') {
            callback(page, totalPages);
        }
    }
    
    /**
     * 更新分页状态
     * @param {jQuery} $pagination - 分页容器
     * @param {number} currentPage - 当前页码
     * @param {number} totalPages - 总页数
     */
    function updatePaginationState($pagination, currentPage, totalPages) {
        // 更新页码项状态
        $pagination.find('.ffs-pagination-item').each(function() {
            const $item = $(this);
            
            // 如果是数字页码
            if ($item.text().trim().match(/^\d+$/)) {
                const pageNum = parseInt($item.text().trim());
                $item.toggleClass('active', pageNum === currentPage);
            }
            
            // 更新上一页按钮状态
            if ($item.find('.fa-chevron-left').length || $item.text().includes('上一页')) {
                $item.toggleClass('disabled', currentPage <= 1);
            }
            
            // 更新下一页按钮状态
            if ($item.find('.fa-chevron-right').length || $item.text().includes('下一页')) {
                $item.toggleClass('disabled', currentPage >= totalPages);
            }
            
            // 更新首页按钮状态
            if ($item.find('.fa-angle-double-left').length || $item.text().includes('首页')) {
                $item.toggleClass('disabled', currentPage <= 1);
            }
            
            // 更新末页按钮状态
            if ($item.find('.fa-angle-double-right').length || $item.text().includes('末页')) {
                $item.toggleClass('disabled', currentPage >= totalPages);
            }
        });
        
        // 更新跳转输入框
        $pagination.find('.ffs-pagination-jump-input').val(currentPage);
    }
    
    /**
     * 创建分页组件
     * @param {object} options - 配置选项
     * @returns {jQuery} - 分页组件元素
     */
    function createPagination(options) {
        // 默认配置
        const defaults = {
            container: null,          // 容器选择器或元素
            currentPage: 1,           // 当前页码
            totalPages: 1,            // 总页数
            showPageNumbers: true,    // 是否显示页码
            showJump: false,          // 是否显示跳转
            showFirstLast: false,     // 是否显示首页和末页
            size: 'default',          // 尺寸：default, mini
            maxPageItems: 5,          // 最大显示的页码数量
            onPageChange: null        // 页码变更回调
        };
        
        // 合并配置
        const settings = $.extend({}, defaults, options);
        
        // 创建分页容器
        const $pagination = $('<nav></nav>').addClass('ffs-pagination');
        
        // 设置尺寸
        if (settings.size === 'mini') {
            $pagination.addClass('ffs-pagination-mini');
        }
        
        // 设置数据属性
        $pagination.data('current-page', settings.currentPage);
        $pagination.data('total-pages', settings.totalPages);
        
        // 如果有回调，设置回调
        if (typeof settings.onPageChange === 'function') {
            $pagination.data('callback', settings.onPageChange);
        }
        
        // 添加首页按钮
        if (settings.showFirstLast) {
            const $firstItem = $('<a></a>')
                .addClass('ffs-pagination-item')
                .attr('href', '#')
                .html('<i class="fas fa-angle-double-left"></i>');
            
            if (settings.currentPage <= 1) {
                $firstItem.addClass('disabled');
            }
            
            $pagination.append($firstItem);
        }
        
        // 添加上一页按钮
        const $prevItem = $('<a></a>')
            .addClass('ffs-pagination-item')
            .attr('href', '#')
            .html('<i class="fas fa-chevron-left"></i>');
        
        if (settings.currentPage <= 1) {
            $prevItem.addClass('disabled');
        }
        
        $pagination.append($prevItem);
        
        // 添加页码
        if (settings.showPageNumbers) {
            // 计算显示的页码范围
            let startPage = Math.max(1, settings.currentPage - Math.floor(settings.maxPageItems / 2));
            let endPage = Math.min(settings.totalPages, startPage + settings.maxPageItems - 1);
            
            // 调整起始页码
            if (endPage - startPage < settings.maxPageItems - 1) {
                startPage = Math.max(1, endPage - settings.maxPageItems + 1);
            }
            
            // 添加页码按钮
            for (let i = startPage; i <= endPage; i++) {
                const $pageItem = $('<a></a>')
                    .addClass('ffs-pagination-item')
                    .attr('href', '#')
                    .text(i);
                
                if (i === settings.currentPage) {
                    $pageItem.addClass('active');
                }
                
                $pagination.append($pageItem);
            }
            
            // 如果结束页码小于总页数，添加省略号
            if (endPage < settings.totalPages) {
                $pagination.append(
                    $('<span></span>')
                        .addClass('ffs-pagination-item')
                        .text('...')
                );
                
                // 添加最后一页
                $pagination.append(
                    $('<a></a>')
                        .addClass('ffs-pagination-item')
                        .attr('href', '#')
                        .text(settings.totalPages)
                );
            }
        }
        
        // 添加下一页按钮
        const $nextItem = $('<a></a>')
            .addClass('ffs-pagination-item')
            .attr('href', '#')
            .html('<i class="fas fa-chevron-right"></i>');
        
        if (settings.currentPage >= settings.totalPages) {
            $nextItem.addClass('disabled');
        }
        
        $pagination.append($nextItem);
        
        // 添加末页按钮
        if (settings.showFirstLast) {
            const $lastItem = $('<a></a>')
                .addClass('ffs-pagination-item')
                .attr('href', '#')
                .html('<i class="fas fa-angle-double-right"></i>');
            
            if (settings.currentPage >= settings.totalPages) {
                $lastItem.addClass('disabled');
            }
            
            $pagination.append($lastItem);
        }
        
        // 添加跳转
        if (settings.showJump) {
            const $jump = $('<div></div>').addClass('ffs-pagination-jump');
            
            $jump.append(
                $('<span></span>')
                    .addClass('ffs-pagination-jump-text')
                    .text('跳至')
            );
            
            $jump.append(
                $('<input>')
                    .attr('type', 'number')
                    .addClass('ffs-pagination-jump-input')
                    .attr('min', 1)
                    .attr('max', settings.totalPages)
                    .val(settings.currentPage)
            );
            
            $jump.append(
                $('<span></span>')
                    .addClass('ffs-pagination-jump-text')
                    .text('页')
            );
            
            $pagination.append($jump);
        }
        
        // 如果指定了容器，添加到容器
        if (settings.container) {
            $(settings.container).append($pagination);
        }
        
        return $pagination;
    }
    
    // 分页API
    $.fn.pagination = function(options) {
        if (typeof options === 'string') {
            // 方法调用
            const method = options;
            const args = Array.prototype.slice.call(arguments, 1);
            
            switch (method) {
                case 'goToPage':
                    return this.each(function() {
                        const $pagination = $(this);
                        const page = args[0];
                        const totalPages = parseInt($pagination.data('total-pages')) || 1;
                        
                        if (page >= 1 && page <= totalPages) {
                            changePage($pagination, page, totalPages);
                        }
                    });
                    
                case 'getCurrentPage':
                    return parseInt(this.first().data('current-page')) || 1;
                    
                case 'getTotalPages':
                    return parseInt(this.first().data('total-pages')) || 1;
                    
                case 'setTotalPages':
                    return this.each(function() {
                        const $pagination = $(this);
                        const totalPages = args[0];
                        const currentPage = parseInt($pagination.data('current-page')) || 1;
                        
                        $pagination.data('total-pages', totalPages);
                        updatePaginationState($pagination, currentPage, totalPages);
                    });
                    
                case 'destroy':
                    return this.each(function() {
                        $(this).remove();
                    });
            }
        } else {
            // 创建新的分页组件
            return createPagination($.extend({ container: this }, options));
        }
        
        return this;
    };
    
    // 初始化组件
    $(function() {
        initPagination();
    });
    
})(jQuery);