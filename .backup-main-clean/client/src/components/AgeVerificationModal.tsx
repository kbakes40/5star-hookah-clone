// Age Verification Modal - Neo-Brutalism meets Luxury Retail
// Must appear immediately on site visit, blocks access if declined

import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export default function AgeVerificationModal() {
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already verified age in this session
    const verified = sessionStorage.getItem("ageVerified");
    if (verified === "true") {
      setIsVerified(true);
    } else {
      // Show modal immediately on first visit
      setShowModal(true);
    }
  }, []);

  const handleYes = () => {
    sessionStorage.setItem("ageVerified", "true");
    setIsVerified(true);
    setShowModal(false);
  };

  const handleExit = () => {
    // Redirect to a blank page or external site
    window.location.href = "about:blank";
  };

  if (isVerified || !showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4">
        <div className="bg-background brutalist-border p-8">
          <h2 className="font-display font-black text-2xl mb-6 text-center">
            Age Verification & Cookie Warning
          </h2>
          
          <div className="space-y-4 mb-8 text-sm leading-relaxed">
            <p>
              To access this website, you must be of legal age according to the laws of your jurisdiction. 
              By proceeding, you confirm that you are legally permitted to purchase and use tobacco products.
            </p>
            <p>
              Age verification may be conducted by a third-party service at checkout. We also use cookies and 
              similar technologies to ensure essential site functionality and to improve your browsing experience.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleYes}
              className="w-full brutalist-border bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6"
            >
              YES
            </Button>
            
            <Button
              onClick={handleExit}
              variant="outline"
              className="w-full brutalist-border bg-background hover:bg-secondary font-bold text-lg py-6"
            >
              Exit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
