/**
 * FFS UI - 菜单导航组件
 * 提供顶部导航、侧边导航、下拉菜单、折叠菜单和手风琴菜单等交互功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化顶部导航
     * 处理响应式菜单和活动项
     */
    function initNavbar() {
        // 响应式菜单切换
        $(document).on('click', '.ffs-navbar-toggle', function (e) {
            e.preventDefault();
            const $navbar = $(this).closest('.ffs-navbar');
            $navbar.toggleClass('ffs-navbar-expanded');
        });

        // 设置活动项
        $(document).on('click', '.ffs-navbar-item', function (e) {
            const $item = $(this);
            const $navbar = $item.closest('.ffs-navbar');

            // 如果不是外部链接，阻止默认行为
            if (!$item.attr('href') || $item.attr('href') === '#') {
                e.preventDefault();
            }

            // 移除其他项的活动状态
            $navbar.find('.ffs-navbar-item').removeClass('active');

            // 添加当前项的活动状态
            $item.addClass('active');
        });
    }

    /**
     * 初始化侧边导航
     * 处理折叠状态和活动项
     */
    function initSidebar() {
        // 侧边栏切换
        $(document).on('click', '.ffs-sidebar-toggle', function (e) {
            e.preventDefault();
            const $sidebar = $(this).closest('.ffs-sidebar');
            $sidebar.toggleClass('ffs-sidebar-collapsed');
        });

        // 设置活动项
        $(document).on('click', '.ffs-sidebar-item', function (e) {
            const $item = $(this);
            const $sidebar = $item.closest('.ffs-sidebar');

            // 如果不是外部链接，阻止默认行为
            if (!$item.attr('href') || $item.attr('href') === '#') {
                e.preventDefault();
            }

            // 移除其他项的活动状态
            $sidebar.find('.ffs-sidebar-item').removeClass('active');

            // 添加当前项的活动状态
            $item.addClass('active');
        });
    }

    /**
     * 初始化下拉菜单
     * 处理点击触发和关闭
     */
    function initDropdown() {
        // 点击触发下拉菜单
        $(document).on('click', '.ffs-dropdown-trigger', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const $dropdown = $(this).closest('.ffs-dropdown');
            const $menu = $dropdown.find('.ffs-dropdown-menu');

            // 关闭其他下拉菜单
            $('.ffs-dropdown').not($dropdown).removeClass('ffs-dropdown-open');

            // 切换当前下拉菜单
            $dropdown.toggleClass('ffs-dropdown-open');

            // 如果打开了下拉菜单，添加点击事件到文档
            if ($dropdown.hasClass('ffs-dropdown-open')) {
                $(document).one('click', function () {
                    $dropdown.removeClass('ffs-dropdown-open');
                });
            }
        });

        // 阻止下拉菜单内部点击关闭
        $(document).on('click', '.ffs-dropdown-menu', function (e) {
            e.stopPropagation();
        });

        // 点击下拉菜单项
        $(document).on('click', '.ffs-dropdown-item', function (e) {
            const $item = $(this);
            const $dropdown = $item.closest('.ffs-dropdown');

            // 如果不是外部链接，阻止默认行为
            if (!$item.attr('href') || $item.attr('href') === '#') {
                e.preventDefault();
            }

            // 关闭下拉菜单
            $dropdown.removeClass('ffs-dropdown-open');

            // 触发选择事件
            $dropdown.trigger('dropdown:select', [$item.text(), $item.attr('href')]);
        });
    }

    /**
     * 初始化折叠菜单
     * 处理折叠和展开
     */
    function initCollapse() {
        // 点击折叠菜单头部
        $(document).on('click', '.ffs-collapse-header', function (e) {
            e.preventDefault();

            const $header = $(this);
            const $item = $header.closest('.ffs-collapse-item');
            const $content = $item.find('.ffs-collapse-content');

            // 切换活动状态
            $item.toggleClass('active');

            // 如果激活，展开内容
            if ($item.hasClass('active')) {
                const contentHeight = $content.prop('scrollHeight');
                $content.css('height', contentHeight + 'px');
            } else {
                // 否则折叠内容
                $content.css('height', '0');
            }
        });

        // 初始化已有的折叠菜单
        $('.ffs-collapse-item').each(function () {
            const $item = $(this);
            const $content = $item.find('.ffs-collapse-content');

            // 如果是活动状态，展开内容
            if ($item.hasClass('active')) {
                const contentHeight = $content.prop('scrollHeight');
                $content.css('height', contentHeight + 'px');
            } else {
                // 否则折叠内容
                $content.css('height', '0');
            }
        });
    }

    /**
     * 初始化手风琴菜单
     * 处理折叠和展开，同时只允许一个项展开
     */
    function initAccordion() {
        // 点击手风琴菜单头部
        $(document).on('click', '.ffs-accordion-header', function (e) {
            e.preventDefault();

            const $header = $(this);
            const $item = $header.closest('.ffs-accordion-item');
            const $accordion = $item.closest('.ffs-accordion');
            const $content = $item.find('.ffs-accordion-content');

            // 如果当前项已经是活动状态，则只需要关闭它
            if ($item.hasClass('active')) {
                $item.removeClass('active');
                $content.css('height', '0');
                return;
            }

            // 关闭其他项
            $accordion.find('.ffs-accordion-item').not($item).each(function () {
                const $otherItem = $(this);
                const $otherContent = $otherItem.find('.ffs-accordion-content');

                $otherItem.removeClass('active');
                $otherContent.css('height', '0');
            });

            // 激活当前项
            $item.addClass('active');
            const contentHeight = $content.prop('scrollHeight');
            $content.css('height', contentHeight + 'px');
        });

        // 初始化已有的手风琴菜单
        $('.ffs-accordion').each(function () {
            const $accordion = $(this);
            const $activeItem = $accordion.find('.ffs-accordion-item.active').first();

            // 关闭所有项
            $accordion.find('.ffs-accordion-item').each(function () {
                const $item = $(this);
                const $content = $item.find('.ffs-accordion-content');

                if (!$item.is($activeItem)) {
                    $item.removeClass('active');
                    $content.css('height', '0');
                }
            });

            // 如果有活动项，展开它
            if ($activeItem.length) {
                const $content = $activeItem.find('.ffs-accordion-content');
                const contentHeight = $content.prop('scrollHeight');
                $content.css('height', contentHeight + 'px');
            }
        });
    }

    /**
     * 初始化图标菜单
     * 处理活动项
     */
    function initIconMenu() {
        // 设置活动项
        $(document).on('click', '.ffs-icon-menu-item', function (e) {
            const $item = $(this);
            const $menu = $item.closest('.ffs-icon-menu');

            // 如果不是外部链接，阻止默认行为
            if (!$item.attr('href') || $item.attr('href') === '#') {
                e.preventDefault();
            }

            // 移除其他项的活动状态
            $menu.find('.ffs-icon-menu-item').removeClass('active');

            // 添加当前项的活动状态
            $item.addClass('active');
        });
    }

    /**
     * 菜单导航API
     * 提供操作菜单的公共方法
     */
    $.ffsMenu = {
        /**
         * 创建顶部导航
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createNavbar: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                brand: 'FFS UI',
                brandLink: '#',
                items: [],
                rightItems: []
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建顶部导航
            const $navbar = $('<nav class="ffs-navbar"></nav>');

            // 添加品牌
            $navbar.append(`<a href="${settings.brandLink}" class="ffs-navbar-brand">${settings.brand}</a>`);

            // 添加菜单
            const $menu = $('<div class="ffs-navbar-menu"></div>');

            // 添加菜单项
            settings.items.forEach(item => {
                const $item = $(`<a href="${item.link || '#'}" class="ffs-navbar-item${item.active ? ' active' : ''}">${item.text}</a>`);
                $menu.append($item);
            });

            $navbar.append($menu);

            // 添加右侧菜单
            if (settings.rightItems.length) {
                const $right = $('<div class="ffs-navbar-right"></div>');

                settings.rightItems.forEach(item => {
                    if (item.type === 'button') {
                        const $button = $(`<a href="${item.link || '#'}" class="ffs-button${item.primary ? ' ffs-button-primary' : ''}">${item.text}</a>`);
                        $right.append($button);
                    } else if (item.type === 'dropdown') {
                        const $dropdown = $('<div class="ffs-dropdown"></div>');
                        const $trigger = $(`<a href="#" class="ffs-dropdown-trigger">${item.text}</a>`);
                        const $dropdownMenu = $('<div class="ffs-dropdown-menu"></div>');

                        // 添加下拉菜单项
                        if (item.items && item.items.length) {
                            item.items.forEach(subItem => {
                                const $subItem = $(`<a href="${subItem.link || '#'}" class="ffs-dropdown-item">${subItem.text}</a>`);
                                $dropdownMenu.append($subItem);
                            });
                        }

                        $dropdown.append($trigger).append($dropdownMenu);
                        $right.append($dropdown);
                    }
                });

                $navbar.append($right);
            }

            // 添加响应式切换按钮
            $navbar.append('<button class="ffs-navbar-toggle"><i class="fas fa-bars"></i></button>');

            // 添加到容器
            $container.append($navbar);

            return $navbar;
        },

        /**
         * 创建侧边导航
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createSidebar: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                title: '菜单',
                items: []
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建侧边导航
            const $sidebar = $('<div class="ffs-sidebar"></div>');

            // 添加头部
            $sidebar.append(`
                <div class="ffs-sidebar-header">
                    <h3>${settings.title}</h3>
                    <button class="ffs-sidebar-toggle"><i class="fas fa-chevron-left"></i></button>
                </div>
            `);

            // 添加菜单
            const $menu = $('<div class="ffs-sidebar-menu"></div>');

            // 添加菜单项
            settings.items.forEach(item => {
                let $item;

                if (item.type === 'item') {
                    // 普通菜单项
                    $item = $(`
                        <a href="${item.link || '#'}" class="ffs-sidebar-item${item.active ? ' active' : ''}">
                            ${item.icon ? `<i class="${item.icon} ffs-sidebar-icon"></i>` : ''}
                            ${item.text}
                        </a>
                    `);
                } else if (item.type === 'divider') {
                    // 分隔线
                    $item = $('<div class="ffs-sidebar-divider"></div>');
                } else if (item.type === 'header') {
                    // 分组标题
                    $item = $(`<div class="ffs-sidebar-header-text">${item.text}</div>`);
                }

                $menu.append($item);
            });

            $sidebar.append($menu);

            // 添加到容器
            $container.append($sidebar);

            return $sidebar;
        },

        /**
         * 创建下拉菜单
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createDropdown: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                text: '下拉菜单',
                items: []
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建下拉菜单
            const $dropdown = $('<div class="ffs-dropdown"></div>');

            // 添加触发器
            const $trigger = $(`<a href="#" class="ffs-dropdown-trigger">${settings.text}</a>`);
            $dropdown.append($trigger);

            // 添加下拉菜单
            const $menu = $('<div class="ffs-dropdown-menu"></div>');

            // 添加下拉菜单项
            settings.items.forEach(item => {
                if (item.type === 'item') {
                    // 普通菜单项
                    const $item = $(`
                        <a href="${item.link || '#'}" class="ffs-dropdown-item">
                            ${item.icon ? `<i class="${item.icon}"></i> ` : ''}${item.text}
                        </a>
                    `);
                    $menu.append($item);
                } else if (item.type === 'divider') {
                    // 分隔线
                    $menu.append('<div class="ffs-dropdown-divider"></div>');
                } else if (item.type === 'header') {
                    // 标题
                    $menu.append(`<div class="ffs-dropdown-header">${item.text}</div>`);
                }
            });

            $dropdown.append($menu);

            // 添加到容器
            $container.append($dropdown);

            return $dropdown;
        },

        /**
         * 创建折叠菜单
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createCollapse: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                items: []
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建折叠菜单
            const $collapse = $('<div class="ffs-collapse"></div>');

            // 添加折叠项
            settings.items.forEach(item => {
                const $item = $(`
                    <div class="ffs-collapse-item${item.active ? ' active' : ''}">
                        <div class="ffs-collapse-header">
                            ${item.text}
                            <i class="fas fa-chevron-down ffs-collapse-icon"></i>
                        </div>
                        <div class="ffs-collapse-content" style="height: ${item.active ? 'auto' : '0'}">
                            ${item.content || ''}
                        </div>
                    </div>
                `);

                $collapse.append($item);
            });

            // 添加到容器
            $container.append($collapse);

            // 初始化折叠状态
            setTimeout(() => {
                $collapse.find('.ffs-collapse-item.active').each(function () {
                    const $item = $(this);
                    const $content = $item.find('.ffs-collapse-content');
                    const contentHeight = $content.prop('scrollHeight');
                    $content.css('height', contentHeight + 'px');
                });
            }, 0);

            return $collapse;
        },

        /**
         * 创建手风琴菜单
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createAccordion: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                items: []
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建手风琴菜单
            const $accordion = $('<div class="ffs-accordion"></div>');

            // 添加手风琴项
            settings.items.forEach(item => {
                const $item = $(`
                    <div class="ffs-accordion-item${item.active ? ' active' : ''}">
                        <div class="ffs-accordion-header">
                            ${item.text}
                            <i class="fas fa-chevron-down ffs-accordion-icon"></i>
                        </div>
                        <div class="ffs-accordion-content" style="height: ${item.active ? 'auto' : '0'}">
                            ${item.content || ''}
                        </div>
                    </div>
                `);

                $accordion.append($item);
            });

            // 添加到容器
            $container.append($accordion);

            // 初始化折叠状态
            setTimeout(() => {
                $accordion.find('.ffs-accordion-item.active').each(function () {
                    const $item = $(this);
                    const $content = $item.find('.ffs-accordion-content');
                    const contentHeight = $content.prop('scrollHeight');
                    $content.css('height', contentHeight + 'px');
                });
            }, 0);

            return $accordion;
        },

        /**
         * 创建图标菜单
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createIconMenu: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                items: []
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建图标菜单
            const $iconMenu = $('<div class="ffs-icon-menu"></div>');

            // 添加图标菜单项
            settings.items.forEach(item => {
                const $item = $(`
                    <a href="${item.link || '#'}" class="ffs-icon-menu-item${item.active ? ' active' : ''}">
                        <i class="${item.icon || 'fas fa-circle'} ffs-icon-menu-icon"></i>
                        <span class="ffs-icon-menu-text">${item.text}</span>
                    </a>
                `);

                $iconMenu.append($item);
            });

            // 添加到容器
            $container.append($iconMenu);

            return $iconMenu;
        },

        /**
         * 设置活动项
         * @param {string} selector - 菜单选择器
         * @param {number|string} index - 索引或选择器
         */
        setActive: function (selector, index) {
            const $menu = $(selector);

            if (!$menu.length) return;

            // 根据菜单类型选择不同的项选择器
            let itemSelector = '.ffs-navbar-item';
            if ($menu.hasClass('ffs-sidebar')) {
                itemSelector = '.ffs-sidebar-item';
            } else if ($menu.hasClass('ffs-icon-menu')) {
                itemSelector = '.ffs-icon-menu-item';
            } else if ($menu.hasClass('ffs-accordion')) {
                itemSelector = '.ffs-accordion-item';
            } else if ($menu.hasClass('ffs-collapse')) {
                itemSelector = '.ffs-collapse-item';
            }

            // 移除所有项的活动状态
            $menu.find(itemSelector).removeClass('active');

            // 设置指定项的活动状态
            let $item;

            if (typeof index === 'number') {
                // 如果是数字索引
                $item = $menu.find(itemSelector).eq(index);
            } else {
                // 如果是选择器
                $item = $menu.find(index);
            }

            if ($item.length) {
                $item.addClass('active');

                // 如果是折叠菜单或手风琴菜单，展开内容
                if ($menu.hasClass('ffs-accordion') || $menu.hasClass('ffs-collapse')) {
                    const $content = $item.find('.ffs-accordion-content, .ffs-collapse-content');
                    const contentHeight = $content.prop('scrollHeight');
                    $content.css('height', contentHeight + 'px');
                }
            }

            return $menu;
        },

        /**
         * 切换折叠状态
         * @param {string} selector - 菜单选择器
         * @param {boolean} collapsed - 是否折叠
         */
        toggleCollapse: function (selector, collapsed) {
            const $menu = $(selector);

            if (!$menu.length) return;

            if ($menu.hasClass('ffs-sidebar')) {
                // 侧边栏折叠
                if (collapsed === undefined) {
                    $menu.toggleClass('ffs-sidebar-collapsed');
                } else if (collapsed) {
                    $menu.addClass('ffs-sidebar-collapsed');
                } else {
                    $menu.removeClass('ffs-sidebar-collapsed');
                }
            } else if ($menu.hasClass('ffs-navbar')) {
                // 顶部导航折叠
                if (collapsed === undefined) {
                    $menu.toggleClass('ffs-navbar-expanded');
                } else if (collapsed) {
                    $menu.removeClass('ffs-navbar-expanded');
                } else {
                    $menu.addClass('ffs-navbar-expanded');
                }
            }

            return $menu;
        }
    };

    // 初始化菜单组件
    $(function () {
        initNavbar();
        initSidebar();
        initDropdown();
        initCollapse();
        initAccordion();
        initIconMenu();
    });

})(jQuery);