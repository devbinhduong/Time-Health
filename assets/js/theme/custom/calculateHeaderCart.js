export default function (themeSettings) {
    if (themeSettings.custom_layout == true) {
        var cartPage = '/cart.php';

        $.ajax({
            url: cartPage,
            type: 'GET',
            success: function (data) {
                var subTotalPrice = $(data).find('.cart-subtotal-value').html();
                if (subTotalPrice) {
                    $('.totalValue').html(subTotalPrice);
                } else {
                    $('.totalValue').text('£0.00');
                }
            },
        });
    }
}
