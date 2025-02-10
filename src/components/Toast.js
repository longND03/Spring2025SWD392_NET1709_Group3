const Toast = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`animate-fade-in fixed top-4 right-4 p-4 rounded-lg shadow-lg glass-effect
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
      <div className="flex items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast; 