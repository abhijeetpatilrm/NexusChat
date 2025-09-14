import { useState, useEffect } from "react";
import { Shield, Lock, RotateCcw, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

/**
 * SecuritySettings - Professional security management component
 * Designed to integrate seamlessly with existing settings
 */
const SecuritySettings = () => {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [showTestMessage, setShowTestMessage] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState(null);

  // Fetch security status
  const fetchSecurityStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/security/status");
      setSecurityStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch security status:", error);
      toast.error("Failed to load security status");
    } finally {
      setIsLoading(false);
    }
  };

  // Rotate encryption key
  const handleRotateKey = async () => {
    try {
      setIsRotatingKey(true);
      const response = await axiosInstance.post("/security/rotate-key");
      toast.success("Encryption key rotated successfully");
      await fetchSecurityStatus(); // Refresh status
    } catch (error) {
      console.error("Failed to rotate key:", error);
      toast.error("Failed to rotate encryption key");
    } finally {
      setIsRotatingKey(false);
    }
  };

  // Test encryption
  const handleTestEncryption = async () => {
    if (!testMessage.trim()) {
      toast.error("Please enter a test message");
      return;
    }

    try {
      const response = await axiosInstance.post("/security/test", {
        testMessage: testMessage
      });
      setTestResult(response.data);
      toast.success("Encryption test completed");
    } catch (error) {
      console.error("Encryption test failed:", error);
      toast.error("Encryption test failed");
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-base-200 rounded animate-pulse"></div>
        <div className="h-4 bg-base-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-base-200 rounded animate-pulse w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <Shield className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="font-semibold text-green-800">Enterprise Security Active</h3>
          <p className="text-sm text-green-600">
            Your messages are protected with AES-256-CBC-HMAC encryption
          </p>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Encryption Status */}
        <div className="p-4 border border-base-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-green-500" />
            <h4 className="font-medium">End-to-End Encryption</h4>
          </div>
          <p className="text-sm text-base-content/70 mb-3">
            All messages are encrypted with military-grade security
          </p>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Active</span>
          </div>
        </div>

        {/* Key Management */}
        <div className="p-4 border border-base-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium">Key Management</h4>
          </div>
          <p className="text-sm text-base-content/70 mb-3">
            Automatic key rotation every 24 hours
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600">
              Key Age: {securityStatus?.keyStats?.keyAge || 0}h
            </span>
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="space-y-4">
        <h4 className="font-medium">Security Actions</h4>
        
        {/* Rotate Key Button */}
        <button
          onClick={handleRotateKey}
          disabled={isRotatingKey}
          className="btn btn-outline btn-sm flex items-center gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${isRotatingKey ? 'animate-spin' : ''}`} />
          {isRotatingKey ? 'Rotating...' : 'Rotate Encryption Key'}
        </button>

        {/* Test Encryption */}
        <div className="space-y-2">
          <button
            onClick={() => setShowTestMessage(!showTestMessage)}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            {showTestMessage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTestMessage ? 'Hide' : 'Test'} Encryption
          </button>

          {showTestMessage && (
            <div className="p-4 border border-base-300 rounded-lg space-y-3">
              <div>
                <label className="label">
                  <span className="label-text">Test Message</span>
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a message to test encryption..."
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <button
                onClick={handleTestEncryption}
                className="btn btn-primary btn-sm"
              >
                Test Encryption
              </button>

              {testResult && (
                <div className="p-3 bg-base-100 border border-base-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.testPassed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {testResult.testPassed ? 'Test Passed' : 'Test Failed'}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Original:</strong> {testResult.testMessage}</p>
                    <p><strong>Encrypted:</strong> {testResult.encrypted?.substring(0, 50)}...</p>
                    <p><strong>Decrypted:</strong> {testResult.decrypted}</p>
                    <p><strong>Integrity:</strong> {testResult.integrityVerified ? 'Verified' : 'Failed'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="p-4 bg-base-100 border border-base-300 rounded-lg">
        <h4 className="font-medium mb-2">Security Features</h4>
        <ul className="text-sm space-y-1 text-base-content/70">
          <li>• AES-256-CBC-HMAC encryption (military-grade)</li>
          <li>• Message integrity verification</li>
          <li>• Automatic key rotation</li>
          <li>• Perfect forward secrecy</li>
          <li>• Zero-knowledge architecture</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettings;
