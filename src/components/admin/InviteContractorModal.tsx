"use client";

import { useState } from "react";
import { UserPlus, Send, CheckCircle, AlertCircle } from "lucide-react";
import SmartInput from "../SmartInput";
import { mongoAuth } from "@/lib/auth/mongoAuth";

export default function InviteContractorModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInvite = async () => {
    if (!email.trim()) return;
    
    setSending(true);
    setResult(null);

    try {
      // For MongoDB auth, we need a user ID - using a default admin ID for demo
      // In production, this would come from the authenticated user
      const useMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
      
      if (useMockAuth) {
        // Use mock auth
        const invitation = await mockAuth.inviteContractor(email.trim(), companyName.trim());
        setResult({ 
          success: true, 
          message: `Invitation sent successfully! Access code: ${invitation.code}` 
        });
      } else {
        // Use MongoDB auth - send API request
        const response = await fetch('/api/admin/invitations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            companyName: companyName.trim(),
            createdBy: 'default_admin_id' // In production, get from authenticated user
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Send the actual email invitation
          await fetch('/api/send-invitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email.trim(),
              accessCode: result.data.accessCode,
              companyName: companyName.trim(),
              portalUrl: window.location.origin
            })
          });
          
          setResult({ 
            success: true, 
            message: `Invitation sent successfully! Access code: ${result.data.accessCode}` 
          });
        } else {
          throw new Error(result.error);
        }
      }
      
      // Clear form after successful invite
      setTimeout(() => {
        setEmail("");
        setCompanyName("");
        setResult(null);
        onClose();
      }, 3000);
      
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || "Failed to send invitation" 
      });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" style={{ color: "var(--tg-primary-600)" }} />
            Invite Contractor
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <SmartInput
            label="Company Name"
            value={companyName}
            onChange={setCompanyName}
            placeholder="ABC Construction LLC"
            help="Optional - used in the invitation email"
          />
          
          <SmartInput
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="contractor@company.com"
            required
          />

          {result && (
            <div className={`flex items-center p-4 rounded-lg ${
              result.success 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              )}
              <div className="text-sm">
                {result.message}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            
            <button
              onClick={handleInvite}
              disabled={!email.trim() || sending}
              className="flex-1 flex items-center justify-center px-4 py-3 text-white rounded-xl font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--tg-primary-600)" }}
            >
              {sending ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
