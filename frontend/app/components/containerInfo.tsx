import { useEffect, useState } from 'react';

interface ContainerInfoProps {
  containerId: string | null;
}

interface ContainerDetails {
  id: string;
  name: string;
  status: string;
  image: string;
}

export default function ContainerInfo({ containerId }: ContainerInfoProps) {
  const [containerDetails, setContainerDetails] =
    useState<ContainerDetails | null>(null);

  useEffect(() => {
    if (!containerId) {
      setContainerDetails(null);
      return;
    }

    const fetchContainerDetails = async () => {
      try {
        const response = await fetch(
          `http://0.0.0.0:8000/api/orchestrator/containers/${containerId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch container details');
        }
        const data = await response.json();
        setContainerDetails(data);
      } catch (error) {
        console.error('Error fetching container details:', error);
        setContainerDetails(null);
      }
    };

    fetchContainerDetails();
  }, [containerId]);

  return (
    <div className="bg-white text-black border-b border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-2">Container Information</h2>
      <div className="space-y-2">
        {containerDetails ? (
          <>
            <p>Container ID: {containerDetails.id}</p>
            <p>Name: {containerDetails.name}</p>
            <p>Status: {containerDetails.status}</p>
            <p>Image: {containerDetails.image}</p>
          </>
        ) : (
          <p>
            {containerId
              ? 'Loading container details...'
              : 'No container selected'}
          </p>
        )}
      </div>
    </div>
  );
}
