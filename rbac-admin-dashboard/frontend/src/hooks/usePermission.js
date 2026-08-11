import { useAuth } from '../context/AuthContext';
export function usePermission(permKey) {
  const { hasPermission } = useAuth();
  return { allowed: hasPermission(permKey) };
}
