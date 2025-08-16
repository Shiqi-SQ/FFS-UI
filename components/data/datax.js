/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * FFS UI - 数据展示组件
 * 提供统计数值、描述列表、时间轴、日历、图片预览、图片裁剪、视频播放器和代码编辑器等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化日历组件
     * 处理日历的日期选择、月份切换等功能
     */
    function initCalendar() {
        // 当前日期
        let currentDate = new Date();

        // 渲染日历
        function renderCalendar($calendar, year, month) {
            const $title = $calendar.find('.ffs-calendar-title');
            const $days = $calendar.find('.ffs-calendar-days');

            // 更新标题
            $title.text(`${year}年${month + 1}月`);

            // 清空日期容器
            $days.empty();

            // 获取当月第一天是星期几
            const firstDay = new Date(year, month, 1).getDay();

            // 获取当月天数
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // 获取上个月天数
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            // 获取今天日期
            const today = new Date();
            const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
            const currentDay = today.getDate();

            // 渲染上个月的日期
            for (let i = 0; i < firstDay; i++) {
                const day = daysInPrevMonth - firstDay + i + 1;
                $days.append(`<div class="ffs-calendar-day disabled">${day}</div>`);
            }

            // 渲染当月的日期
            for (let i = 1; i <= daysInMonth; i++) {
                let className = 'ffs-calendar-day';
                if (isCurrentMonth && i === currentDay) {
                    className += ' today';
                }

                const $day = $(`<div class="${className}">${i}</div>`);
                $days.append($day);

                // 添加点击事件
                $day.on('click', function () {
                    // 移除之前的选中状态
                    $days.find('.ffs-calendar-day').removeClass('selected');

                    // 添加选中状态
                    $(this).addClass('selected');

                    // 触发日期选择事件
                    const selectedDate = new Date(year, month, i);
                    $calendar.trigger('calendar:dateSelected', [selectedDate]);
                });
            }

            // 计算需要渲染的下个月天数
            const totalCells = 42; // 6行7列
            const remainingCells = totalCells - (firstDay + daysInMonth);

            // 渲染下个月的日期
            for (let i = 1; i <= remainingCells; i++) {
                $days.append(`<div class="ffs-calendar-day disabled">${i}</div>`);
            }
        }

        // 初始化日历
        $('.ffs-calendar').each(function () {
            const $calendar = $(this);
            const $prevBtn = $calendar.find('.ffs-calendar-nav-btn:first-child');
            const $nextBtn = $calendar.find('.ffs-calendar-nav-btn:last-child');

            // 渲染当前月份的日历
            renderCalendar($calendar, currentDate.getFullYear(), currentDate.getMonth());

            // 上个月按钮点击事件
            $prevBtn.on('click', function () {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar($calendar, currentDate.getFullYear(), currentDate.getMonth());
            });

            // 下个月按钮点击事件
            $nextBtn.on('click', function () {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar($calendar, currentDate.getFullYear(), currentDate.getMonth());
            });
        });
    }

    /**
     * 初始化图片预览组件
     * 处理图片预览、放大缩小、切换等功能
     */
    function initImagePreview() {
        // 创建预览容器
        if ($('.ffs-image-preview').length === 0) {
            $('body').append(`
                <div class="ffs-image-preview">
                    <div class="ffs-image-preview-content">
                        <img class="ffs-image-preview-img" src="" alt="预览图片">
                        <div class="ffs-image-preview-close">&times;</div>
                        <div class="ffs-image-preview-nav ffs-image-preview-prev">&lt;</div>
                        <div class="ffs-image-preview-nav ffs-image-preview-next">&gt;</div>
                    </div>
                </div>
            `);
        }

        const $preview = $('.ffs-image-preview');
        const $previewImg = $preview.find('.ffs-image-preview-img');
        const $closeBtn = $preview.find('.ffs-image-preview-close');
        const $prevBtn = $preview.find('.ffs-image-preview-prev');
        const $nextBtn = $preview.find('.ffs-image-preview-next');

        // 当前预览的图片索引
        let currentIndex = 0;
        let images = [];

        // 显示预览
        function showPreview(src, imgList, index) {
            $previewImg.attr('src', src);
            $preview.addClass('show');

            // 保存图片列表和当前索引
            images = imgList;
            currentIndex = index;

            // 如果只有一张图片，隐藏导航按钮
            if (images.length <= 1) {
                $prevBtn.hide();
                $nextBtn.hide();
            } else {
                $prevBtn.show();
                $nextBtn.show();
            }
        }

        // 关闭预览
        function closePreview() {
            $preview.removeClass('show');
        }

        // 上一张图片
        function prevImage() {
            if (images.length <= 1) return;

            currentIndex = (currentIndex - 1 + images.length) % images.length;
            $previewImg.attr('src', images[currentIndex]);
        }

        // 下一张图片
        function nextImage() {
            if (images.length <= 1) return;

            currentIndex = (currentIndex + 1) % images.length;
            $previewImg.attr('src', images[currentIndex]);
        }

        // 绑定关闭按钮事件
        $closeBtn.on('click', closePreview);

        // 绑定导航按钮事件
        $prevBtn.on('click', prevImage);
        $nextBtn.on('click', nextImage);

        // 绑定键盘事件
        $(document).on('keydown', function (e) {
            if (!$preview.hasClass('show')) return;

            switch (e.keyCode) {
                case 27: // ESC
                    closePreview();
                    break;
                case 37: // 左箭头
                    prevImage();
                    break;
                case 39: // 右箭头
                    nextImage();
                    break;
            }
        });

        // 为带有 data-preview 属性的图片添加预览功能
        $(document).on('click', 'img[data-preview]', function () {
            const $img = $(this);
            const src = $img.attr('src');

            // 查找同组的所有图片
            const group = $img.data('preview-group') || 'default';
            const $groupImages = $(`img[data-preview][data-preview-group="${group}"]`);

            // 收集图片URL
            const imgList = $groupImages.map(function () {
                return $(this).attr('src');
            }).get();

            // 找到当前图片的索引
            const index = imgList.indexOf(src);

            // 显示预览
            showPreview(src, imgList, index);
        });
    }

    /**
     * 初始化图片裁剪组件
     * 处理图片裁剪区域的拖拽和调整大小
     */
    function initImageCrop() {
        $('.ffs-image-crop').each(function () {
            const $crop = $(this);
            const $container = $crop.find('.ffs-image-crop-container');
            const $image = $crop.find('.ffs-image-crop-image');
            const $area = $crop.find('.ffs-image-crop-area');
            const $handles = $crop.find('.ffs-image-crop-handle');

            let isDragging = false;
            let isResizing = false;
            let currentHandle = null;
            let startX, startY, startWidth, startHeight, startLeft, startTop;

            // 初始化裁剪区域
            function initCropArea() {
                const containerWidth = $container.width();
                const containerHeight = $container.height();

                // 默认裁剪区域为容器的80%
                const areaWidth = containerWidth * 0.8;
                const areaHeight = containerHeight * 0.8;

                // 居中放置裁剪区域
                const areaLeft = (containerWidth - areaWidth) / 2;
                const areaTop = (containerHeight - areaHeight) / 2;

                // 设置裁剪区域位置和大小
                $area.css({
                    left: areaLeft + 'px',
                    top: areaTop + 'px',
                    width: areaWidth + 'px',
                    height: areaHeight + 'px'
                });
            }

            // 初始化裁剪区域
            initCropArea();

            // 拖拽开始
            $area.on('mousedown', function (e) {
                if ($(e.target).hasClass('ffs-image-crop-handle')) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt($area.css('left'));
                startTop = parseInt($area.css('top'));

                e.preventDefault();
            });

            // 调整大小开始
            $handles.on('mousedown', function (e) {
                isResizing = true;
                currentHandle = $(this);
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt($area.css('width'));
                startHeight = parseInt($area.css('height'));
                startLeft = parseInt($area.css('left'));
                startTop = parseInt($area.css('top'));

                e.preventDefault();
                e.stopPropagation();
            });

            // 鼠标移动
            $(document).on('mousemove', function (e) {
                if (isDragging) {
                    // 计算新位置
                    const newLeft = startLeft + e.clientX - startX;
                    const newTop = startTop + e.clientY - startY;

                    // 限制在容器内
                    const maxLeft = $container.width() - $area.width();
                    const maxTop = $container.height() - $area.height();

                    // 设置新位置
                    $area.css({
                        left: Math.max(0, Math.min(newLeft, maxLeft)) + 'px',
                        top: Math.max(0, Math.min(newTop, maxTop)) + 'px'
                    });
                } else if (isResizing && currentHandle) {
                    // 获取调整方向
                    const isNW = currentHandle.hasClass('nw');
                    const isNE = currentHandle.hasClass('ne');
                    const isSW = currentHandle.hasClass('sw');
                    const isSE = currentHandle.hasClass('se');

                    // 计算宽度和高度变化
                    let newWidth = startWidth;
                    let newHeight = startHeight;
                    let newLeft = startLeft;
                    let newTop = startTop;

                    // 根据不同的调整柄计算新的尺寸和位置
                    if (isNW || isSW) {
                        newWidth = startWidth - (e.clientX - startX);
                        newLeft = startLeft + (e.clientX - startX);
                    } else {
                        newWidth = startWidth + (e.clientX - startX);
                    }

                    if (isNW || isNE) {
                        newHeight = startHeight - (e.clientY - startY);
                        newTop = startTop + (e.clientY - startY);
                    } else {
                        newHeight = startHeight + (e.clientY - startY);
                    }

                    // 限制最小尺寸
                    const minSize = 50;
                    if (newWidth < minSize) {
                        newWidth = minSize;
                        newLeft = isNW || isSW ? startLeft + startWidth - minSize : startLeft;
                    }

                    if (newHeight < minSize) {
                        newHeight = minSize;
                        newTop = isNW || isNE ? startTop + startHeight - minSize : startTop;
                    }

                    // 限制最大尺寸
                    const maxWidth = $container.width();
                    const maxHeight = $container.height();

                    if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                    }

                    if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                    }

                    // 设置新尺寸和位置
                    $area.css({
                        width: newWidth + 'px',
                        height: newHeight + 'px',
                        left: newLeft + 'px',
                        top: newTop + 'px'
                    });
                }
            });

            // 鼠标释放
            $(document).on('mouseup', function () {
                isDragging = false;
                isResizing = false;
                currentHandle = null;
            });

            // 获取裁剪数据
            $crop.on('getCropData', function (e, callback) {
                const areaPos = $area.position();
                const areaWidth = $area.width();
                const areaHeight = $area.height();
                const imagePos = $image.position();
                const imageWidth = $image.width();
                const imageHeight = $image.height();

                // 计算裁剪区域相对于图片的位置和尺寸
                const cropData = {
                    x: (areaPos.left - imagePos.left) / imageWidth,
                    y: (areaPos.top - imagePos.top) / imageHeight,
                    width: areaWidth / imageWidth,
                    height: areaHeight / imageHeight
                };

                if (typeof callback === 'function') {
                    callback(cropData);
                }

                return cropData;
            });
        });
    }

    /**
     * 初始化视频播放器组件
     * 处理视频播放、暂停、进度条等功能
     */
    function initVideoPlayer() {
        $('.ffs-video-player').each(function () {
            const $player = $(this);
            const $video = $player.find('video');
            const $controls = $player.find('.ffs-video-controls');
            const $playBtn = $player.find('.ffs-video-play');
            const $pauseBtn = $player.find('.ffs-video-pause');
            const $progress = $player.find('.ffs-video-progress');
            const $progressBar = $player.find('.ffs-video-progress-bar');
            const $currentTime = $player.find('.ffs-video-current-time');
            const $duration = $player.find('.ffs-video-duration');
            const $fullscreenBtn = $player.find('.ffs-video-fullscreen');
            const $volumeBtn = $player.find('.ffs-video-volume');
            const $volumeSlider = $player.find('.ffs-video-volume-slider');

            // 视频元素
            const video = $video[0];

            // 初始化控制按钮状态
            $pauseBtn.hide();

            // 格式化时间
            function formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                seconds = Math.floor(seconds % 60);
                return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }

            // 更新进度条
            function updateProgress() {
                const progress = (video.currentTime / video.duration) * 100;
                $progressBar.css('width', `${progress}%`);
                $currentTime.text(formatTime(video.currentTime));
            }

            // 播放视频
            function playVideo() {
                video.play();
                $playBtn.hide();
                $pauseBtn.show();
            }

            // 暂停视频
            function pauseVideo() {
                video.pause();
                $pauseBtn.hide();
                $playBtn.show();
            }

            // 切换全屏
            function toggleFullscreen() {
                if (!document.fullscreenElement) {
                    $player[0].requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }

            // 视频加载完成
            $video.on('loadedmetadata', function () {
                $duration.text(formatTime(video.duration));
            });

            // 视频播放时更新进度
            $video.on('timeupdate', updateProgress);

            // 视频结束时重置
            $video.on('ended', function () {
                pauseVideo();
                video.currentTime = 0;
                updateProgress();
            });

            // 播放按钮点击事件
            $playBtn.on('click', playVideo);

            // 暂停按钮点击事件
            $pauseBtn.on('click', pauseVideo);

            // 进度条点击事件
            $progress.on('click', function (e) {
                const progressWidth = $progress.width();
                const clickPosition = e.offsetX;
                const seekTime = (clickPosition / progressWidth) * video.duration;

                video.currentTime = seekTime;
            });

            // 全屏按钮点击事件
            $fullscreenBtn.on('click', toggleFullscreen);

            // 音量按钮点击事件
            $volumeBtn.on('click', function () {
                $volumeSlider.toggle();
            });

            // 音量滑块事件
            $volumeSlider.on('input', function () {
                const volume = $(this).val() / 100;
                video.volume = volume;

                // 更新音量图标
                if (volume === 0) {
                    $volumeBtn.addClass('muted');
                } else {
                    $volumeBtn.removeClass('muted');
                }
            });

            // 点击视频切换播放/暂停
            $video.on('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    pauseVideo();
                }
            });

            // 键盘控制
            $(document).on('keydown', function (e) {
                // 只有当视频播放器在视口内时才响应键盘事件
                const rect = $player[0].getBoundingClientRect();
                const isInViewport = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.right <= window.innerWidth
                );

                if (!isInViewport) return;

                switch (e.keyCode) {
                    case 32: // 空格键
                        e.preventDefault();
                        if (video.paused) {
                            playVideo();
                        } else {
                            pauseVideo();
                        }
                        break;
                    case 37: // 左箭头
                        video.currentTime = Math.max(0, video.currentTime - 5);
                        break;
                    case 39: // 右箭头
                        video.currentTime = Math.min(video.duration, video.currentTime + 5);
                        break;
                    case 38: // 上箭头
                        e.preventDefault();
                        video.volume = Math.min(1, video.volume + 0.1);
                        $volumeSlider.val(video.volume * 100);
                        break;
                    case 40: // 下箭头
                        e.preventDefault();
                        video.volume = Math.max(0, video.volume - 0.1);
                        $volumeSlider.val(video.volume * 100);
                        break;
                    case 70: // F键
                        toggleFullscreen();
                        break;
                }
            });
        });
    }

    /**
     * 初始化代码编辑器组件
     * 处理代码高亮、行号显示等功能
     */
    function initCodeEditor() {
        $('.ffs-code-editor').each(function () {
            const $editor = $(this);
            const $textarea = $editor.find('textarea');
            const $preview = $editor.find('.ffs-code-editor-preview');
            const $lineNumbers = $editor.find('.ffs-code-editor-line-numbers');

            // 更新行号
            function updateLineNumbers() {
                const text = $textarea.val();
                const lines = text.split('\n');
                const lineCount = lines.length;

                $lineNumbers.empty();

                for (let i = 1; i <= lineCount; i++) {
                    $lineNumbers.append(`<div class="ffs-code-editor-line-number">${i}</div>`);
                }
            }

            // 更新预览
            function updatePreview() {
                const text = $textarea.val();

                // 简单的语法高亮处理
                let html = text
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/(".*?")/g, '<span class="ffs-code-string">$1</span>')
                    .replace(/(\/\/.*)/g, '<span class="ffs-code-comment">$1</span>')
                    .replace(/\b(function|return|if|else|for|while|var|let|const|class|import|export|from|async|await)\b/g, '<span class="ffs-code-keyword">$1</span>');

                $preview.html(html);
            }

            // 同步滚动
            function syncScroll() {
                const scrollTop = $textarea.scrollTop();
                $preview.scrollTop(scrollTop);
                $lineNumbers.scrollTop(scrollTop);
            }

            // 初始化
            updateLineNumbers();
            updatePreview();

            // 文本变化时更新
            $textarea.on('input', function () {
                updateLineNumbers();
                updatePreview();
            });

            // 滚动时同步
            $textarea.on('scroll', syncScroll);

            // Tab键处理
            $textarea.on('keydown', function (e) {
                if (e.keyCode === 9) { // Tab键
                    e.preventDefault();

                    const start = this.selectionStart;
                    const end = this.selectionEnd;
                    const value = $textarea.val();

                    // 插入制表符
                    $textarea.val(value.substring(0, start) + '    ' + value.substring(end));

                    // 恢复光标位置
                    this.selectionStart = this.selectionEnd = start + 4;

                    // 更新预览
                    updatePreview();
                    updateLineNumbers();
                }
            });
        });
    }

    /**
     * 初始化所有数据展示组件
     */
    function initAllDataComponents() {
        initCalendar();
        initImagePreview();
        initImageCrop();
        initVideoPlayer();
        initCodeEditor();
    }

    // 在文档加载完成后初始化
    $(document).ready(function () {
        initAllDataComponents();
    });

    // 导出公共API
    return {
        initCalendar: initCalendar,
        initImagePreview: initImagePreview,
        initImageCrop: initImageCrop,
        initVideoPlayer: initVideoPlayer,
        initCodeEditor: initCodeEditor,
        initAllDataComponents: initAllDataComponents
    };
})(jQuery);