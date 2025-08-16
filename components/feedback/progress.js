/**
 * FFS UI - 进度组件
 * 提供进度条、步骤导航和上传进度等功能
 */
(function($) {
    'use strict';

    /**
     * 初始化进度条
     * 处理进度条的进度设置和动画
     */
    function initProgressBar() {
        // 设置进度条进度
        $.fn.setProgress = function(value, animate = true) {
            return this.each(function() {
                const $progress = $(this);
                const $bar = $progress.find('.ffs-progress-bar');
                const duration = animate ? 300 : 0;
                
                // 确保值在0-100之间
                value = Math.min(100, Math.max(0, value));
                
                // 设置进度条宽度
                if (animate) {
                    $bar.animate({
                        width: value + '%'
                    }, duration);
                } else {
                    $bar.css('width', value + '%');
                }
                
                // 如果有文本显示，更新文本
                const $text = $progress.siblings('.ffs-progress-text');
                if ($text.length) {
                    $text.text(value + '%');
                }
                
                // 触发进度变化事件
                $progress.trigger('progress:change', [value]);
                
                // 完成时触发完成事件
                if (value >= 100) {
                    $progress.trigger('progress:complete');
                }
            });
        };
        
        // 初始化带有data-progress属性的进度条
        $('.ffs-progress[data-progress]').each(function() {
            const $progress = $(this);
            const initialValue = parseInt($progress.data('progress'), 10) || 0;
            $progress.setProgress(initialValue, false);
        });
    }

    /**
     * 初始化步骤导航
     * 处理步骤的切换和状态管理
     */
    function initSteps() {
        // 设置当前步骤
        $.fn.setStep = function(index) {
            return this.each(function() {
                const $steps = $(this);
                const $stepItems = $steps.find('.ffs-step');
                
                // 确保索引有效
                if (index < 0 || index >= $stepItems.length) return;
                
                // 更新步骤状态
                $stepItems.each(function(i) {
                    const $step = $(this);
                    
                    if (i < index) {
                        // 已完成步骤
                        $step.removeClass('active').addClass('completed');
                    } else if (i === index) {
                        // 当前步骤
                        $step.removeClass('completed').addClass('active');
                    } else {
                        // 未完成步骤
                        $step.removeClass('active completed');
                    }
                });
                
                // 触发步骤变化事件
                $steps.trigger('step:change', [index]);
            });
        };
        
        // 下一步
        $.fn.nextStep = function() {
            return this.each(function() {
                const $steps = $(this);
                const $stepItems = $steps.find('.ffs-step');
                const currentIndex = $steps.find('.ffs-step.active').index();
                
                // 如果当前是最后一步，则完成所有步骤
                if (currentIndex === $stepItems.length - 1) {
                    $stepItems.addClass('completed').removeClass('active');
                    $steps.trigger('step:complete');
                } else {
                    // 否则前进到下一步
                    $steps.setStep(currentIndex + 1);
                }
            });
        };
        
        // 上一步
        $.fn.prevStep = function() {
            return this.each(function() {
                const $steps = $(this);
                const currentIndex = $steps.find('.ffs-step.active').index();
                
                // 如果当前不是第一步，则后退到上一步
                if (currentIndex > 0) {
                    $steps.setStep(currentIndex - 1);
                }
            });
        };
        
        // 初始化带有data-step属性的步骤导航
        $('.ffs-steps[data-step]').each(function() {
            const $steps = $(this);
            const initialStep = parseInt($steps.data('step'), 10) || 0;
            $steps.setStep(initialStep);
        });
    }

    /**
     * 初始化上传进度
     * 处理文件上传和进度显示
     */
    function initUpload() {
        // 初始化上传组件
        $('.ffs-upload').each(function() {
            const $upload = $(this);
            const $input = $('<input type="file" multiple style="display: none;">');
            
            // 添加文件输入框
            $upload.append($input);
            
            // 点击上传区域时触发文件选择
            $upload.on('click', function() {
                $input.click();
            });
            
            // 拖拽文件到上传区域
            $upload.on('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $upload.addClass('ffs-upload-dragover');
            });
            
            $upload.on('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $upload.removeClass('ffs-upload-dragover');
            });
            
            $upload.on('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $upload.removeClass('ffs-upload-dragover');
                
                // 获取拖拽的文件
                const files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    handleFiles($upload, files);
                }
            });
            
            // 文件选择变化时处理文件
            $input.on('change', function() {
                const files = this.files;
                if (files.length > 0) {
                    handleFiles($upload, files);
                }
                // 重置input，以便可以重复选择相同文件
                this.value = '';
            });
        });
        
        // 处理文件上传
        function handleFiles($upload, files) {
            // 创建文件列表（如果不存在）
            let $list = $upload.find('.ffs-upload-list');
            if (!$list.length) {
                $list = $('<div class="ffs-upload-list"></div>');
                $upload.append($list);
            }
            
            // 处理每个文件
            Array.from(files).forEach(file => {
                // 创建文件项
                const $item = $(`
                    <div class="ffs-upload-item">
                        <div class="ffs-upload-item-name">${file.name}</div>
                        <div class="ffs-upload-item-status">准备上传...</div>
                    </div>
                `);
                
                // 添加到列表
                $list.append($item);
                
                // 模拟上传过程（实际应用中应替换为真实上传逻辑）
                simulateUpload($upload, $item, file);
            });
            
            // 触发上传开始事件
            $upload.trigger('upload:start', [files]);
        }
        
        // 模拟文件上传过程
        function simulateUpload($upload, $item, file) {
            // 创建进度条（如果不存在）
            let $progress = $upload.find('.ffs-upload-progress');
            if (!$progress.length) {
                $progress = $(`
                    <div class="ffs-upload-progress">
                        <div class="ffs-progress">
                            <div class="ffs-progress-bar" style="width: 0%"></div>
                        </div>
                        <div class="ffs-progress-text">0%</div>
                    </div>
                `);
                $upload.append($progress);
            }
            
            const $progressBar = $progress.find('.ffs-progress');
            const $status = $item.find('.ffs-upload-item-status');
            
            // 更新状态
            $status.text('上传中...');
            
            // 模拟上传进度
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    // 随机成功或失败（实际应用中应根据真实上传结果）
                    const success = Math.random() > 0.2;
                    
                    if (success) {
                        $status.html('<i class="fas fa-check"></i> 上传成功').addClass('ffs-upload-item-success');
                        $upload.trigger('upload:success', [file]);
                    } else {
                        $status.html('<i class="fas fa-times"></i> 上传失败').addClass('ffs-upload-item-error');
                        $upload.trigger('upload:error', [file]);
                    }
                    
                    // 延迟后隐藏进度条
                    setTimeout(() => {
                        $progress.fadeOut(300, function() {
                            $(this).remove();
                        });
                    }, 1000);
                }
                
                // 更新进度条
                $progressBar.setProgress(progress);
                
                // 触发进度事件
                $upload.trigger('upload:progress', [file, progress]);
            }, 300);
        }
        
        // 添加上传方法
        $.fn.upload = function(files) {
            return this.each(function() {
                const $upload = $(this);
                if (files && files.length > 0) {
                    handleFiles($upload, files);
                }
            });
        };
    }

    /**
     * 初始化骨架屏
     * 处理骨架屏的显示和隐藏
     */
    function initSkeleton() {
        // 显示内容，隐藏骨架屏
        $.fn.showContent = function(duration = 300) {
            return this.each(function() {
                const $container = $(this);
                const $skeletons = $container.find('.ffs-skeleton');
                const $content = $container.find('.ffs-skeleton-content');
                
                // 隐藏骨架屏
                $skeletons.fadeOut(duration);
                
                // 显示内容
                $content.fadeIn(duration);
            });
        };
        
        // 显示骨架屏，隐藏内容
        $.fn.showSkeleton = function(duration = 300) {
            return this.each(function() {
                const $container = $(this);
                const $skeletons = $container.find('.ffs-skeleton');
                const $content = $container.find('.ffs-skeleton-content');
                
                // 显示骨架屏
                $skeletons.fadeIn(duration);
                
                // 隐藏内容
                $content.fadeOut(duration);
            });
        };
    }

    /**
     * 初始化加载状态
     * 处理元素的加载状态显示
     */
    function initLoading() {
        // 显示加载状态
        $.fn.showLoading = function(text) {
            return this.each(function() {
                const $container = $(this);
                
                // 添加加载类
                $container.addClass('ffs-loading');
                
                // 如果提供了文本，则显示加载文本
                if (text) {
                    let $text = $container.find('.ffs-loading-text');
                    if (!$text.length) {
                        $text = $('<div class="ffs-loading-text"></div>');
                        $container.append($text);
                    }
                    $text.text(text);
                }
            });
        };
        
        // 隐藏加载状态
        $.fn.hideLoading = function() {
            return this.each(function() {
                const $container = $(this);
                
                // 移除加载类
                $container.removeClass('ffs-loading');
                
                // 移除加载文本
                $container.find('.ffs-loading-text').remove();
            });
        };
    }

    /**
     * 初始化所有进度组件
     */
    function initAllProgress() {
        initProgressBar();
        initSteps();
        initUpload();
        initSkeleton();
        initLoading();
    }

    // 在文档加载完成后初始化
    $(document).ready(function() {
        initAllProgress();
    });

    // 导出公共API
    return {
        initProgressBar: initProgressBar,
        initSteps: initSteps,
        initUpload: initUpload,
        initSkeleton: initSkeleton,
        initLoading: initLoading,
        initAllProgress: initAllProgress
    };
})(jQuery);