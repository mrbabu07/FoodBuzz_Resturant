import React from "react";

// Base Skeleton Component
export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
};

// Card Skeleton (for menu items, recipes)
export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 dark:border-gray-700">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48" />

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Price/Info */}
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// List Skeleton (for orders, users)
export const ListSkeleton = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton className="h-5 w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Dashboard Stats Skeleton
export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
};

// Text Skeleton
export const TextSkeleton = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
};

// Image Skeleton
export const ImageSkeleton = ({ className = "w-full h-64" }) => {
  return <Skeleton className={className} />;
};

// Button Skeleton
export const ButtonSkeleton = ({ className = "h-10 w-32" }) => {
  return <Skeleton className={`rounded-lg ${className}`} />;
};

// Grid Skeleton (for recipe/menu grids)
export const GridSkeleton = ({ items = 6, cols = 3 }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6`}
    >
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export default {
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  StatsSkeleton,
  TextSkeleton,
  ImageSkeleton,
  ButtonSkeleton,
  GridSkeleton,
};
