export default function JoinPageSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 animate-pulse">
      <div className="w-full max-w-sm">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl mb-6 mx-auto" />
        <div className="h-6 w-40 bg-gray-100 rounded mx-auto mb-2" />
        <div className="h-3 w-56 bg-gray-50 rounded mx-auto mb-8" />
        <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
        <div className="h-12 bg-gray-50 rounded-xl mb-3" />
        <div className="h-12 bg-gray-100 rounded-xl mb-6" />
        <div className="h-px bg-gray-100 mb-6" />
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="h-3 w-32 bg-gray-100 rounded mb-2" />
          <div className="h-2.5 w-48 bg-gray-50 rounded mb-4" />
          <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
          <div className="h-12 bg-white rounded-xl mb-3" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
