import { useState } from 'react';

export type LoginActiveButton = 'login' | 'signup';

export function useLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [activeButton, setActiveButton] = useState<LoginActiveButton>('login');

  const handlePasswordVisibilityToggle = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return {
    activeButton,
    handlePasswordVisibilityToggle,
    isPasswordVisible,
    password,
    setActiveButton,
    setPassword,
    setUsername,
    username,
  };
}
