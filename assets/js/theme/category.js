import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';
import haloAddOption from './halothemes/haloAddOptionForProduct';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();
        this.category_sidebar();
        this.showMoreProducts();
        this.showProductsPerPage();
        this.categoryHeader();
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            const $productListing = $('#product-listing-container').offset().top - 145;

            $('html, body').animate({
                scrollTop: $productListing,
            }, 100);

            this.category_sidebar();
            this.showProductsPerPage();
            this.showMoreProducts();

            const $topProduct = $('#faceted-search-container #ProductCarouselTopSellers .productCarousel');

            if ($topProduct.length) {
                $topProduct.slick();
            }
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }

    category_sidebar() {
        if ($('.all-categories-list').length > 0) {
            $('ul.all-categories-list li').each(function() {
              const breadLink = $('.page-type-product #breadcrumbs-wrapper ul li.breadcrumb.is-active').prev('.breadcrumb').children('a').attr('href');
              if (($(this).children('a').attr('href') == window.location) || ($(this).children('a').attr('href') == window.location.pathname)) {
                 $(this).addClass('current-cat');
                 $(this).children('.dropdown-category-list').addClass('cat-expanded').siblings('.icon-dropdown').addClass('is-clicked');
                 $(this).parents('.dropdown-category-list').addClass('cat-expanded').siblings('.icon-dropdown').addClass('is-clicked');
              }
              if ($(this).children('a').attr('href') == breadLink) {
                 $(this).addClass('current-cat');
                 $(this).parents('.dropdown-category-list').addClass('cat-expanded').siblings('.icon-dropdown').addClass('is-clicked');
                 
              }
           });
                    
            $('.all-categories-list .icon-dropdown').on('click', function() {
                $(this).parent().siblings().removeClass('is-clicked');
                $(this).parent().siblings().find("> .dropdown-category-list").slideUp( "slow" );
                $(this).parent().siblings().find("> .icon-dropdown").removeClass('is-clicked');
                $(this).parent().find("> .dropdown-category-list").slideToggle( "slow" );
                $(this).parent().siblings().removeClass('open');
                $(this).parents('.all-categories-list').find('.current-cat').removeClass('current-cat');

                if ($(this).hasClass('is-clicked')) {
                    $(this).removeClass('is-clicked');
                    $(this).parent().removeClass('open');
                } else {
                    $(this).addClass('is-clicked');
                    $(this).parent().addClass('open');
                }
           });
        }
    }

    showProductsPerPage() {
        try {
            var url = new URL(window.location.href);
            var c = url.searchParams.get("limit");
            if(c != null){
                var limit = document.querySelectorAll('select#limit option');
                Array.prototype.forEach.call(limit, function(element) {
                    if(element.value == c){
                        element.selected = true;
                    }
                });
            }
        } catch(e) {}
    }

    showMoreProducts() {
        const context = this.context;
        const $showMore = $('.category__showMoreBtn');
        const $showMoreBtn = $('.category__showMoreBtn > a');
        const $pagination_next = $(".pagination-item--next");

        if ($pagination_next.length) {
            $showMore.addClass('is-show');
        }

        $showMoreBtn.on('click', (event) => {
            event.preventDefault();

            var nextPage = $(".pagination-item--current").next(),
                link = nextPage.find("a").attr("href");

            $showMoreBtn.addClass('btn-loading');

            $.ajax({
                type: 'get',
                url: link.replace("http://", "//"),
                success: function(data) {
                    if ($(data).find('#product-listing-container .productGrid').length > 0) {
                        $('#product-listing-container [data-product-compare] > ul').append($(data).find('#product-listing-container [data-product-compare] > ul').children().not('.product-advertisment'));

                        $('.pagination-list').html($(data).find(".pagination-list").html());

                        $showMoreBtn.removeClass('btn-loading').blur();

                        if (Number($(data).find('.pagination-info .end').text()) <= Number($(data).find('.pagination-info .total').text())) {
                            $('.pagination .pagination-info .end').text($(data).find('.pagination-info .end').text());
                        } else {
                            $('.pagination .pagination-info .end').text($(data).find('.pagination-info .total').text());
                        }

                        nextPage = $(".pagination-item--current").next();

                        if (nextPage.length === 0) {
                            $showMoreBtn.addClass('disable').text('No more products');
                        }

                        haloAddOption(context);
                    }
                }
            });
        });
    }

    categoryHeader() {
        if(this.context.themeSettings.category_header_type == 'banner') {
            if (!$('.categoryHeader__img').length) {
                $('.categoryHeader').removeClass('categoryHeader--img');
            }
        }
    }
}
