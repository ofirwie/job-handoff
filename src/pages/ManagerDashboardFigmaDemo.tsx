import React from 'react';
import ManagerDashboardFigmaExact from '@/components/ManagerDashboardFigmaExact';
import '@/styles/figma-manager-dashboard-exact.css';

/**
 * Manager Dashboard Demo - Exact Figma Implementation
 * 
 * This page demonstrates the pixel-perfect implementation of the Manager Dashboard
 * based on the actual Figma design specifications extracted from:
 * 
 * File ID: kLjdmXN2Mf1AxU55cdPqQz
 * Frame: "3. Manager Dashboard" (ID: 3330:195)
 * Path: Document > Handoff > 3. Manager Dashboard
 * 
 * Design Specifications:
 * - Frame Size: 1440x900px
 * - Main Background: #fafbfc
 * - Sidebar: #42526e with #2d7ef8 active states
 * - Typography: Inter font with exact weights and sizes
 * - Colors: Extracted from actual Figma color palette
 * - Spacing: Based on Figma layout constraints
 */

export default function ManagerDashboardFigmaDemo() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="shadow-2xl rounded-lg overflow-hidden">
        <ManagerDashboardFigmaExact />
      </div>
    </div>
  );
}