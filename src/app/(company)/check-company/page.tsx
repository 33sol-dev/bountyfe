"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Page = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const checkCompany = async () => {
      try {
        setStatus('Checking authentication...');
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setTimeout(() => router.push('/sign-in'), 2000);
          return;
        }

        setStatus('Verifying company information...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/companies`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          if (data && data.companies && data.companies.length > 0) {
            setStatus('Company found! Redirecting to dashboard...');
            setTimeout(() => router.push('/dashboard'), 1000);
          } else {
            setStatus('No company found. Redirecting to company creation...');
            setTimeout(() => router.push('/create-company'), 1000);
          }
        } else {
          switch (response.status) {
            case 401:
              setError('Authentication expired. Please log in again.');
              localStorage.removeItem('token');
              setTimeout(() => router.push('/sign-in'), 2000);
              break;
            case 403:
              setError('You do not have permission to access this resource.');
              setTimeout(() => router.push('/sign-in'), 2000);
              break;
            case 404:
              setError('Company service not found. Please try again later.');
              setTimeout(() => router.push('/create-company'), 2000);
              break;
            case 429:
              setError('Too many requests. Please try again in a few minutes.');
              break;
            case 500:
              setError('Server error. Please try again later.');
              setTimeout(() => router.push('/create-company'), 2000);
              break;
            default:
              setError(`Unexpected error: ${data.message || 'Unknown error occurred'}`);
              setTimeout(() => router.push('/create-company'), 2000);
          }
        }
      } catch (error) {
        console.error('Error checking company:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        setTimeout(() => router.push('/create-company'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    checkCompany();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4 text-black">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg font-medium">{status}</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center space-x-2 text-black">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>{status}</p>
        </div>
      )}
    </div>
  );
};

export default Page;