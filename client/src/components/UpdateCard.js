export default function UpdateCard({ update }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{update.title}</h3>
        <div className="text-sm text-gray-500">
          {new Date(update.timestamp).toLocaleDateString()}
        </div>
      </div>
      <p className="mt-2 text-gray-600">{update.content}</p>
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="text-gray-500">
          Posted by: <span className="font-medium">{update.author?.name}</span>
          <span className="ml-2 text-gray-400">({update.authorRole})</span>
        </div>
        {update.targetClass && (
          <div className="text-gray-500">
            Class: {update.targetClass.name}
          </div>
        )}
      </div>
    </div>
  );
} 