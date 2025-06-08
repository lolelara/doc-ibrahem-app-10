'use client';

import React from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';

interface LogoProps {
  width?: number;
  height?: number;
  onClick?: () => void;
}

export default function Logo({ width = 150, height = 150, onClick }: LogoProps) {
  return (
    <Box
      component="div"
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClick}
    >
      <Image
        src="/images/fitryne-logo.png"
        alt="Fitryne Logo"
        width={width}
        height={height}
        priority
        style={{
          objectFit: 'contain'
        }}
      />
    </Box>
  );
} 