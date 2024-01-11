import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

export default class Brand extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    onReady() {
        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        this.category_sidebar();
        this.showProductsPerPage();
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
        const productsPerPage = this.context.brandProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'brand/product-listing',
                sidebar: 'brand/sidebar',
            },
            config: {
                shop_by_brand: true,
                brand: {
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            showMore: 'brand/show-more',
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
}
