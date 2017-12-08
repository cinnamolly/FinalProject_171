$(document).ready(function () {
    $(document).on("scroll", onScroll);

    //smoothscroll
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        $(document).off("scroll");

        $('a').each(function () {
            $(this).removeClass('active');
        });
        $(this).addClass('active');

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
    console.log("Scroll position is: " + scrollPos);
    $('#navbar ul li a').each(function () {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));
        console.log(currLink.attr("href"));
        console.log("Top position is: " + refElement.position().top);
        console.log("Top position is: " + refElement.position().top);
        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            //$('#navbar ul li a').removeClass("active");
            currLink.addClass("active");
        }
        else{
            currLink.removeClass("active");
        }
    });
}
  