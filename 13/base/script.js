$(document).ready(function() {
    $('.login-content').submit(function (e) {
        e.preventDefault();

        $('.info').remove();
        $('button[type="submit"]').prop('disabled', true).addClass('load');
        
        $.post('auth', $(this).serialize()).done(function (res) {
            $('button[type="submit"]').prop('disabled', false).removeClass('load');
            if(res.status) {
                $('.error').hide();
                location.href = res.redirect;
            } else {
                $('.error').show();
            }
        });
    });
});