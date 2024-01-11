import utils from '@bigcommerce/stencil-utils';
import ProductDetailsBase, { optionChangeDecorator } from './product-details-base';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.reveal';
import ImageGallery from '../product/image-gallery';
import modalFactory, { showAlertModal } from '../global/modal';
import { isEmpty, isPlainObject } from 'lodash';
import { normalizeFormData } from './utils/api';
import { isBrowserIE, convertIntoArray } from './utils/ie-helpers';
import bannerUtils from './utils/banner-utils';
import haloCalculateFreeShipping from '../halothemes/haloCalculateFreeShipping';

export default class ProductDetails extends ProductDetailsBase {
    constructor($scope, context, productAttributesData = {}) {
        super($scope, context);

        this.$overlay = $('[data-cart-item-add] .loadingOverlay');
        this.imageGallery = new ImageGallery($('[data-image-gallery]', this.$scope));
        this.imageGallery.init();
        this.listenQuantityChange();
        this.$swatchOptionMessage = $('.swatch-option-message');
        this.swatchOptionMessageInitText = this.$swatchOptionMessage.text();

        const $form = $('form[data-cart-item-add]', $scope);
        const $productOptionsElement = $('[data-product-option-change]', $form);
        const hasOptions = $productOptionsElement.html().trim().length;
        const hasDefaultOptions = $productOptionsElement.find('[data-default]').length;
        const $productSwatchGroup = $('[id*="attribute_swatch"]', $form);

        if (context.showSwatchNames) {
            this.$swatchOptionMessage.removeClass('u-hidden');
            $productSwatchGroup.on('change', ({ target }) => this.showSwatchNameOnOption($(target)));

            $.each($productSwatchGroup, (_, element) => {
                if ($(element).is(':checked')) this.showSwatchNameOnOption($(element));
            });
        }

        $productOptionsElement.on('change', event => {
            this.productOptionsChanged(event);
            this.setProductVariant();
            this.setProductVariant2();
        });

        $form.on('submit', event => {
            this.addProductToCart(event, $form[0]);
        });

        // add to cart 2
        const $form2 = $('form[data-cart-item-add-2]', $scope);
        const $productOptionsElement2 = $('[data-product-option-change-2]', $form2);

        $productOptionsElement2.on('change', event => {
            this.productOptionsChanged2(event);
            this.setProductVariant();
            this.setProductVariant2();
        });

        $(document).on('click', '#form-action-addToCart2.halothemes', event => {
            $form2.submit();
        });

        $form2.on('submit', event => {
            this.addProductToCart(event, $form2[0]);
        });

        // Update product attributes. Also update the initial view in case items are oos
        // or have default variant properties that change the view
        if ((isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
            const $productId = $('[name="product_id"]', $form).val();
            const optionChangeCallback = optionChangeDecorator.call(this, hasDefaultOptions);

            utils.api.productAttributes.optionChange($productId, $form.serialize(), 'products/bulk-discount-rates', optionChangeCallback);
        } else {
            this.updateProductAttributes(productAttributesData);
            bannerUtils.dispatchProductBannerEvent(productAttributesData);
        }

        $productOptionsElement.show();

        this.previewModal = modalFactory('#previewModal')[0];

        if (this.context.themeSettings.themevale_soldProduct) {
            this.soldProduct(this.context);
        }

        if (this.context.themeSettings.halo_viewing_product) {
            this.viewingProduct(this.context);
        }
        this.initCountdown2();
        this.productViewShareLink();
    }

    setProductVariant() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-option-change] [data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);
                    $(value.children[0]).find('[data-option-value]').text(select.options[selectedIndex].innerText);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                if (checked) {
                    const getSelectedOptionLabel = () => {
                        const productVariantslist = convertIntoArray(value.children);
                        const matchLabelForCheckedInput = inpt => inpt.dataset.productAttributeValue === checked.value;
                        return productVariantslist.filter(matchLabelForCheckedInput)[0];
                    };
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        const label = isBrowserIE ? getSelectedOptionLabel().innerText.trim() : checked.labels[0].innerText;
                        if (label) {
                            options.push(`${optionTitle}:${label}`);
                            $(value.children[0]).find('[data-option-value]').text(label);
                        }
                    }

                    if (type === 'swatch') {
                        const label = isBrowserIE ? getSelectedOptionLabel().children[0] : checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                            $(value.children[0]).find('[data-option-value]').text(label.title);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                if (view.find('.productView-title').length > 0){
                    const productName = view.find('.productView-title')[0].innerText.replace(/"/g, '\\$&');
                    const card = $(`[data-name="${productName}"]`);
                    card.attr('data-product-variant', productVariant);
                }
            }
        }
    }

    setProductVariant2() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-option-change-2] [data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);
                    $(value.children[0]).find('[data-option-value]').text(select.options[selectedIndex].innerText);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                if (checked) {
                    const getSelectedOptionLabel = () => {
                        const productVariantslist = convertIntoArray(value.children);
                        const matchLabelForCheckedInput = inpt => inpt.dataset.productAttributeValue === checked.value;
                        return productVariantslist.filter(matchLabelForCheckedInput)[0];
                    };
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        const label = isBrowserIE ? getSelectedOptionLabel().innerText.trim() : checked.labels[0].innerText;
                        if (label) {
                            options.push(`${optionTitle}:${label}`);
                             $(value.children[0]).find('[data-option-value]').text(label);
                        }
                    }

                    if (type === 'swatch') {
                        const label = isBrowserIE ? getSelectedOptionLabel().children[0] : checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                            $(value.children[0]).find('[data-option-value]').text(label.title);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                const productName = view.find('.productView-title')[0] ? view.find('.productView-title')[0].innerText.replace(/"/g, '\\$&') : this.$scope.find('.productView-title').text().replace(/"/g, '\\$&');
                const card = $(`[data-name="${productName}"]`);
                card.attr('data-product-variant', productVariant);
            }
        }
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     *
     * Handle product options changes
     *
     */
    productOptionsChanged(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};
            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);
            bannerUtils.dispatchProductBannerEvent(productAttributesData);

            // Change Sticky Add to cart
            $.each(productAttributesData.selected_attributes, function(i,el){
                $.each($('[data-product-option-change-2] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');
                    if(el == op){
                        $(this).prop('checked', true);
                    }
                })
            });

            $.each($('[data-product-option-change] [data-product-attribute]'), function(i) {
                var el = $(this).find('.form-radio:checked').attr('value');

                $.each($('[data-product-option-change-2] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');

                    if(el == op){
                        $(this).prop('checked', true);
                    }
                })
            });
        });
    }

    productOptionsChanged2(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }
        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};
            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);
            bannerUtils.dispatchProductBannerEvent(productAttributesData);

            $.each(productAttributesData.selected_attributes, function(i,el){
                $.each($('[data-product-option-change-2] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');
                    if(el == op){
                        $(this).prop('checked', true);
                    }
                })
            });
            
            $.each($('[data-product-option-change-2] [data-product-attribute]'), function(i) {
                var el = $(this).find('.form-radio:checked').attr('value');
                $.each($('.productView-options [data-product-option-change] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');
                    if ($(this).next().hasClass('form-option-swatch')) {
                        var opTitle = $(this).next().children('.form-option-variant').attr('title');
                    } else if ($(this).next().children('.form-option-variant').length) {
                        var opTitle = $(this).next().children('.form-option-variant').text();
                    } else {
                        var opTitle = $(this).next('.form-label').text();
                    }

                    if(el == op){
                        $(this).prop('checked', true);
                        $(this).parents('[data-product-attribute]').find('[data-option-value]').text(opTitle);
                    }
                })
            });
        });
    }

    /**
     * if this setting is enabled in Page Builder
     * show name for swatch option
     */
    showSwatchNameOnOption($swatch) {
        const swatchName = $swatch.attr('aria-label');

        $('[data-product-attribute="swatch"] [data-option-value]').text(swatchName);
        this.$swatchOptionMessage.text(`${this.swatchOptionMessageInitText} ${swatchName}`);
        this.setLiveRegionAttributes(this.$swatchOptionMessage, 'status', 'assertive');
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    showProductImage(image) {
        if (isPlainObject(image)) {
            const zoomImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.zoomSize },
                /*
                    Should match zoom size used for data-zoom-image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.productSize },
                /*
                    Should match fallback image size used for the main product image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageSrcset = utils.tools.imageSrcset.getSrcset(image.data);

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
                mainImageSrcset,
            });
        } else {
            this.imageGallery.restoreImage();
        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    listenQuantityChange() {
        this.$scope.on('click', '[data-quantity-change] button', event => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const viewModel = this.getViewModel(this.$scope);
            const $input = viewModel.quantity.$input;
            const quantityMin = parseInt($input.data('quantityMin'), 10);
            const quantityMax = parseInt($input.data('quantityMax'), 10);

            let qty = parseInt($input.val(), 10);

            // If action is incrementing
            if ($target.data('action') === 'inc') {
                // If quantity max option is set
                if (quantityMax > 0) {
                    // Check quantity does not exceed max
                    if ((qty + 1) <= quantityMax) {
                        qty++;
                    }
                } else {
                    qty++;
                }
            } else if (qty > 1) {
                // If quantity min option is set
                if (quantityMin > 0) {
                    // Check quantity does not fall below min
                    if ((qty - 1) >= quantityMin) {
                        qty--;
                    }
                } else {
                    qty--;
                }
            }

            // update hidden input
            viewModel.quantity.$input.val(qty);
            // update text
            viewModel.quantity.$text.text(qty);
        });

        // Prevent triggering quantity change when pressing enter
        this.$scope.on('keypress', '.form-input--incrementTotal', event => {
            // If the browser supports event.which, then use event.which, otherwise use event.keyCode
            const x = event.which || event.keyCode;
            if (x === 13) {
                // Prevent default
                event.preventDefault();
            }
        });
    }

    /**
     *
     * Add a product to cart
     *
     */
    addProductToCart(event, form) {
        const $addToCartBtn = $('#form-action-addToCart', $(event.target));
        const originalBtnVal = $addToCartBtn.val();
        const waitMessage = $addToCartBtn.data('waitMessage');

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        // Prevent default
        event.preventDefault();

        $addToCartBtn
            .val(waitMessage)
            .prop('disabled', true);

        this.$overlay.show();

        // Add item to cart
        utils.api.cart.itemAdd(normalizeFormData(new FormData(form)), (err, response) => {
            const errorMessage = err || response.data.error;
            const wWidth = window.innerWidth;

            $addToCartBtn
                .val(originalBtnVal)
                .prop('disabled', false);

            this.$overlay.hide();

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;

                return showAlertModal(tmp.textContent || tmp.innerText);
            }

            if ($('body[data-page-type="cart"]').length) {
                location.reload();
                return;
            }
            
            if (wWidth < 768) {
                $('.modal--quickShop .modal-close').trigger('click');
            }

            if (this.context.themeSettings.haloAddToCartAction === 'sidebar'){
                const options = {
                    template: 'common/cart-preview'
                };
                const loadingClass = 'is-loading';
                const $body = $('body');
                const $cartDropdown = $('#cart-preview-dropdown');
                const $cartLoading = $('<div class="loadingOverlay"></div>');
                const $sideCartBlock = $('#sideBlock_cart');

                setTimeout(function(){ 
                    $sideCartBlock.show();
                    $body.toggleClass('openCartSidebar is-side-block');
                    $sideCartBlock.toggleClass('is-open');
                }, 500);

                $cartDropdown
                    .addClass(loadingClass)
                    .html($cartLoading);
                $cartLoading
                    .show();

                utils.api.cart.getContent(options, (err, response) => {
                    if (err) {
                        return;
                    }
                    
                    $cartDropdown
                        .removeClass(loadingClass)
                        .html(response);
                    $cartLoading
                        .hide();

                    const quantity = $(response).find('[data-cart-quantity]').data('cartQuantity') || 0;

                    $body.trigger('cart-quantity-update', quantity);
                    haloCalculateFreeShipping(this.context);
                });
            } else {
                // Open preview modal and update content
                if (this.previewModal) {
                    this.previewModal.open();

                    if ($addToCartBtn.parents('.quickView').length === 0) this.previewModal.$preModalFocusedEl = $addToCartBtn;
                    this.updateCartContent(this.previewModal, response.data.cart_item.id, () => this.previewModal.setupFocusTrap());
                    haloCalculateFreeShipping(this.context);
                } else {
                    this.$overlay.show();
                    // if no modal, redirect to the cart page
                    this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
                }
            }
        });

        this.setLiveRegionAttributes($addToCartBtn.next(), 'status', 'polite');
    }

    /**
     * Get cart contents
     *
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    getCartContent(cartItemId, onComplete) {
        const options = {
            template: 'cart/preview',
            params: {
                suggest: cartItemId,
            },
            config: {
                cart: {
                    suggestions: {
                        limit: 4,
                    },
                },
            },
        };

        utils.api.cart.getContent(options, onComplete);
    }

    /**
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemId, onComplete) {
        this.getCartContent(cartItemId, (err, response) => {
            if (err) {
                return;
            }

            modal.updateContent(response);

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', modal.$content);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cartQuantity') || 0;
            const $promotionBanner = $('[data-promotion-banner]');
            const $backToShopppingBtn = $('.previewCartCheckout > [data-reveal-close]');
            const $modalCloseBtn = $('#previewModal > .modal-close');
            const bannerUpdateHandler = () => {
                const $productContainer = $('#main-content > .container');

                $productContainer.append('<div class="loadingOverlay pdp-update"></div>');
                $('.loadingOverlay.pdp-update', $productContainer).show();
                window.location.reload();
            };

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);

            if (onComplete) {
                onComplete(response);
            }

            if ($promotionBanner.length && $backToShopppingBtn.length) {
                $backToShopppingBtn.on('click', bannerUpdateHandler);
                $modalCloseBtn.on('click', bannerUpdateHandler);
            }
        });
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        super.updateProductAttributes(data);
        this.showProductImage(data.image);
    }

    /**
     * Sold product
     */

    soldProduct() {
        var numbersProduct_text = this.context.themeSettings.themevale_soldProduct_products;
        var numbersProductList =  JSON.parse("[" + numbersProduct_text + "]"); 
        var numbersProductItem = (Math.floor(Math.random()*numbersProductList.length));

        var numbersHours_text = this.context.themeSettings.themevale_soldProduct_hours;
        var numbersHoursList =  JSON.parse("[" + numbersHours_text + "]");
        var numbersHoursItem = (Math.floor(Math.random()*numbersHoursList.length));
     
        var soldProductText = this.context.themeSettings.themevale_soldProduct_text;
        var soldProductText2 = this.context.themeSettings.themevale_soldProduct_hours_text;
  
        $('.sold-product').html('<svg class="icon"><use xlink:href="#icon-fire" aria-hidden="true"/></svg>' + '<span>' + numbersProductList[numbersProductItem] + " " + soldProductText + " " + numbersHoursList[numbersHoursItem] + " " + soldProductText2 + '</span>');
        $('.sold-product').show();
    }

    viewingProduct() {
        var ViewerText = this.context.themeSettings.halo_viewing_product_text;
        var numbersViewer_text = this.context.themeSettings.halo_viewing_product_viewer;
        var numbersViewerList =  JSON.parse("[" + numbersViewer_text + "]"); 
        var timeViewer =  parseInt(this.context.themeSettings.halo_viewing_product_change)*1000;
        
        setInterval(function() {
            var numbersViewerItem = (Math.floor(Math.random()*numbersViewerList.length));

            $('.viewing-product span').html(numbersViewerList[numbersViewerItem] + " " + ViewerText);
            $('.viewing-product').show();
        }, timeViewer);
  
    }

    initCountdown2() {
        if ($('.countDowntimer2').length) {  
            var countDownDate = new Date( $('.countDowntimer2').attr('data-count-down2')).getTime();
            var countdownfunction = setInterval(function() {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                if (distance < 0) {
                    clearInterval(countdownfunction);
                    $(".countDowntimer2").html('');
                } else {
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    var strCountDown = "<div class='clock-item'><span class='num'>"+ days + "D</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>"+ hours + "H</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>" + minutes + "M</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>" + seconds + "S</span></div>";
                    $(".countDowntimer2").html(strCountDown);
                }
            }, 1000);
        }
    }

    productViewShareLink() {
        //
        // Share Link
        // -----------------------------------------------------------------------------
        const $shareLinkBtn = $('.shareLinkSocial__button');
        const $shareLinkPopup = $('.shareLinkSocial__popup');
        const $shareLinkClose = $('.shareLinkSocial__close');
        const $shareLinkCopy = $('#shareLinkSocial__copy');

        $shareLinkBtn.on('click', (e) => {
            e.preventDefault();

            if ($shareLinkPopup.hasClass('is-open')) {
                $shareLinkPopup.slideUp(200);
                $shareLinkPopup.removeClass('is-open');
            }
            else {
                $shareLinkPopup.slideDown(200);
                $shareLinkPopup.addClass('is-open');            
            }
        });

        $shareLinkClose.on('click', (e) => {
            e.preventDefault();

            if ($shareLinkPopup.hasClass('is-open')) {
                $shareLinkPopup.slideUp(200);
                $shareLinkPopup.removeClass('is-open');
            }
        });

        $shareLinkCopy.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.target);

            $target.select();
            document.execCommand("copy");
        });
    }
}
