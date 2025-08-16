/**
 * FFS UI - 文件组件
 * 提供文件预览、文件转换和文件操作等功能
 */
(function($) {
    'use strict';

    /**
     * 初始化文件预览
     * 为带有 ffs-file-preview 类的容器添加文件预览功能
     */
    function initFilePreview() {
        // 处理文件预览切换
        $(document).on('click', '.ffs-file-preview-tab', function() {
            const $tab = $(this);
            const $container = $tab.closest('.ffs-file-preview');
            const target = $tab.data('target');
            
            // 切换标签激活状态
            $container.find('.ffs-file-preview-tab').removeClass('active');
            $tab.addClass('active');
            
            // 切换内容显示
            $container.find('.ffs-file-preview-content > div').hide();
            $container.find(target).show();
            
            // 触发预览切换事件
            $container.trigger('file:preview-change', [target]);
        });
        
        // 处理文件预览缩放
        $(document).on('click', '.ffs-file-preview-zoom-in', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-file-preview');
            const $image = $container.find('.ffs-file-preview-image');
            
            if ($image.length) {
                const currentScale = parseFloat($image.data('scale') || 1);
                const newScale = currentScale + 0.1;
                
                $image.css('transform', `scale(${newScale})`);
                $image.data('scale', newScale);
                
                // 触发缩放事件
                $container.trigger('file:preview-zoom', [newScale]);
            }
        });
        
        // 处理文件预览缩小
        $(document).on('click', '.ffs-file-preview-zoom-out', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-file-preview');
            const $image = $container.find('.ffs-file-preview-image');
            
            if ($image.length) {
                const currentScale = parseFloat($image.data('scale') || 1);
                const newScale = Math.max(0.5, currentScale - 0.1);
                
                $image.css('transform', `scale(${newScale})`);
                $image.data('scale', newScale);
                
                // 触发缩放事件
                $container.trigger('file:preview-zoom', [newScale]);
            }
        });
        
        // 处理文件预览重置
        $(document).on('click', '.ffs-file-preview-reset', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-file-preview');
            const $image = $container.find('.ffs-file-preview-image');
            
            if ($image.length) {
                $image.css('transform', 'scale(1)');
                $image.data('scale', 1);
                
                // 触发重置事件
                $container.trigger('file:preview-reset');
            }
        });
        
        // 处理文件预览下载
        $(document).on('click', '.ffs-file-preview-download', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-file-preview');
            const fileUrl = $container.data('file-url');
            const fileName = $container.data('file-name') || 'download';
            
            if (fileUrl) {
                // 创建下载链接
                const $link = $('<a></a>')
                    .attr('href', fileUrl)
                    .attr('download', fileName)
                    .attr('target', '_blank')
                    .hide();
                
                // 添加到文档并触发点击
                $('body').append($link);
                $link[0].click();
                $link.remove();
                
                // 触发下载事件
                $container.trigger('file:preview-download', [fileUrl, fileName]);
            }
        });
        
        // 处理文件预览打印
        $(document).on('click', '.ffs-file-preview-print', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-file-preview');
            const $content = $container.find('.ffs-file-preview-content');
            
            // 创建打印窗口
            const printWindow = window.open('', '_blank');
            const $printContent = $content.clone();
            
            // 添加打印样式
            $printContent.find('*').css({
                'font-family': 'Arial, sans-serif',
                'color': '#000'
            });
            
            // 设置打印内容
            printWindow.document.write(`
                <html>
                <head>
                    <title>打印预览</title>
                    <style>
                        body { margin: 0; padding: 20px; }
                        img { max-width: 100%; }
                    </style>
                </head>
                <body>
                    ${$printContent.html()}
                </body>
                </html>
            `);
            
            // 关闭文档并打印
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
                printWindow.close();
            };
            
            // 触发打印事件
            $container.trigger('file:preview-print');
        });
    }
    
    /**
     * 初始化文件转换
     * 为带有 ffs-file-convert 类的容器添加文件转换功能
     */
    function initFileConvert() {
        // 处理文件格式选择
        $(document).on('change', '.ffs-file-convert-format', function() {
            const $select = $(this);
            const $container = $select.closest('.ffs-file-convert');
            const format = $select.val();
            
            // 更新转换按钮状态
            const $convertBtn = $container.find('.ffs-file-convert-btn');
            if (format) {
                $convertBtn.prop('disabled', false);
            } else {
                $convertBtn.prop('disabled', true);
            }
            
            // 触发格式选择事件
            $container.trigger('file:convert-format-change', [format]);
        });
        
        // 处理文件转换
        $(document).on('click', '.ffs-file-convert-btn:not(:disabled)', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-file-convert');
            const $formatSelect = $container.find('.ffs-file-convert-format');
            const format = $formatSelect.val();
            const sourceFile = $container.data('source-file');
            
            if (format && sourceFile) {
                // 显示加载状态
                $btn.prop('disabled', true);
                $btn.html('<i class="fas fa-spinner fa-spin"></i> 转换中...');
                
                // 触发转换开始事件
                $container.trigger('file:convert-start', [sourceFile, format]);
                
                // 模拟转换过程
                setTimeout(function() {
                    // 恢复按钮状态
                    $btn.prop('disabled', false);
                    $btn.html('转换');
                    
                    // 创建转换结果项
                    const $resultItem = $(`
                        <div class="ffs-file-convert-item">
                            <div class="ffs-file-convert-info">
                                <i class="fas fa-file"></i>
                                <span>${sourceFile.split('/').pop().split('.')[0]}.${format}</span>
                            </div>
                            <div class="ffs-file-convert-actions">
                                <button class="ffs-file-convert-download">下载</button>
                                <button class="ffs-file-convert-delete">删除</button>
                            </div>
                        </div>
                    `);
                    
                    // 添加到结果列表
                    const $resultList = $container.find('.ffs-file-convert-results');
                    $resultList.append($resultItem);
                    
                    // 触发转换完成事件
                    $container.trigger('file:convert-complete', [sourceFile, format, $resultItem]);
                }, 2000);
            }
        });
        
        // 处理转换结果下载
        $(document).on('click', '.ffs-file-convert-download', function() {
            const $btn = $(this);
            const $item = $btn.closest('.ffs-file-convert-item');
            const $container = $btn.closest('.ffs-file-convert');
            const fileName = $item.find('span').text();
            
            // 触发下载事件
            $container.trigger('file:convert-download', [fileName, $item]);
            
            // 这里应该有实际的下载逻辑，这里只是模拟
            alert(`下载文件: ${fileName}`);
        });
        
        // 处理转换结果删除
        $(document).on('click', '.ffs-file-convert-delete', function() {
            const $btn = $(this);
            const $item = $btn.closest('.ffs-file-convert-item');
            const $container = $btn.closest('.ffs-file-convert');
            const fileName = $item.find('span').text();
            
            // 触发删除事件
            $container.trigger('file:convert-delete', [fileName, $item]);
            
            // 删除结果项
            $item.fadeOut(300, function() {
                $(this).remove();
            });
        });
    }
    
    /**
     * 初始化文件上传
     * 为带有 ffs-file-upload 类的容器添加文件上传功能
     */
    function initFileUpload() {
        // 处理文件选择
        $(document).on('change', '.ffs-file-upload input[type="file"]', function() {
            const $input = $(this);
            const $container = $input.closest('.ffs-file-upload');
            const files = this.files;
            
            if (files.length > 0) {
                // 显示选中的文件
                const $fileList = $container.find('.ffs-file-upload-list');
                $fileList.empty();
                
                // 处理每个文件
                Array.from(files).forEach(function(file) {
                    // 创建文件项
                    const $fileItem = $(`
                        <div class="ffs-file-upload-item">
                            <div class="ffs-file-upload-info">
                                <i class="${getFileIcon(file.type)}"></i>
                                <span class="ffs-file-upload-name">${file.name}</span>
                                <span class="ffs-file-upload-size">${formatFileSize(file.size)}</span>
                            </div>
                            <div class="ffs-file-upload-progress">
                                <div class="ffs-file-upload-progress-bar" style="width: 0%"></div>
                            </div>
                        </div>
                    `);
                    
                    // 添加到文件列表
                    $fileList.append($fileItem);
                    
                    // 保存文件对象
                    $fileItem.data('file', file);
                });
                
                // 显示上传按钮
                $container.find('.ffs-file-upload-btn').show();
                
                // 触发文件选择事件
                $container.trigger('file:upload-select', [files]);
            }
        });
        
        // 处理文件上传
        $(document).on('click', '.ffs-file-upload-btn', function() {
            const $btn = $(this);
            const $container = $btn.closest('.ffs-file-upload');
            const $items = $container.find('.ffs-file-upload-item');
            
            // 禁用上传按钮
            $btn.prop('disabled', true);
            $btn.html('<i class="fas fa-spinner fa-spin"></i> 上传中...');
            
            // 模拟上传过程
            let completedCount = 0;
            
            $items.each(function(index) {
                const $item = $(this);
                const $progressBar = $item.find('.ffs-file-upload-progress-bar');
                const file = $item.data('file');
                
                // 触发上传开始事件
                $container.trigger('file:upload-start', [file, $item]);
                
                // 模拟上传进度
                let progress = 0;
                const interval = setInterval(function() {
                    progress += Math.random() * 10;
                    
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        
                        // 上传完成
                        $progressBar.css('width', '100%');
                        $item.addClass('uploaded');
                        
                        // 添加成功图标
                        $item.find('.ffs-file-upload-info').append('<i class="fas fa-check-circle ffs-file-upload-success"></i>');
                        
                        // 触发上传完成事件
                        $container.trigger('file:upload-complete', [file, $item]);
                        
                        // 检查是否所有文件都已上传完成
                        completedCount++;
                        if (completedCount === $items.length) {
                            // 恢复上传按钮
                            $btn.prop('disabled', false);
                            $btn.html('上传');
                            
                            // 触发全部上传完成事件
                            $container.trigger('file:upload-all-complete');
                        }
                    } else {
                        $progressBar.css('width', progress + '%');
                    }
                }, 200);
            });
        });
        
        // 处理拖拽上传
        $('.ffs-file-upload').each(function() {
            const $container = $(this);
            
            // 阻止默认拖放行为
            $container.on('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 添加拖拽中样式
                $(this).addClass('dragover');
                
                return false;
            });
            
            // 拖拽离开
            $container.on('dragleave dragend drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 移除拖拽中样式
                $(this).removeClass('dragover');
                
                return false;
            });
            
                // 处理文件放置
                $container.on('drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 获取文件列表
                    const files = e.originalEvent.dataTransfer.files;
                    
                    if (files.length > 0) {
                        // 更新文件输入框
                        const $input = $container.find('input[type="file"]');
                        $input[0].files = files;
                        
                        // 触发change事件
                        $input.trigger('change');
                    }
                    
                    return false;
                });
            });
        }
        
        /**
         * 初始化文件管理
         * 为带有 ffs-file-manager 类的容器添加文件管理功能
         */
        function initFileManager() {
            // 处理文件选择
            $(document).on('click', '.ffs-file-manager-item', function() {
                const $item = $(this);
                const $container = $item.closest('.ffs-file-manager');
                
                // 切换选中状态
                if ($container.data('multiple') === true) {
                    $item.toggleClass('selected');
                } else {
                    $container.find('.ffs-file-manager-item').removeClass('selected');
                    $item.addClass('selected');
                }
                
                // 更新选中计数
                updateFileManagerSelection($container);
                
                // 触发选择事件
                $container.trigger('file:manager-select', [$item]);
            });
            
            // 处理全选/取消全选
            $(document).on('click', '.ffs-file-manager-select-all', function() {
                const $btn = $(this);
                const $container = $btn.closest('.ffs-file-manager');
                const $items = $container.find('.ffs-file-manager-item');
                
                if ($btn.data('selected') === true) {
                    // 取消全选
                    $items.removeClass('selected');
                    $btn.data('selected', false);
                    $btn.text('全选');
                } else {
                    // 全选
                    $items.addClass('selected');
                    $btn.data('selected', true);
                    $btn.text('取消全选');
                }
                
                // 更新选中计数
                updateFileManagerSelection($container);
                
                // 触发全选/取消全选事件
                $container.trigger('file:manager-select-all', [$btn.data('selected')]);
            });
            
            // 处理文件删除
            $(document).on('click', '.ffs-file-manager-delete', function() {
                const $btn = $(this);
                const $container = $btn.closest('.ffs-file-manager');
                const $selectedItems = $container.find('.ffs-file-manager-item.selected');
                
                if ($selectedItems.length > 0) {
                    // 确认删除
                    if (confirm(`确定要删除选中的 ${$selectedItems.length} 个文件吗？`)) {
                        // 删除选中的文件
                        $selectedItems.fadeOut(300, function() {
                            $(this).remove();
                            
                            // 更新选中计数
                            updateFileManagerSelection($container);
                            
                            // 触发删除事件
                            $container.trigger('file:manager-delete', [$selectedItems]);
                        });
                    }
                }
            });
            
            // 处理文件重命名
            $(document).on('click', '.ffs-file-manager-rename', function() {
                const $btn = $(this);
                const $container = $btn.closest('.ffs-file-manager');
                const $selectedItem = $container.find('.ffs-file-manager-item.selected').first();
                
                if ($selectedItem.length === 1) {
                    const $nameElement = $selectedItem.find('.ffs-file-manager-name');
                    const currentName = $nameElement.text();
                    
                    // 创建输入框
                    const $input = $('<input type="text" class="ffs-file-manager-rename-input" />');
                    $input.val(currentName);
                    
                    // 替换名称元素
                    $nameElement.hide();
                    $nameElement.after($input);
                    $input.focus();
                    
                    // 处理输入完成
                    $input.on('blur keypress', function(e) {
                        if (e.type === 'blur' || (e.type === 'keypress' && e.which === 13)) {
                            const newName = $input.val().trim();
                            
                            if (newName && newName !== currentName) {
                                $nameElement.text(newName);
                                
                                // 触发重命名事件
                                $container.trigger('file:manager-rename', [$selectedItem, currentName, newName]);
                            }
                            
                            // 移除输入框
                            $nameElement.show();
                            $input.remove();
                        }
                    });
                }
            });
            
            // 处理文件排序
            $(document).on('click', '.ffs-file-manager-sort', function() {
                const $btn = $(this);
                const $container = $btn.closest('.ffs-file-manager');
                const $items = $container.find('.ffs-file-manager-item');
                const sortBy = $btn.data('sort');
                
                // 切换排序方向
                let sortDirection = $btn.data('direction') || 'asc';
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                $btn.data('direction', sortDirection);
                
                // 更新排序图标
                $container.find('.ffs-file-manager-sort i').remove();
                $btn.append(`<i class="fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}"></i>`);
                
                // 排序文件
                const $sortedItems = $items.sort(function(a, b) {
                    const $a = $(a);
                    const $b = $(b);
                    let valueA, valueB;
                    
                    if (sortBy === 'name') {
                        valueA = $a.find('.ffs-file-manager-name').text();
                        valueB = $b.find('.ffs-file-manager-name').text();
                    } else if (sortBy === 'size') {
                        valueA = parseInt($a.data('size') || 0, 10);
                        valueB = parseInt($b.data('size') || 0, 10);
                    } else if (sortBy === 'date') {
                        valueA = new Date($a.data('date') || 0);
                        valueB = new Date($b.data('date') || 0);
                    } else {
                        valueA = $a.index();
                        valueB = $b.index();
                    }
                    
                    if (sortDirection === 'asc') {
                        return valueA > valueB ? 1 : -1;
                    } else {
                        return valueA < valueB ? 1 : -1;
                    }
                });
                
                // 重新添加排序后的项目
                const $fileList = $container.find('.ffs-file-manager-list');
                $fileList.append($sortedItems);
                
                // 触发排序事件
                $container.trigger('file:manager-sort', [sortBy, sortDirection]);
            });
            
            // 处理文件搜索
            $(document).on('input', '.ffs-file-manager-search input', function() {
                const $input = $(this);
                const $container = $input.closest('.ffs-file-manager');
                const $items = $container.find('.ffs-file-manager-item');
                const searchText = $input.val().toLowerCase();
                
                if (searchText) {
                    $items.each(function() {
                        const $item = $(this);
                        const fileName = $item.find('.ffs-file-manager-name').text().toLowerCase();
                        
                        if (fileName.includes(searchText)) {
                            $item.show();
                        } else {
                            $item.hide();
                        }
                    });
                    
                    // 触发搜索事件
                    $container.trigger('file:manager-search', [searchText]);
                } else {
                    // 显示所有文件
                    $items.show();
                    
                    // 触发搜索清除事件
                    $container.trigger('file:manager-search-clear');
                }
            });
        }
        
        /**
         * 更新文件管理器选中状态
         * @param {jQuery} $container - 文件管理器容器
         */
        function updateFileManagerSelection($container) {
            const $selectedItems = $container.find('.ffs-file-manager-item.selected');
            const $selectionInfo = $container.find('.ffs-file-manager-selection-info');
            
            if ($selectedItems.length > 0) {
                $selectionInfo.text(`已选择 ${$selectedItems.length} 个文件`);
                $container.find('.ffs-file-manager-actions button').prop('disabled', false);
            } else {
                $selectionInfo.text('未选择文件');
                $container.find('.ffs-file-manager-actions button').prop('disabled', true);
            }
            
            // 特殊处理重命名按钮，只有选择一个文件时才启用
            if ($selectedItems.length === 1) {
                $container.find('.ffs-file-manager-rename').prop('disabled', false);
            } else {
                $container.find('.ffs-file-manager-rename').prop('disabled', true);
            }
        }
        
        /**
         * 获取文件图标
         * @param {string} fileType - 文件MIME类型
         * @returns {string} 图标类名
         */
        function getFileIcon(fileType) {
            const type = fileType.split('/')[0];
            
            switch (type) {
                case 'image':
                    return 'fas fa-image';
                case 'video':
                    return 'fas fa-video';
                case 'audio':
                    return 'fas fa-music';
                case 'text':
                    return 'fas fa-file-alt';
                case 'application':
                    if (fileType.includes('pdf')) {
                        return 'fas fa-file-pdf';
                    } else if (fileType.includes('word') || fileType.includes('document')) {
                        return 'fas fa-file-word';
                    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
                        return 'fas fa-file-excel';
                    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
                        return 'fas fa-file-powerpoint';
                    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
                        return 'fas fa-file-archive';
                    } else {
                        return 'fas fa-file';
                    }
                default:
                    return 'fas fa-file';
            }
        }
        
        /**
         * 格式化文件大小
         * @param {number} bytes - 文件大小（字节）
         * @returns {string} 格式化后的文件大小
         */
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        /**
         * 文件API
         * 提供文件操作的公共方法
         */
        $.ffsFile = {
            /**
             * 初始化文件预览
             * @param {string} selector - 容器选择器
             * @param {object} options - 配置选项
             */
            initPreview: function(selector, options = {}) {
                const $container = $(selector);
                
                if (!$container.length) return;
                
                // 默认配置
                const defaults = {
                    fileUrl: '',
                    fileName: '',
                    fileType: '',
                    onPreviewChange: null,
                    onZoom: null,
                    onDownload: null,
                    onPrint: null
                };
                
                // 合并配置
                const settings = $.extend({}, defaults, options);
                
                // 添加类
                $container.addClass('ffs-file-preview');
                
                // 设置数据属性
                $container.data('file-url', settings.fileUrl);
                $container.data('file-name', settings.fileName);
                $container.data('file-type', settings.fileType);
                
                // 绑定事件
                if (typeof settings.onPreviewChange === 'function') {
                    $container.on('file:preview-change', function(e, target) {
                        settings.onPreviewChange(target);
                    });
                }
                
                if (typeof settings.onZoom === 'function') {
                    $container.on('file:preview-zoom', function(e, scale) {
                        settings.onZoom(scale);
                    });
                }
                
                if (typeof settings.onDownload === 'function') {
                    $container.on('file:preview-download', function(e, fileUrl, fileName) {
                        settings.onDownload(fileUrl, fileName);
                    });
                }
                
                if (typeof settings.onPrint === 'function') {
                    $container.on('file:preview-print', function() {
                        settings.onPrint();
                    });
                }
                
                return $container;
            },
            
            /**
             * 初始化文件转换
             * @param {string} selector - 容器选择器
             * @param {object} options - 配置选项
             */
            initConvert: function(selector, options = {}) {
                const $container = $(selector);
                
                if (!$container.length) return;
                
                // 默认配置
                const defaults = {
                    sourceFile: '',
                    formats: [],
                    onFormatChange: null,
                    onConvertStart: null,
                    onConvertComplete: null,
                    onDownload: null,
                    onDelete: null
                };
                
                // 合并配置
                const settings = $.extend({}, defaults, options);
                
                // 添加类
                $container.addClass('ffs-file-convert');
                
                // 设置数据属性
                $container.data('source-file', settings.sourceFile);
                
                // 添加格式选项
                if (settings.formats.length > 0) {
                    const $formatSelect = $container.find('.ffs-file-convert-format');
                    
                    if ($formatSelect.length) {
                        $formatSelect.empty();
                        $formatSelect.append('<option value="">选择格式</option>');
                        
                        settings.formats.forEach(function(format) {
                            $formatSelect.append(`<option value="${format}">${format.toUpperCase()}</option>`);
                        });
                    }
                }
                
                // 绑定事件
                if (typeof settings.onFormatChange === 'function') {
                    $container.on('file:convert-format-change', function(e, format) {
                        settings.onFormatChange(format);
                    });
                }
                
                if (typeof settings.onConvertStart === 'function') {
                    $container.on('file:convert-start', function(e, sourceFile, format) {
                        settings.onConvertStart(sourceFile, format);
                    });
                }
                
                if (typeof settings.onConvertComplete === 'function') {
                    $container.on('file:convert-complete', function(e, sourceFile, format, $resultItem) {
                        settings.onConvertComplete(sourceFile, format, $resultItem);
                    });
                }
                
                if (typeof settings.onDownload === 'function') {
                    $container.on('file:convert-download', function(e, fileName, $item) {
                        settings.onDownload(fileName, $item);
                    });
                }
                
                if (typeof settings.onDelete === 'function') {
                    $container.on('file:convert-delete', function(e, fileName, $item) {
                        settings.onDelete(fileName, $item);
                    });
                }
                
                return $container;
            },
            
            /**
             * 初始化文件上传
             * @param {string} selector - 容器选择器
             * @param {object} options - 配置选项
             */
            initUpload: function(selector, options = {}) {
                const $container = $(selector);
                
                if (!$container.length) return;
                
                // 默认配置
                const defaults = {
                    maxFiles: 0,
                    maxSize: 0,
                    allowedTypes: '',
                    autoUpload: false,
                    uploadUrl: '',
                    onSelect: null,
                    onStart: null,
                    onProgress: null,
                    onComplete: null,
                    onAllComplete: null,
                    onError: null
                };
                
                // 合并配置
                const settings = $.extend({}, defaults, options);
                
                // 添加类
                $container.addClass('ffs-file-upload');
                
                // 设置数据属性
                $container.data('max-files', settings.maxFiles);
                $container.data('max-size', settings.maxSize);
                $container.data('allowed-types', settings.allowedTypes);
                $container.data('auto-upload', settings.autoUpload);
                $container.data('upload-url', settings.uploadUrl);
                
                // 绑定事件
                if (typeof settings.onSelect === 'function') {
                    $container.on('file:upload-select', function(e, files) {
                        settings.onSelect(files);
                    });
                }
                
                if (typeof settings.onStart === 'function') {
                    $container.on('file:upload-start', function(e, file, $item) {
                        settings.onStart(file, $item);
                    });
                }
                
                if (typeof settings.onProgress === 'function') {
                    $container.on('file:upload-progress', function(e, file, $item, progress) {
                        settings.onProgress(file, $item, progress);
                    });
                }
                
                if (typeof settings.onComplete === 'function') {
                    $container.on('file:upload-complete', function(e, file, $item) {
                        settings.onComplete(file, $item);
                    });
                }
                
                if (typeof settings.onAllComplete === 'function') {
                    $container.on('file:upload-all-complete', function() {
                        settings.onAllComplete();
                    });
                }
                
                if (typeof settings.onError === 'function') {
                    $container.on('file:upload-error', function(e, file, $item, error) {
                        settings.onError(file, $item, error);
                    });
                }
                
                // 如果设置了自动上传
                if (settings.autoUpload) {
                    $container.on('file:upload-select', function() {
                        $container.find('.ffs-file-upload-btn').trigger('click');
                    });
                }
                
                return $container;
            },
            
            /**
             * 初始化文件管理器
             * @param {string} selector - 容器选择器
             * @param {object} options - 配置选项
             */
            initManager: function(selector, options = {}) {
                const $container = $(selector);
                
                if (!$container.length) return;
                
                // 默认配置
                const defaults = {
                    multiple: false,
                    files: [],
                    onSelect: null,
                    onSelectAll: null,
                    onDelete: null,
                    onRename: null,
                    onSort: null,
                    onSearch: null
                };
                
                // 合并配置
                const settings = $.extend({}, defaults, options);
                
                // 添加类
                $container.addClass('ffs-file-manager');
                
                // 设置数据属性
                $container.data('multiple', settings.multiple);
                
                // 添加文件
                if (settings.files.length > 0) {
                    const $fileList = $container.find('.ffs-file-manager-list');
                    
                    if ($fileList.length) {
                        $fileList.empty();
                        
                        settings.files.forEach(function(file) {
                            const $fileItem = $(`
                                <div class="ffs-file-manager-item" data-size="${file.size || 0}" data-date="${file.date || ''}">
                                    <div class="ffs-file-manager-icon">
                                        <i class="${getFileIcon(file.type || 'application/octet-stream')}"></i>
                                    </div>
                                    <div class="ffs-file-manager-info">
                                        <div class="ffs-file-manager-name">${file.name}</div>
                                        <div class="ffs-file-manager-meta">
                                            <span class="ffs-file-manager-size">${formatFileSize(file.size || 0)}</span>
                                            <span class="ffs-file-manager-date">${file.date || ''}</span>
                                        </div>
                                    </div>
                                </div>
                            `);
                            
                            // 保存文件数据
                            $fileItem.data('file', file);
                            
                            // 添加到文件列表
                            $fileList.append($fileItem);
                        });
                    }
                }
                
                // 绑定事件
                if (typeof settings.onSelect === 'function') {
                    $container.on('file:manager-select', function(e, $item) {
                        settings.onSelect($item, $item.data('file'));
                    });
                }
                
                if (typeof settings.onSelectAll === 'function') {
                    $container.on('file:manager-select-all', function(e, isSelected) {
                        settings.onSelectAll(isSelected);
                    });
                }
                
                if (typeof settings.onDelete === 'function') {
                    $container.on('file:manager-delete', function(e, $items) {
                        const files = [];
                        $items.each(function() {
                            files.push($(this).data('file'));
                        });
                        settings.onDelete($items, files);
                    });
                }
                
                if (typeof settings.onRename === 'function') {
                    $container.on('file:manager-rename', function(e, $item, oldName, newName) {
                        const file = $item.data('file');
                        file.name = newName;
                        settings.onRename($item, file, oldName, newName);
                    });
                }
                
                if (typeof settings.onSort === 'function') {
                    $container.on('file:manager-sort', function(e, sortBy, sortDirection) {
                        settings.onSort(sortBy, sortDirection);
                    });
                }
                
                if (typeof settings.onSearch === 'function') {
                    $container.on('file:manager-search', function(e, searchText) {
                        settings.onSearch(searchText);
                    });
                }
                
                return $container;
            },
            
            /**
             * 获取文件预览URL
             * @param {File} file - 文件对象
             * @returns {Promise} 返回预览URL的Promise
             */
            getPreviewUrl: function(file) {
                return new Promise((resolve, reject) => {
                    if (!file) {
                        reject(new Error('文件不存在'));
                        return;
                    }
                    
                    const fileType = file.type;
                    
                    // 图片文件直接创建URL
                    if (fileType.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            resolve(e.target.result);
                        };
                        reader.onerror = function() {
                            reject(new Error('无法读取图片文件'));
                        };
                        reader.readAsDataURL(file);
                    } 
                    // PDF文件
                    else if (fileType === 'application/pdf') {
                        resolve(URL.createObjectURL(file));
                    }
                    // 文本文件
                    else if (fileType.startsWith('text/') || 
                             fileType === 'application/json' || 
                             fileType === 'application/xml') {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            resolve(e.target.result);
                        };
                        reader.onerror = function() {
                            reject(new Error('无法读取文本文件'));
                        };
                        reader.readAsText(file);
                    }
                    // 视频文件
                    else if (fileType.startsWith('video/')) {
                        resolve(URL.createObjectURL(file));
                    }
                    // 音频文件
                    else if (fileType.startsWith('audio/')) {
                        resolve(URL.createObjectURL(file));
                    }
                    // 其他文件类型
                    else {
                        reject(new Error('不支持预览此类型的文件'));
                    }
                });
            },
            
            /**
             * 上传文件
             * @param {string} url - 上传URL
             * @param {File} file - 文件对象
             * @param {Function} progressCallback - 进度回调
             * @param {Object} extraData - 额外数据
             * @returns {Promise} 上传结果Promise
             */
            uploadFile: function(url, file, progressCallback, extraData = {}) {
                return new Promise((resolve, reject) => {
                    if (!url) {
                        reject(new Error('上传URL不能为空'));
                        return;
                    }
                    
                    if (!file) {
                        reject(new Error('文件不能为空'));
                        return;
                    }
                    
                    // 创建FormData
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    // 添加额外数据
                    for (const key in extraData) {
                        if (extraData.hasOwnProperty(key)) {
                            formData.append(key, extraData[key]);
                        }
                    }
                    
                    // 创建XHR
                    const xhr = new XMLHttpRequest();
                    
                    // 监听进度
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable && typeof progressCallback === 'function') {
                            const progress = Math.round((e.loaded / e.total) * 100);
                            progressCallback(progress);
                        }
                    });
                    
                    // 监听完成
                    xhr.addEventListener('load', function() {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                resolve(xhr.responseText);
                            }
                        } else {
                            reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
                        }
                    });
                    
                    // 监听错误
                    xhr.addEventListener('error', function() {
                        reject(new Error('网络错误，上传失败'));
                    });
                    
                    // 监听中止
                    xhr.addEventListener('abort', function() {
                        reject(new Error('上传已取消'));
                    });
                    
                    // 发送请求
                    xhr.open('POST', url, true);
                    xhr.send(formData);
                });
            },
            
            /**
             * 下载文件
             * @param {string} url - 文件URL
             * @param {string} fileName - 文件名
             */
            downloadFile: function(url, fileName) {
                if (!url) return;
                
                // 创建下载链接
                const $link = $('<a></a>')
                    .attr('href', url)
                    .attr('download', fileName || 'download')
                    .attr('target', '_blank')
                    .hide();
                
                // 添加到文档并触发点击
                $('body').append($link);
                $link[0].click();
                $link.remove();
            }
        };
        
        // 初始化组件
        $(function() {
            initFilePreview();
            initFileConvert();
            initFileUpload();
            initFileManager();
        });
        
})(jQuery);