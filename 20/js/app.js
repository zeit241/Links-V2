

var App = {
    noty: function(status, text) {
        $('.alert-'+status+' em').html(text);
        $('.alert-'+status).slowShow('bounceIn');
        setTimeout(function() {
            $('.alert-'+status).slowHide('bounceOut');
        }, 4000);
    },
    user: {
        amount: function() {
            $.ajax({
                url: App.var.ajax + '/user/amount',
                type: 'POST',
                success: function(data) {
                    $('.money').html(data.money / 100);
                    $('.money_profile').html(data.money / 100);
                    App.var.money = data.money;
                }
            });               
        },
        info: function(data) {
            $.ajax({
                url: App.var.ajax + '/user/info',
                type: 'POST',
                data: data,
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    App.noty('success', data.text);
                },
                error: function(data) {
                    App.error(data);               
                }
            });   
        }
    },
    error: function(data) {
        var text = '';
        try {
            var error = JSON.parse(data.responseText);
            var keys = Object.keys(error);
            for(var i in keys) {
                text += error[keys[i]] + '\n';
            }
        } catch(e) {
            text = 'Ошибка сервера';
        }
        App.noty('error', text);    
    },
    var: {
        ajax: '/ajax',
        rul_stop: [-5280],
        block_buy: false,
        money: 0,
        userid: 0,
        audio: null
    },
    items: {
        sell: function(id, self) {
            $.ajax({
                url: App.var.ajax + '/items/sell',
                type: 'POST',
                data: {
                    id: id
                },
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    $(self).addClass('sales');
                    $(self).text('Продан');
                    App.user.amount();
                    App.noty('success', data.text);
                },
                error: function(data) {
                    App.error(data);               
                }
            });               
        },
        withdraw: function() {
            $.ajax({
                url: App.var.ajax + '/items/withdraw',
                type: 'POST',
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    App.user.amount();
                    App.noty('success', data.text);
                },
                error: function(data) {
                    App.error(data);               
                }
            });                   
        }
    },
    orders: {
        create: function(data) {
            $.ajax({
                url: App.var.ajax + '/orders/create',
                type: 'POST',
                data: data,
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    document.location.href = data.url;
                    App.noty('success', 'Переадресация на платежную систему...');
                },
                error: function(data) {
                    App.error(data);               
                }
            });               
        }
    },
    box: {
        open: function() {
            if(App.var.block_buy)
                return App.noty('error', 'Нельзя купить кейс в данный момент');
            App.var.block_buy = true;
            $.ajax({
                url: App.var.ajax + '/case/open',
                type: 'POST',
                data: {
                    id: box_id,
                },
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    App.box.roullet(data);
                    App.user.amount();
                    App.var.block_buy = false;
                },
                error: function(data) {
                    App.var.block_buy = false;
                    App.error(data);               
                }
            });            
        },
        roullet: function(data) {
            var html = '';
            $('.rulet').show();

            $('.wait_open').show();
            $('.open_case').hide();
            $('.rul-el').css('transition', '0ms cubic-bezier(0.32, 0.64, 0.45, 1) 0ms');
            $('.rul-el').css('transform', 'translate3d(0px, 0px, 0px)');
            for(var i in data.list) {
                if(i == 33) {
                    html += '<li>';
                    html += '<img src="'+ data.item.img +'" alt="" />';
                    html += '</li>';                    
                } else {
                    html += '<li>';
                    html += '<img src="'+ data.list[i].img +'" alt="" />';
                    html += '</li>';
                }
            }
            $('.rul-el').html(html);
            $('.rul-el').slowShow('fadeIn');
            setTimeout(function() {
                var rand = App.var.rul_stop[Math.floor(Math.random() * App.var.rul_stop.length)];
                $('.rul-el').css('transition', '16000ms cubic-bezier(0.32, 0.64, 0.45, 1) 0ms');
                $('.rul-el').css('transform', 'translate3d('+rand+'px, 0px, 0px)');
            }, 1500);
            setTimeout(function() {
                $('.wait_open').hide();
                $('.open_case').show();
                //App.box.show_win(data);
            }, 20000);
        },
        show_win: function(data) {
            $('.pre_open').slowShow('fadeIn');
            $('.rulet').hide();
            $('.rul-el').hide();
            $('.rul-el').css('transform', 'translate3d(0px, 0px, 0px)');

            $('.win_img').attr('src', data.item.img);
            $('.win_name').text(data.item.name);
            $('.win_credit').text(data.item.credit);
            $('.win_price').text(data.item.price / 100);
            $('.win_id').attr('data-id', data.item._id);
            $('.modal-win-weapon').removeClass('w-1 w-2 w-3');
            $('.modal-win-weapon').addClass('w-' + data.item.rarity);
            $('#modal-6').arcticmodal();
            if(App.var.money < box_price) {
                $('.open_case').hide();
                $('.money_case').show();
            }
        }
    },
    realtime: {
        live: function(data) {
            var html = '<li class="animated fadeInLeft i-' + data.item.rarity + '" data-toggle="tooltip" title="' + data.item.name + '" data-placement="bottom"><a href="/profile/'+ data.user.userid + '"><img src="' + data.item.img + '" alt="" /></a></li>'
            if(data.item.credit > 60)
                $('.live-ul').prepend(html);
            if(data.item.credit <= 60 && data.user.userid == App.var.userid) 
                $('.live-ul').prepend(html);
        },
        stats: function(data) {
            $('.cases').text(data.box);
        },
        users: function(data) {
            $('.users').text(data.users);
        },
        withdraw: function(data) {
            App.var.audio.play();
            if(!data.status) {
                App.noty('error', data.text);
                return;
            }
            App.noty('success', data.text);       
            App.user.amount();    
        }

    },
    free: {
        winner: function(data) {
            var html = '';
            $('.free_rulet').slowShow('fadeIn');

            for(var i in data.players) {
                if(i == 41) {
                    html += '<li class="r-1">';
                    html += '<span class="rulet-weapon"><img src="'+ data.winner.avatar +'" alt="" /></span>';
                    html += '<span class="rulet-credit">'+ data.winner.username +'</span>';
                    html += '</li>';                    
                } else {
                    html += '<li class="r-1">';
                    html += '<span class="rulet-weapon"><img src="'+ data.players[i].avatar +'" alt="" /></span>';
                    html += '<span class="rulet-credit">'+ data.players[i].username +'</span>';
                    html += '</li>';
                }
            }

            $('.free_username').text(data.winner.username);
            $('.free_img').attr('src', data.winner.avatar);
            $('.free_chance').text(data.winner_chance + '%');

            $('.free-el').html(html);
            setTimeout(function() {
                var rand = App.var.rul_stop[Math.floor(Math.random() * App.var.rul_stop.length)];
                $('.free-el').css('transform', 'translate3d('+rand+'px, 0px, 0px)');
            }, 1500);
            setTimeout(function() {
                $('.number').text('#0');
                $('.chance').text('-');
                $('.points').text('-');
                $('.sale-panel').hide();   
                $('.free_rulet').hide();
                $('.top_live').html('');
                if(document.location.href == 'https://wfdrop.com/free') {
                    $('#modal-free').arcticmodal();
                }
                $('#timer').countdown('destroy');  
                $('#timer').countdown({
                    until: 3600,
                    format: 'ms',
                    significant: 4,
                    padZeroes: true
                });
            }, 20000);        
        },
        accept: function() {
             $.ajax({
                url: App.var.ajax + '/free/accept',
                type: 'POST',
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    App.free.stats(data);

                    App.noty('success', data.text);
                },
                error: function(data) {
                    App.error(data);               
                }
            });            
        },
        stats: function(data) {
            data = data.stats;
            $('.number').text('#' + data.number);
            $('.chance').text(data.chance + '%');
            $('.points').text(data.points);
            $('.sale-panel').slowShow('bounce');
        },
        top: function(data) {
            $('.top_live').hide();
            $('.top_live').html(data.html);
            $('.top_live').slowShow('bounce');
        },

        join_group: function() {
             $.ajax({
                url: App.var.ajax + '/free/join_group',
                type: 'POST',
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    App.free.stats(data);

                    App.noty('success', data.text);
                    setTimeout(function() {
                        $('.join_block').slowHide('fadeOutUp');
                    }, 2000);
                },
                error: function(data) {
                    App.error(data);               
                }
            });                 
        },
        shared: function() {
             $.ajax({
                url: App.var.ajax + '/free/shared',
                type: 'POST',
                success: function(data) {
                    if(!data.status) {
                        App.noty('error', data.text);
                        return;
                    }
                    setTimeout(function() {
                        App.free.stats(data);

                        App.noty('success', data.text);
                    }, 10000);
                },
                error: function(data) {
                    App.error(data);               
                }
            });  
            window.open('https://vk.com/share.php?url=https://wfdrop.ru.com/free&title=Всем привет, я играю на сайте WFDROP.RU.COM, тут есть бесплатный кейс и я выигрываю в нем кредиты&image=https://i.imgur.com/LfWzQ6n.jpg&utm_source=free_credit', '_blank');
            return false;    
        }
    }
};
$(function() {
    App.var.audio = new Audio('/audio/chat_admin_msg.mp3');
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    }); 
    $('.user_info').click(function(e) {
        e.preventDefault();
        var user_info = {
            fio: $('.fio').val(), 
            country: $('.country').val(), 
            streat: $('.streat').val(), 
            house: $('.house').val(), 
            city: $('.city').val(), 
            apart: $('.apart').val(), 
            index: $('.index').val(),
            number: $('.phone').val()
        };  
        App.user.info(user_info);
    });
    $('.share_group').click(function(e) {
        e.preventDefault();
        App.free.shared();
    });    
    $('.join_group').click(function(e) {
        e.preventDefault();
        App.free.join_group();
    });
    $('.accept_free').click(function(e) {
        e.preventDefault();
        App.free.accept();
    });
    $('.withdraw_item').click(function(e) {
        e.preventDefault();
        App.items.withdraw();
    });
    $('.sell_item').click(function(e) {
        e.preventDefault();
        var id = $(this).attr('data-id');
        App.items.sell(id, this);
    });
    $('.sell_item_modal').click(function(e) {
        e.preventDefault();
        var id = $(this).attr('data-id');
        $('#modal-6').arcticmodal('close');
        App.items.sell(id, this);
    });
    $('.copy_promo').click(function(e) {
        e.preventDefault();
        App.noty('success', 'Промокод скопирован!')
    });
    $('.orders_create').click(function(e) {
        e.preventDefault();
        var orders_data = {
            sum: $('.orders_sum').val()
        };
        App.orders.create(orders_data);
    });
    $('.box_open').click(function(e) {
        e.preventDefault();
        App.box.open();
    });
    $('.box_open_modal').click(function(e) {
        e.preventDefault();
        $('#modal-6').arcticmodal('close');
        App.box.open();
    });
    $.fn.extend({
        animateCss: function (animationName) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            $(this).addClass('animated ' + animationName).one(animationEnd, function() {
                $(this).removeClass('animated ' + animationName);
            });
        },
        slowHide: function (animationName) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            $(this).addClass('animated ' + animationName).one(animationEnd, function() {
                $(this).hide();
                $(this).removeClass('animated ' + animationName);
            });
        },
        slowShow: function (animationName) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            $(this).show();
            $(this).addClass('animated ' + animationName).one(animationEnd, function() {
                $(this).removeClass('animated ' + animationName);
            });
        }
    });
    var socket = io.connect('https://server.smart-drop.ru');
    socket.on('live', function (data) {
        if(data.user.userid == App.var.userid) {
            setTimeout(function() {
                App.realtime.live(data);
            }, 20000);
        } else {
            App.realtime.live(data);
        }
        App.realtime.stats(data);
    });
    socket.on('users', function (data) {
        App.realtime.users(data);
    });
    socket.on('online', function (data) {
        $('.online').text(data + 100);
        $('.online_footer').text(data + 100);
    });
    socket.on('free:top', function (data) {
        console.log(data);
        App.free.top(data);
    });
    socket.on('free:winner', function (data) {
        console.log(data);
        App.free.winner(data);
    });
    socket.on('withdraw:' + App.var.userid, function (data) {
        App.realtime.withdraw(data);
    });
});