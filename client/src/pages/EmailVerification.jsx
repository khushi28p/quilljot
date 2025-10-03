import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const { verifyEmail, error, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        await verifyEmail(token);
        setVerificationStatus("success");
        setTimeout(() => navigate("/login"), 3000);
      } catch(error) {
        setVerificationStatus("error");
        console.error(error);
      }
    };

    verifyEmailToken();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Email Verification
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4">
          {isLoading && (
            <div className="text-center p-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
              <CardDescription>Verifying your email...</CardDescription>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="text-center p-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You will be
                redirected to login...
              </CardDescription>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="text-center p-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">
                Verification Failed
              </CardTitle>
              <CardDescription className="text-red-600 mb-4">
                {error || "The verification link is invalid or has expired."}
              </CardDescription>
              <Button onClick={() => navigate("/login")}>
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
