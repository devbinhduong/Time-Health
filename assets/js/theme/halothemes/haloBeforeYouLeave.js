import utils from '@bigcommerce/stencil-utils';
import 'slick-carousel';
import swal from '../global/sweet-alert';
import Cart from '../cart';

export default function(context){
	const $beforeLeave = $('#before-you-leave');

	function setCookie(cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      const expires = 'expires=' + d.toUTCString();
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
   }

   function getCookie(cname) {
      const name = cname + '=';
      const ca = document.cookie.split(';');

      for (var i = 0; i < ca.length; i++) {
         var c = ca[i];
         while (c.charAt(0) === ' ') {
            c = c.substring(1);
         }
         if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
         }
      }
      return '';
   }

   const deleteCookie = function(name) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
   };

	var BC_Products = function() {
	    var e = {
	        howManyToShow: 3,
	        howManyToStoreInMemory: 10,
	        onComplete: null
	    };
	    var t = [];
	    var n = null;
	    var r = null;
	    var i = 0;
	    var s = {
	        configuration: {
	            expires: context.themeSettings.before_you_leave_history_expires_date,
	            path: "/",
	            domain: window.location.hostname
	        },
	        name: "bigcommerce_history",
	        write: function(e) {
	            setCookie(this.name, e.join(" "), this.configuration.expires)
	        },
	        read: function() {
	            var e = [];
	            var t = getCookie(this.name);
	            if (t !== null && t != undefined) {
	                e = t.split(" ")
	            }
	            return e
	        },
	        destroy: function() {
	            setCookie(this.name, null, this.configuration.expires)
	        },
	        remove: function(e) {
	            var t = this.read();
	            var n = $.inArray(e, t);
	            if (n !== -1) {
	                t.splice(n, 1);
	                this.write(t)
	            }
	        }
	    };
	    var o = function() {
	        if (e.onComplete) {
	            try {
	                e.onComplete()
	            } catch (t) {}
	        }
	    };
	    var u = function() {
	    	const $option = {
	            template: 'halothemes/products/halo-before-you-leave-temp'
	        };

	        const limit = context.themeSettings.before_you_leave_history_count;

			var unique = (function(t){
				var m = {}, unique = []
			  	
			  	for (var i=0; i<=limit; i++) {
			    	var v = t[i];
			    	
			    	if (!m[v]) {
			      		unique.push(v);
			      		m[v]=true;
			    	}
			  	}

			  	return unique;
			})(t);

	        var count = unique.length - 1,
	        	$tab = $beforeLeave.find('#tab-history');

	        if($tab.length) {
	        	$tab.find('.productGrid').empty();

		    	for (var j = 0; j < e.howManyToShow; j++) {
		    		var $prodId = unique[j];

		    		utils.api.product.getById($prodId, $option, (err, response) => {
			            if (err) {
			                return false;
			            }

			            if ($tab.find('.product').length < limit){
			            	$tab.find('.productGrid').append(response);
			            }

			            i++;

	                	if(i >= e.howManyToShow){
	                		$tab.find('.no-products').remove();
	                	}
			        });
		    	}
		    }

		    $beforeLeave.find('.tab.history .count').text(count);
	    };
	    return {
	        resizeImage: function(e, t) {
	            if (t == null) {
	                return e
	            }
	            if (t == "master") {
	                return e.replace(/http(s)?:/, "")
	            }
	            var n = e.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?/i);
	            if (n != null && n != undefined) {
	                var r = e.split(n[0]);
	                var i = n[0];
	                return (r[0] + "_" + t + i).replace(/http(s)?:/, "")
	            } else {
	                return null
	            }
	        },
	        showHistory: function(i) {
	            var i = i || {};
	            jQuery.extend(e, i);
	            t = s.read();
	            e.howManyToShow = Math.min(t.length, e.howManyToShow);
	            
	            if (e.howManyToShow) {
	                u();
	            }
	        },
	        getConfig: function() {
	            return e
	        },
	        clearList: function() {
	            s.destroy()
	        },
	        recordHistory: function(t) {
	            var t = t || {};
	            var product_id = $('.productView').find('form[data-cart-item-add] [name="product_id"]').val();
	            
	            jQuery.extend(e, t);
	            var n = s.read();
	            
	            if (product_id) {
	                var r = product_id;
	                var i = jQuery.inArray(r, n);
	                if (i === -1) {
	                    n.unshift(r);
	                    n = n.splice(0, e.howManyToStoreInMemory)
	                } else {
	                    n.splice(i, 1);
	                    n.unshift(r)
	                }
	                s.write(n)
	            }
	        }
	    }
	}();
	
	// Before You Leave 
	function ProductsCarousel(tab) {
		if(!tab.hasClass('slick-slider')) {
	        tab.slick({
	            dots: true,
	            arrows: false,
	            slidesToShow: 1,
	            slidesToScroll: 1,
	            slidesPerRow: 1,
                rows: 1,
	            mobileFirst: true,
	            infinite: false,
	            responsive: [
	            {
	              breakpoint: 1024,
	              settings: {
	                slidesPerRow: 1,
                    rows: 3
	              }
	            },
	            {
	              breakpoint: 767,
	              settings: {
	                slidesPerRow: 1,
                    rows: 2
	              }
	            }
	          ]
	        });
	    }
	}

    function beforeYouLeave() {
        var beforeYouLeave_time = parseInt($('#before-you-leave').data("time")) * 60 * 1000;
        var beforeYouLeave = $("#before-you-leave");

        var productLoadTime = beforeYouLeave_time/2 + 100;

 		if (beforeYouLeave_time < 2) {
        	beforeYouLeave_time = beforeYouLeave_time + 100;
        }

        if (!$(beforeYouLeave).length) {
            return;
        } else {
        	var idleTime = 0;

	        $(document).ready(function () {
	            setTimeout(function(){
	            	recommendedProducts();
                	historyProducts();
	            }, productLoadTime);

	            var slickInterval = setInterval(function() {
	            	timerIncrement();	            	
	            }, beforeYouLeave_time + 1000);
	        });
	        
	        $(document).on('mousemove', function() {
	        	resetTimer();
	        });

	        $(document).on('keydown', function() {
	        	resetTimer();
	        });

	        $(document).on('scroll', function() {
	        	resetTimer();
	        });
        }
        
        function timerIncrement() {
            idleTime = idleTime + 1;
            if (idleTime >= 1 && !$('body.halo-open-before-you-leave').length ) {
                if (!$('body.halo-open-before-you-leave').length) {
            		var tab = $('#tab-recommended .productGrid');

	                setTimeout(function(){ 
		    			beforeYouLeave.show();
		    			$('body').addClass('halo-open-before-you-leave');
	                	ProductsCarousel(tab);
		    		}, 100);
            	}
            }
        }

        function resetTimer() {
            idleTime = -1;
        }

        function recommendedProducts() {
        	var showBrand = context.themeSettings.show_brand_product_cards;
            var productIDS = context.themeSettings.before_you_leave_recommended_id;
            var listIDs = JSON.parse("[" + productIDS + "]");
            var count;
            var tab = $('#tab-recommended .productGrid .productCarousel-slide');
            var type = context.themeSettings.card_title_type;
            var typeTitle = '';
            if (type = "clamp") {
            	typeTitle = 'class="clamp" style="-webkit-box-orient: vertical; -webkit-line-clamp: 1;"';
            }
            for (var i = 0; i < listIDs.length; i++) {
                 var productId = listIDs[i];
                 if ($('#before-you-leave #tab-recommended').length) {
                   if ($('#before-you-leave #tab-recommended .productGrid .productCarousel-slide').length <= i) {
                        utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
                            var data_product_id = $('.productView-details [name="product_id"]', $(response)).val();
                            var brand = $('.productView-brand a', $(response)).text();
                            var name = $('.productView-product .productView-title', $(response)).text();
                            var img = $('.productView-image', $(response)).find('img').attr('src');
                            var url = $('.productView-product .productView-title', $(response)).data('url');
                            var rating = $('.productView-rating .product-ratings', $(response)).html();
                            var price = $('.productView-price', $(response)).html(); 
                            var brandHTML = '';

                            // if (showBrand == true) {
                            	brandHTML = '<p class="card-text card-brand" data-test-info-type="brandName">'+brand+'</p>';
                            // }

                            //Data Option
                            var data_optionSwatch =  $('[data-product-option-change]',$(response)).find('[data-product-attribute="swatch"]');
                            var $data_optionSwatch = $(data_optionSwatch).find('.form-label--alternate, .form-radio, .form-option-expanded').remove().end();
                        	data_optionSwatch = $data_optionSwatch;
                        	var data_option = data_optionSwatch.html();
                            
                            var dataOption = '';

                            var $tab = $beforeLeave.find('#tab-recommended');

                            if(data_product_id != undefined && data_product_id != '' && data_product_id != null) {

                            	$tab.find('.no-products').remove();

	                            if (data_option != undefined) {
	                            	dataOption = '<div class="card_optionImage product-option-'+ productId + '"><div data-product-option-change3><div data-product-attribute=\"swatch\">' + data_option + '</div></div></div>';
	                            }

	                            // New Label
	                            var new_label = $('.product-img-box',$(response)).find('.new-badge').html();
	                            var newLabel = '';

	                            if (new_label != undefined) {
	                            	newLabel = '<div class="product-badge new-badge">'+new_label+'</div>';
	                            }

	                            //Sale Label
	                            var sale_label = $('.product-img-box',$(response)).find('.sale-badge').html();
	                            var saleLabel = '';

	                            if (sale_label != undefined) {
	                            	saleLabel = '<div class="product-badge sale-badge">'+sale_label+'</div>';
	                            }

	                            //soldout Label
	                            var soldout_label = $('.product-img-box',$(response)).find('.soldout-badge').html();
	                            var soldoutLabel = '';

	                            if (soldout_label != undefined) {
	                            	soldoutLabel = '<div class="product-badge soldout-badge">'+soldout_label+'</div>';
	                            }

	                            //Custom Label
	                            var custom_label = $('.product-img-box',$(response)).find('.custom-badge').html();
	                            var customLabel = '';

	                            if (custom_label != undefined) {
	                            	customLabel = '<div class="product-badge custom-badge">'+custom_label+'</div>';
	                            }

	                            var html = '<div class="productCarousel-slide">\
	                            				<div class="product">\
		                                            <article class="card" data-product-id="'+data_product_id+'">\
		                                                <figure class="card-figure">\
		                                                '+newLabel+'\
		                                                '+saleLabel+'\
		                                                '+soldoutLabel+'\
		                                                '+customLabel+'\
		                                                <div class="card-img-container">\
		                                                    <a href="'+url+'"><img class="card-image" src="'+img+'" alt="'+name+'" title="'+name+'"></a>\
		                                                </div>\
		                                                </figure>\
		                                                <div class="card-body">\
		                                                    '+brandHTML+'\
		                                                    <h4 class="card-title"><a '+typeTitle+' href="'+url+'">'+name+'</a></h4>\
		                                                    <p class="card-text" data-test-info-type="productRating"><span role="img" aria-label="Product rating">'+rating+'</span></p>\
		                                                    <div class="card-text card-price">'+price+'</div>\
		                                                    '+dataOption+'\
		                                                    <button href="/wishlist.php?action=add&product_id='+data_product_id+'" class="wishlist button" aria-label="Add Wish List">\
										                        <svg class="icon" aria-hidden="true"><use xlink:href="#icon-wishlist"/></svg>\
										                        <span class="text">Add Wish List</span>\
										                    </button>\
		                                                </div>\
		                                            </article>\
	                                            </div>\
	                                        </div>';

	                            $('#before-you-leave #tab-recommended .productGrid').append(html);

	                            count = $('#tab-recommended .productGrid .productCarousel-slide').length;
	                            $('#before-you-leave .before-you-leave-tab .recommended .count').html(count);
	                        }
                        });
                   } else {
                   		return;
                   }
                }
            }
        }

        $('.before-you-leave-continue').on('click', function(e) {
            if ($('body').hasClass('halo-open-before-you-leave')) {
                $('body').removeClass('halo-open-before-you-leave');
            }
        });

        $('.halo-overlay-background').on('click', function(e) {
            if ($('body').hasClass('halo-open-before-you-leave')) {
                $('body').removeClass('halo-open-before-you-leave');
            }
        });

        $("#before-you-leave .before-you-leave-tab .tab").on("click", function() {
			var tabId= $(this).data('id');
	    	var tab = $(".before-you-leave-tab .tabs-contents #tab-"+tabId+" .productGrid");
	    	setTimeout(function(){ProductsCarousel(tab)},20);
	    	
	    });
    }

    function historyProducts(){
    	BC_Products.recordHistory();

    	var cookieValue = getCookie("bigcommerce_history");

    	if (!(cookieValue !== null && cookieValue !== undefined && cookieValue !== "")) {
		    $('#before-you-leave .tab.history .count').text("0");
		} else{
			BC_Products.showHistory({
			    howManyToShow: context.themeSettings.before_you_leave_history_count,
			    howManyToStoreInMemory: context.themeSettings.before_you_leave_history_count,
			    onComplete: function() {}
			});
		}
    }

	beforeYouLeave();
}
