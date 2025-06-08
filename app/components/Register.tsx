'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, RadioGroup, FormControlLabel, Radio, Box, Typography, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import Logo from './Logo';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    userType: 'trainee', // Default value
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          userType: formData.userType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'حدث خطأ أثناء التسجيل');
      }

      // Registration successful
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <CacheProvider value={cacheRtl}>
      <Container component="main" maxWidth="xs" dir="rtl">
        <Box sx={{ 
          mt: 4, 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Logo width={200} height={100} />
        </Box>
        <StyledPaper elevation={6}>
          <Typography component="h1" variant="h5" gutterBottom>
            إنشاء حساب جديد
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="الاسم الكامل"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="رقم الهاتف"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="كلمة المرور"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <RadioGroup
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              sx={{ mt: 2, mb: 2 }}
            >
              <FormControlLabel 
                value="trainee" 
                control={<Radio />} 
                label="متدرب"
              />
              <FormControlLabel 
                value="trainer" 
                control={<Radio />} 
                label="مدرب"
              />
            </RadioGroup>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              تسجيل
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </CacheProvider>
  );
} 