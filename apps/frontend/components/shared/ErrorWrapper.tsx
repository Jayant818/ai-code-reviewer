import React, { PropsWithChildren } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorDisplay from './ErrorDisplay'

const ErrorWrapper = ({children}:PropsWithChildren) => {
  return (
    <ErrorBoundary fallbackRender={({ error }) => (
      <ErrorDisplay error={error} />
    )}>
        {children}
    </ErrorBoundary>
  )
}

export default ErrorWrapper