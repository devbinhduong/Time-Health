/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/utils/form-utils';
import modalFactory, { ModalEvents } from './global/modal';
import haloPrevNextProduct from './halothemes/haloPrevNextProduct';
import haloBundleProducts from './halothemes/haloBundleProducts';
import Sortable from 'sortablejs';
import haloStickyAddToCart from './halothemes/haloStickyAddToCart';
import haloYoutubeCarousel from './halothemes/haloYoutubeVideo';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        this.bulkPricingHandler();
        haloPrevNextProduct(this.context);

        if (this.context.themeSettings.halo_bundle_products_enable == true) {
            haloBundleProducts(this.context);   
        }

        if (this.context.themeSettings.halo_compare_colors == true) {
            this.compareColors();
        }   

        haloStickyAddToCart($('.productView__top'), this.context);
        haloYoutubeCarousel($('.productView__top [data-slick]'));

        const $reviewForm = classifyForm('.writeReview-form');

        if ($reviewForm.length === 0) return;

        const review = new Review($reviewForm);

        $(document).on(ModalEvents.opened, '#modal-review-form', () => this.reviewModal.setupFocusTrap());

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
    }

    ariaDescribeReviewInputs($form) {
        $form.find('[data-input]').each((_, input) => {
            const $input = $(input);
            const msgSpanId = `${$input.attr('name')}-msg`;

            $input.siblings('span').attr('id', msgSpanId);
            $input.attr('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }

    compareColors() {
        $('.halo-compareColors-swatch .form-option').on('click',  function(event){
            $(this).toggleClass('show-color');

            var title = $(this).find('.form-option-variant').attr('title'),
                id = $(this).data('product-swatch-value'),
                $color, $color2, $color3, $img;

            if ($(this).hasClass('show-color')){
                if($(this).find('.form-option-variant--color').length){
                    $color = $(this).find('.form-option-variant--color').attr('style');

                    $('.halo-compareColors-image').append('<div class="item item-color item-'+id+'"><span class="color" style="'+$color+';"></span><span class="title">'+title+'</span></div>');
                } else if($(this).find('.form-option-variant--color2').length){
                    $color = $(this).find('.form-option-variant--color2 span:nth-child(1)').attr('style');
                    $color2 = $(this).find('.form-option-variant--color2 span:nth-child(2)').attr('style');

                    $('.halo-compareColors-image').append('<div class="item item-color item-'+id+'"><span class="color color2"><span style="'+$color+';"></span><span style="'+$color2+';"></span></span><span class="title">'+title+'</span></div>');
                } else if($(this).find('.form-option-variant--color3').length){
                    $color = $(this).find('.form-option-variant--color3 span:nth-child(1)').attr('style');
                    $color2 = $(this).find('.form-option-variant--color3 span:nth-child(2)').attr('style');
                    $color3 = $(this).find('.form-option-variant--color3 span:nth-child(3)').attr('style');

                    $('.halo-compareColors-image').append('<div class="item item-color item-'+id+'"><span class="color color3"><span style="'+$color+';"></span><span style="'+$color2+';"></span><span style="'+$color3+';"></span></span><span class="title">'+title+'</span></div>');
                } else if($(this).find('.form-option-variant--pattern').length){
                    $img = $(this).find('.form-option-variant--pattern').attr('style').split("'")[1];

                    $('.halo-compareColors-image').append('<div class="item item-partern item-'+id+'"><span class="image"><img src='+$img+' alt='+title+' title='+title+'></span><span class="title">'+title+'</span></div>');
                }
            } else{
                $('.halo-compareColors-image .item-'+id+'').remove();
            }

            if ($(window).width() >= 1025) {
                var el = document.getElementById('color-swatch-image');
                
                new Sortable(el, {
                    animation: 150
                });
            }
        });
    }
}
