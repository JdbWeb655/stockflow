import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash
    if(!hash) {
      window.location.href = '/'
      return
    }

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      .then(({error}) => {
        if(error){
          window.location.href = '/'
        } else {
          window.location.href = '/dashboard'
        }
      })
      .catch(() => {
        window.location.href = '/'
      })
    } else {
      window.location.href = '/'
    }
  }, [location])

  return <div>Procesando autenticación...</div>;
};