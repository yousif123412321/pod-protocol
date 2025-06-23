import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules for client-side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      buffer: require.resolve("buffer"),
    };
    
    // Add buffer polyfill
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack')).ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );
    
    return config;
  },
};

export default nextConfig;
