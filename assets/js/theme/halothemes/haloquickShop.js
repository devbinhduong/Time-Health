import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal } from '../global/modal';

export default function (context) {
    if(context.themeSettings.halo_quick_shop == true) {
        const modal = defaultModal();

        $('body').on('click', '.button--quickShop', event => {
            event.preventDefault();

            const wWith = window.innerWidth;
            const target = $(event.currentTarget),
                productId = target.data('product-id'),
                card = target.parents('.card'),
                popup = target.parents('.card').find('.quickShopPopup');

            $('.card').removeClass('open-quick-shop');
            $('.card').find('.quickShopPopup').removeClass('is-open').empty();
            $('.modal--quickView .modal-content').empty();

            target.addClass('btn-loading');

            if (wWith > 767) {
                popup
                    .addClass('is-loading')
                    .html('<div class="loadingOverlay"></div>');

                utils.api.product.getById(productId, { template: 'halothemes/products/halo-quick-shop' }, (err, response) => {
                    target.removeClass('btn-loading');
                    popup.find('.loadingOverlay').remove();
                    popup
                        .removeClass('is-loading')
                        .append(response)
                        .addClass('is-open');
                    card
                        .addClass('open-quick-shop');

                    var productDetails = new ProductDetails(popup.find('.halo-quickShop'), context);
                    productDetails.setProductVariant(popup.find('.halo-quickShop'));

                    return productDetails;
                });
            }
            else {
                modal.open({ size: 'large' });

                utils.api.product.getById(productId, { template: 'halothemes/products/halo-quick-shop' }, (err, response) => {
                    target.removeClass('btn-loading');
                    modal.updateContent('<div class="quickShopPopup scrollbar is-open">'+response+'</div>');

                    modal.$content.parents('.modal').addClass('modal--quickShop');

                    modal.setupFocusTrap();

                    return new ProductDetails(modal.$content.find('.halo-quickShop'), context);
                });
            }
        });

        $(document).on('click','.halo-quickShop-close', event => {
            event.preventDefault();
            
            $(event.currentTarget)
                .parents('.quickShopPopup')
                .removeClass('is-open')
                .empty();
            $(event.currentTarget)
                .parents('.card')
                .removeClass('open-quick-shop');

            $('.modal--quickShop .modal-close').trigger('click');
        });

        $(document).on('click', event => {
            if (($(event.target).closest('.quickShopPopup').length === 0) && ($(event.target).closest('.button--quickShop').length === 0)){
                $('.card')
                    .find('.quickShopPopup')
                    .removeClass('is-open')
                    .empty();
                $('.card')
                    .removeClass('open-quick-shop');
            }
        });
    }
}
