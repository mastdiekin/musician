// import $ from 'jquery';
import '../libs/bootstrap-sass/assets/javascripts/bootstrap.js';
import svg4everybody from '../libs/svg4everybody/dist/svg4everybody.legacy.js';
import Waypoint from '../libs/waypoints/lib/jquery.waypoints.js';
import '../libs/slick-carousel/slick/slick.js';

svg4everybody({
  polyfill: true 
});

$(document).ready(function() {
  $(document).on('scroll', onScroll);

  //smoothscroll
  $('.topline__menu a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    $(document).off('scroll');

    $('a').each(function() {
      $(this).removeClass('active');
    });
    $(this).addClass('active');

    var target = this.hash,
      // menu = target;
      $target = $(target);
    $('html, body').stop().animate({
      'scrollTop': $target.offset().top+2
    }, 500, 'swing', function() {
      window.location.hash = target;
      $(document).on('scroll', onScroll);
    });
  });
});

function onScroll(event) {
  var scrollPos = $(document).scrollTop();
  $('.topline__menu a').each(function() {
    var currLink = $(this);
    var refElement = $(currLink.attr('href'));
    if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
      $('.topline__menu li a').removeClass('active');
      currLink.addClass('active');
    }
    else{
      currLink.removeClass('active');
    }
  });
}

$('.header__text, .stripe__anim, .news__item, canvas').css('opacity', 0);

$.when($('.loader_inner').delay(200).fadeOut(300))

  .done(function() {

    $('.header__text').waypoint(function() {
      $('.header__text').addClass('animated fadeIn');
    }, { offset: '80%'});

    $('canvas').waypoint(function() {
      $('canvas').addClass('canvas__anim');
    }, { offset: '80%'});

    $('.main__title').each(function() {
      var self = $(this);
      $(this).waypoint({
        handler: function() {
          self.addClass('stripe__anim');
        }, offset: '80%'
      });
    });

    $('.news__item').each(function() {
      var self = $(this);
      $(this).waypoint({
        handler: function() {
          self.addClass('animated fadeIn');
        }, offset: '80%'
      });
    });
    $('.year, .date').each(function() {
      var self = $(this);
      $(this).waypoint({
        handler: function() {
          self.addClass('stripe__date');
        }, offset: '80%'
      });
    });

    $.when($('.loader').fadeOut())

      .done(function() {



      });

  });

$(document).ready(function() {
  var menu = $('.topline__menu'),
    topline = $('.topline');

  $(window).scroll(function() {

    var wScroll = $(this).scrollTop();

    if (wScroll > menu.outerHeight(true) + 20) {
      topline.addClass('--dark');
    }
    else {
      topline.removeClass('--dark');
    };

  });

  $('.menu__toggle').click(function() {
    $(this).toggleClass('--active');
    menu.slideToggle('slow').toggleClass('--open');
  });

  $('.slider__items').slick({
    prevArrow: '.slider__prev',
    nextArrow: '.slider__next',
    dots: true,
    draggable: false,
    infinite: true,
    adaptiveHeight: true,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [{
      draggable: true
    }]
  });
  $('.history__slider').slick({
    dots: false,
    arrows: false,
    centerMode: true,
    centerPadding: '60px',
    slidesToShow: 5,
    adaptiveHeight: true,
    lazyLoad: 'ondemand',
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          arrows: false,
          centerMode: true,
          slidesToShow: 3
        }
      },
      {
        breakpoint: 870,
        settings: {
          arrows: false,
          centerMode: true,
          slidesToShow: 1
        }
      }
    ]
  });
});


function hello() {
  if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
    var args = ['\n %c by Surkov Dmitriy %c https://m4st.ru %c %c 🐳 \n\n', 'border: 1px solid #000;color: #fff; background: #07a2cf; padding:5px 0;', 'color: #fff; background: #1c1c1c; padding:5px 0;border: 1px solid #000;', 'background: #fff; padding:5px 0;', 'color: #b0976d; background: #fff; padding:5px 0;'];
    window.console.log.apply(console, args);
  } else if (window.console) {
    window.console.log('by Surkov Dmitriy - https://m4st.ru');
  }
}

hello();
