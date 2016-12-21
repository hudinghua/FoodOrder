(function ($) {
    var pluginPrintCount = 0;
    $.fn.pluginPrint = function () {
        var ele = $(this);
        var idPrefix = "pluginPrint_";
        removepluginPrint(idPrefix + pluginPrintCount);
        pluginPrintCount++;
        var iframeId = idPrefix + pluginPrintCount;
        var iframeStyle = 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;';
        iframe = document.createElement('IFRAME');
        $(iframe).attr({
            style: iframeStyle,
            id: iframeId
        });
        document.body.appendChild(iframe);
        var doc = iframe.contentWindow.document;
        $(document).find("link").filter(function () {
            return $(this).attr("rel").toLowerCase() == "stylesheet";
        }).each(
                function () {
                    doc.write('<link type="text/css" rel="stylesheet" href="'
                            + $(this).attr("href") + '" >');
                });
        doc.write('<div class="' + $(ele).attr("class") + '">' + $(ele).html()
                + '</div>');
        doc.close();
        var frameWindow = iframe.contentWindow;
        frameWindow.close();
        frameWindow.focus();
        frameWindow.print();
    }
    var removepluginPrint = function (id) {
        $("iframe#" + id).remove();
    };
})(jQuery);