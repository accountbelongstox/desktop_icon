
function sendmessage(ele){
    console.log(ele.dataset.exec)
    window.electron.execTheFile(ele.dataset.exec)
}


$(".content-header").hide();
$(".main-header").hide();
$(".main-sidebar").hide();
$(".content .col-12").eq(0).hide();
$(".content-wrapper").css({
	"padding-top":0,
	"margin-left":0,
});
