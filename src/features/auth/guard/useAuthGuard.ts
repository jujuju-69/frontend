import { useEffect, useState } from 'react';
import { getToken } from '../../../../storage/storage';

export function useAuthGuard() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setAuthenticated(!!t);
      setLoading(false);
    })();
  }, []);

  return { loading, authenticated };
}
