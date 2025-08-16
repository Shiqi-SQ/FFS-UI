/**
 * FFS UI - 标签页组件
 * 提供标签页的交互功能，包括标签切换、可关闭标签和可拖拽标签等
 */
(function ($) {
    'use strict';

    /**
     * 初始化标签页
     * 处理标签切换和内容显示
     */
    function initTabs() {
        // 标签点击事件
        $(document).on('click', '.ffs-tabs-tab', function (e) {
            const $tab = $(this);

            // 如果已经是活动状态，不执行操作
            if ($tab.hasClass('active')) {
                e.preventDefault();
                return;
            }

            // 如果不是外部链接，阻止默认行为
            if (!$tab.attr('href') || $tab.attr('href') === '#') {
                e.preventDefault();
            }

            const $tabs = $tab.closest('.ffs-tabs');
            const $tabNav = $tab.closest('.ffs-tabs-nav');

            // 获取目标内容面板
            let targetId = $tab.attr('data-target');

            // 如果没有设置 data-target，尝试从 href 获取
            if (!targetId && $tab.attr('href') && $tab.attr('href') !== '#') {
                targetId = $tab.attr('href').replace(/.*(?=#[^\s]*$)/, '');
            }

            // 如果仍然没有目标ID，尝试使用索引
            if (!targetId) {
                const index = $tabNav.find('.ffs-tabs-tab').index($tab);
                const $panes = $tabs.find('.ffs-tabs-pane');

                if (index >= 0 && $panes.length > index) {
                    targetId = '#' + $panes.eq(index).attr('id');
                }
            }

            // 移除其他标签的活动状态
            $tabNav.find('.ffs-tabs-tab').removeClass('active');

            // 添加当前标签的活动状态
            $tab.addClass('active');

            // 如果找到目标内容面板，显示它
            if (targetId) {
                const $targetPane = $(targetId);

                if ($targetPane.length) {
                    // 隐藏其他内容面板
                    $tabs.find('.ffs-tabs-pane').removeClass('active');

                    // 显示目标内容面板
                    $targetPane.addClass('active');

                    // 触发标签切换事件
                    $tabs.trigger('tabs:change', [$tab, $targetPane]);
                }
            }
        });
    }

    /**
     * 初始化可关闭标签
     * 处理标签关闭按钮点击
     */
    function initClosableTabs() {
        // 关闭按钮点击事件
        $(document).on('click', '.ffs-tabs-tab-close', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const $closeBtn = $(this);
            const $tab = $closeBtn.closest('.ffs-tabs-tab');
            const $tabs = $tab.closest('.ffs-tabs');
            const $tabNav = $tab.closest('.ffs-tabs-nav');

            // 获取目标内容面板
            let targetId = $tab.attr('data-target');

            // 如果没有设置 data-target，尝试从 href 获取
            if (!targetId && $tab.attr('href') && $tab.attr('href') !== '#') {
                targetId = $tab.attr('href').replace(/.*(?=#[^\s]*$)/, '');
            }

            // 如果标签是活动状态，需要激活其他标签
            if ($tab.hasClass('active')) {
                // 尝试激活下一个标签，如果没有则激活前一个
                const $nextTab = $tab.next('.ffs-tabs-tab');
                const $prevTab = $tab.prev('.ffs-tabs-tab');

                if ($nextTab.length) {
                    $nextTab.trigger('click');
                } else if ($prevTab.length) {
                    $prevTab.trigger('click');
                }
            }

            // 移除标签
            $tab.remove();

            // 如果找到目标内容面板，移除它
            if (targetId) {
                $(targetId).remove();
            }

            // 触发标签关闭事件
            $tabs.trigger('tabs:close', [$tab]);
        });
    }

    /**
     * 初始化可拖拽标签
     * 处理标签拖拽排序
     */
    function initDraggableTabs() {
        let draggedTab = null;

        // 开始拖拽
        $(document).on('dragstart', '.ffs-tabs-tab[draggable="true"]', function (e) {
            draggedTab = this;
            $(this).addClass('dragging');

            // 设置拖拽数据
            e.originalEvent.dataTransfer.effectAllowed = 'move';
            e.originalEvent.dataTransfer.setData('text/html', this.outerHTML);
        });

        // 拖拽结束
        $(document).on('dragend', '.ffs-tabs-tab[draggable="true"]', function () {
            $(this).removeClass('dragging');
            $('.ffs-tabs-tab').removeClass('drag-over');
            draggedTab = null;
        });

        // 拖拽经过
        $(document).on('dragover', '.ffs-tabs-tab[draggable="true"]', function (e) {
            e.preventDefault();

            if (draggedTab !== this) {
                $(this).addClass('drag-over');
            }
        });

        // 拖拽离开
        $(document).on('dragleave', '.ffs-tabs-tab[draggable="true"]', function () {
            $(this).removeClass('drag-over');
        });

        // 放置
        $(document).on('drop', '.ffs-tabs-tab[draggable="true"]', function (e) {
            e.preventDefault();

            if (draggedTab !== this) {
                const $draggedTab = $(draggedTab);
                const $dropTarget = $(this);
                const $tabNav = $dropTarget.closest('.ffs-tabs-nav');

                // 获取拖拽标签和目标标签的索引
                const draggedIndex = $tabNav.find('.ffs-tabs-tab').index($draggedTab);
                const dropIndex = $tabNav.find('.ffs-tabs-tab').index($dropTarget);

                // 移动标签
                if (draggedIndex < dropIndex) {
                    $dropTarget.after($draggedTab);
                } else {
                    $dropTarget.before($draggedTab);
                }

                // 移动对应的内容面板
                const $tabs = $tabNav.closest('.ffs-tabs');
                const $panes = $tabs.find('.ffs-tabs-pane');

                if ($panes.length > draggedIndex && $panes.length > dropIndex) {
                    const $draggedPane = $panes.eq(draggedIndex);
                    const $dropPane = $panes.eq(dropIndex);

                    if (draggedIndex < dropIndex) {
                        $dropPane.after($draggedPane);
                    } else {
                        $dropPane.before($draggedPane);
                    }
                }

                // 触发标签排序事件
                $tabs.trigger('tabs:reorder', [$draggedTab, $dropTarget]);
            }

            $(this).removeClass('drag-over');
        });
    }

    /**
     * 标签页API
     * 提供操作标签页的公共方法
     */
    $.ffsTabs = {
        /**
         * 创建标签页
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        create: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                type: 'default', // default, card, line, custom
                items: [],
                closable: false,
                draggable: false,
                onChange: null,
                onClose: null
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建标签页
            const $tabs = $('<div class="ffs-tabs"></div>');

            // 添加类型类
            if (settings.type !== 'default') {
                $tabs.addClass('ffs-tabs-' + settings.type);
            }

            // 创建标签导航
            const $tabNav = $('<div class="ffs-tabs-nav"></div>');

            // 创建内容区域
            const $tabContent = $('<div class="ffs-tabs-content"></div>');

            // 添加标签和内容
            settings.items.forEach((item, index) => {
                // 创建标签
                const tabId = item.id || 'tab-' + Math.random().toString(36).substr(2, 9);
                const paneId = item.paneId || 'pane-' + tabId;

                const $tab = $(`<a href="#${paneId}" class="ffs-tabs-tab${item.active ? ' active' : ''}" data-target="#${paneId}">${item.text}</a>`);

                // 如果需要可关闭
                if (settings.closable || item.closable) {
                    $tab.append('<i class="fas fa-times ffs-tabs-tab-close"></i>');
                }

                // 如果需要可拖拽
                if (settings.draggable || item.draggable) {
                    $tab.attr('draggable', 'true');
                }

                // 如果有图标
                if (item.icon) {
                    $tab.prepend(`<i class="${item.icon} ffs-tabs-tab-icon"></i> `);
                }

                // 如果有徽章
                if (item.badge) {
                    $tab.append(`<span class="ffs-tabs-tab-badge">${item.badge}</span>`);
                }

                // 添加标签到导航
                $tabNav.append($tab);

                // 创建内容面板
                const $pane = $(`<div id="${paneId}" class="ffs-tabs-pane${item.active ? ' active' : ''}"></div>`);

                // 添加内容
                if (item.content) {
                    $pane.html(item.content);
                }

                // 添加面板到内容区域
                $tabContent.append($pane);
            });

            // 添加导航和内容到标签页
            $tabs.append($tabNav).append($tabContent);

            // 绑定事件
            if (typeof settings.onChange === 'function') {
                $tabs.on('tabs:change', function (e, $tab, $pane) {
                    settings.onChange($tab, $pane);
                });
            }

            if (typeof settings.onClose === 'function') {
                $tabs.on('tabs:close', function (e, $tab) {
                    settings.onClose($tab);
                });
            }

            // 添加到容器
            $container.append($tabs);

            return $tabs;
        },

        /**
         * 添加标签
         * @param {string} selector - 标签页选择器
         * @param {object} item - 标签配置
         */
        addTab: function (selector, item = {}) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            // 创建标签
            const tabId = item.id || 'tab-' + Math.random().toString(36).substr(2, 9);
            const paneId = item.paneId || 'pane-' + tabId;

            const $tab = $(`<a href="#${paneId}" class="ffs-tabs-tab" data-target="#${paneId}">${item.text || '新标签'}</a>`);

            // 如果需要可关闭
            if ($tabs.find('.ffs-tabs-tab-close').length || item.closable) {
                $tab.append('<i class="fas fa-times ffs-tabs-tab-close"></i>');
            }

            // 如果需要可拖拽
            if ($tabs.find('.ffs-tabs-tab[draggable="true"]').length || item.draggable) {
                $tab.attr('draggable', 'true');
            }

            // 如果有图标
            if (item.icon) {
                $tab.prepend(`<i class="${item.icon} ffs-tabs-tab-icon"></i> `);
            }

            // 如果有徽章
            if (item.badge) {
                $tab.append(`<span class="ffs-tabs-tab-badge">${item.badge}</span>`);
            }

            // 添加标签到导航
            $tabs.find('.ffs-tabs-nav').append($tab);

            // 创建内容面板
            const $pane = $(`<div id="${paneId}" class="ffs-tabs-pane"></div>`);

            // 添加内容
            if (item.content) {
                $pane.html(item.content);
            }

            // 添加面板到内容区域
            $tabs.find('.ffs-tabs-content').append($pane);

            // 如果需要激活
            if (item.active) {
                $tab.trigger('click');
            }

            return $tab;
        },

        /**
         * 移除标签
         * @param {string} selector - 标签页选择器
         * @param {string} tabSelector - 标签选择器
         */
        removeTab: function (selector, tabSelector) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            const $tab = $tabs.find(tabSelector);

            if (!$tab.length) return;

            // 如果标签是活动状态，需要激活其他标签
            if ($tab.hasClass('active')) {
                // 尝试激活下一个标签，如果没有则激活前一个
                const $nextTab = $tab.next('.ffs-tabs-tab');
                const $prevTab = $tab.prev('.ffs-tabs-tab');

                if ($nextTab.length) {
                    $nextTab.trigger('click');
                } else if ($prevTab.length) {
                    $prevTab.trigger('click');
                }
            }

            // 获取目标内容面板
            let targetId = $tab.attr('data-target');

            // 如果没有设置 data-target，尝试从 href 获取
            if (!targetId && $tab.attr('href') && $tab.attr('href') !== '#') {
                targetId = $tab.attr('href').replace(/.*(?=#[^\s]*$)/, '');
            }

            // 移除标签
            $tab.remove();

            // 如果找到目标内容面板，移除它
            if (targetId) {
                $(targetId).remove();
            }

            // 触发标签关闭事件
            $tabs.trigger('tabs:close', [$tab]);

            return $tabs;
        },

        /**
         * 激活标签
         * @param {string} selector - 标签页选择器
         * @param {string|number} tabSelector - 标签选择器或索引
         */
        activateTab: function (selector, tabSelector) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            let $tab;

            if (typeof tabSelector === 'number') {
                // 如果是数字索引
                $tab = $tabs.find('.ffs-tabs-tab').eq(tabSelector);
            } else {
                // 如果是选择器
                $tab = $tabs.find(tabSelector);
            }

            if ($tab.length) {
                $tab.trigger('click');
            }

            return $tabs;
        },

        /**
         * 获取活动标签
         * @param {string} selector - 标签页选择器
         * @returns {jQuery} 活动标签
         */
        getActiveTab: function (selector) {
            const $tabs = $(selector);

            if (!$tabs.length) return null;

            return $tabs.find('.ffs-tabs-tab.active');
        },

        /**
         * 获取活动内容面板
         * @param {string} selector - 标签页选择器
         * @returns {jQuery} 活动内容面板
         */
        getActivePane: function (selector) {
            const $tabs = $(selector);

            if (!$tabs.length) return null;

            return $tabs.find('.ffs-tabs-pane.active');
        },

        /**
         * 更新标签内容
         * @param {string} selector - 标签页选择器
         * @param {string} tabSelector - 标签选择器
         * @param {string|object} content - 新内容
         */
        updateTabContent: function (selector, tabSelector, content) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            const $tab = $tabs.find(tabSelector);

            if (!$tab.length) return;

            // 获取目标内容面板
            let targetId = $tab.attr('data-target');

            // 如果没有设置 data-target，尝试从 href 获取
            if (!targetId && $tab.attr('href') && $tab.attr('href') !== '#') {
                targetId = $tab.attr('href').replace(/.*(?=#[^\s]*$)/, '');
            }

            // 如果找到目标内容面板，更新它
            if (targetId) {
                const $targetPane = $(targetId);

                if ($targetPane.length) {
                    if (typeof content === 'object' && content.jquery) {
                        // 如果是jQuery对象
                        $targetPane.empty().append(content);
                    } else if (typeof content === 'object') {
                        // 如果是DOM对象
                        $targetPane.empty().append($(content));
                    } else {
                        // 如果是字符串
                        $targetPane.html(content);
                    }
                }
            }

            return $tabs;
        },

        /**
         * 更新标签文本
         * @param {string} selector - 标签页选择器
         * @param {string} tabSelector - 标签选择器
         * @param {string} text - 新文本
         */
        updateTabText: function (selector, tabSelector, text) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            const $tab = $tabs.find(tabSelector);

            if (!$tab.length) return;

            // 保存原有的图标和徽章
            const $icon = $tab.find('.ffs-tabs-tab-icon');
            const $badge = $tab.find('.ffs-tabs-tab-badge');
            const $close = $tab.find('.ffs-tabs-tab-close');

            // 清空标签内容
            $tab.empty();

            // 重新添加图标
            if ($icon.length) {
                $tab.append($icon);
            }

            // 添加新文本
            $tab.append(document.createTextNode(text));

            // 重新添加徽章
            if ($badge.length) {
                $tab.append($badge);
            }

            // 重新添加关闭按钮
            if ($close.length) {
                $tab.append($close);
            }

            return $tabs;
        },

        /**
         * 添加标签徽章
         * @param {string} selector - 标签页选择器
         * @param {string} tabSelector - 标签选择器
         * @param {string} badge - 徽章文本
         */
        addTabBadge: function (selector, tabSelector, badge) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            const $tab = $tabs.find(tabSelector);

            if (!$tab.length) return;

            // 移除现有徽章
            $tab.find('.ffs-tabs-tab-badge').remove();

            // 添加新徽章
            $tab.append(`<span class="ffs-tabs-tab-badge">${badge}</span>`);

            return $tabs;
        },

        /**
         * 移除标签徽章
         * @param {string} selector - 标签页选择器
         * @param {string} tabSelector - 标签选择器
         */
        removeTabBadge: function (selector, tabSelector) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            const $tab = $tabs.find(tabSelector);

            if (!$tab.length) return;

            // 移除徽章
            $tab.find('.ffs-tabs-tab-badge').remove();

            return $tabs;
        },

        /**
         * 禁用标签
         * @param {string} selector - 标签页选择器
         * @param {string} tabSelector - 标签选择器
         */
        disableTab: function (selector, tabSelector) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            const $tab = $tabs.find(tabSelector);

            if (!$tab.length) return;

            // 添加禁用类
            $tab.addClass('disabled');

            return $tabs;
        },

        /**
         * 启用标签
         * @param {string} selector - 标签页选择器
         * @param {string} tabSelector - 标签选择器
         */
        enableTab: function (selector, tabSelector) {
            const $tabs = $(selector);

            if (!$tabs.length) return;

            const $tab = $tabs.find(tabSelector);

            if (!$tab.length) return;

            // 移除禁用类
            $tab.removeClass('disabled');

            return $tabs;
        }
    };

    // 初始化标签页组件
    $(function () {
        initTabs();
        initClosableTabs();
        initDraggableTabs();
    });

})(jQuery);