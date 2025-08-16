/**
 * FFS UI - 加载动画组件
 * 提供进度条控制、骨架屏和加载状态管理功能
 */
(function($) {
    'use strict';

    // 缓存常用选择器
    const selectors = {
        progress: '.ffs-progress',
        progressBar: '.ffs-progress-bar',
        progressText: '.ffs-progress-text',
        skeleton: '.ffs-skeleton',
        skeletonContent: '.ffs-skeleton-content',
        loadingContainer: '.ffs-loading-container',
        spinner: '.ffs-spinner',
        loadingOverlay: '.ffs-loading-overlay'
    };

    // 配置参数
    const config = {
        animationDuration: 300,
        errorMessages: {
            invalidValue: '无效的进度值',
            initFailed: '初始化失败',
            invalidElement: '无效的元素选择器'
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
     * 进度条控制
     * 用于控制 ffs-progress 进度条的进度
     */
    function initProgressBar() {
        try {
            // 设置进度条进度
            $.fn.setProgress = function(value, animate = true) {
                return this.each(function() {
                    try {
                        const $progress = $(this);
                        const $bar = $progress.find(selectors.progressBar);
                        
                        if (!$bar.length) {
                            handleError('进度条元素不存在');
                            return;
                        }

                        // 确保值在0-100之间
                        value = Math.min(100, Math.max(0, parseFloat(value) || 0));
                        const duration = animate ? config.animationDuration : 0;
                        
                        // 使用 requestAnimationFrame 优化动画
                        requestAnimationFrame(() => {
                            $bar.css({
                                transition: `width ${duration}ms var(--animation-timing-function)`,
                                width: value + '%'
                            });

                            // 如果有文本显示，更新文本
                            const $text = $progress.next(selectors.progressText);
                            if ($text.length) {
                                $text.text(value + '%');
                            }
                            
                            // 触发进度变化事件
                            $progress.trigger('progress:change', [value]);
                            
                            // 完成时触发完成事件
                            if (value >= 100) {
                                $progress.trigger('progress:complete');
                            }

                            // 清理transition
                            if (duration > 0) {
                                setTimeout(() => {
                                    $bar.css('transition', '');
                                }, duration);
                            }
                        });
                    } catch (error) {
                        handleError('设置进度失败', error);
                    }
                });
            };
            
            // 初始化带有data-progress属性的进度条
            $(`${selectors.progress}[data-progress]`).each(function() {
                const $progress = $(this);
                const initialValue = parseFloat($progress.data('progress')) || 0;
                $progress.setProgress(initialValue, false);
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    /**
     * 骨架屏控制
     * 用于控制 ffs-skeleton 骨架屏的显示和隐藏
     */
    function initSkeleton() {
        try {
            // 显示内容，隐藏骨架屏
            $.fn.showContent = function(duration = config.animationDuration) {
                return this.each(function() {
                    try {
                        const $container = $(this);
                        const $skeletons = $container.find(selectors.skeleton);
                        const $content = $container.find(selectors.skeletonContent);
                        
                        if (!$skeletons.length || !$content.length) {
                            handleError('骨架屏或内容元素不存在');
                            return;
                        }
                        
                        requestAnimationFrame(() => {
                            // 使用CSS类控制显示状态
                            $skeletons.addClass('ffs-skeleton--hide');
                            $content.addClass('ffs-skeleton-content--show');
                            
                            // 移除加载状态
                            $container.removeClass('ffs-loading');
                            
                            // 清理类
                            setTimeout(() => {
                                $skeletons.hide().removeClass('ffs-skeleton--hide');
                                $content.removeClass('ffs-skeleton-content--show');
                            }, duration);
                        });
                    } catch (error) {
                        handleError('显示内容失败', error);
                    }
                });
            };
            
            // 隐藏内容，显示骨架屏
            $.fn.showSkeleton = function(duration = config.animationDuration) {
                return this.each(function() {
                    try {
                        const $container = $(this);
                        const $skeletons = $container.find(selectors.skeleton);
                        const $content = $container.find(selectors.skeletonContent);
                        
                        if (!$skeletons.length || !$content.length) {
                            handleError('骨架屏或内容元素不存在');
                            return;
                        }
                        
                        requestAnimationFrame(() => {
                            // 显示骨架屏
                            $skeletons.show();
                            $content.addClass('ffs-skeleton-content--hide');
                            
                            // 添加加载状态
                            $container.addClass('ffs-loading');
                            
                            // 清理类
                            setTimeout(() => {
                                $content.hide().removeClass('ffs-skeleton-content--hide');
                            }, duration);
                        });
                    } catch (error) {
                        handleError('显示骨架屏失败', error);
                    }
                });
            };
            
            // 初始化带有data-auto-load属性的骨架屏
            $(`${selectors.loadingContainer}[data-auto-load]`).each(function() {
                const $container = $(this);
                const delay = parseInt($container.data('auto-load'), 10) || 2000;
                
                // 默认显示骨架屏
                $container.showSkeleton(0);
                
                // 延迟后显示内容
                setTimeout(() => {
                    $container.showContent();
                }, delay);
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    /**
     * 加载状态控制
     * 用于控制元素的加载状态
     */
    function initLoadingState() {
        try {
            // 设置元素为加载状态
            $.fn.setLoading = function(isLoading = true) {
                return this.each(function() {
                    try {
                        const $el = $(this);
                        
                        if (isLoading) {
                            // 如果是按钮，添加加载状态
                            if ($el.is('button, .ffs-btn')) {
                                // 保存原始文本
                                const text = $el.text();
                                $el.data('original-text', text);
                                
                                requestAnimationFrame(() => {
                                    // 添加加载样式
                                    $el.addClass('ffs-loading-btn')
                                       .prop('disabled', true);
                                    
                                    // 添加加载图标
                                    if (!$el.find(selectors.spinner).length) {
                                        $el.append('<div class="ffs-spinner"></div>');
                                    }
                                    
                                    // 隐藏文本
                                    $el.find('span').css('opacity', '0');
                                });
                            } else {
                                // 非按钮元素，添加加载遮罩
                                if (!$el.find(selectors.loadingOverlay).length) {
                                    requestAnimationFrame(() => {
                                        $el.css('position', 'relative')
                                           .append('<div class="ffs-loading-overlay"><div class="ffs-spinner"></div></div>');
                                    });
                                }
                            }
                            
                            // 添加加载类
                            $el.addClass('ffs-is-loading');
                        } else {
                            // 移除加载状态
                            if ($el.is('button, .ffs-btn')) {
                                // 恢复原始文本
                                const originalText = $el.data('original-text');
                                if (originalText) {
                                    requestAnimationFrame(() => {
                                        $el.text(originalText)
                                           .removeClass('ffs-loading-btn')
                                           .prop('disabled', false);
                                        
                                        // 移除加载图标
                                        $el.find(selectors.spinner).remove();
                                        
                                        // 显示文本
                                        $el.find('span').css('opacity', '1');
                                    });
                                }
                            } else {
                                // 移除加载遮罩
                                requestAnimationFrame(() => {
                                    $el.find(selectors.loadingOverlay).remove();
                                });
                            }
                            
                            // 移除加载类
                            $el.removeClass('ffs-is-loading');
                        }
                    } catch (error) {
                        handleError('设置加载状态失败', error);
                    }
                });
            };
            
            // 初始化带有data-loading属性的元素
            $('[data-loading="true"]').each(function() {
                $(this).setLoading(true);
            });
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    /**
     * 初始化所有加载动画
     */
    function init() {
        try {
            initProgressBar();
            initSkeleton();
            initLoadingState();
        } catch (error) {
            handleError(config.errorMessages.initFailed, error);
        }
    }
    
    // 在文档加载完成后初始化
    $(document).ready(init);
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.loading = {
        init,
        initProgressBar,
        initSkeleton,
        initLoadingState
    };

})(jQuery);