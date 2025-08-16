/**
 * FFS UI - 选择器扩展组件
 * 提供级联选择、树形选择、穿梭框、多语言选择和地址选择等功能
 */
(function($) {
    'use strict';

    /**
     * 初始化级联选择器
     * 处理级联选择器的打开/关闭和选择事件
     */
    function initCascader() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-cascader:not(.ffs-cascader-disabled) .ffs-cascader-picker', function(e) {
            const $picker = $(this);
            const $cascader = $picker.closest('.ffs-cascader');
            
            // 切换下拉菜单显示状态
            $cascader.toggleClass('ffs-cascader-open');
            
            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($cascader.hasClass('ffs-cascader-open')) {
                $('.ffs-cascader').not($cascader).removeClass('ffs-cascader-open');
            }
        });
        
        // 点击级联选项
        $(document).on('click', '.ffs-cascader-menu-option:not(.ffs-cascader-menu-option-disabled)', function(e) {
            const $option = $(this);
            const $cascader = $option.closest('.ffs-cascader');
            const $menus = $cascader.find('.ffs-cascader-menu');
            const $label = $cascader.find('.ffs-cascader-label');
            const $hiddenInput = $cascader.find('input[type="hidden"]');
            
            // 获取当前菜单和索引
            const $currentMenu = $option.closest('.ffs-cascader-menu-item');
            const menuIndex = $menus.index($currentMenu);
            
            // 更新选中状态
            $currentMenu.find('.ffs-cascader-menu-option').removeClass('ffs-cascader-menu-option-selected');
            $option.addClass('ffs-cascader-menu-option-selected');
            
            // 获取选项文本和值
            const text = $option.text();
            const value = $option.data('value') || text;
            
            // 检查是否有子菜单
            const hasChildren = $option.data('children') && $option.data('children').length > 0;
            
            // 如果有子菜单，则加载子菜单
            if (hasChildren) {
                // 移除后续菜单
                $menus.filter(function(idx) {
                    return idx > menuIndex;
                }).remove();
                
                // 获取子菜单数据
                const children = $option.data('children') || [];
                
                // 创建子菜单
                if (children.length > 0) {
                    const $newMenu = $('<div class="ffs-cascader-menu-item"></div>');
                    const $newMenuList = $('<div class="ffs-cascader-menu-list"></div>');
                    
                    // 添加子菜单项
                    children.forEach(function(child) {
                        const $childOption = $(`<div class="ffs-cascader-menu-option" data-value="${child.value}">${child.label}</div>`);
                        
                        // 如果有子项，添加数据
                        if (child.children && child.children.length > 0) {
                            $childOption.data('children', child.children);
                        }
                        
                        // 如果禁用，添加禁用标记
                        if (child.disabled) {
                            $childOption.addClass('ffs-cascader-menu-option-disabled');
                        }
                        
                        $newMenuList.append($childOption);
                    });
                    
                    $newMenu.append($newMenuList);
                    $cascader.find('.ffs-cascader-menu').append($newMenu);
                }
            } else {
                // 如果没有子菜单，则完成选择
                
                // 获取完整的选择路径
                const selectedPath = [];
                $menus.each(function() {
                    const $selectedOption = $(this).find('.ffs-cascader-menu-option-selected');
                    if ($selectedOption.length) {
                        selectedPath.push($selectedOption.text());
                    }
                });
                
                // 更新显示文本
                $label.text(selectedPath.join(' / '));
                
                // 更新隐藏输入值
                if ($hiddenInput.length) {
                    $hiddenInput.val(value);
                }
                
                // 关闭下拉菜单
                $cascader.removeClass('ffs-cascader-open');
                
                // 触发选择事件
                $cascader.trigger('cascader:change', [value, selectedPath]);
            }
            
            // 阻止事件冒泡
            e.stopPropagation();
        });
        
        // 点击文档其他地方关闭下拉菜单
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.ffs-cascader').length) {
                $('.ffs-cascader').removeClass('ffs-cascader-open');
            }
        });
    }
    
    /**
     * 初始化树形选择器
     * 处理树形选择器的打开/关闭和选择事件
     */
    function initTreeSelect() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-treeselect:not(.ffs-treeselect-disabled) .ffs-treeselect-picker', function(e) {
            const $picker = $(this);
            const $treeselect = $picker.closest('.ffs-treeselect');
            
            // 切换下拉菜单显示状态
            $treeselect.toggleClass('ffs-treeselect-open');
            
            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($treeselect.hasClass('ffs-treeselect-open')) {
                $('.ffs-treeselect').not($treeselect).removeClass('ffs-treeselect-open');
            }
        });
        
        // 点击树节点展开/折叠
        $(document).on('click', '.ffs-treeselect-tree-node > i', function(e) {
            const $icon = $(this);
            const $node = $icon.closest('.ffs-treeselect-tree-node');
            
            // 切换展开/折叠状态
            $node.toggleClass('ffs-treeselect-tree-node-expanded');
            
            // 阻止事件冒泡
            e.stopPropagation();
        });
        
        // 点击树节点选择
        $(document).on('click', '.ffs-treeselect-tree-node:not(.ffs-treeselect-tree-node-disabled)', function(e) {
            const $node = $(this);
            const $treeselect = $node.closest('.ffs-treeselect');
            const $label = $treeselect.find('.ffs-treeselect-label');
            const $hiddenInput = $treeselect.find('input[type="hidden"]');
            const isMultiple = $treeselect.hasClass('ffs-treeselect-multiple');
            
            // 如果是多选模式
            if (isMultiple) {
                // 切换选中状态
                $node.toggleClass('ffs-treeselect-tree-node-selected');
                
                // 获取所有选中节点
                const $selectedNodes = $treeselect.find('.ffs-treeselect-tree-node-selected');
                const selectedTexts = [];
                const selectedValues = [];
                
                $selectedNodes.each(function() {
                    const text = $(this).clone().children().remove().end().text().trim();
                    const value = $(this).data('value') || text;
                    selectedTexts.push(text);
                    selectedValues.push(value);
                });
                
                // 更新显示文本
                if (selectedTexts.length > 0) {
                    $label.text(selectedTexts.join(', '));
                } else {
                    $label.text('请选择');
                }
                
                // 更新隐藏输入值
                if ($hiddenInput.length) {
                    $hiddenInput.val(selectedValues.join(','));
                }
                
                // 触发选择事件
                $treeselect.trigger('treeselect:change', [selectedValues, selectedTexts]);
            } else {
                // 单选模式
                
                // 更新选中状态
                $treeselect.find('.ffs-treeselect-tree-node').removeClass('ffs-treeselect-tree-node-selected');
                $node.addClass('ffs-treeselect-tree-node-selected');
                
                // 获取选中节点文本和值
                const text = $node.clone().children().remove().end().text().trim();
                const value = $node.data('value') || text;
                
                // 更新显示文本
                $label.text(text);
                
                // 更新隐藏输入值
                if ($hiddenInput.length) {
                    $hiddenInput.val(value);
                }
                
                // 关闭下拉菜单
                $treeselect.removeClass('ffs-treeselect-open');
                
                // 触发选择事件
                $treeselect.trigger('treeselect:change', [value, text]);
            }
            
            // 阻止事件冒泡
            e.stopPropagation();
        });
        
        // 搜索树节点
        $(document).on('input', '.ffs-treeselect-search-input', function() {
            const $input = $(this);
            const $treeselect = $input.closest('.ffs-treeselect');
            const $nodes = $treeselect.find('.ffs-treeselect-tree-node');
            const keyword = $input.val().toLowerCase();
            
            if (keyword) {
                $nodes.each(function() {
                    const $node = $(this);
                    const text = $node.clone().children().remove().end().text().trim().toLowerCase();
                    
                    if (text.indexOf(keyword) > -1) {
                        $node.show();
                        // 展开父节点
                        $node.parents('.ffs-treeselect-tree-node').addClass('ffs-treeselect-tree-node-expanded');
                    } else {
                        // 检查子节点是否匹配
                        const $childNodes = $node.find('.ffs-treeselect-tree-node');
                        let hasMatchedChild = false;
                        
                        $childNodes.each(function() {
                            const childText = $(this).clone().children().remove().end().text().trim().toLowerCase();
                            if (childText.indexOf(keyword) > -1) {
                                hasMatchedChild = true;
                                return false; // 跳出循环
                            }
                        });
                        
                        if (hasMatchedChild) {
                            $node.show();
                            $node.addClass('ffs-treeselect-tree-node-expanded');
                        } else {
                            $node.hide();
                        }
                    }
                });
            } else {
                // 如果关键字为空，显示所有节点
                $nodes.show();
            }
        });
        
        // 点击文档其他地方关闭下拉菜单
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.ffs-treeselect').length) {
                $('.ffs-treeselect').removeClass('ffs-treeselect-open');
            }
        });
    }
    
    /**
     * 初始化穿梭框
     * 处理穿梭框的选择和移动事件
     */
    function initTransfer() {
        // 点击穿梭框面板项
        $(document).on('click', '.ffs-transfer-panel-item:not(.ffs-transfer-panel-item-disabled)', function() {
            const $item = $(this);
            
            // 切换选中状态
            $item.toggleClass('ffs-transfer-panel-item-selected');
            
            // 更新操作按钮状态
            updateTransferButtons($item.closest('.ffs-transfer'));
        });
        
        // 点击向右移动按钮
        $(document).on('click', '.ffs-transfer-operation-btn:first-child:not(.ffs-transfer-operation-btn-disabled)', function() {
            const $btn = $(this);
            const $transfer = $btn.closest('.ffs-transfer');
            const $sourcePanel = $transfer.find('.ffs-transfer-panel:first-child');
            const $targetPanel = $transfer.find('.ffs-transfer-panel:last-child');
            
            // 获取选中项
            const $selectedItems = $sourcePanel.find('.ffs-transfer-panel-item-selected');
            
            // 移动选中项到目标面板
            $selectedItems.removeClass('ffs-transfer-panel-item-selected').appendTo($targetPanel.find('.ffs-transfer-panel-body'));
            
            // 更新操作按钮状态
            updateTransferButtons($transfer);
            
            // 更新计数
            updateTransferCount($transfer);
            
            // 触发移动事件
            $transfer.trigger('transfer:rightMove', [$selectedItems]);
        });
        
        // 点击向左移动按钮
        $(document).on('click', '.ffs-transfer-operation-btn:last-child:not(.ffs-transfer-operation-btn-disabled)', function() {
            const $btn = $(this);
            const $transfer = $btn.closest('.ffs-transfer');
            const $sourcePanel = $transfer.find('.ffs-transfer-panel:first-child');
            const $targetPanel = $transfer.find('.ffs-transfer-panel:last-child');
            
            // 获取选中项
            const $selectedItems = $targetPanel.find('.ffs-transfer-panel-item-selected');
            
            // 移动选中项到源面板
            $selectedItems.removeClass('ffs-transfer-panel-item-selected').appendTo($sourcePanel.find('.ffs-transfer-panel-body'));
            
            // 更新操作按钮状态
            updateTransferButtons($transfer);
            
            // 更新计数
            updateTransferCount($transfer);
            
            // 触发移动事件
            $transfer.trigger('transfer:leftMove', [$selectedItems]);
        });
        
        // 搜索穿梭框面板项
        $(document).on('input', '.ffs-transfer-panel-search-input', function() {
            const $input = $(this);
            const $panel = $input.closest('.ffs-transfer-panel');
            const $items = $panel.find('.ffs-transfer-panel-item');
            const keyword = $input.val().toLowerCase();
            
            if (keyword) {
                $items.each(function() {
                    const $item = $(this);
                    const text = $item.text().toLowerCase();
                    
                    if (text.indexOf(keyword) > -1) {
                        $item.show();
                    } else {
                        $item.hide();
                    }
                });
            } else {
                // 如果关键字为空，显示所有项
                $items.show();
            }
        });
        
        // 更新穿梭框操作按钮状态
        function updateTransferButtons($transfer) {
            const $leftBtn = $transfer.find('.ffs-transfer-operation-btn:last-child');
            const $rightBtn = $transfer.find('.ffs-transfer-operation-btn:first-child');
            const $leftSelectedItems = $transfer.find('.ffs-transfer-panel:last-child .ffs-transfer-panel-item-selected');
            const $rightSelectedItems = $transfer.find('.ffs-transfer-panel:first-child .ffs-transfer-panel-item-selected');
            
            // 更新左移按钮状态
            if ($leftSelectedItems.length > 0) {
                $leftBtn.removeClass('ffs-transfer-operation-btn-disabled');
            } else {
                $leftBtn.addClass('ffs-transfer-operation-btn-disabled');
            }
            
            // 更新右移按钮状态
            if ($rightSelectedItems.length > 0) {
                $rightBtn.removeClass('ffs-transfer-operation-btn-disabled');
            } else {
                $rightBtn.addClass('ffs-transfer-operation-btn-disabled');
            }
        }
        
        // 更新穿梭框计数
        function updateTransferCount($transfer) {
            const $leftPanel = $transfer.find('.ffs-transfer-panel:first-child');
            const $rightPanel = $transfer.find('.ffs-transfer-panel:last-child');
            const $leftCount = $leftPanel.find('.ffs-transfer-panel-header-count');
            const $rightCount = $rightPanel.find('.ffs-transfer-panel-header-count');
            
            // 更新左侧计数
            const leftCount = $leftPanel.find('.ffs-transfer-panel-item').length;
            $leftCount.text(`${leftCount}项`);
            
            // 更新右侧计数
            const rightCount = $rightPanel.find('.ffs-transfer-panel-item').length;
            $rightCount.text(`${rightCount}项`);
        }
    }
    
    /**
     * 初始化多语言选择器
     * 处理多语言选择器的打开/关闭和选择事件
     */
    function initLangSelect() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-langselect:not(.ffs-langselect-disabled) .ffs-langselect-picker', function(e) {
            const $picker = $(this);
            const $langselect = $picker.closest('.ffs-langselect');
            
            // 切换下拉菜单显示状态
            $langselect.toggleClass('ffs-langselect-open');
            
            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($langselect.hasClass('ffs-langselect-open')) {
                $('.ffs-langselect').not($langselect).removeClass('ffs-langselect-open');
            }
        });
        
        // 点击语言选项
        $(document).on('click', '.ffs-langselect-option:not(.ffs-langselect-option-disabled)', function() {
            const $option = $(this);
            const $langselect = $option.closest('.ffs-langselect');
            const $label = $langselect.find('.ffs-langselect-label');
            const $hiddenInput = $langselect.find('input[type="hidden"]');
            
            // 更新选中状态
            $langselect.find('.ffs-langselect-option').removeClass('ffs-langselect-option-selected');
            $option.addClass('ffs-langselect-option-selected');
            
            // 获取选项文本和值
            const text = $option.text();
            const value = $option.data('value') || text;
            
            // 更新显示文本
            $label.text(text);
            
            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(value);
            }
            
            // 关闭下拉菜单
            $langselect.removeClass('ffs-langselect-open');
            
            // 触发选择事件
            $langselect.trigger('langselect:change', [value, text]);
        });
        
        // 搜索语言选项
        $(document).on('input', '.ffs-langselect-search-input', function() {
            const $input = $(this);
            const $langselect = $input.closest('.ffs-langselect');
            const $options = $langselect.find('.ffs-langselect-option');
            const keyword = $input.val().toLowerCase();
            
            if (keyword) {
                $options.each(function() {
                    const $option = $(this);
                    const text = $option.text().toLowerCase();
                    
                    if (text.indexOf(keyword) > -1) {
                        $option.show();
                    } else {
                        $option.hide();
                    }
                });
            } else {
                // 如果关键字为空，显示所有选项
                $options.show();
            }
        });
        
        // 点击文档其他地方关闭下拉菜单
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.ffs-langselect').length) {
                $('.ffs-langselect').removeClass('ffs-langselect-open');
            }
        });
    }
    
    /**
     * 初始化地址选择器
     * 处理地址选择器的打开/关闭和选择事件
     */
    function initAddressSelect() {
        // 点击选择器打开/关闭下拉菜单
        $(document).on('click', '.ffs-addressselect:not(.ffs-addressselect-disabled) .ffs-addressselect-picker', function(e) {
            const $picker = $(this);
            const $addressselect = $picker.closest('.ffs-addressselect');
            
            // 切换下拉菜单显示状态
            $addressselect.toggleClass('ffs-addressselect-open');
            
            // 如果打开了下拉菜单，则关闭其他下拉菜单
            if ($addressselect.hasClass('ffs-addressselect-open')) {
                $('.ffs-addressselect').not($addressselect).removeClass('ffs-addressselect-open');
            }
        });
        
        // 点击省份选项
        $(document).on('click', '.ffs-addressselect-province-option', function() {
            const $option = $(this);
            const $addressselect = $option.closest('.ffs-addressselect');
            
            // 更新选中状态
            $addressselect.find('.ffs-addressselect-province-option').removeClass('ffs-addressselect-option-selected');
            $option.addClass('ffs-addressselect-option-selected');
            
            // 获取省份文本和值
            const text = $option.text();
            const value = $option.data('value') || text;
            
            // 更新城市列表
            updateCityOptions($addressselect, value);
            
            // 清空区县列表
            $addressselect.find('.ffs-addressselect-district-list').empty();
            
            // 更新地址文本
            updateAddressText($addressselect);
        });
        
        // 点击城市选项
        $(document).on('click', '.ffs-addressselect-city-option', function() {
            const $option = $(this);
            const $addressselect = $option.closest('.ffs-addressselect');
            
            // 更新选中状态
            $addressselect.find('.ffs-addressselect-city-option').removeClass('ffs-addressselect-option-selected');
            $option.addClass('ffs-addressselect-option-selected');
            
            // 获取城市文本和值
            const text = $option.text();
            const value = $option.data('value') || text;
            
            // 更新区县列表
            updateDistrictOptions($addressselect, value);
            
            // 更新地址文本
            updateAddressText($addressselect);
        });
        
        // 点击区县选项
        $(document).on('click', '.ffs-addressselect-district-option', function() {
            const $option = $(this);
            const $addressselect = $option.closest('.ffs-addressselect');
            
            // 更新选中状态
            $addressselect.find('.ffs-addressselect-district-option').removeClass('ffs-addressselect-option-selected');
            $option.addClass('ffs-addressselect-option-selected');
            
            // 更新地址文本
            updateAddressText($addressselect);
            
            // 关闭下拉菜单
            $addressselect.removeClass('ffs-addressselect-open');
        });
        
        // 更新城市选项
        function updateCityOptions($addressselect, provinceValue) {
            const $cityList = $addressselect.find('.ffs-addressselect-city-list');
            $cityList.empty();
            
            // 获取城市数据
            const cities = getCitiesByProvince(provinceValue);
            
            // 添加城市选项
            if (cities && cities.length > 0) {
                cities.forEach(function(city) {
                    const $option = $(`<div class="ffs-addressselect-city-option" data-value="${city.value}">${city.label}</div>`);
                    $cityList.append($option);
                });
                
                // 默认选中第一个城市
                $cityList.find('.ffs-addressselect-city-option:first-child').addClass('ffs-addressselect-option-selected');
                
                // 更新区县列表
                const firstCityValue = cities[0].value;
                updateDistrictOptions($addressselect, firstCityValue);
            }
        }
        
        // 更新区县选项
        function updateDistrictOptions($addressselect, cityValue) {
            const $districtList = $addressselect.find('.ffs-addressselect-district-list');
            $districtList.empty();
            
            // 获取区县数据
            const districts = getDistrictsByCity(cityValue);
            
            // 添加区县选项
            if (districts && districts.length > 0) {
                districts.forEach(function(district) {
                    const $option = $(`<div class="ffs-addressselect-district-option" data-value="${district.value}">${district.label}</div>`);
                    $districtList.append($option);
                });
                
                // 默认选中第一个区县
                $districtList.find('.ffs-addressselect-district-option:first-child').addClass('ffs-addressselect-option-selected');
            }
        }
        
        // 更新地址文本
        function updateAddressText($addressselect) {
            const $label = $addressselect.find('.ffs-addressselect-label');
            const $hiddenInput = $addressselect.find('input[type="hidden"]');
            
            // 获取选中的省份、城市和区县
            const $selectedProvince = $addressselect.find('.ffs-addressselect-province-option.ffs-addressselect-option-selected');
            const $selectedCity = $addressselect.find('.ffs-addressselect-city-option.ffs-addressselect-option-selected');
            const $selectedDistrict = $addressselect.find('.ffs-addressselect-district-option.ffs-addressselect-option-selected');
            
            // 构建地址文本
            let addressText = '';
            let addressValue = '';
            
            if ($selectedProvince.length) {
                const provinceText = $selectedProvince.text();
                const provinceValue = $selectedProvince.data('value') || provinceText;
                addressText += provinceText;
                addressValue += provinceValue;
                
                if ($selectedCity.length) {
                    const cityText = $selectedCity.text();
                    const cityValue = $selectedCity.data('value') || cityText;
                    addressText += ' ' + cityText;
                    addressValue += ',' + cityValue;
                    
                    if ($selectedDistrict.length) {
                        const districtText = $selectedDistrict.text();
                        const districtValue = $selectedDistrict.data('value') || districtText;
                        addressText += ' ' + districtText;
                        addressValue += ',' + districtValue;
                    }
                }
            }
            
            // 更新显示文本
            if (addressText) {
                $label.text(addressText);
            } else {
                $label.text('请选择地址');
            }
            
            // 更新隐藏输入值
            if ($hiddenInput.length) {
                $hiddenInput.val(addressValue);
            }
            
            // 触发选择事件
            $addressselect.trigger('addressselect:change', [addressValue, addressText]);
        }
        
        // 获取城市数据（示例函数，实际应从服务器获取或使用预定义数据）
        function getCitiesByProvince(provinceValue) {
            // 这里应该根据省份值获取对应的城市数据
            // 示例数据
            const cityData = {
                '110000': [
                    { value: '110100', label: '北京市' }
                ],
                '120000': [
                    { value: '120100', label: '天津市' }
                ],
                '130000': [
                    { value: '130100', label: '石家庄市' },
                    { value: '130200', label: '唐山市' },
                    { value: '130300', label: '秦皇岛市' }
                ]
                // 其他省份的城市数据...
            };
            
            return cityData[provinceValue] || [];
        }
        
        // 获取区县数据（示例函数，实际应从服务器获取或使用预定义数据）
        function getDistrictsByCity(cityValue) {
            // 这里应该根据城市值获取对应的区县数据
            // 示例数据
            const districtData = {
                '110100': [
                    { value: '110101', label: '东城区' },
                    { value: '110102', label: '西城区' },
                    { value: '110105', label: '朝阳区' },
                    { value: '110106', label: '丰台区' }
                ],
                '130100': [
                    { value: '130102', label: '长安区' },
                    { value: '130104', label: '桥西区' },
                    { value: '130105', label: '新华区' }
                ]
                // 其他城市的区县数据...
            };
            
            return districtData[cityValue] || [];
        }
        
        // 点击文档其他地方关闭下拉菜单
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.ffs-addressselect').length) {
                $('.ffs-addressselect').removeClass('ffs-addressselect-open');
            }
        });
    }

    // 在文档加载完成后初始化所有组件
    $(document).ready(function() {
        // 初始化级联选择器
        initCascader();
        
        // 初始化树形选择器
        initTreeSelect();
        
        // 初始化穿梭框
        initTransfer();
        
        // 初始化多语言选择器
        initLangSelect();
        
        // 初始化地址选择器
        initAddressSelect();
    });

})(jQuery);