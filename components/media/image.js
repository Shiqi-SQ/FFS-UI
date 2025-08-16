/**
 * FFS UI - 图片组件
 * 提供图片预览、上传、加载状态和错误处理等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化图片预览功能
     * 处理图片点击预览和预览模态框操作
     */
    function initImagePreview() {
        // 创建预览模态框
        if (!$('.ffs-image-preview-modal').length) {
            $('body').append(`
                <div class="ffs-image-preview-modal">
                    <div class="ffs-image-preview-content">
                        <img src="" alt="预览图片">
                        <div class="ffs-image-preview-close">
                            <i class="fas fa-times"></i>
                        </div>
                        <div class="ffs-image-preview-prev">
                            <i class="fas fa-chevron-left"></i>
                        </div>
                        <div class="ffs-image-preview-next">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
            `);
        }

        // 图片预览点击事件
        $(document).on('click', '.ffs-image-preview', function () {
            const $image = $(this).find('img');
            const src = $image.attr('src');
            const alt = $image.attr('alt') || '预览图片';

            // 设置预览图片
            const $modal = $('.ffs-image-preview-modal');
            $modal.find('img').attr('src', src).attr('alt', alt);

            // 显示模态框
            $modal.addClass('active');

            // 存储当前预览的图片元素
            $modal.data('current', $(this));
        });

        // 关闭预览
        $(document).on('click', '.ffs-image-preview-close, .ffs-image-preview-modal', function (e) {
            if (e.target === this || $(e.target).closest('.ffs-image-preview-close').length) {
                $('.ffs-image-preview-modal').removeClass('active');
            }
        });

        // 阻止点击内容时关闭
        $(document).on('click', '.ffs-image-preview-content', function (e) {
            e.stopPropagation();
        });

        // 上一张图片
        $(document).on('click', '.ffs-image-preview-prev', function () {
            const $modal = $('.ffs-image-preview-modal');
            const $current = $modal.data('current');

            if (!$current) return;

            // 查找上一个预览图片
            let $prev = $current.prev('.ffs-image-preview');
            if (!$prev.length) {
                $prev = $current.parent().find('.ffs-image-preview').last();
            }

            if ($prev.length) {
                const $image = $prev.find('img');
                const src = $image.attr('src');
                const alt = $image.attr('alt') || '预览图片';

                // 设置预览图片
                $modal.find('img').attr('src', src).attr('alt', alt);

                // 更新当前预览的图片元素
                $modal.data('current', $prev);
            }
        });

        // 下一张图片
        $(document).on('click', '.ffs-image-preview-next', function () {
            const $modal = $('.ffs-image-preview-modal');
            const $current = $modal.data('current');

            if (!$current) return;

            // 查找下一个预览图片
            let $next = $current.next('.ffs-image-preview');
            if (!$next.length) {
                $next = $current.parent().find('.ffs-image-preview').first();
            }

            if ($next.length) {
                const $image = $next.find('img');
                const src = $image.attr('src');
                const alt = $image.attr('alt') || '预览图片';

                // 设置预览图片
                $modal.find('img').attr('src', src).attr('alt', alt);

                // 更新当前预览的图片元素
                $modal.data('current', $next);
            }
        });

        // 键盘导航
        $(document).on('keydown', function (e) {
            if (!$('.ffs-image-preview-modal').hasClass('active')) return;

            switch (e.keyCode) {
                case 27: // ESC
                    $('.ffs-image-preview-modal').removeClass('active');
                    break;
                case 37: // 左箭头
                    $('.ffs-image-preview-prev').click();
                    break;
                case 39: // 右箭头
                    $('.ffs-image-preview-next').click();
                    break;
            }
        });
    }

    /**
     * 初始化图片上传功能
     * 处理图片上传、预览和进度显示
     */
    function initImageUpload() {
        // 图片上传变化事件
        $(document).on('change', '.ffs-image-upload input[type="file"]', function (e) {
            const $input = $(this);
            const $container = $input.closest('.ffs-image-upload');
            const $preview = $container.find('.ffs-image-upload-preview');
            const $progress = $container.find('.ffs-image-upload-progress');
            const $progressBar = $container.find('.ffs-image-upload-progress-bar');

            // 获取选择的文件
            const file = e.target.files[0];

            if (!file) return;

            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }

            // 创建文件读取器
            const reader = new FileReader();

            // 文件读取完成时
            reader.onload = function (e) {
                // 创建预览图片
                const img = new Image();
                img.src = e.target.result;

                // 清空预览区域并添加图片
                $preview.empty().append(img);

                // 触发预览事件
                $container.trigger('image:preview', [img.src, file]);

                // 模拟上传进度
                simulateUpload($progress, $progressBar, function () {
                    // 上传完成后触发事件
                    $container.trigger('image:uploaded', [img.src, file]);
                });
            };

            // 读取文件
            reader.readAsDataURL(file);
        });

        // 模拟上传进度
        function simulateUpload($progress, $progressBar, callback) {
            let progress = 0;
            $progress.show();
            $progressBar.css('width', '0%');

            const interval = setInterval(function () {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);

                    // 延迟隐藏进度条
                    setTimeout(function () {
                        $progress.hide();
                        if (callback) callback();
                    }, 500);
                }

                $progressBar.css('width', progress + '%');
            }, 200);
        }
    }

    /**
     * 初始化图片加载状态
     * 处理图片加载中和加载错误状态
     */
    function initImageLoading() {
        // 为所有图片添加加载事件
        $(document).on('load', '.ffs-image img', function () {
            const $img = $(this);
            const $container = $img.closest('.ffs-image');

            // 移除加载状态
            $container.removeClass('ffs-image-loading');

            // 触发加载完成事件
            $container.trigger('image:loaded', [$img]);
        });

        // 图片加载错误处理
        $(document).on('error', '.ffs-image img', function () {
            const $img = $(this);
            const $container = $img.closest('.ffs-image');

            // 移除加载状态，添加错误状态
            $container.removeClass('ffs-image-loading').addClass('ffs-image-error');

            // 触发加载错误事件
            $container.trigger('image:error', [$img]);
        });

        // 初始化已有图片的加载状态
        $('.ffs-image img').each(function () {
            const $img = $(this);
            const $container = $img.closest('.ffs-image');

            // 如果图片未加载完成，添加加载状态
            if (!this.complete) {
                $container.addClass('ffs-image-loading');
            } else if (this.naturalWidth === 0) {
                // 图片加载失败
                $container.addClass('ffs-image-error');
            }
        });
    }

    /**
     * 初始化图片压缩功能
     * 处理图片悬停缩放效果
     */
    function initImageCompress() {
        // 图片压缩悬停效果已通过CSS实现
        // 这里可以添加额外的交互功能
    }

    /**
     * 初始化图片裁剪功能
     * 处理图片裁剪和调整
     */
    function initImageCrop() {
        // 图片裁剪基本效果已通过CSS实现
        // 这里可以添加额外的交互功能
    }

    /**
     * 图片组件API
     * 提供操作图片的公共方法
     */
    $.ffsImage = {
        /**
         * 创建图片预览
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createPreview: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                src: '',
                alt: '预览图片',
                size: 'md',
                shape: 'rounded'
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建图片预览
            const $preview = $(`
                <div class="ffs-image ffs-image-preview ffs-image-${settings.size} ffs-image-${settings.shape}">
                    <img src="${settings.src}" alt="${settings.alt}">
                </div>
            `);

            // 添加到容器
            $container.append($preview);

            return $preview;
        },

        /**
         * 创建图片上传
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createUpload: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                accept: 'image/*',
                multiple: false,
                icon: 'fas fa-cloud-upload-alt'
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建图片上传
            const $upload = $(`
                <div class="ffs-image-upload">
                    <input type="file" accept="${settings.accept}" ${settings.multiple ? 'multiple' : ''}>
                    <div class="ffs-image-upload-preview">
                        <i class="${settings.icon}"></i>
                    </div>
                    <div class="ffs-image-upload-progress">
                        <div class="ffs-image-upload-progress-bar"></div>
                    </div>
                </div>
            `);

            // 添加到容器
            $container.append($upload);

            return $upload;
        },

        /**
         * 创建图片组
         * @param {string} selector - 容器选择器
         * @param {array} images - 图片数组
         * @param {object} options - 配置选项
         */
        createGroup: function (selector, images = [], options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                size: 'sm',
                shape: 'circle',
                max: 5
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建图片组
            const $group = $('<div class="ffs-image-group"></div>');

            // 添加图片
            const displayImages = images.slice(0, settings.max);

            displayImages.forEach(function (image) {
                const $image = $(`
                    <div class="ffs-image ffs-image-${settings.size} ffs-image-${settings.shape}">
                        <img src="${image.src}" alt="${image.alt || ''}">
                    </div>
                `);

                $group.append($image);
            });

            // 如果有更多图片，添加计数
            if (images.length > settings.max) {
                const more = images.length - settings.max;
                const $more = $(`
                    <div class="ffs-image ffs-image-${settings.size} ffs-image-${settings.shape}">
                        <div class="ffs-image-more">+${more}</div>
                    </div>
                `);

                $group.append($more);
            }

            // 添加到容器
            $container.append($group);

            return $group;
        },

        /**
         * 设置图片加载状态
         * @param {string} selector - 图片选择器
         * @param {boolean} loading - 是否加载中
         */
        setLoading: function (selector, loading = true) {
            const $container = $(selector);

            if (!$container.length) return;

            if (loading) {
                $container.addClass('ffs-image-loading').removeClass('ffs-image-error');
            } else {
                $container.removeClass('ffs-image-loading');
            }

            return $container;
        },

        /**
         * 设置图片错误状态
         * @param {string} selector - 图片选择器
         * @param {boolean} error - 是否错误
         */
        setError: function (selector, error = true) {
            const $container = $(selector);

            if (!$container.length) return;

            if (error) {
                $container.addClass('ffs-image-error').removeClass('ffs-image-loading');
            } else {
                $container.removeClass('ffs-image-error');
            }

            return $container;
        },

        /**
         * 设置图片源
         * @param {string} selector - 图片选择器
         * @param {string} src - 图片源URL
         * @param {string} alt - 图片描述
         */
        setSource: function (selector, src, alt = '') {
            const $container = $(selector);

            if (!$container.length || !src) return;

            const $img = $container.find('img');

            // 添加加载状态
            $container.addClass('ffs-image-loading').removeClass('ffs-image-error');

            // 设置图片源
            $img.attr('src', src);

            // 设置图片描述
            if (alt) {
                $img.attr('alt', alt);
            }

            return $container;
        },

        /**
         * 设置图片尺寸
         * @param {string} selector - 图片选择器
         * @param {string} size - 尺寸 (sm, md, lg, xl)
         */
        setSize: function (selector, size) {
            const $container = $(selector);

            if (!$container.length || !size) return;

            // 移除所有尺寸类
            $container.removeClass('ffs-image-sm ffs-image-md ffs-image-lg ffs-image-xl');

            // 添加指定尺寸类
            $container.addClass(`ffs-image-${size}`);

            return $container;
        },

        /**
         * 设置图片形状
         * @param {string} selector - 图片选择器
         * @param {string} shape - 形状 (circle, rounded, square)
         */
        setShape: function (selector, shape) {
            const $container = $(selector);

            if (!$container.length || !shape) return;

            // 移除所有形状类
            $container.removeClass('ffs-image-circle ffs-image-rounded ffs-image-square');

            // 添加指定形状类
            $container.addClass(`ffs-image-${shape}`);

            return $container;
        },

        /**
         * 启用图片预览
         * @param {string} selector - 图片选择器
         */
        enablePreview: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 添加预览类
            $container.addClass('ffs-image-preview');

            return $container;
        },

        /**
         * 禁用图片预览
         * @param {string} selector - 图片选择器
         */
        disablePreview: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 移除预览类
            $container.removeClass('ffs-image-preview');

            return $container;
        },

        /**
         * 启用图片压缩
         * @param {string} selector - 图片选择器
         */
        enableCompress: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 添加压缩类
            $container.addClass('ffs-image-compress');

            return $container;
        },

        /**
         * 禁用图片压缩
         * @param {string} selector - 图片选择器
         */
        disableCompress: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 移除压缩类
            $container.removeClass('ffs-image-compress');

            return $container;
        },

        /**
         * 启用图片裁剪
         * @param {string} selector - 图片选择器
         */
        enableCrop: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 添加裁剪类
            $container.addClass('ffs-image-crop');

            return $container;
        },

        /**
         * 禁用图片裁剪
         * @param {string} selector - 图片选择器
         */
        disableCrop: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 移除裁剪类
            $container.removeClass('ffs-image-crop');

            return $container;
        }
    };

    // 初始化图片组件
    $(function () {
        initImagePreview();
        initImageUpload();
        initImageLoading();
        initImageCompress();
        initImageCrop();
    });

})(jQuery);