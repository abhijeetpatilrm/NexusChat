import { Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";

/**
 * EncryptionIndicator - Subtle security status indicator
 * Designed to enhance existing UI without disruption
 */
const EncryptionIndicator = ({ 
  isEncrypted = false, 
  securityLevel = 'enterprise',
  integrityVerified = true,
  decryptionError = false,
  showText = false,
  size = 'sm' // 'xs', 'sm', 'md'
}) => {
  // Don't render anything if not encrypted (maintains existing UI)
  if (!isEncrypted) return null;

  // Handle legacy messages (old messages before encryption)
  if (securityLevel === 'legacy') {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`}>
        <span className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-xs`}>📜</span>
        {showText && <span>Legacy Message</span>}
      </div>
    );
  }

  // Handle decryption errors
  if (decryptionError) {
    return (
      <div className={`flex items-center gap-1 text-red-500 ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`}>
        <AlertCircle className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        {showText && <span>Decryption Error</span>}
      </div>
    );
  }

  // Security level colors and icons
  const getSecurityConfig = (level) => {
    switch (level) {
      case 'military':
        return {
          icon: Shield,
          color: 'text-purple-500',
          bgColor: 'bg-purple-100',
          text: 'Military Grade'
        };
      case 'enterprise':
        return {
          icon: Lock,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          text: 'Enterprise'
        };
      default:
        return {
          icon: Lock,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          text: 'Standard'
        };
    }
  };

  const config = getSecurityConfig(securityLevel);
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center gap-1 ${config.color} ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`}>
      <div className="relative">
        <IconComponent className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        {integrityVerified && (
          <CheckCircle className={`absolute -top-1 -right-1 ${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-green-500`} />
        )}
      </div>
      {showText && (
        <span className="font-medium">
          {config.text} Encrypted
        </span>
      )}
    </div>
  );
};

export default EncryptionIndicator;
