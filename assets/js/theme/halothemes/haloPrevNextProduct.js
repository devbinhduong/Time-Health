import utils from '@bigcommerce/stencil-utils';

export default function(context) {
    if (context.themeSettings.halo_prev_next_product == true) {
        const token = context.token;
        const curCode = $('.body').data('currency-code');

        if ($(window).width() > 1024) {
            if ($('.productView-nextProducts').length) {
                var productId = $('.productView-nextProducts').data('product-id'),
                    nextId = productId + 1,
                    prevId = productId - 1,
                    nextLink, prevLink, list;

                const $prodWrap = $('.productView-nextProducts .next-prev-modal'),
                    $prodIcons = $('.productView-nextProducts .next-prev-icons');

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
                                products (entityIds: [`+arr+`]) {
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
                            defaultImage {
                                img70px: url(width: 70)
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

                if(prevId != undefined && nextId != undefined) {
                    list = [prevId, nextId];

                    getProduct(list).then(data => {
                        renderProduct(data.site.products.edges, data.site.currency.display);
                    });
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

                function renderProduct(product, curDisplay) {
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
                            if (context.themeSettings.card_title_type == 'clamp') {
                                productTitle = '<a href="'+item.path+'" class="clamp" style="-webkit-box-orient: vertical; -webkit-line-clamp: 1;" aria-label="Link Go To This Product">'+item.name+'</a>'
                            } else {
                                productTitle = '<a href="'+item.path+'" class="clamp" aria-label="Link Go To This Product">'+item.name+'</a>'
                            }

                            const html_card = '<div class="card card-prevNext" data-product-id="'+item.entityId+'">\
                                                <div class="card-prevNext-image">\
                                                    <a class="card-link" href="'+item.path+'" aria-label="Link Go To This Product">\
                                                        <div class="card-img-container">\
                                                            <img class="card-image" src="'+item.defaultImage.img70px+'" alt="'+item.defaultImage.altText+'" title="'+item.defaultImage.altText+'" />\
                                                        </div>\
                                                    </a>\
                                                </div>\
                                                <div class="card-content">\
                                                    <h4 class="card-title">'+productTitle+'</h4>\
                                                    <div class="card-price" data-test-info-type="price">'+price+'</div>\
                                                </div>\
                                            </div>';

                            if (item.entityId == prevId) {
                                if (item.path !== undefined) {
                                    $prodIcons.find('.prev-icon').attr('href', item.path);
                                    $prodIcons.find('.prev-icon').removeClass('disable');
                                    $prodWrap.find('#prev-product-modal').append(html_card);
                                } else {
                                    $prodIcons.find('.prev-icon').remove();
                                    $prodWrap.find('#prev-product-modal').remove();
                                }
                            }
                            if (item.entityId == nextId) {
                                if(item.path !== undefined){
                                    $prodIcons.find('.next-icon').attr('href', item.path);
                                    $prodIcons.find('.next-icon').removeClass('disable');
                                    $prodWrap.find('#next-product-modal').append(html_card);
                                } else{
                                    $prodIcons.find('.next-icon').remove();
                                    $prodWrap.find('#next-product-modal').remove();
                                }
                            }
                        });
                    }
                }

                $prodIcons.on('mouseover', function(){
                    $prodWrap.addClass('is-active');
                })
                .on('mouseleave', function(){
                    $prodWrap.removeClass('is-active');
                    $('#next-product-modal').removeClass('is-show');
                    $('#prev-product-modal').removeClass('is-show');
                });

                $('.next-icon', $prodIcons).on('mouseover', function(){
                    if (!$(this).hasClass('disable')) {
                        $('#prev-product-modal').removeClass('is-show');
                        $('#next-product-modal').addClass('is-show');
                    }
                    else {
                        $('#prev-product-modal').removeClass('is-show');
                    }
                });

                $('.prev-icon', $prodIcons).on('mouseover', function(){
                    if (!$(this).hasClass('disable')) {
                        $('#next-product-modal').removeClass('is-show');
                        $('#prev-product-modal').addClass('is-show');
                    }
                    else {
                        $('#next-product-modal').removeClass('is-show');
                    }
                });

                $prodWrap.on('mouseover', function(){
                    $prodWrap.addClass('is-active');
                })
                .on('mouseleave', function(){
                    $prodWrap.removeClass('is-active');
                });
            }
        }
    }
}
