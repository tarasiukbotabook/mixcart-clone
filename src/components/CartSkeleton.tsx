export default function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items Skeleton */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 border-b border-gray-200 last:border-b-0 flex gap-4"
            >
              {/* Image Skeleton */}
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-shrink-0 animate-pulse" />

              {/* Content Skeleton */}
              <div className="flex-1">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4 mb-4 animate-pulse" />

                {/* Quantity Control Skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded ml-auto animate-pulse" />
                </div>
              </div>

              {/* Price Skeleton */}
              <div className="text-right">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2 mb-6 animate-pulse" />

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4 animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4 animate-pulse" />
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4 animate-pulse" />
            </div>
          </div>

          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded mb-3 animate-pulse" />
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
