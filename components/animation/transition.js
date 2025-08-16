/**
 * FFS UI - 过渡动画组件
 * 提供淡入淡出、滑动、缩放等过渡动画效果控制
 */
(function($) {
    'use strict';

    // 缓存常用选择器
    const selectors = {
        fade: {
            enter: '.ffs-fade-enter',
            enterActive: '.ffs-fade-enter-active',
            exit: '.ffs-fade-exit',
            exitActive: '.ffs-fade-exit-active'
        },
        slide: {
            up: {
                enter: '.ffs-slide-up-enter',
                enterActive: '.ffs-slide-up-enter-active',
                exit: '.ffs-slide-up-exit',
                exitActive: '.ffs-slide-up-exit-active'
            },
            down: {
                enter: '.ffs-slide-down-enter',
                enterActive: '.ffs-slide-down-enter-active',
                exit: '.ffs-slide-down-exit',
                exitActive: '.ffs-slide-down-exit-active'
            },
            left: {
                enter: '.ffs-slide-left-enter',
                enterActive: '.ffs-slide-left-enter-active',
                exit: '.ffs-slide-left-exit',
                exitActive: '.ffs-slide-left-exit-active'
            },
            right: {
                enter: '.ffs-slide-right-enter',
                enterActive: '.ffs-slide-right-enter-active',
                exit: '.ffs-slide-right-exit',
                exitActive: '.ffs-slide-right-exit-active'
            }
        },
        zoom: {
            enter: '.ffs-zoom-enter',
            enterActive: '.ffs-zoom-enter-active',
            exit: '.ffs-zoom-exit',
            exitActive: '.ffs-zoom-exit-active'
        },
        flip: {
            enter: '.ffs-flip-enter',
            enterActive: '.ffs-flip-enter-active',
            exit: '.ffs-flip-exit',
            exitActive: '.ffs-flip-exit-active'
        },
        toggleAnimation: '[data-toggle-animation]'
    };

    // 配置参数
    const config = {
        duration: 300,
        errorMessages: {
            invalidElement: '无效的元素选择器',
            invalidDirection: '无效的方向参数',
            initFailed: '初始化失败',
            transitionFailed: '过渡动画执行失败'
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
     * 淡入淡出动画控制
     */
    function initFadeAnimation() {
        try {
            // 淡入
            $.fn.fadeEnter = function(duration = config.duration) {
                return this.each(function() {
                    try {
                        const $el = $(this);
                        
                        // 使用 requestAnimationFrame 优化动画
                        requestAnimationFrame(() => {
                            $el.addClass('ffs-fade-enter')
                               .css({
                                   display: 'block',
                                   opacity: '0',
                                   willChange: 'opacity'
                               });
                            
                            // 触发重绘
                            $el[0].offsetHeight;
                            
                            // 开始动画
                            $el.css({
                                transition: `opacity ${duration}ms var(--animation-timing-function)`,
                                opacity: '1'
                            });
                            
                            // 动画结束后清理
                            setTimeout(() => {
                                $el.css({
                                    transition: '',
                                    willChange: ''
                                });
                            }, duration);
                        });
                    } catch (error) {
                        handleError('淡入动画执行失败', error);
                    }
                });
            };
            
            // 淡出
            $.fn.fadeExit = function(duration = config.duration) {
                return this.each(function() {
                    try {
                        const $el = $(this);
                        
                        requestAnimationFrame(() => {
                            $el.addClass('ffs-fade-exit')
                               .css({
                                   willChange: 'opacity',
                                   transition: `opacity ${duration}ms var(--animation-timing-function)`,
                                   opacity: '0'
                               });
                            
                            // 动画结束后隐藏元素
                            setTimeout(() => {
                                $el.css({
                                    display: 'none',
                                    transition: '',
                                    willChange: ''
                                }).removeClass('ffs-fade-exit');
                            }, duration);
                        });
                    } catch (error) {
                        handleError('淡出动画执行失败', error);
                    }
                });
            };
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    /**
     * 滑动动画控制
     */
    function initSlideAnimation() {
        try {
            const directions = ['up', 'down', 'left', 'right'];
            const transforms = {
                up: { enter: 'translateY(20px)', exit: 'translateY(-20px)' },
                down: { enter: 'translateY(-20px)', exit: 'translateY(20px)' },
                left: { enter: 'translateX(20px)', exit: 'translateX(-20px)' },
                right: { enter: 'translateX(-20px)', exit: 'translateX(20px)' }
            };
            
            // 滑入
            $.fn.slideEnter = function(direction = 'up', duration = config.duration) {
                return this.each(function() {
                    try {
                        if (!directions.includes(direction)) {
                            handleError(config.errorMessages.invalidDirection);
                            return;
                        }
                        
                        const $el = $(this);
                        const transform = transforms[direction].enter;
                        
                        requestAnimationFrame(() => {
                            $el.addClass(`ffs-slide-${direction}-enter`)
                               .css({
                                   display: 'block',
                                   opacity: '0',
                                   transform,
                                   willChange: 'transform, opacity'
                               });
                            
                            // 触发重绘
                            $el[0].offsetHeight;
                            
                            // 开始动画
                            $el.css({
                                transition: `opacity ${duration}ms var(--animation-timing-function), transform ${duration}ms var(--animation-timing-function)`,
                                opacity: '1',
                                transform: 'translate(0, 0)'
                            });
                            
                            // 动画结束后清理
                            setTimeout(() => {
                                $el.css({
                                    transition: '',
                                    willChange: ''
                                });
                            }, duration);
                        });
                    } catch (error) {
                        handleError('滑入动画执行失败', error);
                    }
                });
            };
            
            // 滑出
            $.fn.slideExit = function(direction = 'up', duration = config.duration) {
                return this.each(function() {
                    try {
                        if (!directions.includes(direction)) {
                            handleError(config.errorMessages.invalidDirection);
                            return;
                        }
                        
                        const $el = $(this);
                        const transform = transforms[direction].exit;
                        
                        requestAnimationFrame(() => {
                            $el.addClass(`ffs-slide-${direction}-exit`)
                               .css({
                                   willChange: 'transform, opacity',
                                   transition: `opacity ${duration}ms var(--animation-timing-function), transform ${duration}ms var(--animation-timing-function)`,
                                   opacity: '0',
                                   transform
                               });
                            
                            // 动画结束后隐藏元素
                            setTimeout(() => {
                                $el.css({
                                    display: 'none',
                                    transition: '',
                                    transform: '',
                                    willChange: ''
                                }).removeClass(`ffs-slide-${direction}-exit`);
                            }, duration);
                        });
                    } catch (error) {
                        handleError('滑出动画执行失败', error);
                    }
                });
            };
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    /**
     * 缩放动画控制
     */
    function initScaleAnimation() {
        try {
            // 缩放进入
            $.fn.scaleEnter = function(duration = config.duration) {
                return this.each(function() {
                    try {
                        const $el = $(this);
                        
                        requestAnimationFrame(() => {
                            $el.addClass('ffs-scale-enter')
                               .css({
                                   display: 'block',
                                   opacity: '0',
                                   transform: 'scale(0.8)',
                                   willChange: 'transform, opacity'
                               });
                            
                            // 触发重绘
                            $el[0].offsetHeight;
                            
                            // 开始动画
                            $el.css({
                                transition: `opacity ${duration}ms var(--animation-timing-function), transform ${duration}ms var(--animation-timing-function)`,
                                opacity: '1',
                                transform: 'scale(1)'
                            });
                            
                            // 动画结束后清理
                            setTimeout(() => {
                                $el.css({
                                    transition: '',
                                    willChange: ''
                                });
                            }, duration);
                        });
                    } catch (error) {
                        handleError('缩放进入动画执行失败', error);
                    }
                });
            };
            
            // 缩放退出
            $.fn.scaleExit = function(duration = config.duration) {
                return this.each(function() {
                    try {
                        const $el = $(this);
                        
                        requestAnimationFrame(() => {
                            $el.addClass('ffs-scale-exit')
                               .css({
                                   willChange: 'transform, opacity',
                                   transition: `opacity ${duration}ms var(--animation-timing-function), transform ${duration}ms var(--animation-timing-function)`,
                                   opacity: '0',
                                   transform: 'scale(0.8)'
                               });
                            
                            // 动画结束后隐藏元素
                            setTimeout(() => {
                                $el.css({
                                    display: 'none',
                                    transition: '',
                                    transform: '',
                                    willChange: ''
                                }).removeClass('ffs-scale-exit');
                            }, duration);
                        });
                    } catch (error) {
                        handleError('缩放退出动画执行失败', error);
                    }
                });
            };
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    /**
     * 动画切换控制
     */
    function initAnimationToggle() {
        try {
            // 全局动画切换方法
            window.toggleFade = function(selector) {
                try {
                    if (!selector) {
                        handleError(config.errorMessages.invalidElement);
                        return;
                    }
                    
                    const $el = $(selector);
                    if (!$el.length) {
                        handleError(config.errorMessages.invalidElement);
                        return;
                    }
                    
                    $el.is(':visible') ? $el.fadeExit() : $el.fadeEnter();
                } catch (error) {
                    handleError('淡入淡出切换失败', error);
                }
            };
            
            window.toggleSlide = function(direction, selector) {
                try {
                    if (!selector) {
                        handleError(config.errorMessages.invalidElement);
                        return;
                    }
                    
                    const $el = $(selector);
                    if (!$el.length) {
                        handleError(config.errorMessages.invalidElement);
                        return;
                    }
                    
                    $el.is(':visible') ? $el.slideExit(direction) : $el.slideEnter(direction);
                } catch (error) {
                    handleError('滑动切换失败', error);
                }
            };
            
            window.toggleScale = function(selector) {
                try {
                    if (!selector) {
                        handleError(config.errorMessages.invalidElement);
                        return;
                    }
                    
                    const $el = $(selector);
                    if (!$el.length) {
                        handleError(config.errorMessages.invalidElement);
                        return;
                    }
                    
                    $el.is(':visible') ? $el.scaleExit() : $el.scaleEnter();
                } catch (error) {
                    handleError('缩放切换失败', error);
                }
            };
            
            // 使用事件委托绑定动画切换
            $(document).on('click', selectors.toggleAnimation, function(e) {
                try {
                    e.preventDefault();
                    const $this = $(this);
                    const target = $this.data('target');
                    const type = $this.data('toggle-animation');
                    const direction = $this.data('direction') || 'up';
                    
                    if (!target) {
                        handleError('缺少目标元素');
                        return;
                    }
                    
                    switch(type) {
                        case 'fade':
                            toggleFade(target);
                            break;
                        case 'slide':
                            toggleSlide(direction, target);
                            break;
                        case 'scale':
                            toggleScale(target);
                            break;
                        default:
                            handleError('未知的动画类型');
                    }
                } catch (error) {
                    handleError('动画切换失败', error);
                }
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    /**
     * 初始化所有过渡动画
     */
    function init() {
        try {
            initFadeAnimation();
            initSlideAnimation();
            initScaleAnimation();
            initAnimationToggle();
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    // 在文档加载完成后初始化
    $(document).ready(init);
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.transition = {
        init,
        initFadeAnimation,
        initSlideAnimation,
        initScaleAnimation,
        initAnimationToggle
    };

})(jQuery);