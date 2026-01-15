import { useState } from "react";
import { signIn, signUp, autoSignIn } from "aws-amplify/auth";

interface UseAuthFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
}

const initialFormData: FormData = {
  username: "",
  email: "",
  password: "",
};

export const useAuthForm = ({ onSuccess, onClose }: UseAuthFormProps) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setFormData(initialFormData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignIn) {
        await signIn({
          username: formData.email,
          password: formData.password,
        });
      } else {
        if (!formData.username || !formData.email) {
          setError("Username and email are required");
          setLoading(false);
          return;
        }

        await signUp({
          username: formData.email,
          password: formData.password,
          options: {
            userAttributes: {
              email: formData.email,
              "custom:username": formData.username,
            },
            autoSignIn: {
              enabled: true,
            },
          },
        });

        await autoSignIn();
      }

      onSuccess();
      onClose();
      clearForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isSignIn ? "sign in" : "sign up"}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToSignUp = () => {
    setIsSignIn(false);
    clearForm();
  };

  const switchToSignIn = () => {
    setIsSignIn(true);
    clearForm();
  };

  return {
    isSignIn,
    formData,
    error,
    loading,
    setFormData: updateField,
    handleSubmit,
    switchToSignUp,
    switchToSignIn,
  };
};
