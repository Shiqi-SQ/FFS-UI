/**
 * FFS UI - 选择器组件
 * 提供下拉选择、多选、分组选择和联动选择等功能
 */
(function($) {
    'use strict';

    /**
     * 初始化基础选择器
     * 处理选择器的打开/关闭和选择事件
     */
    function initSelect() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-select:not(.ffs-select-disabled) .ffs-select-selector', function(e) {
            const $selector = $(this);
            const $select = $selector.closest('.ffs-select');
            
            // 切换下拉菜单显示状态
            $select.toggleClass('ffs-select-open');
            
            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($select.hasClass('ffs-select-open')) {
                $('.ffs-select').not($select).removeClass('ffs-select-open');
            }
        });
        
        // 点击选项
        $(document).on('click', '.ffs-select-option:not(.ffs-select-option-disabled)', function(e) {
            const $option = $(this);
            const $select = $option.closest('.ffs-select');
            const $selection = $select.find('.ffs-select-selection');
            const isMultiple = $select.hasClass('ffs-select-multiple');
            
            // 获取选项文本和值
            const text = $option.text();
            const value = $option.data('value') || text;
            
            // 多选模式
            if (isMultiple) {
                // 切换选中状态
                $option.toggleClass('ffs-select-option-selected');
                
                // 如果选中，则添加标签
                if ($option.hasClass('ffs-select-option-selected')) {
                    // 创建标签
                    const $tag = $(`
                        <span class="ffs-select-tag" data-value="${value}">
                            ${text}
                            <i class="fas fa-times ffs-select-tag-remove"></i>
                        </span>
                    `);
                    
                    // 添加到选择区域
                    $selection.append($tag);
                } else {
                    // 移除对应的标签
                    $selection.find(`.ffs-select-tag[data-value="${value}"]`).remove();
                }
                
                // 更新隐藏输入值
                updateSelectValue($select);
                
                // 触发选择事件
                $select.trigger('select:change', [getSelectedValues($select)]);
            } 
            // 单选模式
            else {
                // 更新选中状态
                $select.find('.ffs-select-option').removeClass('ffs-select-option-selected');
                $option.addClass('ffs-select-option-selected');
                
                // 更新选择器显示
                $selection.text(text);
                
                // 更新隐藏输入值
                updateSelectValue($select);
                
                // 关闭下拉菜单
                $select.removeClass('ffs-select-open');
                
                // 触发选择事件
                $select.trigger('select:change', [value]);
            }
            
            // 阻止事件冒泡
            e.stopPropagation();
        });
        
        // 点击标签删除按钮
        $(document).on('click', '.ffs-select-tag-remove', function(e) {
            const $removeBtn = $(this);
            const $tag = $removeBtn.closest('.ffs-select-tag');
            const $select = $tag.closest('.ffs-select');
            const value = $tag.data('value');
            
            // 移除标签
            $tag.remove();
            
            // 更新选项选中状态
            $select.find(`.ffs-select-option[data-value="${value}"]`).removeClass('ffs-select-option-selected');
            
            // 更新隐藏输入值
            updateSelectValue($select);
            
            // 触发选择事件
            $select.trigger('select:change', [getSelectedValues($select)]);
            
            // 阻止事件冒泡
            e.stopPropagation();
        });
        
        // 点击外部关闭下拉菜单
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.ffs-select').length) {
                $('.ffs-select').removeClass('ffs-select-open');
            }
        });
        
        // 初始化选择器
        $('.ffs-select').each(function() {
            const $select = $(this);
            
            // 如果有隐藏输入，则根据值初始化选中状态
            const $hiddenInput = $select.find('input[type="hidden"]');
            if ($hiddenInput.length && $hiddenInput.val()) {
                initSelectValue($select, $hiddenInput.val());
            }
        });
        
        // 初始化选择器值
        function initSelectValue($select, value) {
            const isMultiple = $select.hasClass('ffs-select-multiple');
            const $selection = $select.find('.ffs-select-selection');
            
            // 多选模式
            if (isMultiple) {
                const values = value.split(',');
                
                // 清空选择区域
                $selection.empty();
                
                // 遍历值
                values.forEach(val => {
                    // 查找对应选项
                    const $option = $select.find(`.ffs-select-option[data-value="${val}"]`);
                    if ($option.length) {
                        // 设置选中状态
                        $option.addClass('ffs-select-option-selected');
                        
                        // 创建标签
                        const $tag = $(`
                            <span class="ffs-select-tag" data-value="${val}">
                                ${$option.text()}
                                <i class="fas fa-times ffs-select-tag-remove"></i>
                            </span>
                        `);
                        
                        // 添加到选择区域
                        $selection.append($tag);
                    }
                });
            } 
            // 单选模式
            else {
                // 查找对应选项
                const $option = $select.find(`.ffs-select-option[data-value="${value}"]`);
                if ($option.length) {
                    // 设置选中状态
                    $select.find('.ffs-select-option').removeClass('ffs-select-option-selected');
                    $option.addClass('ffs-select-option-selected');
                    
                    // 更新选择器显示
                    $selection.text($option.text());
                }
            }
        }
        
        // 更新选择器值
        function updateSelectValue($select) {
            const $hiddenInput = $select.find('input[type="hidden"]');
            if (!$hiddenInput.length) return;
            
            const values = getSelectedValues($select);
            
            // 更新隐藏输入值
            if (Array.isArray(values)) {
                $hiddenInput.val(values.join(','));
            } else {
                $hiddenInput.val(values);
            }
        }
        
        // 获取选中值
        function getSelectedValues($select) {
            const isMultiple = $select.hasClass('ffs-select-multiple');
            
            // 多选模式
            if (isMultiple) {
                const values = [];
                
                // 获取所有选中选项的值
                $select.find('.ffs-select-option-selected').each(function() {
                    const $option = $(this);
                    values.push($option.data('value') || $option.text());
                });
                
                return values;
            } 
            // 单选模式
            else {
                const $option = $select.find('.ffs-select-option-selected');
                return $option.data('value') || $option.text();
            }
        }
    }

    /**
     * 初始化搜索选择器
     * 处理选择器的搜索功能
     */
    function initSearchSelect() {
        // 初始化搜索框
        $('.ffs-select-search').each(function() {
            const $select = $(this);
            const $dropdown = $select.find('.ffs-select-dropdown');
            
            // 如果没有搜索框，则添加
            if (!$dropdown.find('.ffs-select-search-input').length) {
                const $searchInput = $(`
                    <div class="ffs-select-search-wrapper">
                        <input type="text" class="ffs-select-search-input" placeholder="搜索...">
                        <i class="fas fa-search ffs-select-search-icon"></i>
                    </div>
                `);
                
                $dropdown.prepend($searchInput);
            }
        });
        
        // 搜索框输入事件
        $(document).on('input', '.ffs-select-search-input', function() {
            const $input = $(this);
            const $select = $input.closest('.ffs-select');
            const $options = $select.find('.ffs-select-option');
            
            // 获取搜索关键字
            const keyword = $input.val().toLowerCase();
            
            // 如果关键字为空，则显示所有选项
            if (!keyword) {
                $options.show();
                $select.find('.ffs-select-group').show();
                return;
            }
            
            // 遍历选项
            $options.each(function() {
                const $option = $(this);
                const text = $option.text().toLowerCase();
                
                // 如果选项文本包含关键字，则显示，否则隐藏
                if (text.includes(keyword)) {
                    $option.show();
                } else {
                    $option.hide();
                }
            });
            
            // 处理分组
            $select.find('.ffs-select-group').each(function() {
                const $group = $(this);
                
                // 如果分组中没有可见选项，则隐藏分组
                if ($group.find('.ffs-select-option:visible').length === 0) {
                    $group.hide();
                } else {
                    $group.show();
                }
            });
        });
        
        // 阻止搜索框点击事件冒泡
        $(document).on('click', '.ffs-select-search-input', function(e) {
            e.stopPropagation();
        });
        
        // 搜索框按键事件
        $(document).on('keydown', '.ffs-select-search-input', function(e) {
            const $input = $(this);
            const $select = $input.closest('.ffs-select');
            const $options = $select.find('.ffs-select-option:visible');
            const $active = $options.filter('.ffs-select-option-active');
            
            // 向下键
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                
                if ($active.length) {
                    const $next = $active.nextAll('.ffs-select-option:visible').first();
                    if ($next.length) {
                        $active.removeClass('ffs-select-option-active');
                        $next.addClass('ffs-select-option-active');
                    }
                } else {
                    $options.first().addClass('ffs-select-option-active');
                }
            }
            // 向上键
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                
                if ($active.length) {
                    const $prev = $active.prevAll('.ffs-select-option:visible').first();
                    if ($prev.length) {
                        $active.removeClass('ffs-select-option-active');
                        $prev.addClass('ffs-select-option-active');
                    }
                } else {
                    $options.last().addClass('ffs-select-option-active');
                }
            }
            // 回车键
            else if (e.key === 'Enter') {
                e.preventDefault();
                
                if ($active.length) {
                    $active.trigger('click');
                }
            }
            // Esc键
            else if (e.key === 'Escape') {
                e.preventDefault();
                
                // 清空搜索框
                $input.val('');
                $input.trigger('input');
                
                // 关闭下拉菜单
                $select.removeClass('ffs-select-open');
            }
        });
    }

    /**
     * 初始化联动选择器
     * 处理选择器的联动功能
     */
    function initCascaderSelect() {
        // 初始化联动选择器
        $('.ffs-select-cascader').each(function() {
            const $cascader = $(this);
            const $selects = $cascader.find('.ffs-select');
            
            // 选择事件
            $selects.on('select:change', function(e, value) {
                const $currentSelect = $(this);
                const currentIndex = $selects.index($currentSelect);
                
                // 如果不是最后一个选择器，则更新下一个选择器
                if (currentIndex < $selects.length - 1) {
                    const $nextSelect = $selects.eq(currentIndex + 1);
                    
                    // 获取下一级选项数据
                    const nextOptions = getNextOptions($currentSelect, value);
                    
                    // 更新下一级选项
                    updateCascaderOptions($nextSelect, nextOptions);
                    
                    // 清空后续所有选择器
                    $selects.slice(currentIndex + 2).each(function() {
                        const $select = $(this);
                        $select.find('.ffs-select-selection').text('请选择');
                        $select.find('.ffs-select-option').removeClass('ffs-select-option-selected');
                        updateCascaderOptions($select, []);
                    });
                }
                
                // 触发联动选择事件
                $cascader.trigger('cascader:change', [getCascaderValues($cascader)]);
            });
        });
        
        // 获取下一级选项数据
        function getNextOptions($select, value) {
            // 获取数据源
            const dataSource = $select.data('children') || [];
            
            // 查找当前值对应的子选项
            for (let i = 0; i < dataSource.length; i++) {
                const item = dataSource[i];
                if (item.value === value) {
                    return item.children || [];
                }
            }
            
            return [];
        }
        
        // 更新联动选择器选项
        function updateCascaderOptions($select, options) {
            const $dropdown = $select.find('.ffs-select-dropdown');
            const $optionsContainer = $dropdown.find('.ffs-select-options');
            
            // 清空选项
            $optionsContainer.empty();
            
            // 添加选项
            options.forEach(option => {
                const $option = $(`<div class="ffs-select-option" data-value="${option.value}">${option.label}</div>`);
                $optionsContainer.append($option);
            });
        }
        
        // 获取联动选择器的所有选中值
        function getCascaderValues($cascader) {
            const values = [];
            
            // 获取所有选择器的选中值
            $cascader.find('.ffs-select').each(function() {
                const $select = $(this);
                const value = getSelectedValues($select);
                
                if (value) {
                    values.push(value);
                }
            });
            
            return values;
        }
    }

    /**
     * 初始化远程搜索选择器
     * 处理选择器的远程搜索功能
     */
    function initRemoteSelect() {
        // 远程搜索输入事件
        $(document).on('input', '.ffs-select-remote .ffs-select-search-input', function() {
            const $input = $(this);
            const $select = $input.closest('.ffs-select');
            const $options = $select.find('.ffs-select-options');
            
            // 获取搜索关键字
            const keyword = $input.val().trim();
            
            // 如果关键字为空，则清空选项
            if (!keyword) {
                $options.empty();
                return;
            }
            
            // 显示加载状态
            $options.html('<div class="ffs-select-option-loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>');
            
            // 获取远程搜索函数
            const remoteSearchFn = window[$select.data('remote-search')];
            
            // 如果有远程搜索函数，则调用
            if (typeof remoteSearchFn === 'function') {
                // 设置延迟，避免频繁请求
                clearTimeout($select.data('search-timer'));
                
                const timer = setTimeout(() => {
                    // 调用远程搜索函数
                    remoteSearchFn(keyword, function(results) {
                        // 清空选项
                        $options.empty();
                        
                        // 如果没有结果，则显示无数据
                        if (!results || !results.length) {
                            $options.html('<div class="ffs-select-option-empty">无匹配数据</div>');
                            return;
                        }
                        
                        // 添加选项
                        results.forEach(item => {
                            const $option = $(`<div class="ffs-select-option" data-value="${item.value}">${item.label}</div>`);
                            $options.append($option);
                        });
                    });
                }, 300);
                
                $select.data('search-timer', timer);
            }
        });
    }

    /**
     * 初始化选择器尺寸
     * 处理选择器的不同尺寸样式
     */
    function initSelectSize() {
        // 初始化选择器尺寸
        $('.ffs-select').each(function() {
            const $select = $(this);
            
            // 获取尺寸
            const size = $select.data('size');
            
            // 设置尺寸样式
            if (size === 'large') {
                $select.addClass('ffs-select-lg');
            } else if (size === 'small') {
                $select.addClass('ffs-select-sm');
            }
        });
    }

    /**
     * 初始化选择器状态
     * 处理选择器的禁用和只读状态
     */
    function initSelectState() {
        // 禁用选择器
        $.fn.disableSelect = function() {
            return this.each(function() {
                const $select = $(this);
                $select.addClass('ffs-select-disabled');
            });
        };
        
        // 启用选择器
        $.fn.enableSelect = function() {
            return this.each(function() {
                const $select = $(this);
                $select.removeClass('ffs-select-disabled');
            });
        };
        
        // 设置只读状态
        $.fn.readonlySelect = function(readonly = true) {
            return this.each(function() {
                const $select = $(this);
                
                if (readonly) {
                    $select.addClass('ffs-select-readonly');
                } else {
                    $select.removeClass('ffs-select-readonly');
                }
            });
        };
    }

    /**
     * 初始化所有选择器组件
     */
    function initAllSelect() {
        initSelect();
        initSearchSelect();
        initCascaderSelect();
        initRemoteSelect();
        initSelectSize();
        initSelectState();
    }

    // 在文档加载完成后初始化
    $(document).ready(function() {
        initAllSelect();
    });

    // 导出公共API
    return {
        initSelect: initSelect,
        initSearchSelect: initSearchSelect,
        initCascaderSelect: initCascaderSelect,
        initRemoteSelect: initRemoteSelect,
        initSelectSize: initSelectSize,
        initSelectState: initSelectState,
        initAllSelect: initAllSelect
    };
})(jQuery);