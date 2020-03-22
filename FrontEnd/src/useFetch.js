import { useEffect, useState } from "react";
export const useFetch = (initialUrl, initialData, requestType) => {
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fetchedData, setFetchedData] = useState(initialData);
  const [requestParam, setRequestParam] = useState(requestType);

  useEffect(() => {
    let unmounted = false;

    const handleFetchResponse = response => {
      if (unmounted) return initialData;

      setHasError(!response.ok);
      setIsLoading(false);
      return response.ok && response.json ? response.json() : initialData;
    };

    const fetchData = () => {
      setIsLoading(true);
      return fetch(url, requestParam==undefined? { credentials: 'include' }: requestParam )
        .then(handleFetchResponse)
        .catch(handleFetchResponse);
    };

    if (initialUrl && !unmounted)
      fetchData().then(data => !unmounted && setFetchedData(data));
    return () => {
      unmounted = true;
    };
  }, [url, requestParam]);

  return { isLoading, hasError, setUrl, setRequestParam, data: fetchedData };
};