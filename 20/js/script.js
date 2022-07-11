$(document).ready(function(){
	$('.profiles-nav').on('click', 'li:not(.active)', function() {
		$(this).addClass('active').siblings().removeClass('active').closest('.container').find('.tab').removeClass('active').eq($(this).index()).addClass('active');
	});
});