import nod from '../common/nod';
import { CollapsibleEvents } from '../common/collapsible';
import forms from '../common/models/forms';
import { safeString } from '../common/utils/safe-string';
import { announceInputErrorMessage } from '../common/utils/form-utils';

export default class {
    constructor($reviewForm) {
        this.validator = nod({
            submit: $reviewForm.find('input[type="submit"]'),
            tap: announceInputErrorMessage,
        });

        this.$reviewsContent = $('#product-reviews');
        this.$collapsible = $('[data-collapsible]', this.$reviewsContent);

        this.initLinkBind();
        this.injectPaginationLink();
        this.collapseReviews();
    }

    /**
     * On initial page load, the user clicks on "(12 Reviews)" link
     * The browser jumps to the review page and should expand the reviews section
     */
    initLinkBind() {
        const $content = $('#productReviews-content', this.$reviewsContent);

        $('#productReview_link').on('click', () => {
            $('.productView-reviewTabLink').trigger('click');
            if (!$content.hasClass('is-open')) {
                this.$collapsible.trigger(CollapsibleEvents.click);
            }
        });
    }

    collapseReviews() {
        // We're in paginating state, do not collapse
        if (window.location.hash && window.location.hash.indexOf('#product-reviews') === 0) {
            return;
        }

        // force collapse on page load
        this.$collapsible.trigger(CollapsibleEvents.click);
    }

    /**
     * Inject ID into the pagination link
     */
    injectPaginationLink() {
        const $nextLink = $('.pagination-item--next .pagination-link', this.$reviewsContent);
        const $prevLink = $('.pagination-item--previous .pagination-link', this.$reviewsContent);

        if ($nextLink.length) {
            $nextLink.attr('href', `${$nextLink.attr('href')} #tab-reviews`);
        }

        if ($prevLink.length) {
            $prevLink.attr('href', `${$prevLink.attr('href')} #tab-reviews`);
        }
    }

    registerValidation(context) {
        this.context = context;
        this.validator.add([{
            selector: '[name="revrating"]',
            validate: 'presence',
            errorMessage: safeString(this.context.reviewRating),
        }, {
            selector: '[name="revtitle"]',
            validate: 'presence',
            errorMessage: safeString(this.context.reviewSubject),
        }, {
            selector: '[name="revtext"]',
            validate: 'presence',
            errorMessage: safeString(this.context.reviewComment),
        }, {
            selector: '.writeReview-form [name="email"]',
            validate: (cb, val) => {
                const result = forms.email(val);
                cb(result);
            },
            errorMessage: this.context.reviewEmail,
        }]);

        return this.validator;
    }

    validate() {
        return this.validator.performCheck();
    }
}
