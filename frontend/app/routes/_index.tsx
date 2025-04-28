import ContainerInfo from '../components/containerInfo';
import type { MetaFunction } from '@remix-run/node';
import Terminal from '../components/terminal';
import { useDocker } from '../hooks/useDocker';
import { useState } from 'react';

export const meta: MetaFunction = () => [
  { title: 'Arkhn Orchestrator' },
  { name: 'description', content: 'Arkhn Orchestrator' },
];

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

const ContainerList = ({
  containers,
  selectedContainer,
  onContainerClick,
  onDelete,
  onStop,
  onStart,
}: {
  containers: Container[];
  selectedContainer: string | null;
  onContainerClick: (id: string) => void;
  onDelete: (id: string) => void;
  onStop: (id: string) => void;
  onStart: (id: string) => void;
}) => (
  <div className="space-y-2">
    {containers.length > 0 ? (
      containers.map((container) => (
        <button
          key={container.id}
          onClick={() => onContainerClick(container.id)}
          onKeyPress={(e) =>
            e.key === 'Enter' && onContainerClick(container.id)
          }
          className={`w-full text-left text-black p-2 rounded hover:bg-gray-100 cursor-pointer ${
            selectedContainer === container.id ? 'bg-blue-50' : ''
          }`}
          tabIndex={0}
        >
          <div className="text-sm font-medium">{container.name}</div>
          <div className="text-xs text-gray-500">{container.status}</div>
          <div className="flex justify-between">
            <button
              onClick={() => onDelete(container.id)}
              className="text-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => onStop(container.id)}
              className="text-red-500"
            >
              Stop
            </button>
            <button
              onClick={() => onStart(container.id)}
              className="text-red-500"
            >
              Start
            </button>
          </div>
        </button>
      ))
    ) : (
      <div className="p-2 rounded hover:bg-gray-100 cursor-pointer text-gray-500">
        No containers deployed
      </div>
    )}
  </div>
);

const ImageSelector = ({
  images,
  selectedImage,
  onImageSelect,
}: {
  images: Image[];
  selectedImage: string;
  onImageSelect: (image: string) => void;
}) => (
  <select
    value={selectedImage}
    onChange={(e) => onImageSelect(e.target.value)}
    className="px-2 py-1 border rounded text-sm w-full"
  >
    <option value="">Select Image</option>
    {images.map((image) => (
      <option key={image.id} value={image.tags[0] || image.id}>
        {image.tags[0] || image.id}
      </option>
    ))}
  </select>
);

export default function Index() {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string>('');
  const {
    images,
    containers,
    createContainer,
    deleteContainer,
    stopContainer,
    startContainer,
  } = useDocker();

  const handleCreateContainer = async () => {
    if (!selectedImage) return;
    const container = await createContainer(selectedImage);
    if (container) {
      setSelectedContainer(container.id);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <div className="w-64 bg-white border-r border-gray-200 p-2 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-black">Orchestrator</h2>
        <ImageSelector
          images={images}
          selectedImage={selectedImage}
          onImageSelect={setSelectedImage}
        />
        <button
          onClick={handleCreateContainer}
          disabled={!selectedImage}
          className="text-white w-full bg-black rounded-md p-1"
        >
          Add container
        </button>
        <ContainerList
          containers={containers}
          selectedContainer={selectedContainer}
          onContainerClick={setSelectedContainer}
          onDelete={deleteContainer}
          onStop={stopContainer}
          onStart={startContainer}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ContainerInfo containerId={selectedContainer} />
        <Terminal containerId={selectedContainer} />
      </div>
    </div>
  );
}
