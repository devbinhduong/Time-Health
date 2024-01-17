import utils from "@bigcommerce/stencil-utils";
import { defaultModal } from "../global/modal";
import { load } from "webfontloader";
import event from "../global/jquery-migrate/event";
import { forEach } from "lodash";
import calculateHeaderCart from "./calculateHeaderCart";
import haloAddOption from "../halothemes/haloAddOptionForProduct";

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

            loadProductByCategory();

            if (window.innerWidth < 1200) {
                appendSearchMobile();
            }
        }
    }

    function eventLoad() {
        /* Load Event */
        $(document).ready(function () {
            const wWidth = window.innerWidth,
                tScroll = $(this).scrollTop();

            if (wWidth < 1200) {
                navigationBottomStickyMobile(tScroll);
                navigationBottomMobile();
                triggerSearchMobile();
            }

            var slickWrapperList = $(".section-slick");

            /* Loop All Slick Slider */
            forEach(slickWrapperList, (slickWrapperItem) => {
                slickCarousel($(slickWrapperItem));
            });
        });

        /* Scroll Event */
        $(window).on("scroll", (e) => {
            const $target = $(e.currentTarget),
                wWidth = window.innerWidth,
                $scrollTop = $target.scrollTop();

            if (wWidth < 1200) {
                navigationBottomStickyMobile($scrollTop);
            }

            loadFunction();
        });

        /* Mouse Over Touch Start */
        $(document).on("keydown mousemove touchstart", (e) => {
            loadFunction();
        });

        /* Resize */
        $(window).on("resize", (e) => {
            if (window.innerWidth < 1200) {
                appendSearchMobile();
            }
        });
    }
    eventLoad();

    /* Slick Function */
    function slickCarousel(wrap) {
        const showDesktop = wrap.data("slick-show-desktop"),
            showTablet = wrap.data("slick-show-tablet"),
            showMobile = wrap.data("slick-show-mobile"),
            showDotbars = wrap.data("dots-bar");

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
        let quickSearchInput = document.querySelector(".form-input-customSearch"),
            quickSearchDropdown = document.querySelector("#quickSearch");

        if (!quickSearchInput) return;

        quickSearchInput.addEventListener("click", (e) => {
            quickSearchDropdown.classList.add("is-open");
            quickSearchDropdown.classList.add("f-open-dropdown");
        });
    }

    /* Trigger Header Cart  */
    function triggerHeaderCart() {
        const totalPriceText = document.querySelector(".custom-priceTotal"),
            cartIcon = document.querySelector(".navUser-actionCart");

        if (!totalPriceText) return;

        totalPriceText.addEventListener("click", (e) => {
            cartIcon.click();
        });
    }

    /* Navigation Bottom Mobile */
    function navigationBottomStickyMobile(tScroll) {
        let navigationBottom = document.querySelector(".navigationBottom");

        if (!navigationBottom) return;

        if (tScroll < scroll_position) {
            navigationBottom.classList.add("is-active");
        } else {
            navigationBottom.classList.remove("is-active");
        }

        scroll_position = tScroll;
    }

    /* Navigation Bottom Function */
    function navigationBottomMobile() {
        const navigationCart = document.querySelector(".navigationBottom__item--cart"),
            navigationAccount = document.querySelector(".navigationBottom__item--account"),
            navigationMenu = document.querySelector(".navigationBottom__item--menu");

        if (!navigationCart || !navigationAccount || !navigationMenu) return;

        navigationCart.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelector(".header__mobile .navUser-actionCart").click();
        });

        navigationAccount.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelector(".header__mobile .navUserAction-login").click();
        });

        navigationMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelector(".header__mobile .mobileMenu-toggle").click();
        });
    }

    function triggerSearchMobile() {
        const searchIcon = document.querySelector("#quick-search-expand-mobile"),
            searchInput = document.querySelector(".searchMobile__input");

        if (!searchIcon || !searchInput) return;

        searchInput.addEventListener("click", (e) => {
            searchIcon.click();
        });
    }

    function appendSearchMobile() {
        const searchPC = document.querySelector(".custom-quickSearch-pc"),
            searchMobile = document.querySelector(".custom-quickSearch-mobile"),
            searchFormPC = searchPC.querySelector(".form"),
            searchFormMobile = searchMobile.querySelector(".form");

        if (window.innerWidth < 1200) {
            searchMobile.appendChild(searchFormPC);
        } else {
            searchPC.appendChild(searchFormMobile);
        }
    }

    function loadProductByCategory() {
        var $categoryUrlData = "custom-products-by-category-tabs";

        const $options = {
            template: "products/carousel-3",
        };

        const $cardSample = $(".product-by-category .productCarousel-sample");
        var customProductBlock = $(".product-by-category [data-custom-products-by-category-tabs]");
        var blockId = customProductBlock.attr("id");

        if ($(".product-by-category [data-custom-products-by-category-tabs]").length) {
            if (customProductBlock.find(".productCarousel").length) {
                customProductBlock.find(".productCarousel").slick("refresh");
            } else {
                loadProducts2($(customProductBlock), $cardSample, $options, $categoryUrlData, blockId);
            }
        }
    }

    function loadProducts2($productBlock2, $thisSample, $options, $catUrlData, blockId) {
        var $catUrl = $productBlock2.data($catUrlData);

        if ($catUrl != undefined) {
            $catUrl = $catUrl.replace(/https?:\/\/[^/]+/, "");

            console.log("run");

            utils.api.getPage($catUrl, $options, (err, response) => {
                $productBlock2.html(response);
                $thisSample.remove();
                var newText = $productBlock2.parent().find(".newTextAjax").text();

                $productBlock2.find(".card").each(function () {
                    var id = $(this).data("product-id");
                    var a = arrNew.indexOf($(this).data("product-id"));
                    if (a != -1) {
                        $(this)
                            .find(".halo-product-badge")
                            .prepend(
                                '<div class="product-badge new-badge"><span class="text">' + newText + "</span></div>"
                            );
                    }
                });

                haloAddOption($context, blockId);
                $("[data-slick]", $productBlock2).slick();
            });
        }
    }
}
