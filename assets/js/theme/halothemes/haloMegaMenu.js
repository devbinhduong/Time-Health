import utils from '@bigcommerce/stencil-utils';

export default class haloMegaMenu{
    constructor() {}

    menuItem(num) {
        return {
            setMegaMenu(param) {
                param = $.extend({
                    style: '',
                    dropAlign: 'fullWidth',
                    dropWidth: '493px',
                    cateColumns: 1,
                    disabled: false,
                    bottomCates: '',
                    products:'',
                    productId: '',
                    label: '',
                    labelType: '',
                    content: '',
                    imagesTop: '',
                    imagesCustom: ''
                }, param);

                var $scope = $('.navPages-list:not(.navPages-list--user) > li:nth-child('+num+')');

                if(!$scope.hasClass('navPages-item-toggle')){
                    if (param.disabled === false) {
                        const subMegaMenu = $scope.find('> .navPage-subMenu');

                        if(param.style === 'style 1') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-1 fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){
                                    subMegaMenu.find('> .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');

                                    subMegaMenu.find('.cateArea').prepend(param.content);
                                }

                                if(!subMegaMenu.find('.imageArea').length){
                                    subMegaMenu.append('<div class="imageArea"><div class="megamenu-right-item">'+param.images+'</div></div>');
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                subMegaMenu.addClass('haloCustomScrollbar');
                            }
                        }

                        if(param.style === 'style 2') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-2 fullWidth');
                            }

                            if(!subMegaMenu.find('.cateArea').length){
                                subMegaMenu.find('> .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');
                            }

                            if(!subMegaMenu.find('.imageArea').length){
                                subMegaMenu.append('<div class="imageArea"><div class="megamenu-right-item">'+param.images+'</div></div>');
                                
                                if (param.products.length && (param.products !== '')) {
                                    subMegaMenu.find('.imageArea').prepend('<div class="megamenu-left-item megamenu-product-list">'+param.products+'</div>');
                                }
                            }

                            subMegaMenu.find('.imageArea').css({
                                'width': '100%',
                                'max-width': param.imageAreaWidth
                            });

                            subMegaMenu.find('.cateArea').css({
                                'width': '100%',
                                'max-width': param.cateAreaWidth
                            });

                            subMegaMenu.addClass('haloCustomScrollbar');

                            if (param.productId.length && (param.productId !== '')) {
                                var productIDS = param.productId,
                                    featuredProductCarousel = subMegaMenu.find('.megamenu-product-list');

                                const $options = {
                                    template: 'halothemes/products/halo-product-temp'
                                };

                                if (productIDS !== '') {
                                    var listIDs = JSON.parse("[" + productIDS + "]");

                                    if (featuredProductCarousel.length) {
                                        featuredProductCarousel.find('.megamenu-slider').addClass('is-loading');

                                        const listIDs_length = listIDs.length;
                                        let n = 0;

                                        for (var i = 0; i < listIDs_length; i++) {
                                            var productId = listIDs[i];

                                            utils.api.product.getById(productId, $options, (err, response) => {
                                                var hasProd = $(response).find('.card').data('product-id');

                                                if(hasProd != undefined && hasProd !== null && hasProd !== ''){
                                                    featuredProductCarousel.find('.megamenu-slider').append(response);

                                                    n++;
                                                    if (n == listIDs_length) {
                                                        productSlider(featuredProductCarousel);
                                                    }
                                                }
                                            });
                                        }

                                        featuredProductCarousel.find('.megamenu-slider').removeClass('is-loading');
                                    }
                                }

                                function productSlider(wrap){
                                    $('.megamenu-slider', subMegaMenu).slick({
                                        infinite: false,
                                        dots: false,
                                        arrows: true,
                                        slidesToShow: 1,
                                        slidesToScroll: 1,
                                        adaptiveHeight: true
                                    });
                                } 
                            }
                        }

                        if(param.style === 'style 3') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-3 fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){
                                    subMegaMenu.find('> .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');

                                    subMegaMenu.find('.cateArea').prepend(param.content);
                                }

                                if(!subMegaMenu.find('.imageArea').length){
                                    subMegaMenu.append('<div class="imageArea"><div class="megamenu-left-item">'+param.images+'</div></div>');
                                    
                                    if (param.products.length && (param.products !== '')) {
                                        subMegaMenu.find('.imageArea').append('<div class="megamenu-right-item megamenu-brand-list">'+param.products+'</div>');
                                    }
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                subMegaMenu.addClass('haloCustomScrollbar');
                            }

                            const $megamenuBrands = $('.megamenu-brands');
                            const $menubrandItem = $('.haloMegamenuBrand__list li');

                            $menubrandItem.each(function(index, element) {
                                const txt = $(element).data('brand-letter');

                                if (!$megamenuBrands.find('[data-brand-letter="'+txt+'"]').hasClass('has-letter')) {
                                    $megamenuBrands.find('[data-brand-letter="'+txt+'"]').addClass('has-letter');
                                }   
                            });
                        }

                        const navPagesAction = $scope.children('.navPages-action');

                        if (param.labelType === 'new') {
                            navPagesAction.append('<span class="navPages-label new-label">'+param.label+'</span>');
                        } else if (param.labelType === 'sale') {
                            navPagesAction.append('<span class="navPages-label sale-label">'+param.label+'</span>');
                        } else if (param.labelType === 'hot') {
                            navPagesAction.append('<span class="navPages-label hot-label">'+param.label+'</span>');
                        }
                    } else{
                        const navPagesAction = $scope.children('.navPages-action');

                        if (param.labelType === 'new') {
                            navPagesAction.append('<span class="navPages-label new-label">'+param.label+'</span>');
                        } else if (param.labelType === 'sale') {
                            navPagesAction.append('<span class="navPages-label sale-label">'+param.label+'</span>');
                        } else if (param.labelType === 'hot') {
                            navPagesAction.append('<span class="navPages-label hot-label">'+param.label+'</span>');
                        }
                    }
                }

                return this;
            }
        }
    }
}
