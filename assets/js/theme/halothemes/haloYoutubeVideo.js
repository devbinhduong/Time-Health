import _ from 'lodash';

export default function youtubeCarouselFactory($scope) {
    if ($scope.find('[data-youtube]').length > 0) {
        if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
            window.onYouTubeIframeAPIReady = initCarousel.bind(window, $scope);

            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/player_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            initCarousel($scope);
        }
    }
}

function haloYoutubeSlick(slick) {
    var $slick = $(slick),
        $videos = $slick.find('[data-youtube]');

     bindEvents(slick);

    function bindEvents() {
        if ($slick.hasClass('slick-initialized')) {
            onSlickInit();
        }

        $slick.on('init', onSlickInit);
        $slick.on('beforeChange', onSlickBeforeChange);
        $slick.on('afterChange', onSlickAfterChange);
    }

    function onPlayerReady(event) {
        $(event.target.getIframe()).closest('.slick-slide').data('youtube-player', event.target);

        setTimeout(() => {
            if ($(event.target.getIframe()).closest('.slick-slide').hasClass('slick-active')) {
                $slick.slick('slickPause');
                event.target.playVideo();
            }
        }, 200);
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            $slick.slick('slickPause');
        }

        if (event.data === YT.PlayerState.ENDED) {
            $slick.slick('slickNext');
        }
    }

    function onSlickInit() {
        $videos.each((j, vid) => {
            const $vid = $(vid);
            const id = `youtube_player_${_.uniqueId()}`;

            $vid.attr('id', id);

            const player = new YT.Player(id, {
                host: 'http://www.youtube.com',
                videoId: $vid.data('youtube'),
                wmode: 'transparent',
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    enablejsapi: 1,
                    fs: 0,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    wmode: 'transparent',
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
            });
        });
    }

    function onSlickBeforeChange() {
        const player = $slick.find('.slick-slide.slick-active').data('youtube-player');

        if (player) {
            player.stopVideo();
            $slick.removeClass('slick-slider--playvideo');
        }
    }

    function onSlickAfterChange() {
        const player = $slick.find('.slick-slide.slick-active').data('youtube-player');

        if (player) {
            $slick.slick('slickPause');
            $slick.addClass('slick-slider--playvideo');
            player.playVideo();
        }
    }
}

function initCarousel($scope) {
    $scope.each((i, slick) => {
        const $slick = $(slick);

        if ($slick.find('[data-youtube]').length > 0) {
            $slick.addClass('slick-slider--video');

            haloYoutubeSlick(slick);
        }
    });
}
