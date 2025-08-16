/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * FFS UI - 高级详情页组件
 * 提供详情页的交互功能，包括标签页切换、图片预览、折叠面板等
 */
(function($) {
    'use strict';

    /**
     * 初始化详情标签页
     * 处理标签页的切换效果
     */
    function initDetailTabs() {
        // 标签页点击事件
        $(document).on('click', '.ffs-pro-detail-tabs-item', function() {
            const $tab = $(this);
            const $tabsContainer = $tab.closest('.ffs-pro-detail-tabs');
            const $contentContainer = $tabsContainer.next('.ffs-pro-detail-tabs-content');
            const tabKey = $tab.data('tab');
            
            // 更新活动标签
            $tabsContainer.find('.ffs-pro-detail-tabs-item').removeClass('active');
            $tab.addClass('active');
            
            // 更新内容区域
            if ($contentContainer.length) {
                $contentContainer.find('.ffs-pro-detail-tabs-pane').removeClass('active');
                $contentContainer.find(`.ffs-pro-detail-tabs-pane[data-tab="${tabKey}"]`).addClass('active');
            }
            
            // 触发标签切换事件
            $tabsContainer.trigger('tab:change', [tabKey, $tab]);
        });
        
        // 初始化默认活动标签
        $('.ffs-pro-detail-tabs').each(function() {
            const $tabsContainer = $(this);
            const $activeTab = $tabsContainer.find('.ffs-pro-detail-tabs-item.active');
            
            // 如果没有活动标签，默认第一个为活动
            if (!$activeTab.length) {
                $tabsContainer.find('.ffs-pro-detail-tabs-item').first().addClass('active');
                const tabKey = $tabsContainer.find('.ffs-pro-detail-tabs-item').first().data('tab');
                
                // 更新内容区域
                const $contentContainer = $tabsContainer.next('.ffs-pro-detail-tabs-content');
                if ($contentContainer.length) {
                    $contentContainer.find('.ffs-pro-detail-tabs-pane').removeClass('active');
                    $contentContainer.find(`.ffs-pro-detail-tabs-pane[data-tab="${tabKey}"]`).addClass('active');
                }
            }
        });
    }
    
    /**
     * 初始化图片预览
     * 处理详情页中的图片预览功能
     */
    function initImagePreview() {
        // 图片点击预览
        $(document).on('click', '.ffs-pro-detail-gallery-item', function() {
            const $item = $(this);
            const $gallery = $item.closest('.ffs-pro-detail-gallery');
            const $mainImage = $gallery.find('.ffs-pro-detail-gallery-main img');
            const imageSrc = $item.find('img').attr('src');
            const imageAlt = $item.find('img').attr('alt') || '图片预览';
            
            // 更新主图
            if ($mainImage.length) {
                $mainImage.attr('src', imageSrc);
                $mainImage.attr('alt', imageAlt);
            }
            
            // 更新活动缩略图
            $gallery.find('.ffs-pro-detail-gallery-item').removeClass('active');
            $item.addClass('active');
            
            // 触发图片切换事件
            $gallery.trigger('image:change', [imageSrc, $item]);
        });
        
        // 初始化默认活动图片
        $('.ffs-pro-detail-gallery').each(function() {
            const $gallery = $(this);
            const $activeItem = $gallery.find('.ffs-pro-detail-gallery-item.active');
            
            // 如果没有活动图片，默认第一个为活动
            if (!$activeItem.length && $gallery.find('.ffs-pro-detail-gallery-item').length) {
                $gallery.find('.ffs-pro-detail-gallery-item').first().addClass('active');
                
                // 更新主图
                const $mainImage = $gallery.find('.ffs-pro-detail-gallery-main img');
                const $firstItem = $gallery.find('.ffs-pro-detail-gallery-item').first();
                if ($mainImage.length && $firstItem.length) {
                    $mainImage.attr('src', $firstItem.find('img').attr('src'));
                    $mainImage.attr('alt', $firstItem.find('img').attr('alt') || '图片预览');
                }
            }
        });
        
        // 图片放大预览
        $(document).on('click', '.ffs-pro-detail-gallery-main img', function() {
            const $img = $(this);
            const src = $img.attr('src');
            
            // 创建预览遮罩
            const $overlay = $('<div class="ffs-pro-detail-image-overlay"></div>');
            const $previewContainer = $('<div class="ffs-pro-detail-image-preview"></div>');
            const $previewImage = $(`<img src="${src}" alt="预览图">`);
            const $closeBtn = $('<div class="ffs-pro-detail-image-close">&times;</div>');
            
            $previewContainer.append($previewImage);
            $previewContainer.append($closeBtn);
            $overlay.append($previewContainer);
            $('body').append($overlay);
            
            // 禁止滚动
            $('body').css('overflow', 'hidden');
            
            // 关闭预览
            $overlay.on('click', function(e) {
                if ($(e.target).is($overlay) || $(e.target).is($closeBtn)) {
                    $overlay.remove();
                    $('body').css('overflow', '');
                }
            });
            
            // ESC键关闭
            $(document).on('keydown.imagePreview', function(e) {
                if (e.key === 'Escape') {
                    $overlay.remove();
                    $('body').css('overflow', '');
                    $(document).off('keydown.imagePreview');
                }
            });
        });
    }
    
    /**
     * 初始化折叠面板
     * 处理详情页中的折叠面板效果
     */
    function initCollapsePanels() {
        // 折叠面板切换
        $(document).on('click', '.ffs-pro-detail-collapse-header', function() {
            const $header = $(this);
            const $panel = $header.closest('.ffs-pro-detail-collapse');
            const $content = $panel.find('.ffs-pro-detail-collapse-content');
            
            // 切换折叠状态
            $panel.toggleClass('expanded');
            
            // 展开/收起内容
            if ($panel.hasClass('expanded')) {
                $content.slideDown(300);
            } else {
                $content.slideUp(300);
            }
            
            // 触发折叠状态变化事件
            $panel.trigger('collapse:toggle', [$panel.hasClass('expanded')]);
        });
        
        // 初始化默认展开的面板
        $('.ffs-pro-detail-collapse').each(function() {
            const $panel = $(this);
            const $content = $panel.find('.ffs-pro-detail-collapse-content');
            
            // 如果面板默认展开
            if ($panel.hasClass('expanded')) {
                $content.show();
            } else {
                $content.hide();
            }
        });
    }
    
    /**
     * 初始化详情操作栏
     * 处理固定在顶部的操作栏
     */
    function initActionBar() {
        // 检查是否存在操作栏
        const $actionBar = $('.ffs-pro-detail-action-bar');
        if (!$actionBar.length) return;
        
        // 保存原始位置
        const actionBarTop = $actionBar.offset().top;
        const actionBarHeight = $actionBar.outerHeight();
        
        // 创建占位元素
        const $placeholder = $('<div class="ffs-pro-detail-action-placeholder"></div>');
        $placeholder.css('height', actionBarHeight + 'px');
        $placeholder.insertAfter($actionBar);
        $placeholder.hide();
        
        // 监听滚动事件
        $(window).on('scroll', function() {
            const scrollTop = $(window).scrollTop();
            
            // 当滚动超过操作栏位置时固定
            if (scrollTop > actionBarTop) {
                $actionBar.addClass('fixed');
                $placeholder.show();
            } else {
                $actionBar.removeClass('fixed');
                $placeholder.hide();
            }
        });
    }
    
    /**
     * 初始化详情页锚点导航
     */
    function initAnchorNavigation() {
        // 检查是否存在锚点导航
        const $anchorNav = $('.ffs-pro-detail-anchor');
        if (!$anchorNav.length) return;
        
        // 点击锚点滚动到对应位置
        $(document).on('click', '.ffs-pro-detail-anchor-item', function(e) {
            e.preventDefault();
            
            const $item = $(this);
            const target = $item.attr('href');
            
            // 更新活动状态
            $item.closest('.ffs-pro-detail-anchor').find('.ffs-pro-detail-anchor-item').removeClass('active');
            $item.addClass('active');
            
            // 滚动到目标位置
            if ($(target).length) {
                const offset = $(target).offset().top - 80; // 考虑固定头部的高度
                $('html, body').animate({
                    scrollTop: offset
                }, 300);
            }
        });
        
        // 监听滚动更新活动锚点
        $(window).on('scroll', function() {
            const scrollTop = $(window).scrollTop();
            
            // 查找所有锚点对应的目标元素
            $('.ffs-pro-detail-anchor-item').each(function() {
                const $item = $(this);
                const target = $item.attr('href');
                
                if ($(target).length) {
                    const targetTop = $(target).offset().top - 100;
                    const targetBottom = targetTop + $(target).outerHeight();
                    
                    // 当目标在可视区域内时激活对应锚点
                    if (scrollTop >= targetTop && scrollTop < targetBottom) {
                        $item.closest('.ffs-pro-detail-anchor').find('.ffs-pro-detail-anchor-item').removeClass('active');
                        $item.addClass('active');
                    }
                }
            });
        });
    }
    
    /**
     * 初始化详情页评分
     */
    function initRating() {
        // 评分交互
        $(document).on('mouseenter', '.ffs-pro-detail-rating-star', function() {
            const $star = $(this);
            const $container = $star.closest('.ffs-pro-detail-rating');
            const index = $container.find('.ffs-pro-detail-rating-star').index($star);
            
            // 高亮当前及之前的星星
            $container.find('.ffs-pro-detail-rating-star').each(function(i) {
                if (i <= index) {
                    $(this).addClass('hover');
                } else {
                    $(this).removeClass('hover');
                }
            });
        });
        
        $(document).on('mouseleave', '.ffs-pro-detail-rating', function() {
            // 移除所有悬停状态
            $(this).find('.ffs-pro-detail-rating-star').removeClass('hover');
        });
        
        $(document).on('click', '.ffs-pro-detail-rating-star', function() {
            const $star = $(this);
            const $container = $star.closest('.ffs-pro-detail-rating');
            const index = $container.find('.ffs-pro-detail-rating-star').index($star);
            const rating = index + 1;
            
            // 更新评分状态
            $container.find('.ffs-pro-detail-rating-star').removeClass('active');
            $container.find('.ffs-pro-detail-rating-star').each(function(i) {
                if (i <= index) {
                    $(this).addClass('active');
                }
            });
            
            // 更新评分值
            $container.data('rating', rating);
            
            // 触发评分事件
            $container.trigger('rating:change', [rating]);
        });
    }
    
    /**
     * 初始化详情页分享功能
     */
    function initSharing() {
        // 分享按钮点击
        $(document).on('click', '.ffs-pro-detail-share-item', function() {
            const $item = $(this);
            const platform = $item.data('platform');
            const url = window.location.href;
            const title = document.title;
            
            // 根据不同平台打开不同的分享链接
            let shareUrl = '';
            
            switch(platform) {
                case 'weibo':
                    shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
                    break;
                case 'wechat':
                    // 微信分享通常需要显示二维码
                    showWechatQRCode(url);
                    return;
                case 'qq':
                    shareUrl = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
            }
            
            // 打开分享窗口
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=500');
            }
            
            // 触发分享事件
            $item.trigger('share:click', [platform, url]);
        });
        
        // 显示微信分享二维码
        function showWechatQRCode(url) {
            // 创建遮罩
            const $overlay = $('<div class="ffs-pro-detail-share-overlay"></div>');
            const $container = $('<div class="ffs-pro-detail-share-qrcode-container"></div>');
            const $title = $('<div class="ffs-pro-detail-share-qrcode-title">微信扫码分享</div>');
            const $qrcode = $('<div class="ffs-pro-detail-share-qrcode"></div>');
            const $tip = $('<div class="ffs-pro-detail-share-qrcode-tip">打开微信"扫一扫"，扫描二维码</div>');
            const $closeBtn = $('<div class="ffs-pro-detail-share-qrcode-close">&times;</div>');
            
            // 组装元素
            $container.append($title);
            $container.append($qrcode);
            $container.append($tip);
            $container.append($closeBtn);
            $overlay.append($container);
            $('body').append($overlay);
            
            // 生成二维码（需要引入qrcode.js库）
            if (window.QRCode) {
                new QRCode($qrcode[0], {
                    text: url,
                    width: 200,
                    height: 200
                });
            } else {
                // 如果没有引入QRCode库，显示提示
                $qrcode.html('请引入QRCode库以显示二维码');
            }
            
            // 禁止滚动
            $('body').css('overflow', 'hidden');
            
            // 关闭二维码
            $overlay.on('click', function(e) {
                if ($(e.target).is($overlay) || $(e.target).is($closeBtn)) {
                    $overlay.remove();
                    $('body').css('overflow', '');
                }
            });
            
            // ESC键关闭
            $(document).on('keydown.qrcode', function(e) {
                if (e.key === 'Escape') {
                    $overlay.remove();
                    $('body').css('overflow', '');
                    $(document).off('keydown.qrcode');
                }
            });
        }
    }
    
    /**
     * 初始化详情页相关推荐
     */
    function initRelatedItems() {
        // 相关推荐滚动
        $('.ffs-pro-detail-related-items').each(function() {
            const $container = $(this);
            const $list = $container.find('.ffs-pro-detail-related-list');
            const $items = $container.find('.ffs-pro-detail-related-item');
            const $prevBtn = $container.find('.ffs-pro-detail-related-prev');
            const $nextBtn = $container.find('.ffs-pro-detail-related-next');
            
            // 如果项目数量不足，隐藏导航按钮
            if ($items.length <= 3) {
                $prevBtn.hide();
                $nextBtn.hide();
                return;
            }
            
            // 设置初始状态
            let currentIndex = 0;
            updateNavButtons();
            
            // 上一个
            $prevBtn.on('click', function() {
                if (currentIndex > 0) {
                    currentIndex--;
                    scrollToItem(currentIndex);
                    updateNavButtons();
                }
            });
            
            // 下一个
            $nextBtn.on('click', function() {
                if (currentIndex < $items.length - 3) {
                    currentIndex++;
                    scrollToItem(currentIndex);
                    updateNavButtons();
                }
            });
            
            // 滚动到指定项目
            function scrollToItem(index) {
                const itemWidth = $items.first().outerWidth(true);
                $list.animate({
                    scrollLeft: index * itemWidth
                }, 300);
            }
            
            // 更新导航按钮状态
            function updateNavButtons() {
                $prevBtn.prop('disabled', currentIndex === 0);
                $nextBtn.prop('disabled', currentIndex >= $items.length - 3);
            }
        });
    }
    
    /**
     * 初始化详情页评论功能
     */
    function initComments() {
        // 评论提交
        $(document).on('submit', '.ffs-pro-detail-comment-form', function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const $textarea = $form.find('textarea');
            const $commentList = $('.ffs-pro-detail-comment-list');
            
            // 获取评论内容
            const content = $textarea.val().trim();
            
            // 验证评论内容
            if (!content) {
                // 显示错误提示
                if (!$textarea.next('.ffs-pro-detail-comment-error').length) {
                    $textarea.after('<div class="ffs-pro-detail-comment-error">评论内容不能为空</div>');
                }
                return;
            }
            
            // 移除错误提示
            $textarea.next('.ffs-pro-detail-comment-error').remove();
            
            // 触发评论提交事件
            $form.trigger('comment:submit', [content]);
            
            // 模拟添加评论（实际应用中应该通过AJAX提交到服务器）
            const $newComment = $(`
                <div class="ffs-pro-detail-comment-item">
                    <div class="ffs-pro-detail-comment-avatar">
                        <img src="https://via.placeholder.com/40" alt="用户头像">
                    </div>
                    <div class="ffs-pro-detail-comment-content">
                        <div class="ffs-pro-detail-comment-user">当前用户</div>
                        <div class="ffs-pro-detail-comment-text">${content}</div>
                        <div class="ffs-pro-detail-comment-meta">
                            <span class="ffs-pro-detail-comment-time">刚刚</span>
                            <span class="ffs-pro-detail-comment-reply">回复</span>
                        </div>
                    </div>
                </div>
            `);
            
            // 添加到评论列表
            if ($commentList.length) {
                $commentList.prepend($newComment);
                
                // 更新评论数量
                const $count = $('.ffs-pro-detail-comment-count');
                if ($count.length) {
                    const count = parseInt($count.text(), 10) + 1;
                    $count.text(count);
                }
            }
            
            // 清空输入框
            $textarea.val('');
        });
        
        // 评论回复
        $(document).on('click', '.ffs-pro-detail-comment-reply', function() {
            const $replyBtn = $(this);
            const $commentItem = $replyBtn.closest('.ffs-pro-detail-comment-item');
            const $form = $('.ffs-pro-detail-comment-form');
            const username = $commentItem.find('.ffs-pro-detail-comment-user').text();
            
            // 设置回复提示
            $form.find('textarea').attr('placeholder', `回复 ${username}：`);
            $form.data('reply-to', $commentItem.index());
            
            // 滚动到评论框
            $('html, body').animate({
                scrollTop: $form.offset().top - 100
            }, 300);
            
            // 聚焦评论框
            $form.find('textarea').focus();
        });
        
        // 加载更多评论
        $(document).on('click', '.ffs-pro-detail-comment-load-more', function() {
            const $btn = $(this);
            const $commentList = $('.ffs-pro-detail-comment-list');
            
            // 显示加载状态
            $btn.addClass('loading');
            $btn.text('加载中...');
            
            // 触发加载更多事件
            $btn.trigger('comments:loadMore');
            
            // 模拟加载更多评论（实际应用中应该通过AJAX加载）
            setTimeout(function() {
                // 模拟添加3条新评论
                for (let i = 0; i < 3; i++) {
                    const $newComment = $(`
                        <div class="ffs-pro-detail-comment-item">
                            <div class="ffs-pro-detail-comment-avatar">
                                <img src="https://via.placeholder.com/40" alt="用户头像">
                            </div>
                            <div class="ffs-pro-detail-comment-content">
                                <div class="ffs-pro-detail-comment-user">用户${Math.floor(Math.random() * 1000)}</div>
                                <div class="ffs-pro-detail-comment-text">这是一条加载的评论内容示例。</div>
                                <div class="ffs-pro-detail-comment-meta">
                                    <span class="ffs-pro-detail-comment-time">1天前</span>
                                    <span class="ffs-pro-detail-comment-reply">回复</span>
                                </div>
                            </div>
                        </div>
                    `);
                    
                    $commentList.append($newComment);
                }
                
                // 恢复按钮状态
                $btn.removeClass('loading');
                $btn.text('加载更多');
                
                // 更新评论数量
                const $count = $('.ffs-pro-detail-comment-count');
                if ($count.length) {
                    const count = parseInt($count.text(), 10) + 3;
                    $count.text(count);
                }
            }, 1000);
        });
    }
    
    /**
     * 初始化响应式行为
     */
    function initResponsiveBehavior() {
        // 窗口大小变化时处理
        $(window).on('resize', function() {
            // 重新计算操作栏位置
            const $actionBar = $('.ffs-pro-detail-action-bar');
            if ($actionBar.length && !$actionBar.hasClass('fixed')) {
                const $placeholder = $('.ffs-pro-detail-action-placeholder');
                if ($placeholder.length) {
                    $placeholder.css('height', $actionBar.outerHeight() + 'px');
                }
            }
            
            // 处理移动端标签页
            if ($(window).width() <= 768) {
                $('.ffs-pro-detail-tabs').each(function() {
                    const $tabs = $(this);
                    if (!$tabs.hasClass('ffs-pro-detail-tabs-mobile')) {
                        $tabs.addClass('ffs-pro-detail-tabs-mobile');
                    }
                });
            } else {
                $('.ffs-pro-detail-tabs-mobile').removeClass('ffs-pro-detail-tabs-mobile');
            }
        });
        
        // 初始化移动端标签页
        if ($(window).width() <= 768) {
            $('.ffs-pro-detail-tabs').addClass('ffs-pro-detail-tabs-mobile');
        }
    }
    
    /**
     * 初始化所有详情页功能
     */
    function init() {
        initDetailTabs();
        initImagePreview();
        initCollapsePanels();
        initActionBar();
        initAnchorNavigation();
        initRating();
        initSharing();
        initRelatedItems();
        initComments();
        initResponsiveBehavior();
    }
    
    // 在文档加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
    // 暴露公共API
    window.FFSUI = window.FFSUI || {};
    window.FFSUI.proDetail = {
        init: init,
        initDetailTabs: initDetailTabs,
        initImagePreview: initImagePreview,
        initCollapsePanels: initCollapsePanels,
        initActionBar: initActionBar,
        initAnchorNavigation: initAnchorNavigation,
        initRating: initRating,
        initSharing: initSharing,
        initRelatedItems: initRelatedItems,
        initComments: initComments
    };

})(jQuery);