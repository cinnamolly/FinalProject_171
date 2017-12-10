$(document).ready(function () {
    $(document).on("scroll", onScroll);

    //smoothscroll
    $('#navbar ul li a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        $(document).off("scroll");

        $('#navbar ul li a').each(function () {
            $(this).removeClass('activesec');
        });
        $(this).addClass('activesec');

        var target = this.hash,
            menu = target;
        $target = $(target);
        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 500, 'swing', function () {
            window.location.hash = target;
            $(document).on("scroll", onScroll);
        });
    });
});

function onScroll(event){
    var scrollPos = $(document).scrollTop();
    $('#navbar ul li a').each(function () {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));
        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            $('#navbar ul li a').removeClass("activesec");
            currLink.addClass("activesec");
        }
        else{
            currLink.removeClass("activesec");
        }
    });
}
  