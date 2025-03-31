'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signInSchema } from '@/schemas/signInSchema';
import { FcGoogle } from 'react-icons/fc'; // Google icon

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      toast.error(
        result.error === 'CredentialsSignin' ? 'Incorrect username or password' : result.error,
      );
    } else if (result?.url) {
      router.replace('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-800 p-6 '>
      <div className='w-full max-w-[30rem] p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-2xl font-extrabold tracking-tight lg:text-5xl mb-6'>
            Welcome Back to True Feedback
          </h1>
          <p className='mb-4'>Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              name='identifier'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='password'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type='password' {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type='submit'>
              Sign In
            </Button>
          </form>
        </Form>

        <div className='flex items-center my-4'>
          <hr className='flex-grow border-t border-gray-300' />
          <span className='px-3 text-gray-600'>or</span>
          <hr className='flex-grow border-t border-gray-300' />
        </div>

        {/* Google Sign-In Button */}
        <Button
          className='w-full flex items-center justify-center gap-2 border border-gray-300 text-black font-medium py-2'
          variant='outline'
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className='text-2xl' /> Sign in with Google
        </Button>

        <div className='text-center mt-4'>
          <p>
            Not a member yet?{' '}
            <Link href='/sign-up' className='text-blue-600 hover:text-blue-800'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
