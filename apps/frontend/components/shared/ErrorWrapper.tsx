import React, { PropsWithChildren } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const ErrorWrapper = ({children}:PropsWithChildren) => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
        {children}
    </ErrorBoundary>
  )
}

export default ErrorWrapper