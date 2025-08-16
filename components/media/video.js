/**
 * FFS UI - 视频组件
 * 提供视频播放、控制、预览和上传等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化视频播放器控制
     * 处理视频播放、暂停、进度和音量控制
     */
    function initVideoPlayer() {
        // 播放/暂停控制
        $(document).on('click', '.ffs-video-play', function () {
            const $button = $(this);
            const $video = $button.closest('.ffs-video').find('video')[0];

            if (!$video) return;

            if ($video.paused) {
                // 暂停所有其他视频
                $('video').each(function () {
                    if (this !== $video && !this.paused) {
                        this.pause();
                        $(this).closest('.ffs-video').find('.ffs-video-play i')
                            .removeClass('fa-pause')
                            .addClass('fa-play');
                    }
                });

                // 播放当前视频
                $video.play();
                $button.find('i').removeClass('fa-play').addClass('fa-pause');
            } else {
                // 暂停当前视频
                $video.pause();
                $button.find('i').removeClass('fa-pause').addClass('fa-play');
            }
        });

        // 视频控制栏显示/隐藏
        $(document).on('mouseenter', '.ffs-video', function () {
            $(this).find('.ffs-video-controls').css('opacity', '1');
        });

        $(document).on('mouseleave', '.ffs-video', function () {
            if (!$(this).find('video')[0]?.paused) {
                $(this).find('.ffs-video-controls').css('opacity', '0');
            }
        });

        // 进度条控制
        $(document).on('click', '.ffs-video-progress', function (e) {
            const $progress = $(this);
            const $video = $progress.closest('.ffs-video').find('video')[0];

            if (!$video) return;

            // 计算点击位置的百分比
            const offset = $progress.offset();
            const width = $progress.width();
            const clickX = e.pageX - offset.left;
            const percent = clickX / width;

            // 设置视频当前时间
            $video.currentTime = percent * $video.duration;

            // 更新进度条
            $progress.find('.ffs-video-progress-bar').css('width', (percent * 100) + '%');
        });

        // 音量控制
        $(document).on('click', '.ffs-video-volume', function (e) {
            const $volume = $(this);
            const $video = $volume.closest('.ffs-video').find('video')[0];

            if (!$video) return;

            // 计算点击位置的百分比
            const offset = $volume.offset();
            const width = $volume.width();
            const clickX = e.pageX - offset.left;
            const percent = clickX / width;

            // 设置视频音量
            $video.volume = percent;

            // 更新音量条
            $volume.find('.ffs-video-volume-bar').css('width', (percent * 100) + '%');

            // 更新音量图标
            updateVolumeIcon($volume.prev('.ffs-video-volume-icon').find('i'), percent);
        });

        // 全屏控制
        $(document).on('click', '.ffs-video-fullscreen', function () {
            const $video = $(this).closest('.ffs-video').find('video')[0];

            if (!$video) return;

            if (document.fullscreenElement) {
                // 退出全屏
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                // 进入全屏
                if ($video.requestFullscreen) {
                    $video.requestFullscreen();
                } else if ($video.webkitRequestFullscreen) {
                    $video.webkitRequestFullscreen();
                } else if ($video.mozRequestFullScreen) {
                    $video.mozRequestFullScreen();
                } else if ($video.msRequestFullscreen) {
                    $video.msRequestFullscreen();
                }
            }
        });

        // 视频时间更新
        $(document).on('timeupdate', 'video', function () {
            const $video = $(this);
            const $container = $video.closest('.ffs-video');
            const $progress = $container.find('.ffs-video-progress');
            const $currentTime = $container.find('.ffs-video-current-time');
            const $duration = $container.find('.ffs-video-duration');

            // 更新进度条
            if ($progress.length) {
                const percent = (this.currentTime / this.duration) * 100;
                $progress.find('.ffs-video-progress-bar').css('width', percent + '%');
            }

            // 更新当前时间
            if ($currentTime.length) {
                $currentTime.text(formatTime(this.currentTime));
            }

            // 更新总时长
            if ($duration.length && !$duration.text()) {
                $duration.text(formatTime(this.duration));
            }
        });

        // 视频加载中
        $(document).on('waiting', 'video', function () {
            const $container = $(this).closest('.ffs-video');
            $container.addClass('ffs-video-loading');
        });

        // 视频可以播放
        $(document).on('canplay', 'video', function () {
            const $container = $(this).closest('.ffs-video');
            $container.removeClass('ffs-video-loading');
        });

        // 视频加载错误
        $(document).on('error', 'video', function () {
            const $container = $(this).closest('.ffs-video');
            $container.removeClass('ffs-video-loading').addClass('ffs-video-error');
        });

        // 视频结束
        $(document).on('ended', 'video', function () {
            const $container = $(this).closest('.ffs-video');
            const $playButton = $container.find('.ffs-video-play');

            // 重置播放按钮
            $playButton.find('i').removeClass('fa-pause').addClass('fa-play');
        });

        // 初始化已有视频的控制
        $('.ffs-video').each(function () {
            const $container = $(this);
            const $video = $container.find('video')[0];
            const $controls = $container.find('.ffs-video-controls');

            // 如果没有控制栏，跳过
            if (!$controls.length || !$video) return;

            // 初始化时间显示
            const $duration = $container.find('.ffs-video-duration');
            if ($duration.length && $video.readyState >= 1) {
                $duration.text(formatTime($video.duration));
            }

            // 初始化音量
            const $volume = $container.find('.ffs-video-volume');
            if ($volume.length) {
                $volume.find('.ffs-video-volume-bar').css('width', ($video.volume * 100) + '%');
                updateVolumeIcon($volume.prev('.ffs-video-volume-icon').find('i'), $video.volume);
            }
        });
    }

    /**
     * 初始化视频上传功能
     * 处理视频上传、预览和进度显示
     */
    function initVideoUpload() {
        // 视频上传变化事件
        $(document).on('change', '.ffs-video-upload input[type="file"]', function (e) {
            const $input = $(this);
            const $container = $input.closest('.ffs-video-upload');
            const $preview = $container.find('.ffs-video-upload-preview');
            const $progress = $container.find('.ffs-video-upload-progress');
            const $progressBar = $container.find('.ffs-video-upload-progress-bar');

            // 获取选择的文件
            const file = e.target.files[0];

            if (!file) return;

            // 检查文件类型
            if (!file.type.match('video.*')) {
                alert('请选择视频文件');
                return;
            }

            // 创建文件URL
            const videoURL = URL.createObjectURL(file);

            // 创建预览视频
            const video = document.createElement('video');
            video.src = videoURL;
            video.controls = true;

            // 清空预览区域并添加视频
            $preview.empty().append(video);

            // 触发预览事件
            $container.trigger('video:preview', [videoURL, file]);

            // 模拟上传进度
            simulateUpload($progress, $progressBar, function () {
                // 上传完成后触发事件
                $container.trigger('video:uploaded', [videoURL, file]);
            });
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
     * 初始化视频预览功能
     * 处理视频点击预览和预览模态框操作
     */
    function initVideoPreview() {
        // 创建预览模态框
        if (!$('.ffs-video-preview-modal').length) {
            $('body').append(`
                <div class="ffs-video-preview-modal">
                    <div class="ffs-video-preview-content">
                        <div class="ffs-video-preview-close">
                            <i class="fas fa-times"></i>
                        </div>
                        <video src="" controls></video>
                    </div>
                </div>
            `);
        }

        // 视频预览点击事件
        $(document).on('click', '.ffs-video-preview', function () {
            const $video = $(this).find('video');
            const src = $video.attr('src');

            // 设置预览视频
            const $modal = $('.ffs-video-preview-modal');
            $modal.find('video').attr('src', src);

            // 显示模态框
            $modal.addClass('active');

            // 暂停原视频
            $video[0].pause();
        });

        // 关闭预览
        $(document).on('click', '.ffs-video-preview-close, .ffs-video-preview-modal', function (e) {
            if (e.target === this || $(e.target).closest('.ffs-video-preview-close').length) {
                const $modal = $('.ffs-video-preview-modal');

                // 暂停预览视频
                $modal.find('video')[0].pause();

                // 隐藏模态框
                $modal.removeClass('active');
            }
        });

        // 阻止点击内容时关闭
        $(document).on('click', '.ffs-video-preview-content', function (e) {
            if (!$(e.target).closest('.ffs-video-preview-close').length) {
                e.stopPropagation();
            }
        });

        // 键盘导航
        $(document).on('keydown', function (e) {
            if (!$('.ffs-video-preview-modal').hasClass('active')) return;

            if (e.keyCode === 27) { // ESC
                $('.ffs-video-preview-modal').click();
            }
        });
    }

    /**
     * 工具函数：格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串 (MM:SS)
     */
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';

        seconds = Math.floor(seconds);
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    /**
     * 工具函数：更新音量图标
     * @param {jQuery} $icon - 音量图标元素
     * @param {number} volume - 音量值 (0-1)
     */
    function updateVolumeIcon($icon, volume) {
        $icon.removeClass('fa-volume-up fa-volume-down fa-volume-mute');

        if (volume === 0) {
            $icon.addClass('fa-volume-mute');
        } else if (volume < 0.5) {
            $icon.addClass('fa-volume-down');
        } else {
            $icon.addClass('fa-volume-up');
        }
    }

    /**
     * 视频组件API
     * 提供操作视频的公共方法
     */
    $.ffsVideo = {
        /**
         * 创建视频播放器
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        create: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                src: '',
                controls: true,
                autoplay: false,
                size: 'md',
                customControls: false
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建视频播放器
            let $video = $(`<div class="ffs-video ffs-video-${settings.size}"></div>`);

            // 添加视频元素
            const videoElement = `<video src="${settings.src}" ${settings.controls && !settings.customControls ? 'controls' : ''} ${settings.autoplay ? 'autoplay' : ''}></video>`;
            $video.append(videoElement);

            // 如果需要自定义控制栏
            if (settings.customControls) {
                const controls = `
                    <div class="ffs-video-controls">
                        <button class="ffs-video-play">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="ffs-video-progress">
                            <div class="ffs-video-progress-bar"></div>
                        </div>
                        <div class="ffs-video-time">
                            <span class="ffs-video-current-time">00:00</span>
                            <span class="ffs-video-duration">00:00</span>
                        </div>
                        <div class="ffs-video-volume-icon">
                            <i class="fas fa-volume-up"></i>
                        </div>
                        <div class="ffs-video-volume">
                            <div class="ffs-video-volume-bar"></div>
                        </div>
                        <button class="ffs-video-fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                `;
                $video.append(controls);
            }

            // 添加到容器
            $container.append($video);

            return $video;
        },

        /**
         * 创建视频上传
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createUpload: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                accept: 'video/*',
                multiple: false,
                icon: 'fas fa-cloud-upload-alt'
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 创建视频上传
            const $upload = $(`
                <div class="ffs-video-upload">
                    <input type="file" accept="${settings.accept}" ${settings.multiple ? 'multiple' : ''}>
                    <div class="ffs-video-upload-preview">
                        <i class="${settings.icon}"></i>
                    </div>
                    <div class="ffs-video-upload-progress">
                        <div class="ffs-video-upload-progress-bar"></div>
                    </div>
                </div>
            `);

            // 添加到容器
            $container.append($upload);

            return $upload;
        },

        /**
         * 播放视频
         * @param {string} selector - 视频选择器
         */
        play: function (selector) {
            const $container = $(selector);
            const $video = $container.find('video')[0];
            const $button = $container.find('.ffs-video-play');

            if (!$video) return;

            // 播放视频
            $video.play();

            // 更新播放按钮
            if ($button.length) {
                $button.find('i').removeClass('fa-play').addClass('fa-pause');
            }
        },

        /**
         * 暂停视频
         * @param {string} selector - 视频选择器
         */
        pause: function (selector) {
            const $container = $(selector);
            const $video = $container.find('video')[0];
            const $button = $container.find('.ffs-video-play');

            if (!$video) return;

            // 暂停视频
            $video.pause();

            // 更新播放按钮
            if ($button.length) {
                $button.find('i').removeClass('fa-pause').addClass('fa-play');
            }
        },

        /**
         * 设置视频源
         * @param {string} selector - 视频选择器
         * @param {string} src - 视频源URL
         */
        setSource: function (selector, src) {
            const $container = $(selector);
            const $video = $container.find('video');

            if (!$video.length || !src) return;

            // 设置视频源
            $video.attr('src', src);

            // 重置进度条和时间
            $container.find('.ffs-video-progress-bar').css('width', '0%');
            $container.find('.ffs-video-current-time').text('00:00');
            $container.find('.ffs-video-duration').text('00:00');

            // 重置播放按钮
            $container.find('.ffs-video-play i').removeClass('fa-pause').addClass('fa-play');
        },

        /**
         * 设置视频尺寸
         * @param {string} selector - 视频选择器
         * @param {string} size - 尺寸 (sm, md, lg, xl)
         */
        setSize: function (selector, size) {
            const $container = $(selector);

            if (!$container.length || !size) return;

            // 移除所有尺寸类
            $container.removeClass('ffs-video-sm ffs-video-md ffs-video-lg ffs-video-xl');

            // 添加指定尺寸类
            $container.addClass(`ffs-video-${size}`);
        },

        /**
         * 设置视频音量
         * @param {string} selector - 视频选择器
         * @param {number} volume - 音量值 (0-1)
         */
        setVolume: function (selector, volume) {
            const $container = $(selector);
            const $video = $container.find('video')[0];
            const $volumeBar = $container.find('.ffs-video-volume-bar');
            const $volumeIcon = $container.find('.ffs-video-volume-icon i');

            if (!$video) return;

            // 确保音量在0-1之间
            volume = Math.min(1, Math.max(0, volume));

            // 设置视频音量
            $video.volume = volume;

            // 更新音量条
            if ($volumeBar.length) {
                $volumeBar.css('width', (volume * 100) + '%');
            }

            // 更新音量图标
            if ($volumeIcon.length) {
                updateVolumeIcon($volumeIcon, volume);
            }
        },

        /**
         * 启用视频预览
         * @param {string} selector - 视频选择器
         */
        enablePreview: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 添加预览类
            $container.addClass('ffs-video-preview');
        },

        /**
         * 禁用视频预览
         * @param {string} selector - 视频选择器
         */
        disablePreview: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 移除预览类
            $container.removeClass('ffs-video-preview');
        },

        /**
         * 设置视频加载状态
         * @param {string} selector - 视频选择器
         * @param {boolean} loading - 是否加载中
         */
        setLoading: function (selector, loading = true) {
            const $container = $(selector);

            if (!$container.length) return;

            if (loading) {
                $container.addClass('ffs-video-loading').removeClass('ffs-video-error');
            } else {
                $container.removeClass('ffs-video-loading');
            }
        },

        /**
         * 设置视频错误状态
         * @param {string} selector - 视频选择器
         * @param {boolean} error - 是否错误
         */
        setError: function (selector, error = true) {
            const $container = $(selector);

            if (!$container.length) return;

            if (error) {
                $container.addClass('ffs-video-error').removeClass('ffs-video-loading');
            } else {
                $container.removeClass('ffs-video-error');
            }
        },

        /**
         * 获取视频当前时间
         * @param {string} selector - 视频选择器
         * @returns {number} 当前时间（秒）
         */
        getCurrentTime: function (selector) {
            const $container = $(selector);
            const $video = $container.find('video')[0];

            if (!$video) return 0;

            return $video.currentTime;
        },

        /**
         * 设置视频当前时间
         * @param {string} selector - 视频选择器
         * @param {number} time - 时间（秒）
         */
        setCurrentTime: function (selector, time) {
            const $container = $(selector);
            const $video = $container.find('video')[0];
            const $progressBar = $container.find('.ffs-video-progress-bar');
            const $currentTime = $container.find('.ffs-video-current-time');

            if (!$video) return;

            // 设置视频当前时间
            $video.currentTime = time;

            // 更新进度条
            if ($progressBar.length && $video.duration) {
                const percent = (time / $video.duration) * 100;
                $progressBar.css('width', percent + '%');
            }

            // 更新当前时间
            if ($currentTime.length) {
                $currentTime.text(formatTime(time));
            }
        },

        /**
         * 获取视频总时长
         * @param {string} selector - 视频选择器
         * @returns {number} 总时长（秒）
         */
        getDuration: function (selector) {
            const $container = $(selector);
            const $video = $container.find('video')[0];

            if (!$video) return 0;

            return $video.duration;
        }
    };

    // 初始化视频组件
    $(function () {
        initVideoPlayer();
        initVideoUpload();
        initVideoPreview();
    });

})(jQuery);