import { APIError, ValidationError } from "@/lib/errors";
import Link from "next/link";
import { FaExclamationTriangle } from "react-icons/fa";

const ErrorDisplay = ({ 
  error, 
//   onRetry, 
}: { 
  error: ValidationError | APIError;  
//   onRetry?: () => void;
}) => {
  const isValidationError = error instanceof ValidationError;
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {isValidationError ? "Data Error" : "Something went wrong"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error.message}
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          {/* {!isValidationError && (
            <button 
              onClick={onRetry}
              className="fire-gradient text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          )} */}
          <Link
            href={"/"}
            className="border border-gray-300 text-foreground px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Go to Home
          </Link>
        </div>
        
        {isValidationError && (
          <p className="text-sm text-muted-foreground mt-4">
            If this problem persists, please contact support.
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;