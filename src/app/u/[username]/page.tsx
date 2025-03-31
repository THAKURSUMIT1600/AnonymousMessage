'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as z from 'zod';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      await axios.post('/api/send-message', {
        ...data,
        username,
      });

      toast('Message sent successfully!');
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast(axiosError.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      const response = await axios.post('/api/suggest-messages');
      setSuggestedMessages(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className='container mx-auto my-8 p-6 bg-white rounded max-w-4xl'>
      <h1 className='text-4xl font-bold mb-6 text-center'>Public Profile Link</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Write your anonymous message here'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-center'>
            {isLoading ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Please wait
              </Button>
            ) : (
              <Button type='submit' disabled={!messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className='space-y-4 my-8'>
        <div className='space-y-2'>
          <Button onClick={fetchSuggestedMessages} className='my-4'>
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardContent className='flex flex-col space-y-4'>
            {suggestedMessages.length > 0 ? (
              suggestedMessages.map((message, index) => (
                <Button
                  key={index}
                  variant='outline'
                  className='mb-2'
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            ) : (
              <p className='text-gray-500 text-center'>No suggested messages yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className='my-6' />
      <div className='text-center'>
        <div className='mb-4'>Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
