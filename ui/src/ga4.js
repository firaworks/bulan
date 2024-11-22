import ga4 from 'react-ga4'

const TRACKING_ID = 'G-6FC9YCEJXN'
const isProduction = process.env.NODE_ENV === 'production'

export const init = () => ga4.initialize(TRACKING_ID, {
    testMode: !isProduction
})

export const sendEvent = (name) => ga4.event('screen_view', {
    app_name: "Bulan",
    screen_name: name,
})

export const sendPageview = (path) => ga4.send({
    hitType: 'pageview',
    page: path
})
