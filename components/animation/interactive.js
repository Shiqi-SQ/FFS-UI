/**
 * FFS UI - 交互动画组件
 * 提供点击涟漪、悬浮效果和页面切换等交互动画功能
 */
(function ($) {
    'use strict';

    // 缓存常用选择器
    const selectors = {
        ripple: '.ffs-ripple',
        pageTransition: '.ffs-page-transition',
        pageTransitionPage: '.ffs-page-transition__page',
        image: '.ffs-image',
        imageZoomable: '.ffs-image--zoomable',
        listItem: '.ffs-list-item',
        togglePage: '[data-toggle="page"]'
    };

    // 配置参数
    const config = {
        rippleDuration: 800,
        transitionDuration: 300,
        errorMessages: {
            invalidElement: '无效的元素选择器',
            missingTarget: '缺少目标元素',
            initFailed: '初始化失败'
        }
    };

    /**
     * 错误处理函数
     * @param {string} message - 错误信息
     * @param {Error} [error] - 原始错误对象
     */
    function handleError(message, error) {
        console.error(`FFS UI Error: ${message}`, error);
        // 可以在这里添加错误上报逻辑
    }

    /**
     * 初始化涟漪效果
     * 为带有 ffs-ripple 类的元素添加点击涟漪动画
     */
    function initRippleEffect() {
        try {
            const $rippleElements = $(selectors.ripple);
            if (!$rippleElements.length) return;

            $(document).on('click', selectors.ripple, function (e) {
                const $this = $(this);

                // 创建涟漪元素
                const $ripple = $('<span class="ffs-ripple__effect"></span>');

                // 计算涟漪位置
                const offset = $this.offset();
                const x = e.pageX - offset.left;
                const y = e.pageY - offset.top;

                // 使用 requestAnimationFrame 优化动画性能
                requestAnimationFrame(() => {
                    $ripple.css({
                        top: y + 'px',
                        left: x + 'px'
                    }).appendTo($this);

                    // 使用 requestAnimationFrame 处理动画结束
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            $ripple.remove();
                        });
                    }, config.rippleDuration);
                });
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }

    /**
     * 初始化页面切换效果
     * 处理 ffs-page-transition 容器中的页面切换动画
     */
    function initPageTransition() {
        try {
            const $containers = $(selectors.pageTransition);
            if (!$containers.length) return;

            $containers.each(function () {
                const $container = $(this);
                const $pages = $container.find(selectors.pageTransitionPage);

                if (!$pages.length) {
                    handleError('页面切换容器中没有找到页面元素');
                    return;
                }

                // 默认只显示第一个页面
                $pages.not(':first').hide();

                // 为容器添加切换方法
                $container.data('togglePage', function () {
                    let isAnimating = false;

                    return function () {
                        if (isAnimating) return;
                        isAnimating = true;

                        $pages.each(function () {
                            const $page = $(this);
                            if ($page.is(':visible')) {
                                const $next = $page.next(selectors.pageTransitionPage).length ?
                                    $page.next(selectors.pageTransitionPage) :
                                    $pages.first();

                                requestAnimationFrame(() => {
                                    $page.addClass('ffs-page-transition__page--exit')
                                        .fadeOut(config.transitionDuration, () => {
                                            $page.removeClass('ffs-page-transition__page--exit');
                                            $next.addClass('ffs-page-transition__page--active')
                                                .fadeIn(config.transitionDuration, () => {
                                                    isAnimating = false;
                                                });
                                        });
                                });
                                return false;
                            }
                        });
                    };
                }());
            });

            // 使用事件委托绑定切换按钮事件
            $(document).on('click', selectors.togglePage, function (e) {
                e.preventDefault();
                const $this = $(this);
                const target = $this.data('target');

                if (!target) {
                    handleError(config.errorMessages.missingTarget);
                    return;
                }

                const $target = $(target);
                if (!$target.length) {
                    handleError(config.errorMessages.invalidElement);
                    return;
                }

                const togglePage = $target.data('togglePage');
                if (typeof togglePage === 'function') {
                    togglePage();
                }
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }

    /**
     * 初始化交互图片效果
     * 为 ffs-image 添加悬停效果和缩放功能
     */
    function initInteractiveImage() {
        try {
            const $images = $(selectors.image);
            if (!$images.length) return;

            // 使用事件委托处理悬停效果
            $(document).on('mouseenter mouseleave', selectors.image, function (e) {
                const $image = $(this);
                $image.toggleClass('ffs-image--hover', e.type === 'mouseenter');
            });

            // 处理可缩放图片
            $(document).on('click', selectors.imageZoomable, function () {
                const $image = $(this);
                const $img = $image.find('img');

                if (!$img.length) return;

                const imgSrc = $img.attr('src');
                if (!imgSrc) {
                    handleError('图片源不存在');
                    return;
                }

                // 创建查看器
                const $viewer = $(`
                    <div class="ffs-image-viewer">
                        <div class="ffs-image-viewer__close">&times;</div>
                        <img class="ffs-image-viewer__img" src="${imgSrc}" alt="">
                    </div>
                `).appendTo('body');

                // 使用 requestAnimationFrame 处理动画
                requestAnimationFrame(() => {
                    $viewer.addClass('ffs-image-viewer--active');
                });

                // 绑定关闭事件
                $viewer.on('click', function (e) {
                    if (e.target === this || $(e.target).hasClass('ffs-image-viewer__close')) {
                        $viewer.removeClass('ffs-image-viewer--active');
                        setTimeout(() => {
                            $viewer.remove();
                        }, config.transitionDuration);
                    }
                });
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }

    /**
     * 初始化交互列表效果
     * 为 ffs-list-item 添加点击和悬停效果
     */
    function initInteractiveList() {
        try {
            const $items = $(selectors.listItem);
            if (!$items.length) return;

            // 使用事件委托处理交互效果
            $(document).on('mouseenter mouseleave', selectors.listItem, function (e) {
                const $item = $(this);
                const isEnter = e.type === 'mouseenter';

                requestAnimationFrame(() => {
                    $item.toggleClass('ffs-list-item--hover', isEnter);
                    $item.find('i').first().css('transform', isEnter ? 'translateX(5px)' : 'translateX(0)');
                });
            });

            // 处理点击效果
            $(document).on('click', `${selectors.listItem}[data-action]`, function () {
                const $item = $(this);

                requestAnimationFrame(() => {
                    $item.addClass('ffs-list-item--active');
                    setTimeout(() => {
                        $item.removeClass('ffs-list-item--active');
                    }, 200);
                });
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }

    /**
     * 初始化所有交互动画
     */
    function init() {
        try {
            initRippleEffect();
            initPageTransition();
            initInteractiveImage();
            initInteractiveList();

            // 为页面切换按钮添加全局方法
            window.togglePage = function (selector) {
                if (!selector) {
                    handleError(config.errorMessages.invalidElement);
                    return;
                }

                const $target = $(selector);
                if (!$target.length) {
                    handleError(config.errorMessages.invalidElement);
                    return;
                }

                const togglePage = $target.data('togglePage');
                if (typeof togglePage === 'function') {
                    togglePage();
                }
            };
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }

    // 在文档加载完成后初始化
    $(document).ready(init);

    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.animation = {
        init,
        initRippleEffect,
        initPageTransition,
        initInteractiveImage,
        initInteractiveList
    };

})(jQuery);