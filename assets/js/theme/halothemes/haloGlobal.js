import utils from '@bigcommerce/stencil-utils';
import haloRecentlyBoughtPopup from './haloRecentlyBoughtPopup';
import haloNewsletterPopup from './haloNewsletterPopup';
import BeforeYouLeave from './haloBeforeYouLeave';
import RecentlyViewedProducts from './haloRecentlyViewedProducts';
import haloAddOption from './haloAddOptionForProduct';
import AZBrands from './haloAZbrands';
import haloQuickShop from './haloQuickShop';
import haloAjaxAddToCart from './haloAjaxAddToCart';
import haloMegaMenuEditor from './haloMegaMenuEditor';
import loadingProgressBar from '../global/loading-progress-bar';
import haloHomeProductLookbook from './haloHomeProductLookbook';
import haloAskAnExpertPopup from './haloAskAnExpertPopup';
import 'fancybox';

export default function (context) {
    const $context = context;
    const theme_settings = context.themeSettings;

    const $header = $('header.header');
    const h_promotion = $('#header_topBarPromotion').outerHeight();
    const h_header = $header.outerHeight();

    var scroll_position = $(window).scrollTop();

    var checkJS_load = true;
    var check_sliderBrands = true;
    var check_sliderHomeReviewsBlock = true;
    var check_homeFeaturedCollections = true;
    var check_homeBookingTours = true;
    var check_categoryBB = true;
    var check_homeServiceCarousel = true;
    var check_homeService2Carousel = true;
    var check_homeService3Carousel = true;
    var check_homeBlogPostsCarousel = true;
    var check_homeTopBannerCarousel = true;
    var check_homeTestimonialCarousel = true;
    var check_homeGalleryCarousel = true;
    var check_lookbookCarousel = true;
    if ($('#azBrandsTable').length) {
        AZBrands(context);
    }

    function loadFunction() {
        if (checkJS_load) {
            checkJS_load = false;

            if (
                context.themeSettings.halo_ask_an_expert &&
                context.themeSettings.halo_ask_an_expert_pagelink
            )
                haloAskAnExpertPopup(context);

            haloRecentlyBoughtPopup($context);
            BeforeYouLeave($context);
            if (theme_settings.enable_recently_viewed_products) {
                RecentlyViewedProducts($context);
            }
            haloQuickShop($context);
            haloAjaxAddToCart($context);
            haloMegaMenuEditor($context);
            loadingProgressBar();
            haloHomeProductLookbook($context);

            if (theme_settings.halo_newsletter_popup) {
                haloNewsletterPopup(1, true);
            } else {
                haloNewsletterPopup(1, false);
            }
        }
    }

    function eventLoad() {
        $(document).ready(function () {
            const wWidth = window.innerWidth;
            const tScroll = $(this).scrollTop();
            const $desTab = $('.productView-description');
            const $infoTab = $('#tab-additional-information');
            var productCarousel = $('.showDotsBar'),
                showDotbars = productCarousel.data('dots-bar');

            haloAddOption($context);
            sliderHomeReviewsBlock(tScroll);
            sliderBrands(tScroll);
            homeFeaturedCollections(tScroll);
            homeBookingTours(tScroll);
            categoryBottomBanner(tScroll);
            homeServiceCarousel(tScroll);
            homeService2Carousel(tScroll);
            homeService3Carousel(tScroll);
            homeService4Carousel(tScroll);
            homeBlogPostsCarousel(tScroll);
            hasConsentManager();
            homeTopBanner(tScroll);
            homeTopBanner4(tScroll);
            homeTestimonial(tScroll);
            homeTestimonial4(tScroll);
            imageGalleryCarousel(tScroll);
            lookbookCarousel(tScroll);
            if ($desTab.length && wWidth < 768) {
                $('.tab-content.is-active', $desTab)
                    .find('.tabContent')
                    .slideDown();
            }

            if ($infoTab.length) {
                if ($infoTab.find('.tabContent').text().trim() == '') {
                    $('[href="#tab-additional-information"]').parent().hide();
                    $infoTab.hide();
                }
            }

            if (showDotbars) {
                productCarousel.each((index, element) => {
                    var $prodWrapId = $(element).attr('id'),
                        wrap = $(`#${$prodWrapId}`);
                    slickDots(wrap[0], wrap);
                });
            }
        });

        $(window).on('scroll', (e) => {
            const $target = $(e.currentTarget);
            const tScroll = $target.scrollTop();

            loadFunction();
            sliderHomeReviewsBlock(tScroll);
            sliderBrands(tScroll);
            stickyHeader(tScroll);
            homeFeaturedCollections(tScroll);
            homeBookingTours(tScroll);
            categoryBottomBanner(tScroll);
            homeServiceCarousel(tScroll);
            homeService2Carousel(tScroll);
            homeService3Carousel(tScroll);
            homeService4Carousel(tScroll);
            homeBlogPostsCarousel(tScroll);
            homeTopBanner(tScroll);
            homeTestimonial(tScroll);
            homeTestimonial4(tScroll);
            imageGalleryCarousel(tScroll);
            lookbookCarousel(tScroll);
        });

        $(document).on('keydown', (e) => {
            loadFunction();
        });

        $(document).on('mousemove', (e) => {
            loadFunction();
        });

        $(document).on('touchstart', (e) => {
            loadFunction();
        });

        //
        // Resize
        // -----------------------------------------------------------------------------
        $(window).on('resize', (e) => {
            const $target = $(e.currentTarget);
            const tScroll = $target.scrollTop();

            addMenuMobile();
            appendSidebarMobile();
            hasConsentManager();
            lookbookCarousel(tScroll);
        });
    }
    eventLoad();

    function Event() {
        //
        // Top Searches
        // -----------------------------------------------------------------------------
        const $btn_topSearches = $('.topSearches-btn');

        $btn_topSearches.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const ts_val = $target.find('span').text();
            const $s_query = $('#nav-quick-search');
            const $s_form = $('form[data-quick-search-form]');

            $s_query.val(ts_val);
            $s_form.submit();
        });

        //
        // Load Products On Quick Search
        // -----------------------------------------------------------------------------
        var check_loadProductsOnQuickSearch = true;
        const $btn_loadProductsOnQuickSearch = $(
            '.navUser-action--quickSearch'
        );

        $btn_loadProductsOnQuickSearch.on('click', (e) => {
            const $listProducts = $('.qsRecommended-products .productCarousel');

            if (check_loadProductsOnQuickSearch) {
                check_loadProductsOnQuickSearch = false;
                loadProductsOnQuickSearch($listProducts);
            } else {
                if ($listProducts.hasClass('slick-slider')) {
                    $listProducts.slick('refresh');
                }
            }
        });

        $(document).on('click', '#before-you-leave .search-icon', function () {
            $('body')
                .removeClass('halo-open-before-you-leave')
                .addClass('quickSearch-open');
            $('.navUser-action--quickSearch').attr('aria-expanded', true);
            $('.dropdown--quickSearch').addClass('is-open f-open-dropdown');

            const $listProducts = $('.qsRecommended-products .productCarousel');

            if (check_loadProductsOnQuickSearch) {
                check_loadProductsOnQuickSearch = false;
                loadProductsOnQuickSearch($listProducts);
            } else {
                if ($listProducts.hasClass('slick-slider')) {
                    $listProducts.slick('refresh');
                }
            }
        });

        //
        // Add To Wish List
        // -----------------------------------------------------------------------------
        $(document).on('click', '.card .wishlist', (e) => {
            e.preventDefault();
            var $this_wl = $(e.currentTarget);
            var url_awl = $this_wl.attr('href');

            if ($('body').hasClass('is-login')) {
                $.post(url_awl).done(function () {
                    window.location.href = url_awl;
                });
            } else {
                window.location.href = '/login.php';
            }
        });

        //
        // Side Login
        // -----------------------------------------------------------------------------
        const $btn_openLogin = $('.navUserAction-login');
        const $sideLogin = $('#sideBlock_login');
        const pageType = $('body').data('page-type');

        $btn_openLogin.on('click', (e) => {
            e.preventDefault();

            if (pageType == 'login' && !$('body').hasClass('is-login')) {
                if ($('.login-form').length) {
                    const loginForm_top = $('.login-form').offset().top - 240;

                    $('html, body').animate(
                        {
                            scrollTop: loginForm_top,
                        },
                        500
                    );
                }
            } else {
                setTimeout(function () {
                    $sideLogin.show();
                    $sideLogin.toggleClass('is-open');
                    $('body').toggleClass('is-side-block');
                }, 100);
            }
        });

        //
        // Side Cart
        // -----------------------------------------------------------------------------
        const $btn_openCart = $('.navUser-actionCart');
        const $sideCart = $('#sideBlock_cart');

        $btn_openCart.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);

            if ($('body[data-page-type="cart"]').length) {
                return;
            }

            setTimeout(function () {
                $sideCart.show();
                $sideCart.toggleClass('is-open');
                $('body').toggleClass('is-side-block');
            }, 500);
        });

        //
        // Side Category
        // -----------------------------------------------------------------------------
        const $btn_openSideCategory = $('.categorySidebar-btn');

        $btn_openSideCategory.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            let blockType = $target.data('page-type');

            if (blockType == 'blog_post') {
                blockType = 'blog';
            }

            const $sideCategory = $('#sideBlock_' + blockType);

            setTimeout(function () {
                $sideCategory.show();
                $sideCategory
                    .find('.productCarousel.slick-initialized')
                    .slick('refresh');
                $sideCategory.toggleClass('is-open');
                $('body').toggleClass('is-side-block');
            }, 100);
        });

        //
        // Close
        // -----------------------------------------------------------------------------
        const $btn_close = $('.btn-close');
        const $btn_mobileMenu = $('.mobileMenu-toggle');
        const $beforeYouLeave = $('#before-you-leave');

        $btn_close.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);

            $target.parents('.halo-side-block').removeClass('is-open');

            if ($('body').hasClass('halo-open-before-you-leave')) {
                $('body').removeClass('halo-open-before-you-leave');

                setTimeout(function () {
                    $beforeYouLeave.hide();
                }, 200);
            } else {
                $('body').removeClass('is-side-block');

                setTimeout(function () {
                    $sideLogin.hide();
                    $sideCart.hide();
                    $('#sideBlock_category').hide();
                    $('#sideBlock_search').hide();
                    $('#sideBlock_brand').hide();
                    $('#sideBlock_blog').hide();
                }, 200);
            }

            if ($('body').hasClass('has-activeNavPages')) {
                $btn_mobileMenu.trigger('click');
            }
        });

        //
        // Footer Info Heading Toggle
        // -----------------------------------------------------------------------------
        const $footerHeadingToggle = $('.footer-info-heading--toggle');

        $footerHeadingToggle.on('click', (e) => {
            e.preventDefault();
            const wWidth = window.innerWidth;

            if (wWidth < 768) {
                const $target = $(e.currentTarget);
                const $thisFooterInfo = $target.parents('.footer-info-col');
                const $thisFooterInfo_list =
                    $thisFooterInfo.find('.footer-info-list');

                $thisFooterInfo.toggleClass('open-dropdown');

                if ($thisFooterInfo.hasClass('open-dropdown')) {
                    $thisFooterInfo_list.slideDown(400);
                } else {
                    $thisFooterInfo_list.slideUp(400);
                }
            }
        });

        //
        // Load Tabs
        // -----------------------------------------------------------------------------
        const $loadTabBtn = $('[data-tab-load]');

        $loadTabBtn.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);

            const check_loadTab = $target.data('tab-check');

            if (check_loadTab) {
                $target.data('tab-check', false);
                const url_loadTab = $target.data('tab-load');
                const thisTab = $target.attr('href');
                const $thisTab = $(thisTab + ' .tabContent');

                $.get(url_loadTab, function (data) {
                    $('.icon-loading', $thisTab).remove();
                    $thisTab.append($(data).find('.page-content').html());
                });
            }
        });

        //
        // Tabs Mobile
        // -----------------------------------------------------------------------------
        const $btnTabMobile = $('.tab-titleMobile');

        $btnTabMobile.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const idTab = $target.attr('href');
            const thisTop = $('.productView-description').offset().top - 20;

            if ($target.hasClass('is-active')) {
                $target.removeClass('is-active');
                $(idTab).removeClass('is-active').find('.tabContent').slideUp();
            } else {
                const $tabActiveMobile = $(
                    '.productView-description .tabs-contents .tab-content.is-active'
                );

                $btnTabMobile.removeClass('is-active');
                $target.addClass('is-active');
                $tabActiveMobile
                    .removeClass('is-active')
                    .find('.tabContent')
                    .slideUp();
                $(idTab).addClass('is-active').find('.tabContent').slideDown();

                $('body,html').animate(
                    {
                        scrollTop: thisTop,
                    },
                    1000
                );
            }
        });

        //
        // Currency Menu Mobile
        // -----------------------------------------------------------------------------
        const $btnCurrency = $('.navPages-actionCurrency');

        $btnCurrency.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            $target.parent().toggleClass('is-open');
            $target.toggleClass('is-open');
        });

        //
        // Body Close
        // -----------------------------------------------------------------------------
        $(document).on('click', (e) => {
            const $target = $(e.target);
            const $shareLinkPopup = $('.shareLinkSocial__popup');

            if (
                $target.closest(
                    '.halo-side-block, .navUserAction-login, .navUser-actionCart, [data-cart-preview2], .mobileMenu-toggle, .modal--editOptions, .before-you-leave, .categorySidebar-btn, [data-edit-cart-remove]'
                ).length === 0
            ) {
                if ($('body').hasClass('halo-open-before-you-leave')) {
                    $(
                        '.halo-open-before-you-leave .halo-side-block'
                    ).removeClass('is-open');
                    $('body').removeClass('halo-open-before-you-leave');

                    setTimeout(function () {
                        $beforeYouLeave.hide();
                    }, 200);
                } else {
                    $('.halo-side-block').removeClass('is-open');
                    $('body').removeClass('is-side-block');

                    setTimeout(function () {
                        $sideLogin.hide();
                        $sideCart.hide();
                        $('#sideBlock_category').hide();
                        $('#sideBlock_search').hide();
                        $('#sideBlock_brand').hide();
                        $('#sideBlock_blog').hide();
                    }, 200);
                }

                if ($('body').hasClass('has-activeNavPages')) {
                    $btn_mobileMenu.trigger('click');
                }
            }

            if ($target.closest('.shareLinkSocial').length === 0) {
                if ($shareLinkPopup.hasClass('is-open')) {
                    $shareLinkPopup.slideUp(200);
                    $shareLinkPopup.removeClass('is-open');
                }
            }
        });
    }
    Event();

    function loadProductsOnQuickSearch($listProducts) {
        const thisProductBlock = 'ProductsOnQuickSearch';
        const listIDs = JSON.parse(
            '[' + theme_settings.quickSearch_Recommended_Products_IDs + ']'
        );
        const $thisProducts = $(
            '.qsRecommended-products .productCarousel [data-product-slide]'
        );
        const $thisSample = $(
            '.qsRecommended-products .productCarousel .productCarousel-sample'
        );
        const options = { template: 'halothemes/products/halo-product-temp' };

        loadProducts(
            listIDs,
            $listProducts,
            $thisProducts,
            $thisSample,
            thisProductBlock,
            options
        );
    }

    function loadProducts(
        listIDs,
        $listProducts,
        $thisProducts,
        $thisSample,
        thisProductBlock,
        options
    ) {
        var checkSTT = 0;
        const listIDs_length = listIDs.length;
        const thisSample_length = $thisSample.length;

        for (var i = 0; i < listIDs_length; i++) {
            const thisID = listIDs[i];

            utils.api.product.getById(thisID, options, (err, response) => {
                if (err) {
                    return;
                }

                let hasProd = $(response).find('.card').data('product-id'),
                    pageErr = $(response).find('.page-content--err').length;

                if (
                    hasProd != undefined &&
                    hasProd != '' &&
                    hasProd != null &&
                    !pageErr
                ) {
                    if (checkSTT < thisSample_length) {
                        $thisProducts.eq(checkSTT).before(response);
                        $thisProducts.eq(checkSTT).remove();
                    } else {
                        $listProducts.append(response);
                    }
                }

                checkSTT++;

                if (checkSTT == listIDs_length) {
                    if (thisProductBlock == 'ProductsOnQuickSearch') {
                        sliderOnQuickSearch($listProducts);
                    }

                    $thisSample.remove();
                }
            });
        }
    }

    function sliderOnQuickSearch($listProducts) {
        $listProducts.slick({
            dots: true,
            arrows: false,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 2,
            slidesToScroll: 2,
            responsive: [
                {
                    breakpoint: 551,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    },
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                    },
                },
                {
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                    },
                },
            ],
        });
    }

    function sliderRecommendedBlock($listProducts) {
        $listProducts.slick({
            dots: true,
            arrows: true,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 2,
            slidesToScroll: 2,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                    },
                },
                {
                    breakpoint: 1261,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4,
                    },
                },
            ],
        });
    }

    function sliderHomeReviewsBlock(tScroll) {
        const $hrbCarousel = $('#homeReviewsBlock .homeReviewsBlock_carousel');

        if ($hrbCarousel.length) {
            const hrbCarousel_top = $hrbCarousel.offset().top - screen.height;

            if (tScroll > hrbCarousel_top && check_sliderHomeReviewsBlock) {
                check_sliderHomeReviewsBlock = false;

                $hrbCarousel.slick({
                    dots: true,
                    arrows: true,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 551,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                    ],
                });
            }
        }
    }

    function sliderBrands(tScroll) {
        const $brandsCarousel = $(
            '.haloBrandsSlider .haloBrandsSlider__carousel'
        );

        if ($brandsCarousel.length) {
            const brandsCarousel_top =
                $brandsCarousel.offset().top - screen.height;

            if (tScroll > brandsCarousel_top && check_sliderBrands) {
                check_sliderBrands = false;

                $brandsCarousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 400,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 551,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                        {
                            breakpoint: 992,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4,
                            },
                        },
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 5,
                                slidesToScroll: 5,
                            },
                        },
                    ],
                });
            }
        }
    }

    function addMenuMobile() {
        const $menu = $('#menu');
        const $menuMobile = $('#menuMobile');
        const wWidth = window.innerWidth;

        if (wWidth >= 1200) {
            if ($menuMobile.children().length > 0) {
                $menuMobile.children().appendTo($menu);
            }
        } else {
            if ($menu.children().length > 0) {
                $menu.children().appendTo($menuMobile);
            }
        }
    }
    addMenuMobile();

    function stickyHeader(tScroll) {
        if (theme_settings.halo_headerSticky) {
            if (tScroll > h_promotion && tScroll < scroll_position) {
                if (!$('.header-height').length) {
                    $header.before(
                        '<div class="header-height" style="height: ' +
                            h_header +
                            'px"></div>'
                    );
                }
                $header.addClass('is-sticky');
                $header.css('animation-name', 'fadeInDown');
            } else {
                $header.removeClass('is-sticky');
                $('.header-height').remove();
                $header.css('animation-name', '');
            }

            scroll_position = tScroll;
        }
    }

    function homeProductNew() {
        const $homePGF = $('#homeProductNew');
        const $homePGF_grid = $homePGF.find('.productGrid');
        const homePGF_itemLength = $homePGF_grid.find('.product').length;
        const $homePGF_btnBlock = $('.homePGF_btn');
        const $homePGF_btn = $('.homePGF_btn a');
        const dataColumn = $homePGF_grid.data('columns');
        let tt_productShow;

        if ($homePGF.length && homePGF_itemLength > 0) {
            if (homePGF_itemLength > 8) {
                $homePGF_btnBlock.addClass('is-show');
            }

            $homePGF_btn.on('click', (e) => {
                e.preventDefault();
                const wWidth = window.innerWidth;

                if (wWidth > 800) {
                    tt_productShow = 8;
                } else if (wWidth <= 800 && wWidth > 550) {
                    tt_productShow = 6;
                } else {
                    tt_productShow = 4;
                }

                if ($homePGF_grid.find('.product:hidden').length > 0) {
                    $homePGF_grid
                        .find('.product:hidden:lt(' + tt_productShow + ')')
                        .css('display', 'inline-block');

                    if ($homePGF_grid.find('.product:hidden').length == 0) {
                        $homePGF_btn
                            .text('No More Products')
                            .attr('disabled', '');
                    }
                }
            });
        }
    }
    homeProductNew();

    function homeFeaturedCollections(tScroll) {
        const $homeFCT_carousel = $(
            '#homeFeaturedCollections .homeFeaturedCollections__carousel'
        );

        if ($homeFCT_carousel.length) {
            const homeFCT_carouselTop =
                $homeFCT_carousel.offset().top - screen.height;

            if (
                tScroll > homeFCT_carouselTop &&
                check_homeFeaturedCollections
            ) {
                check_homeFeaturedCollections = false;

                $homeFCT_carousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 550,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 991,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                        {
                            breakpoint: 1199,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4,
                                dots: false,
                                arrows: true,
                            },
                        },
                    ],
                });
            }
        }
    }

    function homeBookingTours(tScroll) {
        const $homeBKT_carousel = $(
            '#homeBookingTours .homeBookingTours__carousel'
        );

        if ($homeBKT_carousel.length) {
            const homeBKT_carouselTop =
                $homeBKT_carousel.offset().top - screen.height;

            if (tScroll > homeBKT_carouselTop && check_homeBookingTours) {
                check_homeBookingTours = false;

                $homeBKT_carousel.slick({
                    dots: true,
                    arrows: true,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 551,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 992,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                    ],
                });
            }
        }
    }

    function categoryBottomBanner(tScroll) {
        const $categoryBB_carousel = $(
            '#categoryReviewsBlock .homeBottomBanner__carousel'
        );

        if ($categoryBB_carousel.length) {
            const categoryBB_carouselTop =
                $categoryBB_carousel.offset().top - screen.height;

            if (tScroll > categoryBB_carouselTop && check_categoryBB) {
                check_categoryBB = false;

                $categoryBB_carousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 1199,
                            settings: {
                                arrows: true,
                            },
                        },
                    ],
                });
            }
        }
    }

    function homeServiceCarousel(tScroll) {
        const wWidth = window.innerWidth;
        const $homeServiceCarousel = $('#homeService .homeService__carousel');

        if ($homeServiceCarousel.length && wWidth < 768) {
            const homeServiceCarouselTop =
                $homeServiceCarousel.offset().top - screen.height;

            if (tScroll > homeServiceCarouselTop && check_homeServiceCarousel) {
                check_homeServiceCarousel = false;

                $homeServiceCarousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                    ],
                });
            }
        }
    }

    function homeService2Carousel(tScroll) {
        const wWidth = window.innerWidth;
        const $homeService2Carousel = $(
            '.haloHomeService .haloHomeService__carousel'
        );

        if ($homeService2Carousel.length) {
            const homeService2CarouselTop =
                $homeService2Carousel.offset().top - screen.height;

            if (
                tScroll > homeService2CarouselTop &&
                check_homeService2Carousel
            ) {
                check_homeService2Carousel = false;

                $homeService2Carousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 551,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 801,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4,
                            },
                        },
                    ],
                });
            }
        }
    }

    function homeService3Carousel(tScroll) {
        const wWidth = window.innerWidth;
        const $homeService3Carousel = $(
            '#homeService3 .homeService3__carousel'
        );

        if ($homeService3Carousel.length) {
            const homeService3CarouselTop =
                $homeService3Carousel.offset().top - screen.height;

            if (
                tScroll > homeService3CarouselTop &&
                check_homeService3Carousel
            ) {
                check_homeService3Carousel = false;

                $homeService3Carousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 1025,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                    ],
                });
            }
        }
    }
    function homeService4Carousel(tScroll) {
        const wWidth = window.innerWidth;
        const $homeServiceCarousel = $('#homeService4 .homeService__carousel');

        if ($homeServiceCarousel.length) {
            const homeServiceCarouselTop =
                $homeServiceCarousel.offset().top - screen.height;

            if (tScroll > homeServiceCarouselTop && check_homeServiceCarousel) {
                check_homeServiceCarousel = false;

                $homeServiceCarousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 1439,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4,
                                dots: false,
                                arrows: true,
                            },
                        },
                        {
                            breakpoint: 1199,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                                dots: false,
                                arrows: true,
                            },
                        },
                        {
                            breakpoint: 991,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                                dots: true,
                                arrows: false,
                            },
                        },
                        {
                            breakpoint: 520,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 3,
                                dots: true,
                                arrows: false,
                            },
                        },
                    ],
                });
            }
        }
    }

    function homeTopBanner(tScroll) {
        const wWidth = window.innerWidth;
        const $homeTopBannerCarousel = $(
            '#homeTopBanner3 .homeTopBanner3__carousel'
        );

        if ($homeTopBannerCarousel.length) {
            const $homeTopBannerCarouselTop =
                $homeTopBannerCarousel.offset().top - screen.height;

            if (
                tScroll > $homeTopBannerCarouselTop &&
                check_homeTopBannerCarousel
            ) {
                check_homeTopBannerCarousel = false;

                $homeTopBannerCarousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    responsive: [
                        {
                            breakpoint: 481,
                            settings: {
                                dots: true,
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                dots: false,
                                arrows: true,
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                        {
                            breakpoint: 992,
                            settings: {
                                dots: false,
                                arrows: true,
                                slidesToShow: 4,
                                slidesToScroll: 4,
                            },
                        },
                        {
                            breakpoint: 1200,
                            settings: {
                                dots: false,
                                arrows: true,
                                slidesToShow: 5,
                                slidesToScroll: 5,
                            },
                        },
                    ],
                });
            }
        }
    }

    function homeTopBanner4(tScroll) {
        const wWidth = window.innerWidth;
        const $homeTopBannerCarousel = $(
            '#homeCustomBlockCategory .homeTopCategory__carousel'
        );

        if ($homeTopBannerCarousel.length) {
            const $homeTopBannerCarouselTop =
                $homeTopBannerCarousel.offset().top - screen.height;

            if (
                tScroll > $homeTopBannerCarouselTop &&
                check_homeTopBannerCarousel
            ) {
                check_homeTopBannerCarousel = false;

                $homeTopBannerCarousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: true,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    slide: '.js-product-slide',
                    responsive: [
                        {
                            breakpoint: 1199,
                            settings: {
                                dots: true,
                                arrows: true,
                                slidesToShow: 4,
                                slidesToScroll: 4,
                            },
                        },
                        {
                            breakpoint: 991,
                            settings: {
                                dots: true,
                                arrows: false,
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                        {
                            breakpoint: 550,
                            settings: {
                                dots: true,
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                    ],
                });
            }
        }
    }
    function slickDots(wrap, productCarousel) {
        //window.addEventListener('load', (event) => {
        const slickDots = wrap.querySelectorAll('.slick-dots li');
        const totalSlideStepCount = slickDots.length;
        const dotbars = wrap.parentElement.querySelector('[data-bars]');
        const dots = wrap.querySelector('.slick-dots');
        const barThumb = dotbars.querySelector('.bar-thumb');
        const barThumbWidth = dotbars.clientWidth / totalSlideStepCount;
        barThumb.style.width = `calc(100%/${totalSlideStepCount})`;
        const dotsBarLeft = dotbars.getBoundingClientRect().x;
        const dotItem = wrap.querySelector('.slick-dots li');
        const dotItem2 = productCarousel.find('.slick-dots li');

        if (slickDots.length === 0) {
            dotbars.remove();
            return;
        }

        dotItem2.each(function (index) {
            const dataIndex = index + 1;
            $(this).attr('data-index', dataIndex);
        });

        if ($('#TabFeaturedProductCarousel').length) {
            $('#TabFeaturedProductCarousel .slick-dots li').each(function (
                index
            ) {
                const dataIndex = index + 1;
                $(this).attr('data-index', dataIndex);
            });
        }

        if ($('#TabCateIDCarousel').length) {
            $('#TabCateIDCarousel .slick-dots li').each(function (index) {
                const dataIndex = index + 1;
                $(this).attr('data-index', dataIndex);
            });
        }

        if ($('#TabNewProductCarousel').length) {
            console.log('nbv');
            $('#TabNewProductCarousel .slick-dots li').each(function (index) {
                const dataIndex = index + 1;
                $(this).attr('data-index', dataIndex);
            });
        }

        if ($('#TabTopProductCarousel').length) {
            $('#TabTopProductCarousel .slick-dots li').each(function (index) {
                const dataIndex = index + 1;
                $(this).attr('data-index', dataIndex);
            });
        }

        var dotsActivebg = parseInt(
            dots.querySelector('.slick-active').dataset.index
        );

        productCarousel.on(
            'beforeChange',
            function (event, slick, currentSlide, nextSlide) {
                const slickDots = wrap.querySelectorAll('.slick-dots li');
                const totalSlideStepCount = slickDots.length;
                const dotsActive =
                    dots.querySelector('.slick-active').dataset.index;

                if (totalSlideStepCount == dotsActive) {
                    barThumb.style.left = `calc(100%/${totalSlideStepCount} * (${dotsActive} - 2))`;
                } else {
                    if (dotsActive >= dotsActivebg) {
                        barThumb.style.left = `calc(100%/${totalSlideStepCount} * ${dotsActive})`;
                    } else {
                        if (dotsActive == 1) {
                            barThumb.style.left = `calc(100%/${totalSlideStepCount} * ${dotsActive})`;
                        } else {
                            barThumb.style.left = `calc(100%/${totalSlideStepCount} * (${dotsActive} - 2))`;
                        }
                    }
                }
                dotsActivebg = dotsActive;
            }
        );

        dotbars.addEventListener('click', (e) => {
            const clickedIndex = Math.floor(
                (e.pageX - dotsBarLeft) / barThumbWidth
            );
            slickDots[clickedIndex].click();
        });
        // })
    }

    function homeTestimonial(tScroll) {
        const wWidth = window.innerWidth;
        const $homeTestimonialCarousel = $(
            '#homeTestimonial .homeTestimonial__carousel'
        );

        if ($homeTestimonialCarousel.length) {
            const $homeTestimonialCarouselTop =
                $homeTestimonialCarousel.offset().top - screen.height;

            if (
                tScroll > $homeTestimonialCarouselTop &&
                check_homeTestimonialCarousel
            ) {
                check_homeTestimonialCarousel = false;

                $homeTestimonialCarousel.slick({
                    dots: true,
                    arrows: false,
                    fade: true,
                    infinite: true,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                });
            }
        }
    }

    function homeTestimonial4(tScroll) {
        const wWidth = window.innerWidth;
        const $homeTestimonialCarousel = $(
            '#homeTestimonial4 .homeTestimonial4__carousel'
        );

        if ($homeTestimonialCarousel.length) {
            const $homeTestimonialCarouselTop =
                $homeTestimonialCarousel.offset().top - screen.height;

            if (
                tScroll > $homeTestimonialCarouselTop &&
                check_homeTestimonialCarousel
            ) {
                check_homeTestimonialCarousel = false;

                $homeTestimonialCarousel.slick({
                    dots: true,
                    arrows: false,
                    fade: true,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 1199,
                            settings: {
                                dots: false,
                                arrows: true,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                            },
                        },
                    ],
                });
            }
        }
    }

    function imageGalleryFancyBox() {
        if ($('.halo-instagram-gallery').length > 0) {
            var $imageInstaRow = $('.halo-instagram-gallery').find(
                '.halo-image-instagram'
            );
            fancyBoxImage($imageInstaRow.find('[data-fancybox]'));
        }
        function fancyBoxImage($image) {
            $image.fancybox({
                buttons: [
                    'zoom',
                    //"share",
                    'slideShow',
                    //"fullScreen",
                    //"download",
                    // "thumbs",
                    'close',
                ],
            });
        }
    }
    imageGalleryFancyBox();

    function imageGalleryCarousel(tScroll) {
        const wWidth = window.innerWidth;
        const $homeGalleryCarousel = $(
            '#halo_instagram_4 .halo-image-instagram-4'
        );

        if ($homeGalleryCarousel.length) {
            const $homeGalleryCarouselTop =
                $homeGalleryCarousel.offset().top - screen.height;

            if (
                tScroll > $homeGalleryCarouselTop &&
                check_homeGalleryCarousel
            ) {
                check_homeGalleryCarousel = false;
                $homeGalleryCarousel.slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 1199,
                            settings: {
                                dots: false,
                                arrows: true,
                                slidesToShow: 4,
                                slidesToScroll: 4,
                            },
                        },
                        {
                            breakpoint: 991,
                            settings: {
                                dots: true,
                                arrows: false,
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                        {
                            breakpoint: 520,
                            settings: {
                                dots: true,
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                    ],
                });
            }
        }
    }

    function lookbookCarousel(tScroll) {
        const wWidth = window.innerWidth;
        const $lookbookCarousel = $('#lookBook2 .lookBook2__carousel');

        if ($lookbookCarousel.length) {
            if (wWidth <= 550) {
                if (!$lookbookCarousel.hasClass('slick-initialized')) {
                    $lookbookCarousel.slick({
                        dots: true,
                        arrows: false,
                        infinite: false,
                        mobileFirst: true,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    });
                }
            } else {
                if ($lookbookCarousel.hasClass('slick-initialized')) {
                    $lookbookCarousel.slick('unslick');
                }
            }
        }
    }

    function homeProductsTabs() {
        var $catUrlData = 'halo-products-by-category-tabs';
        const $options = {
            template: 'products/carousel-3',
        };
        const $thisSample = $(
            '.productCarousel-tabs #product_tab_2 .productCarousel-sample'
        );
        var productBlock = $(
            '.productCarousel-tabs .tab-content.is-active .productCarousel-custom'
        );
        var productBlock2 = $(
            '.productCarousel-tabs .tab-content.is-active [data-halo-products-by-category-tabs]'
        );
        var blockId = productBlock2.attr('id');

        if (
            $(
                '.productCarousel-tabs .tab-content.is-active .productCarousel-custom'
            ).length
        ) {
            productBlock.slick('refresh');
        }

        $('.productCarousel-tabs [data-tab]').on('toggled', (event, tab) => {
            var productBlock = $(
                '.productCarousel-tabs .tab-content.is-active .productCarousel-custom'
            );

            productBlock.slick('refresh');
        });

        if (
            $(
                '.productCarousel-tabs .tab-content.is-active [data-halo-products-by-category-tabs]'
            ).length
        ) {
            if (productBlock2.find('.productCarousel').length) {
                productBlock2.find('.productCarousel').slick('refresh');
            } else {
                loadProducts2(
                    $(productBlock2),
                    $thisSample,
                    $options,
                    $catUrlData,
                    blockId
                );
            }
        }

        $('.productCarousel-tabs [data-tab]').on('toggled', (event, tab) => {
            var productBlock2 = $(
                '.productCarousel-tabs .tab-content.is-active [data-halo-products-by-category-tabs]'
            );
            var blockId = productBlock2.attr('id');

            if (productBlock2.find('.productCarousel').length) {
                productBlock2.find('.productCarousel').slick('refresh');
            } else {
                loadProducts2(
                    $(productBlock2),
                    $thisSample,
                    $options,
                    $catUrlData,
                    blockId
                );
            }

            var productCarousel = productBlock2.find('.showDotsBar'),
                showDotbars = productCarousel.data('dots-bar');

            if (showDotbars) {
                productCarousel.each((index, element) => {
                    var $prodWrapId = $(element).attr('id'),
                        wrap = $(`#${$prodWrapId}`);
                    slickDots(wrap[0], wrap);
                });
            }
        });
    }

    function loadProducts2(
        $productBlock2,
        $thisSample,
        $options,
        $catUrlData,
        blockId
    ) {
        var $catUrl = $productBlock2.data($catUrlData);

        if ($catUrl != undefined) {
            $catUrl = $catUrl.replace(/https?:\/\/[^/]+/, '');

            utils.api.getPage($catUrl, $options, (err, response) => {
                $productBlock2.html(response);
                $thisSample.remove();
                var newText = $productBlock2
                    .parent()
                    .find('.newTextAjax')
                    .text();

                $productBlock2.find('.card').each(function () {
                    var id = $(this).data('product-id');
                    var a = arrNew.indexOf($(this).data('product-id'));
                    if (a != -1) {
                        $(this)
                            .find('.halo-product-badge')
                            .prepend(
                                '<div class="product-badge new-badge"><span class="text">' +
                                    newText +
                                    '</span></div>'
                            );
                    }
                });

                haloAddOption($context, blockId);
                $('[data-slick]', $productBlock2).slick();
            });
        }
    }

    homeProductsTabs();

    function gridListView() {
        const wWidth = window.innerWidth;
        const $btnGrid = $('.view-as-btn #grid-view');
        const $btnList = $('.view-as-btn #list-view');
        const $gridDropdown = $('.view-as-btn .btn-dropdown');
        const $btnGridView = $('.view-as-btn .btn-dropdown .grid-view');

        if (wWidth >= 1600 && wWidth < 1920) {
            $('#grid-view5').addClass('current-view');
        } else if (wWidth >= 1261 && wWidth < 1600) {
            $('#grid-view4').addClass('current-view');
        } else if (wWidth >= 551 && wWidth < 1261) {
            $('#grid-view3').addClass('current-view');
        } else if (wWidth < 551) {
            $('#grid-view2').addClass('current-view');
        }

        $btnGrid.on('click', (e) => {
            e.preventDefault();
            const twWidth = window.innerWidth;
            const $productGrid = $(
                '#product-listing-container [data-product-compare] > ul'
            );

            $btnList.removeClass('current-view');
            $btnGrid.addClass('current-view');
            $productGrid.removeClass('productList');
            $productGrid.addClass('productGrid');

            if (twWidth > 550) {
                $gridDropdown.toggleClass('is-open');
            }
        });

        $btnList.on('click', (e) => {
            e.preventDefault();
            const $productGrid = $(
                '#product-listing-container [data-product-compare] > ul'
            );

            $btnGrid.removeClass('current-view');
            $btnList.addClass('current-view');
            $gridDropdown.removeClass('is-open');
            $productGrid.removeClass('productGrid');
            $productGrid.addClass('productList');
        });

        $btnGridView.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const dataCol = $target.data('grid');
            const $productGrid = $(
                '#product-listing-container [data-product-compare] > ul'
            );

            $btnGridView.removeClass('current-view');
            $target.addClass('current-view');
            $productGrid.attr('data-column', dataCol);
            categoryProductBanner(dataCol);
        });

        $(document).on('click', function (e) {
            const $target = $(e.target);

            if ($target.closest('.view-as-btn').length === 0) {
                $gridDropdown.removeClass('is-open');
            }
        });
    }
    gridListView();

    function appendSidebarMobile() {
        const wWidth = window.innerWidth;
        const $blogPage = $('.blog-page');
        const $sideBlock = $('#sideBlock_blog .side-block-body');

        if ($blogPage.length) {
            if (wWidth < 768) {
                $sideBlock.prepend($('.page-sidebar', $blogPage));
            } else {
                $('#sideBlock_blog').removeClass('is-open');
                $('body').removeClass('is-side-block');
                $blogPage.prepend($('.page-sidebar', $sideBlock));
            }
        }
    }
    appendSidebarMobile();

    function blogTags() {
        if ($('body[data-page-type="blog"]').length) {
            let arr = {};

            $('#blog-tags .recentPosts_tags [data-tag]').each(function (i) {
                var txt = $(this).data('tag');

                if (arr[txt]) {
                    $(this).remove();
                } else {
                    arr[txt] = true;
                }
            });

            $('#blog-tags .recentPosts_tags').show();
        } else if ($('body[data-page-type="blog_post"]').length) {
            const url_blogTags = '/blog';

            $.get(url_blogTags, function (data) {
                let arr = {};
                const response = $(data)
                    .find('#blog-tags .recentPosts_tags')
                    .html();

                $('#blog-tags .recentPosts_tags').html(response);

                $('#blog-tags .recentPosts_tags [data-tag]').each(function (i) {
                    var txt = $(this).data('tag');

                    if (arr[txt]) {
                        $(this).remove();
                    } else {
                        arr[txt] = true;
                    }
                });

                $('#blog-tags .recentPosts_tags').show();
            });
        }
    }
    blogTags();

    function backToTop() {
        var offset = $(window).height() / 2;
        const backToTop = $('#haloBackToTop');

        $(window).scroll((event) => {
            $(event.currentTarget).scrollTop() > offset
                ? backToTop.addClass('is-visible')
                : backToTop.removeClass('is-visible');
        });

        backToTop.on('click', (event) => {
            event.preventDefault();

            $('body,html').animate(
                {
                    scrollTop: 0,
                },
                1000
            );
        });
    }
    backToTop();

    function lookBookPage() {
        const $lookBookPage = $('#halo-lookbook-slider');

        if ($lookBookPage.length) {
            const $lookBookPage_carousel = $('.halo-lookbook-slider');

            $lookBookPage_carousel.slick({
                dots: true,
                arrows: false,
                fade: true,
                infinite: false,
                mobileFirst: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            dots: false,
                            arrows: true,
                        },
                    },
                ],
            });

            const $element = $('#halo-lookbook-slider'),
                $popup = $element.find('.halo-lookbook-popup');

            const $options = {
                template: 'halothemes/products/halo-product-temp',
            };

            $element.find('[data-product-lookbook]').on('click', (event) => {
                $popup.removeClass('is-open').empty();

                var $prodId = $(event.currentTarget).data('product-id'),
                    position = $(event.currentTarget).offset(),
                    container = $element.offset();

                if ($prodId != undefined) {
                    utils.api.product.getById(
                        $prodId,
                        $options,
                        (err, response) => {
                            if (err) {
                                return false;
                            }

                            let hasProd = $(response)
                                    .find('.card')
                                    .data('product-id'),
                                pageErr =
                                    $(response).find(
                                        '.page-content--err'
                                    ).length;

                            if (
                                hasProd != undefined &&
                                hasProd != '' &&
                                hasProd != null &&
                                !pageErr
                            ) {
                                $popup.html(response);
                            } else {
                                $popup.html(
                                    '<p>There are no products listed under this category.</p>'
                                );
                            }

                            if ($(window).width() >= 551) {
                                $popup.css({
                                    top: position.top - container.top - 180,
                                    left: position.left - container.left + 60,
                                });
                            } else {
                                $popup.css({
                                    top: position.top - container.top + 15,
                                    left: 15,
                                });
                            }

                            $popup.addClass('is-open');
                        }
                    );
                }
            });

            $(document).on('click', '.halo-lookbook-close', (event) => {
                event.preventDefault();

                if ($popup.hasClass('is-open')) {
                    $popup.removeClass('is-open');
                }
            });

            $(document).on('click', (event) => {
                if ($popup.hasClass('is-open')) {
                    if (
                        $(event.target).closest($popup).length === 0 &&
                        $(event.target).closest('[data-product-lookbook]')
                            .length === 0
                    ) {
                        $popup.removeClass('is-open');
                    }
                }
            });
        }
    }
    lookBookPage();

    function faqsToggle() {
        const $haloFaqs = $('.halo-faqs-content');

        if ($haloFaqs.length) {
            $('.faq-desc').appendTo('.haloFaqs-header__des');

            $('.page-normal .card .title').on('click', (event) => {
                event.preventDefault();

                var target = $(event.currentTarget);

                $('.page-normal .card .title')
                    .not(target)
                    .removeClass('collapsed');

                if (target.hasClass('collapsed')) {
                    target.removeClass('collapsed');
                } else {
                    target.addClass('collapsed');
                }

                $('.page-normal .card').each((index, element) => {
                    if ($('.title', element).hasClass('collapsed')) {
                        $(element).find('.collapse').slideDown();
                    } else {
                        $(element).find('.collapse').slideUp();
                    }
                });
            });
        }
    }
    faqsToggle();

    function bgImageFaqs() {
        var faqsImg = $('.haloFaqs-header__img[data-image-bg]');
        if (faqsImg.length > 0) {
            var imgUrl = $('.haloFaqs-header__img').data('image-bg');
            $('.haloFaqs-header__img').css(
                'background-image',
                'url(' + imgUrl + ')'
            );
        }
    }
    bgImageFaqs();

    function categoryProductBanner(dataCol) {
        if (theme_settings.categoryBannerProduct) {
            if ($('body[data-page-type="category"]').length) {
                const productBanner = $('.product--banner');
                const productGrid = $(
                    '#product-listing-container .productGrid'
                );
                const index = $('.product--banner').index(
                    '#product-listing-container .productGrid li'
                );
                const countPD = productGrid.find(
                    'li:not(.product--banner)'
                ).length;
                let dataColF = productGrid.data('column');
                let aItem;

                if (dataCol != undefined) {
                    dataColF = dataCol;
                }

                if (index > dataColF * 2 || index < 0) {
                    if (countPD > dataColF * 2) {
                        aItem = dataColF * 2 - 1;
                    } else {
                        aItem = countPD - 1;
                    }
                } else {
                    aItem = dataColF * 2;
                }

                productGrid
                    .find('> .product:eq(' + aItem + ')')
                    .after(productBanner);

                productBanner.removeClass('u-hidden');
            }
        }
    }
    categoryProductBanner();

    function hasConsentManager() {
        const $cookieManager = $('#consent-manager');
        const $cookieUpdate = $('#consent-manager-update-banner');

        if ($cookieManager.length || $cookieUpdate.length) {
            const wWidth = window.innerWidth;
            const $footer = $('footer.footer');
            const $backToTop = $('#haloBackToTop');
            const $halo_AskAnExpert = $('.halo-ask-an-expert');

            if (wWidth > 800) {
                if ($cookieUpdate.length) {
                    const cookieHeight =
                        $cookieManager.outerHeight() +
                        $cookieUpdate.outerHeight() +
                        15;
                    $halo_AskAnExpert.css('bottom', cookieHeight);
                } else {
                    const cookieHeight = $cookieManager.outerHeight() + 15;
                    $halo_AskAnExpert.css('bottom', cookieHeight);
                }
            } else {
                if ($cookieUpdate.length) {
                    const cookieHeight =
                        $cookieManager.outerHeight() +
                        $cookieUpdate.outerHeight() +
                        130;
                    $halo_AskAnExpert.css('bottom', cookieHeight);
                } else {
                    const cookieHeight = $cookieManager.outerHeight() + 130;
                    $halo_AskAnExpert.css('bottom', cookieHeight);
                }
            }

            if ($backToTop.length) {
                if (wWidth < 768) {
                    if ($cookieUpdate.length) {
                        const cookieHeight =
                            $cookieManager.outerHeight() +
                            $cookieUpdate.outerHeight() +
                            185;
                        $backToTop.css('bottom', cookieHeight);
                    } else {
                        const cookieHeight = $cookieManager.outerHeight() + 185;
                        $backToTop.css('bottom', cookieHeight);
                    }
                }
            }

            if ($cookieUpdate.length) {
                const cookieHeight =
                    $cookieManager.outerHeight() + $cookieUpdate.outerHeight();
                $footer.css('padding-bottom', cookieHeight);
            } else {
                const cookieHeight = $cookieManager.outerHeight();
                $footer.css('padding-bottom', cookieHeight);
            }
        }
    }

    function homeBlogPostsCarousel(tScroll) {
        const $homeBlogPostsCarousel = $('.halo-block-post .halo-recent-post');

        if ($homeBlogPostsCarousel.length) {
            const $homeBlogPostsCarouselTop =
                $homeBlogPostsCarousel.offset().top - screen.height;

            if (
                tScroll > $homeBlogPostsCarouselTop &&
                check_homeBlogPostsCarousel
            ) {
                check_homeBlogPostsCarousel = false;

                $homeBlogPostsCarousel.slick({
                    dots: false,
                    arrows: false,
                    infinite: false,
                    mobileFirst: false,
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    responsive: [
                        {
                            breakpoint: 1025,
                            settings: {
                                dots: true,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 551,
                            settings: {
                                dots: true,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                            },
                        },
                    ],
                });
            }
        }
    }
    function bgTopBarPromotion() {
        var topBarImg = $('#header_topBarPromotion [data-image-bg]');
        if (topBarImg.length > 0) {
            var imgUrl = $('.topBarPromotion-carousel').data('image-bg');
            $('#header_topBarPromotion').css(
                'background-image',
                'url(' + imgUrl + ')'
            );
        }
    }
    bgTopBarPromotion();

    function activeTabMenu() {
        const $urlActive = window.location.pathname;
        $('.header-tabs--list .tab-item').each(function () {
            const $link = $(this).data('page');
            if ($urlActive == $link) {
                $('.header-tabs--list .tab-item').removeClass(
                    'tab--item--active'
                );
                $(this).addClass('tab--item--active');
            }
        });
    }
    activeTabMenu();
    function needHelpBtn() {
        $('.need-help--btn').on('click', function () {
            $('.need-help--dropdown').toggleClass('need-help--dropdown-show');
            $('body').toggleClass('need-help-show');
        });

        $('.need-help--dropdown .close').on('click', function () {
            $('.need-help--dropdown').toggleClass('need-help--dropdown-show');
            $('body').toggleClass('need-help-show');
        });
        $('.need-help .background-overlay').on('click', function () {
            $('.need-help--dropdown').toggleClass('need-help--dropdown-show');
            $('body').toggleClass('need-help-show');
        });
    }
    needHelpBtn();
}
