'use client';

import { MessageCards } from '@/components/MessageCards';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Message } from '@/model/Message.model';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  // ✅ FIXED: Correct API field name (`isAcceptingMessage`)
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessage); // FIXED
    } catch (error) {
      toast('Failed to fetch message settings');
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  // ✅ Fetch messages
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/get-messages');
      console.log('API Response:', response.data);
      setMessages(response.data.messages || []);
      if (refresh) {
        toast('Showing latest messages');
      }
    } catch (error) {
      toast('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Ensuring the session exists before fetching data
  useEffect(() => {
    if (!session?.user) return;

    fetchMessages();
    fetchAcceptMessages();
  }, [session?.user, fetchAcceptMessages, fetchMessages]);

  // ✅ FIXED: Corrected state update
  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });

      setValue('acceptMessages', response.data.isAcceptingMessage); // FIXED
      toast(response.data.message);
    } catch (error) {
      toast('Failed to update message settings');
    } finally {
      setIsSwitchLoading(false);
    }
  };

  // ✅ Ensure session is available before rendering
  if (!session?.user) return <div></div>;

  const username = session.user.username;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast('Profile URL has been copied to clipboard');
  };

  return (
    <div className='my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl'>
      <h1 className='text-4xl font-bold mb-4'>User Dashboard</h1>

      <div className='mb-4'>
        <h2 className='text-lg font-semibold mb-2'>Copy Your Unique Link</h2>
        <div className='flex items-center'>
          <input
            type='text'
            value={profileUrl}
            disabled
            className='input input-bordered w-full p-2 mr-2'
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className='mb-4 flex items-center'>
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className='ml-2'>Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
      </div>

      <Separator />

      <Button
        className='mt-4'
        variant='outline'
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <RefreshCcw className='h-4 w-4' />
        )}
      </Button>

      <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message) => (
            <MessageCards
              key={message._id}
              message={message}
              onMessageDelete={(deletedMessageId) => {
                setMessages((prevMessages) =>
                  prevMessages.filter((msg) => msg._id !== deletedMessageId),
                );
              }}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
