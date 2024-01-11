import $ from 'jquery';
import jqueryCookie from 'jquery.cookie';
import utils from '@bigcommerce/stencil-utils';
const fetch = require('node-fetch');

export default function(context) {
    const token = context.token;

    function recentlyBought() {
        var productIDs = context.themeSettings.recently_bought_productID,
            hoursItems = context.themeSettings.recently_bought_hours,
            listHours = JSON.parse("[" + hoursItems + "]"),
            listIDs = JSON.parse("[" + productIDs + "]"),
            text_info = context.themeSettings.recently_bought_text_info,
            text_name = context.themeSettings.recently_bought_text_name,
            changeSlides = 1000*(Number(context.themeSettings.recently_bought_changeSlides));

        var location1 = context.themeSettings.recently_bought_location1,
            location2 = context.themeSettings.recently_bought_location2,
            location3 = context.themeSettings.recently_bought_location3,
            location4 = context.themeSettings.recently_bought_location4,
            location5 = context.themeSettings.recently_bought_location5,
            location6 = context.themeSettings.recently_bought_location6,
            location7 = context.themeSettings.recently_bought_location7,
            location8 = context.themeSettings.recently_bought_location8;

        var ar1 = location1.split(','),
            ar2 = location2.split(','),
            ar3 = location3.split(','),
            ar4 = location4.split(','),
            ar5 = location5.split(','),
            ar6 = location6.split(','),
            ar7 = location7.split(','),
            ar8 = location8.split(',');
        
        const listIDs_length = listIDs.length;

        if (listIDs_length) {
            getProductAndSiteInfo(listIDs).then(data => {
                setInterval(function(){

                    var item = (Math.floor(Math.random()*listIDs.length));

                    var locationList = Array(ar1,ar2,ar3,ar4,ar5,ar6,ar7,ar8),
                        locationItem = (Math.floor(Math.random()*locationList.length)),
                        location = locationList[locationItem],
                        hour_item = (Math.floor(Math.random()*listHours.length)),
                        hours = listHours[hour_item];

                    const $cookieManager = $('#consent-manager');
                    const $cookieUpdate = $('#consent-manager-update-banner');
                    var cookieHeight = 0;

                    if ($cookieManager.length || $cookieUpdate.length) {
                        if ($cookieUpdate.length) {
                            cookieHeight = $cookieManager.outerHeight() + $cookieUpdate.outerHeight() + 15;
                        }
                        else {
                            cookieHeight = $cookieManager.outerHeight() + 15;
                        }
                    }

                    if ($.cookie('recently_bought_notification') == 'closed') {
                        $('#recently_bought_list').remove();
                    }

                    $(document).on('click', '.halo-recently-bought [data-close-recently-bought]', function(event){
                        event.preventDefault();
                        
                        $('#recently_bought_list').remove();
                        $.cookie('recently_bought_notification', 'closed', {expires:1, path:'/'});
                    });

                    if( $('#RB_'+ listIDs[item]).length ) {
                        if (cookieHeight > 15) {
                            $('#RB_'+ listIDs[item]).css('bottom', cookieHeight);
                        }
                        else {
                            $('#RB_'+ listIDs[item]).css('bottom', '');
                        }
                        $('#RB_'+ listIDs[item]).show();
                        $('#recently_bought_list').css('animation-name','haloFadeInLeft');
                    } else {
                        renderProduct(data.site.products.edges[item], text_name, hours, text_info, location, cookieHeight);
                    }


                    setTimeout(function(){
                        $('#recently_bought_list').css('animation-name','haloFadeOutRight');
                    }, changeSlides - 1000);

                    setTimeout(function() {
                        $('#RB_'+ listIDs[item]).hide();
                    }, changeSlides);

                }, changeSlides);
            });
        }
    }

    function getProductAndSiteInfo(arr) {
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
                }
            }
            fragment ProductFields on Product {
                id
                entityId
                name
                path
                defaultImage {
                    img320px: url(width: 320)
                    altText
                }
            }
        `}),
    }).then(res => res.json())
       .then(res => res.data);
    }

    function renderProduct(product, text, hours, info, customer, cookieHeight) {
        if (product != undefined) {
            var item = product.product;

            var html = '<div id="RB_'+item.entityId+'" class="halo-recently-bought">\
                <a href="#" data-close-recently-bought aria-label="Button Close"><svg class="icon"><use xlink:href="#icon-close"></svg></a>\
                <div class="recently-bought-inner">\
                    <a class="product-image" href="'+item.path+'"><img class="image" data-sizes="auto" src="'+item.defaultImage.img320px+'" alt="'+item.defaultImage.altText+'" title="'+item.defaultImage.altText+'" aria-label="'+item.defaultImage.altText+'"></a>\
                    <div class="product-info">\
                        <p class="text-wrap"><span class="text">'+text+'</span><span class="product-name"><a href="'+item.path+'" style="-webkit-box-orient: vertical;">'+item.name+'</a></span></p>\
                         <div class="location-info">'+hours+' '+info+' '+customer+'</div>\
                    </div>\
                </div>\
            </div>';
            
            $('#recently_bought_list').append(html);
            if (cookieHeight > 15) {
                $('#RB_'+item.entityId).css('bottom', cookieHeight);
            }
            else {
                $('#RB_'+item.entityId).css('bottom', '');
            }
            $('#recently_bought_list').css('animation-name','haloFadeInLeft');
        }
    }

    if ($(window).width() > 1024) {
        if (context.themeSettings.haloRecentlyBought == true) {
            recentlyBought();
        } 
    } else {
        if(context.themeSettings.haloRecentlyBought == true && context.themeSettings.haloRecentlyBought_mobile == true) {
            recentlyBought();
        }
    }
}
