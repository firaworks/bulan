import React from 'react'

export function userFbLogin() {
    React.useEffect(() => {
        window.fbAsyncInit = function () {
            FB.init({
                appId: '1202053838003461',
                cookie: true,
                xfbml: true,
                version: 'v2.7'
            });

            FB.AppEvents.logPageView();

        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, [])
}

export default userFbLogin

