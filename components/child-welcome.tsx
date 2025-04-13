"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Session } from "next-auth";

interface ChildWelcomeProps {
  session: Session;
}

export function ChildWelcome({ session }: ChildWelcomeProps) {
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Copy child ID to clipboard
  const copyChildId = () => {
    navigator.clipboard.writeText(session.user?.childId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Periodically check if the child account has been linked
  useEffect(() => {
    setCheckingStatus(true);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Reset to 10 when it reaches 0
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [checkingStatus]);

  return (
    <Card className="p-6 bg-white shadow-md rounded-xl max-w-md mx-auto text-center">
      <CardHeader>
        <CardTitle>Welcome, {session.user?.name}!</CardTitle>
        <CardDescription>
          This is your personal dashboard where you can see your assigned learning modules and track your progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-medium mb-2">Your Child ID</h3>
            <div className="bg-primary/10 rounded-md p-3 text-center">
              <p className="text-lg font-bold text-primary">{session.user?.childId || "ID not assigned"}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Give this ID to your parent to link your accounts.
            </p>
          </div>
        </div>
      </CardContent>

      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Image 
            src="/peppapig.png" 
            alt="Piggy" 
            width={50} 
            height={50}
            className="rounded-full"
          />
        </div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Welcome to PiggyWise!</h1>
        <p className="text-gray-600">Hi {session.user?.name || "there"}! You're almost ready to start learning.</p>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <h2 className="font-semibold text-blue-800 mb-2">Share this code with your parent</h2>
        <p className="text-sm text-gray-600 mb-3">
          Your parent will need this code to link your account and assign learning modules.
        </p>
        
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="bg-white px-4 py-3 rounded-lg font-mono text-lg font-bold text-blue-700">
            {session.user?.childId || "ID not assigned"}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyChildId}
            className="h-10 w-10"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        {copied && (
          <p className="text-green-600 text-sm">Copied to clipboard!</p>
        )}
      </div>
      
      {checkingStatus && (
        <div className="p-3 bg-green-50 rounded-lg mb-4 text-sm text-green-800 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Checking if your account has been linked... ({countdown})</span>
        </div>
      )}

      <div className="space-y-3 text-left">
        <h3 className="font-medium text-gray-800">What happens next?</h3>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Your parent links your account using this code</li>
          <li>They assign fun learning modules for you</li>
          <li>You can start learning and earning coins!</li>
        </ol>
      </div>
    </Card>
  );
} 