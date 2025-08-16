/**
 * FFS UI - 结果页面组件
 * 提供结果页面的交互功能，包括按钮事件处理和响应式调整
 */
(function($) {
    'use strict';

    /**
     * 初始化结果页面按钮
     * 处理结果页面中的按钮点击事件
     */
    function initResultPageButtons() {
        // 返回首页按钮
        $(document).on('click', '.ffs-result-page-actions .ffs-button:contains("返回首页")', function() {
            const $btn = $(this);
            const $resultPage = $btn.closest('.ffs-result-page');
            
            // 触发返回首页事件
            $resultPage.trigger('result:home');
            
            // 默认行为：跳转到首页
            if (!$resultPage.data('prevent-default')) {
                window.location.href = '/';
            }
        });
        
        // 返回上一页按钮
        $(document).on('click', '.ffs-result-page-actions .ffs-button:contains("上一页")', function() {
            const $btn = $(this);
            const $resultPage = $btn.closest('.ffs-result-page');
            
            // 触发返回上一页事件
            $resultPage.trigger('result:back');
            
            // 默认行为：返回上一页
            if (!$resultPage.data('prevent-default')) {
                window.history.back();
            }
        });
        
        // 重试按钮
        $(document).on('click', '.ffs-result-page-actions .ffs-button:contains("重试")', function() {
            const $btn = $(this);
            const $resultPage = $btn.closest('.ffs-result-page');
            
            // 触发重试事件
            $resultPage.trigger('result:retry');
            
            // 默认行为：刷新页面
            if (!$resultPage.data('prevent-default')) {
                window.location.reload();
            }
        });
        
        // 联系支持/管理员按钮
        $(document).on('click', '.ffs-result-page-actions .ffs-button:contains("联系")', function() {
            const $btn = $(this);
            const $resultPage = $btn.closest('.ffs-result-page');
            
            // 触发联系支持事件
            $resultPage.trigger('result:contact');
            
            // 默认行为：无，需要自定义处理
        });
        
        // 其他通用按钮
        $(document).on('click', '.ffs-result-page-actions .ffs-button', function() {
            const $btn = $(this);
            const $resultPage = $btn.closest('.ffs-result-page');
            const buttonText = $btn.text().trim();
            
            // 如果不是已处理的特殊按钮，触发通用按钮事件
            if (!buttonText.includes('返回首页') && 
                !buttonText.includes('上一页') && 
                !buttonText.includes('重试') && 
                !buttonText.includes('联系')) {
                
                // 触发按钮点击事件
                $resultPage.trigger('result:action', [buttonText, $btn]);
            }
        });
    }
    
    /**
     * 初始化结果页面动画
     * 为结果页面添加入场动画效果
     */
    function initResultPageAnimation() {
        // 页面加载完成后添加动画
        $('.ffs-result-page').each(function() {
            const $resultPage = $(this);
            
            // 如果支持动画
            if (!$resultPage.hasClass('no-animation')) {
                // 初始状态
                $resultPage.css({
                    opacity: 0,
                    transform: 'translateY(20px)'
                });
                
                // 延迟执行入场动画
                setTimeout(function() {
                    $resultPage.css({
                        transition: 'opacity 0.5s ease, transform 0.5s ease',
                        opacity: 1,
                        transform: 'translateY(0)'
                    });
                    
                    // 动画完成后触发事件
                    setTimeout(function() {
                        $resultPage.trigger('result:shown');
                    }, 500);
                }, 100);
            }
        });
    }
    
    /**
     * 初始化响应式行为
     * 处理结果页面在不同设备上的显示
     */
    function initResponsiveBehavior() {
        // 窗口大小变化时调整
        $(window).on('resize', function() {
            adjustResultPageHeight();
        });
        
        // 调整结果页面高度
        function adjustResultPageHeight() {
            $('.ffs-result-page').each(function() {
                const $resultPage = $(this);
                const windowHeight = $(window).height();
                
                // 如果窗口高度小于页面内容，取消最小高度限制
                if (windowHeight < 500) {
                    $resultPage.css('min-height', 'auto');
                } else {
                    $resultPage.css('min-height', '100vh');
                }
            });
        }
        
        // 初始调整
        adjustResultPageHeight();
    }
    
    /**
     * 初始化自动倒计时返回
     * 可以设置结果页面自动返回首页或上一页
     */
    function initAutoRedirect() {
        $('.ffs-result-page[data-redirect]').each(function() {
            const $resultPage = $(this);
            const redirectUrl = $resultPage.data('redirect');
            const redirectDelay = parseInt($resultPage.data('redirect-delay'), 10) || 5;
            
            if (redirectUrl) {
                let countdown = redirectDelay;
                
                // 创建倒计时提示
                const $countdown = $('<div class="ffs-result-page-countdown"></div>');
                $countdown.text(`${countdown}秒后自动跳转...`);
                $resultPage.append($countdown);
                
                // 开始倒计时
                const timer = setInterval(function() {
                    countdown--;
                    $countdown.text(`${countdown}秒后自动跳转...`);
                    
                    if (countdown <= 0) {
                        clearInterval(timer);
                        
                        // 触发重定向事件
                        $resultPage.trigger('result:redirect', [redirectUrl]);
                        
                        // 执行重定向
                        if (!$resultPage.data('prevent-default')) {
                            window.location.href = redirectUrl;
                        }
                    }
                }, 1000);
                
                // 保存定时器引用，以便可以清除
                $resultPage.data('redirect-timer', timer);
            }
        });
        
        // 点击任意按钮取消自动跳转
        $(document).on('click', '.ffs-result-page[data-redirect] .ffs-button', function() {
            const $resultPage = $(this).closest('.ffs-result-page');
            const timer = $resultPage.data('redirect-timer');
            
            if (timer) {
                clearInterval(timer);
                $resultPage.find('.ffs-result-page-countdown').remove();
            }
        });
    }
    
    /**
     * 初始化所有结果页面功能
     */
    function init() {
        initResultPageButtons();
        initResultPageAnimation();
        initResponsiveBehavior();
        initAutoRedirect();
    }
    
    // 在文档加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.resultPage = {
        init: init,
        initResultPageButtons: initResultPageButtons,
        initResultPageAnimation: initResultPageAnimation,
        initResponsiveBehavior: initResponsiveBehavior,
        initAutoRedirect: initAutoRedirect
    };

})(jQuery);