"use client";

import { Dumbbell } from 'lucide-react';
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Dumbbell className="h-8 w-8 text-primary" />
      <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Spor<span className="text-primary">Flow</span>
      </span>
    </div>
  );
};

export default Logo;