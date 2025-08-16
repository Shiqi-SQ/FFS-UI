/**
 * FFS UI - 排版组件
 * 提供排版的交互功能，包括文本复制、编辑和省略展开等
 */
(function($) {
    'use strict';

    /**
     * 初始化可复制文本
     * 为带有 ffs-copyable 类的元素添加复制功能
     */
    function initCopyable() {
        // 点击可复制文本
        $(document).on('click', '.ffs-copyable', function() {
            const $copyable = $(this);
            const text = $copyable.text();
            
            // 创建临时输入框
            const $temp = $('<textarea>');
            $('body').append($temp);
            $temp.val(text).select();
            
            // 执行复制命令
            try {
                document.execCommand('copy');
                
                // 显示复制成功状态
                $copyable.addClass('copied');
                
                // 3秒后移除复制成功状态
                setTimeout(function() {
                    $copyable.removeClass('copied');
                }, 3000);
            } catch (err) {
                console.error('复制失败:', err);
            }
            
            // 移除临时输入框
            $temp.remove();
        });
    }
    
    /**
     * 初始化可编辑文本
     * 为带有 ffs-editable 类的元素添加编辑功能
     */
    function initEditable() {
        // 点击可编辑文本
        $(document).on('click', '.ffs-editable', function(e) {
            const $editable = $(this);
            
            // 如果已经处于编辑状态，则不重复处理
            if ($editable.hasClass('editing')) {
                return;
            }
            
            // 获取当前文本
            const currentText = $editable.text();
            
            // 创建输入框
            const $input = $('<input type="text">');
            $input.val(currentText);
            
            // 替换文本为输入框
            $editable.empty().append($input);
            $editable.addClass('editing');
            
            // 聚焦输入框
            $input.focus();
            
            // 输入框失去焦点时保存
            $input.on('blur', function() {
                saveEditableText($editable);
            });
            
            // 按下回车键时保存
            $input.on('keydown', function(e) {
                if (e.key === 'Enter') {
                    saveEditableText($editable);
                    e.preventDefault();
                } else if (e.key === 'Escape') {
                    // 按下ESC键取消编辑
                    $editable.removeClass('editing');
                    $editable.text(currentText);
                    e.preventDefault();
                }
            });
            
            // 阻止事件冒泡
            e.stopPropagation();
        });
        
        // 点击文档其他地方时保存编辑
        $(document).on('click', function(e) {
            const $target = $(e.target);
            
            if (!$target.closest('.ffs-editable.editing').length) {
                $('.ffs-editable.editing').each(function() {
                    saveEditableText($(this));
                });
            }
        });
        
        // 保存可编辑文本
        function saveEditableText($editable) {
            const $input = $editable.find('input');
            const newText = $input.val();
            
            // 移除编辑状态
            $editable.removeClass('editing');
            
            // 更新文本
            $editable.text(newText);
            
            // 触发文本变更事件
            $editable.trigger('editable:change', [newText]);
        }
    }
    
    /**
     * 初始化省略文本
     * 为带有 ffs-ellipsis-multi 类的元素添加展开/收起功能
     */
    function initEllipsis() {
        // 为多行省略文本添加展开/收起按钮
        $('.ffs-ellipsis-multi').each(function() {
            const $ellipsis = $(this);
            const fullText = $ellipsis.text();
            const maxLines = $ellipsis.data('max-lines') || 2;
            
            // 如果文本内容较少，不需要省略，则跳过
            if ($ellipsis[0].scrollHeight <= $ellipsis[0].clientHeight) {
                return;
            }
            
            // 创建展开按钮
            const $expandBtn = $('<span class="ffs-ellipsis-expand">展开</span>');
            
            // 添加展开按钮
            $ellipsis.after($expandBtn);
            
            // 点击展开按钮
            $expandBtn.on('click', function() {
                const $btn = $(this);
                const $text = $btn.prev('.ffs-ellipsis-multi');
                
                if ($text.hasClass('ffs-ellipsis-expanded')) {
                    // 收起文本
                    $text.removeClass('ffs-ellipsis-expanded');
                    $text.css({
                        '-webkit-line-clamp': maxLines,
                        'max-height': 'none'
                    });
                    $btn.text('展开');
                } else {
                    // 展开文本
                    $text.addClass('ffs-ellipsis-expanded');
                    $text.css({
                        '-webkit-line-clamp': 'unset',
                        'max-height': 'none'
                    });
                    $btn.text('收起');
                }
            });
        });
    }
    
    /**
     * 初始化代码块
     * 为代码块添加复制按钮和语法高亮
     */
    function initCodeBlock() {
        // 为代码块添加复制按钮
        $('.ffs-code-block').each(function() {
            const $codeBlock = $(this);
            
            // 如果已经有复制按钮，则跳过
            if ($codeBlock.find('.ffs-code-copy-btn').length) {
                return;
            }
            
            // 创建复制按钮
            const $copyBtn = $('<button class="ffs-code-copy-btn" title="复制代码"><i class="fas fa-copy"></i></button>');
            
            // 添加复制按钮
            $codeBlock.append($copyBtn);
            
            // 点击复制按钮
            $copyBtn.on('click', function() {
                const code = $codeBlock.find('pre').text();
                
                // 创建临时输入框
                const $temp = $('<textarea>');
                $('body').append($temp);
                $temp.val(code).select();
                
                // 执行复制命令
                try {
                    document.execCommand('copy');
                    
                    // 显示复制成功状态
                    $copyBtn.addClass('copied');
                    $copyBtn.html('<i class="fas fa-check"></i>');
                    
                    // 3秒后恢复原始状态
                    setTimeout(function() {
                        $copyBtn.removeClass('copied');
                        $copyBtn.html('<i class="fas fa-copy"></i>');
                    }, 3000);
                } catch (err) {
                    console.error('复制失败:', err);
                }
                
                // 移除临时输入框
                $temp.remove();
            });
        });
    }
    
    /**
     * 初始化文本链接
     * 处理文本链接的点击事件
     */
    function initTextLink() {
        // 文本链接点击事件
        $(document).on('click', '.ffs-text-link', function(e) {
            const $link = $(this);
            const href = $link.attr('href');
            
            // 如果是禁用状态，则阻止默认行为
            if ($link.hasClass('ffs-text-disabled')) {
                e.preventDefault();
                return;
            }
            
            // 如果有自定义处理函数，则调用
            const customHandler = $link.data('handler');
            if (customHandler && typeof window[customHandler] === 'function') {
                e.preventDefault();
                window[customHandler].call($link, e);
            }
        });
    }
    
    // 在文档加载完成后初始化排版功能
    $(document).ready(function() {
        // 初始化可复制文本
        initCopyable();
        
        // 初始化可编辑文本
        initEditable();
        
        // 初始化省略文本
        initEllipsis();
        
        // 初始化代码块
        initCodeBlock();
        
        // 初始化文本链接
        initTextLink();
    });
    
    // 暴露排版API
    if (!window.FFS) {
        window.FFS = {};
    }
    
    if (!window.FFS.typography) {
        window.FFS.typography = {
            copyText: function(text) {
                // 创建临时输入框
                const $temp = $('<textarea>');
                $('body').append($temp);
                $temp.val(text).select();
                
                // 执行复制命令
                let success = false;
                try {
                    success = document.execCommand('copy');
                } catch (err) {
                    console.error('复制失败:', err);
                }
                
                // 移除临时输入框
                $temp.remove();
                
                return success;
            },
            makeEditable: function(selector) {
                $(selector).addClass('ffs-editable');
            },
            expandEllipsis: function(selector, expand = true) {
                const $ellipsis = $(selector);
                const $btn = $ellipsis.next('.ffs-ellipsis-expand');
                
                if (expand) {
                    $ellipsis.addClass('ffs-ellipsis-expanded');
                    $ellipsis.css({
                        '-webkit-line-clamp': 'unset',
                        'max-height': 'none'
                    });
                    $btn.text('收起');
                } else {
                    $ellipsis.removeClass('ffs-ellipsis-expanded');
                    $ellipsis.css({
                        '-webkit-line-clamp': $ellipsis.data('max-lines') || 2,
                        'max-height': 'none'
                    });
                    $btn.text('展开');
                }
            }
        };
    }

})(jQuery);