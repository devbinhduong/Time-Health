import utils from '@bigcommerce/stencil-utils';

export default function(context) {
    const token = context.token,
          curCode = $('.body').data('currency-code');
        
    var list2 = [],
        productLookBook2 = $('#lookBook2 .lookBook2__point'),
        lookbookPopup = $('#halo-lookbook-popup'),
        lookbookSlide;

    if (productLookBook2) {
        productLookBook2.each((index, element) => {
            const productIDs = $(element).find('.lookBook2__icon').data('product-id');

            list2.push(productIDs.toString());
        });
    }

    list2 = uniqueArray(list2);

    if(list2.length > 0){
        getProduct(list2).then(data => {
            $.each(list2, (idx, item) => {
                var tmp = $('.lookBook2__productWrapper').eq(idx);

                renderProduct(data.site.products.edges, data.site.currency.display, tmp);
            });
        });
    }

    $('#lookBook2 [data-product-lookbook]').on('click', event => {
        const $thisSlide = $(event.currentTarget).parents('.lookBook2__item'),
              $thisProduct = $(event.currentTarget).data('product-id'),
              $productBlock = $thisSlide.find('.lookBook2__productWrapper');

        if($thisSlide.hasClass('show-one-product')) {
            $productBlock.find('.productGrid').addClass('is-hidden');
            $(event.currentTarget).parents('.lookBook2__img').find('.lookBook2__productPopup').removeClass('is-open');

            setTimeout(function(){
                $productBlock.find(`[data-product-id=${$thisProduct}]`).eq(0).removeClass('is-hidden');
                $thisSlide.addClass('show-one-product');
                $(event.currentTarget).parents('.lookBook2__img').find('.lookBook2__productPopup').addClass('is-open');
            }, 300);
        } else {
            $productBlock.find(`[data-product-id=${$thisProduct}]`).eq(0).removeClass('is-hidden');
            $thisSlide.addClass('show-one-product');
            $(event.currentTarget).parents('.lookBook2__img').find('.lookBook2__productPopup').addClass('is-open');
        }
    });

    $(document).on('click', '#lookBook2 .show_products', (event) => {
        event.preventDefault();

        const $thisSlide = $(event.currentTarget).parents('.lookBook2__item'),
              $productBlock = $thisSlide.find('.lookBook2__productWrapper');

        if($thisSlide.hasClass('show-one-product')) {
            $productBlock.find('.productGrid').addClass('is-hidden');
                $thisSlide.find('.lookBook2__productPopup').removeClass('is-open');
            setTimeout(function(){
                $thisSlide.removeClass('show-one-product');
            }, 300);

            setTimeout(function(){
                getProductGrid();
                $(event.target).parent().addClass('is-show');
                $(event.target).parents('.lookBook2__img').find('.lookBook2__productPopup').addClass('is-open');
            }, 300);
        } else {
            getProductGrid();

            $(event.currentTarget).parent().addClass('is-show');
            $(event.currentTarget).parents('.lookBook2__img').find('.lookBook2__productPopup').addClass('is-open');
        }

        function getProductGrid() {
            $thisSlide.find('.lookBook2__point').each((index, element) => {
                const productID = $(element).find('.lookBook2__icon').data('product-id');

                $productBlock.find(`[data-product-id=${productID}]`).eq(0).removeClass('is-hidden').addClass('productGridShow');
            });
        }
    });

    $(document).on('click', '.lookBook2__productPopup .close', event => {
        event.preventDefault();

        const $thisSlide = $(event.currentTarget).parent();
        lookbookSlide = $thisSlide.find('.productGrid');

        setTimeout(function(){
            $thisSlide.parents('.lookBook2__item').removeClass('show-one-product');
        }, 300);

        $(event.currentTarget).parents('.lookBook2__item').find('.lookBook2__btnShowProducts').removeClass('is-show');
        $(event.currentTarget).parents('.lookBook2__item').find('.lookBook2__productPopup').removeClass('is-open');
        lookbookSlide.addClass('is-hidden');
    });

    $(document).on('click', event => {
        if ($('body').hasClass('openLookbookPopup')) {
            lookbookSlide = lookbookPopup.find('.productCarousel-slide');

            if (($(event.target).closest('#halo-lookbook-popup').length === 0) && ($(event.target).closest('.lookBook1__btnShowProducts').length === 0)){
                $('body').removeClass('openLookbookPopup');
                setTimeout(function(){
                    lookbookSlide.addClass('is-hidden');
                    $('#halo-lookbook-popup .no-products').hide();
                }, 300);
            }
        }
    });

    $('#halo-lookbook-popup .lookbook-popup-title .close').on('click', event =>{
        event.preventDefault();

        lookbookSlide = lookbookPopup.find('.productCarousel-slide');

        $('body').removeClass('openLookbookPopup');
        setTimeout(function(){
            lookbookSlide.addClass('is-hidden');
            lookbookSlide.removeClass('is-active');
            $('#halo-lookbook-popup .no-products').hide();
        }, 300);
    });

    $('.halo-background').on('click', function(event) {
        if ($('body').hasClass('openLookbookPopup')) {
            lookbookSlide = lookbookPopup.find('.productCarousel-slide');

            $('body').removeClass('openLookbookPopup');
            setTimeout(function(){
                lookbookSlide.addClass('is-hidden');
                lookbookSlide.removeClass('is-active');
                $('#halo-lookbook-popup .no-products').hide();
            }, 300);
        }
    });

    function getShopTheLook2(event) {
        const $thisSlide = $(event).parents('.lookBook2__item');
        lookbookSlide = lookbookPopup.find('.productCarousel-slide');

        if($('body').hasClass('openLookbookPopup')) {
            $('#lookBook2 .lookBook2__btnShowProducts').removeClass('is-show');
            $('body').removeClass('openLookbookPopup');
            lookbookSlide.addClass('is-hidden');
            $('#halo-lookbook-popup .no-products').hide();

            setTimeout(function(){
                getProductSlide();
                $(event).parent().addClass('is-show');
                $('body').addClass('openLookbookPopup');
            }, 300);
        } else {
            getProductSlide();

            $(event).parent().addClass('is-show');
            $('body').addClass('openLookbookPopup');
        }

        function getProductSlide() {
            $thisSlide.find('.lookBook2__point').each((index, element) => {
                const productID = $(element).find('.lookBook2__icon').data('product-id');

                lookbookPopup.find(`[data-product-id=${productID}]`).eq(0).removeClass('is-hidden');
                lookbookPopup.find(`[data-product-id=${productID}]`).eq(0).attr('data-index', index);

            });
        }
    }

    function getProduct(arr) {
      return fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          query: `
            query MyQuery {
                site {
                    products (entityIds: [`+arr+`], first: 50) {
                      edges {
                        product: node {
                          ...ProductFields
                          }
                        }
                    }
                    currency (currencyCode: `+curCode+`) {
                        display {
                            symbol
                            symbolPlacement
                            decimalToken
                            thousandsToken
                            decimalPlaces
                        }
                    }
                }
            }
            fragment ProductFields on Product {
                id
                entityId
                name
                path
                inventory {
                    isInStock
                    hasVariantInventory
                }
                productOptions {
                    edges {
                        node {
                            entityId
                            displayName
                            isRequired
                        }
                    }
                }
                defaultImage {
                    img250px: url(width: 250)
                    altText
                }
                prices {
                    priceRange {
                        min {
                            ...MoneyFields
                        }
                        max {
                            ...MoneyFields
                        }
                    }
                    retailPrice {
                        ...MoneyFields
                    }
                    basePrice {
                        ...MoneyFields
                    }
                    price {
                        ...MoneyFields
                    }
                }
            }
            fragment MoneyFields on Money {
                value
                currencyCode
            }
        `}),
    }).then(res => res.json())
       .then(res => res.data);
    }

    function formatMoney(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }

    function renderProduct(product, curDisplay, tmp_3) {
        if (product != undefined) {
            $.each(product, (index, element) => {
                const item = element.product,
                    symbol = curDisplay.symbol,
                    symbolPlacement = curDisplay.symbolPlacement.toLowerCase(),
                    decimalToken = curDisplay.decimalToken,
                    decimalPlaces = curDisplay.decimalPlaces,
                    thousandsToken = curDisplay.thousandsToken;
                let title, price;

                if ($('.body').hasClass('is-login') || context.themeSettings.restrict_to_login !== true) {
                    if (item.prices.priceRange.min.value < item.prices.priceRange.max.value && context.themeSettings.price_ranges) {
                        const priceMin = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.priceRange.min.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");
                        const priceMax = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.priceRange.max.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");

                        price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax price-none" style="display: none;">\
                                    <span data-product-non-sale-price-without-tax="" class="price price--non-sale"></span>\
                                </div>\
                                <div class="price-section price-section--withoutTax">\
                                    <span data-product-price-without-tax="" class="price price--withoutTax">'+priceMin+' - '+priceMax+'</span>\
                                </div>';
                    }
                    else {
                        const priceDef = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.price.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");

                        if (item.prices.retailPrice == null) {
                            if (item.prices.basePrice.value > item.prices.price.value) {
                                const priceBas = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.basePrice.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");

                                price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax">\
                                            <span data-product-non-sale-price-without-tax="" class="price price--non-sale">'+priceBas+'</span>\
                                        </div>\
                                        <div class="price-section price-section--withoutTax">\
                                            <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                        </div>';
                            }
                            else {
                                price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax price-none" style="display: none;">\
                                            <span data-product-non-sale-price-without-tax="" class="price price--non-sale"></span>\
                                        </div>\
                                        <div class="price-section price-section--withoutTax">\
                                            <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                        </div>';
                            }
                        }
                        else {
                            if (item.prices.retailPrice.value > item.prices.price.value) {
                                const priceRet = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.retailPrice.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");
                            
                                price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax">\
                                            <span data-product-non-sale-price-without-tax="" class="price price--non-sale">'+priceRet+'</span>\
                                        </div>\
                                        <div class="price-section price-section--withoutTax">\
                                            <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                        </div>';
                            }
                            else {
                                price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax price-none" style="display: none;">\
                                            <span data-product-non-sale-price-without-tax="" class="price price--non-sale"></span>\
                                        </div>\
                                        <div class="price-section price-section--withoutTax">\
                                            <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                        </div>';
                            }
                        }
                    }
                }
                else {
                    price = '<p translate>Log in for pricing</p>';
                }

                var productTitle;

                if (context.themeSettings.halo_card_title == 'ellipsis') {
                    productTitle = '<a href="'+item.path+'" class="clamp" style="-webkit-box-orient: vertical; -webkit-line-clamp: 2;" aria-label="Link Go To This Product"><span>'+item.name+'</span></a>'
                } else {
                    productTitle = '<a href="'+item.path+'" class="clamp" aria-label="Link Go To This Product"><span>'+item.name+'</span></a>'
                }

                const tmp = $('.lookbook-popup-content');
                const html_card = '<div class="productCarousel-slide is-hidden" data-product-id="'+item.entityId+'">\
                                <div class="product">\
                                    <article class="card">\
                                        <figure class="card-figure">\
                                            <div class="card-img-container">\
                                                <a href="'+item.path+'"><img class="card-image" src="'+item.defaultImage.img250px+'" alt="'+item.defaultImage.altText+'" title="'+item.defaultImage.altText+'"></a>\
                                            </div>\
                                        </figure>\
                                        <div class="card-body">\
                                            <h4 class="card-title">'+productTitle+'</h4>\
                                            <a class="card-price-wrapper" href="'+item.path+'">\
                                                <div class="card-price" data-test-info-type="price">'+price+'</div>\
                                            </a>\
                                        </div>\
                                    </article>\
                                </div>\
                            </div>';

                const html_card_3 = '<div class="productGrid is-hidden" data-product-id="'+item.entityId+'">\
                                <div class="product">\
                                    <article class="card">\
                                        <figure class="card-figure">\
                                            <div class="card-img-container">\
                                                <a href="'+item.path+'"><img class="card-image" src="'+item.defaultImage.img250px+'" alt="'+item.defaultImage.altText+'" title="'+item.defaultImage.altText+'"></a>\
                                            </div>\
                                        </figure>\
                                        <div class="card-body">\
                                            <h4 class="card-title">'+productTitle+'</h4>\
                                            <a class="card-price-wrapper" href="'+item.path+'">\
                                                <div class="card-price" data-test-info-type="price">'+price+'</div>\
                                            </a>\
                                        </div>\
                                    </article>\
                                </div>\
                            </div>';

                tmp.append(html_card);
                if(tmp_3 != undefined) {
                    tmp_3.append(html_card_3);
                }
            });
        }
    }

    function uniqueArray(list) {
        var result = [];

        $.each(list, (index, element) => {
            if ($.inArray(element, result) == -1) {
                result.push(element);
            }
        });

        return result;
    }
}
