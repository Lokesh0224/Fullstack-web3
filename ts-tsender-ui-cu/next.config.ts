import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* all the below config is for our Static TSender site */
  output:"export", 
  distDir: "out", 
  images:{
    unoptimized: true
  }, 
  basePath: '', 
  assetPrefix: "./", 
  trailingStash: true
};

export default nextConfig;
