import { useEffect, useState } from 'react';

import { showToast } from '../utils/toast';

interface Image {
  id: string;
  tags: string[];
  labels: Record<string, string>;
  created: string;
  size: number;
}

interface Container {
  id: string;
  name: string;
  status: string;
  image: string;
}

const API_BASE_URL = 'http://0.0.0.0:8000/api/orchestrator';

export const useDocker = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      showToast('Failed to fetch images');
    }
  };

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/containers`);
      if (!response.ok) throw new Error('Failed to fetch containers');
      const data = await response.json();
      setContainers(data);
    } catch (error) {
      console.error('Error fetching containers:', error);
      showToast('Failed to fetch containers');
    }
  };

  useEffect(() => {
    fetchImages();
    fetchContainers();
  }, []);

  const createContainer = async (image: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/containers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          image,
          name: `container-${Date.now()}`,
          command: '',
        }),
      });

      if (!response.ok) throw new Error('Failed to create container');
      const data = await response.json();
      await fetchContainers();
      return data;
    } catch (error) {
      console.error('Error creating container:', error);
      showToast('Failed to create container');
      return null;
    }
  };

  const deleteContainer = async (containerId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/containers/${containerId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to delete container');
      await fetchContainers();
    } catch (error) {
      console.error('Error deleting container:', error);
      showToast('Failed to delete container');
    }
  };

  const stopContainer = async (containerId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/containers/${containerId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'stopped' }),
        }
      );
      if (!response.ok) throw new Error('Failed to stop container');
      await fetchContainers();
    } catch (error) {
      console.error('Error stopping container:', error);
      showToast('Failed to stop container');
    }
  };

  const startContainer = async (containerId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/containers/${containerId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'running' }),
        }
      );
      if (!response.ok) throw new Error('Failed to start container');
      await fetchContainers();
    } catch (error) {
      console.error('Error starting container:', error);
      showToast('Failed to start container');
    }
  };

  return {
    images,
    containers,
    createContainer,
    deleteContainer,
    stopContainer,
    startContainer,
  };
};
