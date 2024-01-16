import utils from '@bigcommerce/stencil-utils';
import { defaultModal } from '../global/modal';
import { load } from 'webfontloader';
import event from '../global/jquery-migrate/event';
import { forEach } from 'lodash';
import calculateHeaderCart from './calculateHeaderCart';

export default function (context) {
    const $context = context,
        theme_settings = context.themeSettings;

    var scroll_position = $(window).scrollTop();

    var checkJS_load = true;

    function loadFunction() {
        if (checkJS_load) {
            checkJS_load = false;

            /* Add Funcion Here */
            headerQuickSearch();
            calculateHeaderCart(theme_settings);
            triggerHeaderCart();
        }
    }

    function eventLoad() {
        /* Load Event */
        $(document).ready(function () {
            const wWidth = window.innerWidth,
                tScroll = $(this).scrollTop();

            var slickWrapperList = $('.section-slick');

            /* Loop All Slick Slider */
            forEach(slickWrapperList, (slickWrapperItem) => {
                slickCarousel($(slickWrapperItem));
            });
        });

        /* Scroll Event */
        $(window).on('scroll', (e) => {
            const $target = $(e.currentTarget);
            const $scrollTop = $target.scrollTop();

            loadFunction();
        });

        /* Mouse Over Touch Start */
        $(document).on('keydown mousemove touchstart', (e) => {
            loadFunction();
        });

        /* Resize */
        $(window).on('resize', (e) => {});
    }
    eventLoad();

    /* Slick Function */
    function slickCarousel(wrap) {
        const showDesktop = wrap.data('slick-show-desktop'),
            showTablet = wrap.data('slick-show-tablet'),
            showMobile = wrap.data('slick-show-mobile'),
            showDotbars = wrap.data('dots-bar');

        wrap.slick({
            dots: showDotbars,
            arrows: true,
            infinite: false,
            mobileFirst: true,
            slidesToShow: showMobile,
            slidesToScroll: 1,

            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: showDesktop,
                    },
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: showTablet,
                    },
                },
            ],
        });
    }

    /* Header Quick Search */
    function headerQuickSearch() {
        let quickSearchInput = document.querySelector(
                '.form-input-customSearch'
            ),
            quickSearchDropdown = document.querySelector('#quickSearch');

        if (!quickSearchInput) return;

        quickSearchInput.addEventListener('click', (e) => {
            quickSearchDropdown.classList.add('is-open');
            quickSearchDropdown.classList.add('f-open-dropdown');
        });
    }

    /* Trigger Header Cart  */
    function triggerHeaderCart() {
        const totalPriceText = document.querySelector('.custom-priceTotal'),
            cartIcon = document.querySelector('.navUser-actionCart');

        if (!totalPriceText) return;

        totalPriceText.addEventListener('click', (e) => {
            cartIcon.click();
        });
    }
}
