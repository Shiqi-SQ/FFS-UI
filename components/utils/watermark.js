/**
 * FFS UI - 水印组件
 * 提供文字水印、图片水印和全局水印功能
 */
(function($) {
    'use strict';

    /**
     * 初始化文字水印
     * 为带有 ffs-watermark-text 类的容器添加文字水印
     */
    function initTextWatermark() {
        $('.ffs-watermark-text').each(function() {
            const $container = $(this);
            const $layer = $container.find('.ffs-watermark-text-layer');
            
            // 如果没有配置，使用默认配置
            const content = $container.data('content') || 'FFS UI';
            const opacity = $container.data('opacity') || 0.2;
            const rotation = $container.data('rotation') || -30;
            
            // 创建水印
            createTextWatermark($container, $layer, content, opacity, rotation);
        });
    }
    
    /**
     * 创建文字水印
     * @param {jQuery} $container - 容器元素
     * @param {jQuery} $layer - 水印层元素
     * @param {string} content - 水印内容
     * @param {number} opacity - 透明度
     * @param {number} rotation - 旋转角度
     */
    function createTextWatermark($container, $layer, content, opacity, rotation) {
        // 清空水印层
        $layer.empty();
        
        // 创建水印项
        const $item = $('<div class="ffs-watermark-text-item"></div>')
            .text(content)
            .css('opacity', opacity)
            .css('transform', `rotate(${rotation}deg)`);
        
        // 计算水印位置
        const containerWidth = $container.width();
        const containerHeight = $container.height();
        const itemWidth = 150; // 估计宽度
        const itemHeight = 30; // 估计高度
        
        const cols = Math.ceil(containerWidth / itemWidth) + 1;
        const rows = Math.ceil(containerHeight / itemHeight) + 1;
        
        // 添加水印
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const $clone = $item.clone()
                    .css('left', `${j * itemWidth}px`)
                    .css('top', `${i * itemHeight}px`);
                $layer.append($clone);
            }
        }
    }
    
    /**
     * 初始化图片水印
     * 为带有 ffs-watermark-image 类的容器添加图片水印
     */
    function initImageWatermark() {
        $('.ffs-watermark-image').each(function() {
            const $container = $(this);
            const $layer = $container.find('.ffs-watermark-image-layer');
            
            // 如果没有配置，使用默认配置
            const imageUrl = $container.data('image');
            const opacity = $container.data('opacity') || 0.2;
            const rotation = $container.data('rotation') || -30;
            
            // 如果有图片URL，创建水印
            if (imageUrl) {
                createImageWatermark($container, $layer, imageUrl, opacity, rotation);
            }
        });
    }
    
    /**
     * 创建图片水印
     * @param {jQuery} $container - 容器元素
     * @param {jQuery} $layer - 水印层元素
     * @param {string} imageUrl - 图片URL
     * @param {number} opacity - 透明度
     * @param {number} rotation - 旋转角度
     */
    function createImageWatermark($container, $layer, imageUrl, opacity, rotation) {
        // 清空水印层
        $layer.empty();
        
        // 创建水印项
        const $item = $('<img class="ffs-watermark-image-item">')
            .attr('src', imageUrl)
            .css('opacity', opacity)
            .css('transform', `rotate(${rotation}deg)`);
        
        // 计算水印位置
        const containerWidth = $container.width();
        const containerHeight = $container.height();
        const itemWidth = 100; // 固定宽度
        const itemHeight = 100; // 固定高度
        
        const cols = Math.ceil(containerWidth / itemWidth) + 1;
        const rows = Math.ceil(containerHeight / itemHeight) + 1;
        
        // 添加水印
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const $clone = $item.clone()
                    .css('left', `${j * itemWidth}px`)
                    .css('top', `${i * itemHeight}px`);
                $layer.append($clone);
            }
        }
    }
    
    /**
     * 初始化全局水印
     * 为整个页面添加水印
     */
    function initGlobalWatermark() {
        // 检查是否有全局水印配置
        const $body = $('body');
        const content = $body.data('watermark-content');
        const opacity = $body.data('watermark-opacity') || 0.2;
        const rotation = $body.data('watermark-rotation') || -30;
        
        // 如果有配置，创建全局水印
        if (content) {
            createGlobalWatermark(content, opacity, rotation);
        }
    }
    
    /**
     * 创建全局水印
     * @param {string} content - 水印内容
     * @param {number} opacity - 透明度
     * @param {number} rotation - 旋转角度
     */
    function createGlobalWatermark(content, opacity, rotation) {
        // 检查是否已存在全局水印
        let $container = $('.ffs-watermark-global');
        
        // 如果不存在，创建容器
        if (!$container.length) {
            $container = $('<div class="ffs-watermark-global"></div>');
            $('body').append($container);
        }
        
        // 创建水印层
        const $layer = $('<div class="ffs-watermark-global-layer"></div>');
        $container.empty().append($layer);
        
        // 创建水印项
        const $item = $('<div class="ffs-watermark-global-item"></div>')
            .text(content)
            .css('opacity', opacity)
            .css('transform', `rotate(${rotation}deg)`);
        
        // 计算水印位置
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();
        const itemWidth = 150; // 估计宽度
        const itemHeight = 30; // 估计高度
        
        const cols = Math.ceil(windowWidth / itemWidth) + 1;
        const rows = Math.ceil(windowHeight / itemHeight) + 1;
        
        // 添加水印
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const $clone = $item.clone()
                    .css('left', `${j * itemWidth}px`)
                    .css('top', `${i * itemHeight}px`);
                $layer.append($clone);
            }
        }
        
        // 监听窗口大小变化，重新创建水印
        $(window).on('resize', function() {
            createGlobalWatermark(content, opacity, rotation);
        });
    }
    
    /**
     * 水印API
     * 提供水印操作的公共方法
     */
    $.ffsWatermark = {
        /**
         * 添加文字水印
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        addText: function(selector, options = {}) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 默认配置
            const defaults = {
                content: 'FFS UI',
                opacity: 0.2,
                rotation: -30
            };
            
            // 合并配置
            const settings = $.extend({}, defaults, options);
            
            // 添加类
            $container.addClass('ffs-watermark-text');
            
            // 设置数据属性
            $container.data('content', settings.content);
            $container.data('opacity', settings.opacity);
            $container.data('rotation', settings.rotation);
            
            // 确保内容和水印层存在
            if (!$container.find('.ffs-watermark-text-content').length) {
                $container.wrapInner('<div class="ffs-watermark-text-content"></div>');
            }
            
            if (!$container.find('.ffs-watermark-text-layer').length) {
                $container.append('<div class="ffs-watermark-text-layer"></div>');
            }
            
            // 创建水印
            const $layer = $container.find('.ffs-watermark-text-layer');
            createTextWatermark($container, $layer, settings.content, settings.opacity, settings.rotation);
            
            return $container;
        },
        
        /**
         * 添加图片水印
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        addImage: function(selector, options = {}) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 默认配置
            const defaults = {
                image: '',
                opacity: 0.2,
                rotation: -30
            };
            
            // 合并配置
            const settings = $.extend({}, defaults, options);
            
            // 添加类
            $container.addClass('ffs-watermark-image');
            
            // 设置数据属性
            $container.data('image', settings.image);
            $container.data('opacity', settings.opacity);
            $container.data('rotation', settings.rotation);
            
            // 确保内容和水印层存在
            if (!$container.find('.ffs-watermark-image-content').length) {
                $container.wrapInner('<div class="ffs-watermark-image-content"></div>');
            }
            
            if (!$container.find('.ffs-watermark-image-layer').length) {
                $container.append('<div class="ffs-watermark-image-layer"></div>');
            }
            
            // 创建水印
            if (settings.image) {
                const $layer = $container.find('.ffs-watermark-image-layer');
                createImageWatermark($container, $layer, settings.image, settings.opacity, settings.rotation);
            }
            
            return $container;
        },
        
        /**
         * 添加全局水印
         * @param {object} options - 配置选项
         */
        addGlobal: function(options = {}) {
            // 默认配置
            const defaults = {
                content: 'FFS UI',
                opacity: 0.2,
                rotation: -30
            };
            
            // 合并配置
            const settings = $.extend({}, defaults, options);
            
            // 设置数据属性
            $('body').data('watermark-content', settings.content);
            $('body').data('watermark-opacity', settings.opacity);
            $('body').data('watermark-rotation', settings.rotation);
            
            // 创建全局水印
            createGlobalWatermark(settings.content, settings.opacity, settings.rotation);
        },
        
        /**
         * 移除水印
         * @param {string} selector - 容器选择器，如果不提供则移除全局水印
         */
        remove: function(selector) {
            if (selector) {
                // 移除指定容器的水印
                const $container = $(selector);
                
                if ($container.hasClass('ffs-watermark-text')) {
                    $container.find('.ffs-watermark-text-layer').empty();
                } else if ($container.hasClass('ffs-watermark-image')) {
                    $container.find('.ffs-watermark-image-layer').empty();
                }
            } else {
                // 移除全局水印
                $('.ffs-watermark-global').remove();
            }
        }
    };
    
    // 初始化组件
    $(function() {
        initTextWatermark();
        initImageWatermark();
        initGlobalWatermark();
    });
    
})(jQuery);