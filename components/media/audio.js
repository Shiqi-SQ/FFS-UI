/**
 * FFS UI - 音频组件
 * 提供音频播放、录制、波形显示和语音识别等功能
 */
(function($) {
    'use strict';

    /**
     * 音频播放器控制
     * 处理音频播放、暂停、进度和音量控制
     */
    function initAudioPlayer() {
        // 播放/暂停控制
        $(document).on('click', '.ffs-audio-play', function() {
            const $button = $(this);
            const $audio = $button.closest('.ffs-audio').find('audio')[0];
            
            if (!$audio) return;
            
            if ($audio.paused) {
                // 暂停所有其他音频
                $('audio').each(function() {
                    if (this !== $audio && !this.paused) {
                        this.pause();
                        $(this).closest('.ffs-audio').find('.ffs-audio-play i')
                            .removeClass('fa-pause')
                            .addClass('fa-play');
                    }
                });
                
                // 播放当前音频
                $audio.play();
                $button.find('i')
                    .removeClass('fa-play')
                    .addClass('fa-pause');
            } else {
                // 暂停当前音频
                $audio.pause();
                $button.find('i')
                    .removeClass('fa-pause')
                    .addClass('fa-play');
            }
        });
        
        // 进度条更新
        $(document).on('timeupdate', 'audio', function() {
            const $audio = $(this);
            const $container = $audio.closest('.ffs-audio');
            const $progressBar = $container.find('.ffs-audio-progress-bar');
            const $currentTime = $container.find('.current-time');
            const $duration = $container.find('.duration');
            
            // 更新进度条
            const percent = ($audio[0].currentTime / $audio[0].duration) * 100 || 0;
            $progressBar.css('width', percent + '%');
            
            // 更新时间显示
            $currentTime.text(formatTime($audio[0].currentTime));
            $duration.text(formatTime($audio[0].duration));
        });
        
        // 进度条点击跳转
        $(document).on('click', '.ffs-audio-progress', function(e) {
            const $progress = $(this);
            const $audio = $progress.closest('.ffs-audio').find('audio')[0];
            
            if (!$audio) return;
            
            // 计算点击位置对应的时间
            const offset = $progress.offset();
            const width = $progress.width();
            const clickX = e.pageX - offset.left;
            const percent = clickX / width;
            const seekTime = percent * $audio.duration;
            
            // 设置播放时间
            $audio.currentTime = seekTime;
        });
        
        // 音量控制
        $(document).on('click', '.ffs-audio-volume-slider', function(e) {
            const $slider = $(this);
            const $audio = $slider.closest('.ffs-audio').find('audio')[0];
            const $volumeBar = $slider.find('.ffs-audio-volume-bar');
            const $volumeIcon = $slider.prev('i');
            
            if (!$audio) return;
            
            // 计算点击位置对应的音量
            const offset = $slider.offset();
            const width = $slider.width();
            const clickX = e.pageX - offset.left;
            const volume = Math.max(0, Math.min(1, clickX / width));
            
            // 设置音量
            $audio.volume = volume;
            $volumeBar.css('width', (volume * 100) + '%');
            
            // 更新音量图标
            updateVolumeIcon($volumeIcon, volume);
        });
        
        // 音量图标点击静音/取消静音
        $(document).on('click', '.ffs-audio-volume i', function() {
            const $icon = $(this);
            const $audio = $icon.closest('.ffs-audio').find('audio')[0];
            const $volumeBar = $icon.next('.ffs-audio-volume-slider').find('.ffs-audio-volume-bar');
            
            if (!$audio) return;
            
            if ($audio.volume > 0) {
                // 保存当前音量并静音
                $audio.dataset.prevVolume = $audio.volume;
                $audio.volume = 0;
                $volumeBar.css('width', '0%');
                $icon.removeClass('fa-volume-up fa-volume-down').addClass('fa-volume-mute');
            } else {
                // 恢复之前的音量
                const prevVolume = parseFloat($audio.dataset.prevVolume || 1);
                $audio.volume = prevVolume;
                $volumeBar.css('width', (prevVolume * 100) + '%');
                updateVolumeIcon($icon, prevVolume);
            }
        });
        
        // 音频加载完成时初始化
        $(document).on('loadedmetadata', 'audio', function() {
            const $audio = $(this);
            const $container = $audio.closest('.ffs-audio');
            const $duration = $container.find('.duration');
            
            // 设置总时长
            $duration.text(formatTime($audio[0].duration));
        });
        
        // 音频播放结束时重置
        $(document).on('ended', 'audio', function() {
            const $audio = $(this);
            const $container = $audio.closest('.ffs-audio');
            const $playButton = $container.find('.ffs-audio-play i');
            
            // 重置播放按钮
            $playButton.removeClass('fa-pause').addClass('fa-play');
            
            // 重置进度条
            $container.find('.ffs-audio-progress-bar').css('width', '0%');
            $container.find('.current-time').text('00:00');
        });
    }
    
    /**
     * 音频录制功能
     * 处理音频录制、波形显示和录音列表
     */
    function initAudioRecorder() {
        let mediaRecorder = null;
        let audioChunks = [];
        let audioStream = null;
        let analyser = null;
        let animationFrame = null;
        
        // 录制按钮点击
        $(document).on('click', '.ffs-audio-record', function() {
            const $button = $(this);
            const $container = $button.closest('.ffs-audio');
            const $waveform = $container.find('.ffs-audio-waveform canvas')[0];
            
            if (!$button.hasClass('recording')) {
                // 开始录制
                startRecording($button, $waveform);
            } else {
                // 停止录制
                stopRecording($button, $container);
            }
        });
        
        // 开始录制
        function startRecording($button, waveformCanvas) {
            // 请求麦克风权限
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(stream) {
                    audioStream = stream;
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    
                    // 收集录音数据
                    mediaRecorder.ondataavailable = function(e) {
                        audioChunks.push(e.data);
                    };
                    
                    // 录音结束处理
                    mediaRecorder.onstop = function() {
                        // 清理资源
                        if (audioStream) {
                            audioStream.getTracks().forEach(track => track.stop());
                            audioStream = null;
                        }
                        
                        if (animationFrame) {
                            cancelAnimationFrame(animationFrame);
                            animationFrame = null;
                        }
                    };
                    
                    // 开始录制
                    mediaRecorder.start();
                    $button.addClass('recording');
                    $button.find('i').removeClass('fa-microphone').addClass('fa-stop');
                    
                    // 设置波形显示
                    if (waveformCanvas) {
                        setupWaveform(stream, waveformCanvas);
                    }
                })
                .catch(function(err) {
                    console.error('获取麦克风权限失败:', err);
                    alert('无法访问麦克风，请确保已授予权限。');
                });
        }
        
        // 停止录制
        function stopRecording($button, $container) {
            if (!mediaRecorder) return;
            
            // 停止录制
            mediaRecorder.stop();
            $button.removeClass('recording');
            $button.find('i').removeClass('fa-stop').addClass('fa-microphone');
            
            // 处理录音数据
            setTimeout(function() {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // 添加到录音列表
                addRecordingToList($container, audioUrl);
            }, 100);
        }
        
        // 设置波形显示
        function setupWaveform(stream, canvas) {
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            
            analyser.fftSize = 256;
            source.connect(analyser);
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制波形
            function drawWaveform() {
                animationFrame = requestAnimationFrame(drawWaveform);
                
                analyser.getByteFrequencyData(dataArray);
                
                ctx.fillStyle = 'var(--background-color)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = dataArray[i] / 255 * canvas.height;
                    
                    ctx.fillStyle = `var(--primary-color)`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    
                    x += barWidth + 1;
                }
            }
            
            drawWaveform();
        }
        
        // 添加录音到列表
        function addRecordingToList($container, audioUrl) {
            const $list = $container.find('.ffs-audio-list');
            const timestamp = new Date().toLocaleTimeString();
            
            // 创建录音项
            const $item = $(`
                <div class="ffs-audio-list-item">
                    <div class="ffs-audio-info">
                        <div class="ffs-audio-title">录音 ${timestamp}</div>
                    </div>
                    <audio src="${audioUrl}"></audio>
                </div>
            `);
            
            // 点击播放录音
            $item.on('click', function() {
                const audio = $(this).find('audio')[0];
                
                // 暂停其他所有音频
                $('audio').each(function() {
                    if (this !== audio && !this.paused) {
                        this.pause();
                    }
                });
                
                // 播放/暂停当前录音
                if (audio.paused) {
                    audio.play();
                    $(this).addClass('active');
                } else {
                    audio.pause();
                    $(this).removeClass('active');
                }
            });
            
            // 音频播放结束时移除活动状态
            $item.find('audio').on('ended', function() {
                $item.removeClass('active');
            });
            
            // 添加到列表
            $list.prepend($item);
        }
    }
    
    /**
     * 语音识别功能
     * 处理语音输入和转文字
     */
    function initSpeechRecognition() {
        // 检查浏览器是否支持语音识别
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('当前浏览器不支持语音识别功能');
            return;
        }
        
        let recognition = null;
        
        // 语音按钮点击
        $(document).on('click', '.ffs-audio-speech-button', function() {
            const $button = $(this);
            const $container = $button.closest('.ffs-audio');
            const $input = $container.find('.ffs-audio-speech-input');
            
            if (!$button.hasClass('listening')) {
                // 开始语音识别
                startSpeechRecognition($button, $input);
            } else {
                // 停止语音识别
                stopSpeechRecognition($button);
            }
        });
        
        // 开始语音识别
        function startSpeechRecognition($button, $input) {
            recognition = new SpeechRecognition();
            recognition.lang = 'zh-CN'; // 设置语言为中文
            recognition.continuous = true;
            recognition.interimResults = true;
            
            // 识别结果处理
            recognition.onresult = function(event) {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // 更新输入框
                if (finalTranscript) {
                    $input.val(finalTranscript);
                } else {
                    $input.val(interimTranscript);
                }
            };
            
            // 错误处理
            recognition.onerror = function(event) {
                console.error('语音识别错误:', event.error);
                stopSpeechRecognition($button);
            };
            
            // 识别结束处理
            recognition.onend = function() {
                stopSpeechRecognition($button);
            };
            
            // 开始识别
            recognition.start();
            $button.addClass('listening');
            $button.find('i').removeClass('fa-microphone').addClass('fa-stop');
        }
        
        // 停止语音识别
        function stopSpeechRecognition($button) {
            if (!recognition) return;
            
            // 停止识别
            try {
                recognition.stop();
            } catch (e) {
                console.error('停止语音识别错误:', e);
            }
            
            recognition = null;
            $button.removeClass('listening');
            $button.find('i').removeClass('fa-stop').addClass('fa-microphone');
        }
    }
    
    /**
     * 音频波形可视化
     * 处理音频文件的波形显示
     */
    function initAudioWaveform() {
        // 初始化已有的波形显示
        $('.ffs-audio-waveform').each(function() {
            const $waveform = $(this);
            const $audio = $waveform.closest('.ffs-audio').find('audio')[0];
            
            if (!$audio || !$waveform.find('canvas').length) return;
            
            // 创建画布
            const canvas = document.createElement('canvas');
            canvas.width = $waveform.width();
            canvas.height = $waveform.height();
            $waveform.append(canvas);
            
            // 加载音频后生成波形
            $audio.addEventListener('loadedmetadata', function() {
                generateWaveform($audio, canvas);
            });
            
            // 如果音频已加载，直接生成波形
            if ($audio.readyState >= 2) {
                generateWaveform($audio, canvas);
            }
        });
        
        // 生成音频波形
        function generateWaveform(audio, canvas) {
            if (!audio.src || !canvas) return;
            
            const ctx = canvas.getContext('2d');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 获取音频数据
            fetch(audio.src)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    // 获取音频数据
                    const data = audioBuffer.getChannelData(0);
                    const step = Math.ceil(data.length / canvas.width);
                    const amp = canvas.height / 2;
                    
                    ctx.fillStyle = 'var(--background-color)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.beginPath();
                    ctx.moveTo(0, amp);
                    
                    // 绘制波形
                    for (let i = 0; i < canvas.width; i++) {
                        let min = 1.0;
                        let max = -1.0;
                        
                        for (let j = 0; j < step; j++) {
                            const datum = data[(i * step) + j];
                            if (datum < min) min = datum;
                            if (datum > max) max = datum;
                        }
                        
                        ctx.fillStyle = 'var(--primary-color)';
                        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
                    }
                })
                .catch(err => {
                    console.error('波形生成错误:', err);
                });
        }
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
     * 音频组件API
     * 提供操作音频的公共方法
     */
    $.ffsAudio = {
        /**
         * 创建音频播放器
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        create: function(selector, options = {}) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 默认配置
            const defaults = {
                src: '',
                title: '未知音频',
                artist: '未知艺术家',
                autoplay: false,
                controls: true,
                waveform: false
            };
            
            // 合并配置
            const settings = $.extend({}, defaults, options);
            
            // 创建音频播放器
            const $audio = $(`
                <div class="ffs-audio">
                    <div class="ffs-audio-player">
                        <button class="ffs-audio-play">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="ffs-audio-info">
                            <div class="ffs-audio-title">${settings.title}</div>
                            <div class="ffs-audio-artist">${settings.artist}</div>
                        </div>
                    </div>
                    <div class="ffs-audio-progress">
                        <div class="ffs-audio-progress-bar"></div>
                    </div>
                    <div class="ffs-audio-time">
                        <span class="current-time">00:00</span>
                        <span class="duration">00:00</span>
                    </div>
                    <div class="ffs-audio-volume">
                        <i class="fas fa-volume-up"></i>
                        <div class="ffs-audio-volume-slider">
                            <div class="ffs-audio-volume-bar"></div>
                        </div>
                    </div>
                    <audio src="${settings.src}" ${settings.autoplay ? 'autoplay' : ''} ${settings.controls ? 'controls' : ''}></audio>
                </div>
            `);
            
            // 如果需要波形显示
            if (settings.waveform) {
                const $waveform = $('<div class="ffs-audio-waveform"><canvas></canvas></div>');
                $audio.find('.ffs-audio-time').after($waveform);
            }
            
            // 添加到容器
            $container.append($audio);
            
            // 隐藏原生控件
            $audio.find('audio').css('display', 'none');
            
            return $audio;
        },
        
        /**
         * 创建音频录制器
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createRecorder: function(selector, options = {}) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 默认配置
            const defaults = {
                waveform: true,
                list: true
            };
            
            // 合并配置
            const settings = $.extend({}, defaults, options);
            
            // 创建音频录制器
            let $recorder = $(`
                <div class="ffs-audio">
                    <div class="ffs-audio-recorder">
                        <button class="ffs-audio-record">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <div class="ffs-audio-info">
                            <div class="ffs-audio-title">点击录制音频</div>
                        </div>
                    </div>
            `);
            
            // 如果需要波形显示
            if (settings.waveform) {
                $recorder.append('<div class="ffs-audio-waveform"><canvas></canvas></div>');
            }
            
            // 如果需要录音列表
            if (settings.list) {
                $recorder.append('<div class="ffs-audio-list"></div>');
            }
            
            // 完成录音器
            $recorder.append('</div>');
            
            // 添加到容器
            $container.append($recorder);
            
            return $recorder;
        },
        
        /**
         * 创建语音识别
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        createSpeech: function(selector, options = {}) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 默认配置
            const defaults = {
                placeholder: '点击麦克风开始语音输入...'
            };
            
            // 合并配置
            const settings = $.extend({}, defaults, options);
            
            // 创建语音识别
            const $speech = $(`
                <div class="ffs-audio">
                    <div class="ffs-audio-speech">
                        <input type="text" class="ffs-audio-speech-input" placeholder="${settings.placeholder}">
                        <button class="ffs-audio-speech-button">
                            <i class="fas fa-microphone"></i>
                        </button>
                    </div>
                </div>
            `);
            
            // 添加到容器
            $container.append($speech);
            
            return $speech;
        },
        
        /**
         * 播放音频
         * @param {string} selector - 音频选择器
         */
        play: function(selector) {
            const $container = $(selector);
            const $audio = $container.find('audio')[0];
            const $button = $container.find('.ffs-audio-play');
            
            if (!$audio) return;
            
            // 播放音频
            $audio.play();
            $button.find('i').removeClass('fa-play').addClass('fa-pause');
        },
        
        /**
         * 暂停音频
         * @param {string} selector - 音频选择器
         */
        pause: function(selector) {
            const $container = $(selector);
            const $audio = $container.find('audio')[0];
            const $button = $container.find('.ffs-audio-play');
            
            if (!$audio) return;
            
            // 暂停音频
            $audio.pause();
            $button.find('i').removeClass('fa-pause').addClass('fa-play');
        },
        
        /**
         * 设置音频源
         * @param {string} selector - 音频选择器
         * @param {string} src - 音频源URL
         */
        setSource: function(selector, src) {
            const $container = $(selector);
            const $audio = $container.find('audio');
            
            if (!$audio.length || !src) return;
            
            // 设置音频源
            $audio.attr('src', src);
            
            // 重置进度条和时间
            $container.find('.ffs-audio-progress-bar').css('width', '0%');
            $container.find('.current-time').text('00:00');
            $container.find('.duration').text('00:00');
            
            // 重置播放按钮
            $container.find('.ffs-audio-play i').removeClass('fa-pause').addClass('fa-play');
        },
        
        /**
         * 设置音频信息
         * @param {string} selector - 音频选择器
         * @param {object} info - 音频信息
         */
        setInfo: function(selector, info = {}) {
            const $container = $(selector);
            
            if (!$container.length) return;
            
            // 设置标题
            if (info.title) {
                $container.find('.ffs-audio-title').text(info.title);
            }
            
            // 设置艺术家
            if (info.artist) {
                $container.find('.ffs-audio-artist').text(info.artist);
            }
        }
    };
    
    // 初始化音频组件
    $(function() {
        initAudioPlayer();
        initAudioRecorder();
        initSpeechRecognition();
        initAudioWaveform();
    });

})(jQuery);