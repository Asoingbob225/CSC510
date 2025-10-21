import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import successIllustration from '@/assets/welcome-hi.png';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error';

interface VerificationState {
  status: VerificationStatus;
  message: string;
}

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'pending',
    message: 'Click the button below to verify your email address.',
  });

  const handleVerifyClick = async () => {
    const token = searchParams.get('token');

    if (!token) {
      setVerificationState({
        status: 'error',
        message: 'Invalid verification link. No token provided.',
      });
      return;
    }

    setVerificationState({
      status: 'verifying',
      message: 'Verifying your email...',
    });

    try {
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationState({
          status: 'success',
          message: data.message || 'Email verified successfully!',
        });
      } else {
        const errorData = await response.json();
        setVerificationState({
          status: 'error',
          message: errorData.detail || 'Verification failed. The link may be invalid or expired.',
        });
      }
    } catch {
      setVerificationState({
        status: 'error',
        message: 'An error occurred while verifying your email. Please try again later.',
      });
    }
  };

  const handleContinue = () => {
    if (verificationState.status === 'success') {
      // Redirect to login or home page
      navigate('/');
    } else {
      // Redirect to signup page to try again
      navigate('/signup');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="flex flex-col items-center text-center">
          {verificationState.status === 'pending' && (
            <>
              <div className="mb-6 flex size-32 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="size-16 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-semibold text-gray-800">Verify Your Email</h1>
              <p className="mb-6 text-gray-600">{verificationState.message}</p>
              <Button
                onClick={handleVerifyClick}
                className="w-full cursor-pointer bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90"
              >
                Verify Email
              </Button>
            </>
          )}

          {verificationState.status === 'verifying' && (
            <>
              <div className="mb-6 size-16 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500"></div>
              <h1 className="mb-2 text-2xl font-semibold text-gray-800">Verifying Your Email</h1>
              <p className="text-gray-600">{verificationState.message}</p>
            </>
          )}

          {verificationState.status === 'success' && (
            <>
              <img
                className="mb-6 size-32 object-contain"
                src={successIllustration}
                alt="Success illustration"
              />
              <h1 className="mb-2 text-2xl font-semibold text-emerald-600">Email Verified!</h1>
              <p className="mb-6 text-gray-600">{verificationState.message}</p>
              <Button
                onClick={handleContinue}
                className="w-full cursor-pointer bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90"
              >
                Continue to Login
              </Button>
            </>
          )}

          {verificationState.status === 'error' && (
            <>
              <div className="mb-6 flex size-32 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="size-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-semibold text-red-600">Verification Failed</h1>
              <p className="mb-6 text-gray-600">{verificationState.message}</p>
              <Button
                onClick={handleContinue}
                className="w-full cursor-pointer bg-gray-500 text-white shadow-md hover:bg-gray-500/90"
              >
                Back to Signup
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
