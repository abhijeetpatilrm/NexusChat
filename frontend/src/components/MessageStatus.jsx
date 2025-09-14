import { Check, CheckCheck } from "lucide-react";

const MessageStatus = ({ status, readAt, isOwnMessage }) => {
  if (!isOwnMessage) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return readAt ? `Read at ${new Date(readAt).toLocaleTimeString()}` : 'Read';
      default:
        return 'Sent';
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex items-center">
        {getStatusIcon()}
      </div>
      {status === 'read' && (
        <span className="text-xs text-blue-500 font-medium">
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default MessageStatus;
