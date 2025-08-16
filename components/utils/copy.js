/**
 * FFS UI - 复制组件
 * 提供文本复制、富文本复制和剪贴板操作功能
 */
(function($) {
    'use strict';

    /**
     * 初始化文本复制
     * 为带有 ffs-copy-text 类的元素添加复制功能
     */
    function initTextCopy() {
        $(document).on('click', '.ffs-copy-text', function() {
            const $copyText = $(this);
            const text = $copyText.data('text') || $copyText.text();
            
            // 复制文本
            copyToClipboard(text, function() {
                // 复制成功后显示成功提示
                showSuccess($copyText);
            });
        });
    }
    
    /**
     * 初始化富文本复制
     * 为带有 ffs-copy-richtext-btn 类的元素添加复制功能
     */
    function initRichTextCopy() {
        $(document).on('click', '.ffs-copy-richtext-btn', function() {
            const $btn = $(this);
            const $richText = $btn.closest('.ffs-copy-richtext');
            const $content = $richText.find('.ffs-copy-richtext-content');
            const copyType = $btn.data('copy-type') || 'text';
            
            let textToCopy = '';
            
            // 根据复制类型获取内容
            if (copyType === 'html') {
                textToCopy = $content.html();
            } else {
                textToCopy = $content.text();
            }
            
            // 复制内容
            copyToClipboard(textToCopy, function() {
                // 复制成功后显示成功提示
                showSuccess($btn);
            });
        });
    }
    
    /**
     * 初始化剪贴板
     * 为带有 ffs-clipboard-btn 类的元素添加复制功能
     */
    function initClipboard() {
        $(document).on('click', '.ffs-clipboard-btn', function() {
            const $btn = $(this);
            const $clipboard = $btn.closest('.ffs-clipboard');
            const $input = $clipboard.find('.ffs-clipboard-input');
            
            // 获取要复制的文本
            let textToCopy = $input.val();
            
            // 如果没有输入框，尝试从data属性获取
            if (!$input.length) {
                textToCopy = $btn.data('clipboard-text') || '';
            }
            
            // 复制内容
            copyToClipboard(textToCopy, function() {
                // 复制成功后显示成功提示
                const $success = $clipboard.find('.ffs-clipboard-success');
                
                if ($success.length) {
                    $success.addClass('show');
                    
                    // 3秒后隐藏成功提示
                    setTimeout(function() {
                        $success.removeClass('show');
                    }, 3000);
                } else {
                    // 如果没有成功提示元素，创建一个临时的
                    showSuccess($btn);
                }
            });
        });
    }
    
    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @param {Function} callback - 复制成功后的回调函数
     */
    function copyToClipboard(text, callback) {
        // 尝试使用现代 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(function() {
                    if (typeof callback === 'function') {
                        callback();
                    }
                })
                .catch(function(err) {
                    console.error('复制失败:', err);
                    // 如果 Clipboard API 失败，尝试使用传统方法
                    fallbackCopyToClipboard(text, callback);
                });
        } else {
            // 浏览器不支持 Clipboard API，使用传统方法
            fallbackCopyToClipboard(text, callback);
        }
    }
    
    /**
     * 传统的复制到剪贴板方法（兼容旧浏览器）
     * @param {string} text - 要复制的文本
     * @param {Function} callback - 复制成功后的回调函数
     */
    function fallbackCopyToClipboard(text, callback) {
        // 创建临时文本区域
        const $textarea = $('<textarea>')
            .val(text)
            .css({
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                opacity: 0,
                zIndex: -1
            })
            .appendTo('body');
        
        // 选择文本
        $textarea.get(0).select();
        $textarea.get(0).setSelectionRange(0, text.length);
        
        // 尝试复制
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('复制失败:', err);
        }
        
        // 移除临时文本区域
        $textarea.remove();
        
        // 如果复制成功，调用回调函数
        if (success && typeof callback === 'function') {
            callback();
        }
    }
    
    /**
     * 显示复制成功提示
     * @param {jQuery} $element - 要显示提示的元素
     */
    function showSuccess($element) {
        // 查找现有的提示元素
        let $tooltip = $element.find('.ffs-copy-tooltip');
        
        // 如果没有提示元素，创建一个临时的
        if (!$tooltip.length) {
            $tooltip = $('<div class="ffs-copy-tooltip">复制成功</div>');
            $element.append($tooltip);
            
            // 3秒后移除临时提示
            setTimeout(function() {
                $tooltip.remove();
            }, 3000);
        } else {
            // 保存原始文本
            const originalText = $tooltip.text();
            
            // 更改为成功文本
            $tooltip.text('复制成功');
            
            // 显示提示
            $tooltip.css({
                opacity: 1,
                visibility: 'visible'
            });
            
            // 3秒后恢复原始文本并隐藏提示
            setTimeout(function() {
                $tooltip.text(originalText);
                $tooltip.css({
                    opacity: '',
                    visibility: ''
                });
            }, 3000);
        }
    }
    
    /**
     * 复制API
     * 提供复制功能的公共方法
     */
    $.ffsCopy = {
        /**
         * 复制文本到剪贴板
         * @param {string} text - 要复制的文本
         * @param {Function} onSuccess - 复制成功后的回调函数
         * @param {Function} onError - 复制失败后的回调函数
         */
        copyText: function(text, onSuccess, onError) {
            copyToClipboard(text, function() {
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            });
        },
        
        /**
         * 从元素复制内容
         * @param {string} selector - 元素选择器
         * @param {string} type - 复制类型，'text' 或 'html'
         * @param {Function} onSuccess - 复制成功后的回调函数
         * @param {Function} onError - 复制失败后的回调函数
         */
        copyFromElement: function(selector, type, onSuccess, onError) {
            const $element = $(selector);
            
            if (!$element.length) {
                if (typeof onError === 'function') {
                    onError('元素不存在');
                }
                return;
            }
            
            let content = '';
            
            if (type === 'html') {
                content = $element.html();
            } else {
                content = $element.text();
            }
            
            copyToClipboard(content, function() {
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            });
        },
        
        /**
         * 创建复制按钮
         * @param {string} selector - 容器选择器
         * @param {string} text - 要复制的文本
         * @param {object} options - 配置选项
         */
        createCopyButton: function(selector, text, options = {}) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 默认配置
            const defaults = {
                buttonText: '复制',
                buttonClass: '',
                showIcon: true,
                showTooltip: true,
                tooltipText: '点击复制',
                onSuccess: null
            };
            
            // 合并配置
            const settings = $.extend({}, defaults, options);
            
            // 创建复制按钮
            const $copyButton = $('<div class="ffs-copy-text"></div>');
            
            // 添加自定义类
            if (settings.buttonClass) {
                $copyButton.addClass(settings.buttonClass);
            }
            
            // 添加图标
            if (settings.showIcon) {
                $copyButton.append('<i class="fas fa-copy ffs-copy-icon"></i>');
            }
            
            // 添加按钮文本
            $copyButton.append(`<span>${settings.buttonText}</span>`);
            
            // 添加提示
            if (settings.showTooltip) {
                $copyButton.append(`<div class="ffs-copy-tooltip">${settings.tooltipText}</div>`);
            }
            
            // 设置要复制的文本
            $copyButton.data('text', text);
            
            // 添加成功回调
            if (typeof settings.onSuccess === 'function') {
                $copyButton.on('click', function() {
                    setTimeout(function() {
                        settings.onSuccess();
                    }, 100);
                });
            }
            
            // 添加到容器
            $container.append($copyButton);
            
            return $copyButton;
        }
    };
    
    // 初始化复制组件
    $(function() {
        initTextCopy();
        initRichTextCopy();
        initClipboard();
    });

})(jQuery);