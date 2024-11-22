import React from 'react'
import { useLocation } from 'react-router-dom'

import * as analytics from './ga4'

// got it from here: https://stackoverflow.com/questions/73195899/google-analytics-4-integration-in-react-ts

export function useAnalytics() {
    const location = useLocation()

    React.useEffect(() => {
        analytics.init()
    }, [])

    React.useEffect(() => {
        const path = location.pathname + location.search
        analytics.sendPageview(path)
    }, [location])
}

export default useAnalytics
